/**
 * Renderizado de cards de aplicaciones del trabajador
 * @module mis-aplicaciones-trabajador/cards
 */

import { formatearFecha, generarEstrellasHTML } from '../utils/formatting.js';
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

    const seccionContacto = renderContacto(aplicacion, estado);
    const botonCancelar = renderBotonCancelar(aplicacion, estado);
    const botonCalificar = renderBotonCalificar(aplicacion, estado);

    return renderCardHTML(aplicacion, config, fecha, seccionContacto, botonCancelar, botonCalificar);
}

function renderContacto(aplicacion, estado) {
    if (estado !== 'aceptado' && estado !== 'completado') return '';

    const nombre = aplicacion.empleadorNombre || 'Empleador';
    const email = aplicacion.empleadorEmail || '';
    const telefono = aplicacion.empleadorTelefono || null;

    const mensajeWA = encodeURIComponent(
        `Hola ${nombre}, soy ${state.usuario.nombre || 'el trabajador'} de ChambApp. Mi postulación para "${aplicacion.ofertaTitulo}" fue aceptada. ¿Cuándo podemos coordinar?`
    );

    let telefonoWA = '';
    if (telefono) {
        const limpio = telefono.replace(/\D/g, '');
        telefonoWA = limpio.startsWith('51') ? limpio : `51${limpio}`;
    }

    return `
        <div class="contacto-empleador ${estado}">
            <div class="contacto-header">
                <span class="contacto-titulo">📞 Contacta al empleador</span>
            </div>
            ${renderDatosContacto(nombre, email, telefono)}
            ${renderAccionesContacto(telefono, telefonoWA, mensajeWA, email)}
        </div>
    `;
}

function renderDatosContacto(nombre, email, telefono) {
    return `
        <div class="contacto-datos">
            <div class="dato-item">
                <span class="dato-label">Nombre:</span>
                <span class="dato-valor">${escapeHtml(nombre)}</span>
            </div>
            <div class="dato-item">
                <span class="dato-label">Email:</span>
                <span class="dato-valor">${escapeHtml(email)}</span>
            </div>
            ${telefono ? `
            <div class="dato-item">
                <span class="dato-label">Teléfono:</span>
                <span class="dato-valor">${escapeHtml(telefono)}</span>
            </div>` : ''}
        </div>
    `;
}

function renderAccionesContacto(telefono, telefonoWA, mensajeWA, email) {
    return `
        <div class="contacto-acciones">
            ${telefono ? `
                <a href="https://wa.me/${telefonoWA}?text=${mensajeWA}" target="_blank" class="btn btn-whatsapp">📱 WhatsApp</a>
                <a href="tel:${escapeHtml(telefono)}" class="btn btn-primary">📞 Llamar</a>
            ` : ''}
            <a href="mailto:${escapeHtml(email)}" class="btn btn-secondary">📧 Email</a>
        </div>
    `;
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
        return `
            <div class="estado-calificado-empleador">
                <span class="calificacion-mostrada">
                    <span class="estrella-filled">★</span> Ya calificaste
                </span>
            </div>
        `;
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

function renderCardHTML(app, config, fecha, contacto, btnCancelar, btnCalificar) {
    return `
        <div class="aplicacion-card ${config.clase} touchable hover-lift">
            <div class="aplicacion-header">
                <div class="aplicacion-info">
                    <div class="aplicacion-titulo">${escapeHtml(app.ofertaTitulo)}</div>
                    <span class="aplicacion-categoria">${getCategoriaLabel(app.ofertaCategoria)}</span>
                    <div class="aplicacion-empleador">👤 ${escapeHtml(app.empleadorNombre)} ${crearEmpleadorRatingHTML(app.empleadorId)}</div>
                </div>
                <div class="aplicacion-estado">
                    <span class="estado-badge ${config.clase}">
                        ${config.icono} ${config.texto}
                    </span>
                    <span class="aplicacion-fecha">📅 ${fecha}</span>
                </div>
            </div>
            <div class="estado-descripcion ${config.clase}">${config.descripcion}</div>
            ${contacto}
            <div class="aplicacion-mensaje">
                <strong>💬 Tu mensaje:</strong>
                <p>${escapeHtml(app.mensaje || '')}</p>
            </div>
            <div class="aplicacion-actions">
                <button class="btn btn-primary btn-small" onclick="verOfertaCompleta('${app.ofertaId}')">
                    👁️ Ver Oferta
                </button>
                ${btnCancelar}
                ${btnCalificar}
            </div>
        </div>
    `;
}
