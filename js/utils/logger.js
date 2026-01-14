// ============================================
// LOGGER.JS - ChambApp
// Sistema de logging controlado
// Solo muestra logs en modo desarrollo
// ============================================

/**
 * Verificar si estamos en modo desarrollo
 * Activar con: localStorage.setItem('debug', 'true')
 * Desactivar con: localStorage.removeItem('debug')
 */
function isDebugMode() {
    return localStorage.getItem('debug') === 'true' ||
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
}

/**
 * Log general (equivalente a console.log)
 */
export function debugLog(...args) {
    if (isDebugMode()) {
        console.log(...args);
    }
}

/**
 * Log de informacion
 */
export function debugInfo(...args) {
    if (isDebugMode()) {
        console.info(...args);
    }
}

/**
 * Log de advertencia (siempre visible)
 */
export function debugWarn(...args) {
    console.warn(...args);
}

/**
 * Log de error (siempre visible)
 */
export function debugError(...args) {
    console.error(...args);
}

/**
 * Log con grupo colapsable
 */
export function debugGroup(label, ...args) {
    if (isDebugMode()) {
        console.groupCollapsed(label);
        args.forEach(arg => console.log(arg));
        console.groupEnd();
    }
}

/**
 * Log de tabla (para arrays/objetos)
 */
export function debugTable(data, columns) {
    if (isDebugMode()) {
        console.table(data, columns);
    }
}

// Exponer globalmente para scripts no-module
window.debugLog = debugLog;
window.debugInfo = debugInfo;
window.debugWarn = debugWarn;
window.debugError = debugError;
window.debugGroup = debugGroup;
window.debugTable = debugTable;

// Mensaje inicial solo en debug
if (isDebugMode()) {
    console.log('🔧 Modo debug activado - Para desactivar: localStorage.removeItem("debug")');
}
