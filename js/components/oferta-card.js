/**
 * Componente reutilizable para cards de ofertas
 * Unifica la generación de HTML para cards en dashboard, mapa y filtros
 *
 * @module components/oferta-card
 */

import { formatearFecha, esHoy } from '../utils/formatting.js';
import { escapeHtml } from '../utils/dom-helpers.js';
import { ICON_PIN } from '../utils/icons.js';

// Content-size icons (14×14) — local to this module
const ICON_BELL_SM = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
const ICON_CLOCK_SM = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
const ICON_FIRE_SM = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/></svg>';
const ICON_EDIT_SM = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
const ICON_TRASH_SM = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
const ICON_PEOPLE_SM = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
const ICON_CHECK_SM = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';

/**
 * Obtiene el texto de ubicación de una oferta
 * @param {Object|string} ubicacion - Objeto de ubicación o string
 * @returns {string}
 */
function obtenerTextoUbicacion(ubicacion) {
    if (typeof ubicacion === 'object' && ubicacion) {
        return ubicacion.texto_completo || ubicacion.distrito || 'Sin ubicación';
    }
    return ubicacion || 'Sin ubicación';
}

/**
 * Capitaliza la primera letra de un texto
 * @param {string} texto
 * @returns {string}
 */
function capitalizar(texto) {
    if (!texto) return 'Otros';
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Extrae solo el distrito de una ubicación
 * @param {Object|string} ubicacion
 * @returns {string}
 */
function obtenerDistrito(ubicacion) {
    if (typeof ubicacion === 'object' && ubicacion) {
        return ubicacion.distrito || ubicacion.texto_completo || 'Sin ubicación';
    }
    return ubicacion || 'Sin ubicación';
}

/**
 * Genera el badge de distancia con colores según proximidad
 * @param {number|null} distanciaKm - Distancia en kilómetros
 * @param {Function} formatearDistancia - Función para formatear distancia
 * @param {string} claseBase - Clase CSS base para el badge
 * @returns {string} HTML del badge o string vacío
 */
export function generarDistanciaBadge(distanciaKm, formatearDistancia, claseBase = 'distancia-badge') {
    if (distanciaKm === null || distanciaKm === undefined || distanciaKm < 0) {
        return '';
    }

    const distanciaFormateada = formatearDistancia(distanciaKm);
    const colorClase = distanciaKm <= 5 ? 'distancia-cerca' :
                       (distanciaKm <= 15 ? 'distancia-media' : 'distancia-lejos');

    return `<span class="${claseBase} ${colorClase}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> A ${distanciaFormateada} de ti</span>`;
}

/**
 * Genera el HTML del indicador de vacantes con urgencia visual por color
 * @param {number|null} vacantes
 * @returns {string}
 */
function generarSpotsHTML(vacantes) {
    if (!vacantes || vacantes <= 0) return '';
    if (vacantes === 1) {
        return `<span class="oferta-spots oferta-spots--critico">• 1 lugar disponible</span>`;
    }
    if (vacantes === 2) {
        return `<span class="oferta-spots oferta-spots--urgente">• 2 lugares disponibles</span>`;
    }
    return `<span class="oferta-spots">• ${vacantes} lugares</span>`;
}

/**
 * Genera HTML para la imagen principal de una oferta
 * @param {Object} oferta - Datos de la oferta
 * @returns {string} HTML de la imagen o string vacío
 */
function generarImagenHTML(oferta) {
    const tieneImagen = oferta.imagenesURLs && oferta.imagenesURLs.length > 0;
    if (!tieneImagen) return '';

    return `<div class="oferta-imagen"><img src="${oferta.imagenesURLs[0]}" alt="${escapeHtml(oferta.titulo || 'Oferta')}" loading="lazy"></div>`;
}

/**
 * Genera una card de oferta para la vista de trabajador en el dashboard
 * @param {Object} oferta - Datos de la oferta
 * @param {string} id - ID de la oferta
 * @param {Object} opciones - Opciones de configuración
 * @param {number|null} opciones.distanciaKm - Distancia en km
 * @param {boolean} opciones.yaAplico - Si el usuario ya aplicó
 * @param {Function} opciones.formatearDistancia - Función para formatear distancia
 * @param {Function} opciones.onVerDetalle - Callback o nombre de función para ver detalle
 * @returns {string} HTML de la card
 */
export function crearOfertaCardTrabajador(oferta, id, opciones = {}) {
    const {
        distanciaKm = null,
        yaAplico = false,
        formatearDistancia = (d) => d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`
    } = opciones;

    const datos = {
        ubicacionTexto: obtenerTextoUbicacion(oferta.ubicacion),
        distanciaBadge: generarDistanciaBadge(distanciaKm, formatearDistancia),
        categoriaDisplay: capitalizar(oferta.categoria),
        imagenHTML: generarImagenHTML(oferta),
        tieneImagen: oferta.imagenesURLs && oferta.imagenesURLs.length > 0,
        fechaRef: oferta.fechaActualizacion || oferta.fechaCreacion,
        yaAplico,
        distanciaKm,
        formatearDistancia
    };

    return templateCardTrabajador(oferta, id, datos);
}

function templateCardTrabajador(oferta, id, datos) {
    const cat = oferta.categoria || 'otros';
    const empleadorNombre = oferta.empleadorNombre ? escapeHtml(oferta.empleadorNombre) : '';
    const distrito = escapeHtml(obtenerDistrito(oferta.ubicacion));

    const distanciaHTML = (datos.distanciaKm !== null && datos.distanciaKm !== undefined && datos.distanciaKm >= 0)
        ? `<span class="detalle">${ICON_CLOCK_SM} ${datos.formatearDistancia(datos.distanciaKm)}</span>`
        : '';

    const urgente = oferta.vacantes && oferta.vacantes > 0 && oferta.vacantes <= 3;
    const spotsHTML = urgente
        ? `<div class="oferta-urgente">${ICON_FIRE_SM} Urgente — ${oferta.vacantes} cupo${oferta.vacantes === 1 ? '' : 's'}</div>`
        : '';

    const footerAccion = datos.yaAplico
        ? `<span class="oferta-badge-aplicado">${ICON_CHECK_SM} Ya postulaste</span>`
        : `<button class="btn-postular" onclick="event.stopPropagation(); verDetalle('${id}')">Postular</button>`;

    return `
        <div class="oferta-card oferta-card--trabajador touchable hover-lift${datos.tieneImagen ? ' con-imagen' : ''}" data-categoria="${cat}" onclick="verDetalle('${id}')">
            <div class="oferta-categoria-bar ${cat}"></div>
            ${datos.imagenHTML}
            <div class="oferta-card-body">
                <div class="oferta-header">
                    <h3 class="oferta-titulo">${escapeHtml(oferta.titulo)}</h3>
                    <span class="oferta-categoria ${cat}">${escapeHtml(datos.categoriaDisplay)}</span>
                </div>
                ${empleadorNombre ? `<p class="oferta-empleador">${empleadorNombre}</p>` : ''}
                <div class="oferta-detalles">
                    <span class="detalle">${ICON_PIN} ${distrito}</span>
                    ${distanciaHTML}
                </div>
                <div class="oferta-footer">
                    <span class="oferta-salario-grande">${escapeHtml(oferta.salario)}</span>
                    ${footerAccion}
                </div>
                ${spotsHTML}
            </div>
        </div>
    `;
}

/**
 * Genera una card de oferta para la vista de empleador en el dashboard
 * @param {Object} oferta - Datos de la oferta
 * @param {string} id - ID de la oferta
 * @param {Object} opciones - Opciones de configuración
 * @param {number} opciones.numAplicaciones - Número total de aplicaciones
 * @param {number} opciones.numPendientes - Número de aplicaciones pendientes
 * @returns {string} HTML de la card
 */
export function crearOfertaCardEmpleador(oferta, id, opciones = {}) {
    const {
        numAplicaciones = 0,
        numPendientes = 0
    } = opciones;

    const ubicacionTexto = obtenerTextoUbicacion(oferta.ubicacion);
    const categoriaDisplay = capitalizar(oferta.categoria);
    const tieneImagen = oferta.imagenesURLs && oferta.imagenesURLs.length > 0;
    const imagenHTML = generarImagenHTML(oferta);

    const badgeClass = numPendientes > 0 ? 'badge-aplicaciones tiene-pendientes' :
                      (numAplicaciones > 0 ? 'badge-aplicaciones' : 'badge-sin-aplicaciones');
    const badgeText = numPendientes > 0 ? `${ICON_BELL_SM} ${numPendientes} ${numPendientes === 1 ? 'nueva' : 'nuevas'}` :
                     (numAplicaciones > 0 ? `${numAplicaciones} ${numAplicaciones === 1 ? 'postulación' : 'postulaciones'}` : 'Sin postulaciones');

    // Escapar título para onclick
    const tituloEscapado = oferta.titulo.replace(/'/g, "\\'");

    return `
        <div class="oferta-card touchable hover-lift ${tieneImagen ? 'con-imagen' : ''}" data-categoria="${oferta.categoria || 'otros'}" onclick="window.location.href='mis-aplicaciones.html'" style="cursor: pointer;">
            <div class="oferta-categoria-bar ${oferta.categoria || 'otros'}"></div>
            ${imagenHTML}
            <div class="oferta-card-body">
                <div class="oferta-header">
                    <span class="oferta-categoria ${oferta.categoria || 'otros'}">${escapeHtml(categoriaDisplay)}</span>
                    <div class="oferta-header-right">
                        <span class="oferta-fecha">${formatearFecha(oferta.fechaActualizacion || oferta.fechaCreacion, 'corto')}</span>
                        <div class="oferta-menu-container">
                            <button class="oferta-menu-btn" onclick="event.stopPropagation(); toggleOfertaMenu('${id}')" aria-label="Más opciones">
                                ⋮
                            </button>
                            <div class="oferta-menu" id="menu-${id}">
                                <button class="oferta-menu-item" onclick="event.stopPropagation(); editarOferta('${id}')">
                                    ${ICON_EDIT_SM} Editar
                                </button>
                                <button class="oferta-menu-item oferta-menu-item-danger" onclick="event.stopPropagation(); eliminarOferta('${id}', '${tituloEscapado}')">
                                    ${ICON_TRASH_SM} Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <h3 class="oferta-titulo">${escapeHtml(oferta.titulo)}</h3>
                <div class="oferta-detalles">
                    <span class="detalle">${ICON_PIN} ${escapeHtml(ubicacionTexto)}</span>
                    <span class="oferta-salario-pill">${escapeHtml(oferta.salario)}</span>
                </div>
                <div class="oferta-footer">
                    <span class="oferta-badge-postulaciones ${badgeClass}">${badgeText}</span>
                    ${numAplicaciones > 0 ? `<a href="mis-aplicaciones.html" class="btn btn-primary btn-small" onclick="event.stopPropagation()">
                        ${ICON_PEOPLE_SM} Ver Candidatos
                    </a>` : ''}
                </div>
            </div>
        </div>
    `;
}

/**
 * Genera el contenido HTML para el preview de oferta en el mapa
 * @param {Object} ofertaData - Datos de la oferta (oferta.data del mapa)
 * @param {string} ofertaId - ID de la oferta
 * @param {Object} opciones - Opciones de configuración
 * @param {number|null} opciones.distanciaKm - Distancia calculada
 * @param {Function} opciones.formatearDistancia - Función para formatear distancia
 * @returns {string} HTML del contenido del preview
 */
export function crearOfertaPreviewMapa(ofertaData, ofertaId, opciones = {}) {
    const {
        distanciaKm = null,
        formatearDistancia = (d) => d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`
    } = opciones;

    const ubicacionTexto = obtenerTextoUbicacion(ofertaData.ubicacion);

    let distanciaBadge = '';
    if (distanciaKm !== null && distanciaKm >= 0) {
        const colorClase = distanciaKm <= 5 ? 'distancia-cerca' :
                          (distanciaKm <= 15 ? 'distancia-media' : 'distancia-lejos');
        distanciaBadge = `<span class="distancia-badge-preview ${colorClase}">A ${formatearDistancia(distanciaKm)} de ti</span>`;
    }

    return `
        <span class="preview-categoria ${ofertaData.categoria}">${escapeHtml(ofertaData.categoria || 'otros')}</span>
        <h3 class="preview-titulo">${escapeHtml(ofertaData.titulo)}</h3>
        <p class="preview-descripcion">${escapeHtml(ofertaData.descripcion?.substring(0, 100) || '')}...</p>
        <div class="preview-detalles">
            <span class="oferta-salario-pill">${escapeHtml(ofertaData.salario || 'A convenir')}</span>
            <span class="preview-detalle">${ICON_PIN} ${escapeHtml(ubicacionTexto)}</span>
            ${distanciaBadge}
            ${generarSpotsHTML(ofertaData.vacantes)}
        </div>
        <div class="preview-acciones">
            <button class="btn btn-secondary" onclick="cerrarPreview()">Cerrar</button>
            <button class="btn btn-primary" onclick="verDetalleOferta('${ofertaId}')">Ver detalles</button>
        </div>
    `;
}

/**
 * Genera una card de oferta genérica/flexible
 * @param {Object} oferta - Datos de la oferta
 * @param {string} id - ID de la oferta
 * @param {Object} opciones - Todas las opciones posibles
 * @returns {string} HTML de la card
 */
export function crearOfertaCard(oferta, id, opciones = {}) {
    const {
        tipo = 'trabajador', // 'trabajador', 'empleador', 'preview'
        ...restoOpciones
    } = opciones;

    switch (tipo) {
        case 'empleador':
            return crearOfertaCardEmpleador(oferta, id, restoOpciones);
        case 'preview':
            return crearOfertaPreviewMapa(oferta, id, restoOpciones);
        default:
            return crearOfertaCardTrabajador(oferta, id, restoOpciones);
    }
}
