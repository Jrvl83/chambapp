/**
 * Modal de detalle de oferta y cancelación de aplicaciones
 * @module mis-aplicaciones-trabajador/detalle
 */

import { doc, getDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { fetchEmpleadorRating } from '../utils/employer-rating.js';
import { generarDetalleOfertaHTML } from '../components/oferta-detalle.js';

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

        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = generarDetalleOfertaHTML(oferta, ofertaId, ratingData, {
            mostrarEmail: true,
            onCerrarFn: 'cerrarModal'
        });

        document.getElementById('modal-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error al cargar oferta:', error);
        if (typeof toastError === 'function') {
            toastError('Error al cargar la oferta');
        }
    }
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
