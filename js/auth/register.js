// ============================================
// REGISTER.JS - Lógica de registro
// ChambApp - Sistema de registro multi-paso
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification }
    from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, serverTimestamp }
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
// ESTADO DEL FORMULARIO
// ============================================

let currentStep = 1;
let selectedType = null;

// ============================================
// ELEMENTOS DOM
// ============================================

const registerForm = document.getElementById('registerForm');
const btnNext = document.getElementById('btnNext');
const btnBack = document.getElementById('btnBack');
const btnSubmit = document.getElementById('btnSubmit');
const btnGoogleRegister = document.getElementById('btn-google-register');
const googleSection = document.getElementById('google-register-section');

// ============================================
// FUNCIONES DE NAVEGACIÓN
// ============================================

/**
 * Actualizar la vista según el paso actual
 */
function updateStep() {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${currentStep}`).classList.add('active');

    document.querySelectorAll('.step-dot').forEach((dot, i) => {
        dot.classList.remove('active', 'completed');
        if (i + 1 < currentStep) dot.classList.add('completed');
        if (i + 1 === currentStep) dot.classList.add('active');
    });

    btnBack.style.display = currentStep > 1 ? 'flex' : 'none';
    btnNext.style.display = currentStep < 3 ? 'flex' : 'none';
    btnSubmit.style.display = currentStep === 3 ? 'flex' : 'none';
}

// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

function validarPaso1() {
    if (!selectedType) {
        document.getElementById('tipoError').classList.add('show');
        return false;
    }
    return true;
}

function validarPaso2() {
    let valid = true;
    document.querySelectorAll('#step2 .error-msg').forEach(e => e.classList.remove('show'));

    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();

    if (nombre.length < 3) {
        document.getElementById('nombreError').textContent = 'Nombre muy corto (mínimo 3 caracteres)';
        document.getElementById('nombreError').classList.add('show');
        valid = false;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('emailError').textContent = 'Email inválido';
        document.getElementById('emailError').classList.add('show');
        valid = false;
    }

    if (telefono.length < 9) {
        document.getElementById('telefonoError').textContent = 'Teléfono inválido (mínimo 9 dígitos)';
        document.getElementById('telefonoError').classList.add('show');
        valid = false;
    }

    return valid;
}

function validarPaso3() {
    let valid = true;
    document.querySelectorAll('#step3 .error-msg').forEach(e => e.classList.remove('show'));

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;

    if (password.length < 6) {
        document.getElementById('passwordError').textContent = 'Mínimo 6 caracteres';
        document.getElementById('passwordError').classList.add('show');
        valid = false;
    }

    if (password !== confirmPassword) {
        document.getElementById('confirmError').textContent = 'Las contraseñas no coinciden';
        document.getElementById('confirmError').classList.add('show');
        valid = false;
    }

    if (!terms) {
        document.getElementById('termsError').classList.add('show');
        valid = false;
    }

    return valid;
}

function validate() {
    switch (currentStep) {
        case 1: return validarPaso1();
        case 2: return validarPaso2();
        case 3: return validarPaso3();
        default: return true;
    }
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

function togglePwd(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

function obtenerMensajeError(error) {
    if (error.code === 'auth/email-already-in-use') {
        return 'Email ya registrado. Intenta con otro o inicia sesión.';
    } else if (error.code === 'auth/invalid-email') {
        return 'Email inválido. Verifica el formato.';
    } else if (error.code === 'auth/weak-password') {
        return 'Contraseña muy débil. Usa al menos 6 caracteres.';
    } else if (error.code === 'auth/network-request-failed') {
        return 'Sin conexión a internet. Verifica tu conexión.';
    }
    return 'Error al crear cuenta. Intenta de nuevo.';
}

/**
 * Guardar usuario y redirigir
 */
function registroExitoso(userData) {
    localStorage.setItem('usuarioChambApp', JSON.stringify(userData));
    toastSuccess('¡Cuenta creada exitosamente!');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Manejar selección de tipo de usuario
 */
function handleCardSelection(card) {
    document.querySelectorAll('.user-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedType = card.dataset.type;
    document.getElementById('tipoUsuario').value = selectedType;
    document.getElementById('tipoError').classList.remove('show');

    // Mostrar opción de Google
    if (googleSection) {
        googleSection.style.display = 'block';
    }
}

/**
 * Registro con email/password
 */
async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Creando cuenta...';

    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            document.getElementById('email').value.trim(),
            document.getElementById('password').value
        );

        const user = userCredential.user;

        await setDoc(doc(db, 'usuarios', user.uid), {
            uid: user.uid,
            nombre: document.getElementById('nombre').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            tipo: selectedType,
            createdAt: serverTimestamp()
        });

        // Email verification (non-blocking)
        try { await sendEmailVerification(user); } catch (_) { /* no bloquear registro */ }

        registroExitoso({
            uid: user.uid,
            nombre: document.getElementById('nombre').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            tipo: selectedType
        });
    } catch (error) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Crear Cuenta';
        toastError(obtenerMensajeError(error));

        if (error.code === 'auth/email-already-in-use') {
            currentStep = 2;
            updateStep();
        }
    }
}

/**
 * Registro con Google
 */
async function handleGoogleRegister() {
    if (!selectedType) {
        document.getElementById('tipoError').classList.add('show');
        return;
    }

    if (esIOSStandalone()) {
        toastWarning('Para usar Google, abre ChambaYa en Safari.');
        return;
    }

    btnGoogleRegister.disabled = true;
    const originalHtml = btnGoogleRegister.innerHTML;
    btnGoogleRegister.textContent = 'Conectando...';

    try {
        const { user, userData, isNewUser } = await iniciarSesionGoogle(auth, db);

        if (!isNewUser) {
            // Ya tiene perfil: login directo
            localStorage.setItem('usuarioChambApp', JSON.stringify(userData));
            const nombre = escapeHtml(userData.nombre || 'usuario');
            toastSuccess(`¡Bienvenido de vuelta, ${nombre}!`);
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
            return;
        }

        const nuevoUsuario = await crearPerfilGoogle(db, user, selectedType);
        registroExitoso(nuevoUsuario);
    } catch (error) {
        btnGoogleRegister.disabled = false;
        btnGoogleRegister.innerHTML = originalHtml;
        const mensaje = obtenerMensajeErrorGoogle(error);
        if (mensaje) toastError(mensaje);
    }
}

// ============================================
// PASSWORD STRENGTH
// ============================================

function evaluatePassword(password) {
    if (!password) return { level: '', text: '' };

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 'weak', text: 'Débil' };
    if (score <= 3) return { level: 'medium', text: 'Media' };
    return { level: 'strong', text: 'Fuerte' };
}

function updatePasswordStrength() {
    const password = document.getElementById('password').value;
    const container = document.getElementById('passwordStrength');
    const fill = document.getElementById('strengthFill');
    const text = document.getElementById('strengthText');

    if (!password) {
        container.classList.remove('visible');
        return;
    }

    container.classList.add('visible');
    const { level, text: label } = evaluatePassword(password);

    fill.className = 'strength-fill';
    text.className = 'strength-text';

    if (level) {
        fill.classList.add(level);
        text.classList.add(level);
        text.textContent = label;
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

document.querySelectorAll('.user-card').forEach(card => {
    card.addEventListener('click', () => handleCardSelection(card));
});

btnNext.addEventListener('click', () => {
    if (validate() && currentStep < 3) {
        currentStep++;
        updateStep();
    }
});

btnBack.addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        updateStep();
    }
});

document.getElementById('password').addEventListener('input', updatePasswordStrength);
registerForm.addEventListener('submit', handleSubmit);

if (btnGoogleRegister) {
    btnGoogleRegister.addEventListener('click', handleGoogleRegister);
}

window.togglePwd = togglePwd;

// Inicializar vista
updateStep();

// Auto-seleccionar tipo desde URL param (?tipo=trabajador)
const urlParams = new URLSearchParams(window.location.search);
const tipoParam = urlParams.get('tipo');
if (tipoParam === 'trabajador' || tipoParam === 'empleador') {
    const card = document.querySelector(`.user-card[data-type="${tipoParam}"]`);
    if (card) handleCardSelection(card);
}
