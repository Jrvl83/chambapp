/**
 * Módulo de Google Maps para ubicación
 * Maneja: carga de API, mapa preview, autocomplete, reverse geocoding
 *
 * @module publicar-oferta/google-maps-ubicacion
 */

import { GOOGLE_MAPS_API_KEY } from '../config/api-keys.js';

// ============================================
// VARIABLES DEL MÓDULO
// ============================================
let googleMapsLoaded = false;
let googleMapsLoading = false;
let mapaPreview = null;
let marcadorPreview = null;
let sugerenciasContainer = null;
let sugerenciasActuales = [];

// Bounds de Perú
const PERU_BOUNDS = {
    north: -0.0389,
    south: -18.3516,
    east: -68.6519,
    west: -81.3269
};

// ============================================
// CALLBACKS (inyectados desde ubicacion.js)
// ============================================
let callbacks = {
    onUbicacionSeleccionada: null,
    autocompletarUbigeo: null
};

export function setGoogleMapsCallbacks(cbs) {
    callbacks = { ...callbacks, ...cbs };
}

// ============================================
// CARGAR GOOGLE MAPS API
// ============================================
export async function cargarGoogleMapsAPI() {
    if (googleMapsLoaded) return Promise.resolve();

    if (googleMapsLoading) {
        return new Promise((resolve) => {
            const checkLoaded = setInterval(() => {
                if (googleMapsLoaded) {
                    clearInterval(checkLoaded);
                    resolve();
                }
            }, 100);
        });
    }

    googleMapsLoading = true;

    return new Promise((resolve, reject) => {
        window.initGoogleMapsPublicar = () => {
            googleMapsLoaded = true;
            googleMapsLoading = false;
            resolve();
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker&loading=async&callback=initGoogleMapsPublicar`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
            googleMapsLoading = false;
            reject(new Error('Error al cargar Google Maps'));
        };
        document.head.appendChild(script);
    });
}

// ============================================
// MAPA PREVIEW
// ============================================
export async function inicializarMapaPreview() {
    try {
        await cargarGoogleMapsAPI();

        const contenedorMapa = document.getElementById('mapa-preview');
        if (!contenedorMapa) return;

        mapaPreview = new google.maps.Map(contenedorMapa, {
            center: { lat: -12.0464, lng: -77.0428 },
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
        });

        marcadorPreview = new google.maps.Marker({
            map: mapaPreview,
            visible: false,
            animation: google.maps.Animation.DROP
        });

        contenedorMapa.classList.add('loaded');
    } catch (error) {
        console.error('Error al inicializar mapa preview:', error);
    }
}

export function actualizarMapaPreview(lat, lng, texto = '') {
    if (!mapaPreview || !marcadorPreview) return;

    const posicion = { lat, lng };
    mapaPreview.setCenter(posicion);
    mapaPreview.setZoom(15);
    marcadorPreview.setPosition(posicion);
    marcadorPreview.setVisible(true);

    const infoContainer = document.getElementById('mapa-ubicacion-info');
    const textoUbicacion = document.getElementById('mapa-ubicacion-texto');
    if (infoContainer && textoUbicacion) {
        infoContainer.style.display = 'flex';
        textoUbicacion.textContent = texto || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
}

export function getMapaPreview() {
    return { mapaPreview, marcadorPreview };
}

// ============================================
// AUTOCOMPLETE DE DIRECCIONES
// ============================================
export async function inicializarAutocomplete() {
    try {
        await cargarGoogleMapsAPI();

        const contenedorAutocomplete = document.getElementById('direccion-autocomplete-container');
        if (!contenedorAutocomplete) return;

        contenedorAutocomplete.innerHTML = `
            <input type="text" id="direccion-exacta" name="direccion-exacta"
                placeholder="Ej: Av. Larco 345, Miraflores" maxlength="200"
                autocomplete="off" class="direccion-input">
            <div id="sugerencias-direccion" class="sugerencias-container"></div>
        `;

        const inputDireccion = document.getElementById('direccion-exacta');
        sugerenciasContainer = document.getElementById('sugerencias-direccion');

        let debounceTimer;
        inputDireccion.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();
            if (query.length < 3) {
                ocultarSugerencias();
                return;
            }
            debounceTimer = setTimeout(() => buscarSugerencias(query), 300);
        });

        document.addEventListener('click', (e) => {
            if (!contenedorAutocomplete.contains(e.target)) ocultarSugerencias();
        });

        inputDireccion.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') ocultarSugerencias();
        });
    } catch (error) {
        console.error('Error al inicializar autocomplete:', error);
        mostrarInputFallback();
    }
}

async function buscarSugerencias(query) {
    try {
        const { AutocompleteSuggestion } = await google.maps.importLibrary("places");
        const request = {
            input: query,
            includedRegionCodes: ['pe'],
            includedPrimaryTypes: ['street_address', 'route', 'premise', 'subpremise', 'establishment']
        };
        const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        if (suggestions && suggestions.length > 0) {
            sugerenciasActuales = suggestions;
            mostrarSugerencias(suggestions);
        } else {
            ocultarSugerencias();
        }
    } catch {
        ocultarSugerencias();
    }
}

function mostrarSugerencias(suggestions) {
    if (!sugerenciasContainer) return;

    sugerenciasContainer.innerHTML = suggestions.map((suggestion, index) => {
        const prediction = suggestion.placePrediction;
        const mainText = prediction.mainText?.text || prediction.text?.text || '';
        const secondaryText = prediction.secondaryText?.text || '';
        return `
            <div class="sugerencia-item" data-index="${index}">
                <span class="sugerencia-icon">📍</span>
                <div class="sugerencia-texto">
                    <span class="sugerencia-principal">${mainText}</span>
                    <span class="sugerencia-secundario">${secondaryText}</span>
                </div>
            </div>
        `;
    }).join('');

    sugerenciasContainer.style.display = 'block';

    sugerenciasContainer.querySelectorAll('.sugerencia-item').forEach(item => {
        item.addEventListener('click', () => {
            seleccionarSugerencia(parseInt(item.dataset.index));
        });
    });
}

function ocultarSugerencias() {
    if (sugerenciasContainer) {
        sugerenciasContainer.style.display = 'none';
        sugerenciasContainer.innerHTML = '';
    }
    sugerenciasActuales = [];
}

async function seleccionarSugerencia(index) {
    try {
        const suggestion = sugerenciasActuales[index];
        if (!suggestion) return;

        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({ fields: ['formattedAddress', 'location', 'addressComponents'] });

        const inputDireccion = document.getElementById('direccion-exacta');
        if (inputDireccion) inputDireccion.value = place.formattedAddress || '';

        ocultarSugerencias();

        if (!place.location) return;

        const lat = place.location.lat();
        const lng = place.location.lng();

        if (!validarCoordenadasPeru(lat, lng)) {
            if (typeof toastWarning === 'function') toastWarning('La dirección debe estar dentro de Perú');
            return;
        }

        // Notificar al módulo principal
        if (callbacks.onUbicacionSeleccionada) {
            callbacks.onUbicacionSeleccionada({
                lat,
                lng,
                direccion: place.formattedAddress
            });
        }

        if (place.addressComponents && callbacks.autocompletarUbigeo) {
            await callbacks.autocompletarUbigeo(place.addressComponents);
        }

        actualizarMapaPreview(lat, lng, place.formattedAddress);

        if (typeof toastSuccess === 'function') toastSuccess('Ubicación seleccionada correctamente');
    } catch (error) {
        console.error('Error al obtener detalles:', error);
        if (typeof toastError === 'function') toastError('Error al procesar la dirección');
    }
}

function mostrarInputFallback() {
    const contenedor = document.getElementById('direccion-autocomplete-container');
    if (!contenedor) return;
    contenedor.innerHTML = `
        <input type="text" id="direccion-exacta" name="direccion-exacta"
            placeholder="Ej: Av. Larco 345, Miraflores (sin autocompletado)"
            maxlength="200" autocomplete="off" class="fallback-input">
    `;
}

// ============================================
// VALIDACIÓN
// ============================================
export function validarCoordenadasPeru(lat, lng) {
    return lat >= PERU_BOUNDS.south && lat <= PERU_BOUNDS.north &&
           lng >= PERU_BOUNDS.west && lng <= PERU_BOUNDS.east;
}

// ============================================
// REVERSE GEOCODING
// ============================================
export async function obtenerDistritoPorCoordenadas(lat, lng) {
    try {
        const { Geocoder } = await google.maps.importLibrary("geocoding");
        const geocoder = new Geocoder();
        const response = await geocoder.geocode({ location: { lat, lng } });

        if (response.results && response.results.length > 0) {
            // Estrategia 1: sublocality_level_1
            for (const result of response.results) {
                if (result.types.includes('sublocality_level_1') || result.types.includes('sublocality')) {
                    for (const component of result.address_components) {
                        if (component.types.includes('sublocality_level_1') || component.types.includes('sublocality')) {
                            const distrito = component.long_name.replace(/^(Distrito de|Distrito)\s*/i, '').trim();
                            if (distrito.toLowerCase() !== 'lima') return distrito;
                        }
                    }
                }
            }

            // Estrategia 2: administrative_area_level_3
            for (const result of response.results) {
                for (const component of result.address_components) {
                    if (component.types.includes('administrative_area_level_3')) {
                        const distrito = component.long_name.replace(/^(Distrito de|Distrito)\s*/i, '').trim();
                        if (distrito.toLowerCase() !== 'lima') return distrito;
                    }
                }
            }

            // Estrategia 3: código postal
            for (const result of response.results) {
                for (const component of result.address_components) {
                    if (component.types.includes('postal_code')) {
                        const distritoInferido = obtenerDistritoPorCodigoPostal(component.long_name);
                        if (distritoInferido) return distritoInferido;
                    }
                }
            }

            return 'Lima';
        }
        return null;
    } catch {
        return null;
    }
}

// ============================================
// CÓDIGOS POSTALES DE LIMA
// ============================================
export function obtenerDistritoPorCodigoPostal(codigo) {
    const mapa = {
        '15301': 'Los Olivos', '15302': 'Los Olivos', '15303': 'Los Olivos',
        '15101': 'San Martin de Porres', '15102': 'San Martin de Porres',
        '15311': 'Comas', '15312': 'Comas', '15313': 'Comas',
        '15401': 'San Juan de Lurigancho', '15402': 'San Juan de Lurigancho',
        '15074': 'Miraflores', '15046': 'Miraflores', '15047': 'Miraflores',
        '15036': 'San Isidro', '15073': 'San Isidro', '15076': 'San Isidro',
        '15038': 'Santiago de Surco', '15039': 'Santiago de Surco',
        '15023': 'La Molina', '15024': 'La Molina',
        '15034': 'San Borja', '15037': 'San Borja',
        '15072': 'Jesus Maria', '15084': 'Pueblo Libre',
        '15086': 'Magdalena del Mar', '15063': 'Barranco',
        '15064': 'Chorrillos', '15816': 'Villa El Salvador',
        '15801': 'San Juan de Miraflores', '15806': 'Villa Maria del Triunfo',
        '15022': 'Ate', '15011': 'Santa Anita', '15007': 'El Agustino',
        '15018': 'La Victoria', '15083': 'Brena', '15094': 'Rimac',
        '15001': 'Lima', '07001': 'Callao'
    };
    return mapa[codigo] || null;
}
