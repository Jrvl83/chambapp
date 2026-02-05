/**
 * Módulo de notificaciones push para dashboard
 * Maneja: FCM, permisos, badge, prompt de activación
 *
 * @module dashboard/notificaciones-push
 */

import { collection, query, where, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { initializeFCM, requestNotificationPermission, verificarEstadoNotificaciones } from '../notifications/fcm-init.js';

// ============================================
// VARIABLES DEL MÓDULO
// ============================================
let app = null;
let db = null;
let usuarioActual = null;

/**
 * Inicializa el módulo con dependencias
 */
export function initNotificacionesPush(firebaseApp, firestore) {
    app = firebaseApp;
    db = firestore;
}

/**
 * Establece el usuario actual
 */
export function setUsuarioActual(user) {
    usuarioActual = user;
}

// ============================================
// INICIALIZAR NOTIFICACIONES
// ============================================

export async function inicializarNotificacionesPush(userId) {
    setTimeout(async () => {
        try {
            const estado = await verificarEstadoNotificaciones(db, userId);

            if (estado.permisoBrowser === 'denied') {
                return;
            }

            await initializeFCM(app, db, userId);

            if (estado.tieneToken) {
                return;
            }

            if (estado.permisoBrowser === 'default') {
                mostrarPromptNotificaciones();
            }

        } catch {
            // Error inicializando notificaciones
        }
    }, 3000);
}

// ============================================
// ESCUCHAR NOTIFICACIONES NO LEÍDAS
// ============================================

export function escucharNotificacionesNoLeidas(userId) {
    const notifRef = collection(db, 'usuarios', userId, 'notificaciones');
    const q = query(notifRef, where('leida', '==', false));

    onSnapshot(q, (snapshot) => {
        const noLeidas = snapshot.size;
        actualizarBadgeNotificaciones(noLeidas);
    }, () => {
        // Error escuchando notificaciones
    });
}

function actualizarBadgeNotificaciones(cantidad) {
    actualizarBadgeSidebar(cantidad);
    actualizarBadgeBottomNav(cantidad);
}

function actualizarBadgeSidebar(cantidad) {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;

    if (cantidad > 0) {
        badge.textContent = cantidad > 99 ? '99+' : cantidad;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function actualizarBadgeBottomNav(cantidad) {
    const badge = document.getElementById('bottom-nav-notif-badge');
    if (!badge) return;

    if (cantidad > 0) {
        badge.textContent = cantidad > 99 ? '99+' : cantidad;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// ============================================
// PROMPT DE NOTIFICACIONES
// ============================================

function mostrarPromptNotificaciones() {
    if (yaSeMotroPromptHoy()) {
        return;
    }

    localStorage.setItem('chambapp-notif-prompt-date', new Date().toDateString());

    const banner = crearBannerNotificaciones();
    document.body.appendChild(banner);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            banner.classList.add('visible');
        });
    });
}

function yaSeMotroPromptHoy() {
    const ultimoPrompt = localStorage.getItem('chambapp-notif-prompt-date');
    const hoy = new Date().toDateString();
    return ultimoPrompt === hoy;
}

function crearBannerNotificaciones() {
    const banner = document.createElement('div');
    banner.id = 'notif-prompt-banner';
    banner.className = 'notif-prompt-banner';
    banner.innerHTML = `
        <div class="notif-prompt-content">
            <span class="notif-icon">🔔</span>
            <div class="notif-text">
                <strong>Activa las notificaciones</strong>
                <p>Recibe alertas cuando te contacten o acepten tu postulación</p>
            </div>
            <div class="notif-actions">
                <button class="btn btn-primary btn-sm" onclick="activarNotificaciones()">Activar</button>
                <button class="btn btn-secondary btn-sm" onclick="cerrarPromptNotif()">Después</button>
            </div>
        </div>
    `;
    return banner;
}

// ============================================
// ACTIVAR NOTIFICACIONES
// ============================================

export async function activarNotificaciones() {
    cerrarBanner();

    if (!usuarioActual) {
        console.error('[Notif] Usuario no autenticado');
        return;
    }

    try {
        const result = await requestNotificationPermission(db, usuarioActual.uid);

        if (result.success) {
            if (typeof toastSuccess === 'function') {
                toastSuccess('¡Notificaciones activadas! Te avisaremos cuando haya novedades.');
            }
        } else {
            manejarErrorNotificaciones(result);
        }
    } catch (error) {
        console.error('[Notif] Error activando:', error);
        if (typeof toastError === 'function') {
            toastError('Error al activar notificaciones');
        }
    }
}

function manejarErrorNotificaciones(result) {
    let mensaje = 'No se pudieron activar las notificaciones';

    switch (result.reason) {
        case 'ios_not_pwa':
            mensaje = result.message;
            mostrarModalInstruccionesiOS();
            break;
        case 'already_denied':
            mensaje = result.message;
            break;
        case 'denied':
            mensaje = 'Debes tocar "Permitir" cuando el navegador te lo solicite';
            break;
        case 'sw_error':
            mensaje = result.message || 'Error al configurar el servicio. Recarga la página.';
            break;
        case 'token_error':
        case 'no_token':
            mensaje = result.message || 'Error obteniendo token. Intenta de nuevo.';
            break;
        default:
            mensaje = result.message || 'Error al activar notificaciones';
    }

    if (typeof toastError === 'function') {
        toastError(mensaje);
    }
}

function mostrarModalInstruccionesiOS() {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;

    modalBody.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📱</div>
            <h2 style="color: var(--primary); margin-bottom: 1rem;">Instala ChambApp</h2>
            <p style="color: var(--gray); margin-bottom: 1.5rem;">
                Para recibir notificaciones en iPhone, necesitas agregar ChambApp a tu pantalla de inicio:
            </p>
            <ol style="text-align: left; color: var(--dark); line-height: 2;">
                <li>Toca el botón <strong>Compartir</strong> (📤) en Safari</li>
                <li>Desplázate y selecciona <strong>"Agregar a inicio"</strong></li>
                <li>Toca <strong>"Agregar"</strong></li>
                <li>Abre ChambApp desde tu pantalla de inicio</li>
            </ol>
            <button class="btn btn-primary" onclick="cerrarModal()" style="margin-top: 1.5rem; width: 100%;">
                Entendido
            </button>
        </div>
    `;

    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// ============================================
// CERRAR BANNER/PROMPT
// ============================================

export function cerrarPromptNotif() {
    cerrarBanner();
}

function cerrarBanner() {
    const banner = document.getElementById('notif-prompt-banner');
    if (banner) {
        banner.classList.remove('visible');
        setTimeout(() => banner.remove(), 300);
    }
}

// ============================================
// REGISTRAR FUNCIONES GLOBALES
// ============================================

export function registrarFuncionesGlobalesNotificaciones() {
    window.activarNotificaciones = activarNotificaciones;
    window.cerrarPromptNotif = cerrarPromptNotif;
}
