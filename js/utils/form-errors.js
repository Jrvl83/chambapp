// ============================================
// FORM-ERRORS.JS - UI para errores inline
// Generaliza el patrón de publicar-oferta/form-navigation.js
// Requiere: <span class="error-message" id="{fieldId}-error"></span>
// ============================================

/**
 * Muestra error inline debajo de un campo
 * @param {string} fieldId - ID del input
 * @param {string} message - Mensaje de error
 */
export function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);

    if (field) field.classList.add('error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
    }
}

/**
 * Oculta error inline de un campo
 * @param {string} fieldId - ID del input
 */
export function hideFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);

    if (field) field.classList.remove('error');
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('show');
    }
}

/**
 * Valida un campo usando una función validadora y muestra/oculta error
 * @param {string} fieldId - ID del input
 * @param {Function} validatorFn - Función que recibe valor y retorna { valid, error }
 * @returns {boolean} true si es válido
 */
export function validateField(fieldId, validatorFn) {
    const field = document.getElementById(fieldId);
    if (!field) return true;

    const result = validatorFn(field.value);
    if (result.valid) {
        hideFieldError(fieldId);
    } else {
        showFieldError(fieldId, result.error);
    }
    return result.valid;
}

// Exponer globalmente para scripts no-module
window.showFieldError = showFieldError;
window.hideFieldError = hideFieldError;
window.validateField = validateField;
