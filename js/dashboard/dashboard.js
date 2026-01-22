// ========================================
// DASHBOARD.JS - Task 9 Parte 2 INTEGRADO
// ChambApp - Compatible con arquitectura original
// ========================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { calcularDistancia, formatearDistancia } from '../utils/distance.js';

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
        
        // 🔍 Logging detallado para debugging
        console.log('Geocoding API status:', data.status);
        if (data.error_message) {
            console.error('Geocoding API error:', data.error_message);
        }
        
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
            console.error('Geocoding fallo con status:', data.status);
            
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
    } catch (error) {
        console.error('Error en geocodificacion:', error);
        
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
        console.log('Ubicacion guardada en Firestore');
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
    } catch (error) {
        console.error('Error obteniendo ubicacion guardada:', error);
        return null;
    }
}

async function actualizarUbicacionSilenciosa(uid) {
    try {
        const coords = await obtenerCoordenadas();
        const ubicacion = await geocodificar(coords);
        await guardarUbicacion(uid, ubicacion);
        return ubicacion;
    } catch (error) {
        console.warn('No se pudo actualizar ubicacion en background:', error);
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
            
            // Actualizar header
            actualizarHeaderUsuario(usuario);
            
            // Personalizar dashboard
            personalizarPorTipo(usuario.tipo || 'trabajador');
            
            // ✅ Verificar ubicación (Task 9)
            await verificarUbicacion(user.uid, usuario.tipo);
            
            // Cargar datos
            await cargarAplicacionesUsuario(user.uid);
            await cargarOfertas(usuario, user.uid);
            await cargarEstadisticas(usuario, user.uid);

            // Ocultar loading
            ocultarLoading();

            // Task 24: Inicializar filtros avanzados
            inicializarFiltrosAvanzados();

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
        console.log('Empleador - no requiere ubicacion');
        return;
    }
    
    try {
        const ubicacionGuardada = await obtenerUbicacionGuardada(uid);
        
        if (!ubicacionGuardada) {
            // Primera vez - mostrar modal
            console.log('Primera vez - mostrando modal ubicacion');
            setTimeout(() => {
                mostrarModalUbicacion();
            }, 2000);
        } else {
            // Ya tiene ubicación guardada
            console.log('Ubicacion guardada:', ubicacionGuardada);
            mostrarBadgeUbicacion(ubicacionGuardada);
            
            // Actualizar en background después de 3 segundos
            actualizarUbicacionEnBackground(uid);
        }
        
    } catch (error) {
        console.error('Error verificando ubicacion:', error);
    }
}

async function actualizarUbicacionEnBackground(uid) {
    try {
        // ⏰ Actualizar cada 30 minutos (no 3 segundos) para evitar rate limiting
        setTimeout(async () => {
            const nuevaUbicacion = await actualizarUbicacionSilenciosa(uid);
            
            if (nuevaUbicacion) {
                mostrarBadgeUbicacion(nuevaUbicacion);
                console.log('Badge actualizado automáticamente');
            }
        }, 30 * 60 * 1000); // 30 minutos
        
    } catch (error) {
        console.warn('Error actualizando ubicacion en background:', error);
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
        console.log('📍 Ubicacion usuario guardada para distancias:', ubicacionUsuario);

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
        userName.innerHTML = `👤 ${usuario.nombre || 'Usuario'}`;
    }
}

function personalizarPorTipo(tipo) {
    const navPublicar = document.getElementById('nav-publicar');
    const navBuscar = document.getElementById('nav-buscar');
    const navMapa = document.getElementById('nav-mapa');
    const btnVerMapa = document.getElementById('btn-ver-mapa');
    const navTrabajadores = document.getElementById('nav-trabajadores');
    const navTrabajadoresText = document.getElementById('nav-trabajadores-text');
    const navPerfil = document.getElementById('nav-perfil');

    if (tipo === 'trabajador') {
        // === MENÚ TRABAJADOR ===
        // Ocultar: Publicar Oferta
        if (navPublicar) navPublicar.style.display = 'none';

        // Mostrar: Buscar Chambas
        if (navBuscar) navBuscar.style.display = 'flex';

        // Mostrar: Mapa de Ofertas (solo trabajadores)
        if (navMapa) navMapa.style.display = 'flex';
        if (btnVerMapa) btnVerMapa.style.display = 'inline-flex';

        // Cambiar: "Trabajadores" → "Mis Aplicaciones"
        if (navTrabajadores) {
            navTrabajadores.href = 'mis-aplicaciones-trabajador.html';
            navTrabajadores.querySelector('.icon').textContent = '📋';
        }
        if (navTrabajadoresText) navTrabajadoresText.textContent = 'Mis Aplicaciones';

        // Perfil trabajador
        if (navPerfil) navPerfil.href = 'perfil-trabajador.html';

    } else {
        // === MENÚ EMPLEADOR ===
        // Mostrar: Publicar Oferta
        if (navPublicar) navPublicar.style.display = 'flex';

        // Ocultar: Buscar Chambas
        if (navBuscar) navBuscar.style.display = 'none';

        // Ocultar: Mapa de Ofertas (solo para trabajadores)
        if (navMapa) navMapa.style.display = 'none';
        if (btnVerMapa) btnVerMapa.style.display = 'none';

        // Cambiar: "Trabajadores" → "Ver Candidatos"
        if (navTrabajadores) {
            navTrabajadores.href = 'mis-aplicaciones.html';
            navTrabajadores.querySelector('.icon').textContent = '👥';
        }
        if (navTrabajadoresText) navTrabajadoresText.textContent = 'Ver Candidatos';

        // Perfil empleador
        if (navPerfil) navPerfil.href = 'perfil-empleador.html';
    }

    console.log('✅ Menú personalizado para:', tipo);
}

function ocultarLoading() {
    const loading = document.getElementById('loading-screen');
    const content = document.getElementById('dashboard-content');
    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';
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

async function cargarOfertas(usuario, userUid) {
    try {
        let q;
        
        if (usuario && usuario.tipo === 'empleador') {
            q = query(
                collection(db, 'ofertas'), 
                where('empleadorEmail', '==', usuario.email),
                orderBy('fechaCreacion', 'desc')
            );
        } else {
            q = query(
                collection(db, 'ofertas'),
                orderBy('fechaCreacion', 'desc'),
                limit(20)
            );
        }
        
        const snapshot = await getDocs(q);
        const ofertasGrid = document.querySelector('.ofertas-grid');
        
        if (snapshot.empty || !ofertasGrid) {
            mostrarEmptyState();
            return;
        }
        
        ofertasGrid.innerHTML = '';
        todasLasOfertas = [];
        
        snapshot.forEach((docSnap) => {
            const oferta = docSnap.data();
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

            ofertasGrid.innerHTML += crearOfertaCard(oferta, docSnap.id, distanciaKm);
        });
        
    } catch (error) {
        console.error('Error cargando ofertas:', error);
    }
}

function crearOfertaCard(oferta, id, distanciaKm = null) {
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

    return `
        <div class='oferta-card'>
            <div class='oferta-header'>
                <span class='oferta-categoria ${oferta.categoria}'>${oferta.categoria}</span>
                <span class='oferta-fecha'>${formatearFecha(oferta.fechaCreacion)}</span>
            </div>
            <h3 class='oferta-titulo'>${oferta.titulo}</h3>
            <p class='oferta-descripcion'>${oferta.descripcion?.substring(0, 120)}...</p>
            <div class='oferta-detalles'>
                <span class='detalle'>💰 ${oferta.salario}</span>
                <span class='detalle'>📍 ${ubicacionTexto}</span>
                ${distanciaBadge}
            </div>
            <div class='oferta-footer'>
                <button class='btn btn-primary btn-small' onclick='verDetalle("${id}")'>Ver Detalles</button>
            </div>
        </div>
    `;
}

function mostrarEmptyState() {
    const grid = document.querySelector('.ofertas-grid');
    if (grid) {
        grid.innerHTML = `
            <div class='empty-state'>
                <div class='empty-state-icon'>📭</div>
                <h3>No hay ofertas disponibles</h3>
            </div>
        `;
    }
}

async function cargarEstadisticas(usuario, userUid) {
    try {
        if (usuario.tipo === 'trabajador') {
            // ESTADÍSTICAS TRABAJADOR

            // 1. Ofertas disponibles (todas las activas)
            const ofertasQuery = query(
                collection(db, 'ofertas'),
                where('estado', '==', 'activa')
            );
            const ofertasSnap = await getDocs(ofertasQuery);

            document.getElementById('stat-icon-1').textContent = '📋';
            document.getElementById('stat-number-1').textContent = ofertasSnap.size;
            document.getElementById('stat-label-1').textContent = 'Ofertas Disponibles';

            // 2. Mis aplicaciones
            const aplicacionesQuery = query(
                collection(db, 'aplicaciones'),
                where('aplicanteId', '==', userUid)
            );
            const aplicacionesSnap = await getDocs(aplicacionesQuery);

            document.getElementById('stat-icon-2').textContent = '💼';
            document.getElementById('stat-number-2').textContent = aplicacionesSnap.size;
            document.getElementById('stat-label-2').textContent = 'Mis Aplicaciones';

            // 3. Trabajos completados
            const completadosQuery = query(
                collection(db, 'aplicaciones'),
                where('aplicanteId', '==', userUid),
                where('estado', '==', 'completado')
            );
            const completadosSnap = await getDocs(completadosQuery);

            document.getElementById('stat-icon-3').textContent = '🤝';
            document.getElementById('stat-number-3').textContent = completadosSnap.size;
            document.getElementById('stat-label-3').textContent = 'Trabajos Completados';

        } else {
            // ESTADÍSTICAS EMPLEADOR

            // 1. Mis ofertas activas
            const misOfertasQuery = query(
                collection(db, 'ofertas'),
                where('empleadorId', '==', userUid),
                where('estado', '==', 'activa')
            );
            const misOfertasSnap = await getDocs(misOfertasQuery);

            document.getElementById('stat-icon-1').textContent = '📋';
            document.getElementById('stat-number-1').textContent = misOfertasSnap.size;
            document.getElementById('stat-label-1').textContent = 'Mis Ofertas Activas';

            // 2. Total aplicaciones recibidas
            const aplicacionesQuery = query(
                collection(db, 'aplicaciones'),
                where('empleadorId', '==', userUid)
            );
            const aplicacionesSnap = await getDocs(aplicacionesQuery);

            document.getElementById('stat-icon-2').textContent = '👥';
            document.getElementById('stat-number-2').textContent = aplicacionesSnap.size;
            document.getElementById('stat-label-2').textContent = 'Aplicaciones Recibidas';

            // 3. Contrataciones realizadas
            const contratacionesQuery = query(
                collection(db, 'aplicaciones'),
                where('empleadorId', '==', userUid),
                where('estado', '==', 'completado')
            );
            const contratacionesSnap = await getDocs(contratacionesQuery);

            document.getElementById('stat-icon-3').textContent = '🤝';
            document.getElementById('stat-number-3').textContent = contratacionesSnap.size;
            document.getElementById('stat-label-3').textContent = 'Contrataciones';
        }

        console.log('✅ Estadísticas cargadas');

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        // Mostrar valores por defecto en caso de error
        document.getElementById('stat-number-1').textContent = '-';
        document.getElementById('stat-number-2').textContent = '-';
        document.getElementById('stat-number-3').textContent = '-';
    }
}

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

    console.log('verificarParametroOferta - ofertaId desde sessionStorage:', ofertaId);

    if (ofertaId) {
        // Limpiar inmediatamente para que no se abra de nuevo
        sessionStorage.removeItem('abrirOferta');

        console.log('Abriendo oferta:', ofertaId);
        // Pequeño delay para asegurar que el DOM esté listo
        setTimeout(() => {
            if (typeof window.verDetalle === 'function') {
                window.verDetalle(ofertaId);
            } else {
                console.error('Funcion verDetalle no disponible');
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

    console.log('✅ Filtros avanzados inicializados');
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
            <div class='empty-state'>
                <div class='empty-state-icon'>🔍</div>
                <h3>No se encontraron ofertas</h3>
                <p>Intenta con otros filtros o amplía tu búsqueda</p>
            </div>
        `;
        return;
    }

    ofertasGrid.innerHTML = ofertas.map(item =>
        crearOfertaCard(item.data, item.id, item.distanciaKm)
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
    console.log('Ver detalle:', id);
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
                    <button class="btn btn-primary" onclick="mostrarFormularioPostulacion('${id}')" style="flex: 1;">
                        📝 Postular a esta chamba
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
                    placeholder="Preséntate brevemente y explica por qué eres el candidato ideal para esta chamba..."
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
