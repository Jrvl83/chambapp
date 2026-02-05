/**
 * Componente reutilizable para input de ratings con estrellas interactivas
 * Unifica el código duplicado de mis-aplicaciones.js y mis-aplicaciones-trabajador.js
 *
 * @module components/rating-input
 */

/**
 * Textos descriptivos para cada nivel de estrella
 */
export const TEXTOS_ESTRELLAS = {
    0: 'Selecciona una calificación',
    1: 'Muy malo',
    2: 'Malo',
    3: 'Regular',
    4: 'Bueno',
    5: 'Excelente'
};

/**
 * Clase para manejar un input de rating con estrellas
 */
export class RatingInput {
    /**
     * @param {Object} opciones - Configuración del componente
     * @param {string} opciones.containerId - ID del contenedor de estrellas (ej: 'estrellas-input')
     * @param {string} opciones.textoId - ID del elemento de texto descriptivo
     * @param {string} opciones.btnEnviarId - ID del botón de enviar (se habilita al seleccionar)
     * @param {Function} opciones.onSelect - Callback al seleccionar una estrella
     * @param {Object} opciones.textos - Textos personalizados para cada nivel (opcional)
     */
    constructor(opciones = {}) {
        this.containerId = opciones.containerId || 'estrellas-input';
        this.textoId = opciones.textoId || 'estrellas-texto';
        this.btnEnviarId = opciones.btnEnviarId || 'btn-enviar-calificacion';
        this.onSelect = opciones.onSelect || null;
        this.textos = opciones.textos || TEXTOS_ESTRELLAS;

        this.puntuacion = 0;
        this._eventosInicializados = false;
    }

    /**
     * Obtiene la puntuación actual
     * @returns {number}
     */
    getPuntuacion() {
        return this.puntuacion;
    }

    /**
     * Selecciona un valor de estrellas
     * @param {number} valor - Valor de 1 a 5
     */
    seleccionar(valor) {
        this.puntuacion = valor;

        const container = document.getElementById(this.containerId);
        if (!container) return;

        const estrellas = container.querySelectorAll('.estrella');
        estrellas.forEach((estrella, index) => {
            if (index < valor) {
                estrella.classList.add('active');
                estrella.textContent = '★';
            } else {
                estrella.classList.remove('active');
                estrella.textContent = '☆';
            }
        });

        // Actualizar texto descriptivo
        const textoEl = document.getElementById(this.textoId);
        if (textoEl) {
            textoEl.textContent = this.textos[valor] || '';
            textoEl.classList.add('selected');
        }

        // Habilitar botón de enviar
        const btnEnviar = document.getElementById(this.btnEnviarId);
        if (btnEnviar) {
            btnEnviar.disabled = false;
        }

        // Callback
        if (this.onSelect) {
            this.onSelect(valor);
        }
    }

    /**
     * Resetea el rating a 0
     */
    resetear() {
        this.puntuacion = 0;

        const container = document.getElementById(this.containerId);
        if (container) {
            const estrellas = container.querySelectorAll('.estrella');
            estrellas.forEach(estrella => {
                estrella.classList.remove('active', 'hover');
                estrella.textContent = '☆';
            });
        }

        const textoEl = document.getElementById(this.textoId);
        if (textoEl) {
            textoEl.textContent = this.textos[0] || 'Selecciona una calificación';
            textoEl.classList.remove('selected');
        }

        const btnEnviar = document.getElementById(this.btnEnviarId);
        if (btnEnviar) {
            btnEnviar.disabled = true;
        }
    }

    /**
     * Inicializa los eventos de hover en las estrellas
     */
    inicializarEventos() {
        if (this._eventosInicializados) return;

        const container = document.getElementById(this.containerId);
        if (!container) return;

        const estrellas = container.querySelectorAll('.estrella');

        // Hover en cada estrella
        estrellas.forEach((estrella, index) => {
            estrella.addEventListener('mouseenter', () => {
                estrellas.forEach((e, i) => {
                    if (i <= index) {
                        e.classList.add('hover');
                        e.textContent = '★';
                    } else if (!e.classList.contains('active')) {
                        e.classList.remove('hover');
                        e.textContent = '☆';
                    }
                });
            });
        });

        // Mouse leave del contenedor
        container.addEventListener('mouseleave', () => {
            estrellas.forEach((e, i) => {
                e.classList.remove('hover');
                if (i < this.puntuacion) {
                    e.textContent = '★';
                } else {
                    e.textContent = '☆';
                }
            });
        });

        this._eventosInicializados = true;
    }
}

/**
 * Crea e inicializa un RatingInput con configuración simplificada
 * @param {string} sufijo - Sufijo para los IDs (ej: '' para trabajador, '-empleador' para empleador)
 * @param {Function} onSelect - Callback al seleccionar
 * @returns {RatingInput}
 */
export function crearRatingInput(sufijo = '', onSelect = null) {
    const ratingInput = new RatingInput({
        containerId: `estrellas-input${sufijo}`,
        textoId: `estrellas-texto${sufijo}`,
        btnEnviarId: `btn-enviar-calificacion${sufijo}`,
        onSelect
    });

    // Inicializar eventos cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ratingInput.inicializarEventos());
    } else {
        ratingInput.inicializarEventos();
    }

    return ratingInput;
}

/**
 * Inicializa el contador de caracteres para un textarea de comentario
 * @param {string} inputId - ID del textarea
 * @param {string} counterId - ID del elemento contador
 */
export function inicializarContadorComentario(inputId, counterId) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(counterId);

    if (input && counter) {
        input.addEventListener('input', (e) => {
            counter.textContent = e.target.value.length;
        });
    }
}

/**
 * Configura el cierre de un modal con ESC y click fuera
 * @param {string} modalId - ID del modal
 * @param {Function} cerrarFn - Función para cerrar el modal
 */
export function configurarCierreModal(modalId, cerrarFn) {
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById(modalId);
            if (modal && modal.classList.contains('active')) {
                cerrarFn();
            }
        }
    });

    // Click fuera del modal
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarFn();
            }
        });
    }
}
