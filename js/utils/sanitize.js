// ============================================
// SANITIZE.JS - ChambApp
// Funciones de sanitizacion y validacion de inputs
// Previene XSS y otros ataques de inyeccion
// ============================================

/**
 * Sanitizar texto HTML - Previene XSS
 * Escapa caracteres peligrosos
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export function sanitizeHTML(text) {
    if (!text || typeof text !== 'string') return '';

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    return text.replace(/[&<>"'`=/]/g, char => map[char]);
}

/**
 * Sanitizar texto para almacenar en base de datos
 * Remueve etiquetas HTML pero mantiene el texto
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto limpio
 */
export function sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';

    // Remover etiquetas HTML
    let clean = text.replace(/<[^>]*>/g, '');

    // Remover scripts inline
    clean = clean.replace(/javascript:/gi, '');
    clean = clean.replace(/on\w+=/gi, '');

    // Trim espacios
    return clean.trim();
}

/**
 * Sanitizar email
 * @param {string} email - Email a validar
 * @returns {string} Email sanitizado o vacio si invalido
 */
export function sanitizeEmail(email) {
    if (!email || typeof email !== 'string') return '';

    const cleaned = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(cleaned) ? cleaned : '';
}

/**
 * Sanitizar numero de telefono (Peru)
 * @param {string} phone - Telefono a sanitizar
 * @returns {string} Telefono solo con digitos
 */
export function sanitizePhone(phone) {
    if (!phone || typeof phone !== 'string') return '';

    // Solo mantener digitos
    return phone.replace(/\D/g, '');
}

/**
 * Sanitizar URL
 * @param {string} url - URL a validar
 * @returns {string} URL sanitizada o vacio si invalida
 */
export function sanitizeURL(url) {
    if (!url || typeof url !== 'string') return '';

    const cleaned = url.trim();

    // Solo permitir http, https
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
        return '';
    }

    // Bloquear javascript:
    if (cleaned.toLowerCase().includes('javascript:')) {
        return '';
    }

    return cleaned;
}

/**
 * Sanitizar objeto completo
 * Aplica sanitizeText a todos los campos string
 * @param {object} obj - Objeto a sanitizar
 * @returns {object} Objeto con campos sanitizados
 */
export function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return {};

    const sanitized = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeText(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

/**
 * Validar y sanitizar datos de oferta
 * @param {object} oferta - Datos de la oferta
 * @returns {object} Oferta sanitizada
 */
export function sanitizeOferta(oferta) {
    return {
        titulo: sanitizeText(oferta.titulo || ''),
        descripcion: sanitizeText(oferta.descripcion || ''),
        categoria: sanitizeText(oferta.categoria || ''),
        salario: sanitizeText(oferta.salario || ''),
        ubicacion: sanitizeText(oferta.ubicacion || ''),
        duracion: sanitizeText(oferta.duracion || ''),
        horario: sanitizeText(oferta.horario || ''),
        requisitos: sanitizeText(oferta.requisitos || '')
    };
}

/**
 * Validar y sanitizar datos de perfil
 * @param {object} perfil - Datos del perfil
 * @returns {object} Perfil sanitizado
 */
export function sanitizePerfil(perfil) {
    return {
        nombre: sanitizeText(perfil.nombre || ''),
        telefono: sanitizePhone(perfil.telefono || ''),
        ubicacion: sanitizeText(perfil.ubicacion || ''),
        bio: sanitizeText(perfil.bio || ''),
        email: sanitizeEmail(perfil.email || '')
    };
}

// Exponer globalmente para scripts no-module
window.sanitizeHTML = sanitizeHTML;
window.sanitizeText = sanitizeText;
window.sanitizeEmail = sanitizeEmail;
window.sanitizePhone = sanitizePhone;
window.sanitizeURL = sanitizeURL;
window.sanitizeObject = sanitizeObject;
window.sanitizeOferta = sanitizeOferta;
window.sanitizePerfil = sanitizePerfil;
