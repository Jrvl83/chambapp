// ============================================
// REGISTER.JS - Lógica de registro
// ChambApp - Sistema de registro multi-paso
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

// ============================================
// FUNCIONES DE NAVEGACIÓN
// ============================================

/**
 * Actualizar la vista según el paso actual
 * Muestra/oculta pasos y actualiza indicadores
 */
function updateStep() {
    // Actualizar steps visibles
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${currentStep}`).classList.add('active');

    // Actualizar dots de progreso
    document.querySelectorAll('.step-dot').forEach((dot, i) => {
        dot.classList.remove('active', 'completed');
        if (i + 1 < currentStep) dot.classList.add('completed');
        if (i + 1 === currentStep) dot.classList.add('active');
    });

    // Actualizar botones
    btnBack.style.display = currentStep > 1 ? 'flex' : 'none';
    btnNext.style.display = currentStep < 3 ? 'flex' : 'none';
    btnSubmit.style.display = currentStep === 3 ? 'flex' : 'none';
}

// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

/**
 * Validar paso 1: Tipo de usuario
 * @returns {boolean}
 */
function validarPaso1() {
    if (!selectedType) {
        document.getElementById('tipoError').classList.add('show');
        return false;
    }
    return true;
}

/**
 * Validar paso 2: Datos personales
 * @returns {boolean}
 */
function validarPaso2() {
    let valid = true;
    
    // Limpiar errores previos
    document.querySelectorAll('#step2 .error-msg').forEach(e => e.classList.remove('show'));
    
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();

    // Validar nombre
    if (nombre.length < 3) {
        document.getElementById('nombreError').textContent = 'Nombre muy corto (mínimo 3 caracteres)';
        document.getElementById('nombreError').classList.add('show');
        valid = false;
    }

    // Validar email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('emailError').textContent = 'Email inválido';
        document.getElementById('emailError').classList.add('show');
        valid = false;
    }

    // Validar teléfono
    if (telefono.length < 9) {
        document.getElementById('telefonoError').textContent = 'Teléfono inválido (mínimo 9 dígitos)';
        document.getElementById('telefonoError').classList.add('show');
        valid = false;
    }

    return valid;
}

/**
 * Validar paso 3: Contraseñas
 * @returns {boolean}
 */
function validarPaso3() {
    let valid = true;
    
    // Limpiar errores previos
    document.querySelectorAll('#step3 .error-msg').forEach(e => e.classList.remove('show'));
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;

    // Validar longitud contraseña
    if (password.length < 6) {
        document.getElementById('passwordError').textContent = 'Mínimo 6 caracteres';
        document.getElementById('passwordError').classList.add('show');
        valid = false;
    }

    // Validar coincidencia
    if (password !== confirmPassword) {
        document.getElementById('confirmError').textContent = 'Las contraseñas no coinciden';
        document.getElementById('confirmError').classList.add('show');
        valid = false;
    }

    // Validar términos
    if (!terms) {
        document.getElementById('termsError').classList.add('show');
        valid = false;
    }

    return valid;
}

/**
 * Validar el paso actual
 * @returns {boolean}
 */
function validate() {
    switch(currentStep) {
        case 1:
            return validarPaso1();
        case 2:
            return validarPaso2();
        case 3:
            return validarPaso3();
        default:
            return true;
    }
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Toggle password visibility
 * @param {string} inputId - ID del input
 * @param {HTMLElement} btn - Botón toggle
 */
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

/**
 * Manejar errores de Firebase
 * @param {Object} error - Error de Firebase
 * @returns {string} - Mensaje amigable
 */
function obtenerMensajeError(error) {
    console.error('Error en registro:', error);
    
    if (error.code === 'auth/email-already-in-use') {
        return 'Email ya registrado. Intenta con otro o inicia sesión.';
    } else if (error.code === 'auth/invalid-email') {
        return 'Email inválido. Verifica el formato.';
    } else if (error.code === 'auth/weak-password') {
        return 'Contraseña muy débil. Usa al menos 6 caracteres.';
    } else if (error.code === 'auth/network-request-failed') {
        return 'Sin conexión a internet. Verifica tu conexión.';
    } else {
        return 'Error al crear cuenta. Intenta de nuevo.';
    }
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Manejar selección de tipo de usuario
 * @param {HTMLElement} card - Tarjeta seleccionada
 */
function handleCardSelection(card) {
    // Remover selección previa
    document.querySelectorAll('.user-card').forEach(c => c.classList.remove('selected'));
    
    // Seleccionar nueva
    card.classList.add('selected');
    selectedType = card.dataset.type;
    
    // Actualizar hidden input
    document.getElementById('tipoUsuario').value = selectedType;
    
    // Ocultar error
    document.getElementById('tipoError').classList.remove('show');
}

/**
 * Manejar envío del formulario (registro final)
 * @param {Event} e - Evento del formulario
 */
async function handleSubmit(e) {
    e.preventDefault();
    
    // Validar paso final
    if (!validate()) {
        return;
    }

    // Deshabilitar botón
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Creando cuenta...';

    try {
        // 1. Crear usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            document.getElementById('email').value.trim(),
            document.getElementById('password').value
        );

        const user = userCredential.user;

        // 2. Guardar datos en Firestore
        await setDoc(doc(db, 'usuarios', user.uid), {
            uid: user.uid,
            nombre: document.getElementById('nombre').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            tipo: selectedType,
            createdAt: serverTimestamp()
        });

        // 3. Guardar en localStorage
        const usuarioData = {
            uid: user.uid,
            nombre: document.getElementById('nombre').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            tipo: selectedType
        };
        localStorage.setItem('usuarioChambApp', JSON.stringify(usuarioData));

        // 4. Mostrar éxito
        toastSuccess('¡Cuenta creada exitosamente!');

        // 5. Redirigir al dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        // Restaurar botón
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Crear Cuenta';

        // Mostrar error
        const mensaje = obtenerMensajeError(error);
        toastError(mensaje);

        // Si es email duplicado, volver al paso 2
        if (error.code === 'auth/email-already-in-use') {
            currentStep = 2;
            updateStep();
        }
    }
}

// ============================================
// PASSWORD STRENGTH
// ============================================

/**
 * Evaluar fortaleza de contraseña
 * @param {string} password
 * @returns {{ level: string, text: string }}
 */
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

/**
 * Actualizar indicador visual de fortaleza
 */
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

// Selección de tarjetas de tipo de usuario
document.querySelectorAll('.user-card').forEach(card => {
    card.addEventListener('click', () => handleCardSelection(card));
});

// Botón siguiente
btnNext.addEventListener('click', () => {
    if (validate() && currentStep < 3) {
        currentStep++;
        updateStep();
    }
});

// Botón atrás
btnBack.addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        updateStep();
    }
});

// Password strength indicator
document.getElementById('password').addEventListener('input', updatePasswordStrength);

// Submit del formulario
registerForm.addEventListener('submit', handleSubmit);

// Exponer función togglePwd globalmente
window.togglePwd = togglePwd;

// Inicializar vista
updateStep();

// ============================================
// EXPORTS (si necesario en futuro)
// ============================================
// export { handleSubmit, updateStep, validate };
