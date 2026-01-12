// ============================================
// GEOLOCATION MODULE - ChambApp
// Sistema completo de gestión de ubicación
// ============================================

import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const auth = getAuth();
const db = getFirestore();

// Google Maps API Key (debe coincidir con google-maps.js)
const GOOGLE_MAPS_API_KEY = 'AIzaSyBxopsd9CPAU2CSV91z8YAw_upxochOGYE';

// ============================================
// VERIFICAR SOPORTE DE GEOLOCALIZACIÓN
// ============================================

/**
 * Verificar si el navegador soporta geolocalización
 * @returns {boolean} True si soporta geolocalización
 */
export function soportaGeolocalizacion() {
    const soporta = 'geolocation' in navigator;
    
    if (!soporta) {
        console.warn('⚠️ Este navegador no soporta geolocalización');
    }
    
    return soporta;
}

// ============================================
// VERIFICAR ESTADO DEL PERMISO
// ============================================

/**
 * Verificar el estado actual del permiso de ubicación
 * @returns {Promise<string>} Estado: 'granted', 'denied', 'prompt'
 */
export async function verificarEstadoPermiso() {
    try {
        if (!navigator.permissions) {
            console.warn('⚠️ API de permisos no disponible');
            return 'prompt';
        }

        const resultado = await navigator.permissions.query({ name: 'geolocation' });
        console.log(`📍 Estado permiso ubicación: ${resultado.state}`);
        
        return resultado.state; // 'granted', 'denied', 'prompt'
        
    } catch (error) {
        console.error('❌ Error al verificar permiso:', error);
        return 'prompt';
    }
}

// ============================================
// SOLICITAR UBICACIÓN DEL USUARIO
// ============================================

/**
 * Solicitar ubicación actual del usuario
 * @param {Object} opciones - Opciones de geolocalización
 * @returns {Promise<{lat, lng, accuracy}>} Coordenadas del usuario
 */
export function obtenerUbicacionActual(opciones = {}) {
    return new Promise((resolve, reject) => {
        if (!soportaGeolocalizacion()) {
            reject(new Error('Geolocalización no soportada'));
            return;
        }

        console.log('📍 Solicitando ubicación del usuario...');

        const opcionesPorDefecto = {
            enableHighAccuracy: true,  // Usar GPS si está disponible
            timeout: 10000,            // 10 segundos máximo
            maximumAge: 0              // No usar caché
        };

        const opcionesFinales = { ...opcionesPorDefecto, ...opciones };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const ubicacion = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy, // Precisión en metros
                    timestamp: position.timestamp
                };

                console.log('✅ Ubicación obtenida:', ubicacion);
                resolve(ubicacion);
            },
            (error) => {
                console.error('❌ Error al obtener ubicación:', error);
                
                // Traducir errores a mensajes amigables
                let mensaje = 'No se pudo obtener tu ubicación';
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        mensaje = 'Permiso de ubicación denegado. Por favor, actívalo en la configuración de tu navegador.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensaje = 'Ubicación no disponible. Verifica tu conexión GPS.';
                        break;
                    case error.TIMEOUT:
                        mensaje = 'Tiempo de espera agotado. Intenta de nuevo.';
                        break;
                }
                
                reject(new Error(mensaje));
            },
            opcionesFinales
        );
    });
}

// ============================================
// REVERSE GEOCODING (Coordenadas → Dirección)
// ============================================

/**
 * Convertir coordenadas a dirección legible usando Google Geocoding API
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<Object>} Información de ubicación
 */
export async function obtenerDireccionDesdeCoords(lat, lng) {
    try {
        console.log(`📍 Obteniendo dirección para: ${lat}, ${lng}`);

        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=es`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
            throw new Error(`Error Geocoding: ${data.status}`);
        }

        if (data.results.length === 0) {
            throw new Error('No se encontró información de ubicación');
        }

        // Extraer información del primer resultado
        const resultado = data.results[0];
        
        // Extraer componentes de dirección
        const componentes = {};
        resultado.address_components.forEach(comp => {
            if (comp.types.includes('locality')) {
                componentes.distrito = comp.long_name;
            }
            if (comp.types.includes('administrative_area_level_2')) {
                componentes.provincia = comp.long_name;
            }
            if (comp.types.includes('administrative_area_level_1')) {
                componentes.region = comp.long_name;
            }
            if (comp.types.includes('country')) {
                componentes.pais = comp.long_name;
            }
        });

        const ubicacionInfo = {
            direccionCompleta: resultado.formatted_address,
            distrito: componentes.distrito || 'Lima',
            provincia: componentes.provincia || 'Lima',
            region: componentes.region || 'Lima',
            pais: componentes.pais || 'Perú',
            lat: lat,
            lng: lng
        };

        console.log('✅ Dirección obtenida:', ubicacionInfo);
        return ubicacionInfo;

    } catch (error) {
        console.error('❌ Error en reverse geocoding:', error);
        
        // Fallback: retornar coordenadas sin dirección
        return {
            direccionCompleta: `${lat}, ${lng}`,
            distrito: 'Lima',
            provincia: 'Lima',
            region: 'Lima',
            pais: 'Perú',
            lat: lat,
            lng: lng,
            error: error.message
        };
    }
}

// ============================================
// GUARDAR UBICACIÓN EN FIRESTORE
// ============================================

/**
 * Guardar ubicación del usuario en Firestore
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @param {string} metodo - Método de obtención: 'gps' o 'manual'
 * @returns {Promise<void>}
 */
export async function guardarUbicacionUsuario(lat, lng, metodo = 'gps') {
    try {
        const user = auth.currentUser;
        
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        console.log(`💾 Guardando ubicación usuario: ${user.uid}`);

        // Obtener información de dirección
        const direccionInfo = await obtenerDireccionDesdeCoords(lat, lng);

        // Actualizar documento del usuario
        const userRef = doc(db, 'usuarios', user.uid);
        
        await updateDoc(userRef, {
            ubicacion: {
                lat: lat,
                lng: lng,
                distrito: direccionInfo.distrito,
                provincia: direccionInfo.provincia,
                direccionCompleta: direccionInfo.direccionCompleta,
                metodo: metodo, // 'gps' o 'manual'
                timestamp: serverTimestamp()
            },
            ubicacionActualizada: serverTimestamp()
        });

        console.log('✅ Ubicación guardada en Firestore');
        
        return direccionInfo;

    } catch (error) {
        console.error('❌ Error al guardar ubicación:', error);
        throw error;
    }
}

// ============================================
// OBTENER UBICACIÓN GUARDADA
// ============================================

/**
 * Obtener la ubicación guardada del usuario desde Firestore
 * @returns {Promise<Object|null>} Ubicación guardada o null
 */
export async function obtenerUbicacionGuardada() {
    try {
        const user = auth.currentUser;
        
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        const userRef = doc(db, 'usuarios', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            console.warn('⚠️ Documento de usuario no encontrado');
            return null;
        }

        const data = userDoc.data();
        
        if (!data.ubicacion) {
            console.log('ℹ️ Usuario no tiene ubicación guardada');
            return null;
        }

        console.log('✅ Ubicación guardada obtenida:', data.ubicacion);
        return data.ubicacion;

    } catch (error) {
        console.error('❌ Error al obtener ubicación guardada:', error);
        return null;
    }
}

// ============================================
// SOLICITAR Y GUARDAR UBICACIÓN (TODO EN UNO)
// ============================================

/**
 * Solicitar ubicación del usuario, hacer reverse geocoding y guardar en Firestore
 * @returns {Promise<Object>} Información de ubicación completa
 */
export async function solicitarYGuardarUbicacion() {
    try {
        console.log('🚀 Iniciando proceso completo de ubicación...');

        // 1. Obtener ubicación GPS
        const coords = await obtenerUbicacionActual();
        
        // 2. Guardar en Firestore (incluye reverse geocoding)
        const ubicacionInfo = await guardarUbicacionUsuario(coords.lat, coords.lng, 'gps');

        console.log('✅ Proceso completo exitoso');
        
        return {
            success: true,
            ...ubicacionInfo,
            accuracy: coords.accuracy
        };

    } catch (error) {
        console.error('❌ Error en proceso de ubicación:', error);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================
// VERIFICAR SI USUARIO TIENE UBICACIÓN
// ============================================

/**
 * Verificar si el usuario tiene ubicación guardada
 * @returns {Promise<boolean>} True si tiene ubicación
 */
export async function tieneUbicacionGuardada() {
    const ubicacion = await obtenerUbicacionGuardada();
    return ubicacion !== null;
}

// ============================================
// FORMATEAR UBICACIÓN PARA MOSTRAR
// ============================================

/**
 * Formatear ubicación para mostrar en UI
 * @param {Object} ubicacion - Objeto ubicación desde Firestore
 * @returns {string} Ubicación formateada
 */
export function formatearUbicacion(ubicacion) {
    if (!ubicacion) {
        return 'Ubicación no disponible';
    }

    if (ubicacion.distrito && ubicacion.provincia) {
        return `${ubicacion.distrito}, ${ubicacion.provincia}`;
    }

    if (ubicacion.direccionCompleta) {
        return ubicacion.direccionCompleta;
    }

    return `${ubicacion.lat.toFixed(4)}, ${ubicacion.lng.toFixed(4)}`;
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Calcular precisión de la ubicación
 * @param {number} accuracy - Precisión en metros
 * @returns {string} Descripción de precisión
 */
export function obtenerNivelPrecision(accuracy) {
    if (accuracy < 10) return 'Excelente';
    if (accuracy < 50) return 'Buena';
    if (accuracy < 100) return 'Aceptable';
    return 'Baja';
}

/**
 * Verificar si las coordenadas están en Perú (aproximado)
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {boolean} True si está en Perú
 */
export function estaEnPeru(lat, lng) {
    // Límites aproximados de Perú
    // Lat: -18.5 a -0.5
    // Lng: -81.5 a -68.5
    
    const dentroLat = lat >= -18.5 && lat <= -0.5;
    const dentroLng = lng >= -81.5 && lng <= -68.5;
    
    return dentroLat && dentroLng;
}

console.log('✅ Módulo geolocation.js cargado correctamente');
