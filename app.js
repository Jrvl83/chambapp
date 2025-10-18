// Cargar configuración de Firebase
let auth, db;

// Esperar a que se cargue Firebase
window.addEventListener('DOMContentLoaded', async function() {
    // Importar Firebase
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const { getFirestore, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Inicializar Firebase
    const app = initializeApp(window.firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    console.log('Firebase inicializado correctamente');
    
    // Configurar eventos
    configurarEventos();
});

let tipoUsuario = '';

function mostrarRegistro(tipo) {
    tipoUsuario = tipo;
    
    const registroSection = document.getElementById('registro');
    const camposTrabajador = document.getElementById('camposTrabajador');
    
    registroSection.style.display = 'block';
    
    if (tipo === 'trabajador') {
        camposTrabajador.style.display = 'block';
    } else {
        camposTrabajador.style.display = 'none';
    }
    
    registroSection.scrollIntoView({ behavior: 'smooth' });
}

function configurarEventos() {
    const form = document.getElementById('formRegistro');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const telefono = document.getElementById('telefono').value;
            const password = document.getElementById('password').value;
            
            if (!nombre || !email || !telefono || !password) {
                alert('Por favor completa todos los campos');
                return;
            }
            
            if (password.length < 6) {
                alert('La contraseña debe tener al menos 6 caracteres');
                return;
            }
            
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
            
            try {
                // Crear usuario en Firebase Authentication
                const { getAuth, createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
                const { getFirestore, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                
                const auth = getAuth();
                const db = getFirestore();
                
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                // Guardar datos adicionales en Firestore
                const usuario = {
                    tipo: tipoUsuario,
                    nombre: nombre,
                    email: email,
                    telefono: telefono,
                    ...datosAdicionales,
                    fechaRegistro: new Date().toISOString()
                };
                
                await setDoc(doc(db, 'usuarios', user.uid), usuario);
                
                // Guardar en localStorage para acceso rápido
                localStorage.setItem('usuarioChambApp', JSON.stringify(usuario));
                
                alert(`¡Registro exitoso! Bienvenido ${nombre} a ChambApp.`);
                
                // Redirigir al dashboard
                setTimeout(function() {
                    window.location.href = 'dashboard-v3.html';
                }, 1000);
                
            } catch (error) {
                console.error('Error al registrar:', error);
                
                let mensaje = 'Error al registrar. ';
                if (error.code === 'auth/email-already-in-use') {
                    mensaje += 'Este email ya está registrado.';
                } else if (error.code === 'auth/invalid-email') {
                    mensaje += 'Email inválido.';
                } else if (error.code === 'auth/weak-password') {
                    mensaje += 'Contraseña muy débil.';
                } else {
                    mensaje += error.message;
                }
                
                alert(mensaje);
            }
        });
    }
    
    // Navegación suave
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
    
    // Botón de login
    const loginLinks = document.querySelectorAll('a[href="#login-old"]');
    for (let i = 0; i < loginLinks.length; i++) {
        loginLinks[i].addEventListener('click', function(e) {
            e.preventDefault();
            const tieneUsuario = localStorage.getItem('usuarioChambApp');
            
            if (tieneUsuario) {
                window.location.href = 'dashboard-v3.html';
            } else {
                alert('Para ingresar primero debes registrarte.');
            }
        });
    }
}

console.log('ChambApp cargado correctamente ✓');
