// ============================================
// UBIGEO LOCAL - Sistema de ubicaciones del Perú
// Datos locales sin dependencia de APIs externas
// Optimizado para PWA y funcionamiento offline
// ============================================

/**
 * Los 25 departamentos del Perú
 */
const DEPARTAMENTOS = [
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

/**
 * Provincias por departamento (principales)
 */
const PROVINCIAS = {
    '15': [ // Lima
        { id: '01', name: 'Lima', department_id: '15' },
        { id: '02', name: 'Barranca', department_id: '15' },
        { id: '03', name: 'Cajatambo', department_id: '15' },
        { id: '04', name: 'Canta', department_id: '15' },
        { id: '05', name: 'Cañete', department_id: '15' },
        { id: '06', name: 'Huaral', department_id: '15' },
        { id: '07', name: 'Huarochirí', department_id: '15' },
        { id: '08', name: 'Huaura', department_id: '15' },
        { id: '09', name: 'Oyón', department_id: '15' },
        { id: '10', name: 'Yauyos', department_id: '15' }
    ],
    '04': [ // Arequipa
        { id: '01', name: 'Arequipa', department_id: '04' },
        { id: '02', name: 'Camaná', department_id: '04' },
        { id: '03', name: 'Caravelí', department_id: '04' },
        { id: '04', name: 'Castilla', department_id: '04' },
        { id: '05', name: 'Caylloma', department_id: '04' },
        { id: '06', name: 'Condesuyos', department_id: '04' },
        { id: '07', name: 'Islay', department_id: '04' },
        { id: '08', name: 'La Unión', department_id: '04' }
    ],
    '08': [ // Cusco
        { id: '01', name: 'Cusco', department_id: '08' },
        { id: '02', name: 'Acomayo', department_id: '08' },
        { id: '03', name: 'Anta', department_id: '08' },
        { id: '04', name: 'Calca', department_id: '08' },
        { id: '05', name: 'Canas', department_id: '08' },
        { id: '06', name: 'Canchis', department_id: '08' },
        { id: '07', name: 'Chumbivilcas', department_id: '08' },
        { id: '08', name: 'Espinar', department_id: '08' },
        { id: '09', name: 'La Convención', department_id: '08' },
        { id: '10', name: 'Paruro', department_id: '08' },
        { id: '11', name: 'Paucartambo', department_id: '08' },
        { id: '12', name: 'Quispicanchi', department_id: '08' },
        { id: '13', name: 'Urubamba', department_id: '08' }
    ]
};

/**
 * Distritos de Lima Metropolitana (Provincia 01)
 */
const DISTRITOS_LIMA = [
    { id: '01', name: 'Lima', province_id: '01', department_id: '15' },
    { id: '02', name: 'Ancón', province_id: '01', department_id: '15' },
    { id: '03', name: 'Ate', province_id: '01', department_id: '15' },
    { id: '04', name: 'Barranco', province_id: '01', department_id: '15' },
    { id: '05', name: 'Breña', province_id: '01', department_id: '15' },
    { id: '06', name: 'Carabayllo', province_id: '01', department_id: '15' },
    { id: '07', name: 'Chaclacayo', province_id: '01', department_id: '15' },
    { id: '08', name: 'Chorrillos', province_id: '01', department_id: '15' },
    { id: '09', name: 'Cieneguilla', province_id: '01', department_id: '15' },
    { id: '10', name: 'Comas', province_id: '01', department_id: '15' },
    { id: '11', name: 'El Agustino', province_id: '01', department_id: '15' },
    { id: '12', name: 'Independencia', province_id: '01', department_id: '15' },
    { id: '13', name: 'Jesús María', province_id: '01', department_id: '15' },
    { id: '14', name: 'La Molina', province_id: '01', department_id: '15' },
    { id: '15', name: 'La Victoria', province_id: '01', department_id: '15' },
    { id: '16', name: 'Lince', province_id: '01', department_id: '15' },
    { id: '17', name: 'Los Olivos', province_id: '01', department_id: '15' },
    { id: '18', name: 'Lurigancho', province_id: '01', department_id: '15' },
    { id: '19', name: 'Lurín', province_id: '01', department_id: '15' },
    { id: '20', name: 'Magdalena del Mar', province_id: '01', department_id: '15' },
    { id: '21', name: 'Miraflores', province_id: '01', department_id: '15' },
    { id: '22', name: 'Pachacámac', province_id: '01', department_id: '15' },
    { id: '23', name: 'Pucusana', province_id: '01', department_id: '15' },
    { id: '24', name: 'Pueblo Libre', province_id: '01', department_id: '15' },
    { id: '25', name: 'Puente Piedra', province_id: '01', department_id: '15' },
    { id: '26', name: 'Punta Hermosa', province_id: '01', department_id: '15' },
    { id: '27', name: 'Punta Negra', province_id: '01', department_id: '15' },
    { id: '28', name: 'Rímac', province_id: '01', department_id: '15' },
    { id: '29', name: 'San Bartolo', province_id: '01', department_id: '15' },
    { id: '30', name: 'San Borja', province_id: '01', department_id: '15' },
    { id: '31', name: 'San Isidro', province_id: '01', department_id: '15' },
    { id: '32', name: 'San Juan de Lurigancho', province_id: '01', department_id: '15' },
    { id: '33', name: 'San Juan de Miraflores', province_id: '01', department_id: '15' },
    { id: '34', name: 'San Luis', province_id: '01', department_id: '15' },
    { id: '35', name: 'San Martín de Porres', province_id: '01', department_id: '15' },
    { id: '36', name: 'San Miguel', province_id: '01', department_id: '15' },
    { id: '37', name: 'Santa Anita', province_id: '01', department_id: '15' },
    { id: '38', name: 'Santa María del Mar', province_id: '01', department_id: '15' },
    { id: '39', name: 'Santa Rosa', province_id: '01', department_id: '15' },
    { id: '40', name: 'Santiago de Surco', province_id: '01', department_id: '15' },
    { id: '41', name: 'Surquillo', province_id: '01', department_id: '15' },
    { id: '42', name: 'Villa El Salvador', province_id: '01', department_id: '15' },
    { id: '43', name: 'Villa María del Triunfo', province_id: '01', department_id: '15' }
];

/**
 * Obtener todos los departamentos
 * @returns {Promise<Array>}
 */
export async function obtenerDepartamentos() {
    console.log('✅ Cargando 25 departamentos desde datos locales');
    return Promise.resolve(DEPARTAMENTOS);
}

/**
 * Obtener provincias de un departamento
 * @param {string} departmentId 
 * @returns {Promise<Array>}
 */
export async function obtenerProvincias(departmentId) {
    if (!departmentId) return Promise.resolve([]);
    
    const provincias = PROVINCIAS[departmentId] || [];
    
    if (provincias.length > 0) {
        console.log(`✅ Provincias cargadas para departamento ${departmentId}:`, provincias.length);
    } else {
        console.warn(`⚠️ No hay provincias pre-cargadas para departamento ${departmentId}`);
    }
    
    return Promise.resolve(provincias);
}

/**
 * Obtener distritos de una provincia
 * @param {string} departmentId 
 * @param {string} provinceId 
 * @returns {Promise<Array>}
 */
export async function obtenerDistritos(departmentId, provinceId) {
    if (!departmentId || !provinceId) return Promise.resolve([]);
    
    // Solo Lima Metropolitana tiene distritos pre-cargados
    if (departmentId === '15' && provinceId === '01') {
        console.log('✅ Distritos de Lima Metropolitana:', DISTRITOS_LIMA.length);
        return Promise.resolve(DISTRITOS_LIMA);
    }
    
    console.warn(`⚠️ No hay distritos pre-cargados para ${departmentId}-${provinceId}`);
    return Promise.resolve([]);
}

/**
 * Coordenadas de distritos de Lima Metropolitana
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
    'Surquillo': { lat: -12.111667, lng: -77.008333 },
    'Villa El Salvador': { lat: -12.211111, lng: -76.938889 },
    'Villa María del Triunfo': { lat: -12.166667, lng: -76.933333 }
};

/**
 * Obtener coordenadas de un distrito
 * @param {string} distrito 
 * @returns {Object}
 */
export function obtenerCoordenadasDistrito(distrito) {
    const distritoNormalizado = distrito
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    
    for (const [key, coords] of Object.entries(COORDENADAS_LIMA)) {
        const keyNormalizado = key
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        
        if (keyNormalizado.toLowerCase() === distritoNormalizado.toLowerCase()) {
            return coords;
        }
    }
    
    // Coordenadas genéricas del centro de Lima
    console.log(`⚠️ Coordenadas no encontradas para "${distrito}", usando centro de Lima`);
    return { lat: -12.046373, lng: -77.042754 };
}

/**
 * Calcular distancia entre dos puntos (Haversine)
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number}
 */
export function calcularDistancia(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round((R * c) * 10) / 10;
}

/**
 * Formatear distancia
 * @param {number} km 
 * @returns {string}
 */
export function formatearDistancia(km) {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    }
    return `${km} km`;
}

console.log('✅ Módulo UBIGEO con datos locales cargado (25 departamentos, Lima completo)');
