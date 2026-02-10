/**
 * Utilidades compartidas para el sistema de calificaciones
 * Usado por mis-aplicaciones (empleador) y mis-aplicaciones-trabajador
 *
 * @module utils/calificacion-utils
 */

import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

/**
 * Actualiza el promedio de calificaciones de un usuario
 * @param {Object} db - Instancia de Firestore
 * @param {string} userId - ID del usuario a actualizar
 * @param {number} nuevaPuntuacion - Puntuación nueva (1-5)
 */
export async function actualizarPromedioUsuario(db, userId, nuevaPuntuacion) {
    try {
        const userRef = doc(db, 'usuarios', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const data = userSnap.data();
        const promedioActual = data.calificacionPromedio || 0;
        const totalActual = data.totalCalificaciones || 0;

        const nuevoTotal = totalActual + 1;
        const sumaTotal = (promedioActual * totalActual) + nuevaPuntuacion;
        const nuevoPromedio = Number((sumaTotal / nuevoTotal).toFixed(2));

        const distribucion = data.distribucionCalificaciones || {
            "5": 0, "4": 0, "3": 0, "2": 0, "1": 0
        };
        distribucion[String(nuevaPuntuacion)] = (distribucion[String(nuevaPuntuacion)] || 0) + 1;

        await updateDoc(userRef, {
            calificacionPromedio: nuevoPromedio,
            totalCalificaciones: nuevoTotal,
            distribucionCalificaciones: distribucion
        });
    } catch (error) {
        console.error('Error al actualizar promedio:', error);
    }
}
