/**
 * Admin — Sistema de Reportes
 * Cola de reportes pendientes, acciones: eliminar oferta / bloquear usuario / ignorar
 *
 * @module admin/reportes
 */

import {
    collection, query, where, getDocs, getDoc,
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

        if (btnVer)     await verContenido(btnVer.dataset.tipo, btnVer.dataset.objetoId);
        if (btnAccion)  await ejecutarAccionPrincipal(btnAccion);
        if (btnIgnorar) await ignorarReporte(btnIgnorar.dataset.reporteId);
    });
}

async function verContenido(tipo, objetoId) {
    window.adminModal.abrirModal(`<p class="admin-card-sub">Cargando...</p>`);
    try {
        if (tipo === 'oferta') {
            await _verOferta(objetoId);
        } else {
            await _verUsuario(objetoId);
        }
    } catch (err) {
        console.error('Error cargando contenido:', err);
        window.adminModal.abrirModal(`
            <p class="admin-modal-title">Error</p>
            <p class="admin-card-sub">No se pudo cargar el contenido.</p>
            <div class="admin-modal-actions">
                <button class="btn btn-outline" onclick="adminModal.cerrarModal()">Cerrar</button>
            </div>`);
    }
}

async function _verOferta(ofertaId) {
    const [appsSnap, ofertaSnap] = await Promise.all([
        getDocs(query(collection(_db, 'aplicaciones'), where('ofertaId', '==', ofertaId))),
        getDoc(doc(_db, 'ofertas', ofertaId))
    ]);

    if (!ofertaSnap.exists()) {
        window.adminModal.abrirModal(`
            <p class="admin-modal-title">Oferta no encontrada</p>
            <p class="admin-card-sub">Esta oferta ya no existe (puede haber sido eliminada).</p>
            <div class="admin-modal-actions">
                <button class="btn btn-outline" onclick="adminModal.cerrarModal()">Cerrar</button>
            </div>`);
        return;
    }

    const o    = ofertaSnap.data();
    const apps = appsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Fotos
    const fotos = (o.imagenesURLs || []).filter(Boolean);
    const fotosHtml = fotos.length > 0 ? `
        <div style="display:flex;gap:0.5rem;overflow-x:auto;margin-bottom:0.75rem;padding-bottom:0.25rem">
            ${fotos.map(url => `<img src="${escapeHtml(url)}" alt=""
                style="height:100px;min-width:100px;object-fit:cover;border-radius:8px;flex-shrink:0"
                loading="lazy">`).join('')}
        </div>` : '';

    // Chips de requisitos
    const chips = [
        o.categoria,
        o.duracion    && o.duracion    !== 'No especificada' ? o.duracion    : null,
        o.horario     && o.horario     !== 'No especificado'  ? o.horario     : null,
        o.experiencia && o.experiencia !== 'No especificada' ? o.experiencia : null,
        o.vacantes > 1 ? `${o.vacantes} vacantes` : null,
        o.requiereHerramientas ? '🔧 Herramientas' : null,
        o.requiereTransporte   ? '🚗 Transporte'   : null,
        o.requiereEquipos      ? '🦺 Equipos'      : null,
    ].filter(Boolean);

    const chipsHtml = chips.length > 0 ? `
        <div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-bottom:0.75rem">
            ${chips.map(c => `<span style="background:var(--gray-100);border-radius:20px;
                padding:0.2rem 0.6rem;font-size:var(--text-xs);color:var(--gray-700)">
                ${escapeHtml(String(c))}</span>`).join('')}
        </div>` : '';

    // Postulantes
    const estadoBadge = { pendiente: '🟡', aceptado: '🟢', rechazado: '🔴', completado: '✅' };
    const filas = apps.length === 0
        ? `<p class="admin-empty-text">Sin postulantes aún</p>`
        : apps.map(a => `
            <div style="display:flex;justify-content:space-between;align-items:center;
                        padding:0.5rem 0;border-bottom:1px solid var(--gray-100)">
                <div>
                    <p style="font-size:var(--text-sm);font-weight:500">
                        ${escapeHtml(a.aplicanteNombre || a.aplicanteEmail || '—')}
                    </p>
                    <p style="font-size:var(--text-xs);color:var(--gray-500)">
                        ${escapeHtml(a.aplicanteEmail || '')}
                    </p>
                </div>
                <span style="font-size:var(--text-xs)">
                    ${estadoBadge[a.estado] || '⚪'} ${escapeHtml(a.estado || '—')}
                </span>
            </div>`).join('');

    const empleador   = escapeHtml(o.empleadorNombre || o.empleadorEmail || '—');
    const distrito    = escapeHtml(o.ubicacion?.distrito || o.distrito || '');
    const referencia  = escapeHtml(o.ubicacion?.referencia || o.ubicacion?.direccion || '');
    const salario     = o.salario ? `S/. ${escapeHtml(String(o.salario))}` : '—';
    const fechaPublic = o.fechaCreacion   ? formatearFecha(o.fechaCreacion,   'corto') : '—';
    const fechaExp    = o.fechaExpiracion ? formatearFecha(o.fechaExpiracion, 'corto') : null;

    const html = `
        ${fotosHtml}
        <p class="admin-modal-title">${escapeHtml(o.titulo || '(sin título)')}</p>
        <p class="admin-card-sub" style="margin-bottom:0.5rem">
            👤 ${empleador}
            ${distrito   ? ` · 📍 ${distrito}`   : ''}
            ${referencia ? ` · ${referencia}`     : ''}
            · 💰 ${salario}
        </p>
        <p class="admin-card-sub" style="margin-bottom:0.75rem">
            Publicado: ${fechaPublic}
            ${fechaExp ? ` · Expira: ${fechaExp}` : ''}
            · ${apps.length} postulante${apps.length !== 1 ? 's' : ''}
        </p>
        ${chipsHtml}
        ${o.descripcion ? `
            <p style="font-size:var(--text-sm);color:var(--gray-700);margin-bottom:0.75rem;
                       white-space:pre-line;background:var(--gray-50);border-radius:8px;padding:0.75rem">
                ${escapeHtml(o.descripcion)}
            </p>` : ''}
        ${o.habilidades && o.habilidades !== 'No especificadas' ? `
            <p class="admin-card-sub" style="margin-bottom:0.25rem">
                <strong>Habilidades:</strong> ${escapeHtml(o.habilidades)}
            </p>` : ''}
        ${o.requisitosAdicionales && o.requisitosAdicionales !== 'Ninguno' ? `
            <p class="admin-card-sub" style="margin-bottom:0.75rem">
                <strong>Requisitos:</strong> ${escapeHtml(o.requisitosAdicionales)}
            </p>` : ''}
        <p style="font-size:var(--text-xs);font-weight:600;color:var(--gray-500);
                  text-transform:uppercase;letter-spacing:.05em;margin-bottom:0.5rem;
                  border-top:1px solid var(--gray-100);padding-top:0.75rem">
            Postulantes (${apps.length})
        </p>
        <div>${filas}</div>
        <div class="admin-modal-actions" style="margin-top:1rem">
            <button class="btn btn-outline" onclick="adminModal.cerrarModal()">Cerrar</button>
        </div>`;
    window.adminModal.abrirModal(html);
}

async function _verUsuario(uid) {
    const snap = await getDoc(doc(_db, 'usuarios', uid));

    if (!snap.exists()) {
        window.adminModal.abrirModal(`
            <p class="admin-modal-title">Usuario no encontrado</p>
            <p class="admin-card-sub">Este usuario ya no existe.</p>
            <div class="admin-modal-actions">
                <button class="btn btn-outline" onclick="adminModal.cerrarModal()">Cerrar</button>
            </div>`);
        return;
    }

    const u = snap.data();
    const nombre = u.nombre || '(sin nombre)';
    const ubicacion = typeof u.ubicacion === 'object'
        ? (u.ubicacion?.texto_completo || u.ubicacion?.distrito || '')
        : (u.ubicacion || '');

    const html = `
        <p class="admin-modal-title">${escapeHtml(nombre)}</p>
        <p class="admin-card-sub" style="margin-bottom:0.25rem">
            📧 ${escapeHtml(u.email || '—')}
            ${ubicacion ? ` · 📍 ${escapeHtml(ubicacion)}` : ''}
        </p>
        <p class="admin-card-sub" style="margin-bottom:0.75rem">
            Tipo: ${escapeHtml(u.tipo || '—')}
            ${u.bloqueado ? ' · <strong style="color:var(--danger)">BLOQUEADO</strong>' : ''}
        </p>
        ${u.bio ? `<p style="font-size:var(--text-sm);color:var(--gray-700);
            background:var(--gray-50);border-radius:8px;padding:0.75rem;margin-bottom:0.75rem">
            ${escapeHtml(u.bio)}</p>` : ''}
        <div class="admin-modal-actions" style="margin-top:1rem">
            <button class="btn btn-outline" onclick="adminModal.cerrarModal()">Cerrar</button>
        </div>`;
    window.adminModal.abrirModal(html);
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
