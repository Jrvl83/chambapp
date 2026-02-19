// ============================================
// SW UPDATE DETECTOR - ChambApp
// El SW llama skipWaiting() en install -> activa solo.
// controllerchange recarga la pagina para servir assets frescos.
// ============================================

const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutos

export function initSWUpdate() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((registration) => {
        // Chequear updates periodicamente
        setInterval(() => registration.update(), UPDATE_CHECK_INTERVAL);
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
