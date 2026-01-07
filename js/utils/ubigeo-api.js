// ============================================
// UBIGEO API - Integración con API RENIEC
// https://apis.net.pe/api-ubigeo
// Sistema de ubicaciones del Perú
// ============================================

const UBIGEO_API_BASE = 'https://ubigeo-api.vercel.app/api';

/**
 * Obtener todos los departamentos del Perú
 * @returns {Promise<Array>} Lista de departamentos con id y nombre
 */
export async function obtenerDepartamentos() {
    try {
        const response = await fetch(`${UBIGEO_API_BASE}/departments`);
        
        if (!response.ok) {
            throw new Error('Error al obtener departamentos');
        }
        
        const departamentos = await response.json();
        
        // Ordenar alfabéticamente
        return departamentos.sort((a, b) => a.name.localeCompare(b.name));
        
    } catch (error) {
        console.warn('⚠️ API RENIEC no disponible, usando datos locales');
        console.error('Error:', error.message);
        
        // Fallback completo: Los 25 departamentos del Perú
        return [
            { id: '01', name: 'Amazonas' },
            { id: '02', name: 'Áncash' },
            { id: '03', name: 'Apurímac' },
            { id: '04', name: 'Arequipa' },
            { id: '05', name: 'Ayacucho' },
            { id: '06', name: 'Cajamarca' },
            { id: '07', name: 'Callao' },
            { id: '08', name: 'Cusco' },
            { id: '09', name: 'Huancavelica' },
            { id: '10', name: 'Huánuco' },
            { id: '11', name: 'Ica' },
            { id: '12', name: 'Junín' },
            { id: '13', name: 'La Libertad' },
            { id: '14', name: 'Lambayeque' },
            { id: '15', name: 'Lima' },
            { id: '16', name: 'Loreto' },
            { id: '17', name: 'Madre de Dios' },
            { id: '18', name: 'Moquegua' },
            { id: '19', name: 'Pasco' },
            { id: '20', name: 'Piura' },
            { id: '21', name: 'Puno' },
            { id: '22', name: 'San Martín' },
            { id: '23', name: 'Tacna' },
            { id: '24', name: 'Tumbes' },
            { id: '25', name: 'Ucayali' }
        ];
    }
}

/**
 * Obtener provincias de un departamento
 * @param {string} departmentId - ID del departamento (ej: "15" para Lima)
 * @returns {Promise<Array>} Lista de provincias con id, nombre y department_id
 */
export async function obtenerProvincias(departmentId) {
    try {
        if (!departmentId) {
            return [];
        }
        
        const response = await fetch(`${UBIGEO_API_BASE}/provinces/${departmentId}`);
        
        if (!response.ok) {
            throw new Error('Error al obtener provincias');
        }
        
        const provincias = await response.json();
        
        // Ordenar alfabéticamente
        return provincias.sort((a, b) => a.name.localeCompare(b.name));
        
    } catch (error) {
        console.error('❌ Error en obtenerProvincias:', error);
        return [];
    }
}

/**
 * Obtener distritos de una provincia
 * @param {string} departmentId - ID del departamento
 * @param {string} provinceId - ID de la provincia
 * @returns {Promise<Array>} Lista de distritos con id, nombre, province_id y department_id
 */
export async function obtenerDistritos(departmentId, provinceId) {
    try {
        if (!departmentId || !provinceId) {
            return [];
        }
        
        const response = await fetch(
            `${UBIGEO_API_BASE}/districts/${departmentId}/${provinceId}`
        );
        
        if (!response.ok) {
            throw new Error('Error al obtener distritos');
        }
        
        const distritos = await response.json();
        
        // Ordenar alfabéticamente
        return distritos.sort((a, b) => a.name.localeCompare(b.name));
        
    } catch (error) {
        console.error('❌ Error en obtenerDistritos:', error);
        return [];
    }
}

/**
 * Base de datos de coordenadas de distritos principales de Lima
 * Incluye los 43 distritos de Lima Metropolitana
 */
const COORDENADAS_LIMA = {
    'Lima': { lat: -12.046373, lng: -77.042754 },
    'Ancón': { lat: -11.755556, lng: -77.176667 },
    'Ate': { lat: -12.030833, lng: -76.905000 },
    'Barranco': { lat: -12.147222, lng: -77.021389 },
    'Breña': { lat: -12.060000, lng: -77.051389 },
    'Carabayllo': { lat: -11.866667, lng: -77.033333 },
    'Chaclacayo': { lat: -12.018611, lng: -76.765833 },
    'Chorrillos': { lat: -12.166667, lng: -77.016667 },
    'Cieneguilla': { lat: -12.042778, lng: -76.808056 },
    'Comas': { lat: -11.945278, lng: -77.048889 },
    'El Agustino': { lat: -12.050278, lng: -76.993333 },
    'Independencia': { lat: -11.985833, lng: -77.053333 },
    'Jesús María': { lat: -12.082500, lng: -77.046111 },
    'La Molina': { lat: -12.081944, lng: -76.936111 },
    'La Victoria': { lat: -12.067500, lng: -77.021111 },
    'Lince': { lat: -12.085000, lng: -77.036389 },
    'Los Olivos': { lat: -11.970556, lng: -77.068333 },
    'Lurigancho': { lat: -11.948333, lng: -76.798889 },
    'Lurín': { lat: -12.275000, lng: -76.875000 },
    'Magdalena del Mar': { lat: -12.094444, lng: -77.066667 },
    'Miraflores': { lat: -12.119870, lng: -77.030460 },
    'Pachacámac': { lat: -12.233333, lng: -76.866667 },
    'Pucusana': { lat: -12.480556, lng: -76.800833 },
    'Pueblo Libre': { lat: -12.078611, lng: -77.066667 },
    'Puente Piedra': { lat: -11.866667, lng: -77.083333 },
    'Punta Hermosa': { lat: -12.333333, lng: -76.833333 },
    'Punta Negra': { lat: -12.366667, lng: -76.800000 },
    'Rímac': { lat: -12.038333, lng: -77.050000 },
    'San Bartolo': { lat: -12.391667, lng: -76.778889 },
    'San Borja': { lat: -12.094167, lng: -76.996389 },
    'San Isidro': { lat: -12.098333, lng: -77.036111 },
    'San Juan de Lurigancho': { lat: -11.983333, lng: -76.983333 },
    'San Juan de Miraflores': { lat: -12.155556, lng: -76.973333 },
    'San Luis': { lat: -12.083333, lng: -77.000000 },
    'San Martín de Porres': { lat: -12.008611, lng: -77.073333 },
    'San Miguel': { lat: -12.085556, lng: -77.086111 },
    'Santa Anita': { lat: -12.045556, lng: -76.963889 },
    'Santa María del Mar': { lat: -12.390278, lng: -76.776111 },
    'Santa Rosa': { lat: -11.799167, lng: -77.176944 },
    'Santiago de Surco': { lat: -12.149722, lng: -77.008889 },
    'Surco': { lat: -12.149722, lng: -77.008889 },
    'Surquillo': { lat: -12.111667, lng: -77.008333 },
    'Villa El Salvador': { lat: -12.211111, lng: -76.938889 },
    'Villa María del Triunfo': { lat: -12.166667, lng: -76.933333 }
};

/**
 * Obtener coordenadas aproximadas de un distrito
 * @param {string} distrito - Nombre del distrito
 * @returns {Object} Objeto con lat y lng, o coordenadas genéricas de Lima
 */
export function obtenerCoordenadasDistrito(distrito) {
    // Normalizar nombre del distrito (eliminar acentos y mayúsculas)
    const distritoNormalizado = distrito
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    
    // Buscar en base de datos local (case insensitive)
    for (const [key, coords] of Object.entries(COORDENADAS_LIMA)) {
        const keyNormalizado = key
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        
        if (keyNormalizado.toLowerCase() === distritoNormalizado.toLowerCase()) {
            return coords;
        }
    }
    
    // Si no está en la base de datos, retornar coordenadas genéricas del centro de Lima
    console.log(`⚠️ Coordenadas no encontradas para "${distrito}", usando centro de Lima`);
    return { lat: -12.046373, lng: -77.042754 };
}

/**
 * Calcular distancia entre dos puntos geográficos usando la Fórmula de Haversine
 * @param {number} lat1 - Latitud del punto 1
 * @param {number} lng1 - Longitud del punto 1
 * @param {number} lat2 - Latitud del punto 2
 * @param {number} lng2 - Longitud del punto 2
 * @returns {number} Distancia en kilómetros (redondeado a 1 decimal)
 */
export function calcularDistancia(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radio de la Tierra en kilómetros
    
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;
    
    // Redondear a 1 decimal
    return Math.round(distancia * 10) / 10;
}

/**
 * Formatear distancia para mostrar al usuario
 * @param {number} km - Distancia en kilómetros
 * @returns {string} Texto formateado (ej: "2.5 km", "850 m")
 */
export function formatearDistancia(km) {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    }
    return `${km} km`;
}

console.log('✅ Módulo UBIGEO API cargado correctamente');
