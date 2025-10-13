// Variables globales
let tipoUsuario = '';

// Función para mostrar el formulario de registro
function mostrarRegistro(tipo) {
    tipoUsuario = tipo;
    
    // Guardar el tipo de usuario para usarlo en el dashboard
    localStorage.setItem('tipoUsuario', tipo);
    
    const registroSection = document.getElementById('registro');
    const camposTrabajador = document.getElementById('camposTrabajador');
    
    // Mostrar sección de registro
    registroSection.style.display = 'block';
    
    // Mostrar campos específicos según el tipo de usuario
    if (tipo === 'trabajador') {
        camposTrabajador.style.display = 'block';
    } else {
        camposTrabajador.style.display = 'none';
    }
    
    // Hacer scroll suave hacia el formulario
    registroSection.scrollIntoView({ behavior: 'smooth' });
}

// Manejar el envío del formulario
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formRegistro');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener datos del formulario
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const telefono = document.getElementById('telefono').value;
            const password = document.getElementById('password').value;
            
            // Validaciones básicas
            if (!nombre || !email || !telefono || !password) {
                alert('Por favor completa todos los campos');
                return;
            }
            
            // Datos adicionales para trabajadores
            let datosAdicionales = {};
            if (tipoUsuario === 'trabajador') {
                const categoria = document.getElementById('categoria').value;
                const experiencia = document.getElementById('experiencia').value;
                
                if (!categoria) {
                    alert('Por favor selecciona tu especialidad');
                    return;
                }
                
                datosAdicionales = {
                    categoria: categoria,
                    experiencia: experiencia
                };
            }
            
            // Crear objeto de usuario
            const usuario = {
                tipo: tipoUsuario,
                nombre: nombre,
                email: email,
                telefono: telefono,
                ...datosAdicionales,
                fechaRegistro: new Date().toISOString()
            };
            
            // Guardar usuario en localStorage (temporalmente)
            localStorage.setItem('usuarioChambApp', JSON.stringify(usuario));
            
            // Mostrar mensaje de éxito
            alert(`¡Registro exitoso! Bienvenido ${nombre} a ChambApp.`);
            
            // Redirigir al dashboard después de 1 segundo
            setTimeout(function() {
                window.location.href = 'dashboard-v3.html';
            }, 1000);
        });
    }
    
    // Navegación suave para los enlaces del menú
    const navLinks = document.querySelectorAll('nav a');
    for (let i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Botón de "Ingresar" - ir directo al dashboard (simulando login)
    const loginLinks = document.querySelectorAll('a[href="#login"]');
    for (let i = 0; i < loginLinks.length; i++) {
        loginLinks[i].addEventListener('click', function(e) {
            e.preventDefault();
            
            // Simular que ya tiene cuenta
            const tieneUsuario = localStorage.getItem('usuarioChambApp');
            
            if (tieneUsuario) {
                // Si ya se registró antes, ir al dashboard
                window.location.href = 'dashboard-v2.html';
            } else {
                // Si no, mostrar mensaje
                alert('Para ingresar primero debes registrarte. Haz clic en "Busco Trabajo" o "Busco Trabajadores".');
            }
        });
    }
});

// Función para validar email
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Función para validar teléfono (formato Perú)
function validarTelefono(telefono) {
    const re = /^9\d{8}$/;
    return re.test(telefono);
}

// Agregar validaciones en tiempo real
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const telefonoInput = document.getElementById('telefono');
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !validarEmail(this.value)) {
                this.style.borderColor = 'red';
                alert('Por favor ingresa un email válido');
            } else {
                this.style.borderColor = '#e2e8f0';
            }
        });
    }
    
    if (telefonoInput) {
        telefonoInput.addEventListener('blur', function() {
            if (this.value && !validarTelefono(this.value)) {
                this.style.borderColor = 'red';
                alert('El teléfono debe comenzar con 9 y tener 9 dígitos');
            } else {
                this.style.borderColor = '#e2e8f0';
            }
        });
    }
});

console.log('ChambApp cargado correctamente ✓');
