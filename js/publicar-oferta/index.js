/**
 * Módulo principal de publicar oferta
 * Orquesta todos los sub-módulos y maneja la inicialización
 *
 * @module publicar-oferta/index
 */

// ============================================
// IMPORTS
// ============================================
import { auth, db, storage } from '../config/firebase-init.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { verificarBloqueo } from '../utils/auth-guard.js';

// Módulos del formulario
import { initFormNavigation, showStep, validateStep } from './form-navigation.js';
import {
    initFotos,
    subirFotosOferta,
    eliminarFotosMarcadas,
    cargarFotosExistentes,
    actualizarReviewFotos,
    getFotosExistentes
} from './fotos.js';
import {
    inicializarUbicacion,
    inicializarMapaPreview,
    inicializarAutocomplete,
    obtenerUbicacionCompleta,
    precargarUbicacion,
    cargarProvincias,
    cargarDistritos,
    seleccionarDistritoHandler,
    initUbicacionGlobals
} from './ubicacion.js';
import { initSubmit, cargarOfertaParaEditar } from './submit.js';

// ============================================
// VERIFICAR AUTENTICACIÓN
// ============================================
const usuarioStr = localStorage.getItem('usuarioChambApp');
if (!usuarioStr) {
    if (typeof toastError === 'function') {
        toastError('Debes iniciar sesión para publicar ofertas');
        setTimeout(() => window.location.href = 'login.html', 1000);
    } else {
        alert('Debes iniciar sesión para publicar ofertas');
        window.location.href = 'login.html';
    }
}

const usuario = JSON.parse(usuarioStr || '{}');

// Verificar que sea empleador
if (usuario.tipo !== 'empleador') {
    if (typeof toastError === 'function') {
        toastError('Solo los empleadores pueden publicar ofertas');
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } else {
        alert('Solo los empleadores pueden publicar ofertas');
        window.location.href = 'dashboard.html';
    }
}

// ============================================
// DETECTAR MODO
// ============================================
const urlParams = new URLSearchParams(window.location.search);
const ofertaId = urlParams.get('id');
const reutilizarId = urlParams.get('reutilizar');
const modoEdicion = !!ofertaId;
const modoReutilizar = !!reutilizarId;

// ============================================
// ESTADO COMPARTIDO
// ============================================
const state = {
    // Firebase
    auth,
    db,
    storage,

    // Usuario
    usuario,

    // Modo
    modoEdicion,
    modoReutilizar,
    ofertaId: ofertaId || reutilizarId,

    // Navegación
    currentStep: 1,
    totalSteps: 4,

    // Elementos DOM
    elements: {
        formSteps: document.querySelectorAll('.form-step'),
        progressSteps: document.querySelectorAll('.progress-steps .step'),
        progressFill: document.getElementById('progressFill'),
        currentStepDisplay: document.getElementById('currentStep'),
        btnPrevious: document.getElementById('btnPrevious'),
        btnNext: document.getElementById('btnNext'),
        btnSubmit: document.getElementById('btnSubmit'),
        formOferta: document.getElementById('formOferta')
    },

    // Callbacks entre módulos
    callbacks: {
        showStep,
        validateStep,
        obtenerUbicacionCompleta,
        precargarUbicacion,
        actualizarReviewFotos,
        subirFotosOferta,
        eliminarFotosMarcadas,
        cargarFotosExistentes,
        getFotosExistentes
    }
};

// ============================================
// INICIALIZACIÓN
// ============================================

// Inicializar módulos
initFormNavigation(state);
initFotos(storage);
initSubmit(state);
initUbicacionGlobals();

// Mostrar primer paso
showStep(state.currentStep);

// Inicializar ubicación y cargar datos (con check bloqueado)
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    const bloqueado = await verificarBloqueo(db, auth, user.uid);
    if (bloqueado) return;

    await inicializarUbicacion();

    // Cargar datos si es modo edición/reutilizar
    if (modoEdicion) {
        await cargarOfertaParaEditar(ofertaId);
    } else if (modoReutilizar) {
        await cargarOfertaParaEditar(reutilizarId);
    }
});

// Inicializar Google Maps con delay
setTimeout(async () => {
    try {
        await inicializarMapaPreview();
        await inicializarAutocomplete();
    } catch {
        // El formulario sigue funcionando sin el mapa
    }
}, 500);

// ============================================
// EXPONER FUNCIONES GLOBALES
// ============================================
window.cargarProvincias = cargarProvincias;
window.cargarDistritos = cargarDistritos;
window.seleccionarDistrito = seleccionarDistritoHandler;
