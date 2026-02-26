/**
 * Utilitario para verificar si un usuario está bloqueado por el admin.
 * @module utils/auth-guard
 */

import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

/**
 * Maneja el flujo de bloqueo: limpia sesión y redirige.
 * Usar cuando ya se sabe que el usuario está bloqueado.
 * @param {import('firebase/auth').Auth} auth
 */
export async function manejarBloqueado(auth) {
    localStorage.removeItem('usuarioChambApp');
    try { await signOut(auth); } catch { /* silencioso */ }
    window.location.href = 'cuenta-suspendida.html';
}

/**
 * Verifica en Firestore si el usuario está bloqueado.
 * Si lo está, limpia la sesión y redirige a cuenta-suspendida.html.
 * @param {import('firebase/firestore').Firestore} db
 * @param {import('firebase/auth').Auth} auth
 * @param {string} uid
 * @returns {Promise<boolean>} true si está bloqueado (ya redirigió), false si no
 */
export async function verificarBloqueo(db, auth, uid) {
    try {
        const snap = await getDoc(doc(db, 'usuarios', uid));
        if (snap.exists() && snap.data().bloqueado) {
            await manejarBloqueado(auth);
            return true;
        }
        return false;
    } catch {
        return false;
    }
}
