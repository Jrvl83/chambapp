// ============================================
// MIS APLICACIONES - EMPLEADOR (Ver Candidatos)
// ChambApp - Task 21: Aceptar/Rechazar + WhatsApp
// Actualizado: 19 Enero 2026
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Inicializar Firebase
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Verificar que el usuario este logueado
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

// Verificar que sea empleador
if (usuario.tipo !== 'empleador') {
    if (typeof toastError === 'function') {
        toastError('Solo los empleadores pueden ver aplicaciones');
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } else {
        alert('Solo los empleadores pueden ver aplicaciones');
        window.location.href = 'dashboard.html';
    }
}

// Variables globales
let todasLasAplicaciones = [];
let filtroEstadoActual = '';

// Función para escapar comillas en strings para onclick
function escaparParaHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/'/g, "\\'")
        .replace(/"/g, '&quot;');
}

// ============================================
// CARGAR APLICACIONES
// ============================================
async function cargarAplicaciones() {
    try {
        const q = query(
            collection(db, 'aplicaciones'),
            where('empleadorEmail', '==', usuario.email)
        );

        const querySnapshot = await getDocs(q);

        const loading = document.getElementById('loading');
        const container = document.getElementById('aplicaciones-container');
        const emptyState = document.getElementById('empty-state');

        loading.style.display = 'none';

        if (querySnapshot.empty) {
            emptyState.style.display = 'block';
            document.getElementById('total-aplicaciones').textContent = '0';
            document.getElementById('pendientes').textContent = '0';
            document.getElementById('aceptados').textContent = '0';
            return;
        }

        // Procesar todas las aplicaciones
        todasLasAplicaciones = [];
        querySnapshot.forEach((docSnap) => {
            const aplicacion = docSnap.data();
            aplicacion.id = docSnap.id;
            todasLasAplicaciones.push(aplicacion);
        });

        // Mostrar aplicaciones
        mostrarAplicaciones(todasLasAplicaciones);

        // Actualizar estadísticas
        actualizarEstadisticas();

    } catch (error) {
        console.error('Error al cargar aplicaciones:', error);
        document.getElementById('loading').innerHTML = `
            <div class="icon" style="font-size: 3rem;">❌</div>
            <p style="color: #ef4444;">Error al cargar las aplicaciones</p>
        `;
    }
}

// ============================================
// ACTUALIZAR ESTADÍSTICAS
// ============================================
async function actualizarEstadisticas() {
    const total = todasLasAplicaciones.length;
    const pendientes = todasLasAplicaciones.filter(a => !a.estado || a.estado === 'pendiente').length;
    const aceptados = todasLasAplicaciones.filter(a => a.estado === 'aceptado').length;
    const completados = todasLasAplicaciones.filter(a => a.estado === 'completado').length;

    document.getElementById('total-aplicaciones').textContent = total;
    document.getElementById('pendientes').textContent = pendientes;
    document.getElementById('aceptados').textContent = aceptados + completados;

    // Contar ofertas activas
    try {
        const ofertasQuery = query(
            collection(db, 'ofertas'),
            where('empleadorEmail', '==', usuario.email)
        );
        const ofertasSnapshot = await getDocs(ofertasQuery);
        document.getElementById('ofertas-activas').textContent = ofertasSnapshot.size;
    } catch (error) {
        console.error('Error al contar ofertas:', error);
    }
}

// ============================================
// MOSTRAR APLICACIONES
// ============================================
function mostrarAplicaciones(aplicaciones) {
    const container = document.getElementById('aplicaciones-container');
    const emptyState = document.getElementById('empty-state');

    // Filtrar por estado si hay filtro activo
    let aplicacionesFiltradas = aplicaciones;
    if (filtroEstadoActual) {
        aplicacionesFiltradas = aplicaciones.filter(a => {
            const estado = a.estado || 'pendiente';
            return estado === filtroEstadoActual;
        });
    }

    if (aplicacionesFiltradas.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.querySelector('h2').textContent = filtroEstadoActual
            ? `No hay aplicaciones ${filtroEstadoActual}s`
            : 'No hay aplicaciones aún';
        return;
    }

    // Agrupar por oferta
    const aplicacionesPorOferta = {};
    aplicacionesFiltradas.forEach(aplicacion => {
        const ofertaId = aplicacion.ofertaId || 'sin-oferta';
        if (!aplicacionesPorOferta[ofertaId]) {
            aplicacionesPorOferta[ofertaId] = {
                titulo: aplicacion.ofertaTitulo || 'Oferta sin título',
                categoria: aplicacion.ofertaCategoria || '',
                aplicaciones: []
            };
        }
        aplicacionesPorOferta[ofertaId].aplicaciones.push(aplicacion);
    });

    // Mostrar
    container.style.display = 'flex';
    emptyState.style.display = 'none';
    container.innerHTML = '';

    for (const ofertaId in aplicacionesPorOferta) {
        const grupo = aplicacionesPorOferta[ofertaId];
        container.innerHTML += crearGrupoOferta(ofertaId, grupo);
    }
}

// ============================================
// CREAR GRUPO DE OFERTA
// ============================================
function crearGrupoOferta(ofertaId, grupo) {
    const categoriaLabel = getCategoriaLabel(grupo.categoria);
    const cantidadAplicantes = grupo.aplicaciones.length;

    let aplicacionesHTML = '';
    grupo.aplicaciones.forEach(aplicacion => {
        aplicacionesHTML += crearAplicacionCard(aplicacion);
    });

    return `
        <div class="oferta-grupo">
            <div class="oferta-grupo-header">
                <div class="oferta-grupo-info">
                    <h3 class="oferta-grupo-titulo">📋 ${grupo.titulo}</h3>
                    <div class="oferta-grupo-meta">
                        <span class="oferta-categoria-badge">${categoriaLabel}</span>
                        <span class="oferta-aplicantes-count">👥 ${cantidadAplicantes} postulante${cantidadAplicantes !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
            <div class="oferta-grupo-aplicaciones">
                ${aplicacionesHTML}
            </div>
        </div>
    `;
}

// ============================================
// CREAR CARD DE APLICACIÓN
// ============================================
function crearAplicacionCard(aplicacion) {
    const estado = aplicacion.estado || 'pendiente';
    const estadoBadge = crearBadgeEstado(estado);

    const telefono = aplicacion.aplicanteTelefono || null;
    const email = aplicacion.aplicanteEmail || 'No disponible';
    const nombre = aplicacion.aplicanteNombre || 'Trabajador';
    const mensaje = aplicacion.mensaje || 'Sin mensaje';
    const fecha = formatearFecha(aplicacion.fechaAplicacion);
    const tituloOferta = aplicacion.ofertaTitulo || 'Sin título';

    // Escapar para uso en onclick
    const nombreEscapado = escaparParaHTML(nombre);
    const tituloEscapado = escaparParaHTML(tituloOferta);
    const emailEscapado = escaparParaHTML(email);

    // Crear botones según el estado
    let botonesAccion = '';

    if (estado === 'pendiente') {
        // Botones para estado pendiente: Aceptar y Rechazar
        botonesAccion = `
            <button class="btn btn-success btn-sm" onclick="aceptarAplicacion('${aplicacion.id}', '${nombreEscapado}')">
                ✅ Aceptar
            </button>
            <button class="btn btn-danger btn-sm" onclick="rechazarAplicacion('${aplicacion.id}', '${nombreEscapado}')">
                ❌ Rechazar
            </button>
        `;
    } else if (estado === 'aceptado') {
        // Botones para estado aceptado: WhatsApp, Llamar, Marcar Completado
        const mensajeWhatsApp = encodeURIComponent(
            `Hola ${nombre}, te contacto por la chamba "${aplicacion.ofertaTitulo}" en ChambApp. ¡Tu postulación fue aceptada!`
        );
        const telefonoLimpio = telefono ? telefono.replace(/\D/g, '') : '';
        const telefonoWhatsApp = telefonoLimpio.startsWith('51') ? telefonoLimpio : `51${telefonoLimpio}`;

        botonesAccion = `
            <div class="contacto-aceptado">
                <div class="contacto-info">
                    <span class="contacto-label">📱 Contacto:</span>
                    <span class="contacto-telefono">${telefono || 'No disponible'}</span>
                </div>
                <div class="contacto-botones">
                    ${telefono ? `
                        <a href="https://wa.me/${telefonoWhatsApp}?text=${mensajeWhatsApp}"
                           target="_blank"
                           class="btn btn-whatsapp btn-sm">
                            <span class="whatsapp-icon">📱</span> WhatsApp
                        </a>
                        <a href="tel:${telefono}" class="btn btn-primary btn-sm">📞 Llamar</a>
                    ` : ''}
                    <button class="btn btn-completado btn-sm" onclick="marcarCompletado('${aplicacion.id}', '${nombreEscapado}', '${tituloEscapado}')">
                        🏁 Marcar Completado
                    </button>
                </div>
            </div>
        `;
    } else if (estado === 'rechazado') {
        botonesAccion = `
            <div class="estado-final">
                <span class="texto-rechazado">Postulación rechazada</span>
            </div>
        `;
    } else if (estado === 'completado') {
        botonesAccion = `
            <div class="estado-final completado">
                <span class="texto-completado">✅ Trabajo completado</span>
                <button class="btn btn-primary btn-sm" onclick="calificarTrabajador('${aplicacion.id}', '${emailEscapado}', '${nombreEscapado}')">
                    ⭐ Calificar
                </button>
            </div>
        `;
    }

    return `
        <div class="aplicacion-card estado-${estado}">
            <div class="aplicacion-header">
                <div class="aplicacion-trabajador">
                    <div class="aplicacion-avatar">👤</div>
                    <div>
                        <div class="aplicacion-nombre">${nombre}</div>
                        <div class="aplicacion-email">${email}</div>
                    </div>
                </div>
                ${estadoBadge}
            </div>

            <div class="aplicacion-info">
                ${telefono && estado !== 'aceptado' ? `
                <div class="info-item">
                    <span class="info-label">📱 Teléfono</span>
                    <span class="info-value">${telefono}</span>
                </div>
                ` : ''}
                <div class="info-item">
                    <span class="info-label">📅 Fecha postulación</span>
                    <span class="info-value">${fecha}</span>
                </div>
            </div>

            <div class="aplicacion-mensaje">
                <strong>💬 Mensaje del postulante:</strong><br>
                ${mensaje}
            </div>

            <div class="aplicacion-actions">
                ${botonesAccion}
            </div>
        </div>
    `;
}

// ============================================
// CREAR BADGE DE ESTADO
// ============================================
function crearBadgeEstado(estado) {
    const estados = {
        'pendiente': { texto: 'PENDIENTE', clase: 'pendiente' },
        'aceptado': { texto: 'ACEPTADO', clase: 'aceptado' },
        'rechazado': { texto: 'RECHAZADO', clase: 'rechazado' },
        'completado': { texto: 'COMPLETADO', clase: 'completado' }
    };

    const config = estados[estado] || estados['pendiente'];
    return `<span class="badge ${config.clase}">${config.texto}</span>`;
}

// ============================================
// ACEPTAR APLICACIÓN
// ============================================
async function aceptarAplicacion(aplicacionId, nombreTrabajador) {
    const confirmar = confirm(`¿Deseas ACEPTAR la postulación de ${nombreTrabajador}?\n\nPodrás contactarlo por WhatsApp o teléfono.`);

    if (!confirmar) return;

    try {
        const aplicacionRef = doc(db, 'aplicaciones', aplicacionId);
        await updateDoc(aplicacionRef, {
            estado: 'aceptado',
            fechaAceptacion: serverTimestamp()
        });

        if (typeof toastSuccess === 'function') {
            toastSuccess(`¡Postulación de ${nombreTrabajador} aceptada!`);
        } else {
            alert(`¡Postulación de ${nombreTrabajador} aceptada!`);
        }

        // Actualizar la UI
        const aplicacion = todasLasAplicaciones.find(a => a.id === aplicacionId);
        if (aplicacion) {
            aplicacion.estado = 'aceptado';
        }
        mostrarAplicaciones(todasLasAplicaciones);
        actualizarEstadisticas();

    } catch (error) {
        console.error('Error al aceptar aplicación:', error);
        if (typeof toastError === 'function') {
            toastError('Error al aceptar la postulación');
        } else {
            alert('Error al aceptar la postulación');
        }
    }
}

// ============================================
// RECHAZAR APLICACIÓN
// ============================================
async function rechazarAplicacion(aplicacionId, nombreTrabajador) {
    const confirmar = confirm(`¿Estás seguro de RECHAZAR la postulación de ${nombreTrabajador}?\n\nEsta acción no se puede deshacer.`);

    if (!confirmar) return;

    try {
        const aplicacionRef = doc(db, 'aplicaciones', aplicacionId);
        await updateDoc(aplicacionRef, {
            estado: 'rechazado',
            fechaRechazo: serverTimestamp()
        });

        if (typeof toastSuccess === 'function') {
            toastSuccess(`Postulación de ${nombreTrabajador} rechazada`);
        } else {
            alert(`Postulación de ${nombreTrabajador} rechazada`);
        }

        // Actualizar la UI
        const aplicacion = todasLasAplicaciones.find(a => a.id === aplicacionId);
        if (aplicacion) {
            aplicacion.estado = 'rechazado';
        }
        mostrarAplicaciones(todasLasAplicaciones);
        actualizarEstadisticas();

    } catch (error) {
        console.error('Error al rechazar aplicación:', error);
        if (typeof toastError === 'function') {
            toastError('Error al rechazar la postulación');
        } else {
            alert('Error al rechazar la postulación');
        }
    }
}

// ============================================
// MARCAR COMO COMPLETADO
// ============================================
async function marcarCompletado(aplicacionId, nombreTrabajador, tituloOferta) {
    const confirmar = confirm(`¿El trabajo "${tituloOferta}" con ${nombreTrabajador} ha sido COMPLETADO?\n\nDespués podrás calificar al trabajador.`);

    if (!confirmar) return;

    try {
        const aplicacionRef = doc(db, 'aplicaciones', aplicacionId);
        await updateDoc(aplicacionRef, {
            estado: 'completado',
            fechaCompletado: serverTimestamp()
        });

        if (typeof toastSuccess === 'function') {
            toastSuccess(`¡Trabajo completado! Ahora puedes calificar a ${nombreTrabajador}`);
        } else {
            alert(`¡Trabajo completado! Ahora puedes calificar a ${nombreTrabajador}`);
        }

        // Actualizar la UI
        const aplicacion = todasLasAplicaciones.find(a => a.id === aplicacionId);
        if (aplicacion) {
            aplicacion.estado = 'completado';
        }
        mostrarAplicaciones(todasLasAplicaciones);
        actualizarEstadisticas();

    } catch (error) {
        console.error('Error al marcar como completado:', error);
        if (typeof toastError === 'function') {
            toastError('Error al marcar como completado');
        } else {
            alert('Error al marcar como completado');
        }
    }
}

// ============================================
// CALIFICAR TRABAJADOR (placeholder para Task 13-15)
// ============================================
function calificarTrabajador(aplicacionId, trabajadorEmail, nombreTrabajador) {
    // Por ahora solo un mensaje, se implementará en Tasks 13-15
    alert(`Sistema de calificaciones próximamente.\n\nPodrás calificar a ${nombreTrabajador} cuando se implemente el Task 13-15.`);
}

// ============================================
// FILTRAR POR ESTADO
// ============================================
function filtrarPorEstado(estado) {
    filtroEstadoActual = estado;

    // Actualizar botones de filtro
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const botonActivo = document.querySelector(`.filtro-btn[data-estado="${estado}"]`);
    if (botonActivo) {
        botonActivo.classList.add('active');
    }

    mostrarAplicaciones(todasLasAplicaciones);
}

// ============================================
// UTILIDADES
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
    return labels[categoria] || categoria || '📦 Sin categoría';
}

function formatearFecha(timestamp) {
    if (!timestamp) return 'Reciente';

    try {
        const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const ahora = new Date();
        const diff = ahora - fecha;
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (dias === 0) return 'Hoy';
        if (dias === 1) return 'Ayer';
        if (dias < 7) return `Hace ${dias} días`;

        return fecha.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (error) {
        return 'Reciente';
    }
}

// ============================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================
window.aceptarAplicacion = aceptarAplicacion;
window.rechazarAplicacion = rechazarAplicacion;
window.marcarCompletado = marcarCompletado;
window.calificarTrabajador = calificarTrabajador;
window.filtrarPorEstado = filtrarPorEstado;

// ============================================
// INICIALIZACIÓN
// ============================================
cargarAplicaciones();

console.log('✅ Mis Aplicaciones - Empleador (Task 21) cargado correctamente');
