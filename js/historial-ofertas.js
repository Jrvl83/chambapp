// ============================================
// HISTORIAL DE OFERTAS - ChambApp
// G5: Vista de todas las ofertas del empleador
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { formatearFecha } from './utils/formatting.js';
import { manejarBloqueado } from './utils/auth-guard.js';

const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let todasLasOfertas = [];
let usuarioActual = null;

// ============================================
// AUTENTICACIÓN
// ============================================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    usuarioActual = user;

    // Verificar usuario
    const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
    if (!userDoc.exists()) {
        window.location.href = 'login.html';
        return;
    }

    const userData = userDoc.data();
    if (userData.bloqueado) {
        await manejarBloqueado(auth);
        return;
    }
    if (userData.tipo !== 'empleador') {
        window.location.href = 'dashboard.html';
        return;
    }

    await cargarOfertas();
});

// ============================================
// CARGAR OFERTAS
// ============================================
async function cargarOfertas() {
    try {
        const q = query(
            collection(db, 'ofertas'),
            where('empleadorId', '==', usuarioActual.uid),
            orderBy('fechaCreacion', 'desc')
        );

        const snapshot = await getDocs(q);
        todasLasOfertas = [];

        snapshot.forEach(docSnap => {
            todasLasOfertas.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });

        actualizarEstadisticas();
        renderizarOfertas(todasLasOfertas);
        ocultarLoading();

    } catch (error) {
        console.error('Error cargando ofertas:', error);
        ocultarLoading();
        mostrarEmptyState();
    }
}

// ============================================
// ESTADÍSTICAS
// ============================================
function actualizarEstadisticas() {
    const ahora = new Date();
    let activas = 0, enCurso = 0, completadas = 0, caducadas = 0;

    todasLasOfertas.forEach(oferta => {
        // Determinar estado real (considerando expiración)
        let estadoReal = oferta.estado || 'activa';

        if (estadoReal === 'activa' && oferta.fechaExpiracion) {
            const fechaExp = oferta.fechaExpiracion.toDate ?
                oferta.fechaExpiracion.toDate() : new Date(oferta.fechaExpiracion);
            if (fechaExp < ahora) {
                estadoReal = 'caducada';
            }
        }

        switch (estadoReal) {
            case 'activa': activas++; break;
            case 'en_curso': enCurso++; break;
            case 'completada': completadas++; break;
            case 'caducada': caducadas++; break;
        }
    });

    document.getElementById('stat-total').textContent = todasLasOfertas.length;
    document.getElementById('stat-activas').textContent = activas;
    document.getElementById('stat-en-curso').textContent = enCurso;
    document.getElementById('stat-completadas').textContent = completadas;
    document.getElementById('stat-caducadas').textContent = caducadas;
}

// ============================================
// RENDERIZAR OFERTAS
// ============================================
function renderizarOfertas(ofertas) {
    const container = document.getElementById('ofertas-list');
    const emptyState = document.getElementById('empty-state');

    if (ofertas.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'block';
    emptyState.style.display = 'none';

    const ahora = new Date();

    container.innerHTML = ofertas.map(oferta => {
        // Determinar estado real
        let estadoReal = oferta.estado || 'activa';
        if (estadoReal === 'activa' && oferta.fechaExpiracion) {
            const fechaExp = oferta.fechaExpiracion.toDate ?
                oferta.fechaExpiracion.toDate() : new Date(oferta.fechaExpiracion);
            if (fechaExp < ahora) {
                estadoReal = 'caducada';
            }
        }

        const estadoBadge = getEstadoBadge(estadoReal);
        const acciones = getAccionesHTML(oferta.id, estadoReal, oferta.titulo, oferta.vacantes || 1);
        const fechaMostrar = formatearFecha(oferta.fechaActualizacion || oferta.fechaCreacion);

        const ubicacion = typeof oferta.ubicacion === 'object'
            ? (oferta.ubicacion.distrito || 'Sin ubicacion')
            : (oferta.ubicacion || 'Sin ubicacion');

        // Imagen principal (G6)
        const tieneImagen = oferta.imagenesURLs && oferta.imagenesURLs.length > 0;
        const imagenHTML = tieneImagen
            ? `<div class="oferta-historial-imagen"><img src="${oferta.imagenesURLs[0]}" alt="${oferta.titulo}" loading="lazy"></div>`
            : '';

        return `
            <div class="oferta-historial-card ${tieneImagen ? 'con-imagen' : ''}" data-estado="${estadoReal}">
                ${imagenHTML}
                <div class="oferta-historial-content">
                    <div class="oferta-historial-header">
                        <span class="estado-badge ${estadoReal}">${estadoBadge}</span>
                        <span class="oferta-fecha">${fechaMostrar}</span>
                    </div>
                    <h3 class="oferta-titulo">${oferta.titulo}</h3>
                    <div class="oferta-meta">
                        <span>📍 ${ubicacion}</span>
                        <span>💰 ${oferta.salario || 'No especificado'}</span>
                        ${(oferta.vacantes || 1) > 1 ? `<span>👥 ${oferta.aceptadosCount || 0}/${oferta.vacantes} aceptados</span>` : ''}
                    </div>
                    <div class="oferta-acciones">
                        ${acciones}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getEstadoBadge(estado) {
    const badges = {
        'activa': '✅ Activa',
        'en_curso': '🔄 En curso',
        'completada': '🏁 Completada',
        'caducada': '⏳ Caducada'
    };
    return badges[estado] || estado;
}

function getAccionesHTML(id, estado, titulo, vacantes) {
    const tituloEscapado = titulo.replace(/'/g, "\\'");
    vacantes = vacantes || 1;

    switch (estado) {
        case 'activa':
            return `
                <button class="btn-accion" onclick="editarOferta('${id}')">✏️ Editar</button>
                <button class="btn-accion btn-accion-danger" onclick="eliminarOferta('${id}', '${tituloEscapado}')">🗑️</button>
            `;
        case 'en_curso':
            return `
                <a href="mis-aplicaciones.html" class="btn-accion">👥 Ver candidato${vacantes > 1 ? 's' : ''}</a>
            `;
        case 'completada':
            return `
                <button class="btn-accion" onclick="reutilizarOferta('${id}')">🔄 Reutilizar</button>
            `;
        case 'caducada':
            return `
                <button class="btn-accion btn-accion-primary" onclick="renovarOferta('${id}')">🔄 Renovar</button>
                <button class="btn-accion btn-accion-danger" onclick="eliminarOferta('${id}', '${tituloEscapado}')">🗑️</button>
            `;
        default:
            return '';
    }
}

// ============================================
// ACCIONES
// ============================================

window.editarOferta = function(id) {
    window.location.href = `/publicar-oferta.html?id=${id}`;
};

window.eliminarOferta = function(id, titulo) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
            <h3 style="margin-bottom: 0.5rem;">¿Eliminar oferta?</h3>
            <p style="color: var(--gray-600); margin-bottom: 1.5rem;">
                "${titulo}"<br>
                <small>Esta accion no se puede deshacer.</small>
            </p>
            <div style="display: flex; gap: 0.75rem;">
                <button class="btn btn-secondary" onclick="cerrarModal()" style="flex: 1;">Cancelar</button>
                <button class="btn btn-danger" onclick="confirmarEliminar('${id}')" style="flex: 1;">Eliminar</button>
            </div>
        </div>
    `;
    document.getElementById('modal-overlay').classList.add('active');
};

window.confirmarEliminar = async function(id) {
    try {
        await deleteDoc(doc(db, 'ofertas', id));

        // Eliminar aplicaciones relacionadas
        const appsQuery = query(collection(db, 'aplicaciones'), where('ofertaId', '==', id));
        const appsSnap = await getDocs(appsQuery);
        for (const docSnap of appsSnap.docs) {
            await deleteDoc(docSnap.ref);
        }

        toastSuccess('Oferta eliminada');
        cerrarModal();
        await cargarOfertas();
    } catch (error) {
        console.error('Error eliminando:', error);
        toastError('Error al eliminar');
    }
};

window.renovarOferta = async function(id) {
    try {
        const nuevaExpiracion = new Date();
        nuevaExpiracion.setDate(nuevaExpiracion.getDate() + 14);

        await updateDoc(doc(db, 'ofertas', id), {
            estado: 'activa',
            fechaExpiracion: Timestamp.fromDate(nuevaExpiracion),
            fechaActualizacion: serverTimestamp(),
            aceptadosCount: 0,
            trabajadoresAceptados: []
        });

        toastSuccess('Oferta renovada por 14 dias');
        await cargarOfertas();
    } catch (error) {
        console.error('Error renovando:', error);
        toastError('Error al renovar');
    }
};

window.reutilizarOferta = function(id) {
    // Redirigir a publicar con datos precargados (modo edicion crea copia)
    window.location.href = `publicar-oferta.html?reutilizar=${id}`;
};

// ============================================
// FILTROS
// ============================================
document.getElementById('filtro-estado').addEventListener('change', (e) => {
    const filtro = e.target.value;
    const ahora = new Date();

    if (!filtro) {
        renderizarOfertas(todasLasOfertas);
        return;
    }

    const filtradas = todasLasOfertas.filter(oferta => {
        let estadoReal = oferta.estado || 'activa';
        if (estadoReal === 'activa' && oferta.fechaExpiracion) {
            const fechaExp = oferta.fechaExpiracion.toDate ?
                oferta.fechaExpiracion.toDate() : new Date(oferta.fechaExpiracion);
            if (fechaExp < ahora) {
                estadoReal = 'caducada';
            }
        }
        return estadoReal === filtro;
    });

    renderizarOfertas(filtradas);
});

// ============================================
// HELPERS UI
// ============================================
function ocultarLoading() {
    document.getElementById('loading-state').style.display = 'none';
}

function mostrarEmptyState() {
    document.getElementById('ofertas-list').style.display = 'none';
    document.getElementById('empty-state').style.display = 'block';
}

window.cerrarModal = function() {
    document.getElementById('modal-overlay').classList.remove('active');
};

window.clickFueraModal = function(e) {
    if (e.target.id === 'modal-overlay') {
        cerrarModal();
    }
};
