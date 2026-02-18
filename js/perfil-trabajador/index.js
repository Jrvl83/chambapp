// ============================================
// PERFIL TRABAJADOR - ORQUESTADOR
// Modulo: perfil-trabajador/index.js
// ============================================

// Firebase
import { auth, db, storage } from '../config/firebase-init.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { generarEstrellasHTML } from '../utils/formatting.js';
import { validarNombre, validarTelefono, validarEdadMinima, validarHorarios } from '../utils/validators.js';
import { validateField, hideFieldError, showFieldError } from '../utils/form-errors.js';
import { mensajeErrorAmigable, toastErrorConRetry } from '../utils/error-handler.js';

// Modulos
import { initPortfolio, cargarPortfolio, previsualizarPortfolio, subirFotosPortfolio,
         eliminarFotoPortfolio, removerPreviewPortfolio,
         abrirLightbox, cerrarLightbox, navegarLightbox } from './portfolio.js';
import { initResenas, cargarResenasRecibidas,
         abrirModalResponder, cerrarModalResponder, enviarRespuesta } from './resenas.js';
import { initGuardar, guardarPerfil, previsualizarFoto } from './guardar.js';
import { initExpHabilidades, cargarExperiencias, cargarHabilidades,
         agregarExperiencia, cerrarModalExperiencia, guardarExperiencia,
         eliminarExperiencia, agregarHabilidad, agregarHabilidadEnter,
         eliminarHabilidad } from './experiencia-habilidades.js';

// ============================================
// ESTADO COMPARTIDO
// ============================================
const state = {
    perfilData: {},
    experiencias: [],
    habilidades: [],
    fotoFile: null,
    portfolioFiles: [],
    usuario: null,
    uploadingFoto: false,
    uploadingPortfolio: false
};

// ============================================
// VERIFICAR AUTENTICACION CON FIREBASE AUTH
// ============================================
function redirigirLogin() {
    toastError('Debes iniciar sesión');
    setTimeout(() => window.location.href = 'login.html', 1000);
}

function inicializarModulos() {
    initPortfolio(db, storage, auth, state, { onCompletitudChange: calcularCompletitud });
    initResenas(db, auth, state);
    initGuardar(db, storage, auth, state, {
        onSaveComplete: () => { calcularCompletitud(); cargarDatosPersonales(); ocultarSaveFloating(); }
    });
    initExpHabilidades(state);
}

onAuthStateChanged(auth, async (user) => {
    if (!user) { redirigirLogin(); return; }

    const usuarioStr = localStorage.getItem('usuarioChambApp');
    if (!usuarioStr) { redirigirLogin(); return; }

    state.usuario = JSON.parse(usuarioStr);

    if (state.usuario.tipo !== 'trabajador') {
        toastError('Esta página es solo para trabajadores');
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
        return;
    }

    inicializarModulos();
    await cargarPerfil();
    inicializarTabs();
    inicializarEventos();
});

// ============================================
// CARGAR PERFIL DESDE FIRESTORE
// ============================================
async function obtenerOCrearPerfil() {
    const userDocRef = doc(db, 'usuarios', auth.currentUser.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        state.perfilData = docSnap.data();
    } else {
        state.perfilData = {
            email: state.usuario.email,
            nombre: state.usuario.nombre || '',
            telefono: state.usuario.telefono || '',
            tipo: 'trabajador'
        };
        await setDoc(userDocRef, state.perfilData, { merge: true });
    }
}

function cargarTodosLosDatos() {
    cargarDatosPersonales();
    cargarExperiencias();
    cargarHabilidades();
    cargarDisponibilidad();
    cargarPortfolio();
    calcularCompletitud();
    cargarCalificacionPerfil();
    cargarResenasRecibidas();
    cargarStats();
}

async function cargarPerfil() {
    try {
        await obtenerOCrearPerfil();
        cargarTodosLosDatos();
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        toastErrorConRetry(
            mensajeErrorAmigable(error, 'cargar el perfil'),
            () => cargarPerfil()
        );
    }
}

// ============================================
// CARGAR DATOS PERSONALES
// ============================================
function cargarDatosPersonales() {
    document.getElementById('profile-name').textContent = state.perfilData.nombre || 'Usuario';
    document.getElementById('profile-email').textContent = state.perfilData.email || state.usuario.email;

    document.getElementById('nombre').value = state.perfilData.nombre || '';
    document.getElementById('email').value = state.perfilData.email || state.usuario.email;
    document.getElementById('telefono').value = state.perfilData.telefono || '';
    const ubic = state.perfilData.ubicacion;
    const ubicText = typeof ubic === 'object' && ubic
        ? (ubic.texto_completo || ubic.distrito || '') : (ubic || '');
    document.getElementById('ubicacion').value = ubicText;
    document.getElementById('fechaNacimiento').value = state.perfilData.fechaNacimiento || '';
    document.getElementById('bio').value = state.perfilData.bio || '';

    const bioCount = (state.perfilData.bio || '').length;
    document.getElementById('bio-count').textContent = bioCount;

    if (state.perfilData.fotoPerfilURL) {
        document.getElementById('avatar-preview').src = state.perfilData.fotoPerfilURL;
    } else {
        const nombre = state.perfilData.nombre || state.usuario.nombre || 'Usuario';
        document.getElementById('avatar-preview').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&size=150&background=2563eb&color=fff`;
    }
}

// ============================================
// CARGAR DISPONIBILIDAD
// ============================================
function cargarDisponibilidad() {
    const disponibilidad = state.perfilData.disponibilidad || {};

    if (disponibilidad.disponibilidadInmediata !== undefined) {
        document.getElementById('disponibilidad-inmediata').checked = disponibilidad.disponibilidadInmediata;
    }

    const diasDisponibles = disponibilidad.diasDisponibles || [];
    const diasCheckboxes = document.querySelectorAll('.dia-checkbox input[type="checkbox"]');
    diasCheckboxes.forEach(checkbox => {
        checkbox.checked = diasDisponibles.includes(checkbox.value);
    });

    if (disponibilidad.horarioInicio) {
        document.getElementById('horario-inicio').value = disponibilidad.horarioInicio;
    }
    if (disponibilidad.horarioFin) {
        document.getElementById('horario-fin').value = disponibilidad.horarioFin;
    }

    if (disponibilidad.zonasTrabajoPreferidas) {
        document.getElementById('zonas-trabajo').value = disponibilidad.zonasTrabajoPreferidas;
    }
}

// ============================================
// CALCULAR COMPLETITUD
// ============================================
function obtenerCamposCompletitud() {
    return [
        state.perfilData.nombre,
        state.perfilData.telefono,
        state.perfilData.ubicacion,
        state.perfilData.bio,
        state.perfilData.fotoPerfilURL,
        (state.perfilData.categorias && state.perfilData.categorias.length > 0),
        (state.perfilData.habilidades && state.perfilData.habilidades.length > 0),
        (state.perfilData.experiencia && state.perfilData.experiencia.length > 0),
        (state.perfilData.disponibilidad && state.perfilData.disponibilidad.diasDisponibles && state.perfilData.disponibilidad.diasDisponibles.length > 0),
        state.perfilData.añosExperiencia,
        (state.perfilData.portfolioURLs && state.perfilData.portfolioURLs.length > 0)
    ];
}

function calcularCompletitud() {
    const campos = obtenerCamposCompletitud();
    const camposCompletos = campos.filter(campo => campo).length;
    const completitud = Math.round((camposCompletos / campos.length) * 100);

    document.getElementById('completeness-percentage').textContent = `${completitud}%`;
    document.getElementById('progress-fill').style.width = `${completitud}%`;

    if (completitud === 100) {
        document.getElementById('completeness-tip').textContent = '¡Felicidades! Tu perfil está completo 🎉';
        document.getElementById('badge-completado').style.display = 'inline-block';
    } else if (completitud >= 70) {
        document.getElementById('completeness-tip').textContent = '¡Casi listo! Completa algunos campos más';
        document.getElementById('badge-completado').style.display = 'none';
    } else {
        document.getElementById('completeness-tip').textContent = 'Completa tu perfil para recibir más oportunidades';
        document.getElementById('badge-completado').style.display = 'none';
    }
}

// ============================================
// CALIFICACION DEL PERFIL
// ============================================
function cargarCalificacionPerfil() {
    const pill = document.getElementById('badge-calificacion');
    const promedioEl = document.getElementById('perfil-promedio');
    const totalEl = document.getElementById('perfil-total-calificaciones');

    if (!pill) return;

    const promedio = state.perfilData.calificacionPromedio || 0;
    const total = state.perfilData.totalCalificaciones || 0;

    if (total === 0) {
        pill.style.display = 'none';
        return;
    }

    promedioEl.textContent = promedio.toFixed(1);
    totalEl.textContent = `${total} reseña${total !== 1 ? 's' : ''}`;
    pill.style.display = 'inline-flex';
}

async function cargarStats() {
    const statsRow = document.getElementById('perfil-stats-row');
    if (!statsRow || !state.usuario?.email) return;

    try {
        const q = query(
            collection(db, 'aplicaciones'),
            where('email', '==', state.usuario.email),
            where('estado', '==', 'completado')
        );
        const snap = await getDocs(q);
        const completados = snap.docs.map(d => d.data());
        const count = completados.length;

        if (count === 0) return;

        let ingresos = 0;
        let tieneIngresos = false;
        completados.forEach(app => {
            const match = (app.ofertaSalario || '').match(/\d+/);
            if (match) { ingresos += parseInt(match[0], 10); tieneIngresos = true; }
        });

        document.getElementById('stat-completados').textContent = count;
        document.getElementById('stat-ingresos').textContent = tieneIngresos
            ? `S/. ${ingresos.toLocaleString('es-PE')}`
            : '--';
        statsRow.style.display = 'flex';
    } catch (e) {
        // Stats son opcionales, silenciar error
    }
}

// ============================================
// TABS
// ============================================
function inicializarTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// ============================================
// SAVE FLOATING INTELIGENTE
// ============================================
function mostrarSaveFloating() {
    const btn = document.querySelector('.btn-save-floating');
    if (btn) btn.classList.add('visible');
}

function ocultarSaveFloating() {
    const btn = document.querySelector('.btn-save-floating');
    if (btn) btn.classList.remove('visible');
}

function inicializarSaveFloating() {
    const form = document.querySelector('.tabs-container');
    if (!form) return;

    form.addEventListener('input', mostrarSaveFloating);
    form.addEventListener('change', mostrarSaveFloating);
}

// ============================================
// EVENTOS
// ============================================
function inicializarEventosBio() {
    const bioTextarea = document.getElementById('bio');
    bioTextarea.addEventListener('input', (e) => {
        document.getElementById('bio-count').textContent = e.target.value.length;
    });

    const checkboxActual = document.getElementById('exp-actual');
    const inputFin = document.getElementById('exp-fin');
    checkboxActual.addEventListener('change', (e) => {
        inputFin.disabled = e.target.checked;
        if (e.target.checked) inputFin.value = '';
    });
}

function inicializarValidacionEnVivo() {
    const nombre = document.getElementById('nombre');
    const telefono = document.getElementById('telefono');
    const fechaNac = document.getElementById('fechaNacimiento');
    const hFin = document.getElementById('horario-fin');

    if (nombre) nombre.addEventListener('blur', () => {
        validateField('nombre', validarNombre);
    });
    if (telefono) telefono.addEventListener('blur', () => {
        validateField('telefono', validarTelefono);
    });
    if (fechaNac) fechaNac.addEventListener('blur', () => {
        validateField('fechaNacimiento', validarEdadMinima);
    });
    if (hFin) hFin.addEventListener('blur', () => {
        const hInicio = document.getElementById('horario-inicio')?.value || '';
        const result = validarHorarios(hInicio, hFin.value);
        if (!result.valid) showFieldError('horario-fin', result.error);
        else hideFieldError('horario-fin');
    });
}

function inicializarEventos() {
    inicializarEventosBio();
    inicializarSaveFloating();
    inicializarValidacionEnVivo();

    // Cerrar modales con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarLightbox();
            cerrarModalResponder();
        }
    });

    // Contador de caracteres para respuesta de resena
    const respuestaInput = document.getElementById('respuesta-texto');
    if (respuestaInput) {
        respuestaInput.addEventListener('input', (e) => {
            document.getElementById('respuesta-char-count').textContent = e.target.value.length;
        });
    }
}

// ============================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================

// Guardar
window.guardarPerfil = guardarPerfil;
window.previsualizarFoto = previsualizarFoto;

// Portfolio
window.previsualizarPortfolio = previsualizarPortfolio;
window.subirFotosPortfolio = subirFotosPortfolio;
window.eliminarFotoPortfolio = eliminarFotoPortfolio;
window.removerPreviewPortfolio = removerPreviewPortfolio;
window.abrirLightbox = abrirLightbox;
window.cerrarLightbox = cerrarLightbox;
window.navegarLightbox = navegarLightbox;

// Experiencia y Habilidades
window.agregarExperiencia = agregarExperiencia;
window.cerrarModalExperiencia = cerrarModalExperiencia;
window.guardarExperiencia = guardarExperiencia;
window.eliminarExperiencia = eliminarExperiencia;
window.agregarHabilidad = agregarHabilidad;
window.agregarHabilidadEnter = agregarHabilidadEnter;
window.eliminarHabilidad = eliminarHabilidad;

// Resenas
window.abrirModalResponder = abrirModalResponder;
window.cerrarModalResponder = cerrarModalResponder;
window.enviarRespuesta = enviarRespuesta;

// Sesión
window.cerrarSesion = async function () {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error cerrando sesión:', error);
    }
};
