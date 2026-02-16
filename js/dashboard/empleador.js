/**
 * Módulo de dashboard para empleadores
 * Maneja: cargar ofertas, estadísticas, actividad reciente, editar/eliminar
 *
 * @module dashboard/empleador
 */

import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { crearOfertaCardEmpleador } from '../components/oferta-card.js';
import { confirmar } from '../components/confirm-modal.js';
import { mensajeErrorAmigable, toastErrorConRetry } from '../utils/error-handler.js';

// ============================================
// VARIABLES DEL MÓDULO
// ============================================
let db = null;
let usuarioData = null;
let usuarioActual = null;

/**
 * Inicializa el módulo con dependencias
 */
export function initEmpleador(firestore, usuario, auth) {
    db = firestore;
    usuarioData = usuario;
    usuarioActual = auth;
}

/**
 * Actualiza la referencia del usuario
 */
export function setUsuarioData(usuario) {
    usuarioData = usuario;
}

// ============================================
// CARGAR DASHBOARD EMPLEADOR
// ============================================

export async function cargarDashboardEmpleador(usuario, userUid) {
    try {
        const ofertasSnap = await cargarOfertasEmpleador(usuario.email);
        const aplicacionesSnap = await cargarAplicacionesEmpleador(userUid);

        const { pendientes, contratados } = contarEstadosAplicaciones(aplicacionesSnap);

        actualizarEstadisticasEmpleador(ofertasSnap.size, pendientes, contratados);
        actualizarSaludo(pendientes, ofertasSnap.size);
        renderizarOfertasEmpleador(ofertasSnap, aplicacionesSnap);
        renderizarActividadReciente(aplicacionesSnap);

    } catch (error) {
        console.error('Error cargando dashboard empleador:', error);
        toastErrorConRetry(
            mensajeErrorAmigable(error, 'cargar el dashboard'),
            () => cargarDashboardEmpleador(usuario, userUid)
        );
    }
}

async function cargarOfertasEmpleador(email) {
    const ofertasQuery = query(
        collection(db, 'ofertas'),
        where('empleadorEmail', '==', email),
        orderBy('fechaCreacion', 'desc')
    );
    return await getDocs(ofertasQuery);
}

async function cargarAplicacionesEmpleador(userUid) {
    const aplicacionesQuery = query(
        collection(db, 'aplicaciones'),
        where('empleadorId', '==', userUid)
    );
    return await getDocs(aplicacionesQuery);
}

function contarEstadosAplicaciones(aplicacionesSnap) {
    let pendientes = 0;
    let contratados = 0;

    aplicacionesSnap.forEach(doc => {
        const estado = doc.data().estado;
        if (estado === 'pendiente') pendientes++;
        if (estado === 'aceptado' || estado === 'completado') contratados++;
    });

    return { pendientes, contratados };
}

function actualizarEstadisticasEmpleador(ofertas, pendientes, contratados) {
    document.getElementById('emp-ofertas-activas').textContent = ofertas;
    document.getElementById('emp-pendientes').textContent = pendientes;
    document.getElementById('emp-contrataciones').textContent = contratados;

    const statPendientes = document.getElementById('stat-pendientes');
    if (statPendientes) {
        statPendientes.classList.toggle('stat-card-urgente', pendientes > 0);
    }
}

function actualizarSaludo(pendientes, totalOfertas) {
    const saludo = document.getElementById('saludo-empleador');
    const nombre = document.getElementById('saludo-nombre');
    const mensaje = document.getElementById('saludo-mensaje');
    const action = document.getElementById('saludo-action');
    if (!saludo) return;

    const primerNombre = usuarioData?.nombre?.split(' ')[0] || 'Usuario';
    nombre.textContent = `Hola, ${primerNombre}`;

    if (pendientes > 0) {
        mensaje.textContent = 'Tienes postulaciones nuevas por revisar';
        saludo.classList.add('saludo-urgente');
        action.style.display = '';
    } else if (totalOfertas > 0) {
        mensaje.textContent = 'Tus ofertas están al día ✓';
        saludo.classList.remove('saludo-urgente');
        action.style.display = 'none';
    } else {
        mensaje.textContent = 'Publica tu primera oferta para encontrar trabajadores';
        saludo.classList.remove('saludo-urgente');
        action.style.display = 'none';
    }
}

// ============================================
// RENDERIZAR OFERTAS EMPLEADOR
// ============================================

function renderizarOfertasEmpleador(ofertasSnap, aplicacionesSnap) {
    const grid = document.getElementById('empleador-ofertas-grid');
    const empty = document.getElementById('empleador-ofertas-empty');

    if (ofertasSnap.empty) {
        grid.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    empty.style.display = 'none';
    grid.innerHTML = '';

    const { aplicacionesPorOferta, pendientesPorOferta } = contarAplicacionesPorOferta(aplicacionesSnap);

    const ofertas = ordenarOfertasPorUrgencia(
        ofertasSnap, pendientesPorOferta
    );

    ofertas.forEach(({ id, oferta }) => {
        const numAplicaciones = aplicacionesPorOferta[id] || 0;
        const numPendientes = pendientesPorOferta[id] || 0;

        grid.innerHTML += crearOfertaCardEmpleador(oferta, id, {
            numAplicaciones,
            numPendientes
        });
    });
}

function ordenarOfertasPorUrgencia(ofertasSnap, pendientesPorOferta) {
    const ofertas = [];
    ofertasSnap.forEach(docSnap => {
        ofertas.push({ id: docSnap.id, oferta: docSnap.data() });
    });

    return ofertas.sort((a, b) => {
        const pendA = pendientesPorOferta[a.id] || 0;
        const pendB = pendientesPorOferta[b.id] || 0;

        if (pendA > 0 && pendB === 0) return -1;
        if (pendA === 0 && pendB > 0) return 1;
        if (pendA > 0 && pendB > 0) return pendB - pendA;

        const fechaA = a.oferta.fechaCreacion?.toDate?.() || new Date(0);
        const fechaB = b.oferta.fechaCreacion?.toDate?.() || new Date(0);
        return fechaB - fechaA;
    });
}

function contarAplicacionesPorOferta(aplicacionesSnap) {
    const aplicacionesPorOferta = {};
    const pendientesPorOferta = {};

    aplicacionesSnap.forEach(doc => {
        const data = doc.data();
        const ofertaId = data.ofertaId;
        aplicacionesPorOferta[ofertaId] = (aplicacionesPorOferta[ofertaId] || 0) + 1;
        if (data.estado === 'pendiente') {
            pendientesPorOferta[ofertaId] = (pendientesPorOferta[ofertaId] || 0) + 1;
        }
    });

    return { aplicacionesPorOferta, pendientesPorOferta };
}

// ============================================
// RENDERIZAR ACTIVIDAD RECIENTE
// ============================================

function renderizarActividadReciente(aplicacionesSnap) {
    const timeline = document.getElementById('actividad-timeline');
    const empty = document.getElementById('actividad-empty');

    if (aplicacionesSnap.empty) {
        timeline.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    timeline.style.display = 'flex';
    empty.style.display = 'none';
    timeline.innerHTML = '';

    const recientes = obtenerAplicacionesRecientes(aplicacionesSnap, 5);

    recientes.forEach(app => {
        timeline.innerHTML += crearItemActividad(app);
    });
}

function obtenerAplicacionesRecientes(aplicacionesSnap, limite) {
    const aplicaciones = [];
    aplicacionesSnap.forEach(doc => {
        aplicaciones.push({ id: doc.id, ...doc.data() });
    });

    aplicaciones.sort((a, b) => {
        const fechaA = a.fechaAplicacion?.toDate?.() || new Date(0);
        const fechaB = b.fechaAplicacion?.toDate?.() || new Date(0);
        return fechaB - fechaA;
    });

    return aplicaciones.slice(0, limite);
}

function crearItemActividad(app) {
    const fecha = app.fechaAplicacion?.toDate?.() || new Date();
    const tiempoRelativo = calcularTiempoRelativo(fecha);
    const nombreTrabajador = app.trabajadorNombre || 'Un trabajador';
    const tituloOferta = app.ofertaTitulo || 'una oferta';

    const { icono, accion } = obtenerEstadoActividad(app.estado);

    return `
        <div class="actividad-item">
            <div class="actividad-avatar">${icono}</div>
            <div class="actividad-content">
                <p class="actividad-texto"><strong>${nombreTrabajador}</strong> ${accion} "${tituloOferta}"</p>
                <span class="actividad-tiempo">${tiempoRelativo}</span>
            </div>
            <a href="mis-aplicaciones.html" class="actividad-action">Ver</a>
        </div>
    `;
}

function obtenerEstadoActividad(estado) {
    const estados = {
        'aceptado': { icono: '✅', accion: 'fue aceptado en' },
        'rechazado': { icono: '❌', accion: 'no fue seleccionado para' },
        'completado': { icono: '🏁', accion: 'completó' }
    };
    return estados[estado] || { icono: '👤', accion: 'aplicó a' };
}

function calcularTiempoRelativo(fecha) {
    const ahora = new Date();
    const diff = ahora - fecha;
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Ahora mismo';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    return fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

// ============================================
// EDITAR/ELIMINAR OFERTAS
// ============================================

export function registrarFuncionesGlobalesEmpleador() {
    window.toggleOfertaMenu = function (ofertaId) {
        document.querySelectorAll('.oferta-menu.active').forEach(menu => {
            if (menu.id !== `menu-${ofertaId}`) {
                menu.classList.remove('active');
            }
        });

        const menu = document.getElementById(`menu-${ofertaId}`);
        if (menu) {
            menu.classList.toggle('active');
        }
    };

    window.editarOferta = function (ofertaId) {
        cerrarTodosLosMenus();
        window.location.href = `/publicar-oferta.html?id=${ofertaId}`;
    };

    window.eliminarOferta = async function (ofertaId, titulo) {
        cerrarTodosLosMenus();

        const ok = await confirmar({
            titulo: '¿Eliminar oferta?',
            mensaje: `"${titulo}"<br><small>Esta acción no se puede deshacer.</small>`,
            textoConfirmar: 'Eliminar',
            tipo: 'danger'
        });
        if (!ok) return;

        try {
            await deleteDoc(doc(db, 'ofertas', ofertaId));
            await eliminarAplicacionesDeOferta(ofertaId);

            if (typeof toastSuccess === 'function') {
                toastSuccess('Oferta eliminada exitosamente');
            }

            if (usuarioData && usuarioActual) {
                await cargarDashboardEmpleador(usuarioData, usuarioActual.uid);
            }

        } catch (error) {
            console.error('Error eliminando oferta:', error);
            if (typeof toastError === 'function') {
                toastError('Error al eliminar la oferta');
            }
        }
    };

    // Cerrar menú al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.oferta-menu-container')) {
            cerrarTodosLosMenus();
        }
    });
}

function cerrarTodosLosMenus() {
    document.querySelectorAll('.oferta-menu.active').forEach(menu => {
        menu.classList.remove('active');
    });
}

async function eliminarAplicacionesDeOferta(ofertaId) {
    const appsQuery = query(
        collection(db, 'aplicaciones'),
        where('ofertaId', '==', ofertaId)
    );
    const appsSnap = await getDocs(appsQuery);

    for (const docSnap of appsSnap.docs) {
        await deleteDoc(docSnap.ref);
    }
}
