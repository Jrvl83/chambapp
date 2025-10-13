// Variables globales
let tipoUsuario = '';

// Función para mostrar el formulario de registro
function mostrarRegistro(tipo) {
    tipoUsuario = tipo;
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
            
            // Datos adicionales para trabajadores
            let datosAdicionales = {};
            if (tipoUsuario === 'trabajador') {
                datosAdicionales = {
                    categoria: document.getElementById('categoria').value,
                    experiencia: document.getElementById('experiencia').value
                };
            }
            
            // Crear objeto de usuario
            const usuario = {
                tipo: tipoUsuario,
                nombre: nombre,
                email: email,
                telefono: telefono,
                password: password,
                ...datosAdicionales,
                fechaRegistro: new Date().toISOString()
            };
            
            // Aquí normalmente enviarías los datos a un servidor
            console.log('Usuario registrado:', usuario);
            
            // Mostrar mensaje de éxito
            alert(`¡Registro exitoso! Bienvenido ${nombre} a ChambApp como ${tipoUsuario}.`);
            
            // Limpiar formulario
            form.reset();
            
            // Ocultar formulario
            document.getElementById('registro').style.display = 'none';
            
            // Volver arriba
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Navegación suave para los enlaces del menú
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
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
