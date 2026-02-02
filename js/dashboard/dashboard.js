// ========================================
// DASHBOARD.JS - Task 9 Parte 2 INTEGRADO
// ChambApp - Compatible con arquitectura original
// ========================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc, serverTimestamp, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { calcularDistancia, formatearDistancia } from '../utils/distance.js';
import { initializeFCM, requestNotificationPermission, verificarEstadoNotificaciones } from '../notifications/fcm-init.js';

// Usar window.firebaseConfig (arquitectura original)
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variables globales
let usuarioActual = null;
let usuarioData = null; // Datos completos del usuario (nombre, tipo, etc.)
let todasLasOfertas = [];
let aplicacionesUsuario = [];
let debounceTimer;
let ubicacionUsuario = null; // Task 11: Ubicacion del usuario para calcular distancias
let filtrosAvanzadosComponent = null; // Task 24: Componente de filtros avanzados

// ========================================
// FUNCIONES GEOLOCALIZACIÓN (Task 9)
// ========================================

async function obtenerCoordenadas() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Tu navegador no soporta geolocalizacion'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                let mensaje = 'Error al obtener ubicacion';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        mensaje = 'Debes permitir el acceso a tu ubicacion';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensaje = 'Ubicacion no disponible';
                        break;
                    case error.TIMEOUT:
                        mensaje = 'Tiempo de espera agotado';
                        break;
                }
                reject(new Error(mensaje));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

async function geocodificar(coords) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=AIzaSyBxopsd9CPAU2CSV91z8YAw_upxochOGYE&language=es`
        );
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results[0]) {
            const result = data.results[0];
            const addressComponents = result.address_components;
            
            let distrito = '';
            let provincia = '';
            let departamento = '';
            
            for (const component of addressComponents) {
                if (component.types.includes('locality') || component.types.includes('sublocality')) {
                    distrito = component.long_name;
                }
                if (component.types.includes('administrative_area_level_2')) {
                    provincia = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                    departamento = component.long_name;
                }
            }
            
            return {
                lat: coords.lat,
                lng: coords.lng,
                distrito: distrito || 'Ubicacion detectada',
                provincia: provincia || '',
                departamento: departamento || '',
                direccionCompleta: result.formatted_address,
                timestamp: new Date().toISOString()
            };
        } else {
            // Fallback: Guardar coordenadas sin error
            return {
                lat: coords.lat,
                lng: coords.lng,
                distrito: 'Ubicacion detectada',
                provincia: '',
                departamento: '',
                direccionCompleta: `${coords.lat}, ${coords.lng}`,
                timestamp: new Date().toISOString()
            };
        }
    } catch {
        // Fallback en caso de error de red
        return {
            lat: coords.lat,
            lng: coords.lng,
            distrito: 'Ubicacion detectada',
            provincia: '',
            departamento: '',
            direccionCompleta: `${coords.lat}, ${coords.lng}`,
            timestamp: new Date().toISOString()
        };
    }
}

async function guardarUbicacion(uid, ubicacion) {
    try {
        const userRef = doc(db, 'usuarios', uid);
        await updateDoc(userRef, {
            ubicacion: ubicacion,
            ubicacionActualizada: serverTimestamp()
        });
    } catch (error) {
        console.error('Error guardando ubicacion:', error);
        throw error;
    }
}

async function obtenerUbicacionGuardada(uid) {
    try {
        const userDoc = await getDoc(doc(db, 'usuarios', uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            return data.ubicacion || null;
        }
        return null;
    } catch {
        return null;
    }
}

async function actualizarUbicacionSilenciosa(uid) {
    try {
        const coords = await obtenerCoordenadas();
        const ubicacion = await geocodificar(coords);
        await guardarUbicacion(uid, ubicacion);
        return ubicacion;
    } catch {
        return null;
    }
}

// ========================================
// VERIFICACIÓN AUTENTICACIÓN
// ========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        usuarioActual = user;
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));

        if (userDoc.exists()) {
            const usuario = userDoc.data();
            usuarioData = usuario; // Guardar datos del usuario globalmente
            const tipoUsuario = usuario.tipo || 'trabajador';

            // Actualizar header
            actualizarHeaderUsuario(usuario);

            // Personalizar dashboard y mostrar vista correcta
            personalizarPorTipo(tipoUsuario);

            // Cargar datos según el tipo de usuario
            if (tipoUsuario === 'trabajador') {
                // ✅ Verificar ubicación (Task 9) - solo trabajadores
                await verificarUbicacion(user.uid, tipoUsuario);

                // Cargar datos trabajador
                await cargarAplicacionesUsuario(user.uid);
                await cargarOfertasTrabajador();
                await cargarEstadisticasTrabajador(user.uid);

                // Task 24: Inicializar filtros avanzados (solo trabajador)
                inicializarFiltrosAvanzados();
            } else {
                // Cargar datos empleador
                await cargarDashboardEmpleador(usuario, user.uid);
            }

            // Ocultar loading
            ocultarLoading();

            // ========================================
            // NOTIFICACIONES PUSH (Task 27)
            // ========================================
            inicializarNotificacionesPush(user.uid);

            // Task 29: Escuchar notificaciones no leidas para badge
            escucharNotificacionesNoLeidas(user.uid);

            // Verificar si hay parámetro ?oferta= en la URL (viene del mapa)
            verificarParametroOferta();
        } else {
            if (typeof toastError === 'function') {
                toastError('Error al cargar perfil');
                setTimeout(() => window.location.href = 'login.html', 1000);
            } else {
                window.location.href = 'login.html';
            }
        }
    } else {
        window.location.href = 'login.html';
    }
});

// ========================================
// VERIFICAR UBICACIÓN (Task 9 Parte 2)
// ========================================
async function verificarUbicacion(uid, tipoUsuario) {
    // Solo para trabajadores
    if (tipoUsuario !== 'trabajador') {
        return;
    }
    
    try {
        const ubicacionGuardada = await obtenerUbicacionGuardada(uid);
        
        if (!ubicacionGuardada) {
            // Primera vez - mostrar modal
            setTimeout(() => {
                mostrarModalUbicacion();
            }, 2000);
        } else {
            // Ya tiene ubicación guardada
            mostrarBadgeUbicacion(ubicacionGuardada);
            
            // Actualizar en background después de 3 segundos
            actualizarUbicacionEnBackground(uid);
        }
        
    } catch {
        // Error verificando ubicacion
    }
}

async function actualizarUbicacionEnBackground(uid) {
    try {
        // ⏰ Actualizar cada 30 minutos (no 3 segundos) para evitar rate limiting
        setTimeout(async () => {
            const nuevaUbicacion = await actualizarUbicacionSilenciosa(uid);
            
            if (nuevaUbicacion) {
                mostrarBadgeUbicacion(nuevaUbicacion);
            }
        }, 30 * 60 * 1000); // 30 minutos

    } catch {
        // Error actualizando ubicacion en background
    }
}

function mostrarBadgeUbicacion(ubicacion) {
    // Task 11: Guardar ubicacion del usuario para calcular distancias
    if (ubicacion && ubicacion.lat && ubicacion.lng) {
        ubicacionUsuario = {
            lat: ubicacion.lat,
            lng: ubicacion.lng,
            distrito: ubicacion.distrito
        };

        // Task 24: Notificar al componente de filtros avanzados
        if (filtrosAvanzadosComponent) {
            filtrosAvanzadosComponent.setUserLocation(ubicacionUsuario);
        }
    }

    let badge = document.getElementById('ubicacion-badge');

    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'ubicacion-badge';
        badge.className = 'ubicacion-badge';

        const logo = document.querySelector('.logo');
        if (logo) {
            logo.after(badge);
        }
    }

    badge.innerHTML = `
        <span class='ubicacion-texto' title='${ubicacion.direccionCompleta || ubicacion.distrito}'>
            📍 ${ubicacion.distrito}
        </span>
        <button
            class='ubicacion-actualizar'
            onclick='actualizarUbicacionManual()'
            title='Actualizar ubicacion'
            aria-label='Actualizar ubicacion'
        >
            🔄
        </button>
    `;
}

function mostrarModalUbicacion() {
    const modal = document.getElementById('modal-ubicacion');
    if (modal) {
        modal.classList.add('active');
    }
}

// ========================================
// FUNCIONES GLOBALES TASK 9
// ========================================

window.actualizarUbicacionManual = async function() {
    const btn = document.querySelector('.ubicacion-actualizar');
    if (!btn) return;
    
    const textoOriginal = btn.innerHTML;
    
    try {
        btn.innerHTML = '⏳';
        btn.disabled = true;
        
        const coords = await obtenerCoordenadas();
        const ubicacion = await geocodificar(coords);
        await guardarUbicacion(usuarioActual.uid, ubicacion);
        
        mostrarBadgeUbicacion(ubicacion);
        
        if (typeof mostrarToast === 'function') {
            mostrarToast('Ubicacion actualizada', 'success');
        }
        
    } catch (error) {
        console.error('Error:', error);
        if (typeof mostrarToast === 'function') {
            mostrarToast('No se pudo actualizar ubicacion', 'error');
        }
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    }
};

window.cerrarModalUbicacion = function() {
    const modal = document.getElementById('modal-ubicacion');
    if (modal) {
        modal.classList.remove('active');
    }
};

window.solicitarUbicacion = async function() {
    const btn = event.target;
    const textoOriginal = btn.textContent;
    
    try {
        btn.textContent = 'Obteniendo ubicacion...';
        btn.disabled = true;
        
        const coords = await obtenerCoordenadas();
        const ubicacion = await geocodificar(coords);
        await guardarUbicacion(usuarioActual.uid, ubicacion);
        
        mostrarBadgeUbicacion(ubicacion);
        window.cerrarModalUbicacion();
        
        if (typeof mostrarToast === 'function') {
            mostrarToast('Ubicacion guardada', 'success');
        }
        
    } catch (error) {
        console.error('Error:', error);
        if (typeof toastError === 'function') {
            toastError('Error al obtener ubicacion');
        }
        btn.textContent = textoOriginal;
        btn.disabled = false;
    }
};

// ========================================
// FUNCIONES DASHBOARD ORIGINAL
// ========================================

function actualizarHeaderUsuario(usuario) {
    const userName = document.getElementById('user-name');
    if (userName) {
        // Extraer primer nombre para móvil
        const nombreCompleto = usuario.nombre || 'Usuario';
        const primerNombre = nombreCompleto.split(' ')[0];
        userName.innerHTML = `Hola, ${primerNombre}`;
        userName.title = nombreCompleto; // Tooltip con nombre completo
    }
}

function personalizarPorTipo(tipo) {
    const navPublicar = document.getElementById('nav-publicar');
    const navBuscar = document.getElementById('nav-buscar');
    const navMapa = document.getElementById('nav-mapa');
    const navTrabajadores = document.getElementById('nav-trabajadores');
    const navTrabajadoresText = document.getElementById('nav-trabajadores-text');
    const navPerfil = document.getElementById('nav-perfil');
    const bottomNavProfile = document.querySelector('.bottom-nav-item[data-page="profile"]');

    // ✅ Vistas separadas
    const vistaTrabajador = document.getElementById('dashboard-trabajador');
    const vistaEmpleador = document.getElementById('dashboard-empleador');

    if (tipo === 'trabajador') {
        // === VISTA TRABAJADOR ===
        if (vistaTrabajador) vistaTrabajador.style.display = 'block';
        if (vistaEmpleador) vistaEmpleador.style.display = 'none';

        // Sidebar
        if (navPublicar) navPublicar.style.display = 'none';
        if (navBuscar) navBuscar.style.display = 'flex';
        if (navMapa) navMapa.style.display = 'flex';
        if (navTrabajadores) {
            navTrabajadores.href = 'mis-aplicaciones-trabajador.html';
            navTrabajadores.querySelector('.icon').textContent = '📋';
        }
        if (navTrabajadoresText) navTrabajadoresText.textContent = 'Mis Aplicaciones';
        if (navPerfil) navPerfil.href = 'perfil-trabajador.html';
        if (bottomNavProfile) bottomNavProfile.href = 'perfil-trabajador.html';

    } else {
        // === VISTA EMPLEADOR ===
        if (vistaTrabajador) vistaTrabajador.style.display = 'none';
        if (vistaEmpleador) vistaEmpleador.style.display = 'block';

        // Sidebar
        if (navPublicar) navPublicar.style.display = 'flex';
        if (navBuscar) navBuscar.style.display = 'none';
        if (navMapa) navMapa.style.display = 'none';
        if (navTrabajadores) {
            navTrabajadores.href = 'mis-aplicaciones.html';
            navTrabajadores.querySelector('.icon').textContent = '👥';
        }
        if (navTrabajadoresText) navTrabajadoresText.textContent = 'Ver Candidatos';
        if (navPerfil) navPerfil.href = 'perfil-empleador.html';
        if (bottomNavProfile) bottomNavProfile.href = 'perfil-empleador.html';
    }

    // ✅ Actualizar Bottom Navigation (PWA mobile)
    if (typeof BottomNav !== 'undefined' && BottomNav.setUserRole) {
        BottomNav.setUserRole(tipo);
    }

}

function ocultarLoading() {
    const loading = document.getElementById('loading-screen');
    if (loading) loading.style.display = 'none';
}

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

// ========================================
// FUNCIONES DASHBOARD TRABAJADOR
// ========================================

async function cargarOfertasTrabajador() {
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

            // Verificar que la oferta no esté expirada
            if (oferta.fechaExpiracion) {
                const fechaExp = oferta.fechaExpiracion.toDate ? oferta.fechaExpiracion.toDate() : new Date(oferta.fechaExpiracion);
                if (fechaExp < ahora) return; // Oferta expirada, no mostrar
            }

            todasLasOfertas.push({ id: docSnap.id, data: oferta });

            // Task 11: Calcular distancia si es posible
            let distanciaKm = null;
            if (ubicacionUsuario && oferta.ubicacion && typeof oferta.ubicacion === 'object' && oferta.ubicacion.coordenadas) {
                const coords = oferta.ubicacion.coordenadas;
                if (coords.lat && coords.lng) {
                    distanciaKm = calcularDistancia(
                        ubicacionUsuario.lat,
                        ubicacionUsuario.lng,
                        coords.lat,
                        coords.lng
                    );
                }
            }

            ofertasGrid.innerHTML += crearOfertaCardTrabajador(oferta, docSnap.id, distanciaKm);
        });

    } catch (error) {
        console.error('Error cargando ofertas trabajador:', error);
    }
}

async function cargarEstadisticasTrabajador(userUid) {
    try {
        // 1. Ofertas disponibles (activas y no expiradas)
        const ofertasQuery = query(
            collection(db, 'ofertas'),
            where('estado', '==', 'activa')
        );
        const ofertasSnap = await getDocs(ofertasQuery);

        // Filtrar ofertas no expiradas
        const ahora = new Date();
        let ofertasDisponibles = 0;
        ofertasSnap.forEach(doc => {
            const oferta = doc.data();
            if (oferta.fechaExpiracion) {
                const fechaExp = oferta.fechaExpiracion.toDate ? oferta.fechaExpiracion.toDate() : new Date(oferta.fechaExpiracion);
                if (fechaExp > ahora) ofertasDisponibles++;
            } else {
                // Ofertas sin fechaExpiracion (legacy) se cuentan
                ofertasDisponibles++;
            }
        });
        document.getElementById('stat-number-t1').textContent = ofertasDisponibles;

        // 2. Mis aplicaciones
        // NOTA: El campo se llama 'aplicanteId' (no 'trabajadorId') en la colección aplicaciones
        const aplicacionesQuery = query(
            collection(db, 'aplicaciones'),
            where('aplicanteId', '==', userUid)
        );
        const aplicacionesSnap = await getDocs(aplicacionesQuery);
        document.getElementById('stat-number-t2').textContent = aplicacionesSnap.size;

        // 3. Trabajos completados
        const completadosQuery = query(
            collection(db, 'aplicaciones'),
            where('aplicanteId', '==', userUid),
            where('estado', '==', 'completado')
        );
        const completadosSnap = await getDocs(completadosQuery);
        document.getElementById('stat-number-t3').textContent = completadosSnap.size;

    } catch (error) {
        console.error('Error cargando estadísticas trabajador:', error);
    }
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

// ========================================
// FUNCIONES DASHBOARD EMPLEADOR
// ========================================

async function cargarDashboardEmpleador(usuario, userUid) {
    try {
        // 1. Cargar ofertas del empleador
        const ofertasQuery = query(
            collection(db, 'ofertas'),
            where('empleadorEmail', '==', usuario.email),
            orderBy('fechaCreacion', 'desc')
        );
        const ofertasSnap = await getDocs(ofertasQuery);

        // 2. Cargar aplicaciones a sus ofertas
        const aplicacionesQuery = query(
            collection(db, 'aplicaciones'),
            where('empleadorId', '==', userUid)
        );
        const aplicacionesSnap = await getDocs(aplicacionesQuery);

        // Contar pendientes
        let pendientes = 0;
        let contratados = 0;
        aplicacionesSnap.forEach(doc => {
            const estado = doc.data().estado;
            if (estado === 'pendiente') pendientes++;
            if (estado === 'aceptado' || estado === 'completado') contratados++;
        });

        // Actualizar stats
        document.getElementById('emp-ofertas-activas').textContent = ofertasSnap.size;
        document.getElementById('emp-total-aplicaciones').textContent = aplicacionesSnap.size;
        document.getElementById('emp-contrataciones').textContent = contratados;

        // Mostrar alerta de pendientes
        const alertaPendientes = document.getElementById('alerta-pendientes');
        if (pendientes > 0) {
            alertaPendientes.style.display = 'flex';
            document.getElementById('pendientes-count').textContent =
                `${pendientes} postulacion${pendientes > 1 ? 'es' : ''}`;
        } else {
            alertaPendientes.style.display = 'none';
        }

        // Renderizar ofertas compactas
        renderizarOfertasEmpleador(ofertasSnap, aplicacionesSnap);

        // Renderizar actividad reciente
        renderizarActividadReciente(aplicacionesSnap);

    } catch (error) {
        console.error('Error cargando dashboard empleador:', error);
    }
}

function renderizarOfertasEmpleador(ofertasSnap, aplicacionesSnap) {
    const grid = document.getElementById('empleador-ofertas-grid');
    const empty = document.getElementById('empleador-ofertas-empty');

    if (ofertasSnap.empty) {
        grid.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    empty.style.display = 'none';
    grid.innerHTML = '';

    // Contar aplicaciones por oferta
    const aplicacionesPorOferta = {};
    const pendientesPorOferta = {};
    aplicacionesSnap.forEach(doc => {
        const data = doc.data();
        const ofertaId = data.ofertaId;
        aplicacionesPorOferta[ofertaId] = (aplicacionesPorOferta[ofertaId] || 0) + 1;
        if (data.estado === 'pendiente') {
            pendientesPorOferta[ofertaId] = (pendientesPorOferta[ofertaId] || 0) + 1;
        }
    });

    ofertasSnap.forEach((docSnap) => {
        const oferta = docSnap.data();
        const id = docSnap.id;
        const numAplicaciones = aplicacionesPorOferta[id] || 0;
        const numPendientes = pendientesPorOferta[id] || 0;

        const ubicacionTexto = typeof oferta.ubicacion === 'object'
            ? (oferta.ubicacion.distrito || 'Sin ubicación')
            : (oferta.ubicacion || 'Sin ubicación');

        const badgeClass = numPendientes > 0 ? 'badge-aplicaciones tiene-pendientes' :
                          (numAplicaciones > 0 ? 'badge-aplicaciones' : 'badge-sin-aplicaciones');
        const badgeText = numPendientes > 0 ? `🔔 ${numPendientes} nuevas` :
                         (numAplicaciones > 0 ? `${numAplicaciones} postulaciones` : 'Sin postulaciones');

        // Usar mismo componente visual que trabajador (homologado)
        const categoriaDisplay = oferta.categoria
            ? oferta.categoria.charAt(0).toUpperCase() + oferta.categoria.slice(1)
            : 'Otros';

        grid.innerHTML += `
            <div class="oferta-card touchable hover-lift" onclick="window.location.href='mis-aplicaciones.html'" style="cursor: pointer;">
                <div class="oferta-categoria-bar ${oferta.categoria || 'otros'}"></div>
                <div class="oferta-card-body">
                    <div class="oferta-header">
                        <span class="oferta-categoria ${oferta.categoria || 'otros'}">${categoriaDisplay}</span>
                        <span class="oferta-fecha">${formatearFecha(oferta.fechaCreacion)}</span>
                    </div>
                    <h3 class="oferta-titulo">${oferta.titulo}</h3>
                    <div class="oferta-detalles">
                        <span class="detalle">📍 ${ubicacionTexto}</span>
                        <span class="detalle detalle-salario">💰 ${oferta.salario}</span>
                    </div>
                    <div class="oferta-footer">
                        <span class="oferta-badge-postulaciones ${badgeClass}">${badgeText}</span>
                        <div class="oferta-actions">
                            <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); editarOferta('${id}')" title="Editar oferta">
                                ✏️
                            </button>
                            <button class="btn btn-danger btn-small" onclick="event.stopPropagation(); eliminarOferta('${id}', '${oferta.titulo.replace(/'/g, "\\'")}')" title="Eliminar oferta">
                                🗑️
                            </button>
                            <a href="mis-aplicaciones.html" class="btn btn-primary btn-small" onclick="event.stopPropagation()">
                                👥 Candidatos
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

function renderizarActividadReciente(aplicacionesSnap) {
    const timeline = document.getElementById('actividad-timeline');
    const empty = document.getElementById('actividad-empty');

    if (aplicacionesSnap.empty) {
        timeline.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    timeline.style.display = 'flex';
    empty.style.display = 'none';
    timeline.innerHTML = '';

    // Ordenar por fecha y tomar las últimas 5
    const aplicaciones = [];
    aplicacionesSnap.forEach(doc => {
        aplicaciones.push({ id: doc.id, ...doc.data() });
    });

    aplicaciones.sort((a, b) => {
        const fechaA = a.fechaAplicacion?.toDate?.() || new Date(0);
        const fechaB = b.fechaAplicacion?.toDate?.() || new Date(0);
        return fechaB - fechaA;
    });

    const recientes = aplicaciones.slice(0, 5);

    recientes.forEach(app => {
        const fecha = app.fechaAplicacion?.toDate?.() || new Date();
        const tiempoRelativo = calcularTiempoRelativo(fecha);
        const nombreTrabajador = app.trabajadorNombre || 'Un trabajador';
        const tituloOferta = app.ofertaTitulo || 'una oferta';

        let icono = '👤';
        let accion = 'aplicó a';
        if (app.estado === 'aceptado') {
            icono = '✅';
            accion = 'fue aceptado en';
        } else if (app.estado === 'rechazado') {
            icono = '❌';
            accion = 'no fue seleccionado para';
        } else if (app.estado === 'completado') {
            icono = '🏁';
            accion = 'completó';
        }

        timeline.innerHTML += `
            <div class="actividad-item">
                <div class="actividad-avatar">${icono}</div>
                <div class="actividad-content">
                    <p class="actividad-texto"><strong>${nombreTrabajador}</strong> ${accion} "${tituloOferta}"</p>
                    <span class="actividad-tiempo">${tiempoRelativo}</span>
                </div>
                <a href="mis-aplicaciones.html" class="actividad-action">Ver</a>
            </div>
        `;
    });
}

function calcularTiempoRelativo(fecha) {
    const ahora = new Date();
    const diff = ahora - fecha;
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Ahora mismo';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    return fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

function crearOfertaCardTrabajador(oferta, id, distanciaKm = null) {
    // Obtener texto de ubicacion
    const ubicacionTexto = typeof oferta.ubicacion === 'object'
        ? (oferta.ubicacion.texto_completo || oferta.ubicacion.distrito || 'Sin ubicacion')
        : (oferta.ubicacion || 'Sin ubicacion');

    // Badge de distancia (Task 11)
    let distanciaBadge = '';
    if (distanciaKm !== null && distanciaKm >= 0) {
        const distanciaFormateada = formatearDistancia(distanciaKm);
        const colorClase = distanciaKm <= 5 ? 'distancia-cerca' : (distanciaKm <= 15 ? 'distancia-media' : 'distancia-lejos');
        distanciaBadge = `<span class='distancia-badge ${colorClase}'>📏 A ${distanciaFormateada} de ti</span>`;
    }

    // Verificar si ya aplicó
    const yaAplico = aplicacionesUsuario.includes(id);
    const footerHTML = yaAplico
        ? `<span class='oferta-badge'>✅ Ya aplicaste</span>
           <button class='btn btn-secondary btn-small' onclick='verDetalle("${id}")'>Ver Detalles</button>`
        : `<button class='btn btn-primary btn-small' onclick='verDetalle("${id}")'>Ver Detalles</button>`;

    // Capitalizar categoría para mostrar
    const categoriaDisplay = oferta.categoria ? oferta.categoria.charAt(0).toUpperCase() + oferta.categoria.slice(1) : 'Otros';

    return `
        <div class='oferta-card touchable hover-lift'>
            <div class='oferta-categoria-bar ${oferta.categoria || 'otros'}'></div>
            <div class='oferta-card-body'>
                <div class='oferta-header'>
                    <span class='oferta-categoria ${oferta.categoria || 'otros'}'>${categoriaDisplay}</span>
                    <span class='oferta-fecha'>${formatearFecha(oferta.fechaCreacion)}</span>
                </div>
                <h3 class='oferta-titulo'>${oferta.titulo}</h3>
                <p class='oferta-descripcion'>${oferta.descripcion?.substring(0, 100) || ''}...</p>
                <div class='oferta-detalles'>
                    <span class='detalle detalle-salario'>💰 ${oferta.salario}</span>
                    <span class='detalle'>📍 ${ubicacionTexto}</span>
                    ${distanciaBadge}
                </div>
                <div class='oferta-footer'>
                    ${footerHTML}
                </div>
            </div>
        </div>
    `;
}

// Función cargarEstadisticas removida - ahora usamos cargarEstadisticasTrabajador y cargarDashboardEmpleador

function formatearFecha(timestamp) {
    if (!timestamp) return '';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString('es-PE');
}

// ========================================
// VERIFICAR SI HAY OFERTA PENDIENTE DE ABRIR
// ========================================
function verificarParametroOferta() {
    // Leer de sessionStorage (viene del mapa de ofertas)
    const ofertaId = sessionStorage.getItem('abrirOferta');

    if (ofertaId) {
        // Limpiar inmediatamente para que no se abra de nuevo
        sessionStorage.removeItem('abrirOferta');

        // Pequeño delay para asegurar que el DOM esté listo
        setTimeout(() => {
            if (typeof window.verDetalle === 'function') {
                window.verDetalle(ofertaId);
            }
        }, 500);
    }
}

// ========================================
// FUNCIONES GLOBALES
// ========================================

window.irABuscar = function() {
    // Cerrar menú móvil si está abierto
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');

    // Scroll al panel de filtros
    const filtros = document.querySelector('.filtros-container');
    if (filtros) {
        filtros.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Focus en el input de búsqueda después del scroll
        setTimeout(() => {
            const inputBusqueda = document.getElementById('filtro-busqueda');
            if (inputBusqueda) {
                inputBusqueda.focus();
            }
        }, 500);
    }
};

window.cerrarSesion = async function() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error:', error);
    }
};

window.toggleMenu = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
};

// ========================================
// TASK 24: FILTROS AVANZADOS
// ========================================

function inicializarFiltrosAvanzados() {
    // Verificar que el componente esté disponible
    if (typeof FiltrosAvanzados === 'undefined') {
        console.error('FiltrosAvanzados no está disponible');
        return;
    }

    const container = document.getElementById('filtros-avanzados-container');
    if (!container) {
        console.error('Contenedor de filtros no encontrado');
        return;
    }

    // Crear instancia del componente
    filtrosAvanzadosComponent = new FiltrosAvanzados('filtros-avanzados-container', {
        persistir: true,
        storageKey: 'chambapp-dashboard-filtros',
        debounceMs: 300
    });

    // Si ya tenemos ubicación del usuario, notificar al componente
    if (ubicacionUsuario) {
        filtrosAvanzadosComponent.setUserLocation(ubicacionUsuario);
    }

    // Callback cuando cambian los filtros
    filtrosAvanzadosComponent.onChange((estado) => {
        aplicarFiltrosAvanzados(estado);
    });

    // Callback cuando se limpian todos los filtros
    filtrosAvanzadosComponent.onClear(() => {
        mostrarTodasLasOfertas();
    });

    // Aplicar filtros iniciales si hay estado guardado
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

function parsearSalario(salarioStr) {
    // Extraer número de strings como "S/ 1,500", "1500 soles", "50/hora", etc.
    if (!salarioStr) return 0;
    const match = salarioStr.toString().match(/[\d,]+/);
    if (match) {
        return parseInt(match[0].replace(/,/g, ''));
    }
    return 0;
}

function calcularDiasAtras(periodo) {
    const periodos = {
        'ultimos7': 7,
        'ultimos30': 30,
        'ultimos90': 90
    };
    return periodos[periodo] || 365;
}

function aplicarFiltrosAvanzados(estado) {
    const {
        busqueda,
        categorias,
        ubicacion,
        distanciaMax,
        salarioMin,
        salarioMax,
        fechaPublicacion,
        ordenar
    } = estado;

    // Calcular distancia para cada oferta
    let ofertasConDistancia = todasLasOfertas.map(item => {
        const oferta = item.data;
        let distanciaKm = null;

        if (ubicacionUsuario && oferta.ubicacion && typeof oferta.ubicacion === 'object' && oferta.ubicacion.coordenadas) {
            const coords = oferta.ubicacion.coordenadas;
            if (coords.lat && coords.lng) {
                distanciaKm = calcularDistancia(
                    ubicacionUsuario.lat,
                    ubicacionUsuario.lng,
                    coords.lat,
                    coords.lng
                );
            }
        }

        return { ...item, distanciaKm };
    });

    // Filtrar ofertas
    let ofertasFiltradas = ofertasConDistancia.filter(item => {
        const oferta = item.data;

        // Filtro búsqueda texto
        if (busqueda) {
            const texto = `${oferta.titulo || ''} ${oferta.descripcion || ''}`.toLowerCase();
            if (!texto.includes(busqueda.toLowerCase())) return false;
        }

        // Filtro categorías (multiselect)
        if (categorias && categorias.length > 0) {
            if (!categorias.includes(oferta.categoria)) return false;
        }

        // Filtro ubicación texto
        if (ubicacion) {
            let ubicacionOferta = '';
            if (typeof oferta.ubicacion === 'object') {
                ubicacionOferta = (oferta.ubicacion.texto_completo || oferta.ubicacion.distrito || '').toLowerCase();
            } else {
                ubicacionOferta = (oferta.ubicacion || '').toLowerCase();
            }
            if (!ubicacionOferta.includes(ubicacion.toLowerCase())) return false;
        }

        // Filtro distancia máxima
        if (distanciaMax && ubicacionUsuario) {
            const maxKm = parseFloat(distanciaMax);
            if (item.distanciaKm === null || item.distanciaKm > maxKm) {
                return false;
            }
        }

        // Filtro rango salarial
        if (salarioMin > 0 || salarioMax < 5000) {
            const salarioOferta = parsearSalario(oferta.salario);
            if (salarioMin > 0 && salarioOferta < salarioMin) return false;
            if (salarioMax < 5000 && salarioOferta > salarioMax) return false;
        }

        // Filtro fecha publicación
        if (fechaPublicacion) {
            const fechaOferta = oferta.fechaCreacion?.toDate?.() || new Date(oferta.fechaCreacion);
            const diasAtras = calcularDiasAtras(fechaPublicacion);
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - diasAtras);

            if (fechaOferta < fechaLimite) return false;
        }

        return true;
    });

    // Ordenar
    ofertasFiltradas = ordenarOfertas(ofertasFiltradas, ordenar);

    // Renderizar
    renderizarOfertasFiltradas(ofertasFiltradas);

    // Actualizar contador en el componente
    if (filtrosAvanzadosComponent) {
        filtrosAvanzadosComponent.updateResultsCount(ofertasFiltradas.length, todasLasOfertas.length);
    }
}

function ordenarOfertas(ofertas, criterio) {
    switch (criterio) {
        case 'cercanas':
            return ofertas.sort((a, b) => {
                if (a.distanciaKm === null && b.distanciaKm === null) return 0;
                if (a.distanciaKm === null) return 1;
                if (b.distanciaKm === null) return -1;
                return a.distanciaKm - b.distanciaKm;
            });
        case 'salario-asc':
            return ofertas.sort((a, b) => {
                return parsearSalario(a.data.salario) - parsearSalario(b.data.salario);
            });
        case 'salario-desc':
            return ofertas.sort((a, b) => {
                return parsearSalario(b.data.salario) - parsearSalario(a.data.salario);
            });
        case 'recientes':
        default:
            // Ya viene ordenado de Firestore
            return ofertas;
    }
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
        crearOfertaCardTrabajador(item.data, item.id, item.distanciaKm)
    ).join('');
}

function mostrarTodasLasOfertas() {
    const ofertasConDistancia = todasLasOfertas.map(item => {
        let distanciaKm = null;

        if (ubicacionUsuario && item.data.ubicacion && typeof item.data.ubicacion === 'object' && item.data.ubicacion.coordenadas) {
            const coords = item.data.ubicacion.coordenadas;
            if (coords.lat && coords.lng) {
                distanciaKm = calcularDistancia(
                    ubicacionUsuario.lat,
                    ubicacionUsuario.lng,
                    coords.lat,
                    coords.lng
                );
            }
        }

        return { ...item, distanciaKm };
    });

    renderizarOfertasFiltradas(ofertasConDistancia);

    if (filtrosAvanzadosComponent) {
        filtrosAvanzadosComponent.updateResultsCount(todasLasOfertas.length, todasLasOfertas.length);
    }
}

// Mantener compatibilidad con código antiguo (por si se llama desde otro lugar)
window.aplicarFiltros = function() {
    if (filtrosAvanzadosComponent) {
        aplicarFiltrosAvanzados(filtrosAvanzadosComponent.getState());
    }
};

window.limpiarFiltros = function() {
    if (filtrosAvanzadosComponent) {
        filtrosAvanzadosComponent.clearAll();
    }
};

window.verDetalle = async function(id) {
    try {
        const docRef = doc(db, 'ofertas', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            if (typeof toastError === 'function') {
                toastError('No se encontró la oferta');
            }
            return;
        }

        const oferta = docSnap.data();
        const ubicacionTexto = typeof oferta.ubicacion === 'object'
            ? (oferta.ubicacion.texto_completo || oferta.ubicacion.distrito || 'No especificada')
            : (oferta.ubicacion || 'No especificada');

        // Determinar si el usuario puede postular
        const esTrabajador = usuarioData && usuarioData.tipo === 'trabajador';
        const yaAplico = aplicacionesUsuario.includes(id);

        // Botón de acción según tipo de usuario
        let botonAccion = '';
        if (esTrabajador) {
            if (yaAplico) {
                botonAccion = `
                    <button class="btn btn-success btn-disabled" disabled style="flex: 1; cursor: not-allowed; opacity: 0.7;">
                        ✅ Ya postulaste
                    </button>
                `;
            } else {
                botonAccion = `
                    <button class="btn btn-primary touchable" onclick="mostrarFormularioPostulacion('${id}')" style="flex: 1;">
                        📝 Postular a esta oferta
                    </button>
                `;
            }
        }

        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h2 style="color: var(--primary); margin-bottom: 0.5rem;">${oferta.titulo}</h2>
                <span class="oferta-categoria ${oferta.categoria}" style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem;">
                    ${oferta.categoria}
                </span>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <h3 style="margin-bottom: 0.5rem;">📝 Descripción</h3>
                <p style="color: var(--gray); line-height: 1.6;">${oferta.descripcion}</p>
            </div>

            <div style="background: var(--light); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div><strong>💰 Salario:</strong><br>${oferta.salario}</div>
                    <div><strong>📍 Ubicación:</strong><br>${ubicacionTexto}</div>
                    <div><strong>⏱️ Duración:</strong><br>${oferta.duracion || 'No especificada'}</div>
                    <div><strong>🕐 Horario:</strong><br>${oferta.horario || 'No especificado'}</div>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <h3 style="margin-bottom: 0.5rem;">📋 Requisitos</h3>
                <p><strong>Experiencia:</strong> ${oferta.experiencia || 'No especificada'}</p>
                <p><strong>Habilidades:</strong> ${oferta.habilidades || 'No especificadas'}</p>
            </div>

            <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 3px solid var(--primary);">
                <strong style="color: var(--primary);">👤 Publicado por:</strong><br>
                <span style="color: var(--dark);">${oferta.empleadorNombre || 'Empleador'}</span>
            </div>

            <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
                <button class="btn btn-secondary" onclick="cerrarModal()" style="flex: 1;">Cerrar</button>
                ${botonAccion}
            </div>
        `;

        const modalOverlay = document.getElementById('modal-overlay');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Error al cargar oferta:', error);
        if (typeof toastError === 'function') {
            toastError('Error al cargar los detalles');
        }
    }
};

window.cerrarModal = function() {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
};

window.clickFueraModal = function(event) {
    if (event.target.id === 'modal-overlay') {
        cerrarModal();
    }
};

// ========================================
// FUNCIONES DE POSTULACIÓN
// ========================================

window.mostrarFormularioPostulacion = async function(ofertaId) {
    try {
        const docRef = doc(db, 'ofertas', ofertaId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            if (typeof toastError === 'function') {
                toastError('No se encontró la oferta');
            }
            return;
        }

        const oferta = docSnap.data();

        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h2 style="color: var(--primary); margin-bottom: 0.5rem;">Postular a:</h2>
                <h3 style="color: var(--dark);">${oferta.titulo}</h3>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <label for="mensaje-postulacion" style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--dark);">
                    💬 Mensaje para el empleador:
                </label>
                <textarea
                    id="mensaje-postulacion"
                    placeholder="Preséntate brevemente y explica por qué eres el candidato ideal para esta oferta..."
                    style="width: 100%; min-height: 120px; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"
                ></textarea>
                <p style="font-size: 0.875rem; color: var(--gray); margin-top: 0.5rem;">
                    Tip: Un buen mensaje aumenta tus posibilidades de ser contactado
                </p>
            </div>

            <div style="background: #fef3c7; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 3px solid #f59e0b;">
                <p style="margin: 0; font-size: 0.9rem; color: #92400e;">
                    <strong>📧 Nota:</strong> El empleador verá tu perfil y podrá contactarte directamente.
                </p>
            </div>

            <div style="display: flex; gap: 0.75rem;">
                <button class="btn btn-secondary" onclick="verDetalle('${ofertaId}')" style="flex: 1;">
                    ← Volver
                </button>
                <button class="btn btn-primary" onclick="enviarPostulacion('${ofertaId}')" id="btn-enviar-postulacion" style="flex: 2;">
                    ✉️ Enviar Postulación
                </button>
            </div>
        `;
    } catch (error) {
        console.error('Error al mostrar formulario:', error);
        if (typeof toastError === 'function') {
            toastError('Error al cargar el formulario');
        }
    }
};

window.enviarPostulacion = async function(ofertaId) {
    const mensaje = document.getElementById('mensaje-postulacion')?.value.trim();

    if (!mensaje) {
        if (typeof toastError === 'function') {
            toastError('Por favor escribe un mensaje');
        }
        return;
    }

    const btnEnviar = document.getElementById('btn-enviar-postulacion');
    const textoOriginal = btnEnviar.innerHTML;

    try {
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = '⏳ Enviando...';

        // Obtener datos de la oferta
        const ofertaDoc = await getDoc(doc(db, 'ofertas', ofertaId));
        if (!ofertaDoc.exists()) {
            throw new Error('Oferta no encontrada');
        }
        const oferta = ofertaDoc.data();

        // Crear la aplicación/postulación
        const aplicacion = {
            // Datos del trabajador
            aplicanteId: usuarioActual.uid,
            aplicanteEmail: usuarioActual.email,
            aplicanteNombre: usuarioData?.nombre || 'Trabajador',
            aplicanteTelefono: usuarioData?.telefono || '',

            // Datos del empleador
            empleadorId: oferta.empleadorId || '',
            empleadorEmail: oferta.empleadorEmail || '',
            empleadorNombre: oferta.empleadorNombre || 'Empleador',
            empleadorTelefono: oferta.empleadorTelefono || '',

            // Datos de la oferta
            ofertaId: ofertaId,
            ofertaTitulo: oferta.titulo || '',
            ofertaCategoria: oferta.categoria || '',

            // Mensaje y estado
            mensaje: mensaje,
            estado: 'pendiente',
            fechaAplicacion: serverTimestamp()
        };

        // Guardar en Firestore
        await addDoc(collection(db, 'aplicaciones'), aplicacion);

        // Actualizar lista local de aplicaciones
        aplicacionesUsuario.push(ofertaId);

        // Mostrar éxito
        if (typeof toastSuccess === 'function') {
            toastSuccess('¡Postulación enviada exitosamente!');
        }

        // Cerrar modal
        cerrarModal();

    } catch (error) {
        console.error('Error al enviar postulación:', error);
        if (typeof toastError === 'function') {
            toastError('Error al enviar postulación');
        }
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = textoOriginal;
    }
};

// ========================================
// NOTIFICACIONES PUSH (Task 27)
// ========================================

/**
 * Inicializa el sistema de notificaciones push
 * Se ejecuta despues de que el usuario esta autenticado
 */
async function inicializarNotificacionesPush(userId) {
    // Esperar 3 segundos para no interferir con la carga inicial
    setTimeout(async () => {
        try {
            const estado = await verificarEstadoNotificaciones(db, userId);

            // Si el usuario ya denego permanentemente, no insistir
            if (estado.permisoBrowser === 'denied') {
                return;
            }

            // Inicializar FCM (registra service worker y configura listeners)
            await initializeFCM(app, db, userId);

            // Si ya tiene token, todo listo
            if (estado.tieneToken) {
                return;
            }

            // Si no ha respondido aun (default), mostrar prompt
            if (estado.permisoBrowser === 'default') {
                mostrarPromptNotificaciones();
            }

        } catch {
            // Error inicializando notificaciones
        }
    }, 3000);
}

/**
 * Task 29: Escucha notificaciones no leidas y actualiza badge en sidebar
 */
function escucharNotificacionesNoLeidas(userId) {
    const notifRef = collection(db, 'usuarios', userId, 'notificaciones');
    const q = query(notifRef, where('leida', '==', false));

    onSnapshot(q, (snapshot) => {
        const noLeidas = snapshot.size;
        actualizarBadgeNotificaciones(noLeidas);
    }, () => {
        // Error escuchando notificaciones
    });
}

/**
 * Actualiza el badge de notificaciones en el sidebar y bottom nav
 */
function actualizarBadgeNotificaciones(cantidad) {
    // Badge del sidebar
    const badgeSidebar = document.getElementById('notif-badge');
    if (badgeSidebar) {
        if (cantidad > 0) {
            badgeSidebar.textContent = cantidad > 99 ? '99+' : cantidad;
            badgeSidebar.style.display = 'flex';
        } else {
            badgeSidebar.style.display = 'none';
        }
    }

    // Badge del bottom nav
    const badgeBottomNav = document.getElementById('bottom-nav-notif-badge');
    if (badgeBottomNav) {
        if (cantidad > 0) {
            badgeBottomNav.textContent = cantidad > 99 ? '99+' : cantidad;
            badgeBottomNav.style.display = 'flex';
        } else {
            badgeBottomNav.style.display = 'none';
        }
    }
}

/**
 * Muestra el banner para solicitar permiso de notificaciones
 */
function mostrarPromptNotificaciones() {
    // Solo mostrar una vez por dia
    const ultimoPrompt = localStorage.getItem('chambapp-notif-prompt-date');
    const hoy = new Date().toDateString();

    if (ultimoPrompt === hoy) {
        return;
    }

    localStorage.setItem('chambapp-notif-prompt-date', hoy);

    // Crear banner
    const banner = document.createElement('div');
    banner.id = 'notif-prompt-banner';
    banner.className = 'notif-prompt-banner';
    banner.innerHTML = `
        <div class="notif-prompt-content">
            <span class="notif-icon">🔔</span>
            <div class="notif-text">
                <strong>Activa las notificaciones</strong>
                <p>Recibe alertas cuando te contacten o acepten tu postulacion</p>
            </div>
            <div class="notif-actions">
                <button class="btn btn-primary btn-sm" onclick="activarNotificaciones()">Activar</button>
                <button class="btn btn-secondary btn-sm" onclick="cerrarPromptNotif()">Despues</button>
            </div>
        </div>
    `;

    document.body.appendChild(banner);

    // Animar entrada despues de un frame
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            banner.classList.add('visible');
        });
    });
}

/**
 * Activa las notificaciones cuando el usuario acepta
 */
window.activarNotificaciones = async function() {
    const banner = document.getElementById('notif-prompt-banner');
    if (banner) {
        banner.classList.remove('visible');
        setTimeout(() => banner.remove(), 300);
    }

    if (!usuarioActual) {
        console.error('[Notif] Usuario no autenticado');
        return;
    }

    try {
        const result = await requestNotificationPermission(db, usuarioActual.uid);

        if (result.success) {
            if (typeof toastSuccess === 'function') {
                toastSuccess('¡Notificaciones activadas! Te avisaremos cuando haya novedades.');
            }
        } else {
            // Mostrar mensaje especifico segun la razon
            let mensaje = 'No se pudieron activar las notificaciones';

            switch (result.reason) {
                case 'ios_not_pwa':
                    mensaje = result.message;
                    mostrarModalInstruccionesiOS();
                    break;
                case 'already_denied':
                    mensaje = result.message;
                    break;
                case 'denied':
                    mensaje = 'Debes tocar "Permitir" cuando el navegador te lo solicite';
                    break;
                case 'sw_error':
                    mensaje = result.message || 'Error al configurar el servicio. Recarga la pagina.';
                    break;
                case 'token_error':
                case 'no_token':
                    mensaje = result.message || 'Error obteniendo token. Intenta de nuevo.';
                    break;
                default:
                    mensaje = result.message || 'Error al activar notificaciones';
            }

            if (typeof toastError === 'function') {
                toastError(mensaje);
            }
        }
    } catch (error) {
        console.error('[Notif] Error activando:', error);
        if (typeof toastError === 'function') {
            toastError('Error al activar notificaciones');
        }
    }
};

/**
 * Muestra modal con instrucciones para iOS
 */
function mostrarModalInstruccionesiOS() {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;

    modalBody.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📱</div>
            <h2 style="color: var(--primary); margin-bottom: 1rem;">Instala ChambApp</h2>
            <p style="color: var(--gray); margin-bottom: 1.5rem;">
                Para recibir notificaciones en iPhone, necesitas agregar ChambApp a tu pantalla de inicio:
            </p>
            <ol style="text-align: left; color: var(--dark); line-height: 2;">
                <li>Toca el boton <strong>Compartir</strong> (📤) en Safari</li>
                <li>Desplazate y selecciona <strong>"Agregar a inicio"</strong></li>
                <li>Toca <strong>"Agregar"</strong></li>
                <li>Abre ChambApp desde tu pantalla de inicio</li>
            </ol>
            <button class="btn btn-primary" onclick="cerrarModal()" style="margin-top: 1.5rem; width: 100%;">
                Entendido
            </button>
        </div>
    `;

    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Cierra el banner de notificaciones
 */
window.cerrarPromptNotif = function() {
    const banner = document.getElementById('notif-prompt-banner');
    if (banner) {
        banner.classList.remove('visible');
        setTimeout(() => banner.remove(), 300);
    }
};

// ========================================
// FUNCIONES EDITAR/ELIMINAR OFERTAS (G4)
// ========================================

/**
 * Redirige al formulario de edición de oferta
 */
window.editarOferta = function(ofertaId) {
    window.location.href = `publicar-oferta.html?id=${ofertaId}`;
};

/**
 * Muestra modal de confirmación para eliminar oferta
 */
window.eliminarOferta = function(ofertaId, titulo) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
            <h3 style="margin-bottom: 0.5rem; color: var(--dark);">¿Eliminar oferta?</h3>
            <p style="color: var(--gray-600); margin-bottom: 1.5rem;">
                "${titulo}"<br>
                <small>Esta acción no se puede deshacer.</small>
            </p>
            <div style="display: flex; gap: 0.75rem;">
                <button class="btn btn-secondary" onclick="cerrarModal()" style="flex: 1;">
                    Cancelar
                </button>
                <button class="btn btn-danger" onclick="confirmarEliminarOferta('${ofertaId}')" style="flex: 1;">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `;
    document.getElementById('modal-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
};

/**
 * Confirma y ejecuta la eliminación de la oferta
 */
window.confirmarEliminarOferta = async function(ofertaId) {
    const btn = event.target;
    const textoOriginal = btn.innerHTML;

    try {
        btn.disabled = true;
        btn.innerHTML = '⏳ Eliminando...';

        // Eliminar la oferta
        await deleteDoc(doc(db, 'ofertas', ofertaId));

        // Eliminar aplicaciones relacionadas
        const appsQuery = query(
            collection(db, 'aplicaciones'),
            where('ofertaId', '==', ofertaId)
        );
        const appsSnap = await getDocs(appsQuery);

        for (const docSnap of appsSnap.docs) {
            await deleteDoc(docSnap.ref);
        }

        if (typeof toastSuccess === 'function') {
            toastSuccess('Oferta eliminada exitosamente');
        }

        cerrarModal();

        // Recargar dashboard
        if (usuarioData && usuarioActual) {
            await cargarDashboardEmpleador(usuarioData, usuarioActual.uid);
        }

    } catch (error) {
        console.error('Error eliminando oferta:', error);
        if (typeof toastError === 'function') {
            toastError('Error al eliminar la oferta');
        }
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
};
