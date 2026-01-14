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
    const navTrabajadores = document.getElementById('nav-trabajadores');
    const navTrabajadoresText = document.getElementById('nav-trabajadores-text');
    const navPerfil = document.getElementById('nav-perfil');

    if (tipo === 'trabajador') {
        // === MENÚ TRABAJADOR ===
        // Ocultar: Publicar Oferta
        if (navPublicar) navPublicar.style.display = 'none';

        // Mostrar: Buscar Chambas
        if (navBuscar) navBuscar.style.display = 'flex';

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
                <span class='detalle'>📍 ${typeof oferta.ubicacion === 'object' ? (oferta.ubicacion.texto_completo || oferta.ubicacion.distrito || 'Sin ubicación') : oferta.ubicacion}</span>
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

window.aplicarFiltros = function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const busqueda = document.getElementById('filtro-busqueda')?.value.toLowerCase().trim() || '';
        const categoria = document.getElementById('filtro-categoria')?.value || '';
        const ubicacion = document.getElementById('filtro-ubicacion')?.value.toLowerCase().trim() || '';

        let ofertasFiltradas = todasLasOfertas.filter(item => {
            const oferta = item.data;
            let cumple = true;

            // Filtro por búsqueda (título o descripción)
            if (busqueda) {
                const titulo = (oferta.titulo || '').toLowerCase();
                const descripcion = (oferta.descripcion || '').toLowerCase();
                cumple = cumple && (titulo.includes(busqueda) || descripcion.includes(busqueda));
            }

            // Filtro por categoría
            if (categoria) {
                cumple = cumple && oferta.categoria === categoria;
            }

            // Filtro por ubicación
            if (ubicacion) {
                let ubicacionOferta = '';
                if (typeof oferta.ubicacion === 'object') {
                    ubicacionOferta = (oferta.ubicacion.texto_completo || oferta.ubicacion.distrito || '').toLowerCase();
                } else {
                    ubicacionOferta = (oferta.ubicacion || '').toLowerCase();
                }
                cumple = cumple && ubicacionOferta.includes(ubicacion);
            }

            return cumple;
        });

        // Renderizar ofertas filtradas
        const ofertasGrid = document.querySelector('.ofertas-grid');
        if (ofertasGrid) {
            if (ofertasFiltradas.length === 0) {
                ofertasGrid.innerHTML = `
                    <div class='empty-state'>
                        <div class='empty-state-icon'>🔍</div>
                        <h3>No se encontraron ofertas</h3>
                        <p>Intenta con otros filtros</p>
                    </div>
                `;
            } else {
                ofertasGrid.innerHTML = '';
                ofertasFiltradas.forEach(item => {
                    ofertasGrid.innerHTML += crearOfertaCard(item.data, item.id);
                });
            }
        }

        // Actualizar contador
        const contador = document.getElementById('resultados-count');
        if (contador) {
            contador.textContent = `Mostrando ${ofertasFiltradas.length} de ${todasLasOfertas.length} ofertas`;
        }

    }, 300);
};

window.limpiarFiltros = function() {
    // Limpiar inputs
    const busqueda = document.getElementById('filtro-busqueda');
    const categoria = document.getElementById('filtro-categoria');
    const ubicacion = document.getElementById('filtro-ubicacion');

    if (busqueda) busqueda.value = '';
    if (categoria) categoria.value = '';
    if (ubicacion) ubicacion.value = '';

    // Mostrar todas las ofertas
    const ofertasGrid = document.querySelector('.ofertas-grid');
    if (ofertasGrid) {
        ofertasGrid.innerHTML = '';
        todasLasOfertas.forEach(item => {
            ofertasGrid.innerHTML += crearOfertaCard(item.data, item.id);
        });
    }

    // Actualizar contador
    const contador = document.getElementById('resultados-count');
    if (contador) {
        contador.textContent = 'Mostrando todas las ofertas';
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

            <div style="text-align: center; margin-top: 1.5rem;">
                <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
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
