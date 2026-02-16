// ============================================
// CONFIRM-MODAL.JS - Modal de confirmación customizado
// Reemplaza confirm() nativo del navegador
// Retorna Promise<boolean> para uso con await
// Reutiliza css/modal.css
// ============================================

const ICONOS = {
    warning: '⚠️',
    danger: '🗑️',
    info: 'ℹ️'
};

/**
 * Muestra modal de confirmación customizado
 * @param {Object} opciones
 * @param {string} opciones.titulo - Título del modal
 * @param {string} opciones.mensaje - Mensaje descriptivo
 * @param {string} [opciones.textoConfirmar='Confirmar'] - Texto del botón confirmar
 * @param {string} [opciones.textoCancelar='Cancelar'] - Texto del botón cancelar
 * @param {string} [opciones.tipo='warning'] - 'warning' | 'danger' | 'info'
 * @returns {Promise<boolean>} true si confirmó, false si canceló
 */
export function confirmar({
    titulo = 'Confirmar acción',
    mensaje,
    textoConfirmar = 'Confirmar',
    textoCancelar = 'Cancelar',
    tipo = 'warning'
}) {
    return new Promise((resolve) => {
        const overlay = obtenerOverlay();
        const body = document.getElementById('confirm-body');

        body.innerHTML = renderContenido(
            titulo, mensaje, textoConfirmar, textoCancelar, tipo
        );

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        const cleanup = (result) => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            resolve(result);
        };

        body.querySelector('#confirm-ok').onclick = () => cleanup(true);
        body.querySelector('#confirm-cancel').onclick = () => cleanup(false);
        overlay.onclick = (e) => {
            if (e.target === overlay) cleanup(false);
        };
    });
}

function obtenerOverlay() {
    let overlay = document.getElementById('confirm-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'confirm-overlay';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content modal-content--sm">
                <div class="modal-body" id="confirm-body"></div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    return overlay;
}

function renderContenido(titulo, mensaje, textoConfirmar, textoCancelar, tipo) {
    const icono = ICONOS[tipo] || ICONOS.warning;
    const btnClass = tipo === 'danger' ? 'btn-danger' : 'btn-primary';

    return `
        <div style="text-align:center; padding:1rem;">
            <div style="font-size:2.5rem; margin-bottom:1rem;">${icono}</div>
            <h3 style="margin-bottom:0.5rem; color:var(--dark);">${titulo}</h3>
            <p style="color:var(--gray-600); margin-bottom:1.5rem;">${mensaje}</p>
            <div style="display:flex; gap:0.75rem;">
                <button class="btn btn-secondary" id="confirm-cancel" style="flex:1;">
                    ${textoCancelar}
                </button>
                <button class="btn ${btnClass}" id="confirm-ok" style="flex:1;">
                    ${textoConfirmar}
                </button>
            </div>
        </div>
    `;
}

// Exponer globalmente
window.confirmar = confirmar;
