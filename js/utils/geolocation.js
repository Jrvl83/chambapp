// ============================================
// GEOLOCATION.JS - ChambApp
// Gestión de ubicación del usuario
// Task 9: Geolocalización completa
// ============================================

import { GOOGLE_MAPS_API_KEY } from '../config/api-keys.js';
import { calcularDistanciaCoords, formatearDistancia } from './distance.js';

/**
 * Solicitar coordenadas GPS del navegador
 * @returns {Promise<{lat: number, lng: number}>}
 */
export async function obtenerCoordenadas() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocalización no disponible en este navegador'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                let mensaje = 'Error al obtener ubicación';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        mensaje = 'Permiso de ubicación denegado';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensaje = 'Ubicación no disponible';
                        break;
                    case error.TIMEOUT:
                        mensaje = 'Tiempo de espera agotado';
                        break;
                }
                
                reject(new Error(mensaje));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

/**
 * Convertir coordenadas a dirección legible (Geocoding)
 * Usa Google Geocoding API
 * @param {object} coords - {lat, lng}
 * @returns {Promise<object>} Información de ubicación
 */
export async function geocodificar(coords) {
    const { lat, lng } = coords;
    
    // Google Geocoding API
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=es`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status !== 'OK' || !data.results || data.results.length === 0) {
            throw new Error('No se pudo determinar la dirección');
        }
        
        // Extraer información del resultado
        const resultado = data.results[0];
        let distrito = '';
        let ciudad = '';
        let departamento = '';
        
        // Buscar componentes de dirección
        resultado.address_components.forEach(component => {
            if (component.types.includes('locality') || 
                component.types.includes('sublocality') ||
                component.types.includes('administrative_area_level_3')) {
                distrito = distrito || component.long_name;
            }
            if (component.types.includes('administrative_area_level_2')) {
                ciudad = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
                departamento = component.long_name;
            }
        });
        
        return {
            distrito: distrito || 'Desconocido',
            ciudad: ciudad || 'Lima',
            departamento: departamento || 'Lima',
            direccionCompleta: resultado.formatted_address,
            coords: { lat, lng }
        };
        
    } catch (error) {
        console.error('❌ Error en geocodificación:', error);
        
        // Fallback: guardar solo coordenadas
        return {
            distrito: 'Ubicación detectada',
            ciudad: 'Lima',
            departamento: 'Lima',
            direccionCompleta: `${lat}, ${lng}`,
            coords: { lat, lng }
        };
    }
}

/**
 * Guardar ubicación en Firestore
 * @param {string} uid - ID del usuario
 * @param {object} ubicacion - Datos de ubicación
 * @returns {Promise<void>}
 */
export async function guardarUbicacion(uid, ubicacion) {
    try {
        const { db } = await import('../config/firebase-init.js');
        const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const ubicacionData = {
            distrito: ubicacion.distrito,
            ciudad: ubicacion.ciudad,
            departamento: ubicacion.departamento,
            direccionCompleta: ubicacion.direccionCompleta,
            coords: {
                lat: ubicacion.coords.lat,
                lng: ubicacion.coords.lng
            },
            metodo: 'gps',
            timestamp: serverTimestamp()
        };
        
        await setDoc(doc(db, 'usuarios', uid, 'ubicacion', 'actual'), ubicacionData);
        
        console.log('✅ Ubicación guardada en Firestore:', ubicacionData);
        
        return ubicacionData;
        
    } catch (error) {
        console.error('❌ Error al guardar ubicación:', error);
        throw error;
    }
}

/**
 * Obtener ubicación guardada de Firestore
 * @param {string} uid - ID del usuario
 * @returns {Promise<object|null>} Ubicación guardada o null
 */
export async function obtenerUbicacionGuardada(uid) {
    try {
        const { db } = await import('../config/firebase-init.js');
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const ubicacionRef = doc(db, 'usuarios', uid, 'ubicacion', 'actual');
        const ubicacionSnap = await getDoc(ubicacionRef);
        
        if (ubicacionSnap.exists()) {
            const data = ubicacionSnap.data();
            console.log('📍 Ubicación guardada encontrada:', data);
            return data;
        }
        
        return null;
        
    } catch (error) {
        console.error('❌ Error al obtener ubicación guardada:', error);
        return null;
    }
}

/**
 * 🆕 ACTUALIZAR UBICACIÓN SILENCIOSAMENTE (SIN MODAL)
 * Se ejecuta automáticamente en background
 * No muestra UI, solo actualiza datos
 * @param {string} uid - ID del usuario
 * @returns {Promise<object|null>} Nueva ubicación o null si falla
 */
export async function actualizarUbicacionSilenciosa(uid) {
    try {
        console.log('🔄 Actualizando ubicación en background...');
        
        // 1. Obtener coordenadas GPS (sin mostrar UI)
        const coords = await obtenerCoordenadas();
        
        // 2. Geocodificar (convertir a dirección)
        const ubicacion = await geocodificar(coords);
        
        // 3. Guardar en Firestore
        await guardarUbicacion(uid, ubicacion);
        
        console.log('✅ Ubicación actualizada silenciosamente:', ubicacion);
        
        return ubicacion;
        
    } catch (error) {
        console.warn('⚠️ No se pudo actualizar ubicación en background:', error.message);
        // No mostramos error al usuario - fallo silencioso
        return null;
    }
}

// Re-exportar funciones de distancia desde modulo centralizado
export { calcularDistanciaCoords as calcularDistancia, formatearDistancia };
