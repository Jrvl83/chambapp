// ============================================
// FIREBASE MESSAGING SERVICE WORKER
// ChambApp - Notificaciones Push + PWA Caching
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

    const notificationTitle = payload.notification?.title || 'ChambaYa';
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
    event.notification.close();

    let urlToOpen = '/dashboard.html';

    if (event.action === 'cerrar') return;

    if (event.notification.data && event.notification.data.url) {
        urlToOpen = event.notification.data.url;
    }

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus().then(() => {
                        if (client.url !== self.location.origin + urlToOpen) {
                            return client.navigate(urlToOpen);
                        }
                    });
                }
            }
            return clients.openWindow(urlToOpen);
        })
    );
});

// ============================================
// PWA CACHING - ChambApp
// ============================================

const CACHE_VERSION = 'chambapp-v2';
const STATIC_CACHE = CACHE_VERSION + '-static';
const PAGES_CACHE = CACHE_VERSION + '-pages';
const IMAGES_CACHE = CACHE_VERSION + '-images';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
    '/offline.html',
    '/css/design-system.css',
    '/css/components.css',
    '/css/toast.css',
    '/css/bottom-nav.css',
    '/css/accessibility.css',
    '/css/animations.css',
    '/css/dashboard-main.css',
    '/css/dashboard-empleador.css',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-512.png',
    '/assets/logo/logo-icono.png',
    '/assets/logo/logo-completo.png',
    '/manifest.json'
];

// URLs that should NEVER be cached (auth, realtime data, maps)
const NEVER_CACHE = [
    'identitytoolkit.googleapis.com',
    'securetoken.googleapis.com',
    'firestore.googleapis.com',
    'fcmregistrations.googleapis.com',
    'firebaseinstallations.googleapis.com',
    'maps.googleapis.com',
    'maps.gstatic.com'
];

// ============================================
// CACHING STRATEGIES
// ============================================

function cacheFirst(request, cacheName) {
    return caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
            if (response.ok) {
                const clone = response.clone();
                caches.open(cacheName).then((c) => c.put(request, clone));
            }
            return response;
        });
    });
}

function networkFirst(request) {
    return fetch(request).then((response) => {
        if (response.ok) {
            const clone = response.clone();
            caches.open(PAGES_CACHE).then((c) => c.put(request, clone));
        }
        return response;
    }).catch(() => {
        return caches.match(request).then((cached) => {
            return cached || caches.match('/offline.html');
        });
    });
}

function staleWhileRevalidate(request, cacheName) {
    return caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
            if (response.ok) {
                const clone = response.clone();
                caches.open(cacheName).then((c) => c.put(request, clone));
            }
            return response;
        }).catch(() => cached);

        return cached || fetchPromise;
    });
}

function isStaticAsset(pathname) {
    return /\.(css|js|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$/i.test(pathname);
}

function shouldNeverCache(url) {
    return NEVER_CACHE.some((pattern) => url.includes(pattern));
}

// ============================================
// FETCH EVENT - Route requests to strategies
// ============================================
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip non-http(s)
    if (!url.protocol.startsWith('http')) return;

    // Skip never-cache URLs (auth, firestore, maps)
    if (shouldNeverCache(url.href)) return;

    // Firebase Storage images -> Stale While Revalidate
    if (url.hostname.includes('firebasestorage.googleapis.com')) {
        event.respondWith(staleWhileRevalidate(event.request, IMAGES_CACHE));
        return;
    }

    // Google Fonts -> Cache First
    if (url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com')) {
        event.respondWith(cacheFirst(event.request, STATIC_CACHE));
        return;
    }

    // Firebase SDK (gstatic) -> Cache First
    if (url.hostname === 'www.gstatic.com') {
        event.respondWith(cacheFirst(event.request, STATIC_CACHE));
        return;
    }

    // HTML pages -> Network First with offline fallback
    if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // Static assets (CSS, JS, images, fonts) -> Stale While Revalidate
    // Sirve desde cache inmediatamente y actualiza en background.
    // La siguiente carga ya tiene la versión más reciente (sin reinstalar PWA).
    if (isStaticAsset(url.pathname)) {
        event.respondWith(staleWhileRevalidate(event.request, STATIC_CACHE));
        return;
    }
});

// ============================================
// INSTALL - Pre-cache static assets
// ============================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRECACHE_ASSETS))
        // NO llamar skipWaiting() aquí — el SW espera hasta que el usuario
        // confirme la actualización desde el toast. El mensaje SKIP_WAITING
        // lo activa cuando el usuario toca "Actualizar".
    );
});

// ============================================
// ACTIVATE - Clean old caches
// ============================================
self.addEventListener('activate', (event) => {
    console.log('[SW ChambApp] Service Worker activado');
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => {
                    return key.startsWith('chambapp-') && !key.startsWith(CACHE_VERSION);
                }).map((key) => caches.delete(key))
            );
        }).then(() => clients.claim())
    );
});

// ============================================
// MESSAGE - Handle skip waiting from client
// ============================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
