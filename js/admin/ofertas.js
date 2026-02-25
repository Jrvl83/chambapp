/**
 * Admin — Gestión de Ofertas
 * Lista todas las ofertas (sin filtro de empleador), eliminar con auditoría
 *
 * @module admin/ofertas
 */

import {
    collection, query, where, getDocs,
    doc, deleteDoc, addDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { escapeHtml } from '../utils/dom-helpers.js';
import { formatearFecha } from '../utils/formatting.js';

let _db, _auth;
let _todasOfertas = [];

// ─── Init ────────────────────────────────────────────────────────────────────

export async function initOfertas(db, auth) {
    _db   = db;
    _auth = auth;

    document.addEventListener('click', async (e) => {
        const btnVer      = e.target.closest('[data-ver-oferta]');
        const btnEliminar = e.target.closest('[data-eliminar-oferta]');
        if (btnVer) {
            const id = btnVer.dataset.verOferta;
            const oferta = _todasOfertas.find(o => o.id === id);
            await mostrarPostulantes(id, oferta?.titulo || 'Oferta');
        }
        if (btnEliminar) {
            await confirmarEliminarOferta(
                btnEliminar.dataset.eliminarOferta,
                btnEliminar.dataset.titulo
            );
        }
    });

    await cargarOfertas();
}

// ─── Carga ────────────────────────────────────────────────────────────────────

async function cargarOfertas() {
    const contenedor = document.getElementById('ofertas-container');

    try {
        const snap = await getDocs(collection(_db, 'ofertas'));

        _todasOfertas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderOfertas(_todasOfertas);

    } catch (err) {
        console.error('Error cargando ofertas:', err);
        contenedor.innerHTML = `
            <div class="admin-section">
                <p class="admin-empty-text">Error al cargar ofertas.</p>
            </div>`;
    }
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderOfertas(ofertas) {
    const contenedor = document.getElementById('ofertas-container');

    contenedor.innerHTML = `
        <div class="admin-section">
            <div style="display:flex;gap:0.5rem;margin-bottom:1rem">
                <select class="admin-select" id="filtro-estado-oferta" style="flex:1">
                    <option value="">Todos los estados</option>
                    <option value="activa">Activas</option>
                    <option value="en_curso">En curso</option>
                    <option value="completada">Completadas</option>
                    <option value="caducada">Caducadas</option>
                </select>
            </div>
            <p style="font-size:var(--text-xs);color:var(--gray-500);margin-bottom:0.75rem">
                ${ofertas.length} ofertas en total
            </p>
            <div class="admin-list" id="ofertas-list">
                ${ofertas.length === 0
                    ? `<div class="admin-empty"><p class="admin-empty-text">No hay ofertas</p></div>`
                    : ofertas.map(cardOferta).join('')
                }
            </div>
        </div>
    `;

    document.getElementById('filtro-estado-oferta')?.addEventListener('change', aplicarFiltro);
}

function cardOferta(o) {
    const badge = badgeEstado(o.estado);
    const empleador = escapeHtml(o.empleadorNombre || o.empleadorEmail || '—');
    const ubicacion = escapeHtml(o.ubicacion?.distrito || o.distrito || '—');
    const salario   = o.salario ? `S/. ${escapeHtml(String(o.salario))}` : '—';
    const fecha     = formatearFecha(o.fechaCreacion, 'corto');

    return `
        <div class="admin-card" data-oferta-id="${escapeHtml(o.id)}">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem">
                <span class="admin-card-nombre" style="font-size:var(--text-base)">
                    ${escapeHtml(o.titulo || 'Sin título')}
                </span>
                <span class="admin-badge ${badge.clase}">${badge.texto}</span>
            </div>
            <p class="admin-card-sub" style="margin-top:0.25rem">
                ${empleador} · ${ubicacion} · ${fecha}
            </p>
            <p class="admin-card-sub">
                ${o.postulantesCount || 0} postulantes · ${salario}
            </p>
            <div class="admin-acciones">
                <button class="btn-admin btn-admin--ghost"
                        data-ver-oferta="${escapeHtml(o.id)}">
                    Ver
                </button>
                <button class="btn-admin btn-admin--danger"
                        data-eliminar-oferta="${escapeHtml(o.id)}"
                        data-titulo="${escapeHtml(o.titulo || 'esta oferta')}">
                    Eliminar 🗑
                </button>
            </div>
        </div>
    `;
}

function badgeEstado(estado) {
    const mapa = {
        activa:      { clase: 'admin-badge--activa',    texto: 'ACTIVA' },
        en_curso:    { clase: 'admin-badge--en-curso',  texto: 'EN CURSO' },
        completada:  { clase: 'admin-badge--completada',texto: 'COMPLETADA' },
        caducada:    { clase: 'admin-badge--caducada',  texto: 'CADUCADA' },
    };
    return mapa[estado] || { clase: 'admin-badge--caducada', texto: estado?.toUpperCase() || '—' };
}

// ─── Filtro ───────────────────────────────────────────────────────────────────

function aplicarFiltro() {
    const estado = document.getElementById('filtro-estado-oferta')?.value;
    const filtradas = estado
        ? _todasOfertas.filter(o => o.estado === estado)
        : _todasOfertas;

    const lista = document.getElementById('ofertas-list');
    if (!lista) return;
    lista.innerHTML = filtradas.length === 0
        ? `<div class="admin-empty"><p class="admin-empty-text">No hay ofertas con este estado</p></div>`
        : filtradas.map(cardOferta).join('');

}


async function mostrarPostulantes(ofertaId, titulo) {
    window.adminModal.abrirModal(`
        <p class="admin-modal-title">${escapeHtml(titulo)}</p>
        <p class="admin-card-sub" style="margin-bottom:0.75rem">Cargando postulantes...</p>
    `);

    try {
        const snap = await getDocs(query(
            collection(_db, 'aplicaciones'),
            where('ofertaId', '==', ofertaId)
        ));

        const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));

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

        const oferta = _todasOfertas.find(o => o.id === ofertaId) || {};
        const badge  = badgeEstado(oferta.estado);

        // Fotos
        const fotos = (oferta.imagenesURLs || []).filter(Boolean);
        const fotosHtml = fotos.length > 0 ? `
            <div style="display:flex;gap:0.5rem;overflow-x:auto;margin-bottom:0.75rem;padding-bottom:0.25rem">
                ${fotos.map(url => `
                    <img src="${escapeHtml(url)}" alt=""
                         style="height:100px;min-width:100px;object-fit:cover;border-radius:8px;flex-shrink:0"
                         loading="lazy">`).join('')}
            </div>` : '';

        // Chips de requisitos
        const chips = [
            oferta.categoria,
            oferta.duracion !== 'No especificada' ? oferta.duracion : null,
            oferta.horario  !== 'No especificado'  ? oferta.horario  : null,
            oferta.experiencia !== 'No especificada' ? oferta.experiencia : null,
            oferta.vacantes > 1 ? `${oferta.vacantes} vacantes` : null,
            oferta.requiereHerramientas ? '🔧 Herramientas' : null,
            oferta.requiereTransporte   ? '🚗 Transporte'   : null,
            oferta.requiereEquipos      ? '🦺 Equipos'      : null,
        ].filter(Boolean);

        const chipsHtml = chips.length > 0 ? `
            <div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-bottom:0.75rem">
                ${chips.map(c => `<span style="background:var(--gray-100);border-radius:20px;
                    padding:0.2rem 0.6rem;font-size:var(--text-xs);color:var(--gray-700)">
                    ${escapeHtml(String(c))}</span>`).join('')}
            </div>` : '';

        const empleador = escapeHtml(oferta.empleadorNombre || oferta.empleadorEmail || '—');
        const distrito  = escapeHtml(oferta.ubicacion?.distrito || oferta.distrito || '');
        const referencia = escapeHtml(oferta.ubicacion?.referencia || oferta.ubicacion?.direccion || '');
        const salario   = oferta.salario ? `S/. ${escapeHtml(String(oferta.salario))}` : '—';
        const fechaPublic = oferta.fechaCreacion ? formatearFecha(oferta.fechaCreacion, 'corto') : '—';
        const fechaExp    = oferta.fechaExpiracion ? formatearFecha(oferta.fechaExpiracion, 'corto') : null;

        const html = `
            ${fotosHtml}
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.25rem">
                <p class="admin-modal-title" style="margin:0">${escapeHtml(titulo)}</p>
                <span class="admin-badge ${badge.clase}" style="flex-shrink:0">${badge.texto}</span>
            </div>
            <p class="admin-card-sub" style="margin-bottom:0.5rem">
                👤 ${empleador}
                ${distrito ? ` · 📍 ${distrito}` : ''}
                ${referencia ? ` · ${referencia}` : ''}
                · 💰 ${salario}
            </p>
            <p class="admin-card-sub" style="margin-bottom:0.75rem">
                Publicado: ${fechaPublic}
                ${fechaExp ? ` · Expira: ${fechaExp}` : ''}
                · ${apps.length} postulante${apps.length !== 1 ? 's' : ''}
            </p>
            ${chipsHtml}
            ${oferta.descripcion ? `
                <p style="font-size:var(--text-sm);color:var(--gray-700);margin-bottom:0.75rem;
                           white-space:pre-line;background:var(--gray-50);border-radius:8px;padding:0.75rem">
                    ${escapeHtml(oferta.descripcion)}
                </p>` : ''}
            ${oferta.habilidades && oferta.habilidades !== 'No especificadas' ? `
                <p class="admin-card-sub" style="margin-bottom:0.25rem">
                    <strong>Habilidades:</strong> ${escapeHtml(oferta.habilidades)}
                </p>` : ''}
            ${oferta.requisitosAdicionales && oferta.requisitosAdicionales !== 'Ninguno' ? `
                <p class="admin-card-sub" style="margin-bottom:0.75rem">
                    <strong>Requisitos:</strong> ${escapeHtml(oferta.requisitosAdicionales)}
                </p>` : ''}
            <p style="font-size:var(--text-xs);font-weight:600;color:var(--gray-500);
                      text-transform:uppercase;letter-spacing:.05em;margin-bottom:0.5rem;
                      border-top:1px solid var(--gray-100);padding-top:0.75rem">
                Postulantes (${apps.length})
            </p>
            <div>${filas}</div>
            <div class="admin-modal-actions" style="margin-top:1rem">
                <button class="btn btn-outline" onclick="adminModal.cerrarModal()">Cerrar</button>
            </div>
        `;
        window.adminModal.abrirModal(html);
    } catch (err) {
        console.error('Error cargando postulantes:', err);
        window.adminModal.abrirModal(`
            <p class="admin-modal-title">Error</p>
            <p class="admin-card-sub">No se pudieron cargar los postulantes.</p>
            <div class="admin-modal-actions">
                <button class="btn btn-outline" onclick="adminModal.cerrarModal()">Cerrar</button>
            </div>
        `);
    }
}

async function confirmarEliminarOferta(ofertaId, titulo) {
    const html = `
        <div>
            <p class="admin-modal-title">Eliminar oferta</p>
            <p class="admin-modal-subtitle">¿Eliminar "${escapeHtml(titulo)}"? Esta acción no se puede deshacer.</p>
            <div class="admin-modal-actions">
                <button class="btn btn-outline" onclick="adminModal.cerrarModal()">Cancelar</button>
                <button class="btn btn-danger" id="btn-confirmar-eliminar-oferta">Sí, eliminar</button>
            </div>
        </div>
    `;

    window.adminModal.abrirModal(html);

    document.getElementById('btn-confirmar-eliminar-oferta').onclick = async () => {
        window.adminModal.cerrarModal();
        try {
            await eliminarOferta(ofertaId);
            _todasOfertas = _todasOfertas.filter(o => o.id !== ofertaId);
            aplicarFiltro();
            showToast('Oferta eliminada', 'success');
        } catch (err) {
            console.error('Error eliminando oferta:', err);
            showToast('Error al eliminar oferta', 'error');
        }
    };
}

async function eliminarOferta(ofertaId) {
    await deleteDoc(doc(_db, 'ofertas', ofertaId));
    await addDoc(collection(_db, 'auditoria'), {
        accion: 'eliminar_oferta',
        ofertaId,
        adminUid: _auth.currentUser?.uid,
        timestamp: serverTimestamp(),
    });
}
