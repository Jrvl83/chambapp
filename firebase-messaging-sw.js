// ============================================
// FIREBASE MESSAGING SERVICE WORKER
// ChambApp - Notificaciones Push
// ============================================

// Importar Firebase compat (requerido para Service Workers)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuracion Firebase (debe coincidir con firebase-config.js)
firebase.initializeApp({
    apiKey: "AIzaSyD5sAUSVp53lO0fVoHmFdlZwNOuctjREeM",
    authDomain: "chambapp-7785b.firebaseapp.com",
    projectId: "chambapp-7785b",
    storageBucket: "chambapp-7785b.firebasestorage.app",
    messagingSenderId: "986133070577",
    appId: "1:986133070577:web:91d07708f067ea91ac5f50"
});

const messaging = firebase.messaging();

// ============================================
// MANEJAR NOTIFICACIONES EN BACKGROUND
// ============================================
messaging.onBackgroundMessage((payload) => {
    console.log('[SW ChambApp] Notificacion recibida en background:', payload);

    const notificationTitle = payload.notification?.title || 'ChambApp';
    const notificationOptions = {
        body: payload.notification?.body || 'Tienes una nueva notificacion',
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/icon-72.png',
        tag: payload.data?.tag || 'chambapp-notification',
        data: payload.data || {},
        requireInteraction: true,
        vibrate: [200, 100, 200],
        actions: [
            { action: 'ver', title: 'Ver' },
            { action: 'cerrar', title: 'Cerrar' }
        ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ============================================
// MANEJAR CLICK EN NOTIFICACION
// ============================================
self.addEventListener('notificationclick', (event) => {
    console.log('[SW ChambApp] Click en notificacion:', event);

    // Cerrar la notificacion
    event.notification.close();

    // Determinar URL a abrir segun la accion o datos
    let urlToOpen = '/dashboard.html';

    if (event.action === 'cerrar') {
        return; // Solo cerrar, no abrir nada
    }

    // Obtener URL de los datos de la notificacion
    if (event.notification.data && event.notification.data.url) {
        urlToOpen = event.notification.data.url;
    }

    // Abrir o enfocar la ventana
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((windowClients) => {
            // Buscar si ya hay una ventana de ChambApp abierta
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    // Enfocar y navegar
                    return client.focus().then(() => {
                        if (client.url !== self.location.origin + urlToOpen) {
                            return client.navigate(urlToOpen);
                        }
                    });
                }
            }
            // Si no hay ventana abierta, abrir una nueva
            return clients.openWindow(urlToOpen);
        })
    );
});

// ============================================
// INSTALACION DEL SERVICE WORKER
// ============================================
self.addEventListener('install', (event) => {
    console.log('[SW ChambApp] Service Worker instalado');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW ChambApp] Service Worker activado');
    event.waitUntil(clients.claim());
});
