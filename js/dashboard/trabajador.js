/**
 * Módulo de dashboard para trabajadores
 * Maneja: cargar ofertas, estadísticas, filtros avanzados
 *
 * @module dashboard/trabajador
 */

import { collection, query, where, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { calcularDistancia, formatearDistancia } from '../utils/distance.js';
import { crearOfertaCardTrabajador } from '../components/oferta-card.js';
import { getUbicacionUsuario } from './geolocation.js';

// ============================================
// VARIABLES DEL MÓDULO
// ============================================
let db = null;
let todasLasOfertas = [];
let aplicacionesUsuario = [];
let filtrosAvanzadosComponent = null;

/**
 * Inicializa el módulo con dependencias
 */
export function initTrabajador(firestore) {
    db = firestore;
}

/**
 * Obtiene las aplicaciones del usuario
 */
export function getAplicacionesUsuario() {
    return aplicacionesUsuario;
}

/**
 * Obtiene todas las ofertas cargadas
 */
export function getTodasLasOfertas() {
    return todasLasOfertas;
}

/**
 * Obtiene el componente de filtros
 */
export function getFiltrosComponent() {
    return filtrosAvanzadosComponent;
}

// ============================================
// CARGAR APLICACIONES DEL USUARIO
// ============================================

export async function cargarAplicacionesUsuario(userId) {
    try {
        const q = query(
            collection(db, 'aplicaciones'),
            where('aplicanteId', '==', userId)
        );
        const snapshot = await getDocs(q);
        aplicacionesUsuario = snapshot.docs.map(doc => doc.data().ofertaId);
    } catch (error) {
        console.error('Error cargando aplicaciones:', error);
    }
}

// ============================================
// CARGAR OFERTAS PARA TRABAJADOR
// ============================================

export async function cargarOfertasTrabajador() {
    try {
        const q = query(
            collection(db, 'ofertas'),
            where('estado', '==', 'activa'),
            orderBy('fechaCreacion', 'desc'),
            limit(20)
        );

        const snapshot = await getDocs(q);
        const ofertasGrid = document.getElementById('ofertas-grid-trabajador');

        if (snapshot.empty || !ofertasGrid) {
            mostrarEmptyStateTrabajador();
            return;
        }

        ofertasGrid.innerHTML = '';
        todasLasOfertas = [];
        const ahora = new Date();

        snapshot.forEach((docSnap) => {
            const oferta = docSnap.data();

            if (oferta.fechaExpiracion) {
                const fechaExp = oferta.fechaExpiracion.toDate
                    ? oferta.fechaExpiracion.toDate()
                    : new Date(oferta.fechaExpiracion);
                if (fechaExp < ahora) return;
            }

            todasLasOfertas.push({ id: docSnap.id, data: oferta });
        });

        ordenarOfertasPorFecha();
        renderizarOfertasTrabajador(ofertasGrid);

    } catch (error) {
        console.error('Error cargando ofertas trabajador:', error);
    }
}

function ordenarOfertasPorFecha() {
    todasLasOfertas.sort((a, b) => {
        const fechaA = (a.data.fechaActualizacion || a.data.fechaCreacion);
        const fechaB = (b.data.fechaActualizacion || b.data.fechaCreacion);
        const tA = fechaA?.toDate?.() || new Date(fechaA);
        const tB = fechaB?.toDate?.() || new Date(fechaB);
        return tB - tA;
    });
}

function renderizarOfertasTrabajador(ofertasGrid) {
    const ubicacionUsuario = getUbicacionUsuario();

    todasLasOfertas.forEach(item => {
        const distanciaKm = calcularDistanciaOferta(item.data, ubicacionUsuario);
        ofertasGrid.innerHTML += crearOfertaCardTrabajadorLocal(item.data, item.id, distanciaKm);
    });
}

function calcularDistanciaOferta(oferta, ubicacionUsuario) {
    if (!ubicacionUsuario) return null;
    if (!oferta.ubicacion || typeof oferta.ubicacion !== 'object') return null;
    if (!oferta.ubicacion.coordenadas) return null;

    const coords = oferta.ubicacion.coordenadas;
    if (!coords.lat || !coords.lng) return null;

    return calcularDistancia(
        ubicacionUsuario.lat,
        ubicacionUsuario.lng,
        coords.lat,
        coords.lng
    );
}

export function crearOfertaCardTrabajadorLocal(oferta, id, distanciaKm = null) {
    const yaAplico = aplicacionesUsuario.includes(id);
    return crearOfertaCardTrabajador(oferta, id, {
        distanciaKm,
        yaAplico,
        formatearDistancia
    });
}

function mostrarEmptyStateTrabajador() {
    const grid = document.getElementById('ofertas-grid-trabajador');
    if (!grid) return;

    grid.innerHTML = `
        <div class='empty-state scale-in'>
            <div class='empty-state-icon'>🔍</div>
            <h3>Sin ofertas disponibles</h3>
            <p>No hay ofertas de trabajo en este momento. Prueba explorando el mapa o vuelve más tarde.</p>
            <a href='mapa-ofertas.html' class='btn btn-primary touchable' style='margin-top: 1rem;'>
                🗺️ Explorar Mapa
            </a>
        </div>
    `;
}

// ============================================
// CARGAR ESTADÍSTICAS TRABAJADOR
// ============================================

export async function cargarEstadisticasTrabajador(userUid) {
    try {
        const ofertasDisponibles = await contarOfertasDisponibles();
        document.getElementById('stat-number-t1').textContent = ofertasDisponibles;

        const misAplicaciones = await contarMisAplicaciones(userUid);
        document.getElementById('stat-number-t2').textContent = misAplicaciones;

        const completados = await contarTrabajosCompletados(userUid);
        document.getElementById('stat-number-t3').textContent = completados;

    } catch (error) {
        console.error('Error cargando estadísticas trabajador:', error);
    }
}

async function contarOfertasDisponibles() {
    const ofertasQuery = query(
        collection(db, 'ofertas'),
        where('estado', '==', 'activa')
    );
    const ofertasSnap = await getDocs(ofertasQuery);

    const ahora = new Date();
    let count = 0;
    ofertasSnap.forEach(doc => {
        const oferta = doc.data();
        if (oferta.fechaExpiracion) {
            const fechaExp = oferta.fechaExpiracion.toDate
                ? oferta.fechaExpiracion.toDate()
                : new Date(oferta.fechaExpiracion);
            if (fechaExp > ahora) count++;
        } else {
            count++;
        }
    });
    return count;
}

async function contarMisAplicaciones(userUid) {
    const aplicacionesQuery = query(
        collection(db, 'aplicaciones'),
        where('aplicanteId', '==', userUid)
    );
    const aplicacionesSnap = await getDocs(aplicacionesQuery);
    return aplicacionesSnap.size;
}

async function contarTrabajosCompletados(userUid) {
    const completadosQuery = query(
        collection(db, 'aplicaciones'),
        where('aplicanteId', '==', userUid),
        where('estado', '==', 'completado')
    );
    const completadosSnap = await getDocs(completadosQuery);
    return completadosSnap.size;
}

// ============================================
// FILTROS AVANZADOS (Task 24)
// ============================================

export function inicializarFiltrosAvanzados() {
    if (typeof FiltrosAvanzados === 'undefined') {
        console.error('FiltrosAvanzados no está disponible');
        return;
    }

    const container = document.getElementById('filtros-avanzados-container');
    if (!container) {
        console.error('Contenedor de filtros no encontrado');
        return;
    }

    filtrosAvanzadosComponent = new FiltrosAvanzados('filtros-avanzados-container', {
        persistir: true,
        storageKey: 'chambapp-dashboard-filtros',
        debounceMs: 300
    });

    const ubicacionUsuario = getUbicacionUsuario();
    if (ubicacionUsuario) {
        filtrosAvanzadosComponent.setUserLocation(ubicacionUsuario);
    }

    filtrosAvanzadosComponent.onChange((estado) => {
        aplicarFiltrosAvanzados(estado);
    });

    filtrosAvanzadosComponent.onClear(() => {
        mostrarTodasLasOfertas();
    });

    aplicarFiltrosInicialesSiExisten();
}

function aplicarFiltrosInicialesSiExisten() {
    const estadoInicial = filtrosAvanzadosComponent.getState();
    const hayFiltrosActivos = estadoInicial.busqueda ||
        estadoInicial.categorias.length > 0 ||
        estadoInicial.ubicacion ||
        estadoInicial.distanciaMax ||
        estadoInicial.salarioMin > 0 ||
        estadoInicial.salarioMax < 5000 ||
        estadoInicial.fechaPublicacion;

    if (hayFiltrosActivos) {
        aplicarFiltrosAvanzados(estadoInicial);
    }
}

// ============================================
// APLICAR FILTROS
// ============================================

function aplicarFiltrosAvanzados(estado) {
    const ubicacionUsuario = getUbicacionUsuario();
    let ofertasConDistancia = agregarDistanciaAOfertas(todasLasOfertas, ubicacionUsuario);
    let ofertasFiltradas = filtrarOfertas(ofertasConDistancia, estado, ubicacionUsuario);
    ofertasFiltradas = ordenarOfertas(ofertasFiltradas, estado.ordenar);

    renderizarOfertasFiltradas(ofertasFiltradas);

    if (filtrosAvanzadosComponent) {
        filtrosAvanzadosComponent.updateResultsCount(ofertasFiltradas.length, todasLasOfertas.length);
    }
}

function agregarDistanciaAOfertas(ofertas, ubicacionUsuario) {
    return ofertas.map(item => {
        const distanciaKm = calcularDistanciaOferta(item.data, ubicacionUsuario);
        return { ...item, distanciaKm };
    });
}

function filtrarOfertas(ofertas, estado, ubicacionUsuario) {
    const { busqueda, categorias, ubicacion, distanciaMax, salarioMin, salarioMax, fechaPublicacion } = estado;

    return ofertas.filter(item => {
        const oferta = item.data;

        if (busqueda && !matchBusqueda(oferta, busqueda)) return false;
        if (categorias?.length > 0 && !categorias.includes(oferta.categoria)) return false;
        if (ubicacion && !matchUbicacion(oferta, ubicacion)) return false;
        if (distanciaMax && ubicacionUsuario && !matchDistancia(item, distanciaMax)) return false;
        if (!matchSalario(oferta, salarioMin, salarioMax)) return false;
        if (fechaPublicacion && !matchFecha(oferta, fechaPublicacion)) return false;

        return true;
    });
}

function matchBusqueda(oferta, busqueda) {
    const texto = `${oferta.titulo || ''} ${oferta.descripcion || ''}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
}

function matchUbicacion(oferta, ubicacion) {
    let ubicacionOferta = '';
    if (typeof oferta.ubicacion === 'object') {
        ubicacionOferta = (oferta.ubicacion.texto_completo || oferta.ubicacion.distrito || '').toLowerCase();
    } else {
        ubicacionOferta = (oferta.ubicacion || '').toLowerCase();
    }
    return ubicacionOferta.includes(ubicacion.toLowerCase());
}

function matchDistancia(item, distanciaMax) {
    const maxKm = parseFloat(distanciaMax);
    return item.distanciaKm !== null && item.distanciaKm <= maxKm;
}

function matchSalario(oferta, salarioMin, salarioMax) {
    if (salarioMin <= 0 && salarioMax >= 5000) return true;
    const salarioOferta = parsearSalario(oferta.salario);
    if (salarioMin > 0 && salarioOferta < salarioMin) return false;
    if (salarioMax < 5000 && salarioOferta > salarioMax) return false;
    return true;
}

function matchFecha(oferta, fechaPublicacion) {
    const fechaRaw = oferta.fechaActualizacion || oferta.fechaCreacion;
    const fechaOferta = fechaRaw?.toDate?.() || new Date(fechaRaw);
    const diasAtras = calcularDiasAtras(fechaPublicacion);
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasAtras);
    return fechaOferta >= fechaLimite;
}

function parsearSalario(salarioStr) {
    if (!salarioStr) return 0;
    const match = salarioStr.toString().match(/[\d,]+/);
    if (match) {
        return parseInt(match[0].replace(/,/g, ''));
    }
    return 0;
}

function calcularDiasAtras(periodo) {
    const periodos = {
        'hoy': 1,
        'ultimos3': 3,
        'ultimos7': 7
    };
    return periodos[periodo] || 365;
}

function ordenarOfertas(ofertas, criterio) {
    switch (criterio) {
        case 'cercanas':
            return ordenarPorDistancia(ofertas);
        case 'salario-asc':
            return ofertas.sort((a, b) => parsearSalario(a.data.salario) - parsearSalario(b.data.salario));
        case 'salario-desc':
            return ofertas.sort((a, b) => parsearSalario(b.data.salario) - parsearSalario(a.data.salario));
        case 'recientes':
        default:
            return ordenarPorFechaReciente(ofertas);
    }
}

function ordenarPorDistancia(ofertas) {
    return ofertas.sort((a, b) => {
        if (a.distanciaKm === null && b.distanciaKm === null) return 0;
        if (a.distanciaKm === null) return 1;
        if (b.distanciaKm === null) return -1;
        return a.distanciaKm - b.distanciaKm;
    });
}

function ordenarPorFechaReciente(ofertas) {
    return ofertas.sort((a, b) => {
        const fechaA = (a.data.fechaActualizacion || a.data.fechaCreacion);
        const fechaB = (b.data.fechaActualizacion || b.data.fechaCreacion);
        const tA = fechaA?.toDate?.() || new Date(fechaA);
        const tB = fechaB?.toDate?.() || new Date(fechaB);
        return tB - tA;
    });
}

function renderizarOfertasFiltradas(ofertas) {
    const ofertasGrid = document.querySelector('.ofertas-grid');
    if (!ofertasGrid) return;

    if (ofertas.length === 0) {
        ofertasGrid.innerHTML = `
            <div class='empty-state scale-in'>
                <div class='empty-state-icon'>🔍</div>
                <h3>Sin resultados</h3>
                <p>No se encontraron ofertas con los filtros seleccionados. Prueba con otros criterios.</p>
            </div>
        `;
        return;
    }

    ofertasGrid.innerHTML = ofertas.map(item =>
        crearOfertaCardTrabajadorLocal(item.data, item.id, item.distanciaKm)
    ).join('');
}

function mostrarTodasLasOfertas() {
    const ubicacionUsuario = getUbicacionUsuario();
    const ofertasConDistancia = agregarDistanciaAOfertas(todasLasOfertas, ubicacionUsuario);

    renderizarOfertasFiltradas(ofertasConDistancia);

    if (filtrosAvanzadosComponent) {
        filtrosAvanzadosComponent.updateResultsCount(todasLasOfertas.length, todasLasOfertas.length);
    }
}

// ============================================
// FUNCIONES GLOBALES PARA FILTROS
// ============================================

export function registrarFuncionesGlobalesFiltros() {
    window.aplicarFiltros = function () {
        if (filtrosAvanzadosComponent) {
            aplicarFiltrosAvanzados(filtrosAvanzadosComponent.getState());
        }
    };

    window.limpiarFiltros = function () {
        if (filtrosAvanzadosComponent) {
            filtrosAvanzadosComponent.clearAll();
        }
    };
}
