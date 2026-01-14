// ============================================
// DISTANCE.JS - ChambApp
// Funciones de calculo de distancia centralizadas
// ============================================

/**
 * Calcular distancia entre dos puntos usando formula de Haversine
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lng1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lng2 - Longitud punto 2
 * @returns {number} Distancia en kilometros (redondeado a 1 decimal)
 */
export function calcularDistancia(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radio de la Tierra en km

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;

    return Math.round(distancia * 10) / 10; // Redondear a 1 decimal
}

/**
 * Calcular distancia entre dos objetos de coordenadas
 * @param {object} coords1 - {lat, lng}
 * @param {object} coords2 - {lat, lng}
 * @returns {number} Distancia en kilometros
 */
export function calcularDistanciaCoords(coords1, coords2) {
    return calcularDistancia(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
}

/**
 * Convertir grados a radianes
 * @param {number} degrees - Grados
 * @returns {number} Radianes
 */
function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Formatear distancia para mostrar al usuario
 * @param {number} km - Distancia en kilometros
 * @returns {string} Texto formateado (ej: "500 m" o "2.5 km")
 */
export function formatearDistancia(km) {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    }
    return `${km} km`;
}

console.log('✅ Modulo distance.js cargado');
