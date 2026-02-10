/**
 * Utilidad para obtener calificaciones de empleadores
 * @module utils/employer-rating
 */

import {
    doc, getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const cache = new Map();

function extraerRating(data) {
    return {
        promedio: data.calificacionPromedio || 0,
        total: data.totalCalificaciones || 0
    };
}

/**
 * Obtiene la calificación de un empleador por su userId
 * Usa caché en memoria para evitar reads duplicados
 */
export async function fetchEmpleadorRating(db, empleadorId) {
    if (!empleadorId) return { promedio: 0, total: 0 };
    if (cache.has(empleadorId)) return cache.get(empleadorId);

    try {
        const snap = await getDoc(doc(db, 'usuarios', empleadorId));
        const rating = snap.exists() ? extraerRating(snap.data()) : { promedio: 0, total: 0 };
        cache.set(empleadorId, rating);
        return rating;
    } catch {
        return { promedio: 0, total: 0 };
    }
}

/**
 * Obtiene calificaciones de múltiples empleadores por sus IDs
 * Retorna objeto { empleadorId: { promedio, total } }
 */
export async function fetchEmpleadoresRatings(db, empleadorIds) {
    const resultado = {};
    const sinCache = empleadorIds.filter(id => {
        if (cache.has(id)) {
            resultado[id] = cache.get(id);
            return false;
        }
        return true;
    });

    const fetches = sinCache.map(id => fetchEmpleadorRating(db, id));
    const ratings = await Promise.all(fetches);

    sinCache.forEach((id, i) => {
        resultado[id] = ratings[i];
    });

    return resultado;
}
