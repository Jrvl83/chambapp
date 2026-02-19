/**
 * Módulo de geolocalización para dashboard
 * Maneja: obtener coordenadas, geocodificar, guardar ubicación
 *
 * @module dashboard/geolocation
 */

import { doc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { GOOGLE_MAPS_API_KEY } from '../config/api-keys.js';

// ============================================
// VARIABLES DEL MÓDULO
// ============================================
let db = null;
let ubicacionUsuario = null;
let filtrosAvanzadosComponent = null;
let onUbicacionActualizadaCallback = null;

/**
 * Inicializa el módulo con dependencias
 */
export function initGeolocation(firestore) {
    db = firestore;
}

/**
 * Obtiene la ubicación del usuario
 */
export function getUbicacionUsuario() {
    return ubicacionUsuario;
}

/**
 * Establece la referencia al componente de filtros
 */
export function setFiltrosComponent(component) {
    filtrosAvanzadosComponent = component;
}

/**
 * Registra callback a llamar cuando la ubicación se actualiza
 */
export function setOnUbicacionActualizada(callback) {
    onUbicacionActualizadaCallback = callback;
}

// ============================================
// FUNCIONES DE GEOLOCALIZACIÓN
// ============================================

export async function obtenerCoordenadas() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Tu navegador no soporta geolocalización'));
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
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        mensaje = 'Debes permitir el acceso a tu ubicación';
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

export async function geocodificar(coords) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${GOOGLE_MAPS_API_KEY}&language=es`
        );

        const data = await response.json();

        if (data.status === 'OK' && data.results[0]) {
            return extraerDatosUbicacion(data.results[0], coords);
        }

        console.error('Geocoding API error:', data.status, data.error_message);
        return crearUbicacionFallback(coords);
    } catch (error) {
        console.error('Error en geocodificación:', error);
        return crearUbicacionFallback(coords);
    }
}

function extraerDatosUbicacion(result, coords) {
    const addressComponents = result.address_components;
    let distrito = '';
    let provincia = '';
    let departamento = '';

    for (const component of addressComponents) {
        if (component.types.includes('locality') || component.types.includes('sublocality')) {
            distrito = component.long_name;
        }
        if (component.types.includes('administrative_area_level_2')) {
            provincia = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
            departamento = component.long_name;
        }
    }

    return {
        lat: coords.lat,
        lng: coords.lng,
        distrito: distrito || 'Ubicación detectada',
        provincia: provincia || '',
        departamento: departamento || '',
        direccionCompleta: result.formatted_address,
        timestamp: new Date().toISOString()
    };
}

function crearUbicacionFallback(coords) {
    return {
        lat: coords.lat,
        lng: coords.lng,
        distrito: 'Ubicación detectada',
        provincia: '',
        departamento: '',
        direccionCompleta: `${coords.lat}, ${coords.lng}`,
        timestamp: new Date().toISOString()
    };
}

export async function guardarUbicacion(uid, ubicacion) {
    try {
        const userRef = doc(db, 'usuarios', uid);
        await updateDoc(userRef, {
            ubicacion: ubicacion,
            ubicacionActualizada: serverTimestamp()
        });
    } catch (error) {
        console.error('Error guardando ubicación:', error);
        throw error;
    }
}

export async function obtenerUbicacionGuardada(uid) {
    try {
        const userDoc = await getDoc(doc(db, 'usuarios', uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            return data.ubicacion || null;
        }
        return null;
    } catch (error) {
        console.error('Error obteniendo ubicación guardada:', error);
        return null;
    }
}

async function actualizarUbicacionSilenciosa(uid) {
    try {
        const coords = await obtenerCoordenadas();
        const ubicacion = await geocodificar(coords);
        await guardarUbicacion(uid, ubicacion);
        return ubicacion;
    } catch (error) {
        console.error('Error actualizando ubicación silenciosa:', error);
        return null;
    }
}

// ============================================
// VERIFICACIÓN DE UBICACIÓN (Task 9)
// ============================================

export async function verificarUbicacion(uid, tipoUsuario) {
    if (tipoUsuario !== 'trabajador') {
        return;
    }

    try {
        const ubicacionGuardada = await obtenerUbicacionGuardada(uid);

        if (!ubicacionGuardada || !ubicacionGuardada.distrito) {
            // Sin datos o datos incompletos: re-geocodificar si hay coords
            if (ubicacionGuardada && ubicacionGuardada.lat && ubicacionGuardada.lng) {
                await regeocodificarUbicacion(uid, ubicacionGuardada);
            } else {
                setTimeout(() => {
                    mostrarModalUbicacion();
                }, 2000);
            }
        } else {
            mostrarBadgeUbicacion(ubicacionGuardada);
            actualizarUbicacionEnBackground(uid);
        }
    } catch (error) {
        console.error('Error verificando ubicación:', error);
    }
}

async function regeocodificarUbicacion(uid, ubicacionVieja) {
    try {
        const coords = { lat: ubicacionVieja.lat, lng: ubicacionVieja.lng };
        const ubicacion = await geocodificar(coords);
        await guardarUbicacion(uid, ubicacion);
        mostrarBadgeUbicacion(ubicacion);
        actualizarUbicacionEnBackground(uid);
    } catch (error) {
        console.error('Error re-geocodificando:', error);
        mostrarBadgeUbicacion({ ...ubicacionVieja, distrito: 'Ubicación detectada' });
    }
}

function actualizarUbicacionEnBackground(uid) {
    // Actualizar cada 30 minutos para evitar rate limiting
    setTimeout(async () => {
        const nuevaUbicacion = await actualizarUbicacionSilenciosa(uid);
        if (nuevaUbicacion) {
            mostrarBadgeUbicacion(nuevaUbicacion);
        }
    }, 30 * 60 * 1000);
}

export function mostrarBadgeUbicacion(ubicacion) {
    if (ubicacion && ubicacion.lat && ubicacion.lng) {
        ubicacionUsuario = {
            lat: ubicacion.lat,
            lng: ubicacion.lng,
            distrito: ubicacion.distrito
        };

        if (filtrosAvanzadosComponent) {
            filtrosAvanzadosComponent.setUserLocation(ubicacionUsuario);
        }

        if (onUbicacionActualizadaCallback) {
            onUbicacionActualizadaCallback(ubicacionUsuario);
        }
    }

    const textoUbicacion = ubicacion.distrito || 'Ubicación detectada';
    const tituloCompleto = ubicacion.direccionCompleta || textoUbicacion;

    const elTexto = document.getElementById('dropdown-ubicacion-texto');
    if (elTexto) {
        elTexto.textContent = `📍 ${textoUbicacion}`;
        elTexto.title = tituloCompleto;
    }
}

function mostrarModalUbicacion() {
    const modal = document.getElementById('modal-ubicacion');
    if (modal) {
        modal.classList.add('active');
    }
}

// ============================================
// FUNCIONES GLOBALES DE UBICACIÓN
// ============================================

export function registrarFuncionesGlobalesUbicacion(usuarioActual) {
    window.actualizarUbicacionManual = async function () {
        const btn = document.getElementById('btn-refresh-ubicacion');
        if (!btn) return;

        const textoOriginal = btn.innerHTML;

        try {
            btn.innerHTML = '⏳';
            btn.disabled = true;

            const coords = await obtenerCoordenadas();
            const ubicacion = await geocodificar(coords);
            await guardarUbicacion(usuarioActual.uid, ubicacion);

            mostrarBadgeUbicacion(ubicacion);

            if (typeof mostrarToast === 'function') {
                mostrarToast('Ubicación actualizada', 'success');
            }
        } catch (error) {
            console.error('Error:', error);
            if (typeof mostrarToast === 'function') {
                mostrarToast('No se pudo actualizar ubicación', 'error');
            }
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
        }
    };

    window.cerrarModalUbicacion = function () {
        const modal = document.getElementById('modal-ubicacion');
        if (modal) {
            modal.classList.remove('active');
        }
    };

    window.solicitarUbicacion = async function () {
        const btn = event.target;
        const textoOriginal = btn.textContent;

        try {
            btn.textContent = 'Obteniendo ubicación...';
            btn.disabled = true;

            const coords = await obtenerCoordenadas();
            const ubicacion = await geocodificar(coords);
            await guardarUbicacion(usuarioActual.uid, ubicacion);

            mostrarBadgeUbicacion(ubicacion);
            window.cerrarModalUbicacion();

            if (typeof mostrarToast === 'function') {
                mostrarToast('Ubicación guardada', 'success');
            }
        } catch (error) {
            console.error('Error:', error);
            if (typeof toastError === 'function') {
                toastError('Error al obtener ubicación');
            }
            btn.textContent = textoOriginal;
            btn.disabled = false;
        }
    };
}
