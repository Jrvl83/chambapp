/**
 * Admin — Sistema de Reportes
 * Cola de reportes pendientes, acciones: eliminar oferta / bloquear usuario / ignorar
 *
 * @module admin/reportes
 */

import {
    collection, query, where, getDocs,
    doc, updateDoc, deleteDoc, addDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { escapeHtml } from '../utils/dom-helpers.js';
import { formatearFecha } from '../utils/formatting.js';

let _db, _auth, _onPendientesActualizados;

// ─── Init ────────────────────────────────────────────────────────────────────

export async function initReportes(db, auth, { onPendientesActualizados } = {}) {
    _db   = db;
    _auth = auth;
    _onPendientesActualizados = onPendientesActualizados;
    await cargarReportes();
}

// ─── Carga ────────────────────────────────────────────────────────────────────

async function cargarReportes() {
    const contenedor = document.getElementById('reportes-container');

    try {
        const [snapPendientes, snapRevisados] = await Promise.all([
            getDocs(query(collection(_db, 'reportes'), where('estado', '==', 'pendiente'))),
            getDocs(query(collection(_db, 'reportes'), where('estado', '==', 'revisado'))),
        ]);

        const pendientes = snapPendientes.docs.map(d => ({ id: d.id, ...d.data() }));
        const revisados  = snapRevisados.docs.map(d => ({ id: d.id, ...d.data() }));

        if (_onPendientesActualizados) _onPendientesActualizados(pendientes.length);

        contenedor.innerHTML = renderReportes(pendientes, revisados);
        initColapsable();
        registrarAcciones();

    } catch (err) {
        console.error('Error cargando reportes:', err);
        contenedor.innerHTML = `
            <div class="admin-section">
                <p class="admin-empty-text">Error al cargar reportes.</p>
            </div>`;
    }
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderReportes(pendientes, revisados) {
    return `
        <div class="admin-section">
            <h2 class="admin-section-title">⏳ Pendientes (${pendientes.length})</h2>
            ${pendientes.length === 0
                ? `<div class="admin-empty">
                       <div class="admin-empty-icon">✅</div>
                       <p class="admin-empty-text">No hay reportes pendientes</p>
                   </div>`
                : `<div class="admin-list">${pendientes.map(cardReporte).join('')}</div>`
            }
        </div>

        <div class="admin-section" style="padding-top:0">
            <div class="admin-collapse-header" id="collapse-revisados">
                <h2 class="admin-section-title" style="margin:0">
                    ✅ Revisados (${revisados.length})
                </h2>
                <span class="admin-collapse-arrow">▼</span>
            </div>
            <div class="admin-collapse-body" id="body-revisados">
                ${revisados.length === 0
                    ? `<p class="admin-empty-text" style="padding:1rem 0">Sin reportes revisados aún</p>`
                    : `<div class="admin-list">${revisados.map(cardReporteRevisado).join('')}</div>`
                }
            </div>
        </div>
    `;
}

function cardReporte(r) {
    const esBadge = badgeMotivo(r.motivo);
    return `
        <div class="admin-card admin-card--pendiente" data-reporte-id="${escapeHtml(r.id)}">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
                <span style="color:var(--danger)">🚩</span>
                <span class="admin-badge admin-badge--${r.tipo === 'oferta' ? 'oferta' : 'usuario'}">
                    ${r.tipo === 'oferta' ? 'OFERTA' : 'USUARIO'}
                </span>
                <span style="margin-left:auto;font-size:var(--text-xs);color:var(--gray-400)">
                    ${formatearFecha(r.timestamp, 'relativo')}
                </span>
            </div>
            <div class="admin-card-nombre">${escapeHtml(r.objetoTitulo || '—')}</div>
            <p class="admin-reporte-meta">Reportado por: ${escapeHtml(r.reportadoPor || '—')}</p>
            <span class="admin-badge ${esBadge.clase}">${esBadge.texto}</span>
            ${r.descripcion
                ? `<p class="admin-reporte-cita">"${escapeHtml(r.descripcion)}"</p>`
                : ''}
            <div class="admin-acciones">
                <button class="btn-admin btn-admin--ghost btn-ver"
                        data-tipo="${r.tipo}" data-objeto-id="${escapeHtml(r.objetoId)}">
                    ${r.tipo === 'oferta' ? 'Ver oferta' : 'Ver perfil'}
                </button>
                <button class="btn-admin btn-admin--danger btn-accion-principal"
                        data-tipo="${r.tipo}" data-objeto-id="${escapeHtml(r.objetoId)}"
                        data-reporte-id="${escapeHtml(r.id)}">
                    ${r.tipo === 'oferta' ? 'Eliminar oferta' : 'Bloquear usuario'}
                </button>
                <button class="btn-admin btn-admin--ghost btn-ignorar"
                        data-reporte-id="${escapeHtml(r.id)}">
                    Ignorar
                </button>
            </div>
        </div>
    `;
}

function cardReporteRevisado(r) {
    return `
        <div class="admin-card" style="opacity:0.7">
            <div style="display:flex;align-items:center;gap:0.5rem">
                <span class="admin-badge admin-badge--${r.tipo === 'oferta' ? 'oferta' : 'usuario'}">
                    ${r.tipo === 'oferta' ? 'OFERTA' : 'USUARIO'}
                </span>
                <span style="font-size:var(--text-sm);font-weight:500">${escapeHtml(r.objetoTitulo || '—')}</span>
            </div>
            <p class="admin-reporte-meta" style="margin-top:0.35rem">
                ${escapeHtml(r.accionAdmin || 'Sin acción')} ·
                ${formatearFecha(r.timestamp, 'corto')}
            </p>
        </div>
    `;
}

function badgeMotivo(motivo) {
    const mapa = {
        fraude:       { clase: 'admin-badge--fraude',      texto: 'Posible fraude' },
        spam:         { clase: 'admin-badge--spam',        texto: 'Spam' },
        inapropiado:  { clase: 'admin-badge--inapropiado', texto: 'Contenido inapropiado' },
        otro:         { clase: 'admin-badge--otro',        texto: 'Otro' },
    };
    return mapa[motivo] || mapa.otro;
}

// ─── Acciones ────────────────────────────────────────────────────────────────

function registrarAcciones() {
    const contenedor = document.getElementById('reportes-container');

    contenedor.addEventListener('click', async (e) => {
        const btnVer     = e.target.closest('.btn-ver');
        const btnAccion  = e.target.closest('.btn-accion-principal');
        const btnIgnorar = e.target.closest('.btn-ignorar');

        if (btnVer)     verContenido(btnVer.dataset.tipo, btnVer.dataset.objetoId);
        if (btnAccion)  await ejecutarAccionPrincipal(btnAccion);
        if (btnIgnorar) await ignorarReporte(btnIgnorar.dataset.reporteId);
    });
}

function verContenido(tipo, objetoId) {
    if (tipo === 'oferta') {
        window.open(`mis-aplicaciones.html?ofertaId=${objetoId}`, '_blank');
    } else {
        window.open(`perfil-publico.html?id=${objetoId}`, '_blank');
    }
}

async function ejecutarAccionPrincipal(btn) {
    const { tipo, objetoId, reporteId } = btn.dataset;
    btn.disabled = true;

    try {
        if (tipo === 'oferta') {
            await eliminarOfertaDesdeReporte(objetoId, reporteId);
        } else {
            await bloquearUsuarioDesdeReporte(objetoId, reporteId);
        }
        await cargarReportes();
        showToast(tipo === 'oferta' ? 'Oferta eliminada' : 'Usuario bloqueado', 'success');
    } catch (err) {
        console.error('Error ejecutando acción:', err);
        showToast('Error al ejecutar acción', 'error');
        btn.disabled = false;
    }
}

async function eliminarOfertaDesdeReporte(ofertaId, reporteId) {
    await deleteDoc(doc(_db, 'ofertas', ofertaId));
    await registrarAuditoria('eliminar_oferta_reporte', { ofertaId, reporteId });
    await marcarReporteRevisado(reporteId, 'Oferta eliminada');
}

async function bloquearUsuarioDesdeReporte(uid, reporteId) {
    await updateDoc(doc(_db, 'usuarios', uid), { bloqueado: true });
    await registrarAuditoria('bloquear_usuario_reporte', { uid, reporteId });
    await marcarReporteRevisado(reporteId, 'Usuario bloqueado');
}

async function ignorarReporte(reporteId) {
    await marcarReporteRevisado(reporteId, 'Ignorado — sin acción');
    await cargarReportes();
    showToast('Reporte ignorado', 'info');
}

async function marcarReporteRevisado(reporteId, accionAdmin) {
    await updateDoc(doc(_db, 'reportes', reporteId), {
        estado: 'revisado',
        accionAdmin,
        revisadoEn: serverTimestamp(),
    });
}

async function registrarAuditoria(accion, datos) {
    await addDoc(collection(_db, 'auditoria'), {
        accion,
        ...datos,
        adminUid: _auth.currentUser?.uid,
        timestamp: serverTimestamp(),
    });
}

// ─── Colapsable revisados ────────────────────────────────────────────────────

function initColapsable() {
    const header = document.getElementById('collapse-revisados');
    const body   = document.getElementById('body-revisados');
    if (!header || !body) return;

    header.addEventListener('click', () => {
        const abierto = body.classList.toggle('open');
        header.classList.toggle('open', abierto);
    });
}
