// ============================================
// GOOGLE MAPS INTEGRATION - ChambApp
// Módulo para cargar y gestionar Google Maps API
// ============================================

// ⚠️ IMPORTANTE: Reemplaza con tu API Key real
const GOOGLE_MAPS_API_KEY = 'AIzaSyBxopsd9CEAU2CSV91z8YAw_upxochO6YE';

// Estado de carga de la API
let mapsAPILoaded = false;
let mapsAPILoading = false;
let loadCallbacks = [];

// ============================================
// CARGAR GOOGLE MAPS SDK
// ============================================

/**
 * Cargar Google Maps API de forma asíncrona
 * Solo se carga una vez, aunque se llame múltiples veces
 * @returns {Promise} Resuelve cuando la API está cargada
 */
export function cargarGoogleMaps() {
    return new Promise((resolve, reject) => {
        // Si ya está cargada, resolver inmediatamente
        if (mapsAPILoaded) {
            console.log('✅ Google Maps API ya está cargada');
            resolve(window.google.maps);
            return;
        }

        // Si está en proceso de carga, agregar callback
        if (mapsAPILoading) {
            console.log('⏳ Google Maps API cargando, agregando callback...');
            loadCallbacks.push({ resolve, reject });
            return;
        }

        // Marcar como en proceso de carga
        mapsAPILoading = true;
        console.log('📍 Cargando Google Maps API...');

        // Crear callback global
        window.initGoogleMaps = () => {
            mapsAPILoaded = true;
            mapsAPILoading = false;
            console.log('✅ Google Maps API cargada exitosamente');

            // Resolver promesa principal
            resolve(window.google.maps);

            // Resolver callbacks pendientes
            loadCallbacks.forEach(cb => cb.resolve(window.google.maps));
            loadCallbacks = [];
        };

        // Crear script tag
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initGoogleMaps&libraries=places`;
        script.async = true;
        script.defer = true;

        // Manejo de errores
        script.onerror = () => {
            mapsAPILoading = false;
            const error = new Error('Error al cargar Google Maps API');
            console.error('❌', error);

            reject(error);
            loadCallbacks.forEach(cb => cb.reject(error));
            loadCallbacks = [];
        };

        // Agregar script al documento
        document.head.appendChild(script);
    });
}

// ============================================
// INICIALIZAR MAPA
// ============================================

/**
 * Inicializar un mapa en un elemento del DOM
 * @param {string|HTMLElement} elementId - ID del elemento o elemento HTML
 * @param {Object} options - Opciones del mapa
 * @returns {Promise<google.maps.Map>} Instancia del mapa
 */
export async function inicializarMapa(elementId, options = {}) {
    try {
        // Cargar API si no está cargada
        await cargarGoogleMaps();

        // Obtener elemento
        const element = typeof elementId === 'string' 
            ? document.getElementById(elementId)
            : elementId;

        if (!element) {
            throw new Error(`Elemento con ID "${elementId}" no encontrado`);
        }

        // Opciones por defecto
        const defaultOptions = {
            center: { lat: -12.0464, lng: -77.0428 }, // Lima, Perú
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            styles: estilosMapa() // Estilos personalizados
        };

        // Combinar opciones
        const mapOptions = { ...defaultOptions, ...options };

        // Crear mapa
        const map = new google.maps.Map(element, mapOptions);
        
        console.log('✅ Mapa inicializado correctamente');
        return map;

    } catch (error) {
        console.error('❌ Error al inicializar mapa:', error);
        throw error;
    }
}

// ============================================
// CREAR MARKER
// ============================================

/**
 * Crear un marker en el mapa
 * @param {google.maps.Map} map - Instancia del mapa
 * @param {Object} options - Opciones del marker
 * @returns {google.maps.Marker} Marker creado
 */
export function crearMarker(map, options = {}) {
    try {
        const defaultOptions = {
            map: map,
            animation: google.maps.Animation.DROP,
            // icon personalizado si se necesita
        };

        const markerOptions = { ...defaultOptions, ...options };
        const marker = new google.maps.Marker(markerOptions);

        console.log('📍 Marker creado:', marker.getPosition().toString());
        return marker;

    } catch (error) {
        console.error('❌ Error al crear marker:', error);
        throw error;
    }
}

// ============================================
// AGREGAR INFO WINDOW
// ============================================

/**
 * Agregar ventana de información a un marker
 * @param {google.maps.Marker} marker - Marker
 * @param {string} content - Contenido HTML
 * @returns {google.maps.InfoWindow} InfoWindow creado
 */
export function agregarInfoWindow(marker, content) {
    try {
        const infoWindow = new google.maps.InfoWindow({
            content: content
        });

        // Abrir al hacer click
        marker.addListener('click', () => {
            infoWindow.open(marker.getMap(), marker);
        });

        return infoWindow;

    } catch (error) {
        console.error('❌ Error al crear InfoWindow:', error);
        throw error;
    }
}

// ============================================
// CENTRAR MAPA EN UBICACIÓN
// ============================================

/**
 * Centrar mapa en coordenadas específicas
 * @param {google.maps.Map} map - Instancia del mapa
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @param {number} zoom - Nivel de zoom (opcional)
 */
export function centrarMapa(map, lat, lng, zoom = null) {
    try {
        const position = { lat, lng };
        map.setCenter(position);
        
        if (zoom !== null) {
            map.setZoom(zoom);
        }

        console.log(`📍 Mapa centrado en: ${lat}, ${lng}`);

    } catch (error) {
        console.error('❌ Error al centrar mapa:', error);
    }
}

// ============================================
// CALCULAR DISTANCIA (HAVERSINE)
// ============================================

/**
 * Calcular distancia entre dos puntos usando fórmula de Haversine
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lon1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lon2 - Longitud punto 2
 * @returns {number} Distancia en kilómetros
 */
export function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;
    
    return Math.round(distancia * 10) / 10; // Redondear a 1 decimal
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
 * Formatear distancia para mostrar
 * @param {number} distanciaKm - Distancia en kilómetros
 * @returns {string} Distancia formateada
 */
export function formatearDistancia(distanciaKm) {
    if (distanciaKm < 1) {
        return `${Math.round(distanciaKm * 1000)} m`;
    }
    return `${distanciaKm} km`;
}

// ============================================
// ESTILOS PERSONALIZADOS DEL MAPA
// ============================================

/**
 * Estilos personalizados para el mapa (opcional)
 * @returns {Array} Array de estilos
 */
function estilosMapa() {
    // Puedes personalizar los colores del mapa aquí
    // Por ahora usamos el estilo por defecto
    return [];
    
    // Ejemplo de estilo personalizado (descomentarlo si quieres usarlo):
    /*
    return [
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
        },
        {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ffffff' }, { lightness: 17 }]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }]
        }
    ];
    */
}

// ============================================
// OBTENER UBICACIÓN DEL USUARIO
// ============================================

/**
 * Obtener ubicación actual del usuario (navegador)
 * @returns {Promise<{lat, lng}>} Coordenadas del usuario
 */
export function obtenerUbicacionUsuario() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocalización no soportada por el navegador'));
            return;
        }

        console.log('📍 Solicitando ubicación del usuario...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const ubicacion = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('✅ Ubicación obtenida:', ubicacion);
                resolve(ubicacion);
            },
            (error) => {
                console.error('❌ Error al obtener ubicación:', error);
                
                // Mensajes de error más amigables
                let mensaje = 'No se pudo obtener tu ubicación';
                switch (error.code) {
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

// ============================================
// UTILIDADES
// ============================================

/**
 * Verificar si Google Maps API está cargada
 * @returns {boolean} True si está cargada
 */
export function mapsAPIEstasCargada() {
    return mapsAPILoaded && window.google && window.google.maps;
}

/**
 * Limpiar todos los markers de un mapa
 * @param {Array<google.maps.Marker>} markers - Array de markers
 */
export function limpiarMarkers(markers) {
    if (!Array.isArray(markers)) {
        console.warn('⚠️ limpiarMarkers espera un array');
        return;
    }

    markers.forEach(marker => {
        marker.setMap(null);
    });

    console.log(`🗑️ ${markers.length} markers eliminados`);
}

console.log('✅ Módulo google-maps.js cargado correctamente');
