/**
 * Componente reutilizable para cards de ofertas
 * Unifica la generación de HTML para cards en dashboard, mapa y filtros
 *
 * @module components/oferta-card
 */

import { formatearFecha, esHoy } from '../utils/formatting.js';

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

    return `<span class="${claseBase} ${colorClase}">📏 A ${distanciaFormateada} de ti</span>`;
}

/**
 * Genera HTML para la imagen principal de una oferta
 * @param {Object} oferta - Datos de la oferta
 * @returns {string} HTML de la imagen o string vacío
 */
function generarImagenHTML(oferta) {
    const tieneImagen = oferta.imagenesURLs && oferta.imagenesURLs.length > 0;
    if (!tieneImagen) return '';

    return `<div class="oferta-imagen"><img src="${oferta.imagenesURLs[0]}" alt="${oferta.titulo || 'Oferta'}" loading="lazy"></div>`;
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
        yaAplico
    };

    return templateCardTrabajador(oferta, id, datos);
}

function templateCardTrabajador(oferta, id, datos) {
    const claseHoy = esHoy(datos.fechaRef) ? 'oferta-fecha--hoy' : '';
    const cat = oferta.categoria || 'otros';
    const badgeAplico = datos.yaAplico ? '<span class="oferta-badge">✅ Ya aplicaste</span>' : '';

    return `
        <div class="oferta-card touchable hover-lift ${datos.tieneImagen ? 'con-imagen' : ''}" data-categoria="${cat}" onclick="verDetalle('${id}')">
            <div class="oferta-categoria-bar ${cat}"></div>
            ${datos.imagenHTML}
            <div class="oferta-card-body">
                <div class="oferta-header">
                    <span class="oferta-categoria ${cat}">${datos.categoriaDisplay}</span>
                    <span class="oferta-fecha ${claseHoy}">${formatearFecha(datos.fechaRef)}</span>
                </div>
                <h3 class="oferta-titulo">${oferta.titulo}</h3>
                <span class="detalle detalle-salario">💰 ${oferta.salario}</span>
                <div class="oferta-detalles">
                    <span class="detalle">📍 ${datos.ubicacionTexto}</span>
                    ${datos.distanciaBadge}
                    ${(oferta.vacantes || 1) > 1 ? `<span class="detalle">👥 ${oferta.vacantes} vacantes</span>` : ''}
                </div>
                ${badgeAplico ? `<div class="oferta-footer">${badgeAplico}</div>` : ''}
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
    const badgeText = numPendientes > 0 ? `🔔 ${numPendientes} nuevas` :
                     (numAplicaciones > 0 ? `${numAplicaciones} postulaciones` : 'Sin postulaciones');

    // Escapar título para onclick
    const tituloEscapado = oferta.titulo.replace(/'/g, "\\'");

    return `
        <div class="oferta-card touchable hover-lift ${tieneImagen ? 'con-imagen' : ''}" data-categoria="${oferta.categoria || 'otros'}" onclick="window.location.href='mis-aplicaciones.html'" style="cursor: pointer;">
            <div class="oferta-categoria-bar ${oferta.categoria || 'otros'}"></div>
            ${imagenHTML}
            <div class="oferta-card-body">
                <div class="oferta-header">
                    <span class="oferta-categoria ${oferta.categoria || 'otros'}">${categoriaDisplay}</span>
                    <div class="oferta-header-right">
                        <span class="oferta-fecha">${formatearFecha(oferta.fechaActualizacion || oferta.fechaCreacion)}</span>
                        <div class="oferta-menu-container">
                            <button class="oferta-menu-btn" onclick="event.stopPropagation(); toggleOfertaMenu('${id}')" aria-label="Más opciones">
                                ⋮
                            </button>
                            <div class="oferta-menu" id="menu-${id}">
                                <button class="oferta-menu-item" onclick="event.stopPropagation(); editarOferta('${id}')">
                                    ✏️ Editar
                                </button>
                                <button class="oferta-menu-item oferta-menu-item-danger" onclick="event.stopPropagation(); eliminarOferta('${id}', '${tituloEscapado}')">
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <h3 class="oferta-titulo">${oferta.titulo}</h3>
                <div class="oferta-detalles">
                    <span class="detalle">📍 ${ubicacionTexto}</span>
                    <span class="detalle detalle-salario">💰 ${oferta.salario}</span>
                </div>
                <div class="oferta-footer">
                    <span class="oferta-badge-postulaciones ${badgeClass}">${badgeText}</span>
                    <a href="mis-aplicaciones.html" class="btn btn-primary btn-small" onclick="event.stopPropagation()">
                        👥 Ver Candidatos
                    </a>
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
        <span class="preview-categoria ${ofertaData.categoria}">${ofertaData.categoria || 'otros'}</span>
        <h3 class="preview-titulo">${ofertaData.titulo}</h3>
        <p class="preview-descripcion">${ofertaData.descripcion?.substring(0, 100) || ''}...</p>
        <div class="preview-detalles">
            <span class="preview-detalle">💰 ${ofertaData.salario || 'A convenir'}</span>
            <span class="preview-detalle">📍 ${ubicacionTexto}</span>
            ${distanciaBadge}
            ${(ofertaData.vacantes || 1) > 1 ? `<span class="preview-detalle">👥 ${ofertaData.vacantes} vacantes</span>` : ''}
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
