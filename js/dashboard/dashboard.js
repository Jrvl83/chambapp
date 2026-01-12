// ========================================
// DASHBOARD.JS - OPTIMIZADO UX/UI
// ChambApp - Debounce + Loading States
// ========================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, doc, getDoc, deleteDoc, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let todasLasOfertas = [];
let aplicacionesUsuario = []; // IDs de ofertas donde ya aplicó

// 🔴 MEJORA #4: Debounce para filtros
let debounceTimer;

// ========================================
// VERIFICAR AUTENTICACIÓN
// ========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        
        if (userDoc.exists()) {
            const usuario = userDoc.data();
            document.getElementById('user-name').textContent = '👤 Bienvenido, ' + usuario.nombre;
            personalizarPorTipo(usuario.tipo || 'trabajador');
            
            // Cargar aplicaciones del usuario primero
            await cargarAplicacionesUsuario(user.uid);
            
            // Luego cargar ofertas
            await cargarOfertas(usuario, user.uid);
            await cargarEstadisticas(usuario, user.uid);        
            
            // 🔴 MEJORA #2: Ocultar loading, mostrar contenido
            ocultarLoading();
        } else {
            alert('Error al cargar perfil');
            window.location.href = 'login.html';
        }
    } else {
        alert('Debes iniciar sesión');
        window.location.href = 'login.html';
    }
});

// ========================================
// 🔴 MEJORA #2: SKELETON LOADING
// ========================================
function mostrarSkeleton() {
    const ofertasGrid = document.querySelector('.ofertas-grid');
    ofertasGrid.innerHTML = `
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
    `;
}

function ocultarLoading() {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'block';
}

// ========================================
// CARGAR APLICACIONES DEL USUARIO
// ========================================
async function cargarAplicacionesUsuario(userId) {
    try {
        const q = query(
            collection(db, 'aplicaciones'),
            where('aplicanteId', '==', userId)
        );
        const snapshot = await getDocs(q);
        aplicacionesUsuario = snapshot.docs.map(doc => doc.data().ofertaId);
    } catch (error) {
        console.error('Error al cargar aplicaciones:', error);
    }
}

// ========================================
// 🔴 FIX: PERSONALIZAR POR TIPO (CON LINK PERFIL DINÁMICO)
// ========================================
function personalizarPorTipo(tipo) {
    const logo = document.getElementById('logo-text');
    const tituloOfertas = document.getElementById('titulo-ofertas');
    const navBuscarText = document.getElementById('nav-buscar-text');
    const navPublicar = document.getElementById('nav-publicar');
    const navPublicarText = document.getElementById('nav-publicar-text');
    const navTrabajadores = document.getElementById('nav-trabajadores');
    const navTrabajadoresText = document.getElementById('nav-trabajadores-text');
    
    // 🔴 FIX: Link dinámico a perfil según tipo de usuario
    const navPerfil = document.getElementById('nav-perfil');
    
    if (tipo === 'trabajador') {
        logo.innerHTML = 'ChambApp <span class="badge badge-trabajador">👷 Trabajador</span>';
        tituloOfertas.textContent = '💼 Ofertas de Trabajo para Ti';
        navBuscarText.textContent = 'Buscar Chambas';
        navPublicarText.textContent = 'Mi Perfil';
        navPublicar.href = 'perfil-trabajador.html';
        navTrabajadoresText.textContent = 'Mis Aplicaciones';
        navTrabajadores.href = 'mis-aplicaciones-trabajador.html';
        
        // 🔴 Link a perfil trabajador
        navPerfil.href = 'perfil-trabajador.html';
        
    } else {
        logo.innerHTML = 'ChambApp <span class="badge badge-empleador">💼 Empleador</span>';
        tituloOfertas.textContent = '💼 Mis Ofertas Publicadas';
        navBuscarText.textContent = 'Buscar Trabajadores';
        navPublicarText.textContent = 'Publicar Oferta';
        navPublicar.href = 'publicar-oferta.html';
        navTrabajadoresText.textContent = 'Mis Aplicaciones';
        navTrabajadores.href = 'mis-aplicaciones.html';
        
        // 🔴 Link a perfil empleador
        navPerfil.href = 'perfil-empleador.html';
    }
}

// ========================================
// CARGAR OFERTAS
// ========================================
async function cargarOfertas(usuario, userUid) {
    try {
        mostrarSkeleton();
        
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
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const ofertasGrid = document.querySelector('.ofertas-grid');
            ofertasGrid.innerHTML = '';
            
            todasLasOfertas = [];
            querySnapshot.forEach((docSnap) => {
                const oferta = docSnap.data();
                todasLasOfertas.push({ id: docSnap.id, data: oferta });
                const ofertaCard = crearOfertaCard(oferta, docSnap.id, usuario);
                ofertasGrid.innerHTML += ofertaCard;
            });
            
            actualizarContador(todasLasOfertas.length);
        } else {
            mostrarEmptyState(usuario);
        }
    } catch (error) {
        console.error('Error al cargar ofertas:', error);
        mostrarError(error);
    }
}

// ========================================
// EMPTY STATES
// ========================================
function mostrarEmptyState(usuario) {
    const ofertasGrid = document.querySelector('.ofertas-grid');
    
    if (usuario && usuario.tipo === 'empleador') {
        ofertasGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>No has publicado ofertas aún</h3>
                <p>Comienza publicando tu primera oferta de trabajo</p>
                <a href="publicar-oferta.html" class="btn btn-primary">➕ Publicar Oferta</a>
            </div>
        `;
    } else {
        ofertasGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>No hay ofertas disponibles</h3>
                <p>Vuelve pronto, se publican nuevas ofertas todos los días</p>
            </div>
        `;
    }
}

function mostrarError(error) {
    const ofertasGrid = document.querySelector('.ofertas-grid');
    ofertasGrid.innerHTML = `
        <div class="empty-state" style="background: #fee;">
            <div class="empty-state-icon">❌</div>
            <h3>Error al cargar ofertas</h3>
            <p>${error.message}</p>
        </div>
    `;
}

// ========================================
// CARGAR ESTADÍSTICAS
// ========================================
async function cargarEstadisticas(usuario, userUid) {
    try {
        if (usuario.tipo === 'empleador') {
            const aplicacionesQuery = query(
                collection(db, 'aplicaciones'),
                where('empleadorId', '==', userUid)
            );
            const aplicacionesSnapshot = await getDocs(aplicacionesQuery);
            const totalAplicantes = aplicacionesSnapshot.size;
            
            const ofertasQuery = query(
                collection(db, 'ofertas'),
                where('empleadorId', '==', userUid),
                where('estado', '==', 'activa')
            );
            const ofertasSnapshot = await getDocs(ofertasQuery);
            const ofertasActivas = ofertasSnapshot.size;
            
            document.getElementById('stat-icon-1').textContent = '👥';
            document.getElementById('stat-number-1').textContent = totalAplicantes;
            document.getElementById('stat-label-1').textContent = 'Aplicantes Totales';
            
            document.getElementById('stat-icon-2').textContent = '💼';
            document.getElementById('stat-number-2').textContent = ofertasActivas;
            document.getElementById('stat-label-2').textContent = 'Ofertas Activas';
            
            document.getElementById('stat-icon-3').textContent = '✅';
            document.getElementById('stat-number-3').textContent = 0;
            document.getElementById('stat-label-3').textContent = 'Contrataciones';
            
        } else {
            const misAplicacionesQuery = query(
                collection(db, 'aplicaciones'),
                where('aplicanteId', '==', userUid)
            );
            const misAplicacionesSnapshot = await getDocs(misAplicacionesQuery);
            const totalAplicaciones = misAplicacionesSnapshot.size;
            
            document.getElementById('stat-icon-1').textContent = '📋';
            document.getElementById('stat-number-1').textContent = totalAplicaciones;
            document.getElementById('stat-label-1').textContent = 'Mis Aplicaciones';
            
            document.getElementById('stat-icon-2').textContent = '✅';
            document.getElementById('stat-number-2').textContent = 0;
            document.getElementById('stat-label-2').textContent = 'Aceptadas';
            
            document.getElementById('stat-icon-3').textContent = '⭐';
            document.getElementById('stat-number-3').textContent = 'N/A';
            document.getElementById('stat-label-3').textContent = 'Calificación';
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// ========================================
// FORMATEAR FECHA
// ========================================
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
        return 'Reciente';
    }
}

// ========================================
// CREAR OFERTA CARD
// ========================================
function crearOfertaCard(oferta, id, usuario) {
    const categoriaClass = oferta.categoria || 'otros';
    let categoriaLabel = 'Otros';
    if (oferta.categoria) {
        categoriaLabel = oferta.categoria.charAt(0).toUpperCase() + oferta.categoria.slice(1);
    }
    
    const fecha = oferta.fechaActualizacion 
        ? formatearFecha(oferta.fechaActualizacion) 
        : formatearFecha(oferta.fechaCreacion);
    
    const esEmpleadorDueño = usuario && usuario.tipo === 'empleador' && usuario.email === oferta.empleadorEmail;
    
    // 🔴 MEJORA: Badge "Aplicado"
    const yaAplico = aplicacionesUsuario.includes(id);
    const badgeAplicado = yaAplico ? '<div class="oferta-badge">✅ Aplicado</div>' : '';
    
    let botonesFooter = '';
    
    if (esEmpleadorDueño) {
        botonesFooter = `
            <button class="btn btn-primary btn-ver-detalle" onclick="verDetalleOferta('${id}')">👁️ Ver Aplicantes</button>
            <button class="btn btn-warning" onclick="editarOferta('${id}')">✏️ Editar</button>
            <button class="btn btn-danger" onclick="eliminarOferta('${id}')">🗑️ Eliminar</button>
        `;
    } else {
        botonesFooter = `
            <button class="btn btn-primary btn-ver-detalle" onclick="verDetalleOferta('${id}')">Ver Detalles</button>
            <button class="btn btn-secondary btn-contactar" onclick="contactarOferta('${id}')" ${yaAplico ? 'disabled' : ''}>
                ${yaAplico ? '✅ Ya Aplicaste' : 'Contactar'}
            </button>
        `;
    }
    
    return `
        <div class="oferta-card">
            ${badgeAplicado}
            <div class="oferta-header">
                <div class="oferta-categoria ${categoriaClass}">${categoriaLabel}</div>
                <div class="oferta-fecha">${fecha}</div>
            </div>
            <h3 class="oferta-titulo">${oferta.titulo}</h3>
            <p class="oferta-descripcion">${oferta.descripcion}</p>
            <div class="oferta-detalles">
                <span class="detalle">📍 ${oferta.ubicacion}</span>
                <span class="detalle">💰 ${oferta.salario}</span>
            </div>
            <div class="oferta-footer">
                ${botonesFooter}
            </div>
        </div>
    `;
}

// ========================================
// 🔴 MEJORA #4: FILTROS CON DEBOUNCE
// ========================================
function aplicarFiltros() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        ejecutarFiltros();
    }, 300); // 300ms delay
}

function ejecutarFiltros() {
    const busqueda = document.getElementById('filtro-busqueda').value.toLowerCase();
    const categoria = document.getElementById('filtro-categoria').value;
    const ubicacion = document.getElementById('filtro-ubicacion').value.toLowerCase();

    const ofertasFiltradas = todasLasOfertas.filter(item => {
        const oferta = item.data;
        
        const coincideBusqueda = !busqueda || 
            (oferta.titulo && oferta.titulo.toLowerCase().includes(busqueda)) || 
            (oferta.descripcion && oferta.descripcion.toLowerCase().includes(busqueda));

        const coincideCategoria = !categoria || oferta.categoria === categoria;

        const coincideUbicacion = !ubicacion || 
            (oferta.ubicacion && oferta.ubicacion.toLowerCase().includes(ubicacion));

        return coincideBusqueda && coincideCategoria && coincideUbicacion;
    });

    mostrarOfertasFiltradas(ofertasFiltradas);
    actualizarContador(ofertasFiltradas.length);
}

function mostrarOfertasFiltradas(ofertas) {
    const ofertasGrid = document.querySelector('.ofertas-grid');
    ofertasGrid.innerHTML = '';
    
    const usuarioStr = localStorage.getItem('usuarioChambApp');
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

    if (ofertas.length === 0) {
        ofertasGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>No se encontraron ofertas</h3>
                <p>Intenta con otros filtros o búsqueda</p>
            </div>
        `;
        return;
    }

    ofertas.forEach(oferta => {
        const ofertaCard = crearOfertaCard(oferta.data, oferta.id, usuario);
        ofertasGrid.innerHTML += ofertaCard;
    });
}

function actualizarContador(cantidad) {
    const contador = document.getElementById('resultados-count');
    if (cantidad === 0) {
        contador.textContent = 'No se encontraron ofertas';
        contador.style.background = '#fee2e2';
        contador.style.color = '#991b1b';
    } else if (cantidad === todasLasOfertas.length) {
        contador.textContent = `Mostrando todas las ofertas (${cantidad})`;
        contador.style.background = '#f1f5f9';
        contador.style.color = '#64748b';
    } else {
        contador.textContent = `Mostrando ${cantidad} de ${todasLasOfertas.length} ofertas`;
        contador.style.background = '#dbeafe';
        contador.style.color = '#1e40af';
    }
}

function limpiarFiltros() {
    document.getElementById('filtro-busqueda').value = '';
    document.getElementById('filtro-categoria').value = '';
    document.getElementById('filtro-ubicacion').value = '';
    
    mostrarOfertasFiltradas(todasLasOfertas);
    actualizarContador(todasLasOfertas.length);
}

// ========================================
// VER DETALLE OFERTA
// ========================================
async function verDetalleOferta(id) {
    try {
        const usuarioStr = localStorage.getItem('usuarioChambApp');
        const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
        
        const docRef = doc(db, 'ofertas', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const oferta = docSnap.data();
            const esEmpleadorDueño = usuario && usuario.tipo === 'empleador' && usuario.email === oferta.empleadorEmail;
            
            if (esEmpleadorDueño) {
                await mostrarDetallesParaEmpleador(oferta, id);
            } else {
                mostrarDetallesNormales(oferta, id);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function mostrarDetallesParaEmpleador(oferta, ofertaId) {
    const aplicacionesQuery = query(
        collection(db, 'aplicaciones'),
        where('ofertaId', '==', ofertaId)
    );
    
    const aplicacionesSnapshot = await getDocs(aplicacionesQuery);
    
    let aplicantesHTML = '';
    
    if (aplicacionesSnapshot.empty) {
        aplicantesHTML = '<p style="text-align: center; color: #94a3b8; padding: 2rem;">📭 Aún no hay aplicantes</p>';
    } else {
        aplicantesHTML = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
        aplicacionesSnapshot.forEach((doc) => {
            const aplicacion = doc.data();
            aplicantesHTML += `
                <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; border-left: 3px solid #3b82f6;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>👤 ${aplicacion.aplicanteNombre}</strong>
                        <span style="background: #fef3c7; color: #92400e; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">PENDIENTE</span>
                    </div>
                    <div style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem;">
                        📧 ${aplicacion.aplicanteEmail}<br>
                        📱 ${aplicacion.aplicanteTelefono}
                    </div>
                    <div style="background: white; padding: 0.75rem; border-radius: 6px; margin-top: 0.5rem;">
                        <strong style="font-size: 0.875rem; color: #3b82f6;">💬 Mensaje:</strong><br>
                        <span>${aplicacion.mensaje}</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                        <a href="tel:${aplicacion.aplicanteTelefono}" class="btn btn-primary btn-small">📞 Llamar</a>
                        <a href="mailto:${aplicacion.aplicanteEmail}" class="btn btn-secondary btn-small">📧 Email</a>
                    </div>
                </div>
            `;
        });
        aplicantesHTML += '</div>';
    }
    
    const modalHTML = `
        <div class="modal-header">
            <h2>${oferta.titulo}</h2>
        </div>
        <div class="modal-text">
            <h3>📝 Descripción</h3>
            <p>${oferta.descripcion}</p>
            
            <h3>👥 Aplicantes (${aplicacionesSnapshot.size})</h3>
            ${aplicantesHTML}
        </div>
        <div class="modal-buttons">
            <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
        </div>
    `;
    
    mostrarModal(modalHTML);
}

function mostrarDetallesNormales(oferta, id) {
    const yaAplico = aplicacionesUsuario.includes(id);
    const btnContactar = yaAplico 
        ? '<button class="btn btn-secondary" disabled>✅ Ya Aplicaste</button>'
        : `<button class="btn btn-primary" onclick="contactarOferta('${id}')">💬 Contactar</button>`;
    
    const modalHTML = `
        <div class="modal-header">
            <h2>${oferta.titulo}</h2>
        </div>
        <div class="modal-text">
            <h3>📝 Descripción</h3>
            <p>${oferta.descripcion}</p>
            
            <h3>📍 Detalles</h3>
            <p>📍 ${oferta.ubicacion}<br>
            💰 ${oferta.salario}<br>
            ⏱️ ${oferta.duracion}<br>
            🕐 ${oferta.horario}</p>
        </div>
        <div class="modal-buttons">
            <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
            ${btnContactar}
        </div>
    `;
    
    mostrarModal(modalHTML);
}

// ========================================
// CONTACTAR OFERTA
// ========================================
async function contactarOferta(id) {
    try {
        const docRef = doc(db, 'ofertas', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const oferta = docSnap.data();
            const usuarioStr = localStorage.getItem('usuarioChambApp');
            const usuario = usuarioStr ? JSON.parse(usuarioStr) : { nombre: '', telefono: '' };
            
            const modalHTML = `
                <div class="modal-header">
                    <h2>💬 Contactar Empleador</h2>
                </div>
                <div class="modal-text">
                    <p>Envía un mensaje sobre: <strong>${oferta.titulo}</strong></p>
                    
                    <form class="modal-form" id="formContacto">
                        <label>Tu Nombre:</label>
                        <input type="text" id="contacto-nombre" value="${usuario.nombre}" required>
                        
                        <label>Tu Teléfono:</label>
                        <input type="tel" id="contacto-telefono" value="${usuario.telefono || ''}" required>
                        
                        <label>Mensaje:</label>
                        <textarea id="contacto-mensaje" required></textarea>
                    </form>
                </div>
                <div class="modal-buttons">
                    <button class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="enviarMensajeContacto('${id}')">📤 Enviar</button>
                </div>
            `;
            
            mostrarModal(modalHTML);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// ========================================
// 🔴 MEJORA #5: LOADING STATE AL ENVIAR
// ========================================
async function enviarMensajeContacto(ofertaId) {
    const nombre = document.getElementById('contacto-nombre').value;
    const telefono = document.getElementById('contacto-telefono').value;
    const mensaje = document.getElementById('contacto-mensaje').value;
    
    if (!nombre || !telefono || !mensaje) {
        alert('Completa todos los campos');
        return;
    }
    
    // 🔴 MEJORA: Loading state
    const btnEnviar = event.target;
    btnEnviar.disabled = true;
    btnEnviar.classList.add('loading');
    const textoOriginal = btnEnviar.textContent;
    btnEnviar.textContent = 'Enviando...';
    
    try {
        const usuarioStr = localStorage.getItem('usuarioChambApp');
        const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
        
        const ofertaRef = doc(db, 'ofertas', ofertaId);
        const ofertaSnap = await getDoc(ofertaRef);
        
        if (!ofertaSnap.exists()) {
            alert('Error: Oferta no encontrada');
            return;
        }
        
        const oferta = ofertaSnap.data();
        
        // Verificar duplicados
        const q = query(
            collection(db, 'aplicaciones'),
            where('ofertaId', '==', ofertaId),
            where('aplicanteEmail', '==', usuario.email)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            mostrarModal(`
                <div class="modal-header">
                    <h2>⚠️ Ya Aplicaste</h2>
                </div>
                <div class="modal-text">
                    <p>Ya aplicaste a esta oferta anteriormente.</p>
                </div>
                <div class="modal-buttons">
                    <button class="btn btn-primary" onclick="cerrarModal()">Entendido</button>
                </div>
            `);
            return;
        }
        
        // Guardar aplicación
        await addDoc(collection(db, 'aplicaciones'), {
            ofertaId: ofertaId,
            ofertaTitulo: oferta.titulo,
            ofertaCategoria: oferta.categoria,
            empleadorId: oferta.empleadorId,
            empleadorNombre: oferta.empleadorNombre,
            empleadorEmail: oferta.empleadorEmail,
            aplicanteId: auth.currentUser?.uid || 'demo',
            aplicanteNombre: nombre,
            aplicanteTelefono: telefono,
            aplicanteEmail: usuario.email,
            aplicanteTipo: usuario.tipo,
            mensaje: mensaje,
            estado: 'pendiente',
            fechaAplicacion: serverTimestamp()
        });
        
        // Actualizar lista local
        aplicacionesUsuario.push(ofertaId);
        
        mostrarModal(`
            <div class="modal-header success">
                <h2>✅ ¡Aplicación Enviada!</h2>
            </div>
            <div class="modal-text">
                <p>Tu aplicación fue enviada exitosamente.</p>
                <p>El empleador te contactará al: <strong>${telefono}</strong></p>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-primary" onclick="location.reload()">Aceptar</button>
            </div>
        `);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar: ' + error.message);
    } finally {
        // Restaurar botón
        btnEnviar.disabled = false;
        btnEnviar.classList.remove('loading');
        btnEnviar.textContent = textoOriginal;
    }
}

// ========================================
// 🔴 MEJORA #5: ELIMINAR CON LOADING
// ========================================
async function eliminarOferta(id) {
    const modalHTML = `
        <div class="modal-header" style="background: #fee2e2;">
            <h2>⚠️ Eliminar Oferta</h2>
        </div>
        <div class="modal-text">
            <p>¿Seguro que deseas eliminar esta oferta?</p>
        </div>
        <div class="modal-buttons">
            <button class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
            <button class="btn btn-danger" onclick="confirmarEliminarOferta('${id}')">🗑️ Eliminar</button>
        </div>
    `;
    
    mostrarModal(modalHTML);
}

async function confirmarEliminarOferta(id) {
    // 🔴 MEJORA: Loading state
    const btnEliminar = event.target;
    btnEliminar.disabled = true;
    btnEliminar.classList.add('loading');
    btnEliminar.textContent = 'Eliminando...';
    
    try {
        // Eliminar aplicaciones
        const q = query(collection(db, 'aplicaciones'), where('ofertaId', '==', id));
        const snapshot = await getDocs(q);
        
        const deletePromises = [];
        snapshot.forEach((docSnap) => {
            deletePromises.push(deleteDoc(doc(db, 'aplicaciones', docSnap.id)));
        });
        
        await Promise.all(deletePromises);
        await deleteDoc(doc(db, 'ofertas', id));
        
        mostrarModal(`
            <div class="modal-header success">
                <h2>✅ Eliminada</h2>
            </div>
            <div class="modal-text">
                <p>La oferta fue eliminada exitosamente.</p>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-primary" onclick="location.reload()">Aceptar</button>
            </div>
        `);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}

function editarOferta(id) {
    window.location.href = `publicar-oferta.html?id=${id}`;
}

// ========================================
// MODAL
// ========================================
function cerrarModal() {
    const modal = document.getElementById('modal-overlay');
    modal.classList.remove('active');
    
    // 🔴 MEJORA: Esperar animación antes de ocultar
    setTimeout(() => {
        document.body.style.overflow = 'auto';
    }, 300);
}

function mostrarModal(html) {
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function clickFueraModal(e) {
    if (e.target.id === 'modal-overlay') cerrarModal();
}

// ========================================
// CERRAR SESIÓN
// ========================================
function cerrarSesion() {
    mostrarModal(`
        <div class="modal-header">
            <h2>⚠️ Cerrar Sesión</h2>
        </div>
        <div class="modal-text">
            <p>¿Estás seguro?</p>
        </div>
        <div class="modal-buttons">
            <button class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="confirmarSalir()">Sí, Salir</button>
        </div>
    `);
}

function confirmarSalir() {
    localStorage.removeItem('usuarioChambApp');
    window.location.href = 'index.html';
}

// ========================================
// MENÚ HAMBURGUESA
// ========================================
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    if (sidebar.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

// ========================================
// EXPONER FUNCIONES GLOBALES
// ========================================
window.verDetalleOferta = verDetalleOferta;
window.contactarOferta = contactarOferta;
window.enviarMensajeContacto = enviarMensajeContacto;
window.cerrarModal = cerrarModal;
window.clickFueraModal = clickFueraModal;
window.mostrarModal = mostrarModal;
window.cerrarSesion = cerrarSesion;
window.confirmarSalir = confirmarSalir;
window.aplicarFiltros = aplicarFiltros;
window.limpiarFiltros = limpiarFiltros;
window.editarOferta = editarOferta;
window.eliminarOferta = eliminarOferta;
window.confirmarEliminarOferta = confirmarEliminarOferta;
window.toggleMenu = toggleMenu;

// Cerrar modal con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
});
// ========================================
// SISTEMA DE UBICACIÓN
// ========================================
import { 
    tieneUbicacionGuardada, 
    solicitarYGuardarUbicacion,
    formatearUbicacion,
    obtenerUbicacionGuardada
} from '../utils/geolocation.js';

// Verificar ubicación al cargar dashboard
async function verificarUbicacion() {
    try {
        const tieneUbicacion = await tieneUbicacionGuardada();
        
        if (!tieneUbicacion) {
            // Esperar 2 segundos después de cargar dashboard
            setTimeout(() => {
                mostrarModalUbicacion();
            }, 2000);
        } else {
            // Mostrar ubicación actual en UI
            const ubicacion = await obtenerUbicacionGuardada();
            mostrarUbicacionEnUI(ubicacion);
        }
    } catch (error) {
        console.error('Error al verificar ubicación:', error);
    }
}

function mostrarModalUbicacion() {
    const modal = document.getElementById('modal-ubicacion');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function cerrarModalUbicacion() {
    const modal = document.getElementById('modal-ubicacion');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

async function solicitarUbicacion() {
    try {
        const modal = document.getElementById('modal-ubicacion');
        const btnPermitir = event.target;
        
        // Loading state
        btnPermitir.disabled = true;
        btnPermitir.classList.add('btn-loading');
        const textoOriginal = btnPermitir.textContent;
        btnPermitir.textContent = 'Obteniendo ubicación...';
        
        // Solicitar y guardar ubicación
        const resultado = await solicitarYGuardarUbicacion();
        
        if (resultado.success) {
            // Éxito
            cerrarModalUbicacion();
            
            // Mostrar toast de éxito
            if (typeof mostrarToast === 'function') {
                mostrarToast('✅ Ubicación guardada correctamente', 'success');
            }
            
            // Actualizar UI
            mostrarUbicacionEnUI(resultado);
            
            // Recargar ofertas ordenadas por distancia (futuro)
            // await cargarOfertasConDistancia();
            
        } else {
            // Error
            throw new Error(resultado.error || 'No se pudo obtener ubicación');
        }
        
    } catch (error) {
        console.error('Error al solicitar ubicación:', error);
        
        // Mostrar error amigable
        const modal = document.getElementById('modal-ubicacion');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <div class="modal-header" style="text-align: center;">
                <div style="font-size: 4rem; margin-bottom: var(--space-md);">⚠️</div>
                <h2>No se pudo obtener ubicación</h2>
            </div>

            <div class="alert alert-danger" style="margin-top: var(--space-lg);">
                <div class="alert-icon">❌</div>
                <div class="alert-content">
                    <div class="alert-message">
                        ${error.message}
                    </div>
                </div>
            </div>

            <div class="alert alert-info" style="margin-top: var(--space-md);">
                <div class="alert-icon">💡</div>
                <div class="alert-content">
                    <div class="alert-title">¿Cómo activar la ubicación?</div>
                    <div class="alert-message">
                        <ol style="margin: var(--space-sm) 0; padding-left: var(--space-lg); line-height: var(--leading-relaxed);">
                            <li>Ve a la configuración de tu navegador</li>
                            <li>Busca "Permisos" o "Ubicación"</li>
                            <li>Permite el acceso a ChambApp</li>
                            <li>Recarga esta página</li>
                        </ol>
                    </div>
                </div>
            </div>

            <div class="modal-footer" style="margin-top: var(--space-xl);">
                <button class="btn btn-primary btn-block" onclick="cerrarModalUbicacion()">
                    Entendido
                </button>
            </div>
        `;
    }
}

function mostrarUbicacionEnUI(ubicacion) {
    // TODO: Crear elemento en header para mostrar ubicación
    // Por ahora solo log
    console.log('📍 Ubicación actual:', formatearUbicacion(ubicacion));
}

// Exponer funciones globales
window.cerrarModalUbicacion = cerrarModalUbicacion;
window.solicitarUbicacion = solicitarUbicacion;

// Llamar verificación después de cargar dashboard
// (agregar esto al final del onAuthStateChanged existente)
