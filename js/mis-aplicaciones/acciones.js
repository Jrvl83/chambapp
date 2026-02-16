/**
 * Módulo de acciones sobre aplicaciones
 * Maneja aceptar, rechazar y marcar como completado
 *
 * @module mis-aplicaciones/acciones
 */

import {
    doc,
    updateDoc,
    getDocs,
    serverTimestamp,
    runTransaction,
    collection,
    query,
    where
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { confirmar } from '../components/confirm-modal.js';
import { mensajeErrorAmigable } from '../utils/error-handler.js';

// Referencias inyectadas
let db = null;
let state = null;
let usuario = null;
let callbacks = {};

/**
 * Inicializa el módulo de acciones
 * @param {Object} dbRef - Referencia a Firestore
 * @param {Object} sharedState - Estado compartido
 * @param {Object} usuarioRef - Datos del usuario
 * @param {Object} cbs - Callbacks {recargarUI}
 */
export function initAcciones(dbRef, sharedState, usuarioRef, cbs) {
    db = dbRef;
    state = sharedState;
    usuario = usuarioRef;
    callbacks = cbs;
}

// ============================================
// ACEPTAR APLICACIÓN
// ============================================

async function aceptarAplicacion(aplicacionId, nombreTrabajador) {
    const ok = await confirmar({
        titulo: 'Aceptar postulación',
        mensaje: `¿Deseas aceptar la postulación de <strong>${nombreTrabajador}</strong>?<br><small>Podrás contactarlo por WhatsApp o teléfono.</small>`,
        textoConfirmar: 'Aceptar',
        tipo: 'info'
    });
    if (!ok) return;

    try {
        const aplicacion = state.todasLasAplicaciones.find(a => a.id === aplicacionId);
        if (!aplicacion) return;

        const resultado = await actualizarOfertaAlAceptar(aplicacion, nombreTrabajador);

        await updateDoc(doc(db, 'aplicaciones', aplicacionId), {
            estado: 'aceptado',
            fechaAceptacion: serverTimestamp()
        });

        const mensaje = resultado.vacantes > 1
            ? `¡Aceptado! ${resultado.aceptadosCount} de ${resultado.vacantes} vacantes cubiertas`
            : `¡Postulación de ${nombreTrabajador} aceptada!`;

        if (typeof toastSuccess === 'function') {
            toastSuccess(mensaje);
        }

        aplicacion.estado = 'aceptado';
        if (state.ofertasCache[aplicacion.ofertaId]) {
            state.ofertasCache[aplicacion.ofertaId].aceptadosCount = resultado.aceptadosCount;
        }
        callbacks.recargarUI();
    } catch (error) {
        console.error('Error al aceptar aplicación:', error);
        if (typeof toastError === 'function') {
            const msg = error.message === 'No hay vacantes disponibles'
                ? 'Las vacantes ya fueron cubiertas'
                : mensajeErrorAmigable(error, 'aceptar la postulación');
            toastError(msg);
        }
    }
}

/**
 * Transaction atómica para actualizar la oferta al aceptar un trabajador
 */
async function actualizarOfertaAlAceptar(aplicacion, nombreTrabajador) {
    const ofertaRef = doc(db, 'ofertas', aplicacion.ofertaId);

    return await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ofertaRef);
        const data = snap.data();
        const vacantes = data.vacantes || 1;
        const currentCount = data.aceptadosCount || 0;

        if (currentCount >= vacantes) {
            throw new Error('No hay vacantes disponibles');
        }

        const nuevoCount = currentCount + 1;
        const aceptados = data.trabajadoresAceptados || [];

        aceptados.push({
            id: aplicacion.aplicanteId || aplicacion.trabajadorId,
            nombre: nombreTrabajador,
            fechaAceptacion: new Date().toISOString()
        });

        const updates = {
            aceptadosCount: nuevoCount,
            trabajadoresAceptados: aceptados,
            fechaAceptacion: serverTimestamp()
        };

        if (nuevoCount >= vacantes) {
            updates.estado = 'en_curso';
        }

        if (vacantes === 1) {
            updates.trabajadorAceptadoId = aplicacion.aplicanteId || aplicacion.trabajadorId;
            updates.trabajadorAceptadoNombre = nombreTrabajador;
        }

        transaction.update(ofertaRef, updates);
        return { aceptadosCount: nuevoCount, vacantes };
    });
}

// ============================================
// RECHAZAR APLICACIÓN
// ============================================

async function rechazarAplicacion(aplicacionId, nombreTrabajador) {
    const ok = await confirmar({
        titulo: '¿Rechazar postulación?',
        mensaje: `Se rechazará la postulación de <strong>${nombreTrabajador}</strong>.<br><small>Esta acción no se puede deshacer.</small>`,
        textoConfirmar: 'Rechazar',
        tipo: 'danger'
    });
    if (!ok) return;

    try {
        await updateDoc(doc(db, 'aplicaciones', aplicacionId), {
            estado: 'rechazado',
            fechaRechazo: serverTimestamp()
        });

        if (typeof toastSuccess === 'function') {
            toastSuccess(`Postulación de ${nombreTrabajador} rechazada`);
        } else {
            alert(`Postulación de ${nombreTrabajador} rechazada`);
        }

        const aplicacion = state.todasLasAplicaciones.find(a => a.id === aplicacionId);
        if (aplicacion) {
            aplicacion.estado = 'rechazado';
        }
        callbacks.recargarUI();
    } catch (error) {
        console.error('Error al rechazar aplicación:', error);
        if (typeof toastError === 'function') {
            toastError(mensajeErrorAmigable(error, 'rechazar la postulación'));
        }
    }
}

// ============================================
// MARCAR COMO COMPLETADO
// ============================================

async function marcarCompletado(aplicacionId, nombreTrabajador, tituloOferta) {
    const ok = await confirmar({
        titulo: '¿Trabajo completado?',
        mensaje: `¿El trabajo "<strong>${tituloOferta}</strong>" con ${nombreTrabajador} ha sido completado?<br><small>Después podrás calificar al trabajador.</small>`,
        textoConfirmar: 'Completado',
        tipo: 'info'
    });
    if (!ok) return;

    try {
        const aplicacion = state.todasLasAplicaciones.find(a => a.id === aplicacionId);

        await updateDoc(doc(db, 'aplicaciones', aplicacionId), {
            estado: 'completado',
            fechaCompletado: serverTimestamp()
        });

        if (aplicacion && aplicacion.ofertaId) {
            await verificarTodosCompletados(aplicacion.ofertaId, aplicacionId);
        }

        if (typeof toastSuccess === 'function') {
            toastSuccess(`¡Trabajo completado! Ahora puedes calificar a ${nombreTrabajador}`);
        }

        if (aplicacion) {
            aplicacion.estado = 'completado';
        }
        callbacks.recargarUI();
    } catch (error) {
        console.error('Error al marcar como completado:', error);
        if (typeof toastError === 'function') {
            toastError(mensajeErrorAmigable(error, 'marcar como completado'));
        }
    }
}

/**
 * Verifica si todos los trabajadores aceptados completaron para actualizar la oferta
 */
async function verificarTodosCompletados(ofertaId, aplicacionRecienCompletadaId) {
    const appsQuery = query(
        collection(db, 'aplicaciones'),
        where('ofertaId', '==', ofertaId),
        where('estado', 'in', ['aceptado', 'completado'])
    );
    const snap = await getDocs(appsQuery);

    if (snap.empty) return;

    const todosCompletados = snap.docs.every(d =>
        d.id === aplicacionRecienCompletadaId || d.data().estado === 'completado'
    );

    if (todosCompletados) {
        await updateDoc(doc(db, 'ofertas', ofertaId), {
            estado: 'completada',
            fechaCompletado: serverTimestamp()
        });
    }
}

/**
 * Registra las funciones globales del módulo de acciones
 */
export function registrarFuncionesGlobalesAcciones() {
    window.aceptarAplicacion = aceptarAplicacion;
    window.rechazarAplicacion = rechazarAplicacion;
    window.marcarCompletado = marcarCompletado;
}
