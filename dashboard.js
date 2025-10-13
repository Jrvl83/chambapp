// Simulación de datos del usuario
const usuarioActual = {
    nombre: "Juan Pérez",
    tipo: "trabajador", // o "empleador"
    email: "juan@example.com"
};

// Cargar nombre del usuario al iniciar
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar nombre en el header
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement && usuarioActual.nombre) {
        userNameElement.textContent = `👤 Bienvenido, ${usuarioActual.nombre}`;
    }
    
    // Animar las cards al cargar
    animarElementos();
    
    // Agregar funcionalidad a los botones
    agregarEventosOfertas();
    agregarEventosTrabajadores();
});

// Función para cerrar sesión
function cerrarSesion() {
    const confirmar = confirm('¿Estás seguro que deseas cerrar sesión?');
    if (confirmar) {
        // Aquí iría la lógica de cerrar sesión con Firebase
        console.log('Cerrando sesión...');
        
        // Redirigir a la página principal
        window.location.href = 'index.html';
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
    botonesDetalle.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const card = e.target.closest('.oferta-card');
            const titulo = card.querySelector('.oferta-titulo').textContent;
            
            alert(`Viendo detalles de: ${titulo}\n\nEn la versión completa, aquí se abrirá una página con toda la información de la oferta.`);
            
            // En producción, redirigir a página de detalles:
            // window.location.href = `oferta-detalle.html?id=${ofertaId}`;
        });
    });
    
    // Botones "Contactar"
    const botonesContactar = document.querySelectorAll('.oferta-card .btn-secondary');
    botonesContactar.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const card = e.target.closest('.oferta-card');
            const titulo = card.querySelector('.oferta-titulo').textContent;
            
            const confirmar = confirm(`¿Deseas contactar al empleador sobre: ${titulo}?`);
            
            if (confirmar) {
                alert('¡Solicitud enviada! El empleador recibirá tu mensaje.\n\nEn la versión completa, esto abrirá el chat o enviará una notificación.');
                
                // En producción, abrir chat o enviar notificación:
                // window.location.href = `mensajes.html?oferta=${ofertaId}`;
            }
        });
    });
}

// Agregar eventos a los botones de trabajadores
function agregarEventosTrabajadores() {
    const botonesVerPerfil = document.querySelectorAll('.trabajador-card .btn-primary');
    
    botonesVerPerfil.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const card = e.target.closest('.trabajador-card');
            const nombre = card.querySelector('h4').textContent;
            const categoria = card.querySelector('.trabajador-categoria').textContent;
            
            alert(`Ver perfil completo de:\n\n${nombre}\n${categoria}\n\nEn la versión completa, aquí se mostrará el perfil detallado con portafolio, reseñas y contacto.`);
            
            // En producción, redirigir a perfil:
            // window.location.href = `perfil.html?id=${trabajadorId}`;
        });
    });
}

// Destacar el elemento activo en el menú según la página
function marcarNavegacionActiva() {
    const paginaActual = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === paginaActual) {
            item.classList.add('active');
        }
    });
}

// Función para actualizar estadísticas en tiempo real (simulado)
function actualizarEstadisticas() {
    const stats = document.querySelectorAll('.stat-info h3');
    
    stats.forEach(stat => {
        const valorActual = parseInt(stat.textContent);
        const cambio = Math.floor(Math.random() * 3) - 1; // -1, 0, o 1
        const nuevoValor = Math.max(0, valorActual + cambio);
        
        stat.textContent = nuevoValor;
    });
}

// Actualizar estadísticas cada 30 segundos (simulado)
setInterval(actualizarEstadisticas, 30000);

// Función para búsqueda rápida (para implementar más adelante)
function buscarOfertas(termino) {
    console.log('Buscando:', termino);
    // Aquí iría la lógica de búsqueda con Firebase
}

// Función para filtrar por categoría
function filtrarPorCategoria(categoria) {
    console.log('Filtrando por:', categoria);
    const ofertas = document.querySelectorAll('.oferta-card');
    
    ofertas.forEach(oferta => {
        con
