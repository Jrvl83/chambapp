/**
 * Módulo de inicialización y control del mapa Google Maps
 * Maneja la carga de APIs, controles y geolocalización
 *
 * @module mapa-ofertas/mapa
 */

import { GOOGLE_MAPS_API_KEY } from '../config/api-keys.js';

// Referencias inyectadas
let state = null;
let callbacks = {};

/**
 * Inicializa el módulo de mapa
 * @param {Object} sharedState - Estado compartido
 * @param {Object} cbs - Objeto compartido de callbacks
 */
export function initMapa(sharedState, cbs) {
    state = sharedState;
    callbacks = cbs;

    // Registrar callbacks que otros módulos necesitan
    cbs.toggleSidebar = toggleSidebar;
    cbs.ajustarBounds = ajustarBounds;
}

// ============================================
// CARGAR APIs
// ============================================

function cargarGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve(window.google.maps);
            return;
        }

        window.initMapaOfertas = () => {
            resolve(window.google.maps);
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMapaOfertas&libraries=places,marker`;
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error('Error al cargar Google Maps'));
        document.head.appendChild(script);
    });
}

function cargarMarkerClusterer() {
    return new Promise((resolve) => {
        if (window.markerClusterer?.MarkerClusterer) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
        script.async = true;
        script.onload = () => setTimeout(resolve, 100);
        script.onerror = () => resolve();
        document.head.appendChild(script);
    });
}

// ============================================
// INICIALIZAR MAPA
// ============================================

function estilosMapaPersonalizados() {
    return [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
        }
    ];
}

/**
 * Inicializa el mapa de Google Maps
 */
export async function inicializarMapa() {
    try {
        await cargarGoogleMapsAPI();
        await cargarMarkerClusterer();

        const mapElement = document.getElementById('mapa');
        state.mapa = new google.maps.Map(mapElement, {
            center: { lat: -12.0464, lng: -77.0428 },
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            styles: estilosMapaPersonalizados()
        });

        const loading = document.getElementById('mapa-loading');
        if (loading) loading.classList.add('oculto');
    } catch (error) {
        console.error('Error al inicializar mapa:', error);
        mostrarErrorMapa();
    }
}

function mostrarErrorMapa() {
    const loading = document.getElementById('mapa-loading');
    if (loading) {
        loading.innerHTML = `
            <div class="mapa-empty-state scale-in">
                <div class="icono">&#9888;</div>
                <p>Error al cargar el mapa. Verifica tu conexión.</p>
                <button class="btn btn-primary touchable" onclick="location.reload()">Reintentar</button>
            </div>
        `;
    }
}

// ============================================
// BOUNDS Y CONTROLES
// ============================================

function ajustarBounds() {
    if (state.markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    state.markers.forEach(marker => {
        bounds.extend(marker.getPosition());
    });

    if (state.ubicacionUsuario) {
        bounds.extend(new google.maps.LatLng(
            state.ubicacionUsuario.lat,
            state.ubicacionUsuario.lng
        ));
    }

    state.mapa.fitBounds(bounds);

    const listener = google.maps.event.addListener(state.mapa, 'idle', function () {
        if (state.mapa.getZoom() > 15) state.mapa.setZoom(15);
        google.maps.event.removeListener(listener);
    });
}

// ============================================
// GEOLOCALIZACIÓN
// ============================================

function crearMarkerUsuario(position) {
    new google.maps.Marker({
        position,
        map: state.mapa,
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <circle fill="#4285f4" cx="12" cy="12" r="10"/>
                    <circle fill="#fff" cx="12" cy="12" r="4"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(24, 24),
            anchor: new google.maps.Point(12, 12)
        },
        title: 'Tu ubicacion'
    });
}

async function centrarEnMiUbicacion() {
    try {
        if (state.ubicacionUsuario) {
            state.mapa.panTo(state.ubicacionUsuario);
            state.mapa.setZoom(14);
            return;
        }

        if (!navigator.geolocation) {
            if (typeof mostrarToast === 'function') {
                mostrarToast('Tu navegador no soporta geolocalizacion', 'error');
            }
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                state.ubicacionUsuario = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                state.mapa.panTo(state.ubicacionUsuario);
                state.mapa.setZoom(14);
                crearMarkerUsuario(state.ubicacionUsuario);
                callbacks.actualizarListaSidebar();
            },
            (error) => {
                console.error('Error obteniendo ubicacion:', error);
                if (typeof mostrarToast === 'function') {
                    mostrarToast('No se pudo obtener tu ubicacion', 'error');
                }
            }
        );
    } catch (error) {
        console.error('Error:', error);
    }
}

// ============================================
// SIDEBAR TOGGLE
// ============================================

function toggleSidebar() {
    const sidebar = document.getElementById('mapa-sidebar');
    const overlay = document.querySelector('.mapa-overlay');

    if (sidebar) {
        sidebar.classList.toggle('activo');
    }

    if (!overlay && window.innerWidth < 768) {
        const nuevoOverlay = document.createElement('div');
        nuevoOverlay.className = 'mapa-overlay';
        nuevoOverlay.onclick = toggleSidebar;
        document.body.appendChild(nuevoOverlay);
        setTimeout(() => nuevoOverlay.classList.add('activo'), 10);
    } else if (overlay) {
        overlay.classList.toggle('activo');
    }
}

/**
 * Registra las funciones globales del módulo de mapa
 */
export function registrarFuncionesGlobalesMapa() {
    window.centrarEnMiUbicacion = centrarEnMiUbicacion;
    window.toggleSidebar = toggleSidebar;
}
