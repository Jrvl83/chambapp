// ============================================
// FCM INIT - ChambApp
// Modulo para Firebase Cloud Messaging
// ============================================

import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';
import { doc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { escapeHtml } from '../utils/dom-helpers.js';

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
        console.log('[FCM] Iniciando solicitud de permiso...');

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
                message: 'En iPhone, primero agrega ChambaYa a tu pantalla de inicio (compartir → Agregar a inicio)'
            };
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

        // Solicitar permiso PRIMERO (antes de verificar messaging)
        console.log('[FCM] Solicitando permiso al navegador...');
        const permission = await Notification.requestPermission();
        console.log('[FCM] Respuesta del navegador:', permission);

        if (permission !== 'granted') {
            console.log('[FCM] Permiso denegado por el usuario');
            return {
                success: false,
                token: null,
                reason: 'denied',
                message: 'Debes permitir las notificaciones cuando el navegador te lo solicite.'
            };
        }

        // Si messaging no esta inicializado, inicializarlo ahora
        if (!messaging) {
            console.log('[FCM] Messaging no inicializado, inicializando ahora...');
            // Obtener la app de Firebase desde el contexto global
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
            const { getMessaging: getMsg } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js');

            // Usar la config global
            const app = initializeApp(window.firebaseConfig, 'fcm-app-' + Date.now());
            messaging = getMsg(app);
            console.log('[FCM] Messaging inicializado dinamicamente');
        }

        // Registrar service worker si no esta registrado
        console.log('[FCM] Verificando service worker...');
        let registration;

        try {
            // Primero intentar obtener el SW existente
            registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');

            if (!registration) {
                console.log('[FCM] Registrando service worker...');
                registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                console.log('[FCM] Service Worker registrado:', registration.scope);
            } else {
                console.log('[FCM] Service Worker ya registrado:', registration.scope);
            }

            // Esperar a que este activo
            if (registration.installing) {
                console.log('[FCM] Esperando instalacion del SW...');
                await new Promise(resolve => {
                    registration.installing.addEventListener('statechange', function() {
                        if (this.state === 'activated') {
                            resolve();
                        }
                    });
                });
            }

            // Asegurar que el SW este listo
            await navigator.serviceWorker.ready;
            console.log('[FCM] Service Worker listo');

        } catch (swError) {
            console.error('[FCM] Error con Service Worker:', swError);
            return {
                success: false,
                token: null,
                reason: 'sw_error',
                message: 'Error al configurar el servicio. Intenta recargar la pagina.'
            };
        }

        // Obtener token FCM
        console.log('[FCM] Obteniendo token FCM...');
        try {
            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration
            });

            if (token) {
                console.log('[FCM] Token obtenido exitosamente:', token.substring(0, 30) + '...');

                // Guardar token en Firestore
                await guardarTokenEnFirestore(db, userId, token);

                return { success: true, token: token, reason: 'success' };
            } else {
                console.warn('[FCM] getToken retorno null');
                return {
                    success: false,
                    token: null,
                    reason: 'no_token',
                    message: 'No se pudo obtener el token. Intenta recargar la pagina.'
                };
            }
        } catch (tokenError) {
            console.error('[FCM] Error obteniendo token:', tokenError);
            return {
                success: false,
                token: null,
                reason: 'token_error',
                message: 'Error al obtener token: ' + tokenError.message
            };
        }

    } catch (error) {
        console.error('[FCM] Error general:', error);
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
    const titulo = payload.notification?.title || 'ChambaYa';
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
