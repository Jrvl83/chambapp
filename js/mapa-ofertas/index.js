/**
 * Módulo principal del mapa de ofertas
 * Orquesta los sub-módulos, maneja auth y carga de datos
 *
 * @module mapa-ofertas/index
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    doc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Sub-módulos
import { initMapa, inicializarMapa, registrarFuncionesGlobalesMapa } from './mapa.js';
import { initMarkers, aplicarFiltrosMapa, registrarFuncionesGlobalesMarkers } from './markers.js';
import { initDetalle, registrarFuncionesGlobalesDetalle } from './detalle.js';
import { initPostulacion, registrarFuncionesGlobalesPostulacion } from './postulacion.js';
import { initReportarModal } from '../components/reportar-modal.js';
import { manejarBloqueado } from '../utils/auth-guard.js';

// ============================================
// INICIALIZACIÓN FIREBASE
// ============================================
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================
// ESTADO COMPARTIDO
// ============================================
const state = {
    mapa: null,
    markers: [],
    markerClusterer: null,
    todasLasOfertas: [],
    ofertasFiltradas: [],
    ofertaSeleccionada: null,
    ubicacionUsuario: null,
    usuarioActual: null,
    usuarioData: null,
    infoWindowActivo: null,
    aplicacionesUsuario: []
};

// Callbacks compartidos entre módulos
const callbacks = {};

// ============================================
// INICIALIZAR MÓDULOS
// ============================================
initMapa(state, callbacks);
initMarkers(state, callbacks);
initDetalle(db, state, callbacks);
initPostulacion(db, state);
initReportarModal();

// ============================================
// REGISTRAR FUNCIONES GLOBALES
// ============================================
registrarFuncionesGlobalesMapa();
registrarFuncionesGlobalesMarkers();
registrarFuncionesGlobalesDetalle();
registrarFuncionesGlobalesPostulacion();

// ============================================
// CARGA DE DATOS
// ============================================

async function cargarOfertas() {
    try {
        const q = query(
            collection(db, 'ofertas'),
            where('estado', '==', 'activa'),
            orderBy('fechaCreacion', 'desc'),
            limit(100)
        );

        const snapshot = await getDocs(q);
        state.todasLasOfertas = [];
        const ahora = new Date();

        snapshot.forEach((docSnap) => {
            const oferta = docSnap.data();

            if (oferta.fechaExpiracion) {
                const fechaExp = oferta.fechaExpiracion.toDate
                    ? oferta.fechaExpiracion.toDate()
                    : new Date(oferta.fechaExpiracion);
                if (fechaExp < ahora) return;
            }

            if (oferta.ubicacion?.coordenadas?.lat && oferta.ubicacion?.coordenadas?.lng) {
                state.todasLasOfertas.push({
                    id: docSnap.id,
                    data: oferta,
                    lat: oferta.ubicacion.coordenadas.lat,
                    lng: oferta.ubicacion.coordenadas.lng
                });
            }
        });

        aplicarFiltrosMapa();
    } catch (error) {
        console.error('Error al cargar ofertas:', error);
    }
}

async function cargarAplicacionesUsuario(userId) {
    try {
        const q = query(
            collection(db, 'aplicaciones'),
            where('aplicanteId', '==', userId)
        );
        const snapshot = await getDocs(q);
        state.aplicacionesUsuario = snapshot.docs.map(d => d.data().ofertaId);
    } catch (error) {
        console.error('Error cargando aplicaciones:', error);
    }
}

async function obtenerUbicacionGuardada(uid) {
    try {
        const userDoc = await getDoc(doc(db, 'usuarios', uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.ubicacion?.lat && data.ubicacion?.lng) {
                return {
                    lat: data.ubicacion.lat,
                    lng: data.ubicacion.lng,
                    distrito: data.ubicacion.distrito
                };
            }
        }
        return null;
    } catch (error) {
        console.error('Error obteniendo ubicacion guardada:', error);
        return null;
    }
}

// ============================================
// UI
// ============================================

function personalizarPorTipo(tipo) {
    const navPublicar = document.getElementById('nav-publicar');
    const navTrabajadores = document.getElementById('nav-trabajadores');
    const navTrabajadoresText = document.getElementById('nav-trabajadores-text');
    const navPerfil = document.getElementById('nav-perfil');

    if (tipo === 'trabajador') {
        if (navPublicar) navPublicar.style.display = 'none';
        if (navTrabajadores) navTrabajadores.href = 'mis-aplicaciones-trabajador.html';
        if (navTrabajadoresText) navTrabajadoresText.textContent = 'Mis Aplicaciones';
        if (navPerfil) navPerfil.href = 'perfil-trabajador.html';
    } else {
        if (navPublicar) navPublicar.style.display = 'flex';
        if (navTrabajadores) navTrabajadores.href = 'mis-aplicaciones.html';
        if (navTrabajadoresText) navTrabajadoresText.textContent = 'Ver Candidatos';
        if (navPerfil) navPerfil.href = 'perfil-empleador.html';
    }
}

// ============================================
// FUNCIONES GLOBALES
// ============================================

window.toggleMenu = function () {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
};

window.cerrarSesion = async function () {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error:', error);
    }
};

// ============================================
// VERIFICACIÓN DE AUTENTICACIÓN
// ============================================

onAuthStateChanged(auth, async (user) => {
    if (user) {
        state.usuarioActual = user;

        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
            state.usuarioData = userDoc.data();

            if (state.usuarioData.bloqueado) {
                await manejarBloqueado(auth);
                return;
            }

            if (state.usuarioData.tipo === 'empleador') {
                window.location.href = 'dashboard.html';
                return;
            }

            const userName = document.getElementById('user-name');
            if (userName) {
                userName.textContent = state.usuarioData.nombre || 'Usuario';
            }

            personalizarPorTipo(state.usuarioData.tipo || 'trabajador');

            state.ubicacionUsuario = await obtenerUbicacionGuardada(user.uid);
            await cargarAplicacionesUsuario(user.uid);

            await inicializarMapa();
            await cargarOfertas();
        } else {
            window.location.href = 'login.html';
        }
    } else {
        window.location.href = 'login.html';
    }
});
