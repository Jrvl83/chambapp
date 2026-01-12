// ============================================
// DASHBOARD.JS - ChambApp
// L贸gica principal del dashboard
// ============================================

import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, query, getDocs, doc, getDoc, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    obtenerCoordenadas, 
    geocodificar, 
    guardarUbicacion,
    obtenerUbicacionGuardada,
    actualizarUbicacionSilenciosa
} from '../utils/geolocation.js';

// ============================================
// VARIABLES GLOBALES
// ============================================
let usuarioActual = null;
let ofertasGlobales = [];
let debounceTimer = null;

// ============================================
// INICIALIZACI脫N
// ============================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        usuarioActual = user;
        await inicializarDashboard(user);
    } else {
        window.location.href = 'login.html';
    }
});

/**
 * Inicializar dashboard completo
 */
async function inicializarDashboard(user) {
    try {
        // Obtener datos del usuario
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        
        if (!userDoc.exists()) {
            console.error('Usuario no encontrado en Firestore');
            return;
        }
        
        const userData = userDoc.data();
        
        // Actualizar UI con datos del usuario
        actualizarHeaderUsuario(userData);
        
        // Personalizar seg煤n tipo de usuario
        personalizarDashboard(userData);
        
        // 馃啎 VERIFICAR Y ACTUALIZAR UBICACI脫N (SOLO TRABAJADORES)
        await verificarUbicacion(user.uid, userData.tipo);
        
        // Cargar contenido
        await cargarEstadisticas(userData);
        await cargarOfertas(userData);
        
        // Mostrar contenido (ocultar loading)
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';
        
    } catch (error) {
        console.error('Error inicializando dashboard:', error);
        mostrarToast('Error al cargar el dashboard', 'error');
    }
}

/**
 * 馃啎 VERIFICAR Y ACTUALIZAR UBICACI脫N AUTOM脕TICAMENTE
 * L贸gica completa de ubicaci贸n:
 * - Primera vez: Modal obligatorio
 * - Siguientes veces: 
 *   1. Usa ubicaci贸n guardada (inmediato)
 *   2. Actualiza en background (silencioso)
 *   3. Muestra badge con bot贸n actualizar
 */
async function verificarUbicacion(uid, tipoUsuario) {
    // Solo para trabajadores
    if (tipoUsuario !== 'trabajador') {
        console.log('馃捈 Empleador detectado - Modal de ubicaci贸n no necesario');
        return;
    }
    
    try {
        // Intentar obtener ubicaci贸n guardada
        const ubicacionGuardada = await obtenerUbicacionGuardada(uid);
        
        if (!ubicacionGuardada) {
            // 鉁?PRIMERA VEZ: Mostrar modal obligatorio
            console.log('馃搷 Primera vez - Mostrando modal ubicaci贸n');
            setTimeout(() => {
                mostrarModalUbicacion();
            }, 2000);
        } else {
            // 鉁?YA TIENE UBICACI脫N GUARDADA
            console.log('馃搷 Ubicaci贸n guardada encontrada:', ubicacionGuardada);
            
            // 1. Mostrar badge con ubicaci贸n actual (inmediato)
            mostrarBadgeUbicacion(ubicacionGuardada);
            
            // 2. Actualizar en background (silencioso)
            actualizarUbicacionEnBackground(uid);
        }
        
    } catch (error) {
        console.error('鉂?Error verificando ubicaci贸n:', error);
    }
}

/**
 * 馃啎 ACTUALIZAR UBICACI脫N EN BACKGROUND
 * Se ejecuta silenciosamente sin molestar al usuario
 */
async function actualizarUbicacionEnBackground(uid) {
    try {
        // Esperar 3 segundos antes de actualizar (no bloquear carga inicial)
        setTimeout(async () => {
            const nuevaUbicacion = await actualizarUbicacionSilenciosa(uid);
            
            if (nuevaUbicacion) {
                // Actualizar badge con nueva ubicaci贸n
                mostrarBadgeUbicacion(nuevaUbicacion);
                
                console.log('鉁?Badge actualizado con nueva ubicaci贸n');
            }
        }, 3000);
        
    } catch (error) {
        console.warn('鈿狅笍 Error actualizando ubicaci贸n en background:', error);
    }
}

/**
 * 馃啎 MOSTRAR BADGE DE UBICACI脫N EN HEADER
 */
function mostrarBadgeUbicacion(ubicacion) {
    const headerContent = document.querySelector('.header-content');
    
    // Verificar si ya existe el badge
    let badge = document.getElementById('ubicacion-badge');
    
    if (!badge) {
        // Crear badge nuevo
        badge = document.createElement('div');
        badge.id = 'ubicacion-badge';
        badge.className = 'ubicacion-badge';
        
        // Insertar despu茅s del logo
        const logo = document.querySelector('.logo');
        logo.after(badge);
    }
    
    // Actualizar contenido del badge
    badge.innerHTML = `
        <span class="ubicacion-texto" title="${ubicacion.direccionCompleta || ubicacion.distrito}">
            馃搷 ${ubicacion.distrito}
        </span>
        <button 
            class="ubicacion-actualizar" 
            onclick="actualizarUbicacionManual()"
            title="Actualizar ubicaci贸n"
            aria-label="Actualizar ubicaci贸n"
        >
            馃攧
        </button>
    `;
}

/**
 * 馃啎 ACTUALIZAR UBICACI脫N MANUALMENTE (BOT脫N)
 * Usuario hace click en el bot贸n 馃攧
 */
window.actualizarUbicacionManual = async function() {
    const btn = document.querySelector('.ubicacion-actualizar');
    const textoOriginal = btn.innerHTML;
    
    try {
        // Loading state
        btn.innerHTML = '鈴?;
        btn.disabled = true;
        
        // Solicitar ubicaci贸n actualizada
        const coords = await obtenerCoordenadas();
        const ubicacion = await geocodificar(coords);
        await guardarUbicacion(usuarioActual.uid, ubicacion);
        
        // Actualizar badge
        mostrarBadgeUbicacion(ubicacion);
        
        // Toast 茅xito
        mostrarToast('馃搷 Ubicaci贸n actualizada correctamente', 'success');
        
        // Recargar ofertas con nueva ubicaci贸n
        const userDoc = await getDoc(doc(db, 'usuarios', usuarioActual.uid));
        if (userDoc.exists()) {
            await cargarOfertas(userDoc.data());
        }
        
    } catch (error) {
        console.error('鉂?Error actualizando ubicaci贸n:', error);
        mostrarToast('鉂?No se pudo actualizar ubicaci贸n', 'error');
        
        // Restaurar bot贸n
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    }
};

/**
 * Mostrar modal de solicitud de ubicaci贸n
 */
function mostrarModalUbicacion() {
    const modal = document.getElementById('modal-ubicacion');
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Cerrar modal de ubicaci贸n
 */
window.cerrarModalUbicacion = function() {
    const modal = document.getElementById('modal-ubicacion');
    if (modal) {
        modal.classList.remove('active');
    }
};

/**
 * Solicitar ubicaci贸n (desde modal)
 */
window.solicitarUbicacion = async function() {
    const btn = event.target;
    const textoOriginal = btn.textContent;
    
    try {
        // Loading state
        btn.textContent = 'Obteniendo ubicaci贸n...';
        btn.disabled = true;
        
        // 1. Obtener coordenadas GPS
        const coords = await obtenerCoordenadas();
        
        // 2. Geocodificar (convertir a direcci贸n)
        const ubicacion = await geocodificar(coords);
        
        // 3. Guardar en Firestore
        await guardarUbicacion(usuarioActual.uid, ubicacion);
        
        // 4. Mostrar badge en header
        mostrarBadgeUbicacion(ubicacion);
        
        // 5. Cerrar modal
        cerrarModalUbicacion();
        
        // 6. Toast 茅xito
        mostrarToast('鉁?Ubicaci贸n guardada correctamente', 'success');
        
        console.log('馃搷 Ubicaci贸n guardada:', ubicacion);
        
    } catch (error) {
        console.error('鉂?Error al solicitar ubicaci贸n:', error);
        
        // Mostrar error en el modal
        const modalBody = document.querySelector('#modal-ubicacion .modal-body');
        const alertaError = document.createElement('div');
        alertaError.className = 'alert alert-danger';
        alertaError.style.marginTop = 'var(--space-md)';
        alertaError.innerHTML = `
            <div class="alert-icon">鈿狅笍</div>
            <div class="alert-content">
                <div class="alert-title">No se pudo obtener ubicaci贸n</div>
                <div class="alert-message">
                    ${error.message}
                    <br><br>
                    <strong>Para activar tu ubicaci贸n:</strong>
                    <ul style="margin-top: var(--space-xs); padding-left: var(--space-lg);">
                        <li>Ve a la configuraci贸n de tu navegador</li>
                        <li>Busca "Permisos" o "Ubicaci贸n"</li>
                        <li>Permite el acceso a la ubicaci贸n para este sitio</li>
                    </ul>
                </div>
            </div>
        `;
        
        modalBody.appendChild(alertaError);
        
        // Restaurar bot贸n
        btn.textContent = textoOriginal;
        btn.disabled = false;
    }
};

/**
 * Actualizar header con informaci贸n del usuario
 */
function actualizarHeaderUsuario(userData) {
    const userName = document.getElementById('user-name');
    const logoText = document.getElementById('logo-text');
    
    if (userName) {
        const badge = userData.tipo === 'trabajador' 
            ? '<span class="badge badge-trabajador">Trabajador</span>'
            : '<span class="badge badge-empleador">Empleador</span>';
            
        userName.innerHTML = `
            馃懁 ${userData.nombre || 'Usuario'}
            ${badge}
        `;
    }
    
    if (logoText) {
        logoText.textContent = 'ChambApp';
    }
}

/**
 * Personalizar dashboard seg煤n tipo de usuario
 */
function personalizarDashboard(userData) {
    const esTrabajador = userData.tipo === 'trabajador';
    
    // Actualizar textos del sidebar
    if (esTrabajador) {
        document.getElementById('nav-buscar-text').textContent = 'Buscar Chambas';
        document.getElementById('nav-publicar').style.display = 'none';
        document.getElementById('nav-trabajadores-text').textContent = 'Mis Aplicaciones';
        document.getElementById('titulo-ofertas').textContent = 'Ofertas Disponibles';
    } else {
        document.getElementById('nav-buscar-text').textContent = 'Buscar Trabajadores';
        document.getElementById('nav-trabajadores-text').textContent = 'Mis Ofertas';
        document.getElementById('titulo-ofertas').textContent = 'Mis Ofertas Publicadas';
    }
    
    // Actualizar link del perfil
    const navPerfil = document.getElementById('nav-perfil');
    if (navPerfil) {
        navPerfil.href = esTrabajador ? 'perfil-trabajador.html' : 'perfil-empleador.html';
    }
}

/**
 * Cargar estad铆sticas del dashboard
 */
async function cargarEstadisticas(userData) {
    try {
        const esTrabajador = userData.tipo === 'trabajador';
        
        if (esTrabajador) {
            // Estad铆sticas para trabajadores
            const aplicacionesRef = collection(db, 'aplicaciones');
            const qAplicaciones = query(
                aplicacionesRef,
                where('trabajadorId', '==', usuarioActual.uid)
            );
            const aplicacionesSnap = await getDocs(qAplicaciones);
            
            document.getElementById('stat-icon-1').textContent = '馃搵';
            document.getElementById('stat-number-1').textContent = aplicacionesSnap.size;
            document.getElementById('stat-label-1').textContent = 'Aplicaciones Enviadas';
            
            document.getElementById('stat-icon-2').textContent = '馃捈';
            document.getElementById('stat-number-2').textContent = '0';
            document.getElementById('stat-label-2').textContent = 'Trabajos Completados';
            
            document.getElementById('stat-icon-3').textContent = '猸?;
            document.getElementById('stat-number-3').textContent = '0';
            document.getElementById('stat-label-3').textContent = 'Calificaci贸n Promedio';
            
        } else {
            // Estad铆sticas para empleadores
            const ofertasRef = collection(db, 'ofertas');
            const qOfertas = query(
                ofertasRef,
                where('empleadorId', '==', usuarioActual.uid)
            );
            const ofertasSnap = await getDocs(qOfertas);
            
            document.getElementById('stat-icon-1').textContent = '馃摙';
            document.getElementById('stat-number-1').textContent = ofertasSnap.size;
            document.getElementById('stat-label-1').textContent = 'Ofertas Publicadas';
            
            document.getElementById('stat-icon-2').textContent = '馃懃';
            document.getElementById('stat-number-2').textContent = '0';
            document.getElementById('stat-label-2').textContent = 'Aplicantes Recibidos';
            
            document.getElementById('stat-icon-3').textContent = '馃';
            document.getElementById('stat-number-3').textContent = '0';
            document.getElementById('stat-label-3').textContent = 'Trabajadores Contratados';
        }
        
    } catch (error) {
        console.error('Error cargando estad铆sticas:', error);
    }
}

/**
 * Cargar ofertas del dashboard
 */
async function cargarOfertas(userData) {
    try {
        const ofertasGrid = document.querySelector('.ofertas-grid');
        const esTrabajador = userData.tipo === 'trabajador';
        
        let q;
        
        if (esTrabajador) {
            // Trabajador: ver TODAS las ofertas disponibles
            const ofertasRef = collection(db, 'ofertas');
            q = query(
                ofertasRef,
                where('estado', '==', 'activa'),
                orderBy('fechaPublicacion', 'desc'),
                limit(20)
            );
        } else {
            // Empleador: ver SOLO SUS ofertas
            const ofertasRef = collection(db, 'ofertas');
            q = query(
                ofertasRef,
                where('empleadorId', '==', usuarioActual.uid),
                orderBy('fechaPublicacion', 'desc')
            );
        }
        
        const snapshot = await getDocs(q);
        
        ofertasGlobales = [];
        
        snapshot.forEach((doc) => {
            ofertasGlobales.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        mostrarOfertas(ofertasGlobales);
        
    } catch (error) {
        console.error('Error cargando ofertas:', error);
        mostrarToast('Error al cargar ofertas', 'error');
    }
}

/**
 * Mostrar ofertas en el grid
 */
function mostrarOfertas(ofertas) {
    const ofertasGrid = document.querySelector('.ofertas-grid');
    
    if (ofertas.length === 0) {
        ofertasGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">馃摥</div>
                <h3>No hay ofertas disponibles</h3>
                <p>Pronto habr谩 nuevas oportunidades</p>
            </div>
        `;
        return;
    }
    
    ofertasGrid.innerHTML = ofertas.map(oferta => `
        <div class="oferta-card">
            <div class="oferta-header">
                <span class="oferta-categoria ${oferta.categoria}">
                    ${oferta.categoria}
                </span>
                <span class="oferta-fecha">
                    ${formatearFecha(oferta.fechaPublicacion)}
                </span>
            </div>
            
            <h3 class="oferta-titulo">${oferta.titulo}</h3>
            <p class="oferta-descripcion">${oferta.descripcion}</p>
            
            <div class="oferta-detalles">
                <span class="detalle">馃挵 ${oferta.salario}</span>
                <span class="detalle">馃搷 ${oferta.ubicacion}</span>
                <span class="detalle">馃搮 ${oferta.tipoTrabajo}</span>
            </div>
            
            <div class="oferta-footer">
                <button class="btn btn-primary" onclick="verDetalleOferta('${oferta.id}')">
                    Ver Detalles
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Ver detalle de oferta (abre modal)
 */
window.verDetalleOferta = async function(ofertaId) {
    const oferta = ofertasGlobales.find(o => o.id === ofertaId);
    if (!oferta) return;
    
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <span class="oferta-categoria ${oferta.categoria}">${oferta.categoria}</span>
            <h2>${oferta.titulo}</h2>
        </div>
        
        <div class="modal-text">
            <h3>Descripci贸n:</h3>
            <p>${oferta.descripcion}</p>
            
            <h3>Detalles:</h3>
            <ul class="modal-list">
                <li>馃挵 Salario: ${oferta.salario}</li>
                <li>馃搷 Ubicaci贸n: ${oferta.ubicacion}</li>
                <li>馃搮 Tipo: ${oferta.tipoTrabajo}</li>
                <li>鈴?Horario: ${oferta.horario || 'Por definir'}</li>
                <li>馃搯 Fecha: ${formatearFecha(oferta.fechaPublicacion)}</li>
            </ul>
            
            ${oferta.requisitos ? `
                <h3>Requisitos:</h3>
                <p>${oferta.requisitos}</p>
            ` : ''}
        </div>
        
        <div class="modal-buttons">
            <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
            <button class="btn btn-primary" onclick="aplicarOferta('${oferta.id}')">
                Aplicar
            </button>
        </div>
    `;
    
    document.getElementById('modal-overlay').classList.add('active');
};

/**
 * Aplicar a oferta
 */
window.aplicarOferta = async function(ofertaId) {
    mostrarToast('Funci贸n en desarrollo', 'info');
    cerrarModal();
};

/**
 * Cerrar modal
 */
window.cerrarModal = function() {
    document.getElementById('modal-overlay').classList.remove('active');
};

/**
 * Click fuera del modal para cerrar
 */
window.clickFueraModal = function(event) {
    if (event.target.id === 'modal-overlay') {
        cerrarModal();
    }
};

/**
 * Aplicar filtros (con debounce)
 */
window.aplicarFiltros = function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        ejecutarFiltros();
    }, 300);
};

/**
 * Ejecutar filtros
 */
function ejecutarFiltros() {
    const busqueda = document.getElementById('filtro-busqueda').value.toLowerCase();
    const categoria = document.getElementById('filtro-categoria').value;
    const ubicacion = document.getElementById('filtro-ubicacion').value.toLowerCase();
    
    const ofertasFiltradas = ofertasGlobales.filter(oferta => {
        const matchBusqueda = !busqueda || 
            oferta.titulo.toLowerCase().includes(busqueda) ||
            oferta.descripcion.toLowerCase().includes(busqueda);
            
        const matchCategoria = !categoria || oferta.categoria === categoria;
        
        const matchUbicacion = !ubicacion || 
            oferta.ubicacion.toLowerCase().includes(ubicacion);
        
        return matchBusqueda && matchCategoria && matchUbicacion;
    });
    
    mostrarOfertas(ofertasFiltradas);
    
    document.getElementById('resultados-count').textContent = 
        `Mostrando ${ofertasFiltradas.length} de ${ofertasGlobales.length} ofertas`;
}

/**
 * Limpiar filtros
 */
window.limpiarFiltros = function() {
    document.getElementById('filtro-busqueda').value = '';
    document.getElementById('filtro-categoria').value = '';
    document.getElementById('filtro-ubicacion').value = '';
    
    mostrarOfertas(ofertasGlobales);
    
    document.getElementById('resultados-count').textContent = 
        'Mostrando todas las ofertas';
};

/**
 * Cerrar sesi贸n
 */
window.cerrarSesion = async function() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error cerrando sesi贸n:', error);
    }
};

/**
 * Toggle men煤 m贸vil
 */
window.toggleMenu = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
};

/**
 * Formatear fecha
 */
function formatearFecha(timestamp) {
    if (!timestamp) return 'Fecha no disponible';
    
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const ahora = new Date();
    const diff = ahora - fecha;
    
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);
    
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    
    return fecha.toLocaleDateString('es-PE');
}

/**
 * Mostrar toast notification
 */
function mostrarToast(mensaje, tipo = 'info') {
    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast(mensaje, tipo);
    } else {
        alert(mensaje);
    }
}
