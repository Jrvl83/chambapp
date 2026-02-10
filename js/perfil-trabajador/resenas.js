// ============================================
// RESENAS RECIBIDAS + RESPONDER
// Modulo: perfil-trabajador/resenas.js
// ============================================

import { collection, query, where, getDocs, orderBy, doc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { formatearFecha, generarEstrellasHTML } from '../utils/formatting.js';

let _db = null;
let _auth = null;
let state = null;

let resenasCache = [];
let resenaActualId = null;

// ============================================
// INICIALIZAR MODULO
// ============================================
export function initResenas(firebaseDb, firebaseAuth, sharedState) {
    _db = firebaseDb;
    _auth = firebaseAuth;
    state = sharedState;
}

// ============================================
// CARGAR RESENAS RECIBIDAS
// ============================================
function manejarErrorResenas(error, loadingState, emptyState) {
    console.error('Error al cargar reseñas:', error);
    loadingState.style.display = 'none';

    if (error.code === 'failed-precondition') {
        emptyState.innerHTML = `
            <p>📋 Configurando sistema de reseñas...</p>
            <span class="helper-text">Por favor, intenta de nuevo en unos minutos</span>
        `;
        emptyState.style.display = 'block';
    } else if (typeof toastError === 'function') {
        toastError('Error al cargar las reseñas');
    }
}

function toggleEstadosCarga(container, emptyState, loadingState, resumenEl) {
    loadingState.style.display = 'block';
    container.style.display = 'none';
    emptyState.style.display = 'none';
    resumenEl.style.display = 'none';
}

function procesarResenas(querySnapshot, container, resumenEl) {
    const resenas = [];
    querySnapshot.forEach(docSnap => {
        resenas.push({ id: docSnap.id, ...docSnap.data() });
    });

    resenasCache = resenas;
    mostrarResumenCalificaciones(resenas);
    resumenEl.style.display = 'grid';
    mostrarListaResenas(resenas);
    container.style.display = 'flex';
}

export async function cargarResenasRecibidas() {
    const container = document.getElementById('resenas-container');
    const emptyState = document.getElementById('resenas-empty');
    const loadingState = document.getElementById('resenas-loading');
    const resumenEl = document.getElementById('resenas-resumen');

    if (!container) return;

    try {
        toggleEstadosCarga(container, emptyState, loadingState, resumenEl);

        const q = query(
            collection(_db, 'calificaciones'),
            where('trabajadorId', '==', _auth.currentUser.uid),
            orderBy('fechaCalificacion', 'desc')
        );

        const querySnapshot = await getDocs(q);
        loadingState.style.display = 'none';

        if (querySnapshot.empty) {
            emptyState.style.display = 'block';
            return;
        }

        procesarResenas(querySnapshot, container, resumenEl);
    } catch (error) {
        manejarErrorResenas(error, loadingState, emptyState);
    }
}

// ============================================
// RESUMEN DE CALIFICACIONES
// ============================================
function renderDistribucion(distribucion, total) {
    let html = '';
    for (let i = 5; i >= 1; i--) {
        const count = distribucion[String(i)] || 0;
        const porcentaje = total > 0 ? Math.round((count / total) * 100) : 0;

        html += `
            <div class="distribucion-row">
                <span class="distribucion-label">${i} ★</span>
                <div class="distribucion-barra">
                    <div class="distribucion-fill" style="width: ${porcentaje}%"></div>
                </div>
                <span class="distribucion-count">${count}</span>
            </div>
        `;
    }
    return html;
}

function mostrarResumenCalificaciones(resenas) {
    const promedio = state.perfilData.calificacionPromedio || 0;
    const total = resenas.length;

    document.getElementById('resumen-promedio').textContent = promedio.toFixed(1);
    document.getElementById('resumen-total').textContent = `${total} reseña${total !== 1 ? 's' : ''}`;

    const estrellasContainer = document.getElementById('resumen-estrellas');
    estrellasContainer.innerHTML = generarEstrellasHTML(promedio);

    const distribucion = state.perfilData.distribucionCalificaciones || { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
    const distribucionContainer = document.getElementById('resumen-distribucion');
    distribucionContainer.innerHTML = renderDistribucion(distribucion, total);
}

// ============================================
// LISTA DE RESENAS
// ============================================
function renderResenaHeader(resena, estrellas, fecha) {
    return `
        <div class="resena-header">
            <div class="resena-empleador">
                <div class="resena-avatar">👤</div>
                <div class="resena-info">
                    <span class="resena-nombre">${resena.empleadorNombre || 'Empleador'}</span>
                    <span class="resena-trabajo">${resena.ofertaTitulo || 'Trabajo'}</span>
                </div>
            </div>
            <div class="resena-meta">
                <div class="resena-estrellas">${estrellas}</div>
                <span class="resena-fecha">${fecha}</span>
            </div>
        </div>`;
}

function renderResenaCard(resena) {
    const fecha = formatearFecha(resena.fechaCalificacion, 'relativo');
    const estrellas = generarEstrellasHTML(resena.puntuacion);

    const comentarioHTML = resena.comentario
        ? `<div class="resena-comentario"><p>"${resena.comentario}"</p></div>`
        : '';

    const respuestaHTML = resena.respuesta
        ? `<div class="resena-respuesta"><span class="respuesta-label">Tu respuesta:</span><p>"${resena.respuesta}"</p></div>`
        : `<button class="btn btn-secondary btn-small btn-responder" onclick="abrirModalResponder('${resena.id}')">💬 Responder</button>`;

    return `
        <div class="resena-card" data-id="${resena.id}">
            ${renderResenaHeader(resena, estrellas, fecha)}
            ${comentarioHTML}
            ${respuestaHTML}
        </div>`;
}

function mostrarListaResenas(resenas) {
    const container = document.getElementById('resenas-container');
    container.innerHTML = '';

    resenas.forEach(resena => {
        container.innerHTML += renderResenaCard(resena);
    });
}

// ============================================
// MODAL RESPONDER RESENA
// ============================================
export function abrirModalResponder(resenaId) {
    resenaActualId = resenaId;

    const resena = resenasCache.find(r => r.id === resenaId);
    if (!resena) {
        if (typeof toastError === 'function') {
            toastError('No se encontró la reseña');
        }
        return;
    }

    const preview = document.getElementById('resena-preview');
    const comentario = resena.comentario
        ? `<p class="preview-comentario">"${resena.comentario}"</p>`
        : '<p class="preview-comentario" style="color: var(--gray);">(Sin comentario)</p>';

    preview.innerHTML = `
        <div class="preview-header">
            <span class="preview-nombre">${resena.empleadorNombre || 'Empleador'}</span>
            <span class="preview-estrellas">${generarEstrellasHTML(resena.puntuacion)}</span>
        </div>
        ${comentario}
    `;

    document.getElementById('respuesta-texto').value = '';
    document.getElementById('respuesta-char-count').textContent = '0';

    document.getElementById('modal-responder').classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function cerrarModalResponder() {
    document.getElementById('modal-responder').classList.remove('active');
    document.body.style.overflow = 'auto';
    resenaActualId = null;
}

// ============================================
// ENVIAR RESPUESTA
// ============================================
async function ejecutarEnvioRespuesta(respuesta, btnEnviar) {
    const calificacionRef = doc(_db, 'calificaciones', resenaActualId);

    await updateDoc(calificacionRef, {
        respuesta: respuesta,
        fechaRespuesta: serverTimestamp()
    });

    cerrarModalResponder();

    if (typeof toastSuccess === 'function') {
        toastSuccess('¡Respuesta enviada!');
    }

    await cargarResenasRecibidas();
}

function validarRespuesta() {
    const respuesta = document.getElementById('respuesta-texto').value.trim();

    if (!respuesta) {
        if (typeof toastError === 'function') { toastError('Escribe una respuesta'); }
        return null;
    }
    if (!resenaActualId) {
        if (typeof toastError === 'function') { toastError('Error: No se identificó la reseña'); }
        return null;
    }
    return respuesta;
}

export async function enviarRespuesta() {
    const respuesta = validarRespuesta();
    if (!respuesta) return;

    const btnEnviar = document.getElementById('btn-enviar-respuesta');
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '⏳ Enviando...';

    try {
        await ejecutarEnvioRespuesta(respuesta, btnEnviar);
    } catch (error) {
        console.error('Error al enviar respuesta:', error);
        if (typeof toastError === 'function') { toastError('Error al enviar la respuesta'); }
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = '💬 Enviar Respuesta';
    }
}
