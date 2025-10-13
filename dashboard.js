// Simulación de datos del usuario
const usuarioActual = {
    nombre: "Juan Pérez",
    tipo: "trabajador",
    email: "juan@example.com"
};

// Esperar a que el DOM esté completamente cargado
window.addEventListener('DOMContentLoaded', function() {
    inicializarDashboard();
});

function inicializarDashboard() {
    // Actualizar nombre del usuario
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement && usuarioActual.nombre) {
        userNameElement.textContent = `👤 Bienvenido, ${usuarioActual.nombre}`;
    }
    
    // Crear contenedor de modales
    crearModalContainer();
    
    // Animar elementos
    animarElementos();
    
    // Agregar eventos
    setTimeout(() => {
        agregarEventosOfertas();
        agregarEventosTrabajadores();
    }, 500);
}

// Crear contenedor para modales
function crearModalContainer() {
    if (document.getElementById('modal-overlay')) return;
    
    const modalHTML = `
        <div id="modal-overlay" class="modal-overlay">
            <div class="modal-content">
                <button class="modal-close" onclick="cerrarModal()">&times;</button>
                <div id="modal-body"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
        if (e.target.id === 'modal-overlay') {
            cerrarModal();
        }
    });
}

// Función para cerrar sesión
function cerrarSesion() {
    mostrarModal(`
        <div class="modal-header">
            <h2>⚠️ Cerrar Sesión</h2>
        </div>
        <div class="modal-text">
            <p>¿Estás seguro que deseas cerrar sesión?</p>
        </div>
        <div class="modal-buttons">
            <button class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="confirmarCerrarSesion()">Sí, Salir</button>
        </div>
    `);
}

function confirmarCerrarSesion() {
    window.location.href = 'index.html';
}

// Mostrar modal
function mostrarModal(contenido) {
    const modalBody = document.getElementById('modal-body');
    const modalOverlay = document.getElementById('modal-overlay');
    
    if (!modalBody || !modalOverlay) {
        console.error('Modal no encontrado');
        return;
    }
    
    modalBody.innerHTML = contenido;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Cerrar modal
function cerrarModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Animar elementos al cargar
function animarElementos() {
    const cards = document.querySelectorAll('.stat-card, .oferta-card, .trabajador-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Agregar eventos a los botones de ofertas
function agregarEventosOfertas() {
    // Botones "Ver Detalles"
    const botonesDetalle = document.querySelectorAll('.oferta-card .btn-primary');
    if (botonesDetalle.length > 0) {
        botonesDetalle.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const card = this.closest('.oferta-card');
                if (!card) return;
                
                const titulo = card.querySelector('.oferta-titulo')?.textContent || 'Oferta';
                const descripcion = card.querySelector('.oferta-descripcion')?.textContent || '';
                const categoria = card.querySelector('.oferta-categoria')?.textContent || 'General';
                const detallesElements = card.querySelectorAll('.detalle');
                const detalles = Array.from(detallesElements).map(d => d.textContent);
                
                mostrarDetalleOferta(titulo, descripcion, categoria, detalles);
            });
        });
    }
    
    // Botones "Contactar"
    const botonesContactar = document.querySelectorAll('.oferta-card .btn-secondary');
    if (botonesContactar.length > 0) {
        botonesContactar.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const card = this.closest('.oferta-card');
                if (!card) return;
                
                const titulo = card.querySelector('.oferta-titulo')?.textContent || 'Oferta';
                mostrarFormularioContacto(titulo);
            });
        });
    }
}

// Mostrar detalles de la oferta en modal
function mostrarDetalleOferta(titulo, descripcion, categoria, detalles) {
    const contenido = `
        <div class="modal-header">
            <span class="oferta-categoria ${categoria.toLowerCase()}">${categoria}</span>
            <h2>${titulo}</h2>
        </div>
        <div class="modal-text">
            <h3>📋 Descripción</h3>
            <p>${descripcion}</p>
            
            <h3>📍 Detalles</h3>
            <ul class="modal-list">
                ${detalles.map(d => `<li>${d}</li>`).join('')}
            </ul>
            
            <h3>📞 Requisitos</h3>
            <ul class="modal-list">
                <li>Experiencia mínima de 2 años</li>
                <li>Disponibilidad inmediata</li>
                <li>Referencias verificables</li>
                <li>Documentos en regla</li>
            </ul>
            
            <h3>✅ Beneficios</h3>
            <ul class="modal-list">
                <li>Pago puntual</li>
                <li>Ambiente de trabajo seguro</li>
                <li>Posibilidad de trabajo continuo</li>
            </ul>
        </div>
        <div class="modal-buttons">
            <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
            <button class="btn btn-primary" onclick="contactarDesdeDetalle('${titulo.replace(/'/g, "\\'")}')">💬 Contactar Ahora</button>
        </div>
    `;
    
    mostrarModal(contenido);
}

// Mostrar formulario de contacto
function mostrarFormularioContacto(titulo) {
    const contenido = `
        <div class="modal-header">
            <h2>💬 Contactar Empleador</h2>
        </div>
        <div class="modal-text">
            <p><strong>Oferta:</strong> ${titulo}</p>
            
            <form id="form-contacto" class="modal-form" onsubmit="return false;">
                <label>Tu Nombre:</label>
                <input type="text" id="nombre-contacto" value="${usuarioActual.nombre}" required>
                
                <label>Tu Teléfono:</label>
                <input type="tel" id="telefono-contacto" placeholder="999 999 999" required>
                
                <label>Tu Mensaje:</label>
                <textarea id="mensaje-contacto" rows="4" placeholder="Cuéntale por qué eres el candidato ideal..." required></textarea>
                
                <div class="checkbox-group">
                    <input type="checkbox" id="disponibilidad" checked>
                    <label for="disponibilidad">Tengo disponibilidad inmediata</label>
                </div>
            </form>
        </div>
        <div class="modal-buttons">
            <button class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="enviarContacto('${titulo.replace(/'/g, "\\'")}')">📤 Enviar Mensaje</button>
        </div>
    `;
    
    mostrarModal(contenido);
}

function contactarDesdeDetalle(titulo) {
    mostrarFormularioContacto(titulo);
}

function enviarContacto(titulo) {
    const nombre = document.getElementById('nombre-contacto')?.value;
    const telefono = document.getElementById('telefono-contacto')?.value;
    const mensaje = document.getElementById('mensaje-contacto')?.value;
    
    if (!nombre || !telefono || !mensaje) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    const contenido = `
        <div class="modal-header success">
            <h2>✅ ¡Mensaje Enviado!</h2>
        </div>
        <div class="modal-text">
            <p>Tu mensaje ha sido enviado exitosamente al empleador.</p>
            <p>Recibirás una notificación cuando te respondan.</p>
            
            <div class="info-box">
                <strong>📧 Resumen de tu solicitud:</strong>
                <p><strong>Oferta:</strong> ${titulo}</p>
                <p><strong>Tu contacto:</strong> ${telefono}</p>
            </div>
            
            <p style="margin-top: 1rem; color: #64748b;">
                <em>En la versión completa, el empleador podrá ver tu perfil completo y contactarte directamente.</em>
            </p>
        </div>
        <div class="modal-buttons">
            <button class="btn btn-primary" onclick="cerrarModal()">Entendido</button>
        </div>
    `;
    
    mostrarModal(contenido);
}

// Agregar eventos a los botones de trabajadores
function agregarEventosTrabajadores() {
    const botonesVerPerfil = document.querySelectorAll('.trabajador-card .btn-primary');
    
    if (botonesVerPerfil.length > 0) {
        botonesVerPerfil.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const card = this.closest('.trabajador-card');
                if (!card) return;
                
                const nombre = card.querySelector('h4')?.textContent || 'Trabajador';
                const categoria = card.querySelector('.trabajador-categoria')?.textContent || '';
                const rating = card.querySelector('.trabajador-rating')?.textContent || '';
                const experiencia = card.querySelector('.trabajador-exp')?.textContent || '';
                
                mostrarPerfilTrabajador(nombre, categoria, rating, experiencia);
            });
        });
    }
}

// Mostrar perfil del trabajador
function mostrarPerfilTrabajador(nombre, categoria, rating, experiencia) {
    const contenido = `
        <div class="modal-header">
            <div class="perfil-avatar">👨‍🔧</div>
            <h2>${nombre}</h2>
            <p class="trabajador-categoria">${categoria}</p>
            <div class="trabajador-rating">${rating}</div>
        </div>
        <div class="modal-text">
            <h3>📋 Sobre mí</h3>
            <p>${experiencia}. Profesional dedicado y responsable, con amplia trayectoria en el sector. Cuento con todas las herramientas necesarias y documentación en regla.</p>
            
            <h3>💼 Experiencia Destacada</h3>
            <ul class="modal-list">
                <li>Proyectos residenciales en San Isidro y Miraflores</li>
                <li>Trabajos comerciales en centros empresariales</li>
                <li>Mantenimiento preventivo y correctivo</li>
            </ul>
            
            <h3>🎯 Especialidades</h3>
            <div class="tags">
                <span class="tag">Instalaciones</span>
                <span class="tag">Reparaciones</span>
                <span class="tag">Mantenimiento</span>
                <span class="tag">Emergencias</span>
            </div>
            
            <h3>📞 Disponibilidad</h3>
            <p>✅ Disponible de Lunes a Sábado<br>
            ⏰ Horario: 8:00 AM - 6:00 PM<br>
            🚨 Atención de emergencias</p>
        </div>
        <div class="modal-buttons">
            <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
            <button class="btn btn-primary" onclick="contactarTrabajador('${nombre.replace(/'/g, "\\'")}')">💬 Contactar</button>
        </div>
    `;
    
    mostrarModal(contenido);
}

function contactarTrabajador(nombre) {
    const contenido = `
        <div class="modal-header">
            <h2>💬 Contactar a ${nombre}</h2>
        </div>
        <div class="modal-text">
            <form id="form-contacto-trabajador" class="modal-form" onsubmit="return false;">
                <label>Describe tu proyecto:</label>
                <textarea id="proyecto-desc" rows="4" placeholder="Cuéntale qué necesitas..." required></textarea>
                
                <label>Ubicación:</label>
                <input type="text" id="ubicacion" placeholder="Ej: Miraflores, Lima" required>
                
                <label>Fecha estimada de inicio:</label>
                <input type="date" id="fecha-inicio" required>
                
                <label>Presupuesto aproximado (S/.):</label>
                <input type="number" id="presupuesto" placeholder="1000" required>
            </form>
        </div>
        <div class="modal-buttons">
            <button class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="enviarSolicitudTrabajador('${nombre.replace(/'/g, "\\'")}')">📤 Enviar Solicitud</button>
        </div>
    `;
    
    mostrarModal(contenido);
}

function enviarSolicitudTrabajador(nombre) {
    const proyecto = document.getElementById('proyecto-desc')?.value;
    
    if (!proyecto) {
        alert('Por favor describe tu proyecto');
        return;
    }
    
    const contenido = `
        <div class="modal-header success">
            <h2>✅ ¡Solicitud Enviada!</h2>
        </div>
        <div class="modal-text">
            <p>Tu solicitud ha sido enviada a <strong>${nombre}</strong>.</p>
            <p>Recibirás una respuesta en las próximas 24 horas.</p>
            
            <div class="info-box">
                <strong>📧 ¿Qué sigue?</strong>
                <p>1. El trabajador revisará tu solicitud<br>
                2. Te contactará para coordinar detalles<br>
                3. Podrán acordar fecha y presupuesto final</p>
            </div>
        </div>
        <div class="modal-buttons">
            <button class="btn btn-primary" onclick="cerrarModal()">Entendido</button>
        </div>
    `;
    
    mostrarModal(contenido);
}

// Cerrar modal con tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        cerrarModal();
    }
});

console.log('✅ Dashboard de ChambApp cargado correctamente');
