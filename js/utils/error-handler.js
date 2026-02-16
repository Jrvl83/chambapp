// ============================================
// ERROR-HANDLER.JS - Mensajes de error amigables + retry
// ============================================

/**
 * Genera mensaje de error amigable con sugerencia accionable
 * @param {Error} error - Error original
 * @param {string} contexto - Qué se estaba haciendo ("guardar el perfil", "cargar ofertas")
 * @returns {string} Mensaje amigable para el usuario
 */
export function mensajeErrorAmigable(error, contexto) {
    if (!navigator.onLine || esErrorDeRed(error)) {
        return `Sin conexión. Verifica tu internet e intenta ${contexto} de nuevo.`;
    }
    if (esErrorDePermisos(error)) {
        return `No tienes permiso para ${contexto}. Intenta cerrar sesión y volver a entrar.`;
    }
    return `Error al ${contexto}. Intenta de nuevo en unos momentos.`;
}

function esErrorDeRed(error) {
    const msg = (error?.message || '').toLowerCase();
    return msg.includes('network') || msg.includes('failed to fetch')
        || msg.includes('timeout') || error?.code === 'unavailable';
}

function esErrorDePermisos(error) {
    const code = error?.code || '';
    return code.includes('permission-denied') || code.includes('unauthenticated');
}

/**
 * Muestra toast de error con botón "Reintentar"
 * @param {string} message - Mensaje de error
 * @param {Function} retryFn - Función a ejecutar al reintentar
 */
export function toastErrorConRetry(message, retryFn) {
    if (typeof showToast !== 'function') return;

    const html = `${message} <button class="toast-retry-btn">Reintentar</button>`;
    const toastEl = showToast(html, 'error', 8000);

    const retryBtn = toastEl?.querySelector('.toast-retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
            retryFn();
        });
    }
}

// Exponer globalmente
window.mensajeErrorAmigable = mensajeErrorAmigable;
window.toastErrorConRetry = toastErrorConRetry;
