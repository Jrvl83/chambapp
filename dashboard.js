(function() {
    'use strict';
    
    // Datos del usuario
    const usuario = {
        nombre: "Juan Pérez"
    };
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        actualizarNombreUsuario();
        crearModal();
        setTimeout(agregarEventos, 100);
    }
    
    function actualizarNombreUsuario() {
        const elem = document.querySelector('.user-name');
        if (elem) elem.textContent = '👤 Bienvenido, ' + usuario.nombre;
    }
    
    function crearModal() {
        if (document.getElementById('modal-overlay')) return;
        
        const div = document.createElement('div');
        div.id = 'modal-overlay';
        div.className = 'modal-overlay';
        div.innerHTML = '<div class="modal-content"><button class="modal-close" onclick="window.cerrarModal()">&times;</button><div id="modal-body"></div></div>';
        document.body.appendChild(div);
        
        div.addEventListener('click', function(e) {
            if (e.target.id === 'modal-overlay') window.cerrarModal();
        });
    }
    
    function agregarEventos() {
        // Botones de ofertas
        const botonesVer = document.querySelectorAll('.oferta-card .btn-primary');
        for (let i = 0; i < botonesVer.length; i++) {
            botonesVer[i].onclick = verDetalle;
        }
        
        const botonesContactar = document.querySelectorAll('.oferta-card .btn-secondary');
        for (let i = 0; i < botonesContactar.length; i++) {
            botonesContactar[i].onclick = contactarOferta;
        }
        
        // Botones de trabajadores
        const botonesPerfil = document.querySelectorAll('.trabajador-card .btn-primary');
        for (let i = 0; i < botonesPerfil.length; i++) {
            botonesPerfil[i].onclick = verPerfil;
        }
    }
    
    function verDetalle(e) {
        e.preventDefault();
        const card = this.closest('.oferta-card');
        const titulo = card.querySelector('.oferta-titulo').textContent;
        
        window.mostrarModal('<div class="modal-header"><h2>📋 ' + titulo + '</h2></div><div class="modal-text"><p>Detalles completos de la oferta...</p><h3>Requisitos</h3><ul class="modal-list"><li>Experiencia mínima 2 años</li><li>Disponibilidad inmediata</li><li>Referencias verificables</li></ul></div><div class="modal-buttons"><button class="btn btn-secondary" onclick="window.cerrarModal()">Cerrar</button><button class="btn btn-primary" onclick="window.contactar()">💬 Contactar</button></div>');
    }
    
    function contactarOferta(e) {
        e.preventDefault();
        window.mostrarModal('<div class="modal-header"><h2>💬 Contactar Empleador</h2></div><div class="modal-text"><form class="modal-form"><label>Tu Nombre:</label><input type="text" value="' + usuario.nombre + '"><label>Tu Teléfono:</label><input type="tel" placeholder="999 999 999"><label>Tu Mensaje:</label><textarea rows="4" placeholder="Mensaje..."></textarea></form></div><div class="modal-buttons"><button class="btn btn-secondary" onclick="window.cerrarModal()">Cancelar</button><button class="btn btn-primary" onclick="window.enviar()">📤 Enviar</button></div>');
    }
    
    function verPerfil(e) {
        e.preventDefault();
        const card = this.closest('.trabajador-card');
        const nombre = card.querySelector('h4').textContent;
        
        window.mostrarModal('<div class="modal-header"><div class="perfil-avatar">👨‍🔧</div><h2>' + nombre + '</h2></div><div class="modal-text"><h3>📋 Sobre mí</h3><p>Profesional con amplia experiencia en el sector.</p><h3>💼 Especialidades</h3><div class="tags"><span class="tag">Instalaciones</span><span class="tag">Reparaciones</span><span class="tag">Mantenimiento</span></div></div><div class="modal-buttons"><button class="btn btn-secondary" onclick="window.cerrarModal()">Cerrar</button><button class="btn btn-primary" onclick="window.contactar()">💬 Contactar</button></div>');
    }
    
    // Funciones globales
    window.mostrarModal = function(html) {
        const modal = document.getElementById('modal-overlay');
        const body = document.getElementById('modal-body');
        if (modal && body) {
            body.innerHTML = html;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };
    
    window.cerrarModal = function() {
        const modal = document.getElementById('modal-overlay');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    };
    
    window.cerrarSesion = function() {
        window.mostrarModal('<div class="modal-header"><h2>⚠️ Cerrar Sesión</h2></div><div class="modal-text"><p>¿Estás seguro?</p></div><div class="modal-buttons"><button class="btn btn-secondary" onclick="window.cerrarModal()">Cancelar</button><button class="btn btn-primary" onclick="location.href=\'index.html\'">Sí, Salir</button></div>');
    };
    
    window.contactar = function() {
        window.mostrarModal('<div class="modal-header success"><h2>✅ ¡Mensaje Enviado!</h2></div><div class="modal-text"><p>Tu solicitud ha sido enviada exitosamente.</p></div><div class="modal-buttons"><button class="btn btn-primary" onclick="window.cerrarModal()">Entendido</button></div>');
    };
    
    window.enviar = function() {
        window.contactar();
    };
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') window.cerrarModal();
    });
    
    console.log('Dashboard cargado');
})();
