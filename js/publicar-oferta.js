// ============================================
// PUBLICAR OFERTA - FORMULARIO MULTI-PASO
// ChambApp - Con Sistema de Edicion + Ubicacion RENIEC
// ============================================

// Firebase - Importar instancias centralizadas
import { auth, db } from './config/firebase-init.js';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { obtenerDepartamentos, obtenerProvincias, obtenerDistritos, obtenerCoordenadasDistrito } from './utils/ubigeo-api.js';
import { GOOGLE_MAPS_API_KEY } from './config/api-keys.js';

// Verificar autenticacion
const usuarioStr = localStorage.getItem('usuarioChambApp');
if (!usuarioStr) {
    if (typeof toastError === 'function') {
        toastError('Debes iniciar sesion para publicar ofertas');
        setTimeout(() => window.location.href = 'login.html', 1000);
    } else {
        alert('Debes iniciar sesion para publicar ofertas');
        window.location.href = 'login.html';
    }
}

const usuario = JSON.parse(usuarioStr || '{}');

// Verificar que sea empleador
if (usuario.tipo !== 'empleador') {
    if (typeof toastError === 'function') {
        toastError('Solo los empleadores pueden publicar ofertas');
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } else {
        alert('Solo los empleadores pueden publicar ofertas');
        window.location.href = 'dashboard.html';
    }
}

// ============================================
// DETECTAR MODO: CREAR O EDITAR
// ============================================
const urlParams = new URLSearchParams(window.location.search);
const ofertaId = urlParams.get('id');
const modoEdicion = !!ofertaId;

console.log(modoEdicion ? `馃摑 Modo Edici贸n - ID: ${ofertaId}` : '鉃?Modo Crear Nueva');

// ============================================
// VARIABLES GLOBALES
// ============================================
let currentStep = 1;
const totalSteps = 4;

const formSteps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.progress-steps .step');
const progressFill = document.getElementById('progressFill');
const currentStepDisplay = document.getElementById('currentStep');

const btnPrevious = document.getElementById('btnPrevious');
const btnNext = document.getElementById('btnNext');
const btnSubmit = document.getElementById('btnSubmit');
const formOferta = document.getElementById('formOferta');

// Variables para el sistema de ubicacion
let departamentoSeleccionado = null;
let provinciaSeleccionada = null;
let distritoSeleccionado = null;

// Variables para Google Maps y Places
let mapaPreview = null;
let marcadorPreview = null;
let autocomplete = null;
let coordenadasSeleccionadas = null;
let direccionExactaSeleccionada = null;

// Bounds de Peru (para validacion)
const PERU_BOUNDS = {
    north: -0.0389,
    south: -18.3516,
    east: -68.6519,
    west: -81.3269
};

// ============================================
// CARGAR GOOGLE MAPS API CON PLACES
// ============================================
let googleMapsLoaded = false;
let googleMapsLoading = false;

async function cargarGoogleMapsAPI() {
    if (googleMapsLoaded) {
        return Promise.resolve();
    }

    if (googleMapsLoading) {
        // Esperar a que termine de cargar
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
            console.log('✅ Google Maps API cargada para publicar-oferta');
            resolve();
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker&loading=async&callback=initGoogleMapsPublicar`;
        script.async = true;
        script.defer = true;

        script.onerror = () => {
            googleMapsLoading = false;
            console.error('❌ Error al cargar Google Maps API');
            reject(new Error('Error al cargar Google Maps'));
        };

        document.head.appendChild(script);
    });
}

// ============================================
// INICIALIZAR MAPA PREVIEW
// ============================================
async function inicializarMapaPreview() {
    try {
        await cargarGoogleMapsAPI();

        const contenedorMapa = document.getElementById('mapa-preview');
        if (!contenedorMapa) return;

        // Crear mapa centrado en Lima por defecto
        mapaPreview = new google.maps.Map(contenedorMapa, {
            center: { lat: -12.0464, lng: -77.0428 },
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });

        // Crear marcador (inicialmente oculto)
        marcadorPreview = new google.maps.Marker({
            map: mapaPreview,
            visible: false,
            animation: google.maps.Animation.DROP
        });

        // Marcar como cargado
        contenedorMapa.classList.add('loaded');

        console.log('✅ Mapa preview inicializado');

    } catch (error) {
        console.error('❌ Error al inicializar mapa preview:', error);
    }
}

// ============================================
// INICIALIZAR AUTOCOMPLETE DE DIRECCIONES (Nueva Places API)
// ============================================
let sugerenciasContainer = null;
let sugerenciasActuales = []; // Guardar las sugerencias para acceder después

async function inicializarAutocomplete() {
    try {
        await cargarGoogleMapsAPI();

        const contenedorAutocomplete = document.getElementById('direccion-autocomplete-container');
        if (!contenedorAutocomplete) {
            console.warn('⚠️ Contenedor de autocomplete no encontrado');
            return;
        }

        // Crear input y contenedor de sugerencias
        contenedorAutocomplete.innerHTML = `
            <input
                type="text"
                id="direccion-exacta"
                name="direccion-exacta"
                placeholder="Ej: Av. Larco 345, Miraflores"
                maxlength="200"
                autocomplete="off"
                class="direccion-input"
            >
            <div id="sugerencias-direccion" class="sugerencias-container"></div>
        `;

        const inputDireccion = document.getElementById('direccion-exacta');
        sugerenciasContainer = document.getElementById('sugerencias-direccion');

        // Evento al escribir
        let debounceTimer;
        inputDireccion.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();

            if (query.length < 3) {
                ocultarSugerencias();
                return;
            }

            debounceTimer = setTimeout(() => {
                buscarSugerencias(query);
            }, 300);
        });

        // Ocultar sugerencias al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!contenedorAutocomplete.contains(e.target)) {
                ocultarSugerencias();
            }
        });

        // Navegación con teclado
        inputDireccion.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                ocultarSugerencias();
            }
        });

        console.log('✅ Autocomplete (Nueva Places API) inicializado');

    } catch (error) {
        console.error('❌ Error al inicializar autocomplete:', error);
        mostrarInputFallback();
    }
}

// Buscar sugerencias de direcciones usando la nueva API
async function buscarSugerencias(query) {
    try {
        // Importar AutocompleteSuggestion de la nueva API
        const { AutocompleteSuggestion } = await google.maps.importLibrary("places");

        const request = {
            input: query,
            includedRegionCodes: ['pe'], // Restringir a Perú
            includedPrimaryTypes: ['street_address', 'route', 'premise', 'subpremise', 'establishment']
        };

        const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

        if (suggestions && suggestions.length > 0) {
            sugerenciasActuales = suggestions;
            mostrarSugerencias(suggestions);
        } else {
            ocultarSugerencias();
        }
    } catch (error) {
        console.error('Error al buscar sugerencias:', error);
        ocultarSugerencias();
    }
}

// Mostrar sugerencias en el dropdown
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

    // Agregar eventos a cada sugerencia
    sugerenciasContainer.querySelectorAll('.sugerencia-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            seleccionarSugerencia(index);
        });
    });
}

// Ocultar sugerencias
function ocultarSugerencias() {
    if (sugerenciasContainer) {
        sugerenciasContainer.style.display = 'none';
        sugerenciasContainer.innerHTML = '';
    }
    sugerenciasActuales = [];
}

// Seleccionar una sugerencia y obtener detalles
async function seleccionarSugerencia(index) {
    try {
        const suggestion = sugerenciasActuales[index];
        if (!suggestion) return;

        // Convertir la predicción a un objeto Place
        const place = suggestion.placePrediction.toPlace();

        // Obtener los detalles del lugar
        await place.fetchFields({
            fields: ['formattedAddress', 'location', 'addressComponents']
        });

        console.log('📍 Place seleccionado:', place);
        console.log('📍 Address Components:', place.addressComponents);

        // Actualizar input con la dirección formateada
        const inputDireccion = document.getElementById('direccion-exacta');
        if (inputDireccion) {
            inputDireccion.value = place.formattedAddress || '';
        }

        ocultarSugerencias();

        if (!place.location) {
            console.warn('⚠️ No se encontro ubicacion');
            return;
        }

        const lat = place.location.lat();
        const lng = place.location.lng();

        // Validar que este en Peru
        if (!validarCoordenadasPeru(lat, lng)) {
            if (typeof toastWarning === 'function') {
                toastWarning('La direccion debe estar dentro de Peru');
            }
            return;
        }

        // Guardar coordenadas y direccion
        coordenadasSeleccionadas = { lat, lng };
        direccionExactaSeleccionada = place.formattedAddress;

        // Extraer y llenar departamento, provincia, distrito
        if (place.addressComponents) {
            await autocompletarUbigeo(place.addressComponents);
        }

        // Actualizar mapa
        actualizarMapaPreview(lat, lng, place.formattedAddress);

        // Mostrar toast de éxito
        if (typeof toastSuccess === 'function') {
            toastSuccess('Ubicación seleccionada correctamente');
        }

        console.log('✅ Direccion seleccionada:', place.formattedAddress);
        console.log('✅ Coordenadas:', lat, lng);

    } catch (error) {
        console.error('❌ Error al obtener detalles:', error);
        if (typeof toastError === 'function') {
            toastError('Error al procesar la dirección');
        }
    }
}

// ============================================
// AUTOCOMPLETAR UBIGEO DESDE ADDRESS COMPONENTS
// ============================================
async function autocompletarUbigeo(addressComponents, coordenadas = null) {
    if (!addressComponents || addressComponents.length === 0) {
        console.warn('⚠️ No hay address components para autocompletar');
        return;
    }

    console.log('📍 Address Components recibidos:', addressComponents);

    // Extraer información de los componentes
    let departamento = '';
    let provincia = '';
    let distrito = '';
    let codigoPostal = '';
    let localityFound = false;

    for (const component of addressComponents) {
        const types = component.types || [];
        const nombre = component.longText || component.long_name || component.shortText || component.short_name || '';

        console.log('Component:', { types, nombre });

        // Código postal - guardar para inferir distrito
        if (types.includes('postal_code')) {
            codigoPostal = nombre;
        }

        // Departamento (administrative_area_level_1)
        if (types.includes('administrative_area_level_1')) {
            departamento = nombre;
            departamento = departamento
                .replace(/^(Región|Region|Departamento de|Gobierno Regional de|Provincia de)\s*/i, '')
                .trim();
        }

        // Provincia (administrative_area_level_2)
        if (types.includes('administrative_area_level_2')) {
            provincia = nombre;
            provincia = provincia.replace(/^(Provincia de|Provincia)\s*/i, '').trim();
        }

        // Distrito - locality es el más confiable
        if (types.includes('locality')) {
            distrito = nombre.replace(/^(Distrito de|Distrito)\s*/i, '').trim();
            localityFound = true;
        }

        // sublocality_level_1 a veces tiene el distrito en Lima
        if (!localityFound && types.includes('sublocality_level_1')) {
            distrito = nombre.replace(/^(Distrito de|Distrito)\s*/i, '').trim();
        }

        // administrative_area_level_3 es backup para distrito
        if (!distrito && types.includes('administrative_area_level_3')) {
            distrito = nombre.replace(/^(Distrito de|Distrito)\s*/i, '').trim();
        }
    }

    // Caso especial: Lima Metropolitana
    if (departamento === 'Lima' && !provincia) {
        provincia = 'Lima';
    }

    // Si el distrito es "Lima" o está vacío y tenemos código postal, inferir distrito
    if (codigoPostal && (distrito.toLowerCase() === 'lima' || !distrito)) {
        const distritoInferido = obtenerDistritoPorCodigoPostal(codigoPostal);
        if (distritoInferido && distritoInferido.toLowerCase() !== 'lima') {
            console.log(`📍 Distrito inferido por código postal ${codigoPostal}:`, distritoInferido);
            distrito = distritoInferido;
        }
    }

    console.log('📍 Ubigeo extraído (inicial):', { departamento, provincia, distrito, codigoPostal });

    // Intentar seleccionar departamento y provincia
    if (departamento) {
        const deptoOk = await seleccionarDepartamento(departamento);
        if (deptoOk) {
            await new Promise(resolve => setTimeout(resolve, 600));

            if (provincia) {
                const provOk = await seleccionarProvincia(provincia);
                if (provOk) {
                    await new Promise(resolve => setTimeout(resolve, 600));

                    // Intentar seleccionar el distrito
                    if (distrito) {
                        const distOk = await seleccionarDistrito(distrito);

                        // Si no se encontró y tenemos coordenadas, usar reverse geocoding
                        if (!distOk && coordenadasSeleccionadas) {
                            console.log('🔄 Distrito no encontrado, usando reverse geocoding...');
                            const distritoReverso = await obtenerDistritoPorCoordenadas(
                                coordenadasSeleccionadas.lat,
                                coordenadasSeleccionadas.lng
                            );
                            if (distritoReverso) {
                                await seleccionarDistrito(distritoReverso);
                            }
                        }
                    } else if (coordenadasSeleccionadas) {
                        // Si no tenemos distrito, intentar obtenerlo por reverse geocoding
                        console.log('🔄 No hay distrito, usando reverse geocoding...');
                        const distritoReverso = await obtenerDistritoPorCoordenadas(
                            coordenadasSeleccionadas.lat,
                            coordenadasSeleccionadas.lng
                        );
                        if (distritoReverso) {
                            await seleccionarDistrito(distritoReverso);
                        }
                    }
                }
            }
        }
    }
}

// Obtener distrito usando reverse geocoding
async function obtenerDistritoPorCoordenadas(lat, lng) {
    try {
        const { Geocoder } = await google.maps.importLibrary("geocoding");
        const geocoder = new Geocoder();

        const response = await geocoder.geocode({
            location: { lat, lng }
        });

        console.log('🔍 Reverse geocoding results:', response.results);

        if (response.results && response.results.length > 0) {
            // Estrategia 1: Buscar resultado con tipo "sublocality_level_1" (más específico para distritos en Lima)
            for (const result of response.results) {
                // Buscar resultados que sean específicamente de tipo sublocality
                if (result.types.includes('sublocality_level_1') || result.types.includes('sublocality')) {
                    for (const component of result.address_components) {
                        if (component.types.includes('sublocality_level_1') || component.types.includes('sublocality')) {
                            const distrito = component.long_name.replace(/^(Distrito de|Distrito)\s*/i, '').trim();
                            if (distrito.toLowerCase() !== 'lima') {
                                console.log('📍 Distrito (sublocality) encontrado:', distrito);
                                return distrito;
                            }
                        }
                    }
                }
            }

            // Estrategia 2: Buscar en resultados de tipo "neighborhood" o "political"
            for (const result of response.results) {
                if (result.types.includes('neighborhood') || result.types.includes('political')) {
                    for (const component of result.address_components) {
                        if (component.types.includes('locality') ||
                            component.types.includes('sublocality_level_1') ||
                            component.types.includes('administrative_area_level_3')) {
                            const distrito = component.long_name.replace(/^(Distrito de|Distrito)\s*/i, '').trim();
                            if (distrito.toLowerCase() !== 'lima') {
                                console.log('📍 Distrito (neighborhood/political) encontrado:', distrito);
                                return distrito;
                            }
                        }
                    }
                }
            }

            // Estrategia 3: Buscar administrative_area_level_3 en cualquier resultado
            for (const result of response.results) {
                for (const component of result.address_components) {
                    if (component.types.includes('administrative_area_level_3')) {
                        const distrito = component.long_name.replace(/^(Distrito de|Distrito)\s*/i, '').trim();
                        if (distrito.toLowerCase() !== 'lima') {
                            console.log('📍 Distrito (admin_level_3) encontrado:', distrito);
                            return distrito;
                        }
                    }
                }
            }

            // Estrategia 4: Buscar locality que NO sea "Lima"
            for (const result of response.results) {
                for (const component of result.address_components) {
                    if (component.types.includes('locality')) {
                        const distrito = component.long_name.replace(/^(Distrito de|Distrito)\s*/i, '').trim();
                        if (distrito.toLowerCase() !== 'lima') {
                            console.log('📍 Distrito (locality) encontrado:', distrito);
                            return distrito;
                        }
                    }
                }
            }

            // Estrategia 5: Usar código postal para inferir distrito (Lima)
            for (const result of response.results) {
                for (const component of result.address_components) {
                    if (component.types.includes('postal_code')) {
                        const codigoPostal = component.long_name;
                        const distritoInferido = obtenerDistritoPorCodigoPostal(codigoPostal);
                        if (distritoInferido) {
                            console.log('📍 Distrito inferido por código postal:', distritoInferido);
                            return distritoInferido;
                        }
                    }
                }
            }

            // Si todo falla, devolver Lima
            console.log('⚠️ No se pudo determinar distrito específico, usando Lima');
            return 'Lima';
        }

        return null;
    } catch (error) {
        console.error('Error en reverse geocoding:', error);
        return null;
    }
}

// Mapeo de códigos postales a distritos de Lima Metropolitana
function obtenerDistritoPorCodigoPostal(codigo) {
    const mapaCodigosPostales = {
        // Los Olivos
        '15301': 'Los Olivos',
        '15302': 'Los Olivos',
        '15303': 'Los Olivos',
        '15304': 'Los Olivos',
        '15305': 'Los Olivos',
        '15306': 'Los Olivos',
        // San Martín de Porres
        '15101': 'San Martin de Porres',
        '15102': 'San Martin de Porres',
        '15103': 'San Martin de Porres',
        '15104': 'San Martin de Porres',
        '15105': 'San Martin de Porres',
        '15106': 'San Martin de Porres',
        '15107': 'San Martin de Porres',
        '15108': 'San Martin de Porres',
        '15109': 'San Martin de Porres',
        '15110': 'San Martin de Porres',
        '15111': 'San Martin de Porres',
        '15112': 'San Martin de Porres',
        // Comas
        '15311': 'Comas',
        '15312': 'Comas',
        '15313': 'Comas',
        '15314': 'Comas',
        '15316': 'Comas',
        // Independencia
        '15311': 'Independencia',
        // San Juan de Lurigancho
        '15401': 'San Juan de Lurigancho',
        '15402': 'San Juan de Lurigancho',
        '15403': 'San Juan de Lurigancho',
        '15404': 'San Juan de Lurigancho',
        '15405': 'San Juan de Lurigancho',
        '15406': 'San Juan de Lurigancho',
        '15407': 'San Juan de Lurigancho',
        '15408': 'San Juan de Lurigancho',
        // Miraflores
        '15074': 'Miraflores',
        '15046': 'Miraflores',
        '15047': 'Miraflores',
        '15048': 'Miraflores',
        // San Isidro
        '15036': 'San Isidro',
        '15073': 'San Isidro',
        '15076': 'San Isidro',
        // Surco (Santiago de Surco)
        '15038': 'Santiago de Surco',
        '15039': 'Santiago de Surco',
        '15053': 'Santiago de Surco',
        '15054': 'Santiago de Surco',
        '15055': 'Santiago de Surco',
        '15056': 'Santiago de Surco',
        '15057': 'Santiago de Surco',
        '15058': 'Santiago de Surco',
        // La Molina
        '15023': 'La Molina',
        '15024': 'La Molina',
        '15026': 'La Molina',
        // San Borja
        '15034': 'San Borja',
        '15037': 'San Borja',
        '15041': 'San Borja',
        // Jesús María
        '15072': 'Jesus Maria',
        '15076': 'Jesus Maria',
        // Lince
        '15046': 'Lince',
        // Pueblo Libre
        '15084': 'Pueblo Libre',
        // Magdalena del Mar
        '15086': 'Magdalena del Mar',
        // Barranco
        '15063': 'Barranco',
        // Chorrillos
        '15064': 'Chorrillos',
        '15066': 'Chorrillos',
        '15067': 'Chorrillos',
        // Villa El Salvador
        '15816': 'Villa El Salvador',
        '15817': 'Villa El Salvador',
        // San Juan de Miraflores
        '15801': 'San Juan de Miraflores',
        '15802': 'San Juan de Miraflores',
        '15803': 'San Juan de Miraflores',
        '15804': 'San Juan de Miraflores',
        // Villa María del Triunfo
        '15806': 'Villa Maria del Triunfo',
        '15807': 'Villa Maria del Triunfo',
        '15808': 'Villa Maria del Triunfo',
        // Ate
        '15022': 'Ate',
        '15023': 'Ate',
        '15494': 'Ate',
        // Santa Anita
        '15011': 'Santa Anita',
        // El Agustino
        '15007': 'El Agustino',
        // La Victoria
        '15018': 'La Victoria',
        '15019': 'La Victoria',
        '15033': 'La Victoria',
        // Breña
        '15083': 'Brena',
        // Rímac
        '15094': 'Rimac',
        '15095': 'Rimac',
        '15096': 'Rimac',
        // Cercado de Lima
        '15001': 'Lima',
        '15003': 'Lima',
        '15004': 'Lima',
        '15005': 'Lima',
        '15006': 'Lima',
        '15081': 'Lima',
        '15082': 'Lima',
        // Callao
        '07001': 'Callao',
        '07006': 'Callao',
        '07011': 'Callao',
        '07016': 'Callao',
        '07021': 'Callao',
        '07026': 'Callao',
        '07031': 'Callao',
        '07036': 'Callao',
        '07041': 'Callao',
    };

    return mapaCodigosPostales[codigo] || null;
}

// Buscar y seleccionar departamento por nombre
async function seleccionarDepartamento(nombreDepto) {
    const selectDepto = document.getElementById('departamento');
    if (!selectDepto) return false;

    const nombreNormalizado = normalizarTexto(nombreDepto);

    for (const option of selectDepto.options) {
        if (normalizarTexto(option.text).includes(nombreNormalizado) ||
            nombreNormalizado.includes(normalizarTexto(option.text))) {
            selectDepto.value = option.value;
            // Disparar evento change para cargar provincias
            selectDepto.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Departamento seleccionado:', option.text);
            return true;
        }
    }

    console.warn('⚠️ No se encontró departamento:', nombreDepto);
    return false;
}

// Buscar y seleccionar provincia por nombre
async function seleccionarProvincia(nombreProv) {
    const selectProv = document.getElementById('provincia');
    if (!selectProv) return false;

    // Esperar a que se carguen las opciones
    await new Promise(resolve => setTimeout(resolve, 200));

    const nombreNormalizado = normalizarTexto(nombreProv);

    for (const option of selectProv.options) {
        if (normalizarTexto(option.text).includes(nombreNormalizado) ||
            nombreNormalizado.includes(normalizarTexto(option.text))) {
            selectProv.value = option.value;
            // Disparar evento change para cargar distritos
            selectProv.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Provincia seleccionada:', option.text);
            return true;
        }
    }

    console.warn('⚠️ No se encontró provincia:', nombreProv);
    return false;
}

// Buscar y seleccionar distrito por nombre
async function seleccionarDistrito(nombreDist) {
    const selectDist = document.getElementById('distrito');
    if (!selectDist) return false;

    // Esperar a que se carguen las opciones
    await new Promise(resolve => setTimeout(resolve, 200));

    const nombreNormalizado = normalizarTexto(nombreDist);

    for (const option of selectDist.options) {
        if (normalizarTexto(option.text).includes(nombreNormalizado) ||
            nombreNormalizado.includes(normalizarTexto(option.text))) {
            selectDist.value = option.value;
            // Disparar evento change
            selectDist.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Distrito seleccionado:', option.text);
            return true;
        }
    }

    console.warn('⚠️ No se encontró distrito:', nombreDist);
    return false;
}

// Normalizar texto para comparación
function normalizarTexto(texto) {
    if (!texto) return '';
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
        .trim();
}

// Fallback si la nueva API falla
function mostrarInputFallback() {
    const contenedor = document.getElementById('direccion-autocomplete-container');
    if (!contenedor) return;

    contenedor.innerHTML = `
        <input
            type="text"
            id="direccion-exacta"
            name="direccion-exacta"
            placeholder="Ej: Av. Larco 345, Miraflores (sin autocompletado)"
            maxlength="200"
            autocomplete="off"
            class="fallback-input"
        >
    `;
    console.warn('⚠️ Usando input de fallback sin autocompletado');
}

// ============================================
// VALIDAR COORDENADAS DENTRO DE PERU
// ============================================
function validarCoordenadasPeru(lat, lng) {
    return (
        lat >= PERU_BOUNDS.south &&
        lat <= PERU_BOUNDS.north &&
        lng >= PERU_BOUNDS.west &&
        lng <= PERU_BOUNDS.east
    );
}

// ============================================
// ACTUALIZAR MAPA PREVIEW
// ============================================
function actualizarMapaPreview(lat, lng, texto = '') {
    if (!mapaPreview || !marcadorPreview) {
        console.warn('⚠️ Mapa no inicializado');
        return;
    }

    const posicion = { lat, lng };

    // Centrar mapa
    mapaPreview.setCenter(posicion);
    mapaPreview.setZoom(15);

    // Mostrar marcador
    marcadorPreview.setPosition(posicion);
    marcadorPreview.setVisible(true);

    // Actualizar info de ubicacion
    const infoContainer = document.getElementById('mapa-ubicacion-info');
    const textoUbicacion = document.getElementById('mapa-ubicacion-texto');

    if (infoContainer && textoUbicacion) {
        infoContainer.style.display = 'flex';
        textoUbicacion.textContent = texto || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    console.log('📍 Mapa actualizado:', lat, lng);
}

// ============================================
// INICIALIZAR SISTEMA DE UBICACI脫N
// ============================================
async function inicializarUbicacion() {
    try {
        const selectDepartamento = document.getElementById('departamento');
        selectDepartamento.innerHTML = '<option value="">Cargando departamentos...</option>';
        
        // Obtener departamentos desde API RENIEC
        const departamentos = await obtenerDepartamentos();
        
        // Llenar combo de departamentos
        selectDepartamento.innerHTML = '<option value="">Seleccionar departamento</option>';
        
        departamentos.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            option.dataset.name = dept.name;
            selectDepartamento.appendChild(option);
        });
        
        console.log('鉁?Departamentos cargados:', departamentos.length);
        
    } catch (error) {
        console.error('鉂?Error al cargar departamentos:', error);
        const selectDepartamento = document.getElementById('departamento');
        selectDepartamento.innerHTML = '<option value="">Error al cargar - Reintentar</option>';
        
        if (typeof toastError === 'function') {
            toastError('Error al cargar ubicaciones. Por favor recarga la p谩gina.');
        }
    }
}

// ============================================
// CARGAR PROVINCIAS AL SELECCIONAR DEPARTAMENTO
// ============================================
window.cargarProvincias = async function() {
    const selectDepartamento = document.getElementById('departamento');
    const selectProvincia = document.getElementById('provincia');
    const selectDistrito = document.getElementById('distrito');
    
    const departmentId = selectDepartamento.value;
    
    // Limpiar provincias y distritos
    selectProvincia.innerHTML = '<option value="">Seleccionar provincia</option>';
    selectDistrito.innerHTML = '<option value="">Seleccionar distrito</option>';
    
    // Resetear variables
    departamentoSeleccionado = null;
    provinciaSeleccionada = null;
    distritoSeleccionado = null;
    
    if (!departmentId) return;
    
    try {
        // Guardar informaci贸n del departamento
        const selectedOption = selectDepartamento.options[selectDepartamento.selectedIndex];
        departamentoSeleccionado = {
            id: departmentId,
            nombre: selectedOption.dataset.name || selectedOption.textContent
        };
        
        // Mostrar loading
        selectProvincia.innerHTML = '<option value="">Cargando provincias...</option>';
        
        // Obtener provincias desde API
        const provincias = await obtenerProvincias(departmentId);
        
        // Llenar combo de provincias
        selectProvincia.innerHTML = '<option value="">Seleccionar provincia</option>';
        
        provincias.forEach(prov => {
            const option = document.createElement('option');
            option.value = prov.id;
            option.textContent = prov.name;
            option.dataset.name = prov.name;
            selectProvincia.appendChild(option);
        });
        
        console.log('鉁?Provincias cargadas:', provincias.length);
        
    } catch (error) {
        console.error('鉂?Error al cargar provincias:', error);
        selectProvincia.innerHTML = '<option value="">Error al cargar</option>';
        
        if (typeof toastError === 'function') {
            toastError('Error al cargar provincias');
        }
    }
};

// ============================================
// CARGAR DISTRITOS AL SELECCIONAR PROVINCIA
// ============================================
window.cargarDistritos = async function() {
    const selectProvincia = document.getElementById('provincia');
    const selectDistrito = document.getElementById('distrito');
    
    const provinceId = selectProvincia.value;
    
    // Limpiar distritos
    selectDistrito.innerHTML = '<option value="">Seleccionar distrito</option>';
    
    // Resetear variables
    provinciaSeleccionada = null;
    distritoSeleccionado = null;
    
    if (!provinceId || !departamentoSeleccionado) return;
    
    try {
        // Guardar informaci贸n de la provincia
        const selectedOption = selectProvincia.options[selectProvincia.selectedIndex];
        provinciaSeleccionada = {
            id: provinceId,
            nombre: selectedOption.dataset.name || selectedOption.textContent
        };
        
        // Mostrar loading
        selectDistrito.innerHTML = '<option value="">Cargando distritos...</option>';
        
        // Obtener distritos desde API
        const distritos = await obtenerDistritos(departamentoSeleccionado.id, provinceId);
        
        // Llenar combo de distritos
        selectDistrito.innerHTML = '<option value="">Seleccionar distrito</option>';
        
        distritos.forEach(dist => {
            const option = document.createElement('option');
            option.value = dist.id;
            option.textContent = dist.name;
            option.dataset.name = dist.name;
            selectDistrito.appendChild(option);
        });
        
        console.log('鉁?Distritos cargados:', distritos.length);
        
    } catch (error) {
        console.error('鉂?Error al cargar distritos:', error);
        selectDistrito.innerHTML = '<option value="">Error al cargar</option>';
        
        if (typeof toastError === 'function') {
            toastError('Error al cargar distritos');
        }
    }
};

// ============================================
// SELECCIONAR DISTRITO
// ============================================
window.seleccionarDistrito = async function() {
    const selectDistrito = document.getElementById('distrito');
    const districtId = selectDistrito.value;

    if (!districtId) {
        distritoSeleccionado = null;
        coordenadasSeleccionadas = null;
        return;
    }

    const selectedOption = selectDistrito.options[selectDistrito.selectedIndex];
    distritoSeleccionado = {
        id: districtId,
        nombre: selectedOption.dataset.name || selectedOption.textContent
    };

    console.log('✅ Distrito seleccionado:', distritoSeleccionado.nombre);

    // Obtener coordenadas del distrito y actualizar mapa
    try {
        // Pasar departamento y provincia para búsqueda precisa (evita confusión entre distritos con mismo nombre)
        const coords = await obtenerCoordenadasDistrito(
            distritoSeleccionado.nombre,
            departamentoSeleccionado?.id,
            provinciaSeleccionada?.id
        );

        if (coords && validarCoordenadasPeru(coords.lat, coords.lng)) {
            coordenadasSeleccionadas = coords;

            // Construir texto de ubicacion
            const textoUbicacion = `${distritoSeleccionado.nombre}, ${provinciaSeleccionada?.nombre || ''}, ${departamentoSeleccionado?.nombre || ''}`;

            // Esperar a que el mapa este listo si aun no cargo
            if (!mapaPreview) {
                await cargarGoogleMapsAPI();
                await inicializarMapaPreview();
            }

            // Actualizar mapa preview
            actualizarMapaPreview(coords.lat, coords.lng, textoUbicacion);
        }
    } catch (error) {
        console.warn('⚠️ No se pudieron obtener coordenadas del distrito:', error);
    }
};

// ============================================
// OBTENER UBICACION COMPLETA
// ============================================
async function obtenerUbicacionCompleta() {
    if (!departamentoSeleccionado || !provinciaSeleccionada || !distritoSeleccionado) {
        return null;
    }

    // Usar coordenadas seleccionadas (del autocomplete o del distrito)
    let coordenadas = coordenadasSeleccionadas;

    // Si no hay coordenadas seleccionadas, obtener del distrito
    if (!coordenadas) {
        coordenadas = await obtenerCoordenadasDistrito(
            distritoSeleccionado.nombre,
            departamentoSeleccionado?.id,
            provinciaSeleccionada?.id
        );
    }

    // Validar que las coordenadas esten en Peru
    if (coordenadas && !validarCoordenadasPeru(coordenadas.lat, coordenadas.lng)) {
        console.warn('⚠️ Coordenadas fuera de Peru, usando centro de Lima');
        coordenadas = { lat: -12.0464, lng: -77.0428 };
    }

    // Obtener direccion exacta y referencia
    const inputDireccion = document.getElementById('direccion-exacta');
    const direccionExacta = direccionExactaSeleccionada || inputDireccion?.value?.trim() || '';

    const referencia = document.getElementById('referencia')?.value?.trim() || '';

    // Construir texto completo
    let textoCompleto = `${distritoSeleccionado.nombre}, ${provinciaSeleccionada.nombre}, ${departamentoSeleccionado.nombre}`;

    // Si hay direccion exacta, usarla como texto principal
    if (direccionExactaSeleccionada) {
        textoCompleto = direccionExactaSeleccionada;
    } else if (direccionExacta) {
        textoCompleto = `${direccionExacta}, ${distritoSeleccionado.nombre}`;
    }

    return {
        departamento: departamentoSeleccionado.nombre,
        provincia: provinciaSeleccionada.nombre,
        distrito: distritoSeleccionado.nombre,
        direccion_exacta: direccionExactaSeleccionada || direccionExacta || '',
        referencia: referencia,
        coordenadas: coordenadas,
        // Texto completo para busquedas y filtros
        texto_completo: textoCompleto,
        // Flag para saber si es ubicacion precisa
        es_ubicacion_precisa: !!direccionExactaSeleccionada
    };
}

// ============================================
// CARGAR DATOS SI EST脕 EN MODO EDICI脫N
// ============================================
if (modoEdicion) {
    cargarOfertaParaEditar(ofertaId);
}

async function cargarOfertaParaEditar(id) {
    try {
        // Mostrar loading
        if (typeof toastLoading === 'function') {
            var loadingToast = toastLoading('Cargando oferta...');
        }
        
        // Obtener oferta de Firestore
        const docRef = doc(db, 'ofertas', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            if (loadingToast) loadingToast.remove();
            if (typeof toastError === 'function') {
                toastError('No se encontr贸 la oferta');
            }
            setTimeout(() => window.location.href = 'dashboard.html', 2000);
            return;
        }
        
        const oferta = docSnap.data();
        
        // Verificar que sea el due帽o de la oferta
        if (oferta.empleadorEmail !== usuario.email) {
            if (loadingToast) loadingToast.remove();
            if (typeof toastError === 'function') {
                toastError('No tienes permiso para editar esta oferta');
            }
            setTimeout(() => window.location.href = 'dashboard.html', 2000);
            return;
        }
        
        // Pre-llenar formulario
        document.getElementById('titulo').value = oferta.titulo || '';
        document.getElementById('categoria').value = oferta.categoria || '';
        document.getElementById('descripcion').value = oferta.descripcion || '';
        
        // Ubicaci贸n - Si es formato antiguo (string), usar campo de texto
        // Si es formato nuevo (objeto), usar combos
        if (typeof oferta.ubicacion === 'string') {
            // Formato antiguo - mostrar en campo de referencia
            document.getElementById('referencia').value = oferta.ubicacion;
        } else if (oferta.ubicacion && typeof oferta.ubicacion === 'object') {
            // Formato nuevo - cargar en combos (requiere esperar a que carguen)
            // Por ahora usar texto_completo como referencia
            if (oferta.ubicacion.referencia) {
                document.getElementById('referencia').value = oferta.ubicacion.referencia;
            }
        }
        
        document.getElementById('salario').value = oferta.salario || '';
        document.getElementById('duracion').value = oferta.duracion === 'No especificada' ? '' : oferta.duracion || '';
        document.getElementById('horario').value = oferta.horario === 'No especificado' ? '' : oferta.horario || '';
        
        // Campos opcionales del paso 3
        if (oferta.experiencia && oferta.experiencia !== 'No especificada') {
            document.getElementById('experiencia').value = oferta.experiencia;
        }
        if (oferta.habilidades && oferta.habilidades !== 'No especificadas') {
            document.getElementById('habilidades').value = oferta.habilidades;
        }
        if (oferta.requisitosAdicionales && oferta.requisitosAdicionales !== 'Ninguno') {
            document.getElementById('requisitos-adicionales').value = oferta.requisitosAdicionales;
        }
        
        // Checkboxes
        if (oferta.requiereHerramientas) {
            document.getElementById('herramientas').checked = true;
        }
        if (oferta.requiereTransporte) {
            document.getElementById('transporte').checked = true;
        }
        if (oferta.requiereEquipos) {
            document.getElementById('equipos').checked = true;
        }
        
        // Actualizar character counters
        document.getElementById('titulo-count').textContent = oferta.titulo?.length || 0;
        document.getElementById('descripcion-count').textContent = oferta.descripcion?.length || 0;
        
        // Cambiar textos del formulario
        document.querySelector('.step-header h2').textContent = '鉁忥笍 Editar Oferta';
        document.querySelector('.step-header p').textContent = 'Actualiza la informaci贸n de tu oferta';
        btnSubmit.innerHTML = '馃捑 Guardar Cambios';
        
        if (loadingToast) loadingToast.remove();
        if (typeof toastSuccess === 'function') {
            toastSuccess('Oferta cargada correctamente');
        }
        
        console.log('鉁?Oferta cargada para edici贸n:', oferta.titulo);
        
    } catch (error) {
        console.error('Error al cargar oferta:', error);
        if (loadingToast) loadingToast.remove();
        if (typeof toastError === 'function') {
            toastError('Error al cargar la oferta');
        }
        setTimeout(() => window.location.href = 'dashboard.html', 2000);
    }
}

// ============================================
// CHARACTER COUNTERS
// ============================================
const titulo = document.getElementById('titulo');
const descripcion = document.getElementById('descripcion');

titulo.addEventListener('input', () => {
    document.getElementById('titulo-count').textContent = titulo.value.length;
});

descripcion.addEventListener('input', () => {
    document.getElementById('descripcion-count').textContent = descripcion.value.length;
});

// ============================================
// NAVEGACI脫N ENTRE PASOS
// ============================================
async function showStep(step) {
    // Ocultar todos los pasos
    formSteps.forEach(s => s.classList.remove('active'));
    
    // Mostrar paso actual
    const currentFormStep = document.querySelector(`.form-step[data-step="${step}"]`);
    if (currentFormStep) {
        currentFormStep.classList.add('active');
    }
    
    // Actualizar indicadores de progreso
    progressSteps.forEach((s, index) => {
        if (index < step - 1) {
            s.classList.add('completed');
            s.classList.remove('active');
        } else if (index === step - 1) {
            s.classList.add('active');
            s.classList.remove('completed');
        } else {
            s.classList.remove('active', 'completed');
        }
    });
    
    // Actualizar barra de progreso
    const progressPercent = (step / totalSteps) * 100;
    progressFill.style.width = `${progressPercent}%`;
    
    // Actualizar display de paso actual
    currentStepDisplay.textContent = step;
    
    // Mostrar/ocultar botones
    btnPrevious.style.display = step === 1 ? 'none' : 'inline-flex';
    
    if (step === totalSteps) {
        btnNext.style.display = 'none';
        btnSubmit.style.display = 'inline-flex';
        await updateReviewSection();
    } else {
        btnNext.style.display = 'inline-flex';
        btnSubmit.style.display = 'none';
    }
    
    // Scroll suave al inicio del formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// VALIDACI脫N POR PASO
// ============================================
function validateStep(step) {
    let isValid = true;
    
    if (step === 1) {
        // Validar t铆tulo
        const titulo = document.getElementById('titulo');
        if (!titulo.value.trim()) {
            showError('titulo', 'El t铆tulo es obligatorio');
            isValid = false;
        } else if (titulo.value.trim().length < 10) {
            showError('titulo', 'El t铆tulo debe tener al menos 10 caracteres');
            isValid = false;
        } else {
            hideError('titulo');
        }
        
        // Validar categor铆a
        const categoria = document.getElementById('categoria');
        if (!categoria.value) {
            showError('categoria', 'Selecciona una categor铆a');
            isValid = false;
        } else {
            hideError('categoria');
        }
        
        // Validar descripci贸n
        const descripcion = document.getElementById('descripcion');
        if (!descripcion.value.trim()) {
            showError('descripcion', 'La descripci贸n es obligatoria');
            isValid = false;
        } else if (descripcion.value.trim().length < 50) {
            showError('descripcion', 'La descripci贸n debe tener al menos 50 caracteres');
            isValid = false;
        } else {
            hideError('descripcion');
        }
    }
    
    if (step === 2) {
        // Validar departamento
        const departamento = document.getElementById('departamento');
        if (!departamento.value) {
            showError('departamento', 'Selecciona un departamento');
            isValid = false;
        } else {
            hideError('departamento');
        }
        
        // Validar provincia
        const provincia = document.getElementById('provincia');
        if (!provincia.value) {
            showError('provincia', 'Selecciona una provincia');
            isValid = false;
        } else {
            hideError('provincia');
        }
        
        // Validar distrito
        const distrito = document.getElementById('distrito');
        if (!distrito.value) {
            showError('distrito', 'Selecciona un distrito');
            isValid = false;
        } else {
            hideError('distrito');
        }
        
        // Validar salario
        const salario = document.getElementById('salario');
        if (!salario.value.trim()) {
            showError('salario', 'El salario es obligatorio');
            isValid = false;
        } else {
            hideError('salario');
        }
    }
    
    // Paso 3 y 4 son opcionales
    
    return isValid;
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);
    
    field.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function hideError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);
    
    field.classList.remove('error');
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

// ============================================
// ACTUALIZAR SECCI脫N DE REVISI脫N
// ============================================
async function updateReviewSection() {
    // Informaci贸n B谩sica
    document.getElementById('review-titulo').textContent = 
        document.getElementById('titulo').value || '-';
    
    const categoriaSelect = document.getElementById('categoria');
    document.getElementById('review-categoria').textContent = 
        categoriaSelect.options[categoriaSelect.selectedIndex].text || '-';
    
    document.getElementById('review-descripcion').textContent = 
        document.getElementById('descripcion').value || '-';
    
    // Detalles del Trabajo - Ubicacion
    const ubicacion = await obtenerUbicacionCompleta();
    if (ubicacion) {
        // Mostrar ubicacion base (distrito, provincia, departamento)
        document.getElementById('review-ubicacion').textContent =
            `${ubicacion.distrito}, ${ubicacion.provincia}, ${ubicacion.departamento}`;

        // Mostrar direccion exacta si existe
        const direccionContainer = document.getElementById('review-direccion-exacta-container');
        if (direccionContainer) {
            if (ubicacion.direccion_exacta) {
                direccionContainer.style.display = 'flex';
                document.getElementById('review-direccion-exacta').textContent = ubicacion.direccion_exacta;
            } else {
                direccionContainer.style.display = 'none';
            }
        }

        // Mostrar referencia si existe
        const referenciaContainer = document.getElementById('review-referencia-container');
        if (ubicacion.referencia) {
            referenciaContainer.style.display = 'flex';
            document.getElementById('review-referencia').textContent = ubicacion.referencia;
        } else {
            referenciaContainer.style.display = 'none';
        }
    } else {
        document.getElementById('review-ubicacion').textContent = '-';
    }
    
    document.getElementById('review-salario').textContent = 
        document.getElementById('salario').value || '-';
    
    const duracion = document.getElementById('duracion').value;
    document.getElementById('review-duracion').textContent = 
        duracion || 'No especificado';
    
    const horario = document.getElementById('horario').value;
    document.getElementById('review-horario').textContent = 
        horario || 'No especificado';
    
    // Requisitos
    const experienciaSelect = document.getElementById('experiencia');
    const experienciaValue = experienciaSelect.value;
    document.getElementById('review-experiencia').textContent = 
        experienciaValue ? experienciaSelect.options[experienciaSelect.selectedIndex].text : 'No especificado';
    
    const habilidades = document.getElementById('habilidades').value;
    const habilidadesContainer = document.getElementById('review-habilidades-container');
    if (habilidades) {
        habilidadesContainer.style.display = 'flex';
        document.getElementById('review-habilidades').textContent = habilidades;
    } else {
        habilidadesContainer.style.display = 'none';
    }
}

// ============================================
// EVENT LISTENERS - NAVEGACI脫N
// ============================================
btnNext.addEventListener('click', () => {
    if (validateStep(currentStep)) {
        currentStep++;
        showStep(currentStep);
    } else {
        if (typeof toastWarning === 'function') {
            toastWarning('Por favor completa todos los campos obligatorios');
        }
    }
});

btnPrevious.addEventListener('click', () => {
    currentStep--;
    showStep(currentStep);
});

// ============================================
// SUBMIT FORM - CREAR O ACTUALIZAR
// ============================================
formOferta.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validar ubicaci贸n
    const ubicacion = await obtenerUbicacionCompleta();
    if (!ubicacion) {
        if (typeof toastError === 'function') {
            toastError('Por favor selecciona la ubicaci贸n completa');
        }
        currentStep = 2;
        showStep(currentStep);
        return;
    }
    
    // Deshabilitar bot贸n submit
    btnSubmit.disabled = true;
    const originalText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = modoEdicion ? '馃捑 Guardando...' : '馃殌 Publicando...';
    
    try {
        // Recopilar datos del formulario
        const ofertaData = {
            titulo: document.getElementById('titulo').value.trim(),
            categoria: document.getElementById('categoria').value,
            descripcion: document.getElementById('descripcion').value.trim(),
            ubicacion: ubicacion, // Objeto estructurado con coordenadas
            salario: document.getElementById('salario').value.trim(),
            duracion: document.getElementById('duracion').value.trim() || 'No especificada',
            horario: document.getElementById('horario').value.trim() || 'No especificado',
            experiencia: document.getElementById('experiencia').value || 'No especificada',
            habilidades: document.getElementById('habilidades').value.trim() || 'No especificadas',
            requisitosAdicionales: document.getElementById('requisitos-adicionales').value.trim() || 'Ninguno',
            requiereHerramientas: document.getElementById('herramientas').checked,
            requiereTransporte: document.getElementById('transporte').checked,
            requiereEquipos: document.getElementById('equipos').checked
        };
        
        if (modoEdicion) {
            // ACTUALIZAR OFERTA EXISTENTE
            const docRef = doc(db, 'ofertas', ofertaId);
            await updateDoc(docRef, {
                ...ofertaData,
                fechaActualizacion: serverTimestamp()
            });
            
            if (typeof toastSuccess === 'function') {
                toastSuccess('隆Oferta actualizada exitosamente! 馃捑');
            }
            
            console.log('鉁?Oferta actualizada:', ofertaId);
            
        } else {
            // CREAR NUEVA OFERTA
            const nuevaOferta = {
                ...ofertaData,
                empleadorId: auth.currentUser?.uid || usuario.uid || 'demo',
                empleadorNombre: usuario.nombre,
                empleadorEmail: usuario.email,
                empleadorTelefono: usuario.telefono || '',
                estado: 'activa',
                fechaCreacion: serverTimestamp(),
                aplicaciones: 0
            };
            
            await addDoc(collection(db, 'ofertas'), nuevaOferta);
            
            if (typeof toastSuccess === 'function') {
                toastSuccess('隆Oferta publicada exitosamente! 馃帀');
            }
            
            console.log('鉁?Oferta creada');
        }
        
        // Redirigir al dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error:', error);
        
        // Restaurar bot贸n
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText;
        
        // Toast de error
        if (typeof toastError === 'function') {
            toastError(modoEdicion ? 'Error al actualizar la oferta' : 'Error al publicar la oferta');
        } else {
            alert('Error: ' + error.message);
        }
    }
});

// ============================================
// INICIALIZACION
// ============================================
showStep(currentStep);
inicializarUbicacion();

// Inicializar Google Maps y Autocomplete (con delay para mejor UX)
setTimeout(async () => {
    try {
        await inicializarMapaPreview();
        await inicializarAutocomplete();
    } catch (error) {
        console.warn('⚠️ No se pudo cargar Google Maps:', error.message);
        // El formulario sigue funcionando sin el mapa
    }
}, 500);

console.log('✅ Formulario multi-paso con UBIGEO y Google Maps cargado correctamente');
