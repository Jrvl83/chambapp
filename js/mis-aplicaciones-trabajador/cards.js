/**
 * Renderizado de cards de aplicaciones del trabajador
 * @module mis-aplicaciones-trabajador/cards
 */

import { formatearFecha } from '../utils/formatting.js';
import { escapeHtml } from '../utils/dom-helpers.js';

let state = null;

/**
 * Inicializa el módulo de cards
 * @param {Object} sharedState - Estado compartido
 */
export function initCards(sharedState) {
    state = sharedState;
}

// --- Configuracion de estados ---

const ESTADO_CONFIG = {
    'pendiente': {
        texto: 'Pendiente',
        clase: 'pendiente',
        icono: '🟡',
        descripcion: 'Esperando respuesta del empleador'
    },
    'aceptado': {
        texto: '¡Aceptado!',
        clase: 'aceptado',
        icono: '✅',
        descripcion: '¡Felicidades! El empleador aceptó tu postulación'
    },
    'rechazado': {
        texto: 'No seleccionado',
        clase: 'rechazado',
        icono: '❌',
        descripcion: 'El empleador eligió otro candidato'
    },
    'completado': {
        texto: 'Completado',
        clase: 'completado',
        icono: '🏁',
        descripcion: 'Trabajo completado exitosamente'
    }
};

const CATEGORIA_LABELS = {
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

export function getCategoriaLabel(categoria) {
    return CATEGORIA_LABELS[categoria] || categoria;
}

// --- Mostrar aplicaciones ---

export function mostrarAplicaciones(aplicaciones) {
    const container = document.getElementById('aplicaciones-container');

    if (aplicaciones.length === 0) {
        container.style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
        actualizarResultadosInfo(0, state.todasLasAplicaciones.length);
        return;
    }

    container.style.display = 'flex';
    document.getElementById('empty-state').style.display = 'none';
    container.innerHTML = aplicaciones.map(a => crearAplicacionCard(a)).join('');
    actualizarResultadosInfo(aplicaciones.length, state.todasLasAplicaciones.length);
}

function actualizarResultadosInfo(cantidad, total) {
    const el = document.getElementById('resultados-info');
    if (cantidad === 0) {
        el.textContent = 'No se encontraron aplicaciones con esos filtros';
        el.style.background = '#fee2e2';
        el.style.color = '#991b1b';
    } else if (cantidad === total) {
        el.textContent = `Mostrando todas las aplicaciones (${cantidad})`;
        el.style.background = '#f1f5f9';
        el.style.color = '#64748b';
    } else {
        el.textContent = `Mostrando ${cantidad} de ${total} aplicaciones`;
        el.style.background = '#dbeafe';
        el.style.color = '#1e40af';
    }
}

// --- Crear card ---

function crearAplicacionCard(aplicacion) {
    const fecha = formatearFecha(aplicacion.fechaAplicacion);
    const estado = aplicacion.estado || 'pendiente';
    const config = ESTADO_CONFIG[estado] || ESTADO_CONFIG['pendiente'];
    const ctaPrincipal = renderCtaPrincipal(aplicacion, estado);

    return renderCardHTML(aplicacion, config, fecha, ctaPrincipal);
}

function renderCtaPrincipal(aplicacion, estado) {
    if (estado === 'pendiente') return renderBotonCancelar(aplicacion, estado);
    if (estado === 'aceptado') return renderBotonContacto(aplicacion);
    if (estado === 'completado') return renderBotonCalificar(aplicacion, estado);
    return '';
}

function renderBotonContacto(aplicacion) {
    const telefono = aplicacion.empleadorTelefono || null;
    if (telefono) return renderWhatsAppLink(aplicacion, telefono);
    const email = aplicacion.empleadorEmail || '';
    if (email) {
        return `<a href="mailto:${escapeHtml(email)}" class="btn btn-primary btn-small">📧 Contactar</a>`;
    }
    return '';
}

function renderWhatsAppLink(aplicacion, telefono) {
    const nombre = aplicacion.empleadorNombre || 'Empleador';
    const limpio = telefono.replace(/\D/g, '');
    const telefonoWA = limpio.startsWith('51') ? limpio : `51${limpio}`;
    const msg = encodeURIComponent(
        `Hola ${nombre}, soy ${state.usuario.nombre || 'el trabajador'} ` +
        `de ChambApp. Mi postulación para "${aplicacion.ofertaTitulo}" fue aceptada.`
    );
    return `<a href="https://wa.me/${telefonoWA}?text=${msg}" target="_blank" class="btn btn-whatsapp btn-small">📱 WhatsApp</a>`;
}

function renderBotonCancelar(aplicacion, estado) {
    if (estado !== 'pendiente') return '';
    const titulo = escapeHtml(aplicacion.ofertaTitulo).replace(/'/g, "\\'");
    return `
        <button class="btn btn-danger btn-small" onclick="cancelarAplicacion('${aplicacion.id}', '${titulo}')">
            ❌ Cancelar Aplicación
        </button>
    `;
}

function renderBotonCalificar(aplicacion, estado) {
    if (estado !== 'completado') return '';

    if (aplicacion.calificadoPorTrabajador) {
        return `<span class="badge-calificado">✓ Calificado</span>`;
    }

    const nombre = escapeHtml(aplicacion.empleadorNombre || 'Empleador').replace(/'/g, "\\'");
    return `
        <button class="btn btn-warning btn-small" onclick="calificarEmpleador('${aplicacion.id}', '${escapeHtml(aplicacion.empleadorEmail)}', '${nombre}')">
            ⭐ Calificar Empleador
        </button>
    `;
}

function crearEmpleadorRatingHTML(empleadorId) {
    const info = state.empleadoresRatings?.[empleadorId];
    if (!info || info.total === 0) return '';

    return `<span class="empleador-rating-badge">
        <span class="rating-estrella">★</span>
        <span class="rating-numero">${info.promedio.toFixed(1)}</span>
        <span class="rating-total">(${info.total})</span>
    </span>`;
}

function renderCardHTML(app, config, fecha, ctaPrincipal) {
    const catKey = app.ofertaCategoria || 'otros';
    const rating = crearEmpleadorRatingHTML(app.empleadorId);
    const salario = app.ofertaSalario
        ? `<span class="aplicacion-sep">·</span><span class="aplicacion-salario-inline">💰 ${escapeHtml(app.ofertaSalario)}</span>`
        : '';

    return `
        <div class="aplicacion-card ${config.clase} touchable hover-lift" onclick="verOfertaCompleta('${app.ofertaId}')">
            <div class="aplicacion-header-compact">
                <div class="aplicacion-titulo">${escapeHtml(app.ofertaTitulo)}</div>
                <span class="estado-badge estado-badge--sm ${config.clase}">${config.icono} ${config.texto}</span>
            </div>
            <div class="aplicacion-meta">
                <span class="aplicacion-categoria ${catKey}">${getCategoriaLabel(app.ofertaCategoria)}</span>
                <span class="aplicacion-sep">·</span>
                <span class="aplicacion-fecha">${fecha}</span>
            </div>
            <div class="aplicacion-meta">
                <span>👤 ${escapeHtml(app.empleadorNombre)} ${rating}</span>
                ${salario}
            </div>
            ${ctaPrincipal ? `<div class="aplicacion-cta" onclick="event.stopPropagation();">${ctaPrincipal}</div>` : ''}
        </div>
    `;
}
