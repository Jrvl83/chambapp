// ========================================
// DASHBOARD.JS - Task 9 Parte 2 INTEGRADO
// ChambApp - Compatible con arquitectura original
// ========================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, doc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ✅ Usar window.firebaseConfig (arquitectura original)
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variables globales
let usuarioActual = null;
let todasLasOfertas = [];
let aplicacionesUsuario = [];
let debounceTimer;

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
        } else {
            alert('Error al cargar perfil');
            window.location.href = 'login.html';
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
        alert('Error: ' + error.message);
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
    
    if (tipo === 'trabajador') {
        if (navPublicar) navPublicar.style.display = 'none';
    } else {
        if (navPublicar) navPublicar.style.display = 'flex';
    }
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
            ofertasGrid.innerHTML += crearOfertaCard(oferta, docSnap.id);
        });
        
    } catch (error) {
        console.error('Error cargando ofertas:', error);
    }
}

function crearOfertaCard(oferta, id) {
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
                <span class='detalle'>📍 ${oferta.ubicacion}</span>
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
    console.log('Estadísticas cargadas');
}

function formatearFecha(timestamp) {
    if (!timestamp) return '';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString('es-PE');
}

// ========================================
// FUNCIONES GLOBALES
// ========================================

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

window.aplicarFiltros = function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        console.log('Aplicando filtros');
    }, 300);
};

window.limpiarFiltros = function() {
    console.log('Limpiando filtros');
};

window.verDetalle = function(id) {
    console.log('Ver detalle:', id);
};
