// ============================================
// SW UPDATE DETECTOR - ChambApp
// Modulo: js/pwa/sw-update.js
// Detecta nuevo SW y muestra toast de actualizacion
// ============================================

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000; // 60 minutos

export function initSWUpdate() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((registration) => {
        // Chequear updates periodicamente
        setInterval(() => registration.update(), UPDATE_CHECK_INTERVAL);

        listenForUpdates(registration);
    });

    // Recargar cuando un nuevo SW reemplaza al anterior.
    // Solo si ya habia un controller (es update, no primera instalacion).
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hadController) {
            window.location.reload();
        }
    });
}

function listenForUpdates(registration) {
    registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
            if (newWorker.state !== 'installed') return;
            if (!navigator.serviceWorker.controller) return;

            // Nuevo SW esperando -> mostrar toast
            mostrarToastActualizacion();
        });
    });
}

function mostrarToastActualizacion() {
    if (typeof showToast !== 'function') return;

    showToast(
        'Actualizacion disponible <button onclick="activarNuevoSW()" class="toast-retry-btn">Actualizar</button>',
        'info',
        0
    );
}

// Funcion global para el onclick del boton
window.activarNuevoSW = function () {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'SKIP_WAITING'
        });
    }
};
