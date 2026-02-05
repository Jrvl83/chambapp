// ============================================
// FORMATTING.JS - ChambApp
// Funciones de formateo centralizadas
// ============================================

/**
 * Formatear fecha en formato relativo (Hoy, Ayer, Hace X días) o absoluto
 * @param {Timestamp|Date|string} timestamp - Fecha a formatear
 * @param {string} formato - 'relativo' (default) o 'absoluto'
 * @returns {string} Fecha formateada
 */
export function formatearFecha(timestamp, formato = 'relativo') {
    if (!timestamp) return 'Reciente';

    try {
        const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

        if (formato === 'absoluto') {
            return fecha.toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        }

        // Formato relativo
        const ahora = new Date();
        const diff = ahora - fecha;
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (dias === 0) return 'Hoy';
        if (dias === 1) return 'Ayer';
        if (dias < 7) return `Hace ${dias} días`;

        return fecha.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (error) {
        return 'Reciente';
    }
}

/**
 * Formatear fecha con hora
 * @param {Timestamp|Date|string} timestamp - Fecha a formatear
 * @returns {string} Fecha con hora formateada
 */
export function formatearFechaHora(timestamp) {
    if (!timestamp) return 'Reciente';

    try {
        const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return fecha.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Reciente';
    }
}

/**
 * Generar HTML de estrellas para mostrar calificación
 * @param {number} puntuacion - Puntuación (0-5)
 * @param {number} maxEstrellas - Número máximo de estrellas (default 5)
 * @returns {string} HTML con estrellas
 */
export function generarEstrellasHTML(puntuacion, maxEstrellas = 5) {
    let html = '';
    const puntuacionRedondeada = Math.round(puntuacion || 0);

    for (let i = 1; i <= maxEstrellas; i++) {
        if (i <= puntuacionRedondeada) {
            html += '<span class="estrella-filled">★</span>';
        } else {
            html += '<span class="estrella-empty">☆</span>';
        }
    }
    return html;
}

/**
 * Formatear moneda en soles peruanos
 * @param {number} cantidad - Cantidad a formatear
 * @returns {string} Cantidad formateada (ej: "S/. 150.00")
 */
export function formatearMoneda(cantidad) {
    if (cantidad === null || cantidad === undefined) return 'No especificado';
    return `S/. ${Number(cantidad).toFixed(2)}`;
}

/**
 * Capitalizar primera letra de cada palabra
 * @param {string} texto - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export function capitalizarPalabras(texto) {
    if (!texto) return '';
    return texto
        .toLowerCase()
        .split(' ')
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(' ');
}

/**
 * Truncar texto con ellipsis
 * @param {string} texto - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export function truncarTexto(texto, maxLength = 100) {
    if (!texto) return '';
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength).trim() + '...';
}

/**
 * Formatear número con separadores de miles
 * @param {number} numero - Número a formatear
 * @returns {string} Número formateado
 */
export function formatearNumero(numero) {
    if (numero === null || numero === undefined) return '0';
    return Number(numero).toLocaleString('es-PE');
}
