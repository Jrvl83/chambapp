/**
 * Componente compartido para renderizar el detalle de una oferta
 * Usado por: mapa-ofertas, dashboard, mis-aplicaciones-trabajador
 *
 * @module components/oferta-detalle
 */

import { escapeHtml } from '../utils/dom-helpers.js';
import { generarEstrellasHTML } from '../utils/formatting.js';

/**
 * Genera el HTML completo del detalle de una oferta
 * @param {Object} oferta - Datos de la oferta
 * @param {string} ofertaId - ID de la oferta
 * @param {Object} ratingData - { promedio, total } del empleador
 * @param {Object} opciones - Configuración
 * @param {boolean} opciones.mostrarPostulacion - Muestra botón postular
 * @param {boolean} opciones.yaAplico - Ya postuló a esta oferta
 * @param {boolean} opciones.mostrarEmail - Muestra email del empleador
 * @param {string} opciones.onPostularFn - Nombre de función global para postular
 * @param {string} opciones.onCerrarFn - Nombre de función global para cerrar
 */
export function generarDetalleOfertaHTML(oferta, ofertaId, ratingData, opciones = {}) {
    const ubicacionTexto = extraerUbicacionTexto(oferta.ubicacion);

    return `
        ${renderHeroHTML(oferta.imagenesURLs)}
        ${renderHeaderHTML(oferta)}
        ${renderGaleriaHTML(oferta.imagenesURLs)}
        ${renderDescripcionHTML(oferta)}
        ${renderGridInfoHTML(oferta, ubicacionTexto)}
        ${renderRequisitosHTML(oferta)}
        ${renderEmpleadorHTML(oferta, ratingData, opciones.mostrarEmail)}
        ${renderAccionesHTML(ofertaId, opciones)}
    `;
}

function extraerUbicacionTexto(ubicacion) {
    if (typeof ubicacion === 'object') {
        return ubicacion.texto_completo || ubicacion.distrito || 'No especificada';
    }
    return ubicacion || 'No especificada';
}

// Hero: primera imagen a ancho completo (clickeable para ver completa)
function renderHeroHTML(imagenesURLs) {
    if (!imagenesURLs || imagenesURLs.length === 0) return '';
    const url = imagenesURLs[0];
    return `<div class="detalle-hero"><img src="${url}" alt="Imagen principal" onclick="window.open('${url}', '_blank')"></div>`;
}

function renderHeaderHTML(oferta) {
    const titulo = escapeHtml(oferta.titulo || '');
    const categoria = oferta.categoria || 'otros';

    return `
        <div class="detalle-header">
            <h2 class="detalle-titulo">${titulo}</h2>
            <span class="detalle-categoria ${categoria}">${categoria}</span>
        </div>
    `;
}

// Galería: miniaturas de todas las imágenes (incluyendo la del hero)
function renderGaleriaHTML(imagenesURLs) {
    if (!imagenesURLs || imagenesURLs.length === 0) return '';

    const imagenes = imagenesURLs.map((url, i) =>
        `<img src="${url}" alt="Foto ${i + 1}" loading="lazy" onclick="window.open('${url}', '_blank')">`
    ).join('');

    return `<div class="detalle-galeria">${imagenes}</div>`;
}

function renderDescripcionHTML(oferta) {
    return `
        <div class="detalle-seccion">
            <h4>📝 Descripción</h4>
            <p>${escapeHtml(oferta.descripcion || 'Sin descripción')}</p>
        </div>
    `;
}

// Dots visuales de vacantes disponibles
function renderSpotsHTML(vacantes) {
    if (!vacantes || vacantes <= 0) return '';
    const count = Math.min(vacantes, 5);
    const mod = vacantes === 1 ? '--critico' : vacantes === 2 ? '--urgente' : '--ok';
    const dots = Array.from({ length: count }, () =>
        `<span class="spot-dot spot-dot${mod}"></span>`
    ).join('');
    const texto = vacantes === 1 ? '1 lugar disponible' : `${vacantes} lugares disponibles`;
    return `<div class="spots-row"><div class="spots-dots">${dots}</div><span class="spots-label">${texto}</span></div>`;
}

// Estima pago total si salario y duración son numéricos parseables
function calcularPagoTotal(salario, duracion) {
    if (!salario || !duracion) return null;
    const montoMatch = salario.match(/[\d]+/);
    const diasMatch = duracion.match(/(\d+)\s*(d[ií]a|semana|mes)/i);
    if (!montoMatch || !diasMatch) return null;
    const monto = parseInt(montoMatch[0], 10);
    let dias = parseInt(diasMatch[1], 10);
    const unidad = diasMatch[2].toLowerCase();
    if (unidad.startsWith('semana')) dias *= 7;
    if (unidad.startsWith('mes')) dias *= 30;
    const total = monto * dias;
    return total > 0 ? total : null;
}

function renderGridInfoHTML(oferta, ubicacionTexto) {
    const pagoTotal = calcularPagoTotal(oferta.salario, oferta.duracion);
    const pagoTotalHTML = pagoTotal
        ? `<div class="detalle-item detalle-item--full">
               <strong>💵 Pago estimado total</strong>
               <span class="detalle-pago-total">S/. ${pagoTotal.toLocaleString('es-PE')}</span>
           </div>`
        : '';
    const spotsHTML = (oferta.vacantes || 0) > 0
        ? `<div class="detalle-item detalle-item--full">
               <strong>👥 Vacantes</strong>
               ${renderSpotsHTML(oferta.vacantes)}
           </div>`
        : '';

    return `
        <div class="detalle-grid">
            <div class="detalle-item">
                <strong>💰 Salario</strong>
                <span class="oferta-salario-pill">${escapeHtml(oferta.salario || 'A convenir')}</span>
            </div>
            <div class="detalle-item">
                <strong>📍 Ubicación</strong>
                <span>${escapeHtml(ubicacionTexto)}</span>
            </div>
            <div class="detalle-item">
                <strong>⏱️ Duración</strong>
                <span>${escapeHtml(oferta.duracion || 'No especificada')}</span>
            </div>
            <div class="detalle-item">
                <strong>🕐 Horario</strong>
                <span>${escapeHtml(oferta.horario || 'No especificado')}</span>
            </div>
            ${pagoTotalHTML}
            ${spotsHTML}
        </div>
    `;
}

function renderRequisitosHTML(oferta) {
    return `
        <div class="detalle-seccion">
            <h4>📋 Requisitos</h4>
            <p><strong>Experiencia:</strong> ${escapeHtml(oferta.experiencia || 'No especificada')}</p>
            <p><strong>Habilidades:</strong> ${escapeHtml(oferta.habilidades || 'No especificadas')}</p>
        </div>
    `;
}

function renderRatingInlineHTML(ratingData) {
    if (!ratingData || ratingData.total === 0) return '';

    return `<span class="empleador-rating-inline">
        ${generarEstrellasHTML(ratingData.promedio)}
        <span class="rating-numero">${ratingData.promedio.toFixed(1)}</span>
        <span class="rating-count">(${ratingData.total})</span>
    </span>`;
}

function renderEmpleadorHTML(oferta, ratingData, mostrarEmail) {
    const nombre = escapeHtml(oferta.empleadorNombre || 'Empleador');
    const emailHTML = mostrarEmail && oferta.empleadorEmail
        ? `<span class="detalle-empleador-email">📧 ${escapeHtml(oferta.empleadorEmail)}</span>`
        : '';

    return `
        <div class="detalle-empleador">
            <strong>👤 Publicado por:</strong>
            <div class="detalle-empleador-info">
                <span>${nombre}</span>
                ${renderRatingInlineHTML(ratingData)}
            </div>
            ${emailHTML}
        </div>
    `;
}

function renderAccionesHTML(ofertaId, opciones) {
    const cerrarFn = opciones.onCerrarFn || 'cerrarModal';
    let botonPostular = '';
    let trustMsg = '';

    if (opciones.mostrarPostulacion) {
        const postularFn = opciones.onPostularFn || 'mostrarFormularioPostulacion';
        if (opciones.yaAplico) {
            botonPostular = `<button class="btn btn-success" disabled style="cursor: not-allowed; opacity: 0.7;">✅ Ya postulaste</button>`;
        } else {
            botonPostular = `<button class="btn btn-primary touchable" onclick="${postularFn}('${ofertaId}')">📝 Postular a esta oferta</button>`;
            trustMsg = `<p class="detalle-trust-msg">Sin costos ocultos · Puedes cancelar tu postulación</p>`;
        }
    }

    return `
        <div class="detalle-acciones">
            <button class="btn btn-secondary" onclick="${cerrarFn}()">Cerrar</button>
            ${botonPostular}
        </div>
        ${trustMsg}
    `;
}
