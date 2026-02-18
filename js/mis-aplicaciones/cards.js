/**
 * Módulo de renderizado de cards de aplicaciones
 * Genera el HTML para grupos de ofertas y cards individuales
 *
 * @module mis-aplicaciones/cards
 */

import { formatearFecha } from '../utils/formatting.js';

let state = null;

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
        'pendiente': { texto: 'Pendiente', clase: 'pendiente' },
        'aceptado':  { texto: 'Aceptado',  clase: 'aceptado'  },
        'rechazado': { texto: 'Rechazado', clase: 'rechazado' },
        'completado':{ texto: 'Completado',clase: 'completado'}
    };
    const config = estados[estado] || estados['pendiente'];
    return `<span class="badge ${config.clase}">${config.texto}</span>`;
}

// Avatar con iniciales del nombre (color determinista)
function crearAvatarHTML(nombre) {
    const palabras = (nombre || 'T').trim().split(/\s+/);
    const iniciales = palabras.length >= 2
        ? palabras[0][0] + palabras[1][0]
        : palabras[0].substring(0, 2);
    const colores = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2', '#db2777'];
    const color = colores[(nombre || '').charCodeAt(0) % colores.length];
    return `<div class="aplicacion-avatar" style="--avatar-color:${color}">${iniciales.toUpperCase()}</div>`;
}

// ============================================
// BOTONES DE ACCIÓN POR ESTADO
// ============================================

function crearBotonesPendiente(aplicacionId, nombreEscapado, vacantesLlenas) {
    if (vacantesLlenas) {
        return `
            <div class="aplicacion-actions-pendiente">
                <div class="estado-final">
                    <span class="texto-rechazado">Vacantes cubiertas</span>
                </div>
                <button class="btn btn-danger btn-accion" onclick="rechazarAplicacion('${aplicacionId}', '${nombreEscapado}')">
                    ❌ Rechazar
                </button>
            </div>
        `;
    }
    return `
        <div class="aplicacion-actions-pendiente">
            <button class="btn btn-success btn-accion" onclick="aceptarAplicacion('${aplicacionId}', '${nombreEscapado}')">
                ✅ Aceptar
            </button>
            <button class="btn btn-danger btn-accion" onclick="rechazarAplicacion('${aplicacionId}', '${nombreEscapado}')">
                ❌ Rechazar
            </button>
        </div>
    `;
}

function crearBotonesAceptado(aplicacion, nombre, telefono, nombreEscapado, tituloEscapado) {
    const mensajeWhatsApp = encodeURIComponent(
        `Hola ${nombre}, te contacto por la oferta "${aplicacion.ofertaTitulo}" en ChambaYa. Tu postulación fue aceptada.`
    );
    const telefonoLimpio = telefono ? telefono.replace(/\D/g, '') : '';
    const telefonoWhatsApp = telefonoLimpio.startsWith('51') ? telefonoLimpio : `51${telefonoLimpio}`;

    const contactoHTML = telefono ? `
        <div class="contacto-info">
            <span class="contacto-label">📱</span>
            <span class="contacto-telefono">${telefono}</span>
        </div>
        <a href="https://wa.me/${telefonoWhatsApp}?text=${mensajeWhatsApp}"
           target="_blank" class="btn btn-whatsapp btn-whatsapp-cta">
            📱 Contactar por WhatsApp
        </a>
        <a href="tel:${telefono}" class="btn-llamar-link">📞 Llamar también</a>
    ` : `<p class="sin-telefono">Sin número de contacto registrado</p>`;

    return `
        <div class="contacto-aceptado">${contactoHTML}</div>
        <button class="btn-marcar-completado"
                onclick="marcarCompletado('${aplicacion.id}', '${nombreEscapado}', '${tituloEscapado}')">
            🏁 Marcar trabajo como completado
        </button>
    `;
}

function crearBotonesCompletado(aplicacion, emailEscapado, nombreEscapado) {
    if (aplicacion.calificado) {
        return `
            <div class="estado-final completado">
                <span class="texto-completado">✅ Trabajo completado</span>
                <div class="estado-calificado">
                    <span class="calificacion-mostrada">
                        <span class="estrella-filled">★</span> Calificado
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

    if (estado === 'pendiente') return crearBotonesPendiente(aplicacion.id, nombreEscapado, vacantesLlenas);
    if (estado === 'aceptado') return crearBotonesAceptado(aplicacion, nombre, telefono, nombreEscapado, tituloEscapado);
    if (estado === 'rechazado') return `<div class="estado-final"><span class="texto-rechazado">Postulación rechazada</span></div>`;
    if (estado === 'completado') return crearBotonesCompletado(aplicacion, emailEscapado, nombreEscapado);
    return '';
}

// ============================================
// RATING HTML
// ============================================

function crearRatingHTML(email, emailEscapado, nombreEscapado) {
    const ratingInfo = state.trabajadoresRatings[email] || { promedio: 0, total: 0 };

    if (ratingInfo.total > 0) {
        return `<span class="trabajador-rating clickable" onclick="verDetalleCalificaciones('${emailEscapado}', '${nombreEscapado}')">
                    <span class="rating-estrella">★</span>
                    <span class="rating-numero">${ratingInfo.promedio.toFixed(1)}</span>
                    <span class="rating-total">(${ratingInfo.total})</span>
                </span>`;
    }
    return '';
}

function crearVerPerfilLink(aplicacion) {
    if (!aplicacion.aplicanteId) return '';
    const esPendiente = (aplicacion.estado || 'pendiente') === 'pendiente';
    const clase = esPendiente ? 'btn-ver-perfil btn-ver-perfil--pendiente' : 'btn-ver-perfil';
    return `<a href="perfil-publico.html?id=${aplicacion.aplicanteId}"
               class="${clase}" onclick="event.stopPropagation()">Ver Perfil</a>`;
}

// ============================================
// CARD RECHAZADO — colapsada por defecto
// ============================================

function crearCardRechazadaColapsada(aplicacion) {
    const nombre = aplicacion.aplicanteNombre || 'Trabajador';
    const fecha = formatearFecha(aplicacion.fechaAplicacion);
    const mensajeHTML = aplicacion.mensaje && aplicacion.mensaje !== 'Sin mensaje'
        ? `<p class="aplicacion-mensaje-texto">"${aplicacion.mensaje}"</p>` : '';

    return `
        <div class="aplicacion-card estado-rechazado aplicacion-card--colapsada"
             onclick="toggleCardRechazada(this)">
            <div class="card-rechazada-row">
                ${crearAvatarHTML(nombre)}
                <span class="card-rechazada-nombre">${nombre}</span>
                <span class="card-rechazada-fecha">${fecha}</span>
                <span class="badge rechazado">Rechazado</span>
                <span class="card-expand-icon">›</span>
            </div>
            <div class="card-rechazada-detalles">
                <p class="aplicacion-email">${aplicacion.aplicanteEmail || ''}</p>
                ${mensajeHTML}
                <div class="estado-final">
                    <span class="texto-rechazado">Postulación rechazada</span>
                </div>
            </div>
        </div>
    `;
}

function toggleCardRechazada(el) {
    el.classList.toggle('aplicacion-card--expandida');
}

// ============================================
// CARD DE APLICACIÓN — layout compacto
// ============================================

function crearAplicacionCard(aplicacion, ofertaId) {
    const estado = aplicacion.estado || 'pendiente';

    if (estado === 'rechazado') return crearCardRechazadaColapsada(aplicacion);

    const nombre = aplicacion.aplicanteNombre || 'Trabajador';
    const email = aplicacion.aplicanteEmail || '';
    const mensaje = aplicacion.mensaje || '';
    const fecha = formatearFecha(aplicacion.fechaAplicacion);

    const emailEscapado = escaparParaHTML(email);
    const nombreEscapado = escaparParaHTML(nombre);

    const mensajeHTML = mensaje && mensaje !== 'Sin mensaje'
        ? `<p class="aplicacion-mensaje-texto">"${mensaje}"</p>`
        : '';

    return `
        <div class="aplicacion-card estado-${estado}">
            <div class="aplicacion-header">
                <div class="aplicacion-trabajador">
                    ${crearAvatarHTML(nombre)}
                    <div class="aplicacion-trabajador-info">
                        <div class="aplicacion-nombre-row">
                            <span class="aplicacion-nombre">${nombre}</span>
                            ${crearRatingHTML(email, emailEscapado, nombreEscapado)}
                        </div>
                        <div class="aplicacion-meta-row">
                            <span class="aplicacion-email">${email}</span>
                            <span class="aplicacion-sep">·</span>
                            <span class="aplicacion-fecha">${fecha}</span>
                        </div>
                        ${crearVerPerfilLink(aplicacion)}
                    </div>
                </div>
                ${estado !== 'pendiente' ? crearBadgeEstado(estado) : ''}
            </div>
            ${mensajeHTML}
            <div class="aplicacion-actions">
                ${crearBotonesAccion(aplicacion, ofertaId)}
            </div>
        </div>
    `;
}

// ============================================
// GRUPO DE OFERTA
// ============================================

const ORDEN_ESTADO = { pendiente: 0, aceptado: 1, completado: 2, rechazado: 3 };

export function crearGrupoOferta(ofertaId, grupo) {
    const categoriaLabel = getCategoriaLabel(grupo.categoria);
    const ofertaInfo = state.ofertasCache[ofertaId] || {};
    const vacantes = ofertaInfo.vacantes || 1;
    const aceptadosCount = ofertaInfo.aceptadosCount || 0;

    // Pendientes primero dentro del grupo
    const sorted = [...grupo.aplicaciones].sort((a, b) =>
        (ORDEN_ESTADO[a.estado || 'pendiente'] || 0) - (ORDEN_ESTADO[b.estado || 'pendiente'] || 0)
    );

    const pendientesCount = sorted.filter(a => (a.estado || 'pendiente') === 'pendiente').length;
    const tienePendientes = pendientesCount > 0;
    const total = sorted.length;

    const vacantesHTML = vacantes > 1
        ? `<span class="oferta-vacantes-badge">${aceptadosCount}/${vacantes} vacantes</span>`
        : '';

    const pendientesHTML = tienePendientes
        ? `<span class="pendientes-badge">${pendientesCount} pendiente${pendientesCount !== 1 ? 's' : ''}</span>`
        : '';

    const aplicacionesHTML = sorted.map(a => crearAplicacionCard(a, ofertaId)).join('');

    return `
        <div class="oferta-grupo ${tienePendientes ? 'oferta-grupo--urgente' : ''}">
            <div class="oferta-grupo-header">
                <div class="oferta-grupo-titulo-row">
                    ${tienePendientes ? '<span class="grupo-urgencia-dot"></span>' : ''}
                    <h3 class="oferta-grupo-titulo">${grupo.titulo}</h3>
                </div>
                <div class="oferta-grupo-meta">
                    <span class="oferta-categoria-badge ${grupo.categoria || 'otros'}">${categoriaLabel}</span>
                    <span class="oferta-aplicantes-count">${total} postulante${total !== 1 ? 's' : ''}</span>
                    ${pendientesHTML}
                    ${vacantesHTML}
                </div>
            </div>
            <div class="oferta-grupo-aplicaciones">
                ${aplicacionesHTML}
            </div>
        </div>
    `;
}

export function registrarFuncionesGlobalesCards() {
    window.toggleCardRechazada = toggleCardRechazada;
}
