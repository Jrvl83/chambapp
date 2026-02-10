/**
 * Módulo del sistema de calificaciones
 * Maneja el modal de calificación, envío y detalle de reseñas
 *
 * @module mis-aplicaciones/calificaciones
 */

import {
    doc,
    getDoc,
    updateDoc,
    addDoc,
    getDocs,
    collection,
    query,
    where,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { formatearFecha, generarEstrellasHTML } from '../utils/formatting.js';
import {
    RatingInput,
    inicializarContadorComentario,
    configurarCierreModal
} from '../components/rating-input.js';

// Referencias inyectadas
let db = null;
let auth = null;
let usuario = null;
let state = null;
let callbacks = {};

// Estado del modal de calificación
let calificacionActual = {
    aplicacionId: null,
    trabajadorEmail: null,
    trabajadorNombre: null,
    ofertaId: null,
    ofertaTitulo: null,
    puntuacion: 0
};

// Instancia del componente de rating
const ratingInputTrabajador = new RatingInput({
    containerId: 'estrellas-input',
    textoId: 'estrellas-texto',
    btnEnviarId: 'btn-enviar-calificacion',
    onSelect: (valor) => {
        calificacionActual.puntuacion = valor;
    }
});

/**
 * Inicializa el módulo de calificaciones
 * @param {Object} dbRef - Referencia a Firestore
 * @param {Object} authRef - Referencia a Firebase Auth
 * @param {Object} usuarioRef - Datos del usuario
 * @param {Object} sharedState - Estado compartido
 * @param {Object} cbs - Callbacks {recargarUI}
 */
export function initCalificaciones(dbRef, authRef, usuarioRef, sharedState, cbs) {
    db = dbRef;
    auth = authRef;
    usuario = usuarioRef;
    state = sharedState;
    callbacks = cbs;
}

// ============================================
// ABRIR MODAL DE CALIFICACIÓN
// ============================================

async function calificarTrabajador(aplicacionId, trabajadorEmail, nombreTrabajador) {
    try {
        const aplicacion = state.todasLasAplicaciones.find(a => a.id === aplicacionId);

        if (aplicacion && aplicacion.calificado) {
            if (typeof toastInfo === 'function') {
                toastInfo('Ya calificaste a este trabajador');
            } else {
                alert('Ya calificaste a este trabajador');
            }
            return;
        }

        calificacionActual = {
            aplicacionId,
            trabajadorEmail,
            trabajadorNombre: nombreTrabajador,
            ofertaId: aplicacion?.ofertaId || null,
            ofertaTitulo: aplicacion?.ofertaTitulo || 'Trabajo completado',
            puntuacion: 0
        };

        document.getElementById('cal-nombre').textContent = nombreTrabajador;
        document.getElementById('cal-trabajo').textContent = calificacionActual.ofertaTitulo;
        document.getElementById('cal-comentario').value = '';
        document.getElementById('cal-char-count').textContent = '0';

        resetearEstrellas();

        document.getElementById('modal-calificacion').classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error al abrir modal de calificacion:', error);
        if (typeof toastError === 'function') {
            toastError('Error al cargar el formulario de calificacion');
        }
    }
}

// ============================================
// CERRAR MODAL
// ============================================

function cerrarModalCalificacion() {
    document.getElementById('modal-calificacion').classList.remove('active');
    document.body.style.overflow = 'auto';
    resetearEstrellas();
    calificacionActual = {
        aplicacionId: null,
        trabajadorEmail: null,
        trabajadorNombre: null,
        ofertaId: null,
        ofertaTitulo: null,
        puntuacion: 0
    };
}

// ============================================
// ESTRELLAS
// ============================================

function seleccionarEstrella(valor) {
    ratingInputTrabajador.seleccionar(valor);
}

function resetearEstrellas() {
    ratingInputTrabajador.resetear();
    calificacionActual.puntuacion = 0;
}

// ============================================
// ENVIAR CALIFICACIÓN
// ============================================

async function buscarTrabajadorPorEmail(email) {
    const trabajadoresQuery = query(
        collection(db, 'usuarios'),
        where('email', '==', email)
    );
    const snap = await getDocs(trabajadoresQuery);

    if (snap.empty) return { id: null, data: null };

    const trabajadorDoc = snap.docs[0];
    return { id: trabajadorDoc.id, data: trabajadorDoc.data() };
}

function crearDatosCalificacion(trabajadorId, aplicacionData, comentario) {
    return {
        aplicacionId: calificacionActual.aplicacionId,
        trabajadorId,
        trabajadorEmail: calificacionActual.trabajadorEmail,
        trabajadorNombre: calificacionActual.trabajadorNombre,
        empleadorId: usuario.uid || auth.currentUser?.uid,
        empleadorEmail: usuario.email,
        empleadorNombre: usuario.nombre || 'Empleador',
        ofertaId: calificacionActual.ofertaId,
        ofertaTitulo: calificacionActual.ofertaTitulo,
        ofertaCategoria: aplicacionData?.ofertaCategoria || '',
        puntuacion: calificacionActual.puntuacion,
        comentario,
        fechaCalificacion: serverTimestamp(),
        fechaTrabajoCompletado: aplicacionData?.fechaCompletado || null
    };
}

async function enviarCalificacion() {
    if (calificacionActual.puntuacion === 0) {
        if (typeof toastError === 'function') {
            toastError('Selecciona una calificacion');
        }
        return;
    }

    const btnEnviar = document.getElementById('btn-enviar-calificacion');
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '⏳ Enviando...';

    try {
        const comentario = document.getElementById('cal-comentario').value.trim();
        const { id: trabajadorId } = await buscarTrabajadorPorEmail(calificacionActual.trabajadorEmail);

        const aplicacionRef = doc(db, 'aplicaciones', calificacionActual.aplicacionId);
        const aplicacionSnap = await getDoc(aplicacionRef);
        const aplicacionData = aplicacionSnap.data();

        const calificacionData = crearDatosCalificacion(trabajadorId, aplicacionData, comentario);
        const calificacionRef = await addDoc(collection(db, 'calificaciones'), calificacionData);

        await updateDoc(aplicacionRef, {
            calificado: true,
            calificacionId: calificacionRef.id
        });

        if (trabajadorId) {
            await actualizarPromedioTrabajador(trabajadorId, calificacionActual.puntuacion);
        }

        actualizarEstadoLocal(calificacionRef.id);

        cerrarModalCalificacion();
        if (typeof toastSuccess === 'function') {
            toastSuccess(`¡Gracias por calificar a ${calificacionActual.trabajadorNombre}!`);
        } else {
            alert(`¡Gracias por calificar a ${calificacionActual.trabajadorNombre}!`);
        }

        callbacks.recargarUI();
    } catch (error) {
        console.error('Error al enviar calificacion:', error);
        if (typeof toastError === 'function') {
            toastError('Error al enviar la calificacion. Intenta de nuevo.');
        } else {
            alert('Error al enviar la calificacion');
        }
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = 'Enviar Calificacion';
    }
}

function actualizarEstadoLocal(calificacionId) {
    const aplicacion = state.todasLasAplicaciones.find(a => a.id === calificacionActual.aplicacionId);
    if (aplicacion) {
        aplicacion.calificado = true;
        aplicacion.calificacionId = calificacionId;
    }
}

// ============================================
// ACTUALIZAR PROMEDIO DEL TRABAJADOR
// ============================================

async function actualizarPromedioTrabajador(trabajadorId, nuevaPuntuacion) {
    try {
        const trabajadorRef = doc(db, 'usuarios', trabajadorId);
        const trabajadorSnap = await getDoc(trabajadorRef);

        if (!trabajadorSnap.exists()) return;

        const data = trabajadorSnap.data();
        const promedioActual = data.calificacionPromedio || 0;
        const totalActual = data.totalCalificaciones || 0;

        const nuevoTotal = totalActual + 1;
        const sumaTotal = (promedioActual * totalActual) + nuevaPuntuacion;
        const nuevoPromedio = Number((sumaTotal / nuevoTotal).toFixed(2));

        const distribucion = data.distribucionCalificaciones || {
            "5": 0, "4": 0, "3": 0, "2": 0, "1": 0
        };
        distribucion[String(nuevaPuntuacion)] = (distribucion[String(nuevaPuntuacion)] || 0) + 1;

        await updateDoc(trabajadorRef, {
            calificacionPromedio: nuevoPromedio,
            totalCalificaciones: nuevoTotal,
            distribucionCalificaciones: distribucion
        });
    } catch (error) {
        console.error('Error al actualizar promedio:', error);
    }
}

// ============================================
// VER DETALLE DE CALIFICACIONES
// ============================================

async function cargarCalificacionesTrabajador(emailTrabajador) {
    const calificacionesQuery = query(
        collection(db, 'calificaciones'),
        where('trabajadorEmail', '==', emailTrabajador)
    );
    const snapshot = await getDocs(calificacionesQuery);

    const calificaciones = [];
    snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (!data.tipo || data.tipo === 'empleador_a_trabajador') {
            calificaciones.push({ id: docSnap.id, ...data });
        }
    });

    calificaciones.sort((a, b) => {
        const fechaA = a.fechaCalificacion?.toDate?.() || new Date(0);
        const fechaB = b.fechaCalificacion?.toDate?.() || new Date(0);
        return fechaB - fechaA;
    });

    return calificaciones;
}

function renderResumenCalificaciones(ratingInfo) {
    return `
        <div class="detalle-resumen">
            <div class="detalle-promedio">
                <span class="promedio-numero">${ratingInfo.promedio.toFixed(1)}</span>
                <div class="promedio-estrellas">${generarEstrellasHTML(ratingInfo.promedio)}</div>
                <span class="promedio-total">${ratingInfo.total} calificación${ratingInfo.total !== 1 ? 'es' : ''}</span>
            </div>
        </div>
    `;
}

function renderResenaCard(cal) {
    const fecha = formatearFecha(cal.fechaCalificacion, 'absoluto');
    return `
        <div class="detalle-resena-card">
            <div class="detalle-resena-header">
                <div class="detalle-resena-info">
                    <span class="detalle-resena-empleador">👤 ${cal.empleadorNombre || 'Empleador'}</span>
                    <span class="detalle-resena-trabajo">${cal.ofertaTitulo || 'Trabajo'}</span>
                </div>
                <div class="detalle-resena-rating">
                    ${generarEstrellasHTML(cal.puntuacion)}
                    <span class="detalle-resena-fecha">${fecha}</span>
                </div>
            </div>
            ${cal.comentario ? `
                <div class="detalle-resena-comentario">
                    <p>"${cal.comentario}"</p>
                </div>
            ` : ''}
            ${cal.respuesta ? `
                <div class="detalle-resena-respuesta">
                    <span class="respuesta-label">Respuesta del trabajador:</span>
                    <p>"${cal.respuesta}"</p>
                </div>
            ` : ''}
        </div>
    `;
}

function renderListaResenas(calificaciones) {
    if (calificaciones.length === 0) {
        return `
            <div class="detalle-sin-resenas">
                <p>📋 Este trabajador aún no tiene reseñas detalladas</p>
            </div>
        `;
    }

    let html = '<div class="detalle-lista-resenas">';
    calificaciones.forEach(cal => {
        html += renderResenaCard(cal);
    });
    html += '</div>';
    return html;
}

async function verDetalleCalificaciones(emailTrabajador, nombreTrabajador) {
    try {
        const modal = document.getElementById('modal-detalle-calificaciones');
        const contenido = document.getElementById('detalle-calificaciones-contenido');

        if (!modal || !contenido) {
            console.error('Modal de detalle no encontrado');
            return;
        }

        contenido.innerHTML = `
            <div class="loading-calificaciones">
                <div class="spinner-small"></div>
                <p>Cargando calificaciones...</p>
            </div>
        `;

        document.getElementById('detalle-nombre-trabajador').textContent = nombreTrabajador;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        const ratingInfo = state.trabajadoresRatings[emailTrabajador] || { promedio: 0, total: 0 };
        const calificaciones = await cargarCalificacionesTrabajador(emailTrabajador);

        contenido.innerHTML = renderResumenCalificaciones(ratingInfo) + renderListaResenas(calificaciones);
    } catch (error) {
        console.error('Error al cargar detalle de calificaciones:', error);
        const contenido = document.getElementById('detalle-calificaciones-contenido');
        if (contenido) {
            contenido.innerHTML = `
                <div class="error-calificaciones">
                    <p>❌ Error al cargar las calificaciones</p>
                </div>
            `;
        }
    }
}

function cerrarModalDetalleCalificaciones() {
    const modal = document.getElementById('modal-detalle-calificaciones');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ============================================
// INICIALIZACIÓN DE EVENTOS
// ============================================

export function inicializarEventosCalificacion() {
    ratingInputTrabajador.inicializarEventos();
    inicializarContadorComentario('cal-comentario', 'cal-char-count');
    configurarCierreModal('modal-calificacion', cerrarModalCalificacion);
}

/**
 * Registra las funciones globales del módulo de calificaciones
 */
export function registrarFuncionesGlobalesCalificaciones() {
    window.calificarTrabajador = calificarTrabajador;
    window.cerrarModalCalificacion = cerrarModalCalificacion;
    window.seleccionarEstrella = seleccionarEstrella;
    window.enviarCalificacion = enviarCalificacion;
    window.verDetalleCalificaciones = verDetalleCalificaciones;
    window.cerrarModalDetalleCalificaciones = cerrarModalDetalleCalificaciones;
}
