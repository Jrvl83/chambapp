// ============================================
// DASHBOARD.JS - ChambApp
// Logica principal del dashboard
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
// INICIALIZACION
// ============================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        usuarioActual = user;
        await inicializarDashboard(user);
    } else {
        window.location.href = 'login.html';
    }
});

async function inicializarDashboard(user) {
    try {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        
        if (!userDoc.exists()) {
            console.error('Usuario no encontrado en Firestore');
            return;
        }
        
        const userData = userDoc.data();
        
        actualizarHeaderUsuario(userData);
        personalizarDashboard(userData);
        
        await verificarUbicacion(user.uid, userData.tipo);
        
        await cargarEstadisticas(userData);
        await cargarOfertas(userData);
        
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';
        
    } catch (error) {
        console.error('Error inicializando dashboard:', error);
        mostrarToast('Error al cargar el dashboard', 'error');
    }
}

async function verificarUbicacion(uid, tipoUsuario) {
    if (tipoUsuario !== 'trabajador') {
        console.log('Empleador detectado - Modal de ubicacion no necesario');
        return;
    }
    
    try {
        const ubicacionGuardada = await obtenerUbicacionGuardada(uid);
        
        if (!ubicacionGuardada) {
            console.log('Primera vez - Mostrando modal ubicacion');
            setTimeout(() => {
                mostrarModalUbicacion();
            }, 2000);
        } else {
            console.log('Ubicacion guardada encontrada:', ubicacionGuardada);
            mostrarBadgeUbicacion(ubicacionGuardada);
            actualizarUbicacionEnBackground(uid);
        }
        
    } catch (error) {
        console.error('Error verificando ubicacion:', error);
    }
}

async function actualizarUbicacionEnBackground(uid) {
    try {
        setTimeout(async () => {
            const nuevaUbicacion = await actualizarUbicacionSilenciosa(uid);
            
            if (nuevaUbicacion) {
                mostrarBadgeUbicacion(nuevaUbicacion);
                console.log('Badge actualizado con nueva ubicacion');
            }
        }, 3000);
        
    } catch (error) {
        console.warn('Error actualizando ubicacion en background:', error);
    }
}

function mostrarBadgeUbicacion(ubicacion) {
    const headerContent = document.querySelector('.header-content');
    let badge = document.getElementById('ubicacion-badge');
    
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'ubicacion-badge';
        badge.className = 'ubicacion-badge';
        
        const logo = document.querySelector('.logo');
        logo.after(badge);
    }
    
    badge.innerHTML = `
        <span class="ubicacion-texto" title="${ubicacion.direccionCompleta || ubicacion.distrito}">
            📍 ${ubicacion.distrito}
        </span>
        <button 
            class="ubicacion-actualizar" 
            onclick="actualizarUbicacionManual()"
            title="Actualizar ubicacion"
            aria-label="Actualizar ubicacion"
        >
            🔄
        </button>
    `;
}

window.actualizarUbicacionManual = async function() {
    const btn = document.querySelector('.ubicacion-actualizar');
    const textoOriginal = btn.innerHTML;
    
    try {
        btn.innerHTML = '⏳';
        btn.disabled = true;
        
        const coords = await obtenerCoordenadas();
        const ubicacion = await geocodificar(coords);
        await guardarUbicacion(usuarioActual.uid, ubicacion);
        
        mostrarBadgeUbicacion(ubicacion);
        mostrarToast('Ubicacion actualizada correctamente', 'success');
        
        const userDoc = await getDoc(doc(db, 'usuarios', usuarioActual.uid));
        if (userDoc.exists()) {
            await cargarOfertas(userDoc.data());
        }
        
    } catch (error) {
        console.error('Error actualizando ubicacion:', error);
        mostrarToast('No se pudo actualizar ubicacion', 'error');
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    }
};

function mostrarModalUbicacion() {
    const modal = document.getElementById('modal-ubicacion');
    if (modal) {
        modal.classList.add('active');
    }
}

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
        cerrarModalUbicacion();
        mostrarToast('Ubicacion guardada correctamente', 'success');
        
        console.log('Ubicacion guardada:', ubicacion);
        
    } catch (error) {
        console.error('Error al solicitar ubicacion:', error);
        
        const modalBody = document.querySelector('#modal-ubicacion .modal-body');
        const alertaError = document.createElement('div');
        alertaError.className = 'alert alert-danger';
        alertaError.style.marginTop = 'var(--space-md)';
        alertaError.innerHTML = `
            <div class="alert-icon">⚠️</div>
            <div class="alert-content">
                <div class="alert-title">No se pudo obtener ubicacion</div>
                <div class="alert-message">
                    ${error.message}
                    <br><br>
                    <strong>Para activar tu ubicacion:</strong>
                    <ul style="margin-top: var(--space-xs); padding-left: var(--space-lg);">
                        <li>Ve a la configuracion de tu navegador</li>
                        <li>Busca "Permisos" o "Ubicacion"</li>
                        <li>Permite el acceso a la ubicacion para este sitio</li>
                    </ul>
                </div>
            </div>
        `;
        
        modalBody.appendChild(alertaError);
        btn.textContent = textoOriginal;
        btn.disabled = false;
    }
};

function actualizarHeaderUsuario(userData) {
    const userName = document.getElementById('user-name');
    const logoText = document.getElementById('logo-text');
    
    if (userName) {
        const badge = userData.tipo === 'trabajador' 
            ? '<span class="badge badge-trabajador">Trabajador</span>'
            : '<span class="badge badge-empleador">Empleador</span>';
            
        userName.innerHTML = `
            👤 ${userData.nombre || 'Usuario'}
            ${badge}
        `;
    }
    
    if (logoText) {
        logoText.textContent = 'ChambApp';
    }
}

function personalizarDashboard(userData) {
    const esTrabajador = userData.tipo === 'trabajador';
    
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
    
    const navPerfil = document.getElementById('nav-perfil');
    if (navPerfil) {
        navPerfil.href = esTrabajador ? 'perfil-trabajador.html' : 'perfil-empleador.html';
    }
}

async function cargarEstadisticas(userData) {
    try {
        const esTrabajador = userData.tipo === 'trabajador';
        
        if (esTrabajador) {
            const aplicacionesRef = collection(db, 'aplicaciones');
            const qAplicaciones = query(
                aplicacionesRef,
                where('trabajadorId', '==', usuarioActual.uid)
            );
            const aplicacionesSnap = await getDocs(qAplicaciones);
            
            document.getElementById('stat-icon-1').textContent = '📋';
            document.getElementById('stat-number-1').textContent = aplicacionesSnap.size;
            document.getElementById('stat-label-1').textContent = 'Aplicaciones Enviadas';
            
            document.getElementById('stat-icon-2').textContent = '💼';
            document.getElementById('stat-number-2').textContent = '0';
            document.getElementById('stat-label-2').textContent = 'Trabajos Completados';
            
            document.getElementById('stat-icon-3').textContent = '⭐';
            document.getElementById('stat-number-3').textContent = '0';
            document.getElementById('stat-label-3').textContent = 'Calificacion Promedio';
            
        } else {
            const ofertasRef = collection(db, 'ofertas');
            const qOfertas = query(
                ofertasRef,
                where('empleadorId', '==', usuarioActual.uid)
            );
            const ofertasSnap = await getDocs(qOfertas);
            
            document.getElementById('stat-icon-1').textContent = '📢';
            document.getElementById('stat-number-1').textContent = ofertasSnap.size;
            document.getElementById('stat-label-1').textContent = 'Ofertas Publicadas';
            
            document.getElementById('stat-icon-2').textContent = '👥';
            document.getElementById('stat-number-2').textContent = '0';
            document.getElementById('stat-label-2').textContent = 'Aplicantes Recibidos';
            
            document.getElementById('stat-icon-3').textContent = '🤝';
            document.getElementById('stat-number-3').textContent = '0';
            document.getElementById('stat-label-3').textContent = 'Trabajadores Contratados';
        }
        
    } catch (error) {
        console.error('Error cargando estadisticas:', error);
    }
}

async function cargarOfertas(userData) {
    try {
        const ofertasGrid = document.querySelector('.ofertas-grid');
        const esTrabajador = userData.tipo === 'trabajador';
        
        let q;
        
        if (esTrabajador) {
            const ofertasRef = collection(db, 'ofertas');
            q = query(
                ofertasRef,
                where('estado', '==', 'activa'),
                orderBy('fechaPublicacion', 'desc'),
                limit(20)
            );
        } else {
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

function mostrarOfertas(ofertas) {
    const ofertasGrid = document.querySelector('.ofertas-grid');
    
    if (ofertas.length === 0) {
        ofertasGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>No hay ofertas disponibles</h3>
                <p>Pronto habra nuevas oportunidades</p>
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
                <span class="detalle">💰 ${oferta.salario}</span>
                <span class="detalle">📍 ${oferta.ubicacion}</span>
                <span class="detalle">📅 ${oferta.tipoTrabajo}</span>
            </div>
            
            <div class="oferta-footer">
                <button class="btn btn-primary" onclick="verDetalleOferta('${oferta.id}')">
                    Ver Detalles
                </button>
            </div>
        </div>
    `).join('');
}

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
            <h3>Descripcion:</h3>
            <p>${oferta.descripcion}</p>
            
            <h3>Detalles:</h3>
            <ul class="modal-list">
                <li>💰 Salario: ${oferta.salario}</li>
                <li>📍 Ubicacion: ${oferta.ubicacion}</li>
                <li>📅 Tipo: ${oferta.tipoTrabajo}</li>
                <li>⏰ Horario: ${oferta.horario || 'Por definir'}</li>
                <li>📆 Fecha: ${formatearFecha(oferta.fechaPublicacion)}</li>
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

window.aplicarOferta = async function(ofertaId) {
    mostrarToast('Funcion en desarrollo', 'info');
    cerrarModal();
};

window.cerrarModal = function() {
    document.getElementById('modal-overlay').classList.remove('active');
};

window.clickFueraModal = function(event) {
    if (event.target.id === 'modal-overlay') {
        cerrarModal();
    }
};

window.aplicarFiltros = function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        ejecutarFiltros();
    }, 300);
};

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

window.limpiarFiltros = function() {
    document.getElementById('filtro-busqueda').value = '';
    document.getElementById('filtro-categoria').value = '';
    document.getElementById('filtro-ubicacion').value = '';
    
    mostrarOfertas(ofertasGlobales);
    
    document.getElementById('resultados-count').textContent = 
        'Mostrando todas las ofertas';
};

window.cerrarSesion = async function() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error cerrando sesion:', error);
    }
};

window.toggleMenu = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
};

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

function mostrarToast(mensaje, tipo = 'info') {
    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast(mensaje, tipo);
    } else {
        alert(mensaje);
    }
}
