// ============================================
// LOGIN.JS - Lógica de autenticación
// ChambApp - Sistema de inicio de sesión
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ============================================
// INICIALIZACIÓN FIREBASE
// ============================================

// Inicializar Firebase con config global
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================
// ELEMENTOS DOM
// ============================================

const loginForm = document.getElementById('loginForm');
const btnLogin = document.getElementById('btn-login');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordToggle = document.getElementById('password-toggle');

// ============================================
// FUNCIONES
// ============================================

/**
 * Toggle password visibility
 * Alterna entre mostrar/ocultar contraseña
 */
function togglePassword() {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggle.textContent = '🙈';
        passwordToggle.setAttribute('aria-label', 'Ocultar contraseña');
    } else {
        passwordInput.type = 'password';
        passwordToggle.textContent = '👁️';
        passwordToggle.setAttribute('aria-label', 'Mostrar contraseña');
    }
}

/**
 * Validar campos del formulario
 * @returns {boolean} - true si válido, false si inválido
 */
function validarCampos(email, password) {
    if (!email || !password) {
        toastWarning('Por favor completa todos los campos');
        return false;
    }
    
    // Validar formato email básico
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        toastWarning('Por favor ingresa un email válido');
        return false;
    }
    
    return true;
}

/**
 * Manejar errores de Firebase Auth
 * Convierte códigos de error técnicos a mensajes amigables
 * @param {Object} error - Error de Firebase
 * @returns {string} - Mensaje amigable
 */
function obtenerMensajeError(error) {
    console.error('Error al iniciar sesión:', error);
    
    switch(error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return 'Email o contraseña incorrectos. Verifica tus datos e intenta de nuevo.';
            
        case 'auth/invalid-email':
            return 'El email ingresado no es válido. Verifica el formato.';
            
        case 'auth/user-disabled':
            return 'Esta cuenta ha sido deshabilitada. Contacta a soporte.';
            
        case 'auth/too-many-requests':
            return 'Demasiados intentos fallidos. Espera unos minutos e intenta de nuevo.';
            
        case 'auth/network-request-failed':
            return 'Sin conexión a internet. Verifica tu conexión y vuelve a intentar.';
            
        default:
            return 'Error al iniciar sesión. Intenta de nuevo más tarde.';
    }
}

/**
 * Actualizar estado del botón de login
 * @param {boolean} loading - Si está en estado de carga
 */
function actualizarBotonLogin(loading) {
    if (loading) {
        btnLogin.disabled = true;
        btnLogin.classList.add('loading');
        btnLogin.textContent = 'Iniciando sesión...';
    } else {
        btnLogin.disabled = false;
        btnLogin.classList.remove('loading');
        btnLogin.textContent = 'Iniciar Sesión';
    }
}

/**
 * Manejar el proceso de login
 * @param {Event} e - Evento del formulario
 */
async function handleLogin(e) {
    e.preventDefault();

    // Obtener valores
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validar
    if (!validarCampos(email, password)) {
        return;
    }

    // Mostrar loading
    actualizarBotonLogin(true);

    try {
        // 1. Iniciar sesión en Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Obtener datos completos del usuario desde Firestore
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        
        if (!userDoc.exists()) {
            throw new Error('No se encontraron datos del usuario');
        }

        const userData = userDoc.data();
        
        // 3. Guardar en localStorage incluyendo el UID
        const usuarioCompleto = {
            ...userData,
            uid: user.uid
        };
        localStorage.setItem('usuarioChambApp', JSON.stringify(usuarioCompleto));

        // 4. Mostrar mensaje de éxito
        toastSuccess(`¡Bienvenido de vuelta, ${userData.nombre}!`);

        // 5. Redirigir al dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        // Restaurar botón
        actualizarBotonLogin(false);

        // Mostrar error amigable
        const mensaje = obtenerMensajeError(error);
        toastError(mensaje);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

// Formulario de login
loginForm.addEventListener('submit', handleLogin);

// Toggle password (exponer función globalmente)
window.togglePassword = togglePassword;

// Focus automático en email al cargar
window.addEventListener('load', () => {
    emailInput.focus();
});

// ============================================
// EXPORTS (si necesario en futuro)
// ============================================
// export { handleLogin, togglePassword };
