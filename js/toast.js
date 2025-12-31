// ============================================
// TOAST NOTIFICATIONS SYSTEM
// ChambApp - Sistema de Feedback Visual
// ============================================

/**
 * Muestra una notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'info', 'warning'
 * @param {number} duration - Duración en ms (default: 3000)
 * @param {object} options - Opciones adicionales
 */
function showToast(message, type = 'info', duration = 3000, options = {}) {
    // Opciones por defecto
    const config = {
        showCloseButton: true,
        position: 'bottom-center', // bottom-center, top-center, top-right
        dismissible: true,
        showProgressBar: true,
        ...options
    };
    
    // Crear contenedor si no existe
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Crear elemento toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Agregar role para accesibilidad
    if (type === 'error' || type === 'warning') {
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
    } else {
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
    }
    
    // Icono según tipo
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    // Construir contenido
    let toastHTML = `
        <span class="toast-icon" aria-hidden="true">${icons[type] || 'ℹ'}</span>
        <div class="toast-content">${message}</div>
    `;
    
    // Agregar botón de cerrar si está habilitado
    if (config.showCloseButton) {
        toastHTML += `
            <button class="toast-close" aria-label="Cerrar notificación" type="button">
                ×
            </button>
        `;
    }
    
    toast.innerHTML = toastHTML;
    
    // Agregar al contenedor
    container.appendChild(toast);
    
    // Función para remover toast
    const removeToast = () => {
        toast.classList.add('toast-exit');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            // Remover contenedor si está vacío
            if (container.children.length === 0 && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }, 300); // Duración de animación de salida
    };
    
    // Auto-dismiss después de la duración
    let autoCloseTimer;
    if (duration > 0) {
        autoCloseTimer = setTimeout(removeToast, duration);
    }
    
    // Click en botón cerrar
    if (config.showCloseButton) {
        const closeButton = toast.querySelector('.toast-close');
        closeButton.addEventListener('click', () => {
            clearTimeout(autoCloseTimer);
            removeToast();
        });
    }
    
    // Click en el toast para cerrar (si dismissible)
    if (config.dismissible) {
        toast.addEventListener('click', (e) => {
            // No cerrar si hicieron click en el botón de cerrar
            if (!e.target.closest('.toast-close')) {
                clearTimeout(autoCloseTimer);
                removeToast();
            }
        });
    }
    
    // Pausar auto-close en hover
    toast.addEventListener('mouseenter', () => {
        clearTimeout(autoCloseTimer);
    });
    
    toast.addEventListener('mouseleave', () => {
        if (duration > 0) {
            autoCloseTimer = setTimeout(removeToast, 1000); // 1 segundo extra
        }
    });
    
    return toast;
}

// ============================================
// FUNCIONES DE ATAJO
// ============================================

/**
 * Toast de éxito
 */
function toastSuccess(message, duration = 3000) {
    return showToast(message, 'success', duration);
}

/**
 * Toast de error
 */
function toastError(message, duration = 4000) {
    return showToast(message, 'error', duration);
}

/**
 * Toast de información
 */
function toastInfo(message, duration = 3000) {
    return showToast(message, 'info', duration);
}

/**
 * Toast de advertencia
 */
function toastWarning(message, duration = 3500) {
    return showToast(message, 'warning', duration);
}

/**
 * Toast de carga (permanente hasta que se cierre manualmente)
 */
function toastLoading(message) {
    return showToast(message, 'info', 0, {
        showCloseButton: false,
        dismissible: false,
        showProgressBar: false
    });
}

// ============================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================
window.showToast = showToast;
window.toastSuccess = toastSuccess;
window.toastError = toastError;
window.toastInfo = toastInfo;
window.toastWarning = toastWarning;
window.toastLoading = toastLoading;

// ============================================
// EJEMPLOS DE USO
// ============================================

/*

// Básico
showToast('Operación exitosa', 'success');

// Con duración personalizada
showToast('Procesando...', 'info', 5000);

// Funciones de atajo
toastSuccess('¡Aplicación enviada!');
toastError('No se pudo cargar las ofertas');
toastInfo('Revisa tu conexión a internet');
toastWarning('Esta acción no se puede deshacer');

// Toast de carga (se cierra manualmente)
const loadingToast = toastLoading('Cargando ofertas...');
// Cuando termine:
loadingToast.remove();

// Con opciones personalizadas
showToast('Oferta publicada', 'success', 3000, {
    showCloseButton: false,
    dismissible: true
});

// INTEGRACIÓN CON TU CÓDIGO EXISTENTE:

// En login.js - Reemplazar:
// errorMessage.textContent = 'Email o contraseña incorrectos';
// errorMessage.style.display = 'block';
// Por:
toastError('Email o contraseña incorrectos');

// En publicar-oferta.js - Reemplazar:
// mostrarMensaje('Oferta publicada con éxito', 'success');
// Por:
toastSuccess('¡Oferta publicada con éxito!');

// En dashboard.js - Al cargar ofertas:
const loading = toastLoading('Cargando ofertas...');
try {
    await cargarOfertas();
    loading.remove();
    toastSuccess('Ofertas cargadas');
} catch (error) {
    loading.remove();
    toastError('Error al cargar ofertas. Verifica tu conexión.');
}

// Al aplicar a oferta:
try {
    await aplicarOferta(ofertaId);
    toastSuccess('¡Aplicación enviada exitosamente!');
} catch (error) {
    toastError('No se pudo enviar la aplicación. Intenta de nuevo.');
}

// Al editar oferta:
toastSuccess('Oferta actualizada');

// Al eliminar oferta:
toastSuccess('Oferta eliminada');

*/
