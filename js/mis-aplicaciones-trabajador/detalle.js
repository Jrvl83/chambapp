/**
 * Modal de detalle de oferta y cancelación de aplicaciones
 * @module mis-aplicaciones-trabajador/detalle
 */

import { doc, getDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { escapeHtml } from '../utils/dom-helpers.js';
import { getCategoriaLabel } from './cards.js';
import { fetchEmpleadorRating } from '../utils/employer-rating.js';
import { generarEstrellasHTML } from '../utils/formatting.js';

let db = null;

/**
 * Inicializa el módulo de detalle
 * @param {Object} firestore - Instancia de Firestore
 */
export function initDetalle(firestore) {
    db = firestore;
}

// --- Ver oferta completa ---

export async function verOfertaCompleta(ofertaId) {
    try {
        const docSnap = await getDoc(doc(db, 'ofertas', ofertaId));

        if (!docSnap.exists()) {
            if (typeof toastError === 'function') {
                toastError('No se encontró la oferta');
            } else {
                alert('No se encontró la oferta');
            }
            return;
        }

        const oferta = docSnap.data();
        const ratingData = oferta.empleadorId
            ? await fetchEmpleadorRating(db, oferta.empleadorId)
            : { promedio: 0, total: 0 };
        document.getElementById('modal-body').innerHTML = renderDetalleOferta(oferta, ratingData);
        document.getElementById('modal-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error al cargar oferta:', error);
        if (typeof toastError === 'function') {
            toastError('Error al cargar la oferta');
        }
    }
}

function generarRatingEmpleadorHTML(ratingData) {
    if (!ratingData || ratingData.total === 0) return '';
    return `<span style="display: inline-flex; align-items: center; gap: 0.25rem; margin-left: 0.5rem; background: rgba(245,158,11,0.12); padding: 0.25rem 0.625rem; border-radius: 12px; font-size: 0.8125rem; font-weight: 600;">
        ${generarEstrellasHTML(ratingData.promedio)}
        <span style="color: #92400e; margin-left: 0.125rem;">${ratingData.promedio.toFixed(1)}</span>
        <span style="color: #a16207; font-size: 0.75rem;">(${ratingData.total})</span>
    </span>`;
}

function renderDetalleOferta(oferta, ratingData) {
    const galeria = renderGaleria(oferta.imagenesURLs);
    const ubicacion = oferta.ubicacion?.texto_completo || oferta.ubicacion || 'No especificada';

    return `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <h2 style="color: var(--primary); margin-bottom: 0.5rem;">${escapeHtml(oferta.titulo)}</h2>
            <span style="background: var(--light); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600;">
                ${getCategoriaLabel(oferta.categoria)}
            </span>
        </div>
        ${galeria}
        <div style="margin-bottom: 1.5rem;">
            <h3 style="color: var(--dark); margin-bottom: 0.75rem;">📝 Descripción</h3>
            <p style="color: var(--gray); line-height: 1.6;">${escapeHtml(oferta.descripcion)}</p>
        </div>
        ${renderDetallesGrid(ubicacion, oferta)}
        <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; border-left: 3px solid var(--primary);">
            <strong style="color: var(--primary);">👤 Publicado por:</strong><br>
            <span style="color: var(--dark);">${escapeHtml(oferta.empleadorNombre)}</span>
            ${generarRatingEmpleadorHTML(ratingData)}<br>
            <span style="color: var(--gray); font-size: 0.875rem;">📧 ${escapeHtml(oferta.empleadorEmail)}</span>
        </div>
        <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">
            <button class="btn btn-secondary" onclick="cerrarModal()" style="flex: 1;">Cerrar</button>
        </div>
    `;
}

function renderGaleria(imagenesURLs) {
    if (!imagenesURLs || imagenesURLs.length === 0) return '';
    return `
        <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem;">
                ${imagenesURLs.map((url, i) => `
                    <img src="${url}" alt="Foto ${i + 1}"
                        style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; cursor: pointer; flex-shrink: 0;"
                        onclick="window.open('${url}', '_blank')">
                `).join('')}
            </div>
        </div>
    `;
}

function renderDetallesGrid(ubicacion, oferta) {
    return `
        <div style="background: var(--light); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
            <h3 style="color: var(--dark); margin-bottom: 1rem;">📍 Detalles</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div><strong>📍 Ubicación:</strong><br>${escapeHtml(String(ubicacion))}</div>
                <div><strong>💰 Salario:</strong><br>${escapeHtml(oferta.salario || 'No especificado')}</div>
                <div><strong>⏱️ Duración:</strong><br>${escapeHtml(oferta.duracion || 'No especificada')}</div>
                <div><strong>🕐 Horario:</strong><br>${escapeHtml(oferta.horario || 'No especificado')}</div>
            </div>
        </div>
    `;
}

// --- Cancelar aplicacion ---

export async function cancelarAplicacion(aplicacionId, tituloOferta) {
    const confirmar = confirm(
        `¿Estás seguro que deseas cancelar tu aplicación a:\n\n"${tituloOferta}"?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
        await deleteDoc(doc(db, 'aplicaciones', aplicacionId));

        if (typeof toastSuccess === 'function') {
            toastSuccess('Aplicación cancelada exitosamente');
        } else {
            alert('Aplicación cancelada exitosamente');
        }
        setTimeout(() => location.reload(), 1500);
    } catch (error) {
        console.error('Error al cancelar aplicación:', error);
        if (typeof toastError === 'function') {
            toastError('Error al cancelar la aplicación');
        } else {
            alert('Error al cancelar la aplicación');
        }
    }
}

// --- Modal ---

export function cerrarModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

export function clickFueraModal(event) {
    if (event.target.id === 'modal-overlay') {
        cerrarModal();
    }
}
