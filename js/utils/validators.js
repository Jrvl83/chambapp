// ============================================
// VALIDATORS.JS - Funciones puras de validación
// Cada función retorna { valid: boolean, error: string }
// ============================================

/**
 * Valida nombre (mínimo 3 caracteres)
 * @param {string} nombre
 * @returns {{ valid: boolean, error: string }}
 */
export function validarNombre(nombre) {
    if (!nombre || !nombre.trim()) {
        return { valid: false, error: 'El nombre es obligatorio' };
    }
    if (nombre.trim().length < 3) {
        return { valid: false, error: 'El nombre debe tener al menos 3 caracteres' };
    }
    return { valid: true, error: '' };
}

/**
 * Valida teléfono peruano (9 dígitos, empieza con 9)
 * @param {string} telefono
 * @returns {{ valid: boolean, error: string }}
 */
export function validarTelefono(telefono) {
    if (!telefono || !telefono.trim()) {
        return { valid: false, error: 'El teléfono es obligatorio' };
    }
    const digitos = telefono.replace(/\D/g, '');
    if (digitos.length !== 9) {
        return { valid: false, error: 'El teléfono debe tener 9 dígitos' };
    }
    if (!digitos.startsWith('9')) {
        return { valid: false, error: 'El teléfono debe empezar con 9' };
    }
    return { valid: true, error: '' };
}

/**
 * Valida edad mínima a partir de fecha de nacimiento
 * @param {string} fechaNacimiento - formato YYYY-MM-DD
 * @param {number} edadMinima - default 18
 * @returns {{ valid: boolean, error: string }}
 */
export function validarEdadMinima(fechaNacimiento, edadMinima = 18) {
    if (!fechaNacimiento) return { valid: true, error: '' };

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesDiff = hoy.getMonth() - nacimiento.getMonth();

    if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }

    if (edad < edadMinima) {
        return { valid: false, error: `Debes tener al menos ${edadMinima} años` };
    }
    return { valid: true, error: '' };
}

/**
 * Valida que horario fin sea posterior a horario inicio
 * @param {string} inicio - formato HH:MM
 * @param {string} fin - formato HH:MM
 * @returns {{ valid: boolean, error: string }}
 */
export function validarHorarios(inicio, fin) {
    if (!inicio || !fin) return { valid: true, error: '' };
    if (fin <= inicio) {
        return { valid: false, error: 'El horario de fin debe ser posterior al de inicio' };
    }
    return { valid: true, error: '' };
}

/**
 * Valida que año fin sea >= año inicio en experiencia
 * @param {string|number} inicio
 * @param {string|number} fin - puede ser 'Presente'
 * @returns {{ valid: boolean, error: string }}
 */
export function validarAnioExperiencia(inicio, fin) {
    if (!inicio || !fin) return { valid: true, error: '' };
    if (fin === 'Presente') return { valid: true, error: '' };
    if (parseInt(fin) < parseInt(inicio)) {
        return { valid: false, error: 'El año de fin no puede ser menor al de inicio' };
    }
    return { valid: true, error: '' };
}

// Exponer globalmente para scripts no-module
window.validarNombre = validarNombre;
window.validarTelefono = validarTelefono;
window.validarEdadMinima = validarEdadMinima;
window.validarHorarios = validarHorarios;
window.validarAnioExperiencia = validarAnioExperiencia;
