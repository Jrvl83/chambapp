/**
 * Módulo de modal de detalle de ofertas
 * Maneja: ver detalle, formulario de postulación, enviar postulación
 *
 * @module dashboard/modal-detalle
 */

import { doc, getDoc, addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAplicacionesUsuario } from './trabajador.js';
import { fetchEmpleadorRating } from '../utils/employer-rating.js';
import { generarDetalleOfertaHTML } from '../components/oferta-detalle.js';

// ============================================
// VARIABLES DEL MÓDULO
// ============================================
let db = null;
let usuarioActual = null;
let usuarioData = null;

/**
 * Inicializa el módulo con dependencias
 */
export function initModalDetalle(firestore, auth, usuario) {
    db = firestore;
    usuarioActual = auth;
    usuarioData = usuario;
}

/**
 * Actualiza las referencias del usuario
 */
export function setUsuarioRefs(auth, usuario) {
    usuarioActual = auth;
    usuarioData = usuario;
}

// ============================================
// VER DETALLE DE OFERTA
// ============================================

export async function verDetalle(id) {
    try {
        const docRef = doc(db, 'ofertas', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            if (typeof toastError === 'function') {
                toastError('No se encontró la oferta');
            }
            return;
        }

        const oferta = docSnap.data();
        const ratingData = oferta.empleadorId
            ? await fetchEmpleadorRating(db, oferta.empleadorId)
            : { promedio: 0, total: 0 };
        mostrarModalDetalle(oferta, id, ratingData);

    } catch (error) {
        console.error('Error al cargar oferta:', error);
        if (typeof toastError === 'function') {
            toastError('Error al cargar los detalles');
        }
    }
}

function mostrarModalDetalle(oferta, id, ratingData) {
    const esTrabajador = usuarioData && usuarioData.tipo === 'trabajador';
    const aplicaciones = getAplicacionesUsuario();

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = generarDetalleOfertaHTML(oferta, id, ratingData, {
        mostrarPostulacion: esTrabajador,
        yaAplico: aplicaciones.includes(id),
        onPostularFn: 'mostrarFormularioPostulacion',
        onCerrarFn: 'cerrarModal'
    });

    abrirModal();
}

// ============================================
// FORMULARIO DE POSTULACIÓN
// ============================================

export async function mostrarFormularioPostulacion(ofertaId) {
    try {
        const docRef = doc(db, 'ofertas', ofertaId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            if (typeof toastError === 'function') {
                toastError('No se encontró la oferta');
            }
            return;
        }

        const oferta = docSnap.data();
        mostrarFormulario(oferta, ofertaId);

    } catch (error) {
        console.error('Error al mostrar formulario:', error);
        if (typeof toastError === 'function') {
            toastError('Error al cargar el formulario');
        }
    }
}

function mostrarFormulario(oferta, ofertaId) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <h2 style="color: var(--primary); margin-bottom: 0.5rem;">Postular a:</h2>
            <h3 style="color: var(--dark);">${oferta.titulo}</h3>
        </div>

        <div style="margin-bottom: 1.5rem;">
            <label for="mensaje-postulacion" style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--dark);">
                💬 Mensaje para el empleador:
            </label>
            <textarea
                id="mensaje-postulacion"
                placeholder="Preséntate brevemente y explica por qué eres el candidato ideal para esta oferta..."
                style="width: 100%; min-height: 120px; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"
            ></textarea>
            <p style="font-size: 0.875rem; color: var(--gray); margin-top: 0.5rem;">
                Tip: Un buen mensaje aumenta tus posibilidades de ser contactado
            </p>
        </div>

        <div style="background: #fef3c7; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 3px solid #f59e0b;">
            <p style="margin: 0; font-size: 0.9rem; color: #92400e;">
                <strong>📧 Nota:</strong> El empleador verá tu perfil y podrá contactarte directamente.
            </p>
        </div>

        <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-secondary" onclick="verDetalle('${ofertaId}')" style="flex: 1;">
                ← Volver
            </button>
            <button class="btn btn-primary" onclick="enviarPostulacion('${ofertaId}')" id="btn-enviar-postulacion" style="flex: 2;">
                ✉️ Enviar Postulación
            </button>
        </div>
    `;
}

// ============================================
// ENVIAR POSTULACIÓN
// ============================================

export async function enviarPostulacion(ofertaId) {
    const mensaje = document.getElementById('mensaje-postulacion')?.value.trim();

    if (!mensaje) {
        if (typeof toastError === 'function') {
            toastError('Por favor escribe un mensaje');
        }
        return;
    }

    const btnEnviar = document.getElementById('btn-enviar-postulacion');
    const textoOriginal = btnEnviar.innerHTML;

    try {
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = '⏳ Enviando...';

        const oferta = await obtenerOferta(ofertaId);
        if (!oferta) throw new Error('Oferta no encontrada');

        const aplicacion = crearAplicacion(ofertaId, oferta, mensaje);
        await addDoc(collection(db, 'aplicaciones'), aplicacion);

        // Actualizar lista local
        const aplicaciones = getAplicacionesUsuario();
        aplicaciones.push(ofertaId);

        if (typeof toastSuccess === 'function') {
            toastSuccess('¡Postulación enviada exitosamente!');
        }

        cerrarModal();

    } catch (error) {
        console.error('Error al enviar postulación:', error);
        if (typeof toastError === 'function') {
            toastError('Error al enviar postulación');
        }
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = textoOriginal;
    }
}

async function obtenerOferta(ofertaId) {
    const ofertaDoc = await getDoc(doc(db, 'ofertas', ofertaId));
    if (!ofertaDoc.exists()) return null;
    return ofertaDoc.data();
}

function crearAplicacion(ofertaId, oferta, mensaje) {
    return {
        aplicanteId: usuarioActual.uid,
        aplicanteEmail: usuarioActual.email,
        aplicanteNombre: usuarioData?.nombre || 'Trabajador',
        aplicanteTelefono: usuarioData?.telefono || '',

        empleadorId: oferta.empleadorId || '',
        empleadorEmail: oferta.empleadorEmail || '',
        empleadorNombre: oferta.empleadorNombre || 'Empleador',
        empleadorTelefono: oferta.empleadorTelefono || '',

        ofertaId: ofertaId,
        ofertaTitulo: oferta.titulo || '',
        ofertaCategoria: oferta.categoria || '',

        mensaje: mensaje,
        estado: 'pendiente',
        fechaAplicacion: serverTimestamp()
    };
}

// ============================================
// FUNCIONES DEL MODAL
// ============================================

function abrirModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function cerrarModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

export function clickFueraModal(event) {
    if (event.target.id === 'modal-overlay') {
        cerrarModal();
    }
}

// ============================================
// REGISTRAR FUNCIONES GLOBALES
// ============================================

export function registrarFuncionesGlobalesModal() {
    window.verDetalle = verDetalle;
    window.cerrarModal = cerrarModal;
    window.clickFueraModal = clickFueraModal;
    window.mostrarFormularioPostulacion = mostrarFormularioPostulacion;
    window.enviarPostulacion = enviarPostulacion;
}
