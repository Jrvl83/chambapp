/**
 * Admin — Gestión de Usuarios
 * Lista paginada, búsqueda, bloquear/desbloquear
 *
 * @module admin/usuarios
 */

import {
    collection, query, limit, startAfter,
    getDocs, doc, updateDoc, addDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { escapeHtml } from '../utils/dom-helpers.js';
import { formatearFecha } from '../utils/formatting.js';

const PAGE_SIZE = 20;

let _db, _auth;
let _usuariosCargados = [];
let _ultimoDoc        = null;
let _filtroActivo     = 'todos';
let _hayMas           = false;

// ─── Init ────────────────────────────────────────────────────────────────────

export async function initUsuarios(db, auth) {
    _db   = db;
    _auth = auth;
    renderShell();
    await cargarUsuarios(true);
}

// ─── Shell ────────────────────────────────────────────────────────────────────

function renderShell() {
    const contenedor = document.getElementById('usuarios-container');
    contenedor.innerHTML = `
        <div class="admin-section">
            <input type="search" class="admin-search" id="usuarios-search"
                   placeholder="🔍 Buscar por nombre o email...">
        </div>
        <div class="admin-section" style="padding-top:0">
            <div class="admin-filter-row" id="usuarios-filtros">
                <button class="admin-filter-pill active" data-filtro="todos">Todos</button>
                <button class="admin-filter-pill" data-filtro="trabajador">Trabajadores</button>
                <button class="admin-filter-pill" data-filtro="empleador">Empleadores</button>
                <button class="admin-filter-pill admin-filter-pill--warning" data-filtro="bloqueado">
                    🚫 Bloqueados
                </button>
            </div>
        </div>
        <div class="admin-section" style="padding-top:0">
            <div class="admin-list" id="usuarios-list"></div>
            <div class="admin-load-more" id="usuarios-load-more" hidden>
                <button class="btn btn-outline btn-sm" id="btn-cargar-mas">Cargar más</button>
            </div>
        </div>
    `;

    document.getElementById('usuarios-search').addEventListener('input', debounce(buscarUsuarios, 300));
    document.getElementById('usuarios-filtros').addEventListener('click', manejarFiltro);
    document.getElementById('usuarios-list').addEventListener('click', manejarAccionesUsuario);
    document.getElementById('btn-cargar-mas')?.addEventListener('click', () => cargarUsuarios(false));
}

// ─── Carga paginada ───────────────────────────────────────────────────────────

async function cargarUsuarios(resetear) {
    if (resetear) {
        _usuariosCargados = [];
        _ultimoDoc        = null;
    }

    const lista = document.getElementById('usuarios-list');
    if (resetear) lista.innerHTML = `<div class="admin-loading"><div class="admin-spinner"></div></div>`;

    try {
        const constraints = [limit(PAGE_SIZE)];
        if (_ultimoDoc) constraints.push(startAfter(_ultimoDoc));

        const snap = await getDocs(query(collection(_db, 'usuarios'), ...constraints));
        const nuevos = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        _ultimoDoc        = snap.docs[snap.docs.length - 1] || null;
        _hayMas           = snap.docs.length === PAGE_SIZE;
        _usuariosCargados = [..._usuariosCargados, ...nuevos];

        renderListaUsuarios(filtrarLocalmente(_usuariosCargados));
        document.getElementById('usuarios-load-more').hidden = !_hayMas;

    } catch (err) {
        console.error('Error cargando usuarios:', err);
        lista.innerHTML = `<p class="admin-empty-text">Error al cargar usuarios.</p>`;
    }
}

// ─── Filtros ──────────────────────────────────────────────────────────────────

function manejarFiltro(e) {
    const pill = e.target.closest('.admin-filter-pill');
    if (!pill) return;

    _filtroActivo = pill.dataset.filtro;

    document.querySelectorAll('#usuarios-filtros .admin-filter-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.filtro === _filtroActivo);
    });

    renderListaUsuarios(filtrarLocalmente(_usuariosCargados));
}

function filtrarLocalmente(usuarios) {
    if (_filtroActivo === 'todos')      return usuarios;
    if (_filtroActivo === 'bloqueado')  return usuarios.filter(u => u.bloqueado);
    return usuarios.filter(u => u.tipo === _filtroActivo);
}

function buscarUsuarios() {
    const termino = document.getElementById('usuarios-search')?.value.toLowerCase().trim();
    if (!termino) {
        renderListaUsuarios(filtrarLocalmente(_usuariosCargados));
        return;
    }
    const filtrados = _usuariosCargados.filter(u =>
        (u.nombre || '').toLowerCase().includes(termino) ||
        (u.email  || '').toLowerCase().includes(termino)
    );
    renderListaUsuarios(filtrados);
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderListaUsuarios(usuarios) {
    const lista = document.getElementById('usuarios-list');
    if (!lista) return;

    if (usuarios.length === 0) {
        lista.innerHTML = `
            <div class="admin-empty">
                <div class="admin-empty-icon">👤</div>
                <p class="admin-empty-text">No se encontraron usuarios</p>
            </div>`;
        return;
    }

    lista.innerHTML = usuarios.map(cardUsuario).join('');
}

function cardUsuario(u) {
    const iniciales = obtenerIniciales(u.nombre || u.email);
    const esBloqueado = !!u.bloqueado;
    const esPremium   = u.plan === 'premium';
    const fechaReg    = formatearFecha(u.createdAt, 'corto');
    const apps        = u.aplicacionesCount || u.totalAplicaciones || 0;
    const rating      = u.promedioCalificacion ? `⭐ ${u.promedioCalificacion}` : '';

    return `
        <div class="admin-card ${esBloqueado ? 'admin-card--bloqueado' : esPremium ? 'admin-card--premium' : ''}"
             data-uid="${escapeHtml(u.id)}">
            <div class="admin-card-header">
                <div class="admin-avatar">
                    ${u.photoURL
                        ? `<img src="${escapeHtml(u.photoURL)}" alt="" loading="lazy">`
                        : iniciales}
                </div>
                <div class="admin-card-info">
                    <div class="admin-card-nombre">
                        ${escapeHtml(u.nombre || 'Sin nombre')}
                        ${esBloqueado
                            ? `<span class="admin-badge admin-badge--bloqueado">🚫 BLOQUEADO</span>`
                            : esPremium
                                ? `<span class="admin-badge admin-badge--premium">⭐ PREMIUM</span>`
                                : `<span class="admin-badge admin-badge--free">FREE</span>`}
                    </div>
                    <p class="admin-card-sub">${escapeHtml(u.email || '—')}</p>
                    <p class="admin-card-sub">
                        ${escapeHtml(u.ubicacion?.distrito || u.distrito || 'Lima')} ·
                        Reg. ${fechaReg}
                        ${apps ? ` · ${apps} apps` : ''}
                        ${rating ? ` · ${rating}` : ''}
                    </p>
                    ${esPremium && u.premiumHasta
                        ? `<p class="admin-card-sub" style="color:var(--warning-hover)">
                               Válido hasta: ${formatearFecha(u.premiumHasta, 'corto')}
                           </p>`
                        : ''}
                </div>
            </div>
            <div class="admin-acciones">
                ${u.tipo === 'trabajador' ? `
                <button class="btn-admin btn-admin--ghost btn-ver-perfil"
                        data-uid="${escapeHtml(u.id)}" data-tipo="trabajador">
                    Ver perfil
                </button>` : ''}
                ${esBloqueado
                    ? `<button class="btn-admin btn-admin--primary btn-desbloquear"
                               data-uid="${escapeHtml(u.id)}"
                               data-nombre="${escapeHtml(u.nombre || u.email)}">
                           Desbloquear
                       </button>`
                    : `<button class="btn-admin btn-admin--danger btn-bloquear"
                               data-uid="${escapeHtml(u.id)}"
                               data-nombre="${escapeHtml(u.nombre || u.email)}">
                           Bloquear
                       </button>`
                }
            </div>
        </div>
    `;
}

function obtenerIniciales(texto) {
    if (!texto) return '?';
    return texto.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || '?';
}

// ─── Acciones ─────────────────────────────────────────────────────────────────

async function manejarAccionesUsuario(e) {
    const btnPerfil    = e.target.closest('.btn-ver-perfil');
    const btnBloquear  = e.target.closest('.btn-bloquear');
    const btnDesbloquear = e.target.closest('.btn-desbloquear');

    if (btnPerfil) {
        const { uid, tipo } = btnPerfil.dataset;
        if (tipo === 'trabajador') window.open(`perfil-publico.html?id=${uid}`, '_blank');
    }

    if (btnBloquear)   await confirmarBloqueo(btnBloquear, true);
    if (btnDesbloquear) await confirmarBloqueo(btnDesbloquear, false);
}

async function confirmarBloqueo(btn, bloquear) {
    const { uid, nombre } = btn.dataset;
    const accion = bloquear ? 'bloquear' : 'desbloquear';

    const html = `
        <div>
            <p class="admin-modal-title">${bloquear ? 'Bloquear' : 'Desbloquear'} usuario</p>
            <p class="admin-modal-subtitle">
                ¿${bloquear ? 'Bloquear' : 'Desbloquear'} a "${escapeHtml(nombre)}"?
                ${bloquear ? 'No podrá iniciar sesión.' : 'Podrá volver a iniciar sesión.'}
            </p>
            <div class="admin-modal-actions">
                <button class="btn btn-outline" onclick="adminModal.cerrarModal()">Cancelar</button>
                <button class="btn ${bloquear ? 'btn-danger' : 'btn-primary'}"
                        id="btn-confirmar-bloqueo">
                    Sí, ${accion}
                </button>
            </div>
        </div>
    `;

    window.adminModal.abrirModal(html);

    document.getElementById('btn-confirmar-bloqueo').onclick = async () => {
        window.adminModal.cerrarModal();
        btn.disabled = true;
        try {
            await toggleBloqueo(uid, bloquear);
            // Actualizar local sin recargar todo
            const idx = _usuariosCargados.findIndex(u => u.id === uid);
            if (idx !== -1) _usuariosCargados[idx].bloqueado = bloquear;
            renderListaUsuarios(filtrarLocalmente(_usuariosCargados));
            showToast(`Usuario ${bloquear ? 'bloqueado' : 'desbloqueado'}`, 'success');
        } catch (err) {
            console.error('Error:', err);
            showToast('Error al actualizar usuario', 'error');
            btn.disabled = false;
        }
    };
}

async function toggleBloqueo(uid, bloquear) {
    await updateDoc(doc(_db, 'usuarios', uid), { bloqueado: bloquear });
    await addDoc(collection(_db, 'auditoria'), {
        accion: bloquear ? 'bloquear_usuario' : 'desbloquear_usuario',
        uid,
        adminUid: _auth.currentUser?.uid,
        timestamp: serverTimestamp(),
    });
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}
