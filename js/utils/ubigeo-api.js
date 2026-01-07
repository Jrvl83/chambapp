// ============================================
// UBIGEO PERÚ COMPLETO
// Carga datos desde archivos JSON externos
// 1,874 distritos completos del Perú
// ============================================

/**
 * Cache de datos cargados
 */
let datosUbigeo = null;
let cargando = false;

/**
 * Cargar datos UBIGEO desde archivos JSON
 * @returns {Promise<Object>}
 */
async function cargarDatosUbigeo() {
    if (datosUbigeo) {
        return datosUbigeo;
    }
    
    if (cargando) {
        // Esperar a que termine la carga actual
        while (cargando) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return datosUbigeo;
    }
    
    cargando = true;
    
    try {
        console.log('📥 Cargando datos UBIGEO del Perú...');
        
        // Cargar los 3 archivos en paralelo
        const [depts, provs, dists] = await Promise.all([
            fetch('/chambapp/data/ubigeo_departamento.json').then(r => r.json()),
            fetch('/chambapp/data/ubigeo_provincia.json').then(r => r.json()),
            fetch('/chambapp/data/ubigeo_distrito.json').then(r => r.json())
        ]);
        
        // Procesar y optimizar datos
        datosUbigeo = {
            departamentos: depts
                .filter(d => d.inei) // Filtrar elementos sin código INEI
                .map(d => ({
                    id: d.inei.substring(0, 2),
                    name: capitalizarTexto(d.departamento),
                    latitude: d.latitude,
                    longitude: d.longitude
                })),
            
            provincias: provs
                .filter(p => p.inei && p.inei.length >= 4)
                .map(p => ({
                    id: p.inei.substring(2, 4),
                    name: capitalizarTexto(p.provincia),
                    dept_id: p.inei.substring(0, 2),
                    latitude: p.latitude,
                    longitude: p.longitude
                })),
            
            distritos: dists
                .filter(d => d.inei && d.inei.length >= 6)
                .map(d => ({
                    id: d.inei.substring(4, 6),
                    name: capitalizarTexto(d.distrito),
                    prov_id: d.inei.substring(2, 4),
                    dept_id: d.inei.substring(0, 2),
                    latitude: d.latitude,
                    longitude: d.longitude
                }))
        };
        
        console.log('✅ Datos UBIGEO cargados:');
        console.log(`   - ${datosUbigeo.departamentos.length} departamentos`);
        console.log(`   - ${datosUbigeo.provincias.length} provincias`);
        console.log(`   - ${datosUbigeo.distritos.length} distritos`);
        
        cargando = false;
        return datosUbigeo;
        
    } catch (error) {
        console.error('❌ Error al cargar datos UBIGEO:', error);
        cargando = false;
        
        // Retornar datos mínimos de fallback
        datosUbigeo = {
            departamentos: DEPARTAMENTOS_FALLBACK,
            provincias: [],
            distritos: []
        };
        
        return datosUbigeo;
    }
}

/**
 * Capitalizar texto (LIMA → Lima)
 */
function capitalizarTexto(texto) {
    if (!texto) return '';
    return texto
        .toLowerCase()
        .split(' ')
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(' ');
}

/**
 * Fallback: Departamentos básicos si falla la carga
 */
const DEPARTAMENTOS_FALLBACK = [
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
 * Obtener todos los departamentos
 * @returns {Promise<Array>}
 */
export async function obtenerDepartamentos() {
    const datos = await cargarDatosUbigeo();
    return datos.departamentos.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Obtener provincias de un departamento
 * @param {string} departmentId 
 * @returns {Promise<Array>}
 */
export async function obtenerProvincias(departmentId) {
    if (!departmentId) return [];
    
    const datos = await cargarDatosUbigeo();
    const provincias = datos.provincias.filter(p => p.dept_id === departmentId);
    
    console.log(`✅ ${provincias.length} provincias para departamento ${departmentId}`);
    return provincias.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Obtener distritos de una provincia
 * @param {string} departmentId 
 * @param {string} provinceId 
 * @returns {Promise<Array>}
 */
export async function obtenerDistritos(departmentId, provinceId) {
    if (!departmentId || !provinceId) return [];
    
    const datos = await cargarDatosUbigeo();
    const distritos = datos.distritos.filter(
        d => d.dept_id === departmentId && d.prov_id === provinceId
    );
    
    console.log(`✅ ${distritos.length} distritos para ${departmentId}-${provinceId}`);
    return distritos.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Obtener coordenadas de un distrito
 * @param {string} distrito - Nombre del distrito
 * @returns {Object} Coordenadas {lat, lng}
 */
export async function obtenerCoordenadasDistrito(distrito) {
    const datos = await cargarDatosUbigeo();
    
    if (!datos || !datos.distritos) {
        console.warn('⚠️ Datos no cargados, usando coordenadas de Lima');
        return { lat: -12.046373, lng: -77.042754 };
    }
    
    // Normalizar nombre para búsqueda
    const distritoNormalizado = distrito
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
    
    // Buscar distrito
    const dist = datos.distritos.find(d => {
        const nombreNormalizado = d.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
        return nombreNormalizado === distritoNormalizado;
    });
    
    if (dist && dist.latitude && dist.longitude) {
        return {
            lat: dist.latitude,
            lng: dist.longitude
        };
    }
    
    // Fallback: Centro de Lima
    console.log(`⚠️ Coordenadas no encontradas para "${distrito}", usando centro de Lima`);
    return { lat: -12.046373, lng: -77.042754 };
}

/**
 * Calcular distancia entre dos puntos (Fórmula de Haversine)
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number} Distancia en kilómetros
 */
export function calcularDistancia(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radio de la Tierra en km
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
 * Formatear distancia para mostrar
 * @param {number} km 
 * @returns {string}
 */
export function formatearDistancia(km) {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    }
    return `${km} km`;
}

console.log('✅ Módulo UBIGEO cargado - Listo para cargar datos completos del Perú');
