// ============================================
// LOGIN.JS - Lógica de autenticación
// ChambApp - Sistema de inicio de sesión
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, signOut }
    from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, collection, query, where, getDocs }
    from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { iniciarSesionGoogle, crearPerfilGoogle, obtenerMensajeErrorGoogle, esIOSStandalone }
    from './google-auth.js';
import { escapeHtml } from '../utils/dom-helpers.js';

// ============================================
// INICIALIZACIÓN FIREBASE
// ============================================

const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================
// ELEMENTOS DOM
// ============================================

const loginForm = document.getElementById('loginForm');
const btnLogin = document.getElementById('btn-login');
const btnGoogle = document.getElementById('btn-google');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordToggle = document.getElementById('password-toggle');

// ============================================
// FUNCIONES
// ============================================

/**
 * Toggle password visibility
 */
const SVG_EYE_OPEN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const SVG_EYE_OFF = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

function togglePassword() {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggle.innerHTML = SVG_EYE_OFF;
        passwordToggle.setAttribute('aria-label', 'Ocultar contraseña');
    } else {
        passwordInput.type = 'password';
        passwordToggle.innerHTML = SVG_EYE_OPEN;
        passwordToggle.setAttribute('aria-label', 'Mostrar contraseña');
    }
}

/**
 * Validar campos del formulario
 */
function validarCampos(email, password) {
    if (!email || !password) {
        toastWarning('Por favor completa todos los campos');
        return false;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        toastWarning('Por favor ingresa un email válido');
        return false;
    }
    return true;
}

/**
 * Manejar errores de Firebase Auth (email/password)
 */
function obtenerMensajeError(error) {
    switch (error.code) {
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
 */
function actualizarBotonLogin(loading) {
    btnLogin.disabled = loading;
    btnLogin.classList.toggle('loading', loading);
    const btnText = btnLogin.querySelector('.btn-text');
    if (btnText) btnText.textContent = loading ? 'Iniciando sesión...' : 'Iniciar Sesión';
}

/**
 * Actualizar estado del botón de Google
 */
function actualizarBotonGoogle(loading) {
    btnGoogle.disabled = loading;
    if (loading) {
        btnGoogle.dataset.originalHtml = btnGoogle.innerHTML;
        btnGoogle.textContent = 'Conectando...';
    } else if (btnGoogle.dataset.originalHtml) {
        btnGoogle.innerHTML = btnGoogle.dataset.originalHtml;
    }
}

/**
 * Guardar usuario en localStorage y redirigir
 */
function loginExitoso(userData) {
    localStorage.setItem('usuarioChambApp', JSON.stringify(userData));
    const nombre = escapeHtml(userData.nombre || 'usuario');
    toastSuccess(`¡Bienvenido de vuelta, ${nombre}!`);
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
}

/**
 * Mostrar modal de selección de rol
 * @returns {Promise<string|null>} 'trabajador', 'empleador', o null si canceló
 */
function mostrarModalRol() {
    return new Promise((resolve) => {
        const modal = document.getElementById('modal-rol-google');
        modal.style.display = 'flex';

        function cleanup() {
            cards.forEach(c => c.removeEventListener('click', handleCardClick));
            modal.removeEventListener('click', handleOverlayClick);
            modal.style.display = 'none';
        }

        const cards = modal.querySelectorAll('.role-card');
        function handleCardClick(e) {
            cleanup();
            resolve(e.currentTarget.dataset.type);
        }

        function handleOverlayClick(e) {
            if (e.target === modal) {
                cleanup();
                resolve(null);
            }
        }

        cards.forEach(c => c.addEventListener('click', handleCardClick));
        modal.addEventListener('click', handleOverlayClick);
    });
}

// ============================================
// HANDLERS
// ============================================

/**
 * Login con email/password
 */
async function handleLogin(e) {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!validarCampos(email, password)) return;

    actualizarBotonLogin(true);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Cuenta admin — redirigir directo sin buscar doc en Firestore
        const ADMIN_UIDS = ['XkBmgSWZKZeUyLKAyOn8GHmzOAb2'];
        if (ADMIN_UIDS.includes(uid)) {
            window.location.href = 'admin.html';
            return;
        }

        const userDoc = await getDoc(doc(db, 'usuarios', uid));

        if (!userDoc.exists()) {
            throw new Error('No se encontraron datos del usuario');
        }

        loginExitoso({ ...userDoc.data(), uid });
    } catch (error) {
        actualizarBotonLogin(false);
        toastError(obtenerMensajeError(error));
    }
}

/**
 * Login con Google
 */
async function handleGoogleLogin() {
    if (esIOSStandalone()) {
        toastWarning('Para usar Google, abre ChambaYa en Safari.');
        return;
    }

    actualizarBotonGoogle(true);

    try {
        const { user, userData, isNewUser } = await iniciarSesionGoogle(auth, db);

        if (!isNewUser) {
            loginExitoso(userData);
            return;
        }

        // Usuario nuevo: pedir tipo
        actualizarBotonGoogle(false);
        const tipo = await mostrarModalRol();

        if (!tipo) {
            // Usuario canceló el modal: limpiar sesión de Google
            await signOut(auth);
            return;
        }

        actualizarBotonGoogle(true);
        const nuevoUsuario = await crearPerfilGoogle(db, user, tipo);
        localStorage.setItem('usuarioChambApp', JSON.stringify(nuevoUsuario));
        toastSuccess('¡Cuenta creada exitosamente!');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
    } catch (error) {
        actualizarBotonGoogle(false);
        const mensaje = obtenerMensajeErrorGoogle(error);
        if (mensaje) toastError(mensaje);
    }
}

/**
 * Verificar si un email está registrado con Google
 */
async function esUsuarioGoogle(email) {
    try {
        const q = query(collection(db, 'usuarios'), where('email', '==', email));
        const snap = await getDocs(q);
        if (snap.empty) return false;
        const data = snap.docs[0].data();
        return data.authProvider === 'google';
    } catch (err) {
        console.error('Error verificando proveedor:', err);
        return false;
    }
}

/**
 * Recuperar contraseña
 */
async function handleForgotPassword(e) {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (!email) {
        toastWarning('Ingresa tu email para recuperar tu contraseña');
        emailInput.focus();
        return;
    }

    // Verificar si es cuenta de Google
    if (await esUsuarioGoogle(email)) {
        toastInfo('Esta cuenta usa Google para iniciar sesión. Usa el botón "Continuar con Google".', 5000);
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        // No revelar si el email existe (seguridad)
    }

    toastSuccess('Si el email está registrado, recibirás instrucciones para restablecer tu contraseña.');
}

// ============================================
// EVENT LISTENERS
// ============================================

loginForm.addEventListener('submit', handleLogin);
btnGoogle.addEventListener('click', handleGoogleLogin);

document.getElementById('forgot-password-link')
    .addEventListener('click', handleForgotPassword);

window.togglePassword = togglePassword;

window.addEventListener('load', () => {
    emailInput.focus();

    // Mostrar aviso si el usuario fue bloqueado por el admin
    const params = new URLSearchParams(window.location.search);
    if (params.get('bloqueado') === '1') {
        showToast('Tu cuenta ha sido suspendida. Contacta al soporte si crees que es un error.', 'error', 6000);
    }
});
