// ============================================
// MIS APLICACIONES - EMPLEADOR (Ver Candidatos)
// ChambApp - Task 21: Aceptar/Rechazar + WhatsApp
// Actualizado: 04 Febrero 2026
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
    addDoc,
    serverTimestamp,
    runTransaction
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { formatearFecha, generarEstrellasHTML } from './utils/formatting.js';
import { escapeHtml } from './utils/dom-helpers.js';
import { RatingInput, inicializarContadorComentario, configurarCierreModal, TEXTOS_ESTRELLAS } from './components/rating-input.js';

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
let trabajadoresRatings = {}; // Cache de ratings de trabajadores
let ofertasCache = {}; // Cache de datos de ofertas (vacantes, aceptadosCount)

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

        // Cargar ratings de los trabajadores y datos de ofertas en paralelo
        await Promise.all([
            cargarRatingsTrabajadores(todasLasAplicaciones),
            cargarDatosOfertas(todasLasAplicaciones)
        ]);

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
// CARGAR RATINGS DE TRABAJADORES
// ============================================
async function cargarRatingsTrabajadores(aplicaciones) {
    try {
        // Obtener emails únicos de trabajadores
        const emailsUnicos = [...new Set(aplicaciones.map(a => a.aplicanteEmail).filter(Boolean))];

        if (emailsUnicos.length === 0) return;

        // Consultar perfiles de trabajadores
        const trabajadoresQuery = query(
            collection(db, 'usuarios'),
            where('email', 'in', emailsUnicos.slice(0, 10)) // Firestore limita 'in' a 10 elementos
        );

        const snapshot = await getDocs(trabajadoresQuery);

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.email) {
                trabajadoresRatings[data.email] = {
                    promedio: data.calificacionPromedio || 0,
                    total: data.totalCalificaciones || 0
                };
            }
        });

        // Si hay más de 10 trabajadores, cargar el resto
        if (emailsUnicos.length > 10) {
            const emailsRestantes = emailsUnicos.slice(10);
            for (let i = 0; i < emailsRestantes.length; i += 10) {
                const batch = emailsRestantes.slice(i, i + 10);
                const batchQuery = query(
                    collection(db, 'usuarios'),
                    where('email', 'in', batch)
                );
                const batchSnapshot = await getDocs(batchQuery);
                batchSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.email) {
                        trabajadoresRatings[data.email] = {
                            promedio: data.calificacionPromedio || 0,
                            total: data.totalCalificaciones || 0
                        };
                    }
                });
            }
        }

    } catch (error) {
        console.error('Error al cargar ratings de trabajadores:', error);
    }
}

// ============================================
// CARGAR DATOS DE OFERTAS (vacantes, aceptadosCount)
// ============================================
async function cargarDatosOfertas(aplicaciones) {
    try {
        const ofertaIdsUnicos = [...new Set(aplicaciones.map(a => a.ofertaId).filter(Boolean))];
        if (ofertaIdsUnicos.length === 0) return;

        for (const ofertaId of ofertaIdsUnicos) {
            const ofertaSnap = await getDoc(doc(db, 'ofertas', ofertaId));
            if (ofertaSnap.exists()) {
                const data = ofertaSnap.data();
                ofertasCache[ofertaId] = {
                    vacantes: data.vacantes || 1,
                    aceptadosCount: data.aceptadosCount || 0,
                    estado: data.estado || 'activa'
                };
            }
        }
    } catch (error) {
        console.error('Error al cargar datos de ofertas:', error);
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
            ? `Sin postulaciones ${filtroEstadoActual}s`
            : 'Sin postulaciones';
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
    const ofertaInfo = ofertasCache[ofertaId] || {};
    const vacantes = ofertaInfo.vacantes || 1;
    const aceptadosCount = ofertaInfo.aceptadosCount || 0;

    // Badge de vacantes (solo si hay más de 1)
    const vacantesHTML = vacantes > 1
        ? `<span class="oferta-vacantes-badge">${aceptadosCount}/${vacantes} vacantes cubiertas</span>`
        : '';

    let aplicacionesHTML = '';
    grupo.aplicaciones.forEach(aplicacion => {
        aplicacionesHTML += crearAplicacionCard(aplicacion, ofertaId);
    });

    return `
        <div class="oferta-grupo">
            <div class="oferta-grupo-header">
                <div class="oferta-grupo-info">
                    <h3 class="oferta-grupo-titulo">📋 ${escapeHtml(grupo.titulo)}</h3>
                    <div class="oferta-grupo-meta">
                        <span class="oferta-categoria-badge">${categoriaLabel}</span>
                        <span class="oferta-aplicantes-count">👥 ${cantidadAplicantes} postulante${cantidadAplicantes !== 1 ? 's' : ''}</span>
                        ${vacantesHTML}
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
function crearAplicacionCard(aplicacion, ofertaId) {
    const estado = aplicacion.estado || 'pendiente';
    const estadoBadge = crearBadgeEstado(estado);

    const telefono = aplicacion.aplicanteTelefono || null;
    const email = aplicacion.aplicanteEmail || 'No disponible';
    const nombre = aplicacion.aplicanteNombre || 'Trabajador';
    const mensaje = aplicacion.mensaje || 'Sin mensaje';
    const fecha = formatearFecha(aplicacion.fechaAplicacion);
    const tituloOferta = aplicacion.ofertaTitulo || 'Sin título';

    // Datos de vacantes de la oferta
    const ofertaInfo = ofertasCache[ofertaId] || {};
    const vacantes = ofertaInfo.vacantes || 1;
    const aceptadosCount = ofertaInfo.aceptadosCount || 0;
    const vacantesLlenas = aceptadosCount >= vacantes;

    // Escapar para uso en onclick
    const nombreEscapado = escaparParaHTML(nombre);
    const tituloEscapado = escaparParaHTML(tituloOferta);
    const emailEscapado = escaparParaHTML(email);

    // Crear botones según el estado
    let botonesAccion = '';

    if (estado === 'pendiente') {
        if (vacantesLlenas) {
            // Todas las vacantes cubiertas, no se puede aceptar más
            botonesAccion = `
                <div class="estado-final">
                    <span class="texto-rechazado">Vacantes cubiertas</span>
                </div>
                <button class="btn btn-danger btn-sm" onclick="rechazarAplicacion('${aplicacion.id}', '${nombreEscapado}')">
                    ❌ Rechazar
                </button>
            `;
        } else {
            // Botones para estado pendiente: Aceptar y Rechazar
            botonesAccion = `
                <button class="btn btn-success btn-sm" onclick="aceptarAplicacion('${aplicacion.id}', '${nombreEscapado}')">
                    ✅ Aceptar
                </button>
                <button class="btn btn-danger btn-sm" onclick="rechazarAplicacion('${aplicacion.id}', '${nombreEscapado}')">
                    ❌ Rechazar
                </button>
            `;
        }
    } else if (estado === 'aceptado') {
        // Botones para estado aceptado: WhatsApp, Llamar, Marcar Completado
        const mensajeWhatsApp = encodeURIComponent(
            `Hola ${nombre}, te contacto por la oferta "${aplicacion.ofertaTitulo}" en ChambApp. Tu postulación fue aceptada.`
        );
        const telefonoLimpio = telefono ? telefono.replace(/\D/g, '') : '';
        const telefonoWhatsApp = telefonoLimpio.startsWith('51') ? telefonoLimpio : `51${telefonoLimpio}`;

        botonesAccion = `
            <div class="contacto-aceptado">
                <div class="contacto-info">
                    <span class="contacto-label">📱 Contacto:</span>
                    <span class="contacto-telefono">${escapeHtml(telefono || 'No disponible')}</span>
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
        // Verificar si ya fue calificado
        if (aplicacion.calificado) {
            botonesAccion = `
                <div class="estado-final completado">
                    <span class="texto-completado">✅ Trabajo completado</span>
                    <div class="estado-calificado">
                        <span class="calificacion-mostrada">
                            <span class="estrella-filled">★</span>
                            Calificado
                        </span>
                    </div>
                </div>
            `;
        } else {
            botonesAccion = `
                <div class="estado-final completado">
                    <span class="texto-completado">✅ Trabajo completado</span>
                    <button class="btn btn-primary btn-sm" onclick="calificarTrabajador('${aplicacion.id}', '${emailEscapado}', '${nombreEscapado}')">
                        ⭐ Calificar
                    </button>
                </div>
            `;
        }
    }

    // Obtener rating del trabajador
    const ratingInfo = trabajadoresRatings[email] || { promedio: 0, total: 0 };
    const ratingHTML = ratingInfo.total > 0
        ? `<div class="trabajador-rating clickable" onclick="verDetalleCalificaciones('${emailEscapado}', '${nombreEscapado}')">
               <span class="rating-estrella">★</span>
               <span class="rating-numero">${ratingInfo.promedio.toFixed(1)}</span>
               <span class="rating-total">(${ratingInfo.total})</span>
               <span class="rating-ver">👁️</span>
           </div>`
        : `<div class="trabajador-rating sin-rating">
               <span class="rating-texto">Sin calificaciones aún</span>
           </div>`;

    return `
        <div class="aplicacion-card estado-${estado} touchable hover-lift">
            <div class="aplicacion-header">
                <div class="aplicacion-trabajador">
                    <div class="aplicacion-avatar">👤</div>
                    <div>
                        <div class="aplicacion-nombre">${escapeHtml(nombre)}</div>
                        <div class="aplicacion-email">${escapeHtml(email)}</div>
                        ${ratingHTML}
                    </div>
                </div>
                ${estadoBadge}
            </div>

            <div class="aplicacion-info">
                ${telefono && estado !== 'aceptado' ? `
                <div class="info-item">
                    <span class="info-label">📱 Teléfono</span>
                    <span class="info-value">${escapeHtml(telefono)}</span>
                </div>
                ` : ''}
                <div class="info-item">
                    <span class="info-label">📅 Fecha postulación</span>
                    <span class="info-value">${fecha}</span>
                </div>
            </div>

            <div class="aplicacion-mensaje">
                <strong>💬 Mensaje del postulante:</strong><br>
                ${escapeHtml(mensaje)}
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
        const aplicacion = todasLasAplicaciones.find(a => a.id === aplicacionId);
        if (!aplicacion) return;

        // Primero la transaction (atómica, puede fallar por conflicto)
        const resultado = await actualizarOfertaAlAceptar(aplicacion, nombreTrabajador);

        // Solo si la transaction fue exitosa, marcar la aplicación
        await updateDoc(doc(db, 'aplicaciones', aplicacionId), {
            estado: 'aceptado',
            fechaAceptacion: serverTimestamp()
        });

        // Toast con contexto de vacantes
        const mensaje = resultado.vacantes > 1
            ? `¡Aceptado! ${resultado.aceptadosCount} de ${resultado.vacantes} vacantes cubiertas`
            : `¡Postulación de ${nombreTrabajador} aceptada!`;

        if (typeof toastSuccess === 'function') {
            toastSuccess(mensaje);
        }

        // Actualizar cache y UI
        aplicacion.estado = 'aceptado';
        if (ofertasCache[aplicacion.ofertaId]) {
            ofertasCache[aplicacion.ofertaId].aceptadosCount = resultado.aceptadosCount;
        }
        mostrarAplicaciones(todasLasAplicaciones);
        actualizarEstadisticas();
    } catch (error) {
        console.error('Error al aceptar aplicación:', error);
        if (typeof toastError === 'function') {
            const msg = error.message === 'No hay vacantes disponibles'
                ? 'Las vacantes ya fueron cubiertas'
                : 'Error al aceptar la postulación';
            toastError(msg);
        }
    }
}

// Helper: transaction atómica para actualizar oferta al aceptar
async function actualizarOfertaAlAceptar(aplicacion, nombreTrabajador) {
    const ofertaRef = doc(db, 'ofertas', aplicacion.ofertaId);

    return await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ofertaRef);
        const data = snap.data();
        const vacantes = data.vacantes || 1;
        const currentCount = data.aceptadosCount || 0;

        // Validar que hay vacantes disponibles
        if (currentCount >= vacantes) {
            throw new Error('No hay vacantes disponibles');
        }

        const nuevoCount = currentCount + 1;
        const aceptados = data.trabajadoresAceptados || [];

        aceptados.push({
            id: aplicacion.aplicanteId || aplicacion.trabajadorId,
            nombre: nombreTrabajador,
            fechaAceptacion: new Date().toISOString()
        });

        const updates = {
            aceptadosCount: nuevoCount,
            trabajadoresAceptados: aceptados,
            fechaAceptacion: serverTimestamp()
        };

        // Si se llenaron todas las vacantes → en_curso
        if (nuevoCount >= vacantes) {
            updates.estado = 'en_curso';
        }

        // Backward compat: mantener campo legacy para ofertas de 1 vacante
        if (vacantes === 1) {
            updates.trabajadorAceptadoId = aplicacion.aplicanteId || aplicacion.trabajadorId;
            updates.trabajadorAceptadoNombre = nombreTrabajador;
        }

        transaction.update(ofertaRef, updates);
        return { aceptadosCount: nuevoCount, vacantes };
    });
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
        const aplicacion = todasLasAplicaciones.find(a => a.id === aplicacionId);

        await updateDoc(doc(db, 'aplicaciones', aplicacionId), {
            estado: 'completado',
            fechaCompletado: serverTimestamp()
        });

        // Verificar si todos los aceptados completaron (para multi-vacante)
        if (aplicacion && aplicacion.ofertaId) {
            await verificarTodosCompletados(aplicacion.ofertaId, aplicacionId);
        }

        if (typeof toastSuccess === 'function') {
            toastSuccess(`¡Trabajo completado! Ahora puedes calificar a ${nombreTrabajador}`);
        }

        if (aplicacion) {
            aplicacion.estado = 'completado';
        }
        mostrarAplicaciones(todasLasAplicaciones);
        actualizarEstadisticas();
    } catch (error) {
        console.error('Error al marcar como completado:', error);
        if (typeof toastError === 'function') {
            toastError('Error al marcar como completado');
        }
    }
}

// Helper: verificar si todos los trabajadores aceptados completaron
async function verificarTodosCompletados(ofertaId, aplicacionRecienCompletadaId) {
    const appsQuery = query(
        collection(db, 'aplicaciones'),
        where('ofertaId', '==', ofertaId),
        where('estado', 'in', ['aceptado', 'completado'])
    );
    const snap = await getDocs(appsQuery);

    // Guard: si no hay aplicaciones aceptadas/completadas, no marcar la oferta
    if (snap.empty) return;

    const todosCompletados = snap.docs.every(d =>
        d.id === aplicacionRecienCompletadaId || d.data().estado === 'completado'
    );

    if (todosCompletados) {
        await updateDoc(doc(db, 'ofertas', ofertaId), {
            estado: 'completada',
            fechaCompletado: serverTimestamp()
        });
    }
}

// ============================================
// SISTEMA DE CALIFICACIONES - Task 13
// ============================================

// Variables para el modal de calificacion
let calificacionActual = {
    aplicacionId: null,
    trabajadorEmail: null,
    trabajadorNombre: null,
    ofertaId: null,
    ofertaTitulo: null,
    puntuacion: 0
};

// Usar textos del componente (TEXTOS_ESTRELLAS ya importado)
// Instancia del componente de rating
const ratingInputTrabajador = new RatingInput({
    containerId: 'estrellas-input',
    textoId: 'estrellas-texto',
    btnEnviarId: 'btn-enviar-calificacion',
    onSelect: (valor) => {
        calificacionActual.puntuacion = valor;
    }
});

// ============================================
// ABRIR MODAL DE CALIFICACION
// ============================================
async function calificarTrabajador(aplicacionId, trabajadorEmail, nombreTrabajador) {
    try {
        // Verificar si ya fue calificado
        const aplicacion = todasLasAplicaciones.find(a => a.id === aplicacionId);

        if (aplicacion && aplicacion.calificado) {
            if (typeof toastInfo === 'function') {
                toastInfo('Ya calificaste a este trabajador');
            } else {
                alert('Ya calificaste a este trabajador');
            }
            return;
        }

        // Guardar datos para la calificacion
        calificacionActual = {
            aplicacionId: aplicacionId,
            trabajadorEmail: trabajadorEmail,
            trabajadorNombre: nombreTrabajador,
            ofertaId: aplicacion?.ofertaId || null,
            ofertaTitulo: aplicacion?.ofertaTitulo || 'Trabajo completado',
            puntuacion: 0
        };

        // Actualizar UI del modal
        document.getElementById('cal-nombre').textContent = nombreTrabajador;
        document.getElementById('cal-trabajo').textContent = calificacionActual.ofertaTitulo;
        document.getElementById('cal-comentario').value = '';
        document.getElementById('cal-char-count').textContent = '0';

        // Resetear estrellas
        resetearEstrellas();

        // Mostrar modal
        document.getElementById('modal-calificacion').classList.add('active');
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Error al abrir modal de calificacion:', error);
        if (typeof toastError === 'function') {
            toastError('Error al cargar el formulario de calificacion');
        }
    }
}

// ============================================
// CERRAR MODAL
// ============================================
function cerrarModalCalificacion() {
    document.getElementById('modal-calificacion').classList.remove('active');
    document.body.style.overflow = 'auto';
    resetearEstrellas();
    calificacionActual = {
        aplicacionId: null,
        trabajadorEmail: null,
        trabajadorNombre: null,
        ofertaId: null,
        ofertaTitulo: null,
        puntuacion: 0
    };
}

// ============================================
// SELECCIONAR ESTRELLAS (usando componente reutilizable)
// ============================================
function seleccionarEstrella(valor) {
    ratingInputTrabajador.seleccionar(valor);
}

function resetearEstrellas() {
    ratingInputTrabajador.resetear();
    calificacionActual.puntuacion = 0;
}

// ============================================
// ENVIAR CALIFICACION A FIRESTORE
// ============================================
async function enviarCalificacion() {
    if (calificacionActual.puntuacion === 0) {
        if (typeof toastError === 'function') {
            toastError('Selecciona una calificacion');
        }
        return;
    }

    const btnEnviar = document.getElementById('btn-enviar-calificacion');
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '⏳ Enviando...';

    try {
        const comentario = document.getElementById('cal-comentario').value.trim();

        // Buscar datos del trabajador por email
        const trabajadoresQuery = query(
            collection(db, 'usuarios'),
            where('email', '==', calificacionActual.trabajadorEmail)
        );
        const trabajadoresSnap = await getDocs(trabajadoresQuery);

        let trabajadorId = null;
        let trabajadorData = null;

        if (!trabajadoresSnap.empty) {
            const trabajadorDoc = trabajadoresSnap.docs[0];
            trabajadorId = trabajadorDoc.id;
            trabajadorData = trabajadorDoc.data();
        }

        // Obtener aplicacion para fecha completado
        const aplicacionRef = doc(db, 'aplicaciones', calificacionActual.aplicacionId);
        const aplicacionSnap = await getDoc(aplicacionRef);
        const aplicacionData = aplicacionSnap.data();

        // Crear documento de calificacion
        const calificacionData = {
            aplicacionId: calificacionActual.aplicacionId,

            trabajadorId: trabajadorId,
            trabajadorEmail: calificacionActual.trabajadorEmail,
            trabajadorNombre: calificacionActual.trabajadorNombre,

            empleadorId: usuario.uid || auth.currentUser?.uid,
            empleadorEmail: usuario.email,
            empleadorNombre: usuario.nombre || 'Empleador',

            ofertaId: calificacionActual.ofertaId,
            ofertaTitulo: calificacionActual.ofertaTitulo,
            ofertaCategoria: aplicacionData?.ofertaCategoria || '',

            puntuacion: calificacionActual.puntuacion,
            comentario: comentario,

            fechaCalificacion: serverTimestamp(),
            fechaTrabajoCompletado: aplicacionData?.fechaCompletado || null
        };

        // Guardar calificacion
        const calificacionRef = await addDoc(collection(db, 'calificaciones'), calificacionData);

        // Actualizar aplicacion como calificada
        await updateDoc(aplicacionRef, {
            calificado: true,
            calificacionId: calificacionRef.id
        });

        // Actualizar promedio del trabajador
        if (trabajadorId) {
            await actualizarPromedioTrabajador(trabajadorId, calificacionActual.puntuacion);
        }

        // Actualizar UI local
        const aplicacion = todasLasAplicaciones.find(a => a.id === calificacionActual.aplicacionId);
        if (aplicacion) {
            aplicacion.calificado = true;
            aplicacion.calificacionId = calificacionRef.id;
        }

        // Cerrar modal y mostrar exito
        cerrarModalCalificacion();
        if (typeof toastSuccess === 'function') {
            toastSuccess(`¡Gracias por calificar a ${calificacionActual.trabajadorNombre}!`);
        } else {
            alert(`¡Gracias por calificar a ${calificacionActual.trabajadorNombre}!`);
        }

        // Re-renderizar la lista para mostrar estado actualizado
        mostrarAplicaciones(todasLasAplicaciones);

    } catch (error) {
        console.error('Error al enviar calificacion:', error);
        if (typeof toastError === 'function') {
            toastError('Error al enviar la calificacion. Intenta de nuevo.');
        } else {
            alert('Error al enviar la calificacion');
        }

    } finally {
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = 'Enviar Calificacion';
    }
}

// ============================================
// ACTUALIZAR PROMEDIO DEL TRABAJADOR
// ============================================
async function actualizarPromedioTrabajador(trabajadorId, nuevaPuntuacion) {
    try {
        const trabajadorRef = doc(db, 'usuarios', trabajadorId);
        const trabajadorSnap = await getDoc(trabajadorRef);

        if (!trabajadorSnap.exists()) return;

        const data = trabajadorSnap.data();
        const promedioActual = data.calificacionPromedio || 0;
        const totalActual = data.totalCalificaciones || 0;

        // Calcular nuevo promedio
        const nuevoTotal = totalActual + 1;
        const sumaTotal = (promedioActual * totalActual) + nuevaPuntuacion;
        const nuevoPromedio = Number((sumaTotal / nuevoTotal).toFixed(2));

        // Actualizar distribucion
        const distribucion = data.distribucionCalificaciones || {
            "5": 0, "4": 0, "3": 0, "2": 0, "1": 0
        };
        distribucion[String(nuevaPuntuacion)] = (distribucion[String(nuevaPuntuacion)] || 0) + 1;

        // Guardar actualizacion
        await updateDoc(trabajadorRef, {
            calificacionPromedio: nuevoPromedio,
            totalCalificaciones: nuevoTotal,
            distribucionCalificaciones: distribucion
        });

    } catch (error) {
        console.error('Error al actualizar promedio:', error);
        // No lanzar error - la calificacion ya se guardo
    }
}

// ============================================
// INICIALIZAR EVENTOS DEL MODAL (usando componente reutilizable)
// ============================================
function inicializarEventosCalificacion() {
    // Inicializar hover de estrellas (componente)
    ratingInputTrabajador.inicializarEventos();

    // Contador de caracteres del comentario (componente)
    inicializarContadorComentario('cal-comentario', 'cal-char-count');

    // Cierre del modal con ESC y click fuera (componente)
    configurarCierreModal('modal-calificacion', cerrarModalCalificacion);
}

// Inicializar eventos cuando el DOM este listo
document.addEventListener('DOMContentLoaded', inicializarEventosCalificacion);

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

// ============================================
// VER DETALLE DE CALIFICACIONES DEL TRABAJADOR
// ============================================
async function verDetalleCalificaciones(emailTrabajador, nombreTrabajador) {
    try {
        const modal = document.getElementById('modal-detalle-calificaciones');
        const contenido = document.getElementById('detalle-calificaciones-contenido');

        if (!modal || !contenido) {
            console.error('Modal de detalle no encontrado');
            return;
        }

        // Mostrar loading
        contenido.innerHTML = `
            <div class="loading-calificaciones">
                <div class="spinner-small"></div>
                <p>Cargando calificaciones...</p>
            </div>
        `;

        document.getElementById('detalle-nombre-trabajador').textContent = nombreTrabajador;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Obtener datos del trabajador
        const ratingInfo = trabajadoresRatings[emailTrabajador] || { promedio: 0, total: 0 };

        // Buscar calificaciones del trabajador
        const calificacionesQuery = query(
            collection(db, 'calificaciones'),
            where('trabajadorEmail', '==', emailTrabajador)
        );

        const snapshot = await getDocs(calificacionesQuery);

        // Filtrar solo calificaciones de empleador a trabajador
        const calificaciones = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (!data.tipo || data.tipo === 'empleador_a_trabajador') {
                calificaciones.push({ id: doc.id, ...data });
            }
        });

        // Ordenar por fecha descendente
        calificaciones.sort((a, b) => {
            const fechaA = a.fechaCalificacion?.toDate?.() || new Date(0);
            const fechaB = b.fechaCalificacion?.toDate?.() || new Date(0);
            return fechaB - fechaA;
        });

        // Generar HTML del contenido
        let html = '';

        // Resumen
        html += `
            <div class="detalle-resumen">
                <div class="detalle-promedio">
                    <span class="promedio-numero">${ratingInfo.promedio.toFixed(1)}</span>
                    <div class="promedio-estrellas">${generarEstrellasHTML(ratingInfo.promedio)}</div>
                    <span class="promedio-total">${ratingInfo.total} calificación${ratingInfo.total !== 1 ? 'es' : ''}</span>
                </div>
            </div>
        `;

        // Lista de reseñas
        if (calificaciones.length > 0) {
            html += '<div class="detalle-lista-resenas">';
            calificaciones.forEach(cal => {
                const fecha = formatearFechaCalificacion(cal.fechaCalificacion);
                html += `
                    <div class="detalle-resena-card">
                        <div class="detalle-resena-header">
                            <div class="detalle-resena-info">
                                <span class="detalle-resena-empleador">👤 ${cal.empleadorNombre || 'Empleador'}</span>
                                <span class="detalle-resena-trabajo">${cal.ofertaTitulo || 'Trabajo'}</span>
                            </div>
                            <div class="detalle-resena-rating">
                                ${generarEstrellasHTML(cal.puntuacion)}
                                <span class="detalle-resena-fecha">${fecha}</span>
                            </div>
                        </div>
                        ${cal.comentario ? `
                            <div class="detalle-resena-comentario">
                                <p>"${cal.comentario}"</p>
                            </div>
                        ` : ''}
                        ${cal.respuesta ? `
                            <div class="detalle-resena-respuesta">
                                <span class="respuesta-label">Respuesta del trabajador:</span>
                                <p>"${cal.respuesta}"</p>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            html += '</div>';
        } else {
            html += `
                <div class="detalle-sin-resenas">
                    <p>📋 Este trabajador aún no tiene reseñas detalladas</p>
                </div>
            `;
        }

        contenido.innerHTML = html;

    } catch (error) {
        console.error('Error al cargar detalle de calificaciones:', error);
        const contenido = document.getElementById('detalle-calificaciones-contenido');
        if (contenido) {
            contenido.innerHTML = `
                <div class="error-calificaciones">
                    <p>❌ Error al cargar las calificaciones</p>
                </div>
            `;
        }
    }
}

function cerrarModalDetalleCalificaciones() {
    const modal = document.getElementById('modal-detalle-calificaciones');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Alias para mantener compatibilidad con código que usa formatearFechaCalificacion
function formatearFechaCalificacion(timestamp) {
    return formatearFecha(timestamp, 'absoluto');
}

// ============================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================
window.aceptarAplicacion = aceptarAplicacion;
window.rechazarAplicacion = rechazarAplicacion;
window.marcarCompletado = marcarCompletado;
window.calificarTrabajador = calificarTrabajador;
window.filtrarPorEstado = filtrarPorEstado;

// Funciones del sistema de calificaciones
window.cerrarModalCalificacion = cerrarModalCalificacion;
window.seleccionarEstrella = seleccionarEstrella;
window.enviarCalificacion = enviarCalificacion;

// Funciones del modal de detalle de calificaciones
window.verDetalleCalificaciones = verDetalleCalificaciones;
window.cerrarModalDetalleCalificaciones = cerrarModalDetalleCalificaciones;

// ============================================
// INICIALIZACIÓN
// ============================================
cargarAplicaciones();
