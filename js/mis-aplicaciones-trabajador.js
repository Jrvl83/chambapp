// ============================================
// MIS APLICACIONES - TRABAJADOR
// ChambApp - JavaScript con Firestore
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, deleteDoc, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Inicializar Firebase
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Verificar autenticacion
const usuarioStr = localStorage.getItem('usuarioChambApp');
if (!usuarioStr) {
    if (typeof toastError === 'function') {
        toastError('Debes iniciar sesion');
        setTimeout(() => window.location.href = 'login.html', 1000);
    } else {
        alert('Debes iniciar sesion');
        window.location.href = 'login.html';
    }
}

const usuario = JSON.parse(usuarioStr || '{}');

// Verificar que sea TRABAJADOR
if (usuario.tipo !== 'trabajador') {
    if (typeof toastError === 'function') {
        toastError('Esta pagina es solo para trabajadores');
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } else {
        alert('Esta pagina es solo para trabajadores');
        window.location.href = 'dashboard.html';
    }
}

// Variables globales
let todasLasAplicaciones = [];
let aplicacionesFiltradas = [];

// ============================================
// CARGAR APLICACIONES
// ============================================
async function cargarAplicaciones() {
    try {
        console.log('🔄 Cargando aplicaciones del trabajador:', usuario.email);
        
        // Query para obtener aplicaciones del trabajador
        const q = query(
            collection(db, 'aplicaciones'),
            where('aplicanteEmail', '==', usuario.email),
            orderBy('fechaAplicacion', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        console.log('📦 Aplicaciones encontradas:', querySnapshot.size);
        
        // Ocultar loading
        document.getElementById('loading-screen').style.display = 'none';
        
        if (querySnapshot.empty) {
            document.getElementById('empty-state').style.display = 'block';
            actualizarEstadisticas([], 0, 0);
            return;
        }
        
        // Procesar aplicaciones
        todasLasAplicaciones = [];
        querySnapshot.forEach((docSnap) => {
            todasLasAplicaciones.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });
        
        // Calcular estadísticas
        const totalAplicaciones = todasLasAplicaciones.length;
        const pendientes = todasLasAplicaciones.filter(a => a.estado === 'pendiente').length;
        const contactados = todasLasAplicaciones.filter(a => a.estado === 'contactado').length;
        
        actualizarEstadisticas(todasLasAplicaciones, pendientes, contactados);
        
        // Mostrar aplicaciones
        aplicacionesFiltradas = [...todasLasAplicaciones];
        mostrarAplicaciones(aplicacionesFiltradas);
        
        console.log('✅ Aplicaciones cargadas correctamente');
        
    } catch (error) {
        console.error('❌ Error al cargar aplicaciones:', error);
        document.getElementById('loading-screen').innerHTML = `
            <div class="empty-icon">❌</div>
            <h2>Error al cargar aplicaciones</h2>
            <p>${error.message}</p>
        `;
    }
}

// ============================================
// ACTUALIZAR ESTADÍSTICAS
// ============================================
function actualizarEstadisticas(aplicaciones, pendientes, contactados) {
    const total = aplicaciones.length;
    
    document.getElementById('total-aplicaciones').textContent = total;
    document.getElementById('pendientes').textContent = pendientes;
    document.getElementById('contactados').textContent = contactados;
    
    // Calcular tasa de respuesta
    const tasaRespuesta = total > 0 ? Math.round((contactados / total) * 100) : 0;
    document.getElementById('tasa-respuesta').textContent = `${tasaRespuesta}%`;
}

// ============================================
// MOSTRAR APLICACIONES
// ============================================
function mostrarAplicaciones(aplicaciones) {
    const container = document.getElementById('aplicaciones-container');
    
    if (aplicaciones.length === 0) {
        container.style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
        actualizarResultadosInfo(0, todasLasAplicaciones.length);
        return;
    }
    
    container.style.display = 'flex';
    document.getElementById('empty-state').style.display = 'none';
    container.innerHTML = '';
    
    aplicaciones.forEach(aplicacion => {
        const card = crearAplicacionCard(aplicacion);
        container.innerHTML += card;
    });
    
    actualizarResultadosInfo(aplicaciones.length, todasLasAplicaciones.length);
}

// ============================================
// CREAR CARD DE APLICACIÓN
// ============================================
function crearAplicacionCard(aplicacion) {
    const fecha = formatearFecha(aplicacion.fechaAplicacion);
    const estado = aplicacion.estado || 'pendiente';
    const estadoTexto = estado === 'contactado' ? 'Contactado' : 
                       estado === 'cancelada' ? 'Cancelada' : 'Pendiente';
    
    return `
        <div class="aplicacion-card ${estado}">
            <div class="aplicacion-header">
                <div class="aplicacion-info">
                    <div class="aplicacion-titulo">${aplicacion.ofertaTitulo}</div>
                    <span class="aplicacion-categoria">${getCategoriaLabel(aplicacion.ofertaCategoria)}</span>
                    <div class="aplicacion-empleador">👤 ${aplicacion.empleadorNombre}</div>
                </div>
                <div class="aplicacion-estado">
                    <span class="estado-badge ${estado}">${estadoTexto}</span>
                    <span class="aplicacion-fecha">📅 ${fecha}</span>
                </div>
            </div>
            
            <div class="aplicacion-detalles">
                <div class="detalle-item">
                    <span class="detalle-label">Empleador</span>
                    <span class="detalle-value">${aplicacion.empleadorNombre}</span>
                </div>
                <div class="detalle-item">
                    <span class="detalle-label">Email</span>
                    <span class="detalle-value">${aplicacion.empleadorEmail}</span>
                </div>
                <div class="detalle-item">
                    <span class="detalle-label">Categoría</span>
                    <span class="detalle-value">${getCategoriaLabel(aplicacion.ofertaCategoria)}</span>
                </div>
                <div class="detalle-item">
                    <span class="detalle-label">Estado</span>
                    <span class="detalle-value">${estadoTexto}</span>
                </div>
            </div>
            
            <div class="aplicacion-mensaje">
                <strong>💬 Tu mensaje:</strong>
                <p>${aplicacion.mensaje}</p>
            </div>
            
            <div class="aplicacion-actions">
                <button class="btn btn-primary btn-small" onclick="verOfertaCompleta('${aplicacion.ofertaId}')">
                    👁️ Ver Oferta Completa
                </button>
                ${estado !== 'cancelada' ? `
                    <button class="btn btn-danger btn-small" onclick="cancelarAplicacion('${aplicacion.id}', '${aplicacion.ofertaTitulo}')">
                        ❌ Cancelar Aplicación
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// ============================================
// FORMATEAR FECHA
// ============================================
function formatearFecha(timestamp) {
    if (!timestamp) return 'Reciente';
    
    try {
        const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        
        const opciones = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        
        return fecha.toLocaleDateString('es-PE', opciones);
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return 'Reciente';
    }
}

// ============================================
// GET CATEGORIA LABEL
// ============================================
function getCategoriaLabel(categoria) {
    const labels = {
        'construccion': '🏗️ Construcción',
        'electricidad': '⚡ Electricidad',
        'gasfiteria': '🔧 Gasfitería',
        'pintura': '🎨 Pintura',
        'carpinteria': '🪵 Carpintería',
        'limpieza': '🧹 Limpieza',
        'jardineria': '🌿 Jardinería',
        'mecanica': '🔩 Mecánica',
        'otros': '📦 Otros'
    };
    
    return labels[categoria] || categoria;
}

// ============================================
// VER OFERTA COMPLETA
// ============================================
async function verOfertaCompleta(ofertaId) {
    try {
        const docRef = doc(db, 'ofertas', ofertaId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            if (typeof toastError === 'function') {
                toastError('No se encontró la oferta');
            } else {
                alert('No se encontró la oferta');
            }
            return;
        }
        
        const oferta = docSnap.data();
        
        const modalBody = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h2 style="color: var(--primary); margin-bottom: 0.5rem;">${oferta.titulo}</h2>
                <span style="background: var(--light); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600;">
                    ${getCategoriaLabel(oferta.categoria)}
                </span>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: var(--dark); margin-bottom: 0.75rem;">📝 Descripción</h3>
                <p style="color: var(--gray); line-height: 1.6;">${oferta.descripcion}</p>
            </div>
            
            <div style="background: var(--light); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                <h3 style="color: var(--dark); margin-bottom: 1rem;">📍 Detalles</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <strong>📍 Ubicación:</strong><br>
                        ${oferta.ubicacion}
                    </div>
                    <div>
                        <strong>💰 Salario:</strong><br>
                        ${oferta.salario}
                    </div>
                    <div>
                        <strong>⏱️ Duración:</strong><br>
                        ${oferta.duracion || 'No especificada'}
                    </div>
                    <div>
                        <strong>🕐 Horario:</strong><br>
                        ${oferta.horario || 'No especificado'}
                    </div>
                </div>
            </div>
            
            <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; border-left: 3px solid var(--primary);">
                <strong style="color: var(--primary);">👤 Publicado por:</strong><br>
                <span style="color: var(--dark);">${oferta.empleadorNombre}</span><br>
                <span style="color: var(--gray); font-size: 0.875rem;">📧 ${oferta.empleadorEmail}</span>
            </div>
            
            <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">
                <button class="btn btn-secondary" onclick="cerrarModal()" style="flex: 1;">Cerrar</button>
            </div>
        `;
        
        document.getElementById('modal-body').innerHTML = modalBody;
        document.getElementById('modal-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error al cargar oferta:', error);
        if (typeof toastError === 'function') {
            toastError('Error al cargar la oferta');
        }
    }
}

// ============================================
// CANCELAR APLICACIÓN
// ============================================
async function cancelarAplicacion(aplicacionId, tituloOferta) {
    const confirmar = confirm(`¿Estás seguro que deseas cancelar tu aplicación a:\n\n"${tituloOferta}"?\n\nEsta acción no se puede deshacer.`);
    
    if (!confirmar) return;
    
    try {
        await deleteDoc(doc(db, 'aplicaciones', aplicacionId));
        
        if (typeof toastSuccess === 'function') {
            toastSuccess('Aplicación cancelada exitosamente');
        } else {
            alert('Aplicación cancelada exitosamente');
        }
        
        // Recargar aplicaciones
        setTimeout(() => {
            location.reload();
        }, 1500);
        
    } catch (error) {
        console.error('Error al cancelar aplicación:', error);
        if (typeof toastError === 'function') {
            toastError('Error al cancelar la aplicación');
        } else {
            alert('Error al cancelar la aplicación');
        }
    }
}

// ============================================
// FILTROS
// ============================================
function aplicarFiltros() {
    const filtroEstado = document.getElementById('filtro-estado').value;
    const filtroCategoria = document.getElementById('filtro-categoria').value;
    
    aplicacionesFiltradas = todasLasAplicaciones.filter(aplicacion => {
        const coincideEstado = !filtroEstado || aplicacion.estado === filtroEstado;
        const coincideCategoria = !filtroCategoria || aplicacion.ofertaCategoria === filtroCategoria;
        
        return coincideEstado && coincideCategoria;
    });
    
    mostrarAplicaciones(aplicacionesFiltradas);
}

function limpiarFiltros() {
    document.getElementById('filtro-estado').value = '';
    document.getElementById('filtro-categoria').value = '';
    
    aplicacionesFiltradas = [...todasLasAplicaciones];
    mostrarAplicaciones(aplicacionesFiltradas);
}

function actualizarResultadosInfo(cantidad, total) {
    const resultadosInfo = document.getElementById('resultados-info');
    
    if (cantidad === 0) {
        resultadosInfo.textContent = 'No se encontraron aplicaciones con esos filtros';
        resultadosInfo.style.background = '#fee2e2';
        resultadosInfo.style.color = '#991b1b';
    } else if (cantidad === total) {
        resultadosInfo.textContent = `Mostrando todas las aplicaciones (${cantidad})`;
        resultadosInfo.style.background = '#f1f5f9';
        resultadosInfo.style.color = '#64748b';
    } else {
        resultadosInfo.textContent = `Mostrando ${cantidad} de ${total} aplicaciones`;
        resultadosInfo.style.background = '#dbeafe';
        resultadosInfo.style.color = '#1e40af';
    }
}

// ============================================
// MODAL
// ============================================
function cerrarModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function clickFueraModal(event) {
    if (event.target.id === 'modal-overlay') {
        cerrarModal();
    }
}

// ============================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================
window.verOfertaCompleta = verOfertaCompleta;
window.cancelarAplicacion = cancelarAplicacion;
window.aplicarFiltros = aplicarFiltros;
window.limpiarFiltros = limpiarFiltros;
window.cerrarModal = cerrarModal;
window.clickFueraModal = clickFueraModal;

// ============================================
// INICIALIZACIÓN
// ============================================
cargarAplicaciones();

console.log('✅ Mis Aplicaciones - Trabajador cargado correctamente');
