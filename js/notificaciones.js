// ============================================
// NOTIFICACIONES - ChambApp
// Centro de notificaciones in-app
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    writeBatch,
    onSnapshot,
    where
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { escapeHtml } from './utils/dom-helpers.js';
import { verificarBloqueo } from './utils/auth-guard.js';

// Inicializar Firebase
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variables globales
let usuarioActual = null;
let notificaciones = [];
let filtroActual = 'todas';
let unsubscribeNotificaciones = null;
let notifIdAEliminar = null;

// ============================================
// INICIALIZACION
// ============================================

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const bloqueado = await verificarBloqueo(db, auth, user.uid);
        if (bloqueado) return;
        usuarioActual = user;
        await inicializarPagina();
    } else {
        window.location.href = 'login.html';
    }
});

async function inicializarPagina() {
    // Escuchar notificaciones en tiempo real
    escucharNotificaciones();
}

// ============================================
// CARGAR NOTIFICACIONES (Real-time)
// ============================================

function escucharNotificaciones() {
    const notifRef = collection(db, 'usuarios', usuarioActual.uid, 'notificaciones');
    const q = query(notifRef, orderBy('fechaCreacion', 'desc'), limit(50));

    // Cancelar listener anterior si existe
    if (unsubscribeNotificaciones) {
        unsubscribeNotificaciones();
    }

    unsubscribeNotificaciones = onSnapshot(q, (snapshot) => {
        notificaciones = [];

        snapshot.forEach((doc) => {
            notificaciones.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log('[Notif] Notificaciones cargadas:', notificaciones.length);
        actualizarUI();
    }, (error) => {
        console.error('[Notif] Error escuchando notificaciones:', error);
        mostrarError();
    });
}

// ============================================
// ACTUALIZAR UI
// ============================================

function actualizarUI() {
    const loadingScreen = document.getElementById('loading-screen');
    const notifList = document.getElementById('notif-list');
    const emptyState = document.getElementById('empty-state');
    const emptyFilterState = document.getElementById('empty-filter-state');
    const btnMarcarTodas = document.getElementById('btn-marcar-todas');

    // Ocultar loading
    loadingScreen.style.display = 'none';

    // Filtrar notificaciones
    const notifFiltradas = filtrarPorEstado(notificaciones, filtroActual);

    // Actualizar stats
    const noLeidas = notificaciones.filter(n => !n.leida).length;
    document.getElementById('total-notif').textContent = notificaciones.length;
    document.getElementById('no-leidas').textContent = noLeidas;

    // Mostrar/ocultar boton marcar todas
    btnMarcarTodas.style.display = noLeidas > 0 ? 'block' : 'none';

    // Si no hay notificaciones en total
    if (notificaciones.length === 0) {
        notifList.style.display = 'none';
        emptyState.style.display = 'flex';
        emptyFilterState.style.display = 'none';
        return;
    }

    // Si no hay notificaciones con el filtro actual
    if (notifFiltradas.length === 0) {
        notifList.style.display = 'none';
        emptyState.style.display = 'none';
        emptyFilterState.style.display = 'flex';
        return;
    }

    // Mostrar notificaciones
    emptyState.style.display = 'none';
    emptyFilterState.style.display = 'none';
    notifList.style.display = 'block';

    renderizarNotificaciones(notifFiltradas);
}

function filtrarPorEstado(notifs, filtro) {
    switch (filtro) {
        case 'no-leidas':
            return notifs.filter(n => !n.leida);
        case 'leidas':
            return notifs.filter(n => n.leida);
        default:
            return notifs;
    }
}

function renderizarNotificaciones(notifs) {
    const notifList = document.getElementById('notif-list');

    notifList.innerHTML = notifs.map(notif => {
        const icono = obtenerIcono(notif.tipo);
        const fecha = formatearFecha(notif.fechaCreacion);
        const claseLeida = notif.leida ? 'leida' : 'no-leida';

        return `
            <div class="notif-item ${claseLeida}" data-id="${notif.id}" onclick="abrirNotificacion('${notif.id}')">
                <div class="notif-icon-wrapper ${notif.tipo}">
                    <span class="notif-icon">${icono}</span>
                </div>
                <div class="notif-content">
                    <div class="notif-title">${escapeHtml(notif.titulo)}</div>
                    <div class="notif-body">${escapeHtml(notif.cuerpo)}</div>
                    <div class="notif-time">${fecha}</div>
                </div>
                <div class="notif-actions">
                    ${!notif.leida ? `
                        <button class="notif-action-btn" onclick="event.stopPropagation(); marcarComoLeida('${notif.id}')" title="Marcar como leida">
                            ✓
                        </button>
                    ` : ''}
                    <button class="notif-action-btn notif-action-delete" onclick="event.stopPropagation(); confirmarEliminar('${notif.id}')" title="Eliminar">
                        🗑️
                    </button>
                </div>
                ${!notif.leida ? '<div class="notif-unread-dot"></div>' : ''}
            </div>
        `;
    }).join('');
}

function obtenerIcono(tipo) {
    const iconos = {
        'nueva_postulacion': '👤',
        'postulacion_aceptada': '🎉',
        'mensaje_nuevo': '💬',
        'calificacion_nueva': '⭐',
        'default': '🔔'
    };
    return iconos[tipo] || iconos['default'];
}

function formatearFecha(timestamp) {
    if (!timestamp) return '';

    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const ahora = new Date();
    const diff = ahora - fecha;

    // Menos de 1 minuto
    if (diff < 60000) {
        return 'Ahora mismo';
    }

    // Menos de 1 hora
    if (diff < 3600000) {
        const minutos = Math.floor(diff / 60000);
        return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    }

    // Menos de 24 horas
    if (diff < 86400000) {
        const horas = Math.floor(diff / 3600000);
        return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    }

    // Menos de 7 dias
    if (diff < 604800000) {
        const dias = Math.floor(diff / 86400000);
        return `Hace ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
    }

    // Mas de 7 dias
    return fecha.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        year: fecha.getFullYear() !== ahora.getFullYear() ? 'numeric' : undefined
    });
}

// ============================================
// ACCIONES
// ============================================

window.abrirNotificacion = async function(notifId) {
    const notif = notificaciones.find(n => n.id === notifId);
    if (!notif) return;

    // Marcar como leida si no lo esta
    if (!notif.leida) {
        await marcarComoLeida(notifId);
    }

    // Navegar a la URL asociada
    if (notif.url) {
        window.location.href = notif.url;
    }
};

window.marcarComoLeida = async function(notifId) {
    try {
        const notifRef = doc(db, 'usuarios', usuarioActual.uid, 'notificaciones', notifId);
        await updateDoc(notifRef, { leida: true });
        console.log('[Notif] Marcada como leida:', notifId);
    } catch (error) {
        console.error('[Notif] Error marcando como leida:', error);
    }
};

window.marcarTodasLeidas = async function() {
    const noLeidas = notificaciones.filter(n => !n.leida);

    if (noLeidas.length === 0) return;

    try {
        const batch = writeBatch(db);

        noLeidas.forEach(notif => {
            const notifRef = doc(db, 'usuarios', usuarioActual.uid, 'notificaciones', notif.id);
            batch.update(notifRef, { leida: true });
        });

        await batch.commit();

        if (typeof toastSuccess === 'function') {
            toastSuccess(`${noLeidas.length} notificaciones marcadas como leidas`);
        }

        console.log('[Notif] Todas marcadas como leidas');
    } catch (error) {
        console.error('[Notif] Error marcando todas como leidas:', error);
        if (typeof toastError === 'function') {
            toastError('Error al marcar notificaciones');
        }
    }
};

window.confirmarEliminar = function(notifId) {
    notifIdAEliminar = notifId;
    const modal = document.getElementById('modal-overlay');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Configurar boton confirmar
    document.getElementById('btn-confirmar-eliminar').onclick = async () => {
        await eliminarNotificacion(notifIdAEliminar);
        cerrarModal();
    };
};

async function eliminarNotificacion(notifId) {
    try {
        const notifRef = doc(db, 'usuarios', usuarioActual.uid, 'notificaciones', notifId);
        await deleteDoc(notifRef);

        if (typeof toastSuccess === 'function') {
            toastSuccess('Notificacion eliminada');
        }

        console.log('[Notif] Eliminada:', notifId);
    } catch (error) {
        console.error('[Notif] Error eliminando:', error);
        if (typeof toastError === 'function') {
            toastError('Error al eliminar notificacion');
        }
    }
}

window.cerrarModal = function() {
    const modal = document.getElementById('modal-overlay');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    notifIdAEliminar = null;
};

// ============================================
// FILTROS
// ============================================

window.filtrarNotificaciones = function(filtro) {
    filtroActual = filtro;

    // Actualizar botones de filtro
    document.querySelectorAll('.notif-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filtro) {
            btn.classList.add('active');
        }
    });

    actualizarUI();
};

// ============================================
// UTILIDADES
// ============================================

function mostrarError() {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('notif-list').innerHTML = `
        <div class="error-state">
            <p>Error cargando notificaciones. <a href="#" onclick="location.reload()">Reintentar</a></p>
        </div>
    `;
    document.getElementById('notif-list').style.display = 'block';
}

// Cleanup al salir de la pagina
window.addEventListener('beforeunload', () => {
    if (unsubscribeNotificaciones) {
        unsubscribeNotificaciones();
    }
});
