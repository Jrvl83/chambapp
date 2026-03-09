// ============================================
// HISTORIAL DE CALIFICACIONES - Task 16
// ChambApp - Ver calificaciones dadas y recibidas
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { formatearFecha, generarEstrellasHTML } from './utils/formatting.js';
import { verificarBloqueo } from './utils/auth-guard.js';
import { escapeHtml } from './utils/dom-helpers.js';

// Inicializar Firebase
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variables globales
let usuario = null;
let todasLasCalificaciones = {
    recibidas: [],
    dadas: []
};
let tipoActual = 'recibidas';

// Verificar autenticación
const usuarioStr = localStorage.getItem('usuarioChambApp');
if (!usuarioStr) {
    if (typeof toastError === 'function') {
        toastError('Debes iniciar sesión');
    }
    setTimeout(() => window.location.href = 'login.html', 1000);
}

usuario = JSON.parse(usuarioStr || '{}');

// Solo trabajadores pueden ver este historial
if (usuario.tipo !== 'trabajador') {
    if (typeof toastError === 'function') {
        toastError('Esta página es solo para trabajadores');
    }
    setTimeout(() => window.location.href = 'dashboard.html', 1000);
}

// Esperar autenticación
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const bloqueado = await verificarBloqueo(db, auth, user.uid);
        if (bloqueado) return;
        await cargarHistorial();
    }
});

// ============================================
// CARGAR HISTORIAL
// ============================================
async function cargarHistorial() {
    try {
        // Cargar calificaciones recibidas (donde trabajadorId == uid y tipo = empleador_a_trabajador)
        const qRecibidas = query(
            collection(db, 'calificaciones'),
            where('trabajadorId', '==', auth.currentUser.uid),
            orderBy('fechaCalificacion', 'desc')
        );

        const snapRecibidas = await getDocs(qRecibidas);
        todasLasCalificaciones.recibidas = [];
        snapRecibidas.forEach(doc => {
            const data = doc.data();
            // Solo incluir las que son de empleador a trabajador (o sin tipo para retrocompatibilidad)
            if (!data.tipo || data.tipo === 'empleador_a_trabajador') {
                todasLasCalificaciones.recibidas.push({ id: doc.id, ...data });
            }
        });

        // Cargar calificaciones dadas (donde trabajadorId == uid y tipo = trabajador_a_empleador)
        const qDadas = query(
            collection(db, 'calificaciones'),
            where('trabajadorId', '==', auth.currentUser.uid),
            where('tipo', '==', 'trabajador_a_empleador'),
            orderBy('fechaCalificacion', 'desc')
        );

        try {
            const snapDadas = await getDocs(qDadas);
            todasLasCalificaciones.dadas = [];
            snapDadas.forEach(doc => {
                todasLasCalificaciones.dadas.push({ id: doc.id, ...doc.data() });
            });
        } catch (error) {
            // Si falla por índice, mostrar array vacío
            console.log('Aún no hay calificaciones dadas o índice pendiente');
            todasLasCalificaciones.dadas = [];
        }

        document.getElementById('loading').style.display = 'none';
        mostrarCalificaciones();

    } catch (error) {
        console.error('Error al cargar historial:', error);
        document.getElementById('loading').innerHTML = `
            <div class="empty-icon">!</div>
            <h2>Configurando historial...</h2>
            <p>Por favor, intenta de nuevo en unos minutos</p>
        `;
    }
}

// ============================================
// CAMBIAR TAB
// ============================================
function cambiarTab(tipo) {
    tipoActual = tipo;

    document.querySelectorAll('.historial-tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tipo === tipo);
    });

    mostrarCalificaciones();
}

// ============================================
// APLICAR FILTROS
// ============================================
function aplicarFiltros() {
    mostrarCalificaciones();
}

function limpiarFiltros() {
    document.getElementById('filtro-puntuacion').value = '';
    document.getElementById('filtro-fecha').value = '';
    mostrarCalificaciones();
}

// ============================================
// MOSTRAR CALIFICACIONES
// ============================================
function mostrarCalificaciones() {
    const container = document.getElementById('calificaciones-container');
    const emptyState = document.getElementById('empty-state');

    let calificaciones = [...todasLasCalificaciones[tipoActual]];

    // Aplicar filtros
    const filtroPuntuacion = document.getElementById('filtro-puntuacion').value;
    const filtroFecha = document.getElementById('filtro-fecha').value;

    if (filtroPuntuacion) {
        calificaciones = calificaciones.filter(c => c.puntuacion === parseInt(filtroPuntuacion));
    }

    if (filtroFecha) {
        const dias = parseInt(filtroFecha);
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - dias);

        calificaciones = calificaciones.filter(c => {
            const fecha = c.fechaCalificacion?.toDate ? c.fechaCalificacion.toDate() : new Date(c.fechaCalificacion);
            return fecha >= fechaLimite;
        });
    }

    if (calificaciones.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        document.getElementById('empty-titulo').textContent =
            tipoActual === 'recibidas' ? 'No has recibido calificaciones' : 'No has dado calificaciones';
        document.getElementById('empty-mensaje').textContent =
            tipoActual === 'recibidas' ? 'Completa trabajos para recibir calificaciones' : 'Califica a los empleadores con los que trabajaste';
        return;
    }

    container.style.display = 'flex';
    emptyState.style.display = 'none';
    container.innerHTML = '';

    calificaciones.forEach(cal => {
        const card = crearCardCalificacion(cal);
        container.innerHTML += card;
    });
}

// ============================================
// CREAR CARD DE CALIFICACIÓN
// ============================================
function crearCardCalificacion(cal) {
    const esRecibida = tipoActual === 'recibidas';
    // Recibidas: quien dio la reseña (empleador) | Dadas: quien recibió la reseña (empleador)
    const nombre = cal.empleadorNombre;
    const iniciales = (nombre || 'U').charAt(0).toUpperCase();
    const avatar = iniciales;
    const fecha = formatearFecha(cal.fechaCalificacion);
    const estrellas = generarEstrellasHTML(cal.puntuacion);

    return `
        <div class="calificacion-card ${esRecibida ? 'recibida' : 'dada'}">
            <div class="calificacion-header">
                <div class="calificacion-persona">
                    <div class="calificacion-avatar">${avatar}</div>
                    <div class="calificacion-info">
                        <span class="calificacion-nombre">${escapeHtml(nombre || 'Empleador')}</span>
                        <span class="calificacion-trabajo">${escapeHtml(cal.ofertaTitulo || 'Trabajo')}</span>
                    </div>
                </div>
                <div class="calificacion-meta">
                    <div class="calificacion-estrellas">${estrellas}</div>
                    <span class="calificacion-fecha">${fecha}</span>
                </div>
            </div>
            ${cal.comentario ? `
                <div class="calificacion-comentario">
                    <p>"${escapeHtml(cal.comentario)}"</p>
                </div>
            ` : ''}
            ${cal.respuesta ? `
                <div class="calificacion-respuesta">
                    <span class="respuesta-label">${esRecibida ? 'Tu respuesta:' : 'Respuesta del empleador:'}</span>
                    <p>"${escapeHtml(cal.respuesta)}"</p>
                </div>
            ` : ''}
        </div>
    `;
}

// ============================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================
window.cambiarTab = cambiarTab;
window.aplicarFiltros = aplicarFiltros;
window.limpiarFiltros = limpiarFiltros;
