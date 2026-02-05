// ============================================
// MAPA OFERTAS JS - ChambApp
// Task 12: Mapa Interactivo de Ofertas
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { GOOGLE_MAPS_API_KEY } from './config/api-keys.js';
import { calcularDistancia, formatearDistancia } from './utils/distance.js';

// Inicializar Firebase
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================
// VARIABLES GLOBALES
// ============================================
let mapa = null;
let markers = [];
let markerClusterer = null;
let todasLasOfertas = [];
let ofertasFiltradas = [];
let ofertaSeleccionada = null;
let ubicacionUsuario = null;
let usuarioActual = null;
let usuarioData = null;
let infoWindowActivo = null;
let aplicacionesUsuario = []; // IDs de ofertas a las que ya postuló

// Icono personalizado para markers
const MARKER_ICONS = {
    default: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
                <path fill="#0066FF" d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z"/>
                <circle fill="#fff" cx="16" cy="14" r="6"/>
            </svg>
        `),
        scaledSize: { width: 32, height: 40 },
        anchor: { x: 16, y: 40 }
    },
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

// ============================================
// CARGAR GOOGLE MAPS API
// ============================================
function cargarGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve(window.google.maps);
            return;
        }

        window.initMapaOfertas = () => {
            resolve(window.google.maps);
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMapaOfertas&libraries=places,marker`;
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error('Error al cargar Google Maps'));
        document.head.appendChild(script);
    });
}

// ============================================
// CARGAR MARKER CLUSTERER
// ============================================
function cargarMarkerClusterer() {
    return new Promise((resolve, reject) => {
        if (window.markerClusterer && window.markerClusterer.MarkerClusterer) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
        script.async = true;
        script.onload = () => {
            // Esperar un momento para que la libreria se inicialice
            setTimeout(() => {
                if (window.markerClusterer && window.markerClusterer.MarkerClusterer) {
                    resolve();
                } else {
                    resolve(); // Resolver de todas formas para no bloquear
                }
            }, 100);
        };
        script.onerror = () => {
            resolve(); // Resolver de todas formas
        };
        document.head.appendChild(script);
    });
}

// ============================================
// INICIALIZAR MAPA
// ============================================
async function inicializarMapa() {
    try {
        // Cargar APIs
        await cargarGoogleMapsAPI();
        await cargarMarkerClusterer();

        // Opciones del mapa
        const mapOptions = {
            center: { lat: -12.0464, lng: -77.0428 }, // Lima, Peru
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            styles: estilosMapaPersonalizados()
        };

        // Crear mapa
        const mapElement = document.getElementById('mapa');
        mapa = new google.maps.Map(mapElement, mapOptions);

        // Ocultar loading
        const loading = document.getElementById('mapa-loading');
        if (loading) loading.classList.add('oculto');


        // Cargar ofertas
        await cargarOfertas();

    } catch (error) {
        console.error('Error al inicializar mapa:', error);
        mostrarErrorMapa();
    }
}

// ============================================
// ESTILOS PERSONALIZADOS DEL MAPA
// ============================================
function estilosMapaPersonalizados() {
    return [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
        }
    ];
}

// ============================================
// CARGAR OFERTAS DE FIRESTORE
// ============================================
async function cargarOfertas() {
    try {
        const q = query(
            collection(db, 'ofertas'),
            where('estado', '==', 'activa'),
            orderBy('fechaCreacion', 'desc'),
            limit(100)
        );

        const snapshot = await getDocs(q);
        todasLasOfertas = [];
        const ahora = new Date();

        snapshot.forEach((docSnap) => {
            const oferta = docSnap.data();

            // Verificar que la oferta no esté expirada
            if (oferta.fechaExpiracion) {
                const fechaExp = oferta.fechaExpiracion.toDate ? oferta.fechaExpiracion.toDate() : new Date(oferta.fechaExpiracion);
                if (fechaExp < ahora) return; // Oferta expirada, no mostrar
            }

            // Solo agregar ofertas con coordenadas
            if (oferta.ubicacion && typeof oferta.ubicacion === 'object' && oferta.ubicacion.coordenadas) {
                const coords = oferta.ubicacion.coordenadas;
                if (coords.lat && coords.lng) {
                    todasLasOfertas.push({
                        id: docSnap.id,
                        data: oferta,
                        lat: coords.lat,
                        lng: coords.lng
                    });
                }
            }
        });


        // Aplicar filtros iniciales
        aplicarFiltrosMapa();

    } catch (error) {
        console.error('Error al cargar ofertas:', error);
    }
}

// ============================================
// CREAR MARKERS EN EL MAPA
// ============================================
function crearMarkers() {
    // Limpiar markers existentes
    limpiarMarkers();

    // Crear nuevos markers
    ofertasFiltradas.forEach((oferta) => {
        const marker = crearMarkerOferta(oferta);
        markers.push(marker);
    });

    // Crear cluster (si la libreria esta disponible)
    if (window.markerClusterer && window.markerClusterer.MarkerClusterer && markers.length > 0) {
        markerClusterer = new window.markerClusterer.MarkerClusterer({
            map: mapa,
            markers: markers,
            onClusterClick: (event, cluster, map) => {
                // Obtener markers del cluster
                const clusterMarkers = cluster.markers;
                const currentZoom = map.getZoom();

                // Si el zoom es alto (>=17) o hay markers en la misma posicion, mostrar lista
                if (currentZoom >= 17 || tienenMismaPosicion(clusterMarkers)) {
                    mostrarListaOfertasCluster(clusterMarkers);
                } else {
                    // Comportamiento normal: zoom in
                    map.fitBounds(cluster.bounds);
                }
            },
            renderer: {
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
            }
        });
    }

    // Actualizar contador
    actualizarContador();

    // Actualizar lista en sidebar
    actualizarListaSidebar();

    // Ajustar bounds si hay markers
    ajustarBounds();
}

// ============================================
// CREAR MARKER INDIVIDUAL
// ============================================
function crearMarkerOferta(oferta) {
    const categoria = oferta.data.categoria || 'otros';
    const color = MARKER_ICONS[categoria] || MARKER_ICONS.otros;

    const svgMarker = {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
                <path fill="${color}" d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z"/>
                <circle fill="#fff" cx="16" cy="14" r="6"/>
            </svg>
        `),
        scaledSize: new google.maps.Size(32, 40),
        anchor: new google.maps.Point(16, 40)
    };

    const marker = new google.maps.Marker({
        position: { lat: oferta.lat, lng: oferta.lng },
        map: mapa,
        icon: svgMarker,
        title: oferta.data.titulo,
        animation: google.maps.Animation.DROP
    });

    // Click en marker
    marker.addListener('click', () => {
        mostrarPreviewOferta(oferta);
        resaltarOfertaEnLista(oferta.id);
    });

    // Guardar referencia de la oferta en el marker
    marker.ofertaId = oferta.id;

    return marker;
}

// ============================================
// LIMPIAR MARKERS
// ============================================
function limpiarMarkers() {
    // Limpiar cluster
    if (markerClusterer) {
        markerClusterer.clearMarkers();
        markerClusterer = null;
    }

    // Limpiar markers individuales
    markers.forEach(marker => {
        marker.setMap(null);
    });
    markers = [];

    // Cerrar info window
    if (infoWindowActivo) {
        infoWindowActivo.close();
        infoWindowActivo = null;
    }
}

// ============================================
// APLICAR FILTROS
// ============================================
window.aplicarFiltrosMapa = function() {
    const categoriaFiltro = document.getElementById('filtro-categoria-mapa')?.value || '';
    const distanciaFiltro = document.getElementById('filtro-distancia-mapa')?.value || '';

    ofertasFiltradas = todasLasOfertas.filter(oferta => {
        let cumple = true;

        // Filtro por categoria
        if (categoriaFiltro) {
            cumple = cumple && oferta.data.categoria === categoriaFiltro;
        }

        // Filtro por distancia
        if (distanciaFiltro && ubicacionUsuario) {
            const distancia = calcularDistancia(
                ubicacionUsuario.lat,
                ubicacionUsuario.lng,
                oferta.lat,
                oferta.lng
            );
            cumple = cumple && distancia <= parseFloat(distanciaFiltro);
        }

        return cumple;
    });

    // Recrear markers
    crearMarkers();
};

// ============================================
// LIMPIAR FILTROS
// ============================================
window.limpiarFiltrosMapa = function() {
    const categoriaSelect = document.getElementById('filtro-categoria-mapa');
    const distanciaSelect = document.getElementById('filtro-distancia-mapa');

    if (categoriaSelect) categoriaSelect.value = '';
    if (distanciaSelect) distanciaSelect.value = '';

    aplicarFiltrosMapa();
};

// ============================================
// MOSTRAR PREVIEW DE OFERTA
// ============================================
function mostrarPreviewOferta(oferta) {
    ofertaSeleccionada = oferta;
    const preview = document.getElementById('oferta-preview');
    const contenido = document.getElementById('preview-contenido');

    if (!preview || !contenido) return;

    const ubicacionTexto = oferta.data.ubicacion?.texto_completo ||
                          oferta.data.ubicacion?.distrito ||
                          'Sin ubicacion';

    // Calcular distancia si hay ubicacion del usuario
    let distanciaBadge = '';
    if (ubicacionUsuario) {
        const distancia = calcularDistancia(
            ubicacionUsuario.lat,
            ubicacionUsuario.lng,
            oferta.lat,
            oferta.lng
        );
        const colorClase = distancia <= 5 ? 'distancia-cerca' :
                          (distancia <= 15 ? 'distancia-media' : 'distancia-lejos');
        distanciaBadge = `<span class="distancia-badge-preview ${colorClase}">A ${formatearDistancia(distancia)} de ti</span>`;
    }

    contenido.innerHTML = `
        <span class="preview-categoria ${oferta.data.categoria}">${oferta.data.categoria || 'otros'}</span>
        <h3 class="preview-titulo">${oferta.data.titulo}</h3>
        <p class="preview-descripcion">${oferta.data.descripcion?.substring(0, 100) || ''}...</p>
        <div class="preview-detalles">
            <span class="preview-detalle">&#128176; ${oferta.data.salario || 'A convenir'}</span>
            <span class="preview-detalle">&#128205; ${ubicacionTexto}</span>
            ${distanciaBadge}
            ${(oferta.data.vacantes || 1) > 1 ? `<span class="preview-detalle">👥 ${oferta.data.vacantes} vacantes</span>` : ''}
        </div>
        <div class="preview-acciones">
            <button class="btn btn-secondary" onclick="cerrarPreview()">Cerrar</button>
            <button class="btn btn-primary" onclick="verDetalleOferta('${oferta.id}')">Ver detalles</button>
        </div>
    `;

    preview.style.display = 'block';

    // Centrar mapa en la oferta
    mapa.panTo({ lat: oferta.lat, lng: oferta.lng });
}

// ============================================
// VERIFICAR SI MARKERS TIENEN MISMA POSICION
// ============================================
function tienenMismaPosicion(clusterMarkers) {
    if (clusterMarkers.length < 2) return false;

    const threshold = 0.0001; // ~10 metros de diferencia
    const firstPos = clusterMarkers[0].getPosition();

    for (let i = 1; i < clusterMarkers.length; i++) {
        const pos = clusterMarkers[i].getPosition();
        const latDiff = Math.abs(firstPos.lat() - pos.lat());
        const lngDiff = Math.abs(firstPos.lng() - pos.lng());

        if (latDiff > threshold || lngDiff > threshold) {
            return false; // Al menos un marker esta en posicion diferente
        }
    }

    return true; // Todos estan en la misma posicion (o muy cerca)
}

// ============================================
// MOSTRAR LISTA DE OFERTAS DEL CLUSTER
// ============================================
function mostrarListaOfertasCluster(clusterMarkers) {
    // Obtener las ofertas de los markers del cluster
    const ofertasDelCluster = clusterMarkers.map(marker => {
        return ofertasFiltradas.find(o => o.id === marker.ofertaId);
    }).filter(o => o !== undefined);

    if (ofertasDelCluster.length === 0) return;

    // Crear o actualizar el modal de lista
    let modal = document.getElementById('modal-lista-cluster');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-lista-cluster';
        modal.className = 'modal-lista-cluster';
        modal.innerHTML = `
            <div class="modal-lista-contenido">
                <div class="modal-lista-header">
                    <h3>Ofertas en esta ubicacion</h3>
                    <button class="btn-cerrar-modal" onclick="cerrarModalCluster()">&times;</button>
                </div>
                <div class="modal-lista-body" id="modal-lista-body">
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Llenar la lista de ofertas
    const body = document.getElementById('modal-lista-body');
    let html = '';

    ofertasDelCluster.forEach(oferta => {
        const ubicacionTexto = oferta.data.ubicacion?.distrito || 'Sin ubicacion';

        // Calcular distancia si hay ubicacion del usuario
        let distanciaTexto = '';
        if (ubicacionUsuario) {
            const distancia = calcularDistancia(
                ubicacionUsuario.lat,
                ubicacionUsuario.lng,
                oferta.lat,
                oferta.lng
            );
            distanciaTexto = `<span class="distancia-mini">A ${formatearDistancia(distancia)}</span>`;
        }

        html += `
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
    });

    body.innerHTML = html;

    // Mostrar modal
    modal.classList.add('activo');
}

// ============================================
// CERRAR MODAL DE CLUSTER
// ============================================
window.cerrarModalCluster = function() {
    const modal = document.getElementById('modal-lista-cluster');
    if (modal) {
        modal.classList.remove('activo');
    }
};

// ============================================
// SELECCIONAR OFERTA DESDE MODAL DE CLUSTER
// ============================================
window.seleccionarOfertaDeCluster = function(ofertaId) {
    cerrarModalCluster();
    const oferta = ofertasFiltradas.find(o => o.id === ofertaId);
    if (oferta) {
        mostrarPreviewOferta(oferta);
    }
};

// ============================================
// CERRAR PREVIEW
// ============================================
window.cerrarPreview = function() {
    const preview = document.getElementById('oferta-preview');
    if (preview) {
        preview.style.display = 'none';
    }
    ofertaSeleccionada = null;

    // Quitar resaltado de lista
    document.querySelectorAll('.oferta-mini-card.activa').forEach(card => {
        card.classList.remove('activa');
    });
};

// ============================================
// VER DETALLE DE OFERTA (Modal completo en el mapa)
// ============================================
window.verDetalleOferta = async function(ofertaId) {
    try {
        // Buscar la oferta en las ya cargadas o cargarla de Firestore
        let oferta = ofertasFiltradas.find(o => o.id === ofertaId);
        let ofertaData;

        if (oferta) {
            ofertaData = oferta.data;
        } else {
            const docRef = doc(db, 'ofertas', ofertaId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                if (typeof mostrarToast === 'function') {
                    mostrarToast('No se encontro la oferta', 'error');
                }
                return;
            }
            ofertaData = docSnap.data();
        }

        // Cerrar el preview pequeño
        cerrarPreview();

        // Obtener texto de ubicación
        const ubicacionTexto = typeof ofertaData.ubicacion === 'object'
            ? (ofertaData.ubicacion.texto_completo || ofertaData.ubicacion.distrito || 'No especificada')
            : (ofertaData.ubicacion || 'No especificada');

        // Verificar si ya postuló
        const yaAplico = aplicacionesUsuario.includes(ofertaId);

        // Botón de acción
        let botonAccion = '';
        if (yaAplico) {
            botonAccion = `
                <button class="btn btn-success" disabled style="cursor: not-allowed; opacity: 0.7;">
                    ✅ Ya postulaste
                </button>
            `;
        } else {
            botonAccion = `
                <button class="btn btn-primary touchable" onclick="mostrarFormularioPostulacionMapa('${ofertaId}')">
                    📝 Postular a esta oferta
                </button>
            `;
        }

        // Galería de fotos (G6)
        let galeriaHTML = '';
        if (ofertaData.imagenesURLs && ofertaData.imagenesURLs.length > 0) {
            galeriaHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem;">
                        ${ofertaData.imagenesURLs.map((url, i) => `
                            <img src="${url}" alt="Foto ${i + 1}"
                                style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; cursor: pointer; flex-shrink: 0;"
                                onclick="window.open('${url}', '_blank')">
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Llenar el modal
        const modalBody = document.getElementById('modal-detalle-body');
        modalBody.innerHTML = `
            <div class="detalle-header">
                <h2 class="detalle-titulo">${ofertaData.titulo}</h2>
                <span class="detalle-categoria ${ofertaData.categoria}">${ofertaData.categoria || 'otros'}</span>
            </div>

            ${galeriaHTML}

            <div class="detalle-seccion">
                <h4>📝 Descripcion</h4>
                <p>${ofertaData.descripcion || 'Sin descripcion'}</p>
            </div>

            <div class="detalle-grid">
                <div class="detalle-item">
                    <strong>💰 Salario</strong>
                    <span>${ofertaData.salario || 'A convenir'}</span>
                </div>
                <div class="detalle-item">
                    <strong>📍 Ubicacion</strong>
                    <span>${ubicacionTexto}</span>
                </div>
                <div class="detalle-item">
                    <strong>⏱️ Duracion</strong>
                    <span>${ofertaData.duracion || 'No especificada'}</span>
                </div>
                <div class="detalle-item">
                    <strong>🕐 Horario</strong>
                    <span>${ofertaData.horario || 'No especificado'}</span>
                </div>
                ${(ofertaData.vacantes || 1) > 1 ? `
                <div class="detalle-item">
                    <strong>👥 Vacantes</strong>
                    <span>${ofertaData.vacantes} personas</span>
                </div>
                ` : ''}
            </div>

            <div class="detalle-seccion">
                <h4>📋 Requisitos</h4>
                <p><strong>Experiencia:</strong> ${ofertaData.experiencia || 'No especificada'}</p>
                <p><strong>Habilidades:</strong> ${ofertaData.habilidades || 'No especificadas'}</p>
            </div>

            <div class="detalle-empleador">
                <strong>👤 Publicado por:</strong><br>
                <span>${ofertaData.empleadorNombre || 'Empleador'}</span>
            </div>

            <div class="detalle-acciones">
                <button class="btn btn-secondary" onclick="cerrarModalDetalle()">Cerrar</button>
                ${botonAccion}
            </div>
        `;

        // Mostrar modal
        const modal = document.getElementById('modal-detalle-overlay');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Error al cargar detalle:', error);
        if (typeof mostrarToast === 'function') {
            mostrarToast('Error al cargar los detalles', 'error');
        }
    }
};

// ============================================
// CERRAR MODAL DETALLE
// ============================================
window.cerrarModalDetalle = function() {
    const modal = document.getElementById('modal-detalle-overlay');
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = '';
};

window.clickFueraModalDetalle = function(event) {
    if (event.target.id === 'modal-detalle-overlay') {
        cerrarModalDetalle();
    }
};

// ============================================
// MOSTRAR FORMULARIO DE POSTULACION
// ============================================
window.mostrarFormularioPostulacionMapa = async function(ofertaId) {
    try {
        let oferta = ofertasFiltradas.find(o => o.id === ofertaId);
        let ofertaData;

        if (oferta) {
            ofertaData = oferta.data;
        } else {
            const docRef = doc(db, 'ofertas', ofertaId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return;
            ofertaData = docSnap.data();
        }

        const modalBody = document.getElementById('modal-detalle-body');
        modalBody.innerHTML = `
            <div class="detalle-header">
                <h2 class="detalle-titulo">Postular a:</h2>
                <h3 style="color: var(--dark); margin-top: 0.5rem;">${ofertaData.titulo}</h3>
            </div>

            <div class="detalle-seccion">
                <label for="mensaje-postulacion-mapa" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                    💬 Mensaje para el empleador:
                </label>
                <textarea
                    id="mensaje-postulacion-mapa"
                    placeholder="Preséntate brevemente y explica por qué eres el candidato ideal para esta oferta..."
                    style="width: 100%; min-height: 120px; padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"
                ></textarea>
                <p style="font-size: 0.875rem; color: var(--gray); margin-top: 0.5rem;">
                    Tip: Un buen mensaje aumenta tus posibilidades de ser contactado
                </p>
            </div>

            <div style="background: #fef3c7; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 3px solid #f59e0b;">
                <p style="margin: 0; font-size: 0.9rem; color: #92400e;">
                    <strong>📧 Nota:</strong> El empleador vera tu perfil y podra contactarte directamente.
                </p>
            </div>

            <div class="detalle-acciones">
                <button class="btn btn-secondary" onclick="verDetalleOferta('${ofertaId}')">
                    ← Volver
                </button>
                <button class="btn btn-primary" onclick="enviarPostulacionMapa('${ofertaId}')" id="btn-enviar-postulacion-mapa">
                    ✉️ Enviar Postulacion
                </button>
            </div>
        `;
    } catch (error) {
        console.error('Error:', error);
    }
};

// ============================================
// ENVIAR POSTULACION
// ============================================
window.enviarPostulacionMapa = async function(ofertaId) {
    const mensaje = document.getElementById('mensaje-postulacion-mapa')?.value.trim();

    if (!mensaje) {
        if (typeof mostrarToast === 'function') {
            mostrarToast('Por favor escribe un mensaje', 'error');
        }
        return;
    }

    const btnEnviar = document.getElementById('btn-enviar-postulacion-mapa');
    const textoOriginal = btnEnviar.innerHTML;

    try {
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = '⏳ Enviando...';

        // Obtener datos de la oferta
        const ofertaDoc = await getDoc(doc(db, 'ofertas', ofertaId));
        if (!ofertaDoc.exists()) {
            throw new Error('Oferta no encontrada');
        }
        const ofertaData = ofertaDoc.data();

        // Crear la aplicación/postulación
        const aplicacion = {
            aplicanteId: usuarioActual.uid,
            aplicanteEmail: usuarioActual.email,
            aplicanteNombre: usuarioData?.nombre || 'Trabajador',
            aplicanteTelefono: usuarioData?.telefono || '',
            empleadorId: ofertaData.empleadorId || '',
            empleadorEmail: ofertaData.empleadorEmail || '',
            empleadorNombre: ofertaData.empleadorNombre || 'Empleador',
            empleadorTelefono: ofertaData.empleadorTelefono || '',
            ofertaId: ofertaId,
            ofertaTitulo: ofertaData.titulo || '',
            ofertaCategoria: ofertaData.categoria || '',
            mensaje: mensaje,
            estado: 'pendiente',
            fechaAplicacion: serverTimestamp()
        };

        // Guardar en Firestore
        await addDoc(collection(db, 'aplicaciones'), aplicacion);

        // Actualizar lista local de aplicaciones
        aplicacionesUsuario.push(ofertaId);

        // Mostrar éxito
        if (typeof mostrarToast === 'function') {
            mostrarToast('¡Postulacion enviada exitosamente!', 'success');
        }

        // Cerrar modal
        cerrarModalDetalle();

    } catch (error) {
        console.error('Error al enviar postulacion:', error);
        if (typeof mostrarToast === 'function') {
            mostrarToast('Error al enviar postulacion', 'error');
        }
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = textoOriginal;
    }
};

// ============================================
// CARGAR APLICACIONES DEL USUARIO
// ============================================
async function cargarAplicacionesUsuario(userId) {
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
// ACTUALIZAR LISTA EN SIDEBAR
// ============================================
function actualizarListaSidebar() {
    const listaContenido = document.getElementById('ofertas-lista-contenido');
    if (!listaContenido) return;

    if (ofertasFiltradas.length === 0) {
        listaContenido.innerHTML = `
            <div class="mapa-empty-state scale-in">
                <div class="icono">&#128269;</div>
                <p>Sin ofertas en esta área. Prueba ampliando la búsqueda.</p>
            </div>
        `;
        return;
    }

    let html = '';
    ofertasFiltradas.slice(0, 20).forEach(oferta => {
        const ubicacionTexto = oferta.data.ubicacion?.distrito || 'Sin ubicacion';

        // Calcular distancia
        let distanciaTexto = '';
        if (ubicacionUsuario) {
            const distancia = calcularDistancia(
                ubicacionUsuario.lat,
                ubicacionUsuario.lng,
                oferta.lat,
                oferta.lng
            );
            distanciaTexto = `<span>&#128207; ${formatearDistancia(distancia)}</span>`;
        }

        html += `
            <div class="oferta-mini-card" data-oferta-id="${oferta.id}" onclick="seleccionarOfertaLista('${oferta.id}')">
                <div class="oferta-mini-titulo">${oferta.data.titulo}</div>
                <div class="oferta-mini-detalles">
                    <span>&#128176; ${oferta.data.salario || 'A convenir'}</span>
                    <span>&#128205; ${ubicacionTexto}</span>
                    ${distanciaTexto}
                </div>
                <span class="oferta-mini-categoria ${oferta.data.categoria}">${oferta.data.categoria || 'otros'}</span>
            </div>
        `;
    });

    listaContenido.innerHTML = html;
}

// ============================================
// SELECCIONAR OFERTA DESDE LISTA
// ============================================
window.seleccionarOfertaLista = function(ofertaId) {
    const oferta = ofertasFiltradas.find(o => o.id === ofertaId);
    if (oferta) {
        mostrarPreviewOferta(oferta);
        resaltarOfertaEnLista(ofertaId);

        // En movil, cerrar sidebar
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    }
};

// ============================================
// RESALTAR OFERTA EN LISTA
// ============================================
function resaltarOfertaEnLista(ofertaId) {
    document.querySelectorAll('.oferta-mini-card').forEach(card => {
        card.classList.remove('activa');
    });

    const card = document.querySelector(`[data-oferta-id="${ofertaId}"]`);
    if (card) {
        card.classList.add('activa');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// ============================================
// ACTUALIZAR CONTADOR
// ============================================
function actualizarContador() {
    const contador = document.getElementById('total-ofertas');
    if (contador) {
        contador.textContent = ofertasFiltradas.length;
    }
}

// ============================================
// AJUSTAR BOUNDS DEL MAPA
// ============================================
function ajustarBounds() {
    if (markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    markers.forEach(marker => {
        bounds.extend(marker.getPosition());
    });

    // Si hay ubicacion del usuario, incluirla
    if (ubicacionUsuario) {
        bounds.extend(new google.maps.LatLng(ubicacionUsuario.lat, ubicacionUsuario.lng));
    }

    mapa.fitBounds(bounds);

    // No hacer zoom demasiado cercano
    const listener = google.maps.event.addListener(mapa, 'idle', function() {
        if (mapa.getZoom() > 15) mapa.setZoom(15);
        google.maps.event.removeListener(listener);
    });
}

// ============================================
// CENTRAR EN MI UBICACION
// ============================================
window.centrarEnMiUbicacion = async function() {
    try {
        if (ubicacionUsuario) {
            mapa.panTo({ lat: ubicacionUsuario.lat, lng: ubicacionUsuario.lng });
            mapa.setZoom(14);
            return;
        }

        // Obtener ubicacion del navegador
        if (!navigator.geolocation) {
            if (typeof mostrarToast === 'function') {
                mostrarToast('Tu navegador no soporta geolocalizacion', 'error');
            }
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                ubicacionUsuario = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                mapa.panTo(ubicacionUsuario);
                mapa.setZoom(14);

                // Agregar marker de usuario
                new google.maps.Marker({
                    position: ubicacionUsuario,
                    map: mapa,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <circle fill="#4285f4" cx="12" cy="12" r="10"/>
                                <circle fill="#fff" cx="12" cy="12" r="4"/>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(24, 24),
                        anchor: new google.maps.Point(12, 12)
                    },
                    title: 'Tu ubicacion'
                });

                // Actualizar lista con distancias
                actualizarListaSidebar();
            },
            (error) => {
                console.error('Error obteniendo ubicacion:', error);
                if (typeof mostrarToast === 'function') {
                    mostrarToast('No se pudo obtener tu ubicacion', 'error');
                }
            }
        );
    } catch (error) {
        console.error('Error:', error);
    }
};

// ============================================
// TOGGLE SIDEBAR
// ============================================
window.toggleSidebar = function() {
    const sidebar = document.getElementById('mapa-sidebar');
    const overlay = document.querySelector('.mapa-overlay');

    if (sidebar) {
        sidebar.classList.toggle('activo');
    }

    // Crear overlay si no existe
    if (!overlay && window.innerWidth < 768) {
        const nuevoOverlay = document.createElement('div');
        nuevoOverlay.className = 'mapa-overlay';
        nuevoOverlay.onclick = toggleSidebar;
        document.body.appendChild(nuevoOverlay);
        setTimeout(() => nuevoOverlay.classList.add('activo'), 10);
    } else if (overlay) {
        overlay.classList.toggle('activo');
    }
};

// ============================================
// TOGGLE MENU PRINCIPAL
// ============================================
window.toggleMenu = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
};

// ============================================
// CERRAR SESION
// ============================================
window.cerrarSesion = async function() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error:', error);
    }
};

// ============================================
// MOSTRAR ERROR DE MAPA
// ============================================
function mostrarErrorMapa() {
    const loading = document.getElementById('mapa-loading');
    if (loading) {
        loading.innerHTML = `
            <div class="mapa-empty-state scale-in">
                <div class="icono">&#9888;</div>
                <p>Error al cargar el mapa. Verifica tu conexión.</p>
                <button class="btn btn-primary touchable" onclick="location.reload()">Reintentar</button>
            </div>
        `;
    }
}

// ============================================
// PERSONALIZAR MENU POR TIPO DE USUARIO
// ============================================
function personalizarPorTipo(tipo) {
    const navPublicar = document.getElementById('nav-publicar');
    const navTrabajadores = document.getElementById('nav-trabajadores');
    const navTrabajadoresText = document.getElementById('nav-trabajadores-text');
    const navPerfil = document.getElementById('nav-perfil');

    if (tipo === 'trabajador') {
        if (navPublicar) navPublicar.style.display = 'none';
        if (navTrabajadores) navTrabajadores.href = 'mis-aplicaciones-trabajador.html';
        if (navTrabajadoresText) navTrabajadoresText.textContent = 'Mis Aplicaciones';
        if (navPerfil) navPerfil.href = 'perfil-trabajador.html';
    } else {
        if (navPublicar) navPublicar.style.display = 'flex';
        if (navTrabajadores) navTrabajadores.href = 'mis-aplicaciones.html';
        if (navTrabajadoresText) navTrabajadoresText.textContent = 'Ver Candidatos';
        if (navPerfil) navPerfil.href = 'perfil-empleador.html';
    }
}

// ============================================
// OBTENER UBICACION GUARDADA DEL USUARIO
// ============================================
async function obtenerUbicacionGuardada(uid) {
    try {
        const userDoc = await getDoc(doc(db, 'usuarios', uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.ubicacion && data.ubicacion.lat && data.ubicacion.lng) {
                return {
                    lat: data.ubicacion.lat,
                    lng: data.ubicacion.lng,
                    distrito: data.ubicacion.distrito
                };
            }
        }
        return null;
    } catch (error) {
        console.error('Error obteniendo ubicacion guardada:', error);
        return null;
    }
}

// ============================================
// VERIFICACION DE AUTENTICACION
// ============================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        usuarioActual = user;

        // Obtener datos del usuario
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
            usuarioData = userDoc.data();

            // Solo trabajadores pueden ver el mapa de ofertas
            if (usuarioData.tipo === 'empleador') {
                window.location.href = 'dashboard.html';
                return;
            }

            // Actualizar header
            const userName = document.getElementById('user-name');
            if (userName) {
                userName.textContent = usuarioData.nombre || 'Usuario';
            }

            // Personalizar menu
            personalizarPorTipo(usuarioData.tipo || 'trabajador');

            // Obtener ubicacion guardada
            ubicacionUsuario = await obtenerUbicacionGuardada(user.uid);
            if (ubicacionUsuario) {
            }

            // Cargar aplicaciones del usuario (para saber si ya postuló)
            await cargarAplicacionesUsuario(user.uid);

            // Inicializar mapa
            inicializarMapa();
        } else {
            window.location.href = 'login.html';
        }
    } else {
        window.location.href = 'login.html';
    }
});

