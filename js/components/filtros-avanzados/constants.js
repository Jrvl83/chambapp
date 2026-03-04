/**
 * Constantes y utilidades compartidas para filtros avanzados
 * @module components/filtros-avanzados/constants
 */

export const CATEGORIAS = [
    { value: 'construccion', label: 'Construcción', icon: '' },
    { value: 'electricidad', label: 'Electricidad', icon: '' },
    { value: 'gasfiteria', label: 'Gasfitería', icon: '' },
    { value: 'pintura', label: 'Pintura', icon: '' },
    { value: 'carpinteria', label: 'Carpintería', icon: '' },
    { value: 'limpieza', label: 'Limpieza', icon: '' },
    { value: 'jardineria', label: 'Jardinería', icon: '' },
    { value: 'mecanica', label: 'Mecánica', icon: '' },
    { value: 'otros', label: 'Otros', icon: '' }
];

export const DISTANCIAS = [
    { value: '', label: 'Cualquier distancia' },
    { value: '5', label: 'Hasta 5 km' },
    { value: '10', label: 'Hasta 10 km' },
    { value: '20', label: 'Hasta 20 km' },
    { value: '50', label: 'Hasta 50 km' }
];

export const FECHAS = [
    { value: '', label: 'Cualquier fecha' },
    { value: 'hoy', label: 'Hoy' },
    { value: 'ultimos3', label: 'Ultimos 3 dias' },
    { value: 'ultimos7', label: 'Ultimos 7 dias' }
];

export const ORDENAR = [
    { value: 'recientes', label: 'Mas recientes' },
    { value: 'cercanas', label: 'Mas cercanas' },
    { value: 'salario-desc', label: 'Mayor salario' },
    { value: 'salario-asc', label: 'Menor salario' }
];

export const STORAGE_KEY = 'chambapp-dashboard-filtros';

export const DEFAULT_STATE = {
    busqueda: '',
    categorias: [],
    ubicacion: '',
    distanciaMax: '',
    salarioMin: 0,
    salarioMax: 5000,
    fechaPublicacion: '',
    ordenar: 'recientes'
};

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function formatearSalario(valor) {
    if (valor >= 5000) return 'S/ 5,000+';
    return 'S/ ' + valor.toLocaleString('es-PE');
}
