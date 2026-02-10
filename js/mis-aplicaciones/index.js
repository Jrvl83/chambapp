/**
 * Módulo principal de mis aplicaciones (empleador)
 * Orquesta los sub-módulos y maneja la carga inicial de datos
 *
 * @module mis-aplicaciones/index
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Sub-módulos
import { initCards } from './cards.js';
import { initAcciones, registrarFuncionesGlobalesAcciones } from './acciones.js';
import {
    initCalificaciones,
    inicializarEventosCalificacion,
    registrarFuncionesGlobalesCalificaciones
} from './calificaciones.js';
import { initFiltros, mostrarAplicaciones, registrarFuncionesGlobalesFiltros } from './filtros.js';

// ============================================
// INICIALIZACIÓN FIREBASE
// ============================================
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================
// VERIFICACIÓN DE USUARIO
// ============================================
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

if (usuario.tipo !== 'empleador') {
    if (typeof toastError === 'function') {
        toastError('Solo los empleadores pueden ver aplicaciones');
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } else {
        alert('Solo los empleadores pueden ver aplicaciones');
        window.location.href = 'dashboard.html';
    }
}

// ============================================
// ESTADO COMPARTIDO
// ============================================
const state = {
    todasLasAplicaciones: [],
    filtroEstadoActual: '',
    trabajadoresRatings: {},
    ofertasCache: {}
};

// ============================================
// INICIALIZAR MÓDULOS
// ============================================
const recargarUI = () => {
    mostrarAplicaciones();
    actualizarEstadisticas();
};

initCards(state);
initFiltros(state);
initAcciones(db, state, usuario, { recargarUI });
initCalificaciones(db, auth, usuario, state, { recargarUI });

// ============================================
// REGISTRAR FUNCIONES GLOBALES
// ============================================
registrarFuncionesGlobalesAcciones();
registrarFuncionesGlobalesCalificaciones();
registrarFuncionesGlobalesFiltros();

// ============================================
// CARGAR DATOS
// ============================================

async function cargarAplicaciones() {
    try {
        const q = query(
            collection(db, 'aplicaciones'),
            where('empleadorEmail', '==', usuario.email)
        );

        const querySnapshot = await getDocs(q);

        const loading = document.getElementById('loading');
        const emptyState = document.getElementById('empty-state');

        loading.style.display = 'none';

        if (querySnapshot.empty) {
            emptyState.style.display = 'block';
            document.getElementById('total-aplicaciones').textContent = '0';
            document.getElementById('pendientes').textContent = '0';
            document.getElementById('aceptados').textContent = '0';
            return;
        }

        state.todasLasAplicaciones = [];
        querySnapshot.forEach((docSnap) => {
            const aplicacion = docSnap.data();
            aplicacion.id = docSnap.id;
            state.todasLasAplicaciones.push(aplicacion);
        });

        await Promise.all([
            cargarRatingsTrabajadores(),
            cargarDatosOfertas()
        ]);

        mostrarAplicaciones();
        actualizarEstadisticas();
    } catch (error) {
        console.error('Error al cargar aplicaciones:', error);
        document.getElementById('loading').innerHTML = `
            <div class="icon" style="font-size: 3rem;">❌</div>
            <p style="color: #ef4444;">Error al cargar las aplicaciones</p>
        `;
    }
}

// ============================================
// CARGAR RATINGS DE TRABAJADORES
// ============================================

async function cargarRatingsTrabajadores() {
    try {
        const emailsUnicos = [...new Set(
            state.todasLasAplicaciones.map(a => a.aplicanteEmail).filter(Boolean)
        )];

        if (emailsUnicos.length === 0) return;

        await cargarRatingsBatch(emailsUnicos.slice(0, 10));

        if (emailsUnicos.length > 10) {
            const emailsRestantes = emailsUnicos.slice(10);
            for (let i = 0; i < emailsRestantes.length; i += 10) {
                await cargarRatingsBatch(emailsRestantes.slice(i, i + 10));
            }
        }
    } catch (error) {
        console.error('Error al cargar ratings de trabajadores:', error);
    }
}

async function cargarRatingsBatch(emails) {
    const batchQuery = query(
        collection(db, 'usuarios'),
        where('email', 'in', emails)
    );
    const snapshot = await getDocs(batchQuery);

    snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.email) {
            state.trabajadoresRatings[data.email] = {
                promedio: data.calificacionPromedio || 0,
                total: data.totalCalificaciones || 0
            };
        }
    });
}

// ============================================
// CARGAR DATOS DE OFERTAS
// ============================================

async function cargarDatosOfertas() {
    try {
        const ofertaIdsUnicos = [...new Set(
            state.todasLasAplicaciones.map(a => a.ofertaId).filter(Boolean)
        )];

        if (ofertaIdsUnicos.length === 0) return;

        for (const ofertaId of ofertaIdsUnicos) {
            const ofertaSnap = await getDoc(doc(db, 'ofertas', ofertaId));
            if (ofertaSnap.exists()) {
                const data = ofertaSnap.data();
                state.ofertasCache[ofertaId] = {
                    vacantes: data.vacantes || 1,
                    aceptadosCount: data.aceptadosCount || 0,
                    estado: data.estado || 'activa'
                };
            }
        }
    } catch (error) {
        console.error('Error al cargar datos de ofertas:', error);
    }
}

// ============================================
// ACTUALIZAR ESTADÍSTICAS
// ============================================

async function actualizarEstadisticas() {
    const total = state.todasLasAplicaciones.length;
    const pendientes = state.todasLasAplicaciones.filter(a => !a.estado || a.estado === 'pendiente').length;
    const aceptados = state.todasLasAplicaciones.filter(a => a.estado === 'aceptado').length;
    const completados = state.todasLasAplicaciones.filter(a => a.estado === 'completado').length;

    document.getElementById('total-aplicaciones').textContent = total;
    document.getElementById('pendientes').textContent = pendientes;
    document.getElementById('aceptados').textContent = aceptados + completados;

    try {
        const ofertasQuery = query(
            collection(db, 'ofertas'),
            where('empleadorEmail', '==', usuario.email)
        );
        const ofertasSnapshot = await getDocs(ofertasQuery);
        document.getElementById('ofertas-activas').textContent = ofertasSnapshot.size;
    } catch (error) {
        console.error('Error al contar ofertas:', error);
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', inicializarEventosCalificacion);
cargarAplicaciones();
