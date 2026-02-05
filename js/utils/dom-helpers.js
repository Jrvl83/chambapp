// ============================================
// DOM-HELPERS.JS - ChambApp
// Funciones auxiliares para manipulación del DOM
// ============================================

/**
 * Escapar HTML para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} - Texto escapado seguro para HTML
 */
export function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Alias en español para escapeHtml
 * @param {string} text - Texto a escapar
 * @returns {string} - Texto escapado seguro para HTML
 */
export function escaparHTML(text) {
    return escapeHtml(text);
}

/**
 * Crear elemento HTML con atributos y contenido
 * @param {string} tag - Nombre del tag (div, span, etc.)
 * @param {Object} attrs - Atributos del elemento {class: 'foo', id: 'bar'}
 * @param {string|HTMLElement|Array} children - Contenido hijo
 * @returns {HTMLElement} - Elemento creado
 */
export function crearElemento(tag, attrs = {}, children = null) {
    const element = document.createElement(tag);

    // Aplicar atributos
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'class' || key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('data-')) {
            element.setAttribute(key, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            const event = key.substring(2).toLowerCase();
            element.addEventListener(event, value);
        } else {
            element[key] = value;
        }
    });

    // Agregar hijos
    if (children !== null) {
        if (typeof children === 'string') {
            element.innerHTML = children;
        } else if (children instanceof HTMLElement) {
            element.appendChild(children);
        } else if (Array.isArray(children)) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof HTMLElement) {
                    element.appendChild(child);
                }
            });
        }
    }

    return element;
}

/**
 * Mostrar/ocultar elemento
 * @param {string|HTMLElement} element - ID o elemento
 * @param {boolean} visible - true para mostrar, false para ocultar
 */
export function toggleVisibility(element, visible) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.style.display = visible ? '' : 'none';
    }
}

/**
 * Agregar clase a elemento
 * @param {string|HTMLElement} element - ID o elemento
 * @param {string} className - Nombre de la clase
 */
export function addClass(element, className) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.classList.add(className);
    }
}

/**
 * Remover clase de elemento
 * @param {string|HTMLElement} element - ID o elemento
 * @param {string} className - Nombre de la clase
 */
export function removeClass(element, className) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.classList.remove(className);
    }
}

/**
 * Toggle clase de elemento
 * @param {string|HTMLElement} element - ID o elemento
 * @param {string} className - Nombre de la clase
 * @param {boolean} force - Forzar agregar/remover
 */
export function toggleClass(element, className, force = undefined) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        el.classList.toggle(className, force);
    }
}

/**
 * Obtener elemento por ID con type safety
 * @param {string} id - ID del elemento
 * @returns {HTMLElement|null}
 */
export function getById(id) {
    return document.getElementById(id);
}

/**
 * Query selector con type safety
 * @param {string} selector - Selector CSS
 * @param {HTMLElement} parent - Elemento padre (opcional)
 * @returns {HTMLElement|null}
 */
export function qs(selector, parent = document) {
    return parent.querySelector(selector);
}

/**
 * Query selector all con type safety
 * @param {string} selector - Selector CSS
 * @param {HTMLElement} parent - Elemento padre (opcional)
 * @returns {NodeList}
 */
export function qsa(selector, parent = document) {
    return parent.querySelectorAll(selector);
}
