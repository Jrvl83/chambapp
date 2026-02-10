/**
 * Módulo de detalle de oferta y sidebar
 * Maneja el preview, modal de detalle y lista lateral
 *
 * @module mapa-ofertas/detalle
 */

import {
    doc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { calcularDistancia, formatearDistancia } from '../utils/distance.js';
import { crearOfertaPreviewMapa } from '../components/oferta-card.js';

// Referencias inyectadas
let db = null;
let state = null;
let callbacks = {};

/**
 * Inicializa el módulo de detalle
 * @param {Object} dbRef - Referencia a Firestore
 * @param {Object} sharedState - Estado compartido
 * @param {Object} cbs - Objeto compartido de callbacks
 */
export function initDetalle(dbRef, sharedState, cbs) {
    db = dbRef;
    state = sharedState;
    callbacks = cbs;

    // Registrar callbacks que otros módulos necesitan
    cbs.mostrarPreviewOferta = mostrarPreviewOferta;
    cbs.resaltarOfertaEnLista = resaltarOfertaEnLista;
    cbs.actualizarListaSidebar = actualizarListaSidebar;
}

// ============================================
// PREVIEW DE OFERTA (click en marker)
// ============================================

export function mostrarPreviewOferta(oferta) {
    state.ofertaSeleccionada = oferta;
    const preview = document.getElementById('oferta-preview');
    const contenido = document.getElementById('preview-contenido');

    if (!preview || !contenido) return;

    let distanciaKm = null;
    if (state.ubicacionUsuario) {
        distanciaKm = calcularDistancia(
            state.ubicacionUsuario.lat,
            state.ubicacionUsuario.lng,
            oferta.lat,
            oferta.lng
        );
    }

    contenido.innerHTML = crearOfertaPreviewMapa(oferta.data, oferta.id, {
        distanciaKm,
        formatearDistancia
    });

    preview.style.display = 'block';
    state.mapa.panTo({ lat: oferta.lat, lng: oferta.lng });
}

function cerrarPreview() {
    const preview = document.getElementById('oferta-preview');
    if (preview) {
        preview.style.display = 'none';
    }
    state.ofertaSeleccionada = null;

    document.querySelectorAll('.oferta-mini-card.activa').forEach(card => {
        card.classList.remove('activa');
    });
}

// ============================================
// MODAL DETALLE DE OFERTA
// ============================================

async function obtenerDatosOferta(ofertaId) {
    const oferta = state.ofertasFiltradas.find(o => o.id === ofertaId);
    if (oferta) return oferta.data;

    const docRef = doc(db, 'ofertas', ofertaId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return docSnap.data();
}

function crearGaleriaHTML(imagenesURLs) {
    if (!imagenesURLs || imagenesURLs.length === 0) return '';

    const imagenes = imagenesURLs.map((url, i) => `
        <img src="${url}" alt="Foto ${i + 1}"
            style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; cursor: pointer; flex-shrink: 0;"
            onclick="window.open('${url}', '_blank')">
    `).join('');

    return `
        <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem;">
                ${imagenes}
            </div>
        </div>
    `;
}

function crearBotonAccionOferta(ofertaId, yaAplico) {
    if (yaAplico) {
        return `
            <button class="btn btn-success" disabled style="cursor: not-allowed; opacity: 0.7;">
                ✅ Ya postulaste
            </button>
        `;
    }
    return `
        <button class="btn btn-primary touchable" onclick="mostrarFormularioPostulacionMapa('${ofertaId}')">
            📝 Postular a esta oferta
        </button>
    `;
}

function obtenerUbicacionTexto(ofertaData) {
    if (typeof ofertaData.ubicacion === 'object') {
        return ofertaData.ubicacion.texto_completo || ofertaData.ubicacion.distrito || 'No especificada';
    }
    return ofertaData.ubicacion || 'No especificada';
}

function crearContenidoDetalle(ofertaData, ofertaId, yaAplico) {
    const ubicacionTexto = obtenerUbicacionTexto(ofertaData);

    return `
        <div class="detalle-header">
            <h2 class="detalle-titulo">${ofertaData.titulo}</h2>
            <span class="detalle-categoria ${ofertaData.categoria}">${ofertaData.categoria || 'otros'}</span>
        </div>

        ${crearGaleriaHTML(ofertaData.imagenesURLs)}

        <div class="detalle-seccion">
            <h4>📝 Descripcion</h4>
            <p>${ofertaData.descripcion || 'Sin descripcion'}</p>
        </div>

        <div class="detalle-grid">
            <div class="detalle-item">
                <strong>💰 Salario</strong>
                <span>${ofertaData.salario || 'A convenir'}</span>
            </div>
            <div class="detalle-item">
                <strong>📍 Ubicacion</strong>
                <span>${ubicacionTexto}</span>
            </div>
            <div class="detalle-item">
                <strong>⏱️ Duracion</strong>
                <span>${ofertaData.duracion || 'No especificada'}</span>
            </div>
            <div class="detalle-item">
                <strong>🕐 Horario</strong>
                <span>${ofertaData.horario || 'No especificado'}</span>
            </div>
            ${(ofertaData.vacantes || 1) > 1 ? `
            <div class="detalle-item">
                <strong>👥 Vacantes</strong>
                <span>${ofertaData.vacantes} personas</span>
            </div>
            ` : ''}
        </div>

        <div class="detalle-seccion">
            <h4>📋 Requisitos</h4>
            <p><strong>Experiencia:</strong> ${ofertaData.experiencia || 'No especificada'}</p>
            <p><strong>Habilidades:</strong> ${ofertaData.habilidades || 'No especificadas'}</p>
        </div>

        <div class="detalle-empleador">
            <strong>👤 Publicado por:</strong><br>
            <span>${ofertaData.empleadorNombre || 'Empleador'}</span>
        </div>

        <div class="detalle-acciones">
            <button class="btn btn-secondary" onclick="cerrarModalDetalle()">Cerrar</button>
            ${crearBotonAccionOferta(ofertaId, yaAplico)}
        </div>
    `;
}

async function verDetalleOferta(ofertaId) {
    try {
        const ofertaData = await obtenerDatosOferta(ofertaId);
        if (!ofertaData) {
            if (typeof mostrarToast === 'function') {
                mostrarToast('No se encontro la oferta', 'error');
            }
            return;
        }

        cerrarPreview();

        const yaAplico = state.aplicacionesUsuario.includes(ofertaId);
        const modalBody = document.getElementById('modal-detalle-body');
        modalBody.innerHTML = crearContenidoDetalle(ofertaData, ofertaId, yaAplico);

        const modal = document.getElementById('modal-detalle-overlay');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error al cargar detalle:', error);
        if (typeof mostrarToast === 'function') {
            mostrarToast('Error al cargar los detalles', 'error');
        }
    }
}

function cerrarModalDetalle() {
    const modal = document.getElementById('modal-detalle-overlay');
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = '';
}

function clickFueraModalDetalle(event) {
    if (event.target.id === 'modal-detalle-overlay') {
        cerrarModalDetalle();
    }
}

// ============================================
// SIDEBAR: LISTA DE OFERTAS
// ============================================

function crearMiniCard(oferta) {
    const ubicacionTexto = oferta.data.ubicacion?.distrito || 'Sin ubicacion';

    let distanciaTexto = '';
    if (state.ubicacionUsuario) {
        const distancia = calcularDistancia(
            state.ubicacionUsuario.lat,
            state.ubicacionUsuario.lng,
            oferta.lat,
            oferta.lng
        );
        distanciaTexto = `<span>&#128207; ${formatearDistancia(distancia)}</span>`;
    }

    return `
        <div class="oferta-mini-card" data-oferta-id="${oferta.id}" onclick="seleccionarOfertaLista('${oferta.id}')">
            <div class="oferta-mini-titulo">${oferta.data.titulo}</div>
            <div class="oferta-mini-detalles">
                <span>&#128176; ${oferta.data.salario || 'A convenir'}</span>
                <span>&#128205; ${ubicacionTexto}</span>
                ${distanciaTexto}
            </div>
            <span class="oferta-mini-categoria ${oferta.data.categoria}">${oferta.data.categoria || 'otros'}</span>
        </div>
    `;
}

export function actualizarListaSidebar() {
    const listaContenido = document.getElementById('ofertas-lista-contenido');
    if (!listaContenido) return;

    if (state.ofertasFiltradas.length === 0) {
        listaContenido.innerHTML = `
            <div class="mapa-empty-state scale-in">
                <div class="icono">&#128269;</div>
                <p>Sin ofertas en esta área. Prueba ampliando la búsqueda.</p>
            </div>
        `;
        return;
    }

    listaContenido.innerHTML = state.ofertasFiltradas
        .slice(0, 20)
        .map(oferta => crearMiniCard(oferta))
        .join('');
}

function seleccionarOfertaLista(ofertaId) {
    const oferta = state.ofertasFiltradas.find(o => o.id === ofertaId);
    if (oferta) {
        mostrarPreviewOferta(oferta);
        resaltarOfertaEnLista(ofertaId);

        if (window.innerWidth < 768) {
            callbacks.toggleSidebar();
        }
    }
}

export function resaltarOfertaEnLista(ofertaId) {
    document.querySelectorAll('.oferta-mini-card').forEach(card => {
        card.classList.remove('activa');
    });

    const card = document.querySelector(`[data-oferta-id="${ofertaId}"]`);
    if (card) {
        card.classList.add('activa');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Registra las funciones globales del módulo de detalle
 */
export function registrarFuncionesGlobalesDetalle() {
    window.cerrarPreview = cerrarPreview;
    window.verDetalleOferta = verDetalleOferta;
    window.cerrarModalDetalle = cerrarModalDetalle;
    window.clickFueraModalDetalle = clickFueraModalDetalle;
    window.seleccionarOfertaLista = seleccionarOfertaLista;
}
