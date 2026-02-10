/**
 * Sistema de calificación de empleadores por trabajadores
 * @module mis-aplicaciones-trabajador/calificaciones
 */

import {
    collection, query, where, getDocs, doc, getDoc,
    addDoc, updateDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { RatingInput, inicializarContadorComentario } from '../components/rating-input.js';

let db = null;
let auth = null;
let state = null;
let callbacks = {};

let calificacionActual = {
    aplicacionId: null,
    empleadorEmail: null,
    empleadorNombre: null,
    ofertaId: null,
    ofertaTitulo: null,
    puntuacion: 0
};

let ratingInput = null;

/**
 * Inicializa el módulo de calificaciones
 * @param {Object} firestore - Instancia de Firestore
 * @param {Object} firebaseAuth - Instancia de Auth
 * @param {Object} sharedState - Estado compartido
 * @param {Object} cbs - Callbacks compartidos
 */
export function initCalificaciones(firestore, firebaseAuth, sharedState, cbs) {
    db = firestore;
    auth = firebaseAuth;
    state = sharedState;
    callbacks = cbs;
}

// --- Inicializar eventos ---

export function inicializarEventosCalificacion() {
    ratingInput = new RatingInput({
        containerId: 'estrellas-input-empleador',
        textoId: 'estrellas-texto-empleador',
        btnEnviarId: 'btn-enviar-calificacion-empleador',
        onSelect: (valor) => { calificacionActual.puntuacion = valor; }
    });

    ratingInput.inicializarEventos();
    inicializarContadorComentario('cal-emp-comentario', 'cal-emp-char-count');

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarModalCalificacion();
    });
}

// --- Abrir modal ---

export function calificarEmpleador(aplicacionId, empleadorEmail, nombreEmpleador) {
    try {
        const aplicacion = state.todasLasAplicaciones.find(a => a.id === aplicacionId);

        if (aplicacion && aplicacion.calificadoPorTrabajador) {
            if (typeof toastInfo === 'function') {
                toastInfo('Ya calificaste a este empleador');
            }
            return;
        }

        calificacionActual = {
            aplicacionId,
            empleadorEmail,
            empleadorNombre: nombreEmpleador,
            ofertaId: aplicacion?.ofertaId || null,
            ofertaTitulo: aplicacion?.ofertaTitulo || 'Trabajo completado',
            puntuacion: 0
        };

        document.getElementById('cal-emp-nombre').textContent = nombreEmpleador;
        document.getElementById('cal-emp-trabajo').textContent = calificacionActual.ofertaTitulo;
        document.getElementById('cal-emp-comentario').value = '';
        document.getElementById('cal-emp-char-count').textContent = '0';

        resetearEstrellas();

        document.getElementById('modal-calificar-empleador').classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error al abrir modal:', error);
        if (typeof toastError === 'function') {
            toastError('Error al cargar el formulario');
        }
    }
}

// --- Cerrar modal ---

export function cerrarModalCalificacion() {
    document.getElementById('modal-calificar-empleador').classList.remove('active');
    document.body.style.overflow = 'auto';
    resetearEstrellas();
    calificacionActual = {
        aplicacionId: null, empleadorEmail: null, empleadorNombre: null,
        ofertaId: null, ofertaTitulo: null, puntuacion: 0
    };
}

// --- Estrellas ---

export function seleccionarEstrella(valor) {
    if (ratingInput) ratingInput.seleccionar(valor);
}

function resetearEstrellas() {
    if (ratingInput) ratingInput.resetear();
    calificacionActual.puntuacion = 0;
}

// --- Enviar calificacion ---

export async function enviarCalificacion() {
    if (calificacionActual.puntuacion === 0) {
        if (typeof toastError === 'function') toastError('Selecciona una calificación');
        return;
    }

    const btnEnviar = document.getElementById('btn-enviar-calificacion-empleador');
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '⏳ Enviando...';

    try {
        const { empleadorId, empleadorData } = await buscarEmpleador();
        const aplicacionData = await obtenerAplicacionData();
        const calificacionData = buildCalificacionData(empleadorId, aplicacionData);

        const calificacionRef = await addDoc(collection(db, 'calificaciones'), calificacionData);
        await marcarAplicacionCalificada(calificacionRef.id);

        // El promedio se actualiza automaticamente via Cloud Function
        actualizarUILocal(calificacionRef.id);

        const nombre = calificacionActual.empleadorNombre;
        cerrarModalCalificacion();
        if (typeof toastSuccess === 'function') {
            toastSuccess(`¡Gracias por calificar a ${nombre}!`);
        }

        if (callbacks.recargarUI) callbacks.recargarUI();
    } catch (error) {
        console.error('Error al enviar calificación:', error);
        if (typeof toastError === 'function') {
            toastError('Error al enviar la calificación. Intenta de nuevo.');
        }
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = '⭐ Enviar Calificación';
    }
}

// --- Helpers de envío ---

async function buscarEmpleador() {
    const q = query(
        collection(db, 'usuarios'),
        where('email', '==', calificacionActual.empleadorEmail)
    );
    const snap = await getDocs(q);

    if (snap.empty) return { empleadorId: null, empleadorData: null };

    const empleadorDoc = snap.docs[0];
    return { empleadorId: empleadorDoc.id, empleadorData: empleadorDoc.data() };
}

async function obtenerAplicacionData() {
    const ref = doc(db, 'aplicaciones', calificacionActual.aplicacionId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : {};
}

function buildCalificacionData(empleadorId, aplicacionData) {
    return {
        aplicacionId: calificacionActual.aplicacionId,
        trabajadorId: auth.currentUser?.uid || null,
        trabajadorEmail: state.usuario.email,
        trabajadorNombre: state.usuario.nombre || 'Trabajador',
        empleadorId,
        empleadorEmail: calificacionActual.empleadorEmail,
        empleadorNombre: calificacionActual.empleadorNombre,
        ofertaId: calificacionActual.ofertaId,
        ofertaTitulo: calificacionActual.ofertaTitulo,
        ofertaCategoria: aplicacionData?.ofertaCategoria || '',
        puntuacion: calificacionActual.puntuacion,
        comentario: document.getElementById('cal-emp-comentario').value.trim(),
        tipo: 'trabajador_a_empleador',
        fechaCalificacion: serverTimestamp(),
        fechaTrabajoCompletado: aplicacionData?.fechaCompletado || null,
        respuesta: null,
        fechaRespuesta: null
    };
}

async function marcarAplicacionCalificada(calificacionId) {
    const ref = doc(db, 'aplicaciones', calificacionActual.aplicacionId);
    await updateDoc(ref, {
        calificadoPorTrabajador: true,
        calificacionTrabajadorId: calificacionId
    });
}

function actualizarUILocal(calificacionId) {
    const aplicacion = state.todasLasAplicaciones.find(
        a => a.id === calificacionActual.aplicacionId
    );
    if (aplicacion) {
        aplicacion.calificadoPorTrabajador = true;
        aplicacion.calificacionTrabajadorId = calificacionId;
    }
}
