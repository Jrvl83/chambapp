/**
 * Módulo principal del dashboard
 * Orquesta todos los sub-módulos y maneja la inicialización
 *
 * @module dashboard/index
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { escapeHtml } from '../utils/dom-helpers.js';
import { confirmar } from '../components/confirm-modal.js';

// Módulos del dashboard
import {
    initGeolocation,
    verificarUbicacion,
    registrarFuncionesGlobalesUbicacion,
    setFiltrosComponent,
    setOnUbicacionActualizada
} from './geolocation.js';

import {
    initTrabajador,
    cargarAplicacionesUsuario,
    cargarOfertasTrabajador,
    cargarEstadisticasTrabajador,
    inicializarFiltrosAvanzados,
    registrarFuncionesGlobalesFiltros,
    getFiltrosComponent,
    setCategoriasTrabajador,
    reordenarConNuevaUbicacion
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

import { initReportarModal } from '../components/reportar-modal.js';

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
initReportarModal();
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
    const nombreCompleto = usuario.nombre || 'Usuario';
    const partes = nombreCompleto.trim().split(/\s+/);
    const nombreMostrado = partes.slice(0, 2).join(' ');

    const elNombre = document.getElementById('header-nombre');
    if (elNombre) elNombre.textContent = nombreMostrado;

    const avatarCircle = document.getElementById('avatar-circle');
    if (!avatarCircle) return;

    const fotoURL = usuario.fotoPerfilURL || usuario.photoURL || usuario.foto;
    if (fotoURL) {
        avatarCircle.innerHTML = `<img src="${fotoURL}" alt="${escapeHtml(nombreMostrado)}" class="avatar-img">`;
    } else {
        const iniciales = partes.slice(0, 2).map(p => p[0].toUpperCase()).join('');
        avatarCircle.innerHTML = `<span class="avatar-iniciales">${iniciales}</span>`;
    }
}

function initDropdownMenu(usuario) {
    const btnAvatar = document.getElementById('btn-avatar');
    const dropdown = document.getElementById('usuario-dropdown');
    if (!btnAvatar || !dropdown) return;

    btnAvatar.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = !dropdown.hidden;
        dropdown.hidden = isOpen;
        btnAvatar.setAttribute('aria-expanded', String(!isOpen));
        btnAvatar.classList.toggle('btn-avatar--open', !isOpen);
    });

    document.addEventListener('click', () => {
        if (!dropdown.hidden) {
            dropdown.hidden = true;
            btnAvatar.setAttribute('aria-expanded', 'false');
            btnAvatar.classList.remove('btn-avatar--open');
        }
    });

    const linkPerfil = document.getElementById('link-mi-perfil');
    if (linkPerfil) {
        linkPerfil.href = usuario.tipo === 'empleador'
            ? 'perfil-empleador.html'
            : 'perfil-trabajador.html';
    }

    if (usuario.tipo === 'empleador') {
        const row = document.getElementById('dropdown-ubicacion-row');
        const divider = document.getElementById('dropdown-divider-ubicacion');
        if (row) row.hidden = true;
        if (divider) divider.hidden = true;
    }

    const btnRefresh = document.getElementById('btn-refresh-ubicacion');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', (e) => {
            e.stopPropagation();
            window.actualizarUbicacionManual();
        });
    }

    const btnCerrar = document.getElementById('btn-dropdown-cerrar-sesion');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', async (e) => {
            e.stopPropagation();
            dropdown.hidden = true;
            const ok = await confirmar({
                titulo: '¿Cerrar sesión?',
                mensaje: 'Tu sesión se cerrará en este dispositivo.',
                textoConfirmar: 'Cerrar sesión',
                tipo: 'warning'
            });
            if (ok) window.cerrarSesion();
        });
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

            // Verificar si el usuario está bloqueado por el admin
            if (usuario.bloqueado) {
                await signOut(auth);
                window.location.href = 'login.html?bloqueado=1';
                return;
            }

            usuarioData = usuario;
            const tipoUsuario = usuario.tipo || 'trabajador';

            // Actualizar referencias en módulos
            initEmpleador(db, usuario, user);
            setUsuarioData(usuario);
            setUsuarioRefs(user, usuario);
            setUsuarioActual(user);
            setCategoriasTrabajador(usuario.categorias || []);
            setOnUbicacionActualizada(reordenarConNuevaUbicacion);

            // Actualizar UI
            actualizarHeaderUsuario(usuario);
            initDropdownMenu(usuario);
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
