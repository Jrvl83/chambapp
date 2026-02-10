/**
 * Orquestador principal de mis-aplicaciones-trabajador
 * @module mis-aplicaciones-trabajador/index
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore, collection, query, where, getDocs, orderBy
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

import { initCards, mostrarAplicaciones } from './cards.js';
import { initDetalle, verOfertaCompleta, cancelarAplicacion, cerrarModal, clickFueraModal } from './detalle.js';
import {
    initCalificaciones, inicializarEventosCalificacion,
    calificarEmpleador, cerrarModalCalificacion,
    seleccionarEstrella, enviarCalificacion
} from './calificaciones.js';
import { fetchEmpleadoresRatings } from '../utils/employer-rating.js';

// --- Firebase ---
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Auth check ---
const usuarioStr = localStorage.getItem('usuarioChambApp');
if (!usuarioStr) {
    if (typeof toastError === 'function') {
        toastError('Debes iniciar sesion');
        setTimeout(() => window.location.href = 'login.html', 1000);
    } else {
        alert('Debes iniciar sesion');
        window.location.href = 'login.html';
    }
}

const usuario = JSON.parse(usuarioStr || '{}');

if (usuario.tipo !== 'trabajador') {
    if (typeof toastError === 'function') {
        toastError('Esta pagina es solo para trabajadores');
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } else {
        alert('Esta pagina es solo para trabajadores');
        window.location.href = 'dashboard.html';
    }
}

// --- Estado compartido ---
const state = {
    todasLasAplicaciones: [],
    aplicacionesFiltradas: [],
    empleadoresRatings: {},
    usuario
};

// --- Inicializar módulos ---
initCards(state);
initDetalle(db);
initCalificaciones(db, auth, state, { recargarUI });

function recargarUI() {
    mostrarAplicaciones(state.aplicacionesFiltradas);
}

// --- Cargar aplicaciones ---
async function cargarAplicaciones() {
    try {
        const q = query(
            collection(db, 'aplicaciones'),
            where('aplicanteEmail', '==', usuario.email),
            orderBy('fechaAplicacion', 'desc')
        );

        const querySnapshot = await getDocs(q);
        document.getElementById('loading-screen').style.display = 'none';

        if (querySnapshot.empty) {
            document.getElementById('empty-state').style.display = 'block';
            actualizarEstadisticas(0, 0, 0, 0);
            return;
        }

        state.todasLasAplicaciones = [];
        querySnapshot.forEach((docSnap) => {
            state.todasLasAplicaciones.push({ id: docSnap.id, ...docSnap.data() });
        });

        const stats = calcularStats(state.todasLasAplicaciones);
        actualizarEstadisticas(stats.total, stats.pendientes, stats.aceptados, stats.completados);

        state.aplicacionesFiltradas = [...state.todasLasAplicaciones];
        await cargarRatingsEmpleadores();
        mostrarAplicaciones(state.aplicacionesFiltradas);
    } catch (error) {
        console.error('Error al cargar aplicaciones:', error);
        document.getElementById('loading-screen').innerHTML = `
            <div class="empty-icon">❌</div>
            <h2>Error al cargar</h2>
            <p>Ocurrió un error al cargar tus postulaciones. Intenta nuevamente.</p>
        `;
    }
}

async function cargarRatingsEmpleadores() {
    try {
        const idsUnicos = [...new Set(
            state.todasLasAplicaciones
                .map(a => a.empleadorId)
                .filter(Boolean)
        )];
        if (idsUnicos.length === 0) return;

        const ratings = await fetchEmpleadoresRatings(db, idsUnicos);
        Object.assign(state.empleadoresRatings, ratings);
    } catch (error) {
        console.error('Error al cargar ratings de empleadores:', error);
    }
}

function calcularStats(aplicaciones) {
    return {
        total: aplicaciones.length,
        pendientes: aplicaciones.filter(a => !a.estado || a.estado === 'pendiente').length,
        aceptados: aplicaciones.filter(a => a.estado === 'aceptado').length,
        completados: aplicaciones.filter(a => a.estado === 'completado').length
    };
}

function actualizarEstadisticas(total, pendientes, aceptados, completados) {
    document.getElementById('total-aplicaciones').textContent = total;
    document.getElementById('pendientes').textContent = pendientes;
    document.getElementById('aceptados').textContent = aceptados;
    document.getElementById('completados').textContent = completados;
}

// --- Filtros ---
function aplicarFiltros() {
    const filtroEstado = document.getElementById('filtro-estado').value;
    const filtroCategoria = document.getElementById('filtro-categoria').value;

    state.aplicacionesFiltradas = state.todasLasAplicaciones.filter(a => {
        const estado = a.estado || 'pendiente';
        const coincideEstado = !filtroEstado || estado === filtroEstado;
        const coincideCategoria = !filtroCategoria || a.ofertaCategoria === filtroCategoria;
        return coincideEstado && coincideCategoria;
    });

    mostrarAplicaciones(state.aplicacionesFiltradas);
}

function limpiarFiltros() {
    document.getElementById('filtro-estado').value = '';
    document.getElementById('filtro-categoria').value = '';
    state.aplicacionesFiltradas = [...state.todasLasAplicaciones];
    mostrarAplicaciones(state.aplicacionesFiltradas);
}

// --- Window globals (para onclick en HTML) ---
window.verOfertaCompleta = verOfertaCompleta;
window.cancelarAplicacion = cancelarAplicacion;
window.aplicarFiltros = aplicarFiltros;
window.limpiarFiltros = limpiarFiltros;
window.cerrarModal = cerrarModal;
window.clickFueraModal = clickFueraModal;
window.calificarEmpleador = calificarEmpleador;
window.cerrarModalCalificacionEmpleador = cerrarModalCalificacion;
window.seleccionarEstrellaEmpleador = seleccionarEstrella;
window.enviarCalificacionEmpleador = enviarCalificacion;

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', inicializarEventosCalificacion);
cargarAplicaciones();
