// ============================================
// MIS APLICACIONES - TRABAJADOR
// ChambApp - Task 21: Ver estado de postulaciones
// Actualizado: 04 Febrero 2026
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, deleteDoc, orderBy, addDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { formatearFecha } from './utils/formatting.js';
import { escapeHtml } from './utils/dom-helpers.js';
import { RatingInput, inicializarContadorComentario, configurarCierreModal, TEXTOS_ESTRELLAS } from './components/rating-input.js';

// SVG icon constants (14×14 content size)
const ICON_PIN = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
const ICON_MONEY = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
const ICON_CLOCK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
const ICON_USER_SM = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
const ICON_STAR = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
const ICON_CALENDAR = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
const ICON_EMAIL = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>';

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
            where('aplicanteEmail', '==', usuario.email),
            orderBy('fechaAplicacion', 'desc')
        );

        const querySnapshot = await getDocs(q);

        document.getElementById('loading-screen').style.display = 'none';

        if (querySnapshot.empty) {
            document.getElementById('empty-state').style.display = 'block';
            actualizarEstadisticas([], 0, 0, 0, 0);
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
        const pendientes = todasLasAplicaciones.filter(a => !a.estado || a.estado === 'pendiente').length;
        const aceptados = todasLasAplicaciones.filter(a => a.estado === 'aceptado').length;
        const completados = todasLasAplicaciones.filter(a => a.estado === 'completado').length;
        const rechazados = todasLasAplicaciones.filter(a => a.estado === 'rechazado').length;

        actualizarEstadisticas(todasLasAplicaciones, pendientes, aceptados, completados, rechazados);

        // Mostrar aplicaciones
        aplicacionesFiltradas = [...todasLasAplicaciones];
        mostrarAplicaciones(aplicacionesFiltradas);

    } catch (error) {
        console.error('❌ Error al cargar aplicaciones:', error);
        document.getElementById('loading-screen').innerHTML = `
            <div class="empty-icon">❌</div>
            <h2>Error al cargar</h2>
            <p>Ocurrió un error al cargar tus postulaciones. Intenta nuevamente.</p>
        `;
    }
}

// ============================================
// ACTUALIZAR ESTADÍSTICAS
// ============================================
function actualizarEstadisticas(aplicaciones, pendientes, aceptados, completados, rechazados) {
    const total = aplicaciones.length;

    document.getElementById('total-aplicaciones').textContent = total;
    document.getElementById('pendientes').textContent = pendientes;
    document.getElementById('aceptados').textContent = aceptados;
    document.getElementById('completados').textContent = completados;
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

    // Configuración por estado
    const estadoConfig = {
        'pendiente': {
            texto: 'Pendiente',
            clase: 'pendiente',
            icono: '🟡',
            descripcion: 'Esperando respuesta del empleador'
        },
        'aceptado': {
            texto: '¡Aceptado!',
            clase: 'aceptado',
            icono: '✅',
            descripcion: '¡Felicidades! El empleador aceptó tu postulación'
        },
        'rechazado': {
            texto: 'No seleccionado',
            clase: 'rechazado',
            icono: '❌',
            descripcion: 'El empleador eligió otro candidato'
        },
        'completado': {
            texto: 'Completado',
            clase: 'completado',
            icono: '🏁',
            descripcion: 'Trabajo completado exitosamente'
        }
    };

    const config = estadoConfig[estado] || estadoConfig['pendiente'];

    // Sección de contacto (solo si está aceptado)
    let seccionContacto = '';
    if (estado === 'aceptado' || estado === 'completado') {
        const empleadorTelefono = aplicacion.empleadorTelefono || null;
        const empleadorEmail = aplicacion.empleadorEmail || '';
        const empleadorNombre = aplicacion.empleadorNombre || 'Empleador';

        const mensajeWhatsApp = encodeURIComponent(
            `Hola ${empleadorNombre}, soy ${usuario.nombre || 'el trabajador'} de ChambaYa. Mi postulación para "${aplicacion.ofertaTitulo}" fue aceptada. ¿Cuándo podemos coordinar?`
        );

        let telefonoWhatsApp = '';
        if (empleadorTelefono) {
            const telefonoLimpio = empleadorTelefono.replace(/\D/g, '');
            telefonoWhatsApp = telefonoLimpio.startsWith('51') ? telefonoLimpio : `51${telefonoLimpio}`;
        }

        seccionContacto = `
            <div class="contacto-empleador ${estado}">
                <div class="contacto-header">
                    <span class="contacto-titulo">📞 Contacta al empleador</span>
                </div>
                <div class="contacto-datos">
                    <div class="dato-item">
                        <span class="dato-label">Nombre:</span>
                        <span class="dato-valor">${escapeHtml(empleadorNombre)}</span>
                    </div>
                    <div class="dato-item">
                        <span class="dato-label">Email:</span>
                        <span class="dato-valor">${escapeHtml(empleadorEmail)}</span>
                    </div>
                    ${empleadorTelefono ? `
                    <div class="dato-item">
                        <span class="dato-label">Teléfono:</span>
                        <span class="dato-valor">${escapeHtml(empleadorTelefono)}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="contacto-acciones">
                    ${empleadorTelefono ? `
                        <a href="https://wa.me/${telefonoWhatsApp}?text=${mensajeWhatsApp}"
                           target="_blank"
                           class="btn btn-whatsapp">
                            📱 WhatsApp
                        </a>
                        <a href="tel:${empleadorTelefono}" class="btn btn-primary">
                            📞 Llamar
                        </a>
                    ` : ''}
                    <a href="mailto:${empleadorEmail}" class="btn btn-secondary">
                        ${ICON_EMAIL} Email
                    </a>
                </div>
            </div>
        `;
    }

    // Botón cancelar solo si está pendiente
    const tituloEscapado = escaparParaHTML(aplicacion.ofertaTitulo);
    const botonCancelar = estado === 'pendiente' ? `
        <button class="btn btn-danger btn-small" onclick="cancelarAplicacion('${aplicacion.id}', '${tituloEscapado}')">
            ❌ Cancelar Aplicación
        </button>
    ` : '';

    // Botón calificar empleador solo si está completado - Task 15
    let botonCalificarEmpleador = '';
    if (estado === 'completado') {
        if (aplicacion.calificadoPorTrabajador) {
            botonCalificarEmpleador = `
                <div class="estado-calificado-empleador">
                    <span class="calificacion-mostrada">
                        <span class="estrella-filled">★</span> Ya calificaste
                    </span>
                </div>
            `;
        } else {
            const nombreEmpleadorEscapado = escaparParaHTML(aplicacion.empleadorNombre || 'Empleador');
            botonCalificarEmpleador = `
                <button class="btn btn-warning btn-small" onclick="calificarEmpleador('${aplicacion.id}', '${aplicacion.empleadorEmail}', '${nombreEmpleadorEscapado}')">
                    ${ICON_STAR} Calificar Empleador
                </button>
            `;
        }
    }

    return `
        <div class="aplicacion-card ${config.clase} touchable hover-lift">
            <div class="aplicacion-header">
                <div class="aplicacion-info">
                    <div class="aplicacion-titulo">${escapeHtml(aplicacion.ofertaTitulo)}</div>
                    <span class="aplicacion-categoria">${escapeHtml(getCategoriaLabel(aplicacion.ofertaCategoria))}</span>
                    <div class="aplicacion-empleador">${ICON_USER_SM} ${escapeHtml(aplicacion.empleadorNombre)}</div>
                </div>
                <div class="aplicacion-estado">
                    <span class="estado-badge ${config.clase}">
                        ${config.icono} ${config.texto}
                    </span>
                    <span class="aplicacion-fecha">${ICON_CALENDAR} ${fecha}</span>
                </div>
            </div>

            <div class="estado-descripcion ${config.clase}">
                ${config.descripcion}
            </div>

            ${seccionContacto}

            <div class="aplicacion-mensaje">
                <strong>💬 Tu mensaje:</strong>
                <p>${escapeHtml(aplicacion.mensaje)}</p>
            </div>

            <div class="aplicacion-actions">
                <button class="btn btn-primary btn-small" onclick="verOfertaCompleta('${aplicacion.ofertaId}')">
                    👁️ Ver Oferta
                </button>
                ${botonCancelar}
                ${botonCalificarEmpleador}
            </div>
        </div>
    `;
}

// ============================================
// GET CATEGORIA LABEL
// ============================================
function getCategoriaLabel(categoria) {
    const labels = {
        'construccion': 'Construcción',
        'electricidad': 'Electricidad',
        'gasfiteria': 'Gasfitería',
        'pintura': 'Pintura',
        'carpinteria': 'Carpintería',
        'limpieza': 'Limpieza',
        'jardineria': 'Jardinería',
        'mecanica': 'Mecánica',
        'otros': 'Otros'
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

        // Galería de fotos (G6)
        let galeriaHTML = '';
        if (oferta.imagenesURLs && oferta.imagenesURLs.length > 0) {
            galeriaHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem;">
                        ${oferta.imagenesURLs.map((url, i) => `
                            <img src="${url}" alt="Foto ${i + 1}"
                                style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; cursor: pointer; flex-shrink: 0;"
                                onclick="window.open('${url}', '_blank')">
                        `).join('')}
                    </div>
                </div>
            `;
        }

        const modalBody = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h2 style="color: var(--primary); margin-bottom: 0.5rem;">${escapeHtml(oferta.titulo)}</h2>
                <span style="background: var(--light); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600;">
                    ${escapeHtml(getCategoriaLabel(oferta.categoria))}
                </span>
            </div>

            ${galeriaHTML}

            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: var(--dark); margin-bottom: 0.75rem;">📝 Descripción</h3>
                <p style="color: var(--gray); line-height: 1.6;">${escapeHtml(oferta.descripcion)}</p>
            </div>

            <div style="background: var(--light); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                <h3 style="color: var(--dark); margin-bottom: 1rem;">${ICON_PIN} Detalles</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <strong>${ICON_PIN} Ubicación:</strong><br>
                        ${escapeHtml(oferta.ubicacion?.texto_completo || oferta.ubicacion || 'No especificada')}
                    </div>
                    <div>
                        <strong>${ICON_MONEY} Salario:</strong><br>
                        ${escapeHtml(oferta.salario)}
                    </div>
                    <div>
                        <strong>⏱️ Duración:</strong><br>
                        ${escapeHtml(oferta.duracion || 'No especificada')}
                    </div>
                    <div>
                        <strong>${ICON_CLOCK} Horario:</strong><br>
                        ${escapeHtml(oferta.horario || 'No especificado')}
                    </div>
                </div>
            </div>

            <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; border-left: 3px solid var(--primary);">
                <strong style="color: var(--primary);">${ICON_USER_SM} Publicado por:</strong><br>
                <span style="color: var(--dark);">${escapeHtml(oferta.empleadorNombre)}</span><br>
                <span style="color: var(--gray); font-size: 0.875rem;">${ICON_EMAIL} ${escapeHtml(oferta.empleadorEmail)}</span>
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
        const estado = aplicacion.estado || 'pendiente';
        const coincideEstado = !filtroEstado || estado === filtroEstado;
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
// SISTEMA DE CALIFICACIÓN EMPLEADOR - Task 15
// ============================================

// Variables para el modal de calificación
let calificacionEmpleadorActual = {
    aplicacionId: null,
    empleadorEmail: null,
    empleadorNombre: null,
    ofertaId: null,
    ofertaTitulo: null,
    puntuacion: 0
};

// Usar textos del componente (TEXTOS_ESTRELLAS ya importado)
// Instancia del componente de rating para calificar empleadores
const ratingInputEmpleador = new RatingInput({
    containerId: 'estrellas-input-empleador',
    textoId: 'estrellas-texto-empleador',
    btnEnviarId: 'btn-enviar-calificacion-empleador',
    onSelect: (valor) => {
        calificacionEmpleadorActual.puntuacion = valor;
    }
});

async function calificarEmpleador(aplicacionId, empleadorEmail, nombreEmpleador) {
    try {
        const aplicacion = todasLasAplicaciones.find(a => a.id === aplicacionId);

        if (aplicacion && aplicacion.calificadoPorTrabajador) {
            if (typeof toastInfo === 'function') {
                toastInfo('Ya calificaste a este empleador');
            }
            return;
        }

        calificacionEmpleadorActual = {
            aplicacionId: aplicacionId,
            empleadorEmail: empleadorEmail,
            empleadorNombre: nombreEmpleador,
            ofertaId: aplicacion?.ofertaId || null,
            ofertaTitulo: aplicacion?.ofertaTitulo || 'Trabajo completado',
            puntuacion: 0
        };

        document.getElementById('cal-emp-nombre').textContent = nombreEmpleador;
        document.getElementById('cal-emp-trabajo').textContent = calificacionEmpleadorActual.ofertaTitulo;
        document.getElementById('cal-emp-comentario').value = '';
        document.getElementById('cal-emp-char-count').textContent = '0';

        resetearEstrellasEmpleador();

        document.getElementById('modal-calificar-empleador').classList.add('active');
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Error al abrir modal:', error);
        if (typeof toastError === 'function') {
            toastError('Error al cargar el formulario');
        }
    }
}

function cerrarModalCalificacionEmpleador() {
    document.getElementById('modal-calificar-empleador').classList.remove('active');
    document.body.style.overflow = 'auto';
    resetearEstrellasEmpleador();
    calificacionEmpleadorActual = {
        aplicacionId: null,
        empleadorEmail: null,
        empleadorNombre: null,
        ofertaId: null,
        ofertaTitulo: null,
        puntuacion: 0
    };
}

// Funciones de estrellas (usando componente reutilizable)
function seleccionarEstrellaEmpleador(valor) {
    ratingInputEmpleador.seleccionar(valor);
}

function resetearEstrellasEmpleador() {
    ratingInputEmpleador.resetear();
    calificacionEmpleadorActual.puntuacion = 0;
}

async function enviarCalificacionEmpleador() {
    if (calificacionEmpleadorActual.puntuacion === 0) {
        if (typeof toastError === 'function') {
            toastError('Selecciona una calificación');
        }
        return;
    }

    const btnEnviar = document.getElementById('btn-enviar-calificacion-empleador');
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '⏳ Enviando...';

    try {
        const comentario = document.getElementById('cal-emp-comentario').value.trim();

        // Buscar datos del empleador por email
        const empleadoresQuery = query(
            collection(db, 'usuarios'),
            where('email', '==', calificacionEmpleadorActual.empleadorEmail)
        );
        const empleadoresSnap = await getDocs(empleadoresQuery);

        let empleadorId = null;
        let empleadorData = null;

        if (!empleadoresSnap.empty) {
            const empleadorDoc = empleadoresSnap.docs[0];
            empleadorId = empleadorDoc.id;
            empleadorData = empleadorDoc.data();
        }

        // Obtener aplicación
        const aplicacionRef = doc(db, 'aplicaciones', calificacionEmpleadorActual.aplicacionId);
        const aplicacionSnap = await getDoc(aplicacionRef);
        const aplicacionData = aplicacionSnap.exists() ? aplicacionSnap.data() : {};

        // Crear documento de calificación
        const calificacionData = {
            aplicacionId: calificacionEmpleadorActual.aplicacionId,

            // Quien califica (trabajador)
            trabajadorId: auth.currentUser?.uid || null,
            trabajadorEmail: usuario.email,
            trabajadorNombre: usuario.nombre || 'Trabajador',

            // Quien es calificado (empleador)
            empleadorId: empleadorId,
            empleadorEmail: calificacionEmpleadorActual.empleadorEmail,
            empleadorNombre: calificacionEmpleadorActual.empleadorNombre,

            ofertaId: calificacionEmpleadorActual.ofertaId,
            ofertaTitulo: calificacionEmpleadorActual.ofertaTitulo,
            ofertaCategoria: aplicacionData?.ofertaCategoria || '',

            puntuacion: calificacionEmpleadorActual.puntuacion,
            comentario: comentario,

            // Tipo de calificación (trabajador califica empleador)
            tipo: 'trabajador_a_empleador',

            fechaCalificacion: serverTimestamp(),
            fechaTrabajoCompletado: aplicacionData?.fechaCompletado || null,

            // Para respuestas futuras
            respuesta: null,
            fechaRespuesta: null
        };

        // Guardar calificación
        const calificacionRef = await addDoc(collection(db, 'calificaciones'), calificacionData);

        // Actualizar aplicación
        await updateDoc(aplicacionRef, {
            calificadoPorTrabajador: true,
            calificacionTrabajadorId: calificacionRef.id
        });

        // Actualizar promedio del empleador
        if (empleadorId) {
            await actualizarPromedioEmpleador(empleadorId, calificacionEmpleadorActual.puntuacion);
        }

        // Actualizar UI local
        const aplicacion = todasLasAplicaciones.find(a => a.id === calificacionEmpleadorActual.aplicacionId);
        if (aplicacion) {
            aplicacion.calificadoPorTrabajador = true;
            aplicacion.calificacionTrabajadorId = calificacionRef.id;
        }

        // Guardar nombre antes de cerrar modal (que resetea el objeto)
        const nombreEmpleadorCalificado = calificacionEmpleadorActual.empleadorNombre;

        cerrarModalCalificacionEmpleador();
        if (typeof toastSuccess === 'function') {
            toastSuccess(`¡Gracias por calificar a ${nombreEmpleadorCalificado}!`);
        }

        mostrarAplicaciones(aplicacionesFiltradas.length > 0 ? aplicacionesFiltradas : todasLasAplicaciones);

    } catch (error) {
        console.error('Error al enviar calificación:', error);
        if (typeof toastError === 'function') {
            toastError('Error al enviar la calificación. Intenta de nuevo.');
        }
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = ICON_STAR + ' Enviar Calificación';
    }
}

async function actualizarPromedioEmpleador(empleadorId, nuevaPuntuacion) {
    try {
        const empleadorRef = doc(db, 'usuarios', empleadorId);
        const empleadorSnap = await getDoc(empleadorRef);

        if (!empleadorSnap.exists()) return;

        const data = empleadorSnap.data();
        const promedioActual = data.calificacionPromedio || 0;
        const totalActual = data.totalCalificaciones || 0;

        const nuevoTotal = totalActual + 1;
        const sumaTotal = (promedioActual * totalActual) + nuevaPuntuacion;
        const nuevoPromedio = Number((sumaTotal / nuevoTotal).toFixed(2));

        const distribucion = data.distribucionCalificaciones || { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
        distribucion[String(nuevaPuntuacion)] = (distribucion[String(nuevaPuntuacion)] || 0) + 1;

        await updateDoc(empleadorRef, {
            calificacionPromedio: nuevoPromedio,
            totalCalificaciones: nuevoTotal,
            distribucionCalificaciones: distribucion
        });

    } catch (error) {
        console.error('Error al actualizar promedio empleador:', error);
    }
}

// Inicializar eventos del modal de calificación (usando componente reutilizable)
function inicializarEventosCalificacionEmpleador() {
    // Inicializar hover de estrellas (componente)
    ratingInputEmpleador.inicializarEventos();

    // Contador de caracteres del comentario (componente)
    inicializarContadorComentario('cal-emp-comentario', 'cal-emp-char-count');

    // Cierre del modal con ESC (componente) - sin click fuera para evitar duplicados
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModalCalificacionEmpleador();
        }
    });
}

// Inicializar eventos al cargar
document.addEventListener('DOMContentLoaded', inicializarEventosCalificacionEmpleador);

// ============================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================
window.verOfertaCompleta = verOfertaCompleta;
window.cancelarAplicacion = cancelarAplicacion;
window.aplicarFiltros = aplicarFiltros;
window.limpiarFiltros = limpiarFiltros;
window.cerrarModal = cerrarModal;
window.clickFueraModal = clickFueraModal;
window.calificarEmpleador = calificarEmpleador;
window.cerrarModalCalificacionEmpleador = cerrarModalCalificacionEmpleador;
window.seleccionarEstrellaEmpleador = seleccionarEstrellaEmpleador;
window.enviarCalificacionEmpleador = enviarCalificacionEmpleador;

// ============================================
// INICIALIZACIÓN
// ============================================
cargarAplicaciones();
