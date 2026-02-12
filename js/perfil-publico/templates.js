// ============================================
// PERFIL PUBLICO - TEMPLATES HTML
// Modulo: perfil-publico/templates.js
// Funciones puras: datos → HTML string
// ============================================

import { escapeHtml } from '../utils/dom-helpers.js';
import { generarEstrellasHTML, formatearFecha } from '../utils/formatting.js';

// ============================================
// PORTFOLIO
// ============================================
export function renderPortfolio(urls) {
    return urls.map((url, i) =>
        `<div class="pp-portfolio-item" onclick="abrirLightboxPublico(${i})">
            <img src="${escapeHtml(url)}" alt="Trabajo ${i + 1}" loading="lazy">
        </div>`
    ).join('');
}

// ============================================
// HABILIDADES
// ============================================
export function renderSkills(habilidades) {
    return habilidades.map(h =>
        `<span class="pp-habilidad-tag">${escapeHtml(h)}</span>`
    ).join('');
}

// ============================================
// EXPERIENCIA
// ============================================
function renderExpItem(exp) {
    const empresa = exp.empresa
        ? `<div class="pp-experiencia-empresa">${escapeHtml(exp.empresa)}</div>`
        : '';
    const desc = exp.descripcion
        ? `<div class="pp-experiencia-descripcion">${escapeHtml(exp.descripcion)}</div>`
        : '';

    return `
        <div class="pp-experiencia-item">
            <div class="pp-experiencia-puesto">${escapeHtml(exp.puesto || '')}</div>
            ${empresa}
            <div class="pp-experiencia-periodo">${escapeHtml(exp.periodo || '')}</div>
            ${desc}
        </div>`;
}

export function renderExperiencia(experiencias) {
    return experiencias.map(renderExpItem).join('');
}

// ============================================
// REVIEWS SUMMARY
// ============================================
function renderDistribucionBars(distribucion, total) {
    let html = '';
    for (let i = 5; i >= 1; i--) {
        const count = distribucion[String(i)] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        html += `
            <div class="distribucion-row">
                <span class="distribucion-label">${i} ★</span>
                <div class="distribucion-barra">
                    <div class="distribucion-fill" style="width: ${pct}%"></div>
                </div>
                <span class="distribucion-count">${count}</span>
            </div>`;
    }
    return html;
}

export function renderReviewsSummary(promedio, total, distribucion) {
    const estrellas = generarEstrellasHTML(promedio);
    const distHTML = total >= 3
        ? `<div class="resumen-distribucion">${renderDistribucionBars(distribucion, total)}</div>`
        : '';

    return `
        <div class="pp-reviews-summary-inner">
            <div class="pp-reviews-promedio">
                <span class="promedio-numero">${promedio.toFixed(1)}</span>
                <div class="promedio-estrellas">${estrellas}</div>
                <span class="promedio-total">${total} reseña${total !== 1 ? 's' : ''}</span>
            </div>
            ${distHTML}
        </div>`;
}

// ============================================
// REVIEW CARDS
// ============================================
function renderReviewCard(resena) {
    const fecha = formatearFecha(resena.fechaCalificacion, 'relativo');
    const estrellas = generarEstrellasHTML(resena.puntuacion);

    const comentario = resena.comentario
        ? `<div class="pp-review-comentario"><p>"${escapeHtml(resena.comentario)}"</p></div>`
        : '';

    const respuesta = resena.respuesta
        ? `<div class="pp-review-respuesta">
               <span class="respuesta-label">Respuesta del trabajador:</span>
               <p>"${escapeHtml(resena.respuesta)}"</p>
           </div>`
        : '';

    return `
        <div class="pp-review-card">
            ${renderReviewHeader(resena, estrellas, fecha)}
            ${comentario}
            ${respuesta}
        </div>`;
}

function renderReviewHeader(resena, estrellas, fecha) {
    return `
        <div class="pp-review-header">
            <div class="pp-review-empleador">
                <div class="pp-review-avatar">👤</div>
                <div class="pp-review-info">
                    <span class="pp-review-nombre">${escapeHtml(resena.empleadorNombre || 'Empleador')}</span>
                    <span class="pp-review-trabajo">${escapeHtml(resena.ofertaTitulo || 'Trabajo')}</span>
                </div>
            </div>
            <div class="pp-review-meta">
                <div class="pp-review-estrellas">${estrellas}</div>
                <span class="pp-review-fecha">${fecha}</span>
            </div>
        </div>`;
}

export function renderReviewsList(resenas) {
    return resenas.map(renderReviewCard).join('');
}

// ============================================
// DISPONIBILIDAD
// ============================================
function renderDiasPills(dias) {
    const labels = {
        'lunes': 'Lun', 'martes': 'Mar', 'miercoles': 'Mie',
        'jueves': 'Jue', 'viernes': 'Vie', 'sabado': 'Sab', 'domingo': 'Dom'
    };
    return dias.map(d =>
        `<span class="pp-dia-pill">${labels[d] || d}</span>`
    ).join('');
}

function renderFilaDisponibilidad(label, valueHTML) {
    return `
        <div class="pp-disponibilidad-row">
            <span class="pp-disponibilidad-label">${label}</span>
            ${valueHTML}
        </div>`;
}

export function renderDisponibilidad(disp) {
    let html = '';

    if (disp.disponibilidadInmediata) {
        html += renderFilaDisponibilidad('Estado:',
            '<span class="pp-disponibilidad-value pp-disponible-text">Disponibilidad inmediata</span>');
    }

    if (disp.diasDisponibles && disp.diasDisponibles.length > 0) {
        html += renderFilaDisponibilidad('Dias:',
            `<div class="pp-dias-pills">${renderDiasPills(disp.diasDisponibles)}</div>`);
    }

    if (disp.horarioInicio || disp.horarioFin) {
        const inicio = disp.horarioInicio || '--:--';
        const fin = disp.horarioFin || '--:--';
        html += renderFilaDisponibilidad('Horario:',
            `<span class="pp-disponibilidad-value">${inicio} - ${fin}</span>`);
    }

    if (disp.zonasTrabajoPreferidas) {
        html += renderFilaDisponibilidad('Zonas:',
            `<span class="pp-disponibilidad-value">${escapeHtml(disp.zonasTrabajoPreferidas)}</span>`);
    }

    return html;
}
