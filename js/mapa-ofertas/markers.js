/**
 * Módulo de markers y clustering
 * Maneja la creación, filtrado y clustering de markers en el mapa
 *
 * @module mapa-ofertas/markers
 */

import { calcularDistancia, formatearDistancia } from '../utils/distance.js';

// Referencias inyectadas
let state = null;
let callbacks = {};

// Colores de markers por categoría
const MARKER_COLORS = {
    construccion: '#ea580c',
    electricidad: '#ca8a04',
    gasfiteria: '#0284c7',
    pintura: '#4f46e5',
    carpinteria: '#d97706',
    limpieza: '#7c3aed',
    jardineria: '#16a34a',
    mecanica: '#57534e',
    otros: '#475569'
};

/**
 * Inicializa el módulo de markers
 * @param {Object} sharedState - Estado compartido
 * @param {Object} cbs - Objeto compartido de callbacks
 */
export function initMarkers(sharedState, cbs) {
    state = sharedState;
    callbacks = cbs;

    // Registrar callbacks que otros módulos necesitan
    cbs.aplicarFiltrosMapa = aplicarFiltrosMapa;
}

// ============================================
// CREAR MARKERS
// ============================================

function crearSvgMarker(color) {
    return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
                <path fill="${color}" d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z"/>
                <circle fill="#fff" cx="16" cy="14" r="6"/>
            </svg>
        `),
        scaledSize: new google.maps.Size(32, 40),
        anchor: new google.maps.Point(16, 40)
    };
}

function crearMarkerOferta(oferta) {
    const categoria = oferta.data.categoria || 'otros';
    const color = MARKER_COLORS[categoria] || MARKER_COLORS.otros;

    const marker = new google.maps.Marker({
        position: { lat: oferta.lat, lng: oferta.lng },
        map: state.mapa,
        icon: crearSvgMarker(color),
        title: oferta.data.titulo,
        animation: google.maps.Animation.DROP
    });

    marker.addListener('click', () => {
        callbacks.mostrarPreviewOferta(oferta);
        callbacks.resaltarOfertaEnLista(oferta.id);
    });

    marker.ofertaId = oferta.id;
    return marker;
}

function limpiarMarkers() {
    if (state.markerClusterer) {
        state.markerClusterer.clearMarkers();
        state.markerClusterer = null;
    }

    state.markers.forEach(marker => marker.setMap(null));
    state.markers = [];

    if (state.infoWindowActivo) {
        state.infoWindowActivo.close();
        state.infoWindowActivo = null;
    }
}

function crearClusterRenderer() {
    return {
        render: ({ count, position }) => {
            return new google.maps.Marker({
                position,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                            <circle fill="#0066FF" cx="25" cy="25" r="24"/>
                            <text x="25" y="30" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">${count}</text>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(50, 50)
                },
                label: '',
                zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count
            });
        }
    };
}

function crearClusterer() {
    if (!window.markerClusterer?.MarkerClusterer || state.markers.length === 0) return;

    state.markerClusterer = new window.markerClusterer.MarkerClusterer({
        map: state.mapa,
        markers: state.markers,
        onClusterClick: (event, cluster, map) => {
            const clusterMarkers = cluster.markers;
            const currentZoom = map.getZoom();

            if (currentZoom >= 17 || tienenMismaPosicion(clusterMarkers)) {
                mostrarListaOfertasCluster(clusterMarkers);
            } else {
                map.fitBounds(cluster.bounds);
            }
        },
        renderer: crearClusterRenderer()
    });
}

export function crearMarkers() {
    limpiarMarkers();

    state.ofertasFiltradas.forEach(oferta => {
        state.markers.push(crearMarkerOferta(oferta));
    });

    crearClusterer();
    actualizarContador();
    callbacks.actualizarListaSidebar();
    callbacks.ajustarBounds();
}

// ============================================
// FILTROS
// ============================================

export function aplicarFiltrosMapa() {
    const categoriaFiltro = document.getElementById('filtro-categoria-mapa')?.value || '';
    const distanciaFiltro = document.getElementById('filtro-distancia-mapa')?.value || '';

    state.ofertasFiltradas = state.todasLasOfertas.filter(oferta => {
        let cumple = true;

        if (categoriaFiltro) {
            cumple = cumple && oferta.data.categoria === categoriaFiltro;
        }

        if (distanciaFiltro && state.ubicacionUsuario) {
            const distancia = calcularDistancia(
                state.ubicacionUsuario.lat,
                state.ubicacionUsuario.lng,
                oferta.lat,
                oferta.lng
            );
            cumple = cumple && distancia <= parseFloat(distanciaFiltro);
        }

        return cumple;
    });

    crearMarkers();
}

function limpiarFiltrosMapa() {
    const categoriaSelect = document.getElementById('filtro-categoria-mapa');
    const distanciaSelect = document.getElementById('filtro-distancia-mapa');

    if (categoriaSelect) categoriaSelect.value = '';
    if (distanciaSelect) distanciaSelect.value = '';

    aplicarFiltrosMapa();
}

// ============================================
// UTILIDADES DE MARKERS
// ============================================

function actualizarContador() {
    const contador = document.getElementById('total-ofertas');
    if (contador) {
        contador.textContent = state.ofertasFiltradas.length;
    }
}

function tienenMismaPosicion(clusterMarkers) {
    if (clusterMarkers.length < 2) return false;

    const threshold = 0.0001;
    const firstPos = clusterMarkers[0].getPosition();

    for (let i = 1; i < clusterMarkers.length; i++) {
        const pos = clusterMarkers[i].getPosition();
        if (Math.abs(firstPos.lat() - pos.lat()) > threshold ||
            Math.abs(firstPos.lng() - pos.lng()) > threshold) {
            return false;
        }
    }
    return true;
}

// ============================================
// MODAL DE CLUSTER
// ============================================

function crearItemCluster(oferta) {
    const ubicacionTexto = oferta.data.ubicacion?.distrito || 'Sin ubicacion';

    let distanciaTexto = '';
    if (state.ubicacionUsuario) {
        const distancia = calcularDistancia(
            state.ubicacionUsuario.lat,
            state.ubicacionUsuario.lng,
            oferta.lat,
            oferta.lng
        );
        distanciaTexto = `<span class="distancia-mini">A ${formatearDistancia(distancia)}</span>`;
    }

    return `
        <div class="oferta-cluster-item" onclick="seleccionarOfertaDeCluster('${oferta.id}')">
            <div class="oferta-cluster-categoria">
                <span class="categoria-tag ${oferta.data.categoria}">${oferta.data.categoria || 'otros'}</span>
            </div>
            <div class="oferta-cluster-info">
                <h4>${oferta.data.titulo}</h4>
                <div class="oferta-cluster-detalles">
                    <span>&#128176; ${oferta.data.salario || 'A convenir'}</span>
                    <span>&#128205; ${ubicacionTexto}</span>
                    ${distanciaTexto}
                </div>
            </div>
            <div class="oferta-cluster-arrow">&#8250;</div>
        </div>
    `;
}

function crearModalClusterElement() {
    const modal = document.createElement('div');
    modal.id = 'modal-lista-cluster';
    modal.className = 'modal-lista-cluster';
    modal.innerHTML = `
        <div class="modal-lista-contenido">
            <div class="modal-lista-header">
                <h3>Ofertas en esta ubicacion</h3>
                <button class="btn-cerrar-modal" onclick="cerrarModalCluster()">&times;</button>
            </div>
            <div class="modal-lista-body" id="modal-lista-body"></div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function mostrarListaOfertasCluster(clusterMarkers) {
    const ofertasDelCluster = clusterMarkers
        .map(marker => state.ofertasFiltradas.find(o => o.id === marker.ofertaId))
        .filter(o => o !== undefined);

    if (ofertasDelCluster.length === 0) return;

    let modal = document.getElementById('modal-lista-cluster');
    if (!modal) {
        modal = crearModalClusterElement();
    }

    const body = document.getElementById('modal-lista-body');
    body.innerHTML = ofertasDelCluster.map(crearItemCluster).join('');
    modal.classList.add('activo');
}

function cerrarModalCluster() {
    const modal = document.getElementById('modal-lista-cluster');
    if (modal) {
        modal.classList.remove('activo');
    }
}

function seleccionarOfertaDeCluster(ofertaId) {
    cerrarModalCluster();
    const oferta = state.ofertasFiltradas.find(o => o.id === ofertaId);
    if (oferta) {
        callbacks.mostrarPreviewOferta(oferta);
    }
}

/**
 * Registra las funciones globales del módulo de markers
 */
export function registrarFuncionesGlobalesMarkers() {
    window.aplicarFiltrosMapa = aplicarFiltrosMapa;
    window.limpiarFiltrosMapa = limpiarFiltrosMapa;
    window.cerrarModalCluster = cerrarModalCluster;
    window.seleccionarOfertaDeCluster = seleccionarOfertaDeCluster;
}
