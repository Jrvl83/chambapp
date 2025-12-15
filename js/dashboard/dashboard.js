// Inicializar al cargar
// ========================================
// IMPORTACIONES Y CONFIGURACIÓN DE FIREBASE
// ========================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variable global para almacenar todas las ofertas (para filtrado)
let todasLasOfertas = [];

// ========================================
// VERIFICAR AUTENTICACIÓN AL CARGAR PÁGINA
// ========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('✅ Usuario autenticado:', user.uid);
        console.log('📧 Email:', user.email);
        
        // Obtener datos del usuario desde Firestore
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        
        if (userDoc.exists()) {
    const usuario = userDoc.data();
    console.log('👤 Datos de usuario:', usuario);
    
    // Actualizar UI
    document.getElementById('user-name').textContent = '👤 Bienvenido, ' + usuario.nombre;
    personalizarPorTipo(usuario.tipo || 'trabajador');
    
    // Cargar ofertas
    await cargarOfertas(usuario, user.uid);
    
    // Ocultar pantalla de carga y mostrar contenido real
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'block';
    console.log('✅ Dashboard cargado completamente');
        } else {
            console.error('❌ No se encontraron datos del usuario en Firestore');
            alert('Error al cargar perfil');
            window.location.href = 'login.html';
        }
    } else {
        console.log('❌ No hay usuario autenticado');
        alert('Debes iniciar sesión');
        window.location.href = 'login.html';
    }
});

// ========================================
// PERSONALIZAR INTERFAZ POR TIPO DE USUARIO
// ========================================

        function personalizarPorTipo(tipo) {
            var logo = document.getElementById('logo-text');
            var tituloOfertas = document.getElementById('titulo-ofertas');
            var navBuscarText = document.getElementById('nav-buscar-text');
            var navPublicarText = document.getElementById('nav-publicar-text');
            
            if (tipo === 'trabajador') {
                logo.innerHTML = 'ChambApp <span class="badge badge-trabajador">👷 Trabajador</span>';
                tituloOfertas.textContent = '💼 Ofertas de Trabajo para Ti';
                navBuscarText.textContent = 'Buscar Chambas';
                navPublicarText.textContent = 'Mi Perfil';
                
                var botonesVer = document.querySelectorAll('.btn-ver-detalle');
                var botonesContactar = document.querySelectorAll('.btn-contactar');
                
                for (var i = 0; i < botonesVer.length; i++) {
                    botonesVer[i].textContent = '👁️ Ver Oferta';
                }
                for (var i = 0; i < botonesContactar.length; i++) {
                    botonesContactar[i].textContent = '✅ Aplicar';
                }
            } else {
                logo.innerHTML = 'ChambApp <span class="badge badge-empleador">💼 Empleador</span>';
                tituloOfertas.textContent = '💼 Mis Ofertas Publicadas';
                navBuscarText.textContent = 'Buscar Trabajadores';
                navPublicarText.textContent = 'Publicar Oferta';
                document.getElementById('nav-trabajadores-text').textContent = 'Mis Aplicaciones';
                
                var botonesVer = document.querySelectorAll('.btn-ver-detalle');
                var botonesContactar = document.querySelectorAll('.btn-contactar');
                
                for (var i = 0; i < botonesVer.length; i++) {
                    botonesVer[i].textContent = '📋 Ver Perfil';
                }
                for (var i = 0; i < botonesContactar.length; i++) {
                    botonesContactar[i].textContent = '📞 Contactar';
                }
            }
        }

async function cargarOfertas(usuario, userUid) {
    try {
        console.log('🔄 Cargando ofertas...');
        console.log('Usuario tipo:', usuario.tipo);
        console.log('Usuario email:', usuario.email);
        
        let q;
        
        // Si es empleador, mostrar solo sus ofertas
        if (usuario && usuario.tipo === 'empleador') {
            console.log('📋 Buscando ofertas del empleador:', usuario.email);
            q = query(
                collection(db, 'ofertas'), 
                where('empleadorEmail', '==', usuario.email)
            );
        } else {
            // Si es trabajador, mostrar todas las ofertas
            console.log('📋 Buscando todas las ofertas');
            q = query(
                collection(db, 'ofertas'),
                limit(20)
            );
        }
        
        const querySnapshot = await getDocs(q);
        console.log('📦 Ofertas encontradas:', querySnapshot.size);
        
        if (!querySnapshot.empty) {
            const ofertasGrid = document.querySelector('.ofertas-grid');
            ofertasGrid.innerHTML = ''; // Limpiar ofertas estáticas
            
            // Guardar ofertas para filtrado
            todasLasOfertas = [];
            querySnapshot.forEach((docSnap) => {
                const oferta = docSnap.data();
                console.log('Oferta:', docSnap.id, oferta.titulo, 'Empleador:', oferta.empleadorEmail);
                todasLasOfertas.push({ id: docSnap.id, data: oferta });
                const ofertaCard = crearOfertaCard(oferta, docSnap.id, usuario);
                ofertasGrid.innerHTML += ofertaCard;
            });
            
            // Actualizar contador inicial
            actualizarContador(todasLasOfertas.length);
        } else {
            console.log('📭 No se encontraron ofertas');
            const ofertasGrid = document.querySelector('.ofertas-grid');
            if (usuario && usuario.tipo === 'empleador') {
                ofertasGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: white; border-radius: 12px;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">📭</div>
                        <h3 style="color: #64748b; margin-bottom: 1rem;">No has publicado ofertas aún</h3>
                        <p style="color: #94a3b8; margin-bottom: 2rem;">Comienza publicando tu primera oferta de trabajo</p>
                        <a href="publicar-oferta.html" style="display: inline-block; padding: 0.875rem 1.5rem; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">➕ Publicar Oferta</a>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('❌ Error al cargar ofertas:', error);
        console.error('Código:', error.code);
        console.error('Mensaje:', error.message);
        
        const ofertasGrid = document.querySelector('.ofertas-grid');
        ofertasGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: #fee; border-radius: 12px; color: #c33;">
                <h3>❌ Error al cargar ofertas</h3>
                <p>${error.message}</p>
                <p style="font-size: 0.875rem; margin-top: 1rem;">Código: ${error.code}</p>
            </div>
        `;
    }
}

function crearOfertaCard(oferta, id, usuario) {
    // Asegurarse de que siempre haya una categoría
    const categoriaClass = oferta.categoria || 'otros';
    
    // Crear label con la primera letra mayúscula
    let categoriaLabel = 'Otros';
    if (oferta.categoria) {
        categoriaLabel = oferta.categoria.charAt(0).toUpperCase() + oferta.categoria.slice(1);
    }
    
    console.log('📋 Oferta:', oferta.titulo, '| Categoría:', oferta.categoria, '| Label:', categoriaLabel);
    
    const fecha = oferta.fechaCreacion ? 'Hace unas horas' : 'Reciente';
    
    // Verificar si el usuario actual es el dueño de la oferta
    const esEmpleadorDueño = usuario && usuario.tipo === 'empleador' && usuario.email === oferta.empleadorEmail;
    
    console.log('🔍 Card para oferta:', oferta.titulo, '| Usuario:', usuario?.email, '| Empleador oferta:', oferta.empleadorEmail, '| Es dueño:', esEmpleadorDueño);
    
    // Botones diferentes para empleador dueño vs otros usuarios
    let botonesFooter = '';
    
    if (esEmpleadorDueño) {
        // Botones para el empleador dueño de la oferta
        botonesFooter = `
            <button class="btn btn-primary btn-ver-detalle" onclick="verDetalleOferta('${id}')">👁️ Ver Aplicantes</button>
            <button class="btn btn-warning" onclick="editarOferta('${id}')" style="background: #f59e0b; border-color: #f59e0b;">✏️ Editar</button>
            <button class="btn btn-danger" onclick="eliminarOferta('${id}')" style="background: #ef4444; border-color: #ef4444;">🗑️ Eliminar</button>
        `;
    } else {
        // Botones normales para trabajadores
        botonesFooter = `
            <button class="btn btn-primary btn-ver-detalle" onclick="verDetalleOferta('${id}')">Ver Detalles</button>
            <button class="btn btn-secondary btn-contactar" onclick="contactarOferta('${id}')">Contactar</button>
        `;
    }
    
    return `
        <div class="oferta-card">
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

async function verDetalleOferta(id) {
            try {
                const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
                const { getFirestore, doc, getDoc, collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                
                const app = initializeApp(window.firebaseConfig);
                const db = getFirestore(app);
                
                // Obtener datos del usuario actual
                const usuarioStr = localStorage.getItem('usuarioChambApp');
                const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
                
                // Obtener la oferta específica
                const docRef = doc(db, 'ofertas', id);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const oferta = docSnap.data();
                    
                    // Verificar si el usuario es el dueño de la oferta
                    const esEmpleadorDueño = usuario && usuario.tipo === 'empleador' && usuario.email === oferta.empleadorEmail;
                    
                    if (esEmpleadorDueño) {
                        // Mostrar detalles + aplicantes para el empleador dueño
                        mostrarDetallesParaEmpleador(oferta, id, db);
                    } else {
                        // Mostrar detalles normales para trabajadores u otros
                        mostrarDetallesNormales(oferta, id);
                    }
                } else {
                    mostrarModal('<div class="modal-header"><h2>❌ Error</h2></div><div class="modal-text"><p>No se encontró la oferta.</p></div><div class="modal-buttons"><button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button></div>');
                }
            } catch (error) {
                console.error('Error al cargar detalles:', error);
                mostrarModal('<div class="modal-header"><h2>❌ Error</h2></div><div class="modal-text"><p>Error al cargar los detalles de la oferta.</p></div><div class="modal-buttons"><button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button></div>');
            }
        }

        async function mostrarDetallesParaEmpleador(oferta, ofertaId, db) {
            // Obtener aplicaciones a esta oferta
            const { query, where, getDocs, collection } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const aplicacionesQuery = query(
                collection(db, 'aplicaciones'),
                where('ofertaId', '==', ofertaId)
            );
            
            const aplicacionesSnapshot = await getDocs(aplicacionesQuery);
            
            let aplicantesHTML = '';
            
            if (aplicacionesSnapshot.empty) {
                aplicantesHTML = '<p style="text-align: center; color: #94a3b8; padding: 2rem;">📭 Aún no hay aplicantes para esta oferta</p>';
            } else {
                aplicantesHTML = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
                aplicacionesSnapshot.forEach((doc) => {
                    const aplicacion = doc.data();
                    aplicantesHTML += `
                        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; border-left: 3px solid #3b82f6;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                <strong style="color: #1e293b;">👤 ${aplicacion.aplicanteNombre}</strong>
                                <span style="background: #fef3c7; color: #92400e; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">PENDIENTE</span>
                            </div>
                            <div style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem;">
                                📧 ${aplicacion.aplicanteEmail}<br>
                                📱 ${aplicacion.aplicanteTelefono}
                            </div>
                            <div style="background: white; padding: 0.75rem; border-radius: 6px; margin-top: 0.5rem;">
                                <strong style="font-size: 0.875rem; color: #3b82f6;">💬 Mensaje:</strong><br>
                                <span style="color: #475569;">${aplicacion.mensaje}</span>
                            </div>
                            <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                                <a href="tel:${aplicacion.aplicanteTelefono}" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 0.875rem; font-weight: 600;">📞 Llamar</a>
                                <a href="mailto:${aplicacion.aplicanteEmail}" style="padding: 0.5rem 1rem; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-size: 0.875rem; font-weight: 600;">📧 Email</a>
                            </div>
                        </div>
                    `;
                });
                aplicantesHTML += '</div>';
            }
            
            const modalHTML = `
                <div class="modal-header">
                    <div style="text-align: center; width: 100%;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">💼</div>
                        <h2 style="margin: 0;">${oferta.titulo}</h2>
                        <div style="margin-top: 0.5rem;">
                            <span class="badge" style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem;">
                                ${oferta.categoria.charAt(0).toUpperCase() + oferta.categoria.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="modal-text">
                    <h3>📝 Descripción</h3>
                    <p style="line-height: 1.6; color: #64748b;">${oferta.descripcion}</p>
                    
                    <h3>📍 Detalles</h3>
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
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
                                ${oferta.duracion}
                            </div>
                            <div>
                                <strong>🕐 Horario:</strong><br>
                                ${oferta.horario}
                            </div>
                        </div>
                    </div>
                    
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
            const modalHTML = `
                <div class="modal-header">
                    <div style="text-align: center; width: 100%;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">💼</div>
                        <h2 style="margin: 0;">${oferta.titulo}</h2>
                        <div style="margin-top: 0.5rem;">
                            <span class="badge" style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem;">
                                ${oferta.categoria.charAt(0).toUpperCase() + oferta.categoria.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="modal-text">
                    <h3>📝 Descripción</h3>
                    <p style="line-height: 1.6; color: #64748b;">${oferta.descripcion}</p>
                    
                    <h3>📍 Detalles</h3>
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
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
                                ${oferta.duracion}
                            </div>
                            <div>
                                <strong>🕐 Horario:</strong><br>
                                ${oferta.horario}
                            </div>
                        </div>
                    </div>
                    
                    <h3>👤 Publicado por</h3>
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 8px;">
                        <strong>${oferta.empleadorNombre}</strong><br>
                        <span style="color: #64748b;">📧 ${oferta.empleadorEmail}</span>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
                    <button class="btn btn-primary" onclick="contactarOferta('${id}')">💬 Contactar</button>
                </div>
            `;
            
            mostrarModal(modalHTML);
        }

async function contactarOferta(id) {
            try {
                const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
                const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                
                const app = initializeApp(window.firebaseConfig);
                const db = getFirestore(app);
                
                const docRef = doc(db, 'ofertas', id);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const oferta = docSnap.data();
                    const usuarioStr = localStorage.getItem('usuarioChambApp');
                    const usuario = usuarioStr ? JSON.parse(usuarioStr) : { nombre: 'Usuario', telefono: '' };
                    
                    const modalHTML = `
                        <div class="modal-header">
                            <h2>💬 Contactar Empleador</h2>
                        </div>
                        <div class="modal-text">
                            <p>Envía un mensaje a <strong>${oferta.empleadorNombre}</strong> sobre la oferta:</p>
                            <p style="color: #3b82f6; font-weight: 600;">"${oferta.titulo}"</p>
                            
                            <form class="modal-form" id="formContacto">
                                <label>Tu Nombre:</label>
                                <input type="text" id="contacto-nombre" value="${usuario.nombre}" required>
                                
                                <label>Tu Teléfono:</label>
                                <input type="tel" id="contacto-telefono" value="${usuario.telefono || ''}" placeholder="999 999 999" required>
                                
                                <label>Mensaje:</label>
                                <textarea id="contacto-mensaje" rows="4" placeholder="Hola, estoy interesado en esta oferta..." required></textarea>
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

async function enviarMensajeContacto(ofertaId) {
            const nombre = document.getElementById('contacto-nombre').value;
            const telefono = document.getElementById('contacto-telefono').value;
            const mensaje = document.getElementById('contacto-mensaje').value;
            
            if (!nombre || !telefono || !mensaje) {
                alert('Por favor completa todos los campos');
                return;
            }
            
            try {
                const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
                const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
                const { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                
                const app = initializeApp(window.firebaseConfig);
                const auth = getAuth(app);
                const db = getFirestore(app);
                
                // Obtener datos del usuario y la oferta
                const usuarioStr = localStorage.getItem('usuarioChambApp');
                const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
                
                const ofertaRef = doc(db, 'ofertas', ofertaId);
                const ofertaSnap = await getDoc(ofertaRef);
                
                if (!ofertaSnap.exists()) {
                    alert('Error: No se encontró la oferta');
                    return;
                }
                
                const oferta = ofertaSnap.data();
                
                // Verificar si ya aplicó antes
                const aplicacionesRef = collection(db, 'aplicaciones');
                const q = query(
                    aplicacionesRef, 
                    where('ofertaId', '==', ofertaId),
                    where('aplicanteEmail', '==', usuario.email)
                );
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    mostrarModal(`
                        <div class="modal-header" style="background: #fef3c7;">
                            <h2>⚠️ Ya Aplicaste</h2>
                        </div>
                        <div class="modal-text">
                            <p>Ya has aplicado anteriormente a esta oferta.</p>
                            <p style="color: #64748b;">El empleador tiene tu información de contacto.</p>
                        </div>
                        <div class="modal-buttons">
                            <button class="btn btn-primary" onclick="cerrarModal()">Entendido</button>
                        </div>
                    `);
                    return;
                }
                
                // Guardar aplicación en Firestore
                const aplicacion = {
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
                };
                
                await addDoc(collection(db, 'aplicaciones'), aplicacion);
                
                // Mostrar confirmación con teléfono del empleador
                mostrarModal(`
                    <div class="modal-header success">
                        <h2>✅ ¡Aplicación Enviada!</h2>
                    </div>
                    <div class="modal-text">
                        <p>Tu aplicación ha sido enviada exitosamente.</p>
                        <p style="color: #64748b;">El empleador revisará tu perfil y te contactará pronto al número:</p>
                        <p style="font-size: 1.5rem; font-weight: bold; color: #3b82f6; margin: 1rem 0;">${telefono}</p>
                        <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                            <p style="margin: 0; color: #0369a1;"><strong>💡 Tip:</strong> Mantén tu teléfono disponible para recibir la llamada del empleador.</p>
                        </div>
                    </div>
                    <div class="modal-buttons">
                        <button class="btn btn-primary" onclick="cerrarModal()">Entendido</button>
                    </div>
                `);
                
            } catch (error) {
                console.error('Error al enviar aplicación:', error);
                alert('Error al enviar la aplicación: ' + error.message);
            }
        }

        function cerrarModal() {
            document.getElementById('modal-overlay').className = 'modal-overlay';
            document.body.style.overflow = 'auto';
        }

        function mostrarModal(html) {
            document.getElementById('modal-body').innerHTML = html;
            document.getElementById('modal-overlay').className = 'modal-overlay active';
            document.body.style.overflow = 'hidden';
        }

        function clickFueraModal(e) {
            if (e.target.id === 'modal-overlay') cerrarModal();
        }

        function verDetalle(btn) {
            var card = btn.closest('.oferta-card');
            var titulo = card.querySelector('.oferta-titulo').textContent;
            mostrarModal('<div class="modal-header"><h2>📋 ' + titulo + '</h2></div><div class="modal-text"><h3>Descripción</h3><p>Detalles completos de la oferta...</p><h3>Requisitos</h3><ul class="modal-list"><li>Experiencia mínima 2 años</li><li>Disponibilidad inmediata</li><li>Referencias verificables</li></ul></div><div class="modal-buttons"><button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button><button class="btn btn-primary" onclick="contactar()">💬 Contactar</button></div>');
        }

        function contactar() {
            mostrarModal('<div class="modal-header"><h2>💬 Enviar Mensaje</h2></div><div class="modal-text"><form class="modal-form"><label>Tu Nombre:</label><input type="text" value="Usuario"><label>Tu Teléfono:</label><input type="tel" placeholder="999 999 999"><label>Mensaje:</label><textarea rows="4" placeholder="Tu mensaje..."></textarea></form></div><div class="modal-buttons"><button class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button><button class="btn btn-primary" onclick="enviarMensaje()">📤 Enviar</button></div>');
        }

        function verPerfil(btn) {
            var card = btn.closest('.trabajador-card');
            var nombre = card.querySelector('h4').textContent;
            mostrarModal('<div class="modal-header"><div class="perfil-avatar">👨‍🔧</div><h2>' + nombre + '</h2></div><div class="modal-text"><h3>📋 Sobre mí</h3><p>Profesional con amplia experiencia.</p><h3>🎯 Especialidades</h3><div class="tags"><span class="tag">Instalaciones</span><span class="tag">Reparaciones</span><span class="tag">Mantenimiento</span></div></div><div class="modal-buttons"><button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button><button class="btn btn-primary" onclick="contactar()">💬 Contactar</button></div>');
        }

        function cerrarSesion() {
            mostrarModal('<div class="modal-header"><h2>⚠️ Cerrar Sesión</h2></div><div class="modal-text"><p>¿Estás seguro?</p></div><div class="modal-buttons"><button class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button><button class="btn btn-primary" onclick="confirmarSalir()">Sí, Salir</button></div>');
        }

        function confirmarSalir() {
            localStorage.removeItem('usuarioChambApp');
            window.location.href = 'index.html';
        }

        function enviarMensaje() {
            mostrarModal('<div class="modal-header success"><h2>✅ ¡Mensaje Enviado!</h2></div><div class="modal-text"><p>Tu mensaje ha sido enviado exitosamente.</p></div><div class="modal-buttons"><button class="btn btn-primary" onclick="cerrarModal()">Entendido</button></div>');
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') cerrarModal();
        });


        function aplicarFiltros() {
            const busqueda = document.getElementById('filtro-busqueda').value.toLowerCase();
            const categoria = document.getElementById('filtro-categoria').value;
            const ubicacion = document.getElementById('filtro-ubicacion').value.toLowerCase();

            const ofertasFiltradas = todasLasOfertas.filter(item => {
                const oferta = item.data; // Acceder a .data
                
                // Filtro por búsqueda (título o descripción)
                const coincideBusqueda = !busqueda || 
                    (oferta.titulo && oferta.titulo.toLowerCase().includes(busqueda)) || 
                    (oferta.descripcion && oferta.descripcion.toLowerCase().includes(busqueda));

                // Filtro por categoría
                const coincideCategoria = !categoria || oferta.categoria === categoria;

                // Filtro por ubicación
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
            
            // Obtener usuario actual
            const usuarioStr = localStorage.getItem('usuarioChambApp');
            const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
        
            if (ofertas.length === 0) {
                ofertasGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: white; border-radius: 12px;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">🔍</div>
                        <h3 style="color: #64748b; margin-bottom: 1rem;">No se encontraron ofertas</h3>
                        <p style="color: #94a3b8;">Intenta con otros filtros o búsqueda</p>
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
// FUNCIONES PARA EDITAR Y ELIMINAR OFERTAS
// ========================================

async function editarOferta(id) {
    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, doc, getDoc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const app = initializeApp(window.firebaseConfig);
        const db = getFirestore(app);
        
        // Obtener los datos actuales de la oferta
        const docRef = doc(db, 'ofertas', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            alert('Error: No se encontró la oferta');
            return;
        }
        
        const oferta = docSnap.data();
        
        // Mostrar modal con formulario de edición
        const modalHTML = `
            <div class="modal-header">
                <h2>✏️ Editar Oferta</h2>
            </div>
            <div class="modal-text">
                <form class="modal-form" id="formEditarOferta">
                    <label>Título de la Oferta:</label>
                    <input type="text" id="edit-titulo" value="${oferta.titulo}" required>
                    
                    <label>Categoría:</label>
                    <select id="edit-categoria" required>
                        <option value="construccion" ${oferta.categoria === 'construccion' ? 'selected' : ''}>🏗️ Construcción</option>
                        <option value="gasfiteria" ${oferta.categoria === 'gasfiteria' ? 'selected' : ''}>🔧 Gasfitería</option>
                        <option value="electricidad" ${oferta.categoria === 'electricidad' ? 'selected' : ''}>⚡ Electricidad</option>
                        <option value="jardineria" ${oferta.categoria === 'jardineria' ? 'selected' : ''}>🌿 Jardinería</option>
                        <option value="limpieza" ${oferta.categoria === 'limpieza' ? 'selected' : ''}>🧹 Limpieza</option>
                        <option value="otros" ${oferta.categoria === 'otros' ? 'selected' : ''}>📦 Otros</option>
                    </select>
                    
                    <label>Descripción:</label>
                    <textarea id="edit-descripcion" rows="4" required>${oferta.descripcion}</textarea>
                    
                    <label>Ubicación:</label>
                    <input type="text" id="edit-ubicacion" value="${oferta.ubicacion}" required>
                    
                    <label>Salario Ofrecido:</label>
                    <input type="text" id="edit-salario" value="${oferta.salario}" placeholder="Ej: S/. 50/hora" required>
                    
                    <label>Duración Estimada:</label>
                    <input type="text" id="edit-duracion" value="${oferta.duracion}" placeholder="Ej: 1 día, 1 semana" required>
                    
                    <label>Horario:</label>
                    <input type="text" id="edit-horario" value="${oferta.horario}" placeholder="Ej: 8am - 5pm" required>
                </form>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="guardarEdicionOferta('${id}')">💾 Guardar Cambios</button>
            </div>
        `;
        
        mostrarModal(modalHTML);
        
    } catch (error) {
        console.error('Error al cargar oferta para editar:', error);
        alert('Error al cargar la oferta');
    }
}

async function guardarEdicionOferta(id) {
    const titulo = document.getElementById('edit-titulo').value.trim();
    const categoria = document.getElementById('edit-categoria').value;
    const descripcion = document.getElementById('edit-descripcion').value.trim();
    const ubicacion = document.getElementById('edit-ubicacion').value.trim();
    const salario = document.getElementById('edit-salario').value.trim();
    const duracion = document.getElementById('edit-duracion').value.trim();
    const horario = document.getElementById('edit-horario').value.trim();
    
    if (!titulo || !descripcion || !ubicacion || !salario || !duracion || !horario) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const app = initializeApp(window.firebaseConfig);
        const db = getFirestore(app);
        
        const docRef = doc(db, 'ofertas', id);
        
        await updateDoc(docRef, {
            titulo: titulo,
            categoria: categoria,
            descripcion: descripcion,
            ubicacion: ubicacion,
            salario: salario,
            duracion: duracion,
            horario: horario
        });
        
        // Mostrar confirmación
        mostrarModal(`
            <div class="modal-header success">
                <h2>✅ ¡Oferta Actualizada!</h2>
            </div>
            <div class="modal-text">
                <p>Los cambios se han guardado exitosamente.</p>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-primary" onclick="location.reload()">Aceptar</button>
            </div>
        `);
        
    } catch (error) {
        console.error('Error al actualizar oferta:', error);
        alert('Error al guardar los cambios: ' + error.message);
    }
}

async function eliminarOferta(id) {
    // Mostrar confirmación antes de eliminar
    const modalHTML = `
        <div class="modal-header" style="background: #fee2e2;">
            <h2>⚠️ Eliminar Oferta</h2>
        </div>
        <div class="modal-text">
            <p style="font-size: 1.1rem; color: #dc2626; font-weight: 600;">¿Estás seguro que deseas eliminar esta oferta?</p>
            <p style="color: #64748b;">Esta acción no se puede deshacer. Todas las aplicaciones asociadas también serán eliminadas.</p>
        </div>
        <div class="modal-buttons">
            <button class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
            <button class="btn btn-danger" onclick="confirmarEliminarOferta('${id}')" style="background: #dc2626;">🗑️ Sí, Eliminar</button>
        </div>
    `;
    
    mostrarModal(modalHTML);
}

async function confirmarEliminarOferta(id) {
    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, doc, deleteDoc, collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const app = initializeApp(window.firebaseConfig);
        const db = getFirestore(app);
        
        // Eliminar todas las aplicaciones asociadas a esta oferta
        const aplicacionesRef = collection(db, 'aplicaciones');
        const q = query(aplicacionesRef, where('ofertaId', '==', id));
        const querySnapshot = await getDocs(q);
        
        const deletePromises = [];
        querySnapshot.forEach((docSnap) => {
            deletePromises.push(deleteDoc(doc(db, 'aplicaciones', docSnap.id)));
        });
        
        await Promise.all(deletePromises);
        
        // Eliminar la oferta
        await deleteDoc(doc(db, 'ofertas', id));
        
        // Mostrar confirmación
        mostrarModal(`
            <div class="modal-header success">
                <h2>✅ Oferta Eliminada</h2>
            </div>
            <div class="modal-text">
                <p>La oferta ha sido eliminada exitosamente.</p>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-primary" onclick="location.reload()">Aceptar</button>
            </div>
        `);
        
    } catch (error) {
        console.error('Error al eliminar oferta:', error);
        alert('Error al eliminar la oferta: ' + error.message);
    }
}

// ========================================
// EXPONER FUNCIONES AL SCOPE GLOBAL
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
window.guardarEdicionOferta = guardarEdicionOferta;
window.eliminarOferta = eliminarOferta;
window.confirmarEliminarOferta = confirmarEliminarOferta;
