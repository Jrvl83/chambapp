/**
 * Módulo principal del dashboard
 * Orquesta todos los sub-módulos y maneja la inicialización
 *
 * @module dashboard/index
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Módulos del dashboard
import {
    initGeolocation,
    verificarUbicacion,
    registrarFuncionesGlobalesUbicacion,
    setFiltrosComponent
} from './geolocation.js';

import {
    initTrabajador,
    cargarAplicacionesUsuario,
    cargarOfertasTrabajador,
    cargarEstadisticasTrabajador,
    inicializarFiltrosAvanzados,
    registrarFuncionesGlobalesFiltros,
    getFiltrosComponent
} from './trabajador.js';

import {
    initEmpleador,
    cargarDashboardEmpleador,
    registrarFuncionesGlobalesEmpleador,
    setUsuarioData
} from './empleador.js';

import {
    initModalDetalle,
    registrarFuncionesGlobalesModal,
    setUsuarioRefs
} from './modal-detalle.js';

import {
    initNotificacionesPush,
    inicializarNotificacionesPush,
    escucharNotificacionesNoLeidas,
    registrarFuncionesGlobalesNotificaciones,
    setUsuarioActual
} from './notificaciones-push.js';

// ============================================
// INICIALIZACIÓN FIREBASE
// ============================================
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================
// VARIABLES GLOBALES
// ============================================
let usuarioActual = null;
let usuarioData = null;

// ============================================
// INICIALIZAR MÓDULOS
// ============================================
initGeolocation(db);
initTrabajador(db);
initEmpleador(db, null, null);
initModalDetalle(db, null, null);
initNotificacionesPush(app, db);

// ============================================
// REGISTRAR FUNCIONES GLOBALES
// ============================================
registrarFuncionesGlobalesFiltros();
registrarFuncionesGlobalesEmpleador();
registrarFuncionesGlobalesModal();
registrarFuncionesGlobalesNotificaciones();

// ============================================
// FUNCIONES DE UI
// ============================================

function actualizarHeaderUsuario(usuario) {
    const userName = document.getElementById('user-name');
    if (userName) {
        const nombreCompleto = usuario.nombre || 'Usuario';
        const primerNombre = nombreCompleto.split(' ')[0];
        userName.innerHTML = `Hola, ${primerNombre}`;
        userName.title = nombreCompleto;
    }
}

function personalizarPorTipo(tipo) {
    const elementos = obtenerElementosNavegacion();
    const vistas = obtenerVistas();

    if (tipo === 'trabajador') {
        configurarVistaTrabajador(elementos, vistas);
    } else {
        configurarVistaEmpleador(elementos, vistas);
    }

    if (typeof BottomNav !== 'undefined' && BottomNav.setUserRole) {
        BottomNav.setUserRole(tipo);
    }
}

function obtenerElementosNavegacion() {
    return {
        navPublicar: document.getElementById('nav-publicar'),
        navBuscar: document.getElementById('nav-buscar'),
        navMapa: document.getElementById('nav-mapa'),
        navTrabajadores: document.getElementById('nav-trabajadores'),
        navTrabajadoresText: document.getElementById('nav-trabajadores-text'),
        navPerfil: document.getElementById('nav-perfil'),
        bottomNavProfile: document.querySelector('.bottom-nav-item[data-page="profile"]')
    };
}

function obtenerVistas() {
    return {
        trabajador: document.getElementById('dashboard-trabajador'),
        empleador: document.getElementById('dashboard-empleador')
    };
}

function configurarVistaTrabajador(el, vistas) {
    if (vistas.trabajador) vistas.trabajador.style.display = 'block';
    if (vistas.empleador) vistas.empleador.style.display = 'none';

    if (el.navPublicar) el.navPublicar.style.display = 'none';
    if (el.navBuscar) el.navBuscar.style.display = 'flex';
    if (el.navMapa) el.navMapa.style.display = 'flex';
    if (el.navTrabajadores) {
        el.navTrabajadores.href = 'mis-aplicaciones-trabajador.html';
        el.navTrabajadores.querySelector('.icon').textContent = '📋';
    }
    if (el.navTrabajadoresText) el.navTrabajadoresText.textContent = 'Mis Aplicaciones';
    if (el.navPerfil) el.navPerfil.href = 'perfil-trabajador.html';
    if (el.bottomNavProfile) el.bottomNavProfile.href = 'perfil-trabajador.html';
}

function configurarVistaEmpleador(el, vistas) {
    if (vistas.trabajador) vistas.trabajador.style.display = 'none';
    if (vistas.empleador) vistas.empleador.style.display = 'block';

    if (el.navPublicar) el.navPublicar.style.display = 'flex';
    if (el.navBuscar) el.navBuscar.style.display = 'none';
    if (el.navMapa) el.navMapa.style.display = 'none';
    if (el.navTrabajadores) {
        el.navTrabajadores.href = 'mis-aplicaciones.html';
        el.navTrabajadores.querySelector('.icon').textContent = '👥';
    }
    if (el.navTrabajadoresText) el.navTrabajadoresText.textContent = 'Ver Candidatos';
    if (el.navPerfil) el.navPerfil.href = 'perfil-empleador.html';
    if (el.bottomNavProfile) el.bottomNavProfile.href = 'perfil-empleador.html';
}

function ocultarLoading() {
    const loading = document.getElementById('loading-screen');
    if (loading) loading.style.display = 'none';
}

// ============================================
// VERIFICAR PARÁMETRO DE OFERTA EN URL
// ============================================

function verificarParametroOferta() {
    const ofertaId = sessionStorage.getItem('abrirOferta');

    if (ofertaId) {
        sessionStorage.removeItem('abrirOferta');

        setTimeout(() => {
            if (typeof window.verDetalle === 'function') {
                window.verDetalle(ofertaId);
            }
        }, 500);
    }
}

// ============================================
// FUNCIONES GLOBALES
// ============================================

window.irABuscar = function () {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');

    const filtros = document.querySelector('.filtros-container');
    if (filtros) {
        filtros.scrollIntoView({ behavior: 'smooth', block: 'start' });

        setTimeout(() => {
            const inputBusqueda = document.getElementById('filtro-busqueda');
            if (inputBusqueda) {
                inputBusqueda.focus();
            }
        }, 500);
    }
};

window.cerrarSesion = async function () {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error:', error);
    }
};

window.toggleMenu = function () {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
};

// ============================================
// VERIFICACIÓN DE AUTENTICACIÓN
// ============================================

onAuthStateChanged(auth, async (user) => {
    if (user) {
        usuarioActual = user;
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));

        if (userDoc.exists()) {
            const usuario = userDoc.data();
            usuarioData = usuario;
            const tipoUsuario = usuario.tipo || 'trabajador';

            // Actualizar referencias en módulos
            initEmpleador(db, usuario, user);
            setUsuarioData(usuario);
            setUsuarioRefs(user, usuario);
            setUsuarioActual(user);

            // Actualizar UI
            actualizarHeaderUsuario(usuario);
            personalizarPorTipo(tipoUsuario);

            // Cargar datos según tipo
            if (tipoUsuario === 'trabajador') {
                await cargarDatosTrabajador(user.uid, tipoUsuario);
            } else {
                await cargarDashboardEmpleador(usuario, user.uid);
            }

            ocultarLoading();

            // Inicializar notificaciones
            inicializarNotificacionesPush(user.uid);
            escucharNotificacionesNoLeidas(user.uid);

            // Verificar parámetro de URL
            verificarParametroOferta();

            // Registrar funciones de ubicación
            registrarFuncionesGlobalesUbicacion(user);

        } else {
            manejarErrorPerfil();
        }
    } else {
        window.location.href = 'login.html';
    }
});

async function cargarDatosTrabajador(uid, tipoUsuario) {
    await verificarUbicacion(uid, tipoUsuario);
    await cargarAplicacionesUsuario(uid);
    await cargarOfertasTrabajador();
    await cargarEstadisticasTrabajador(uid);

    inicializarFiltrosAvanzados();

    // Conectar filtros con geolocation
    const filtrosComponent = getFiltrosComponent();
    if (filtrosComponent) {
        setFiltrosComponent(filtrosComponent);
    }
}

function manejarErrorPerfil() {
    if (typeof toastError === 'function') {
        toastError('Error al cargar perfil');
        setTimeout(() => window.location.href = 'login.html', 1000);
    } else {
        window.location.href = 'login.html';
    }
}
