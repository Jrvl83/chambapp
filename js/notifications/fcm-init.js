// ============================================
// FCM INIT - ChambApp
// Modulo para Firebase Cloud Messaging
// ============================================

import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';
import { doc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ============================================
// CONFIGURACION
// ============================================

// VAPID key de Firebase Console
// Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = 'BMDsaElFlURgCn6fN5QOE9Ct8PHPAAgxTJ6OW6NB3tuDBFtvxYHtdyN4OeB6etx5s-tqwPtOiHtZd6mI0hpaw5Q';

let messaging = null;
let swRegistration = null;

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Inicializa Firebase Cloud Messaging
 * @param {Object} app - Instancia de Firebase app
 * @param {Object} db - Instancia de Firestore
 * @param {string} userId - UID del usuario actual
 * @returns {Object|null} Instancia de messaging o null si falla
 */
export async function initializeFCM(app, db, userId) {
    try {
        // Verificar soporte del navegador
        if (!('Notification' in window)) {
            console.warn('[FCM] Este navegador no soporta notificaciones');
            return null;
        }

        if (!('serviceWorker' in navigator)) {
            console.warn('[FCM] Este navegador no soporta Service Workers');
            return null;
        }

        // Inicializar messaging
        messaging = getMessaging(app);
        console.log('[FCM] Messaging inicializado');

        // Registrar service worker
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('[FCM] Service Worker registrado:', swRegistration.scope);

        // Configurar listener para mensajes en foreground
        onMessage(messaging, (payload) => {
            console.log('[FCM] Mensaje recibido en foreground:', payload);
            mostrarNotificacionForeground(payload);
        });

        return messaging;

    } catch (error) {
        console.error('[FCM] Error inicializando:', error);
        return null;
    }
}

/**
 * Solicita permiso de notificaciones y obtiene el token FCM
 * @param {Object} db - Instancia de Firestore
 * @param {string} userId - UID del usuario
 * @returns {Object} { success: boolean, token: string|null, reason: string }
 */
export async function requestNotificationPermission(db, userId) {
    try {
        // Detectar iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            window.navigator.standalone === true;

        // iOS requiere PWA instalada
        if (isIOS && !isStandalone) {
            console.log('[FCM] iOS detectado sin PWA instalada');
            return {
                success: false,
                token: null,
                reason: 'ios_not_pwa',
                message: 'En iPhone, primero agrega ChambApp a tu pantalla de inicio (compartir → Agregar a inicio)'
            };
        }

        // Verificar que messaging este inicializado
        if (!messaging) {
            console.error('[FCM] Messaging no inicializado. Llama initializeFCM primero.');
            return { success: false, token: null, reason: 'not_initialized' };
        }

        // Verificar VAPID key
        if (VAPID_KEY === 'REEMPLAZAR_CON_TU_VAPID_KEY') {
            console.error('[FCM] VAPID key no configurada. Edita js/notifications/fcm-init.js');
            return { success: false, token: null, reason: 'no_vapid_key' };
        }

        // Verificar si ya fue denegado antes
        if (Notification.permission === 'denied') {
            console.log('[FCM] Permiso ya fue denegado anteriormente');
            return {
                success: false,
                token: null,
                reason: 'already_denied',
                message: 'Las notificaciones fueron bloqueadas. Ve a la configuración del navegador para habilitarlas.'
            };
        }

        // Solicitar permiso
        const permission = await Notification.requestPermission();
        console.log('[FCM] Permiso de notificaciones:', permission);

        if (permission !== 'granted') {
            console.log('[FCM] Permiso denegado por el usuario');
            return {
                success: false,
                token: null,
                reason: 'denied',
                message: 'Debes permitir las notificaciones cuando el navegador te lo solicite.'
            };
        }

        // Esperar a que el service worker este listo
        const registration = await navigator.serviceWorker.ready;

        // Obtener token FCM
        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration
        });

        if (token) {
            console.log('[FCM] Token obtenido:', token.substring(0, 30) + '...');

            // Guardar token en Firestore
            await guardarTokenEnFirestore(db, userId, token);

            return { success: true, token: token, reason: 'success' };
        } else {
            console.warn('[FCM] No se pudo obtener el token');
            return { success: false, token: null, reason: 'no_token' };
        }

    } catch (error) {
        console.error('[FCM] Error solicitando permiso:', error);
        return {
            success: false,
            token: null,
            reason: 'error',
            message: error.message
        };
    }
}

/**
 * Verifica el estado de notificaciones del usuario
 * @param {Object} db - Instancia de Firestore
 * @param {string} userId - UID del usuario
 * @returns {Object} Estado de notificaciones
 */
export async function verificarEstadoNotificaciones(db, userId) {
    try {
        const userDoc = await getDoc(doc(db, 'usuarios', userId));

        if (userDoc.exists()) {
            const data = userDoc.data();
            return {
                tieneToken: !!data.fcmToken,
                activas: data.notificacionesActivas === true,
                permisoBrowser: Notification.permission
            };
        }

        return {
            tieneToken: false,
            activas: false,
            permisoBrowser: Notification.permission
        };

    } catch (error) {
        console.error('[FCM] Error verificando estado:', error);
        return {
            tieneToken: false,
            activas: false,
            permisoBrowser: 'default'
        };
    }
}

/**
 * Elimina el token FCM (para logout o desactivar)
 * @param {Object} db - Instancia de Firestore
 * @param {string} userId - UID del usuario
 */
export async function eliminarTokenFCM(db, userId) {
    try {
        const userRef = doc(db, 'usuarios', userId);
        await updateDoc(userRef, {
            fcmToken: null,
            notificacionesActivas: false
        });
        console.log('[FCM] Token eliminado de Firestore');
    } catch (error) {
        console.error('[FCM] Error eliminando token:', error);
    }
}

// ============================================
// FUNCIONES INTERNAS
// ============================================

/**
 * Guarda el token FCM en Firestore
 */
async function guardarTokenEnFirestore(db, userId, token) {
    try {
        const userRef = doc(db, 'usuarios', userId);
        await updateDoc(userRef, {
            fcmToken: token,
            fcmTokenUpdated: new Date(),
            notificacionesActivas: true
        });
        console.log('[FCM] Token guardado en Firestore');
    } catch (error) {
        console.error('[FCM] Error guardando token:', error);
        throw error;
    }
}

/**
 * Muestra notificacion cuando la app esta en foreground
 */
function mostrarNotificacionForeground(payload) {
    const titulo = payload.notification?.title || 'ChambApp';
    const cuerpo = payload.notification?.body || '';
    const url = payload.data?.url || '/dashboard.html';

    // Crear toast personalizado
    const existingToast = document.querySelector('.notif-toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'notif-toast';
    toast.innerHTML = `
        <span class="notif-toast-icon">🔔</span>
        <div class="notif-toast-content">
            <div class="notif-toast-title">${escapeHtml(titulo)}</div>
            <div class="notif-toast-body">${escapeHtml(cuerpo)}</div>
        </div>
        <button class="notif-toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    // Click en el toast navega a la URL
    toast.addEventListener('click', (e) => {
        if (!e.target.classList.contains('notif-toast-close')) {
            window.location.href = url;
        }
    });

    document.body.appendChild(toast);

    // Animar entrada
    requestAnimationFrame(() => {
        toast.classList.add('visible');
    });

    // Auto-cerrar despues de 8 segundos
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
    }, 8000);

    // Reproducir sonido (opcional)
    playNotificationSound();
}

/**
 * Reproduce sonido de notificacion
 */
function playNotificationSound() {
    try {
        // Crear contexto de audio
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        // Silenciar errores de audio
    }
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
