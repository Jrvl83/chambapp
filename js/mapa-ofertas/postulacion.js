/**
 * Módulo de postulación desde el mapa
 * Maneja el formulario y envío de postulaciones
 *
 * @module mapa-ofertas/postulacion
 */

import {
    doc,
    getDoc,
    addDoc,
    collection,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Referencias inyectadas
let db = null;
let state = null;

/**
 * Inicializa el módulo de postulación
 * @param {Object} dbRef - Referencia a Firestore
 * @param {Object} sharedState - Estado compartido
 */
export function initPostulacion(dbRef, sharedState) {
    db = dbRef;
    state = sharedState;
}

// ============================================
// MOSTRAR FORMULARIO DE POSTULACIÓN
// ============================================

async function mostrarFormularioPostulacionMapa(ofertaId) {
    try {
        const ofertaData = await obtenerDatosOfertaLocal(ofertaId);
        if (!ofertaData) return;

        const modalBody = document.getElementById('modal-detalle-body');
        modalBody.innerHTML = crearFormularioHTML(ofertaData, ofertaId);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function obtenerDatosOfertaLocal(ofertaId) {
    const oferta = state.ofertasFiltradas.find(o => o.id === ofertaId);
    if (oferta) return oferta.data;

    const docRef = doc(db, 'ofertas', ofertaId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
}

function crearFormularioHTML(ofertaData, ofertaId) {
    return `
        <div class="detalle-header">
            <h2 class="detalle-titulo">Postular a:</h2>
            <h3 style="color: var(--dark); margin-top: 0.5rem;">${ofertaData.titulo}</h3>
        </div>

        <div class="detalle-seccion">
            <label for="mensaje-postulacion-mapa" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                💬 Mensaje para el empleador:
            </label>
            <textarea
                id="mensaje-postulacion-mapa"
                placeholder="Preséntate brevemente y explica por qué eres el candidato ideal para esta oferta..."
                style="width: 100%; min-height: 120px; padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"
            ></textarea>
            <p style="font-size: 0.875rem; color: var(--gray); margin-top: 0.5rem;">
                Tip: Un buen mensaje aumenta tus posibilidades de ser contactado
            </p>
        </div>

        <div style="background: #fef3c7; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 3px solid #f59e0b;">
            <p style="margin: 0; font-size: 0.9rem; color: #92400e;">
                <strong>📧 Nota:</strong> El empleador vera tu perfil y podra contactarte directamente.
            </p>
        </div>

        <div class="detalle-acciones">
            <button class="btn btn-secondary" onclick="verDetalleOferta('${ofertaId}')">
                ← Volver
            </button>
            <button class="btn btn-primary" onclick="enviarPostulacionMapa('${ofertaId}')" id="btn-enviar-postulacion-mapa">
                ✉️ Enviar Postulacion
            </button>
        </div>
    `;
}

// ============================================
// ENVIAR POSTULACIÓN
// ============================================

function crearDatosAplicacion(ofertaId, ofertaData, mensaje) {
    return {
        aplicanteId: state.usuarioActual.uid,
        aplicanteEmail: state.usuarioActual.email,
        aplicanteNombre: state.usuarioData?.nombre || 'Trabajador',
        aplicanteTelefono: state.usuarioData?.telefono || '',
        empleadorId: ofertaData.empleadorId || '',
        empleadorEmail: ofertaData.empleadorEmail || '',
        empleadorNombre: ofertaData.empleadorNombre || 'Empleador',
        empleadorTelefono: ofertaData.empleadorTelefono || '',
        ofertaId,
        ofertaTitulo: ofertaData.titulo || '',
        ofertaCategoria: ofertaData.categoria || '',
        mensaje,
        estado: 'pendiente',
        fechaAplicacion: serverTimestamp()
    };
}

async function enviarPostulacionMapa(ofertaId) {
    const mensaje = document.getElementById('mensaje-postulacion-mapa')?.value.trim();

    if (!mensaje) {
        if (typeof mostrarToast === 'function') {
            mostrarToast('Por favor escribe un mensaje', 'error');
        }
        return;
    }

    const btnEnviar = document.getElementById('btn-enviar-postulacion-mapa');
    const textoOriginal = btnEnviar.innerHTML;

    try {
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = '⏳ Enviando...';

        const ofertaDoc = await getDoc(doc(db, 'ofertas', ofertaId));
        if (!ofertaDoc.exists()) {
            throw new Error('Oferta no encontrada');
        }

        const aplicacion = crearDatosAplicacion(ofertaId, ofertaDoc.data(), mensaje);
        await addDoc(collection(db, 'aplicaciones'), aplicacion);

        state.aplicacionesUsuario.push(ofertaId);

        if (typeof mostrarToast === 'function') {
            mostrarToast('¡Postulacion enviada exitosamente!', 'success');
        }

        window.cerrarModalDetalle();
    } catch (error) {
        console.error('Error al enviar postulacion:', error);
        if (typeof mostrarToast === 'function') {
            mostrarToast('Error al enviar postulacion', 'error');
        }
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = textoOriginal;
    }
}

/**
 * Registra las funciones globales del módulo de postulación
 */
export function registrarFuncionesGlobalesPostulacion() {
    window.mostrarFormularioPostulacionMapa = mostrarFormularioPostulacionMapa;
    window.enviarPostulacionMapa = enviarPostulacionMapa;
}
