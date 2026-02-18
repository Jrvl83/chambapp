/**
 * Módulo de filtrado por estado
 * Maneja los filtros de UI y la visualización de aplicaciones
 *
 * @module mis-aplicaciones/filtros
 */

import { crearGrupoOferta } from './cards.js';

// Referencia al estado compartido
let state = null;

/**
 * Inicializa el módulo de filtros
 * @param {Object} sharedState - Estado compartido
 */
export function initFiltros(sharedState) {
    state = sharedState;
}

/**
 * Muestra las aplicaciones agrupadas por oferta, aplicando el filtro activo
 */
export function mostrarAplicaciones() {
    const container = document.getElementById('aplicaciones-container');
    const emptyState = document.getElementById('empty-state');

    const aplicacionesFiltradas = filtrarAplicaciones();

    if (aplicacionesFiltradas.length === 0) {
        mostrarEstadoVacio(container, emptyState);
        return;
    }

    const grupos = agruparPorOferta(aplicacionesFiltradas);
    renderizarGrupos(container, emptyState, grupos);
}

function filtrarAplicaciones() {
    if (!state.filtroEstadoActual) {
        return state.todasLasAplicaciones;
    }
    return state.todasLasAplicaciones.filter(a => {
        const estado = a.estado || 'pendiente';
        return estado === state.filtroEstadoActual;
    });
}

function mostrarEstadoVacio(container, emptyState) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    emptyState.querySelector('h2').textContent = state.filtroEstadoActual
        ? `Sin postulaciones ${state.filtroEstadoActual}s`
        : 'Sin postulaciones';
}

function agruparPorOferta(aplicaciones) {
    const grupos = {};
    aplicaciones.forEach(aplicacion => {
        const ofertaId = aplicacion.ofertaId || 'sin-oferta';
        if (!grupos[ofertaId]) {
            grupos[ofertaId] = {
                titulo: aplicacion.ofertaTitulo || 'Oferta sin título',
                categoria: aplicacion.ofertaCategoria || '',
                aplicaciones: []
            };
        }
        grupos[ofertaId].aplicaciones.push(aplicacion);
    });
    return grupos;
}

function renderizarGrupos(container, emptyState, grupos) {
    container.style.display = 'flex';
    emptyState.style.display = 'none';
    container.innerHTML = '';

    // Grupos con pendientes primero, luego por total de aplicaciones
    const ordenados = Object.entries(grupos).sort(([, a], [, b]) => {
        const aPend = a.aplicaciones.filter(x => (x.estado || 'pendiente') === 'pendiente').length;
        const bPend = b.aplicaciones.filter(x => (x.estado || 'pendiente') === 'pendiente').length;
        return bPend - aPend;
    });

    for (const [ofertaId, grupo] of ordenados) {
        container.innerHTML += crearGrupoOferta(ofertaId, grupo);
    }
}

/**
 * Filtra las aplicaciones por estado y actualiza los botones de filtro
 * @param {string} estado - Estado a filtrar ('' para todos)
 */
export function filtrarPorEstado(estado) {
    state.filtroEstadoActual = estado;

    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const botonActivo = document.querySelector(`.filtro-btn[data-estado="${estado}"]`);
    if (botonActivo) {
        botonActivo.classList.add('active');
    }

    mostrarAplicaciones();
}

/**
 * Registra las funciones globales del módulo de filtros
 */
export function registrarFuncionesGlobalesFiltros() {
    window.filtrarPorEstado = filtrarPorEstado;
}
