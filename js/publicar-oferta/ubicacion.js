/**
 * Módulo de ubicación para publicar ofertas
 * Maneja: UBIGEO cascading, estado de ubicación, integración con Google Maps
 *
 * @module publicar-oferta/ubicacion
 */

import { obtenerDepartamentos, obtenerProvincias, obtenerDistritos, obtenerCoordenadasDistrito } from '../utils/ubigeo-api.js';
import {
    cargarGoogleMapsAPI,
    inicializarMapaPreview as initMapaPreview,
    inicializarAutocomplete as initAutocomplete,
    actualizarMapaPreview,
    getMapaPreview,
    validarCoordenadasPeru,
    obtenerDistritoPorCoordenadas,
    obtenerDistritoPorCodigoPostal,
    setGoogleMapsCallbacks
} from './google-maps-ubicacion.js';

// ============================================
// VARIABLES DEL MÓDULO
// ============================================

// Estado de ubicación seleccionada
let departamentoSeleccionado = null;
let provinciaSeleccionada = null;
let distritoSeleccionado = null;
let coordenadasSeleccionadas = null;
let direccionExactaSeleccionada = null;

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function normalizarTexto(texto) {
    if (!texto) return '';
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').trim();
}

// ============================================
// AUTOCOMPLETAR UBIGEO DESDE GOOGLE PLACES
// ============================================
async function autocompletarUbigeo(addressComponents) {
    if (!addressComponents || addressComponents.length === 0) return;

    let departamento = '', provincia = '', distrito = '', codigoPostal = '', localityFound = false;

    for (const component of addressComponents) {
        const types = component.types || [];
        const nombre = component.longText || component.long_name || component.shortText || component.short_name || '';

        if (types.includes('postal_code')) codigoPostal = nombre;

        if (types.includes('administrative_area_level_1')) {
            departamento = nombre.replace(/^(Región|Region|Departamento de|Gobierno Regional de|Provincia de)\s*/i, '').trim();
        }

        if (types.includes('administrative_area_level_2')) {
            provincia = nombre.replace(/^(Provincia de|Provincia)\s*/i, '').trim();
        }

        if (types.includes('locality')) {
            distrito = nombre.replace(/^(Distrito de|Distrito)\s*/i, '').trim();
            localityFound = true;
        }

        if (!localityFound && types.includes('sublocality_level_1')) {
            distrito = nombre.replace(/^(Distrito de|Distrito)\s*/i, '').trim();
        }

        if (!distrito && types.includes('administrative_area_level_3')) {
            distrito = nombre.replace(/^(Distrito de|Distrito)\s*/i, '').trim();
        }
    }

    if (departamento === 'Lima' && !provincia) provincia = 'Lima';

    if (codigoPostal && (distrito.toLowerCase() === 'lima' || !distrito)) {
        const distritoInferido = obtenerDistritoPorCodigoPostal(codigoPostal);
        if (distritoInferido && distritoInferido.toLowerCase() !== 'lima') distrito = distritoInferido;
    }

    if (departamento) {
        const deptoOk = await seleccionarDepartamentoPorNombre(departamento);
        if (deptoOk) {
            await new Promise(resolve => setTimeout(resolve, 600));
            if (provincia) {
                const provOk = await seleccionarProvinciaPorNombre(provincia);
                if (provOk) {
                    await new Promise(resolve => setTimeout(resolve, 600));
                    if (distrito) {
                        const distOk = await seleccionarDistritoPorNombre(distrito);
                        if (!distOk && coordenadasSeleccionadas) {
                            const distritoReverso = await obtenerDistritoPorCoordenadas(coordenadasSeleccionadas.lat, coordenadasSeleccionadas.lng);
                            if (distritoReverso) await seleccionarDistritoPorNombre(distritoReverso);
                        }
                    } else if (coordenadasSeleccionadas) {
                        const distritoReverso = await obtenerDistritoPorCoordenadas(coordenadasSeleccionadas.lat, coordenadasSeleccionadas.lng);
                        if (distritoReverso) await seleccionarDistritoPorNombre(distritoReverso);
                    }
                }
            }
        }
    }
}

// ============================================
// FUNCIONES DE SELECCIÓN POR NOMBRE
// ============================================
async function seleccionarDepartamentoPorNombre(nombreDepto) {
    const selectDepto = document.getElementById('departamento');
    if (!selectDepto) return false;
    const nombreNormalizado = normalizarTexto(nombreDepto);

    for (const option of selectDepto.options) {
        if (normalizarTexto(option.text).includes(nombreNormalizado) || nombreNormalizado.includes(normalizarTexto(option.text))) {
            selectDepto.value = option.value;
            selectDepto.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
    }
    return false;
}

async function seleccionarProvinciaPorNombre(nombreProv) {
    const selectProv = document.getElementById('provincia');
    if (!selectProv) return false;
    await new Promise(resolve => setTimeout(resolve, 200));
    const nombreNormalizado = normalizarTexto(nombreProv);

    for (const option of selectProv.options) {
        if (normalizarTexto(option.text).includes(nombreNormalizado) || nombreNormalizado.includes(normalizarTexto(option.text))) {
            selectProv.value = option.value;
            selectProv.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
    }
    return false;
}

async function seleccionarDistritoPorNombre(nombreDist) {
    const selectDist = document.getElementById('distrito');
    if (!selectDist) return false;
    await new Promise(resolve => setTimeout(resolve, 200));
    const nombreNormalizado = normalizarTexto(nombreDist);

    for (const option of selectDist.options) {
        if (normalizarTexto(option.text).includes(nombreNormalizado) || nombreNormalizado.includes(normalizarTexto(option.text))) {
            selectDist.value = option.value;
            selectDist.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
    }
    return false;
}

// ============================================
// INICIALIZAR SISTEMA DE UBICACIÓN
// ============================================
export async function inicializarUbicacion() {
    // Configurar callbacks para Google Maps
    setGoogleMapsCallbacks({
        onUbicacionSeleccionada: (data) => {
            coordenadasSeleccionadas = { lat: data.lat, lng: data.lng };
            direccionExactaSeleccionada = data.direccion;
        },
        autocompletarUbigeo
    });

    try {
        const selectDepartamento = document.getElementById('departamento');
        selectDepartamento.innerHTML = '<option value="">Cargando departamentos...</option>';

        const departamentos = await obtenerDepartamentos();

        selectDepartamento.innerHTML = '<option value="">Seleccionar departamento</option>';
        departamentos.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            option.dataset.name = dept.name;
            selectDepartamento.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar departamentos:', error);
        document.getElementById('departamento').innerHTML = '<option value="">Error al cargar</option>';
        if (typeof toastError === 'function') toastError('Error al cargar ubicaciones');
    }
}

// Re-exportar funciones de Google Maps
export { inicializarMapaPreview } from './google-maps-ubicacion.js';
export { inicializarAutocomplete } from './google-maps-ubicacion.js';

// ============================================
// CASCADING UBIGEO
// ============================================
export async function cargarProvincias() {
    const selectDepartamento = document.getElementById('departamento');
    const selectProvincia = document.getElementById('provincia');
    const selectDistrito = document.getElementById('distrito');
    const departmentId = selectDepartamento.value;

    selectProvincia.innerHTML = '<option value="">Seleccionar provincia</option>';
    selectDistrito.innerHTML = '<option value="">Seleccionar distrito</option>';
    departamentoSeleccionado = null;
    provinciaSeleccionada = null;
    distritoSeleccionado = null;

    if (!departmentId) return;

    try {
        const selectedOption = selectDepartamento.options[selectDepartamento.selectedIndex];
        departamentoSeleccionado = { id: departmentId, nombre: selectedOption.dataset.name || selectedOption.textContent };

        selectProvincia.innerHTML = '<option value="">Cargando provincias...</option>';
        const provincias = await obtenerProvincias(departmentId);

        selectProvincia.innerHTML = '<option value="">Seleccionar provincia</option>';
        provincias.forEach(prov => {
            const option = document.createElement('option');
            option.value = prov.id;
            option.textContent = prov.name;
            option.dataset.name = prov.name;
            selectProvincia.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar provincias:', error);
        selectProvincia.innerHTML = '<option value="">Error al cargar</option>';
    }
}

export async function cargarDistritos() {
    const selectProvincia = document.getElementById('provincia');
    const selectDistrito = document.getElementById('distrito');
    const provinceId = selectProvincia.value;

    selectDistrito.innerHTML = '<option value="">Seleccionar distrito</option>';
    provinciaSeleccionada = null;
    distritoSeleccionado = null;

    if (!provinceId || !departamentoSeleccionado) return;

    try {
        const selectedOption = selectProvincia.options[selectProvincia.selectedIndex];
        provinciaSeleccionada = { id: provinceId, nombre: selectedOption.dataset.name || selectedOption.textContent };

        selectDistrito.innerHTML = '<option value="">Cargando distritos...</option>';
        const distritos = await obtenerDistritos(departamentoSeleccionado.id, provinceId);

        selectDistrito.innerHTML = '<option value="">Seleccionar distrito</option>';
        distritos.forEach(dist => {
            const option = document.createElement('option');
            option.value = dist.id;
            option.textContent = dist.name;
            option.dataset.name = dist.name;
            selectDistrito.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar distritos:', error);
        selectDistrito.innerHTML = '<option value="">Error al cargar</option>';
    }
}

export async function seleccionarDistritoHandler() {
    const selectDistrito = document.getElementById('distrito');
    const districtId = selectDistrito.value;

    if (!districtId) {
        distritoSeleccionado = null;
        coordenadasSeleccionadas = null;
        return;
    }

    const selectedOption = selectDistrito.options[selectDistrito.selectedIndex];
    distritoSeleccionado = { id: districtId, nombre: selectedOption.dataset.name || selectedOption.textContent };

    try {
        const coords = await obtenerCoordenadasDistrito(
            distritoSeleccionado.nombre,
            departamentoSeleccionado?.id,
            provinciaSeleccionada?.id
        );

        if (coords && validarCoordenadasPeru(coords.lat, coords.lng)) {
            coordenadasSeleccionadas = coords;
            const textoUbicacion = `${distritoSeleccionado.nombre}, ${provinciaSeleccionada?.nombre || ''}, ${departamentoSeleccionado?.nombre || ''}`;

            const { mapaPreview } = getMapaPreview();
            if (!mapaPreview) {
                await cargarGoogleMapsAPI();
                await initMapaPreview();
            }
            actualizarMapaPreview(coords.lat, coords.lng, textoUbicacion);
        }
    } catch { /* Error obteniendo coordenadas */ }
}

// ============================================
// OBTENER UBICACIÓN COMPLETA
// ============================================
export async function obtenerUbicacionCompleta() {
    if (!departamentoSeleccionado || !provinciaSeleccionada || !distritoSeleccionado) return null;

    let coordenadas = coordenadasSeleccionadas;
    if (!coordenadas) {
        coordenadas = await obtenerCoordenadasDistrito(
            distritoSeleccionado.nombre,
            departamentoSeleccionado?.id,
            provinciaSeleccionada?.id
        );
    }

    if (coordenadas && !validarCoordenadasPeru(coordenadas.lat, coordenadas.lng)) {
        coordenadas = { lat: -12.0464, lng: -77.0428 };
    }

    const inputDireccion = document.getElementById('direccion-exacta');
    const direccionExacta = direccionExactaSeleccionada || inputDireccion?.value?.trim() || '';
    const referencia = document.getElementById('referencia')?.value?.trim() || '';

    let textoCompleto = `${distritoSeleccionado.nombre}, ${provinciaSeleccionada.nombre}, ${departamentoSeleccionado.nombre}`;
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
        referencia,
        coordenadas,
        texto_completo: textoCompleto,
        es_ubicacion_precisa: !!direccionExactaSeleccionada
    };
}

// ============================================
// PRECARGAR UBICACIÓN (MODO EDICIÓN)
// ============================================
export async function precargarUbicacion(ubicacion) {
    try {
        const selectDepartamento = document.getElementById('departamento');
        const selectProvincia = document.getElementById('provincia');
        const selectDistrito = document.getElementById('distrito');

        if (ubicacion.departamento) {
            for (let option of selectDepartamento.options) {
                if (option.text.toLowerCase() === ubicacion.departamento.toLowerCase()) {
                    selectDepartamento.value = option.value;
                    await cargarProvincias();
                    break;
                }
            }
        }

        await new Promise(resolve => setTimeout(resolve, 300));

        if (ubicacion.provincia) {
            for (let option of selectProvincia.options) {
                if (option.text.toLowerCase() === ubicacion.provincia.toLowerCase()) {
                    selectProvincia.value = option.value;
                    await cargarDistritos();
                    break;
                }
            }
        }

        await new Promise(resolve => setTimeout(resolve, 300));

        if (ubicacion.distrito) {
            for (let option of selectDistrito.options) {
                if (option.text.toLowerCase() === ubicacion.distrito.toLowerCase()) {
                    selectDistrito.value = option.value;
                    selectDistrito.dispatchEvent(new Event('change'));
                    break;
                }
            }
        }

        if (ubicacion.direccionExacta) {
            document.getElementById('referencia').value = ubicacion.direccionExacta;
        } else if (ubicacion.referencia) {
            document.getElementById('referencia').value = ubicacion.referencia;
        }

        if (ubicacion.coordenadas?.lat && ubicacion.coordenadas?.lng) {
            coordenadasSeleccionadas = ubicacion.coordenadas;
            const { mapaPreview, marcadorPreview } = getMapaPreview();
            if (mapaPreview && marcadorPreview) {
                const pos = { lat: ubicacion.coordenadas.lat, lng: ubicacion.coordenadas.lng };
                mapaPreview.setCenter(pos);
                mapaPreview.setZoom(15);
                marcadorPreview.setPosition(pos);
                marcadorPreview.setVisible(true);
            }
        }
    } catch (error) {
        console.error('Error precargando ubicacion:', error);
    }
}

// ============================================
// EXPONER FUNCIONES A WINDOW
// ============================================
export function initUbicacionGlobals() {
    window.cargarProvincias = cargarProvincias;
    window.cargarDistritos = cargarDistritos;
    window.seleccionarDistrito = seleccionarDistritoHandler;
}
