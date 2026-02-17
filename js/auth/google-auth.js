// ============================================
// GOOGLE-AUTH.JS - Autenticación con Google
// ChambApp - Módulo compartido login/register
// ============================================

import { GoogleAuthProvider, signInWithPopup }
    from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc, setDoc, serverTimestamp }
    from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ============================================
// CONSTANTES
// ============================================

const googleProvider = new GoogleAuthProvider();

const ERRORES_SILENCIOSOS = [
    'auth/popup-closed-by-user',
    'auth/cancelled-popup-request'
];

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Iniciar sesión con Google via popup
 * @param {Auth} auth - Instancia Firebase Auth
 * @param {Firestore} db - Instancia Firestore
 * @returns {Promise<{user: object, userData: object|null, isNewUser: boolean}>}
 */
export async function iniciarSesionGoogle(auth, db) {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, 'usuarios', user.uid));

    if (userDoc.exists()) {
        return {
            user,
            userData: { ...userDoc.data(), uid: user.uid },
            isNewUser: false
        };
    }

    return {
        user,
        userData: null,
        isNewUser: true
    };
}

/**
 * Crear perfil en Firestore para usuario de Google
 * @param {Firestore} db - Instancia Firestore
 * @param {object} user - Firebase Auth user
 * @param {string} tipo - 'trabajador' | 'empleador'
 * @returns {Promise<object>} userData creada
 */
export async function crearPerfilGoogle(db, user, tipo) {
    const userData = {
        uid: user.uid,
        nombre: user.displayName || '',
        email: user.email || '',
        telefono: '',
        tipo,
        authProvider: 'google',
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp()
    };

    await setDoc(doc(db, 'usuarios', user.uid), userData);

    // Retornar sin serverTimestamp (no serializable para localStorage)
    return {
        uid: user.uid,
        nombre: user.displayName || '',
        email: user.email || '',
        telefono: '',
        tipo,
        authProvider: 'google',
        photoURL: user.photoURL || ''
    };
}

/**
 * Traducir error de Google Auth a mensaje amigable
 * @param {Error} error
 * @returns {string|null} null si es error silencioso
 */
export function obtenerMensajeErrorGoogle(error) {
    if (ERRORES_SILENCIOSOS.includes(error.code)) {
        return null;
    }

    switch (error.code) {
        case 'auth/popup-blocked':
            return 'El navegador bloqueó la ventana de Google. Permite ventanas emergentes e intenta de nuevo.';
        case 'auth/account-exists-with-different-credential':
            return 'Ya existe una cuenta con este email. Inicia sesión con tu contraseña.';
        case 'auth/network-request-failed':
            return 'Sin conexión a internet. Verifica tu conexión.';
        default:
            return 'Error al conectar con Google. Intenta de nuevo.';
    }
}

/**
 * Verificar si estamos en iOS standalone (PWA)
 * donde signInWithPopup no funciona
 * @returns {boolean}
 */
export function esIOSStandalone() {
    return window.navigator.standalone === true;
}
