/**
 * Módulo de renderizado de cards de aplicaciones
 * Genera el HTML para grupos de ofertas y cards individuales
 *
 * @module mis-aplicaciones/cards
 */

import { formatearFecha } from '../utils/formatting.js';

// Referencia al estado compartido
let state = null;

/**
 * Inicializa el módulo de cards
 * @param {Object} sharedState - Estado compartido
 */
export function initCards(sharedState) {
    state = sharedState;
}

function escaparParaHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/'/g, "\\'")
        .replace(/"/g, '&quot;');
}

function getCategoriaLabel(categoria) {
    const labels = {
        'construccion': '🏗️ Construcción',
        'electricidad': '⚡ Electricidad',
        'gasfiteria': '🔧 Gasfitería',
        'pintura': '🎨 Pintura',
        'carpinteria': '🪵 Carpintería',
        'limpieza': '🧹 Limpieza',
        'jardineria': '🌿 Jardinería',
        'mecanica': '🔩 Mecánica',
        'otros': '📦 Otros'
    };
    return labels[categoria] || categoria || '📦 Sin categoría';
}

function crearBadgeEstado(estado) {
    const estados = {
        'pendiente': { texto: 'PENDIENTE', clase: 'pendiente' },
        'aceptado': { texto: 'ACEPTADO', clase: 'aceptado' },
        'rechazado': { texto: 'RECHAZADO', clase: 'rechazado' },
        'completado': { texto: 'COMPLETADO', clase: 'completado' }
    };
    const config = estados[estado] || estados['pendiente'];
    return `<span class="badge ${config.clase}">${config.texto}</span>`;
}

// ============================================
// BOTONES DE ACCIÓN POR ESTADO
// ============================================

function crearBotonesPendiente(aplicacionId, nombreEscapado, vacantesLlenas) {
    if (vacantesLlenas) {
        return `
            <div class="estado-final">
                <span class="texto-rechazado">Vacantes cubiertas</span>
            </div>
            <button class="btn btn-danger btn-sm" onclick="rechazarAplicacion('${aplicacionId}', '${nombreEscapado}')">
                ❌ Rechazar
            </button>
        `;
    }
    return `
        <button class="btn btn-success btn-sm" onclick="aceptarAplicacion('${aplicacionId}', '${nombreEscapado}')">
            ✅ Aceptar
        </button>
        <button class="btn btn-danger btn-sm" onclick="rechazarAplicacion('${aplicacionId}', '${nombreEscapado}')">
            ❌ Rechazar
        </button>
    `;
}

function crearBotonesAceptado(aplicacion, nombre, telefono, nombreEscapado, tituloEscapado) {
    const mensajeWhatsApp = encodeURIComponent(
        `Hola ${nombre}, te contacto por la oferta "${aplicacion.ofertaTitulo}" en ChambaYa. Tu postulación fue aceptada.`
    );
    const telefonoLimpio = telefono ? telefono.replace(/\D/g, '') : '';
    const telefonoWhatsApp = telefonoLimpio.startsWith('51') ? telefonoLimpio : `51${telefonoLimpio}`;

    return `
        <div class="contacto-aceptado">
            <div class="contacto-info">
                <span class="contacto-label">📱 Contacto:</span>
                <span class="contacto-telefono">${telefono || 'No disponible'}</span>
            </div>
            <div class="contacto-botones">
                ${telefono ? `
                    <a href="https://wa.me/${telefonoWhatsApp}?text=${mensajeWhatsApp}"
                       target="_blank"
                       class="btn btn-whatsapp btn-sm">
                        <span class="whatsapp-icon">📱</span> WhatsApp
                    </a>
                    <a href="tel:${telefono}" class="btn btn-primary btn-sm">📞 Llamar</a>
                ` : ''}
                <button class="btn btn-completado btn-sm" onclick="marcarCompletado('${aplicacion.id}', '${nombreEscapado}', '${tituloEscapado}')">
                    🏁 Marcar Completado
                </button>
            </div>
        </div>
    `;
}

function crearBotonesCompletado(aplicacion, emailEscapado, nombreEscapado) {
    if (aplicacion.calificado) {
        return `
            <div class="estado-final completado">
                <span class="texto-completado">✅ Trabajo completado</span>
                <div class="estado-calificado">
                    <span class="calificacion-mostrada">
                        <span class="estrella-filled">★</span>
                        Calificado
                    </span>
                </div>
            </div>
        `;
    }
    return `
        <div class="estado-final completado">
            <span class="texto-completado">✅ Trabajo completado</span>
            <button class="btn btn-primary btn-sm" onclick="calificarTrabajador('${aplicacion.id}', '${emailEscapado}', '${nombreEscapado}')">
                ⭐ Calificar
            </button>
        </div>
    `;
}

function crearBotonesAccion(aplicacion, ofertaId) {
    const estado = aplicacion.estado || 'pendiente';
    const nombre = aplicacion.aplicanteNombre || 'Trabajador';
    const email = aplicacion.aplicanteEmail || 'No disponible';
    const telefono = aplicacion.aplicanteTelefono || null;
    const tituloOferta = aplicacion.ofertaTitulo || 'Sin título';

    const nombreEscapado = escaparParaHTML(nombre);
    const emailEscapado = escaparParaHTML(email);
    const tituloEscapado = escaparParaHTML(tituloOferta);

    const ofertaInfo = state.ofertasCache[ofertaId] || {};
    const vacantesLlenas = (ofertaInfo.aceptadosCount || 0) >= (ofertaInfo.vacantes || 1);

    if (estado === 'pendiente') {
        return crearBotonesPendiente(aplicacion.id, nombreEscapado, vacantesLlenas);
    } else if (estado === 'aceptado') {
        return crearBotonesAceptado(aplicacion, nombre, telefono, nombreEscapado, tituloEscapado);
    } else if (estado === 'rechazado') {
        return `<div class="estado-final"><span class="texto-rechazado">Postulación rechazada</span></div>`;
    } else if (estado === 'completado') {
        return crearBotonesCompletado(aplicacion, emailEscapado, nombreEscapado);
    }
    return '';
}

// ============================================
// RATING HTML
// ============================================

function crearRatingHTML(email, emailEscapado, nombreEscapado) {
    const ratingInfo = state.trabajadoresRatings[email] || { promedio: 0, total: 0 };

    if (ratingInfo.total > 0) {
        return `<div class="trabajador-rating clickable" onclick="verDetalleCalificaciones('${emailEscapado}', '${nombreEscapado}')">
                   <span class="rating-estrella">★</span>
                   <span class="rating-numero">${ratingInfo.promedio.toFixed(1)}</span>
                   <span class="rating-total">(${ratingInfo.total})</span>
                   <span class="rating-ver">👁️</span>
               </div>`;
    }
    return `<div class="trabajador-rating sin-rating">
               <span class="rating-texto">Sin calificaciones aún</span>
           </div>`;
}

// ============================================
// VER PERFIL LINK
// ============================================

function crearVerPerfilLink(aplicacion) {
    if (!aplicacion.aplicanteId) return '';
    return `<a href="perfil-publico.html?id=${aplicacion.aplicanteId}"
               class="btn-ver-perfil" onclick="event.stopPropagation()">👤 Ver Perfil</a>`;
}

// ============================================
// CARD DE APLICACIÓN
// ============================================

function crearAplicacionCard(aplicacion, ofertaId) {
    const estado = aplicacion.estado || 'pendiente';
    const nombre = aplicacion.aplicanteNombre || 'Trabajador';
    const email = aplicacion.aplicanteEmail || 'No disponible';
    const telefono = aplicacion.aplicanteTelefono || null;
    const mensaje = aplicacion.mensaje || 'Sin mensaje';
    const fecha = formatearFecha(aplicacion.fechaAplicacion);

    const emailEscapado = escaparParaHTML(email);
    const nombreEscapado = escaparParaHTML(nombre);

    return `
        <div class="aplicacion-card estado-${estado} touchable hover-lift">
            <div class="aplicacion-header">
                <div class="aplicacion-trabajador">
                    <div class="aplicacion-avatar">👤</div>
                    <div>
                        <div class="aplicacion-nombre">${nombre}</div>
                        <div class="aplicacion-email">${email}</div>
                        ${crearRatingHTML(email, emailEscapado, nombreEscapado)}
                        ${crearVerPerfilLink(aplicacion)}
                    </div>
                </div>
                ${crearBadgeEstado(estado)}
            </div>

            <div class="aplicacion-info">
                ${telefono && estado !== 'aceptado' ? `
                <div class="info-item">
                    <span class="info-label">📱 Teléfono</span>
                    <span class="info-value">${telefono}</span>
                </div>
                ` : ''}
                <div class="info-item">
                    <span class="info-label">📅 Fecha postulación</span>
                    <span class="info-value">${fecha}</span>
                </div>
            </div>

            <div class="aplicacion-mensaje">
                <strong>💬 Mensaje del postulante:</strong><br>
                ${mensaje}
            </div>

            <div class="aplicacion-actions">
                ${crearBotonesAccion(aplicacion, ofertaId)}
            </div>
        </div>
    `;
}

// ============================================
// GRUPO DE OFERTA
// ============================================

/**
 * Crea el HTML de un grupo de aplicaciones agrupadas por oferta
 * @param {string} ofertaId - ID de la oferta
 * @param {Object} grupo - Datos del grupo {titulo, categoria, aplicaciones}
 * @returns {string} HTML del grupo
 */
export function crearGrupoOferta(ofertaId, grupo) {
    const categoriaLabel = getCategoriaLabel(grupo.categoria);
    const cantidadAplicantes = grupo.aplicaciones.length;
    const ofertaInfo = state.ofertasCache[ofertaId] || {};
    const vacantes = ofertaInfo.vacantes || 1;
    const aceptadosCount = ofertaInfo.aceptadosCount || 0;

    const vacantesHTML = vacantes > 1
        ? `<span class="oferta-vacantes-badge">${aceptadosCount}/${vacantes} vacantes cubiertas</span>`
        : '';

    let aplicacionesHTML = '';
    grupo.aplicaciones.forEach(aplicacion => {
        aplicacionesHTML += crearAplicacionCard(aplicacion, ofertaId);
    });

    return `
        <div class="oferta-grupo">
            <div class="oferta-grupo-header">
                <div class="oferta-grupo-info">
                    <h3 class="oferta-grupo-titulo">📋 ${grupo.titulo}</h3>
                    <div class="oferta-grupo-meta">
                        <span class="oferta-categoria-badge">${categoriaLabel}</span>
                        <span class="oferta-aplicantes-count">👥 ${cantidadAplicantes} postulante${cantidadAplicantes !== 1 ? 's' : ''}</span>
                        ${vacantesHTML}
                    </div>
                </div>
            </div>
            <div class="oferta-grupo-aplicaciones">
                ${aplicacionesHTML}
            </div>
        </div>
    `;
}
