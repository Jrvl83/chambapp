// ============================================
// MIS APLICACIONES - TRABAJADOR
// ChambApp - Task 21: Ver estado de postulaciones
// Actualizado: 19 Enero 2026
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, deleteDoc, orderBy, addDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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
        console.log('🔄 Cargando aplicaciones del trabajador:', usuario.email);

        const q = query(
            collection(db, 'aplicaciones'),
            where('aplicanteEmail', '==', usuario.email),
            orderBy('fechaAplicacion', 'desc')
        );

        const querySnapshot = await getDocs(q);
        console.log('📦 Aplicaciones encontradas:', querySnapshot.size);

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

        console.log('✅ Aplicaciones cargadas correctamente');

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
            `Hola ${empleadorNombre}, soy ${usuario.nombre || 'el trabajador'} de ChambApp. Mi postulación para "${aplicacion.ofertaTitulo}" fue aceptada. ¿Cuándo podemos coordinar?`
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
                        <span class="dato-valor">${empleadorNombre}</span>
                    </div>
                    <div class="dato-item">
                        <span class="dato-label">Email:</span>
                        <span class="dato-valor">${empleadorEmail}</span>
                    </div>
                    ${empleadorTelefono ? `
                    <div class="dato-item">
                        <span class="dato-label">Teléfono:</span>
                        <span class="dato-valor">${empleadorTelefono}</span>
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
                        📧 Email
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
                    ⭐ Calificar Empleador
                </button>
            `;
        }
    }

    return `
        <div class="aplicacion-card ${config.clase} touchable hover-lift">
            <div class="aplicacion-header">
                <div class="aplicacion-info">
                    <div class="aplicacion-titulo">${aplicacion.ofertaTitulo}</div>
                    <span class="aplicacion-categoria">${getCategoriaLabel(aplicacion.ofertaCategoria)}</span>
                    <div class="aplicacion-empleador">👤 ${aplicacion.empleadorNombre}</div>
                </div>
                <div class="aplicacion-estado">
                    <span class="estado-badge ${config.clase}">
                        ${config.icono} ${config.texto}
                    </span>
                    <span class="aplicacion-fecha">📅 ${fecha}</span>
                </div>
            </div>

            <div class="estado-descripcion ${config.clase}">
                ${config.descripcion}
            </div>

            ${seccionContacto}

            <div class="aplicacion-mensaje">
                <strong>💬 Tu mensaje:</strong>
                <p>${aplicacion.mensaje}</p>
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
// FORMATEAR FECHA
// ============================================
function formatearFecha(timestamp) {
    if (!timestamp) return 'Reciente';

    try {
        const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

        const opciones = {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
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
                <h2 style="color: var(--primary); margin-bottom: 0.5rem;">${oferta.titulo}</h2>
                <span style="background: var(--light); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600;">
                    ${getCategoriaLabel(oferta.categoria)}
                </span>
            </div>

            ${galeriaHTML}

            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: var(--dark); margin-bottom: 0.75rem;">📝 Descripción</h3>
                <p style="color: var(--gray); line-height: 1.6;">${oferta.descripcion}</p>
            </div>

            <div style="background: var(--light); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                <h3 style="color: var(--dark); margin-bottom: 1rem;">📍 Detalles</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <strong>📍 Ubicación:</strong><br>
                        ${oferta.ubicacion?.texto_completo || oferta.ubicacion || 'No especificada'}
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

const textosEstrellasEmpleador = {
    0: 'Selecciona una calificación',
    1: 'Muy malo',
    2: 'Malo',
    3: 'Regular',
    4: 'Bueno',
    5: 'Excelente'
};

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

function seleccionarEstrellaEmpleador(valor) {
    calificacionEmpleadorActual.puntuacion = valor;

    const estrellas = document.querySelectorAll('#estrellas-input-empleador .estrella');
    estrellas.forEach((estrella, index) => {
        if (index < valor) {
            estrella.classList.add('active');
            estrella.textContent = '★';
        } else {
            estrella.classList.remove('active');
            estrella.textContent = '☆';
        }
    });

    const textoEl = document.getElementById('estrellas-texto-empleador');
    textoEl.textContent = textosEstrellasEmpleador[valor];
    textoEl.classList.add('selected');

    document.getElementById('btn-enviar-calificacion-empleador').disabled = false;
}

function resetearEstrellasEmpleador() {
    calificacionEmpleadorActual.puntuacion = 0;
    const estrellas = document.querySelectorAll('#estrellas-input-empleador .estrella');
    estrellas.forEach(estrella => {
        estrella.classList.remove('active', 'hover');
        estrella.textContent = '☆';
    });

    const textoEl = document.getElementById('estrellas-texto-empleador');
    if (textoEl) {
        textoEl.textContent = textosEstrellasEmpleador[0];
        textoEl.classList.remove('selected');
    }

    const btnEnviar = document.getElementById('btn-enviar-calificacion-empleador');
    if (btnEnviar) btnEnviar.disabled = true;
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
        btnEnviar.innerHTML = '⭐ Enviar Calificación';
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

        console.log(`✅ Promedio empleador actualizado: ${nuevoPromedio} (${nuevoTotal} calificaciones)`);

    } catch (error) {
        console.error('Error al actualizar promedio empleador:', error);
    }
}

// Inicializar eventos del modal de calificación
function inicializarEventosCalificacionEmpleador() {
    const comentarioInput = document.getElementById('cal-emp-comentario');
    if (comentarioInput) {
        comentarioInput.addEventListener('input', (e) => {
            document.getElementById('cal-emp-char-count').textContent = e.target.value.length;
        });
    }

    // Hover effect en estrellas
    const estrellas = document.querySelectorAll('#estrellas-input-empleador .estrella');
    estrellas.forEach((estrella, index) => {
        estrella.addEventListener('mouseenter', () => {
            estrellas.forEach((e, i) => {
                if (i <= index) {
                    e.classList.add('hover');
                    e.textContent = '★';
                } else {
                    e.classList.remove('hover');
                    if (!e.classList.contains('active')) {
                        e.textContent = '☆';
                    }
                }
            });
        });

        estrella.addEventListener('mouseleave', () => {
            estrellas.forEach((e, i) => {
                e.classList.remove('hover');
                if (!e.classList.contains('active')) {
                    e.textContent = '☆';
                }
            });
        });
    });

    // Cerrar modal con ESC
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

console.log('✅ Mis Aplicaciones - Trabajador (Task 21) cargado correctamente');
