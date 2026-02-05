/**
 * Módulo de navegación del formulario multi-paso
 * Maneja: navegación entre pasos, validación, character counters, sección de revisión
 *
 * @module publicar-oferta/form-navigation
 */

// ============================================
// VARIABLES DE ESTADO (recibidas de index.js)
// ============================================
let state = null;

/**
 * Inicializa el módulo con el estado compartido
 * @param {Object} sharedState - Estado compartido del formulario
 */
export function initFormNavigation(sharedState) {
    state = sharedState;
    initCharacterCounters();
    initNavigationListeners();
}

// ============================================
// CHARACTER COUNTERS
// ============================================
function initCharacterCounters() {
    const titulo = document.getElementById('titulo');
    const descripcion = document.getElementById('descripcion');

    if (titulo) {
        titulo.addEventListener('input', () => {
            const counter = document.getElementById('titulo-count');
            if (counter) counter.textContent = titulo.value.length;
        });
    }

    if (descripcion) {
        descripcion.addEventListener('input', () => {
            const counter = document.getElementById('descripcion-count');
            if (counter) counter.textContent = descripcion.value.length;
        });
    }
}

// ============================================
// NAVEGACIÓN ENTRE PASOS
// ============================================

/**
 * Muestra un paso específico del formulario
 * @param {number} step - Número del paso (1-4)
 */
export async function showStep(step) {
    const { elements, totalSteps, callbacks } = state;

    // Ocultar todos los pasos
    elements.formSteps.forEach(s => s.classList.remove('active'));

    // Mostrar paso actual
    const currentFormStep = document.querySelector(`.form-step[data-step="${step}"]`);
    if (currentFormStep) {
        currentFormStep.classList.add('active');
    }

    // Actualizar indicadores de progreso
    elements.progressSteps.forEach((s, index) => {
        if (index < step - 1) {
            s.classList.add('completed');
            s.classList.remove('active');
        } else if (index === step - 1) {
            s.classList.add('active');
            s.classList.remove('completed');
        } else {
            s.classList.remove('active', 'completed');
        }
    });

    // Actualizar barra de progreso
    const progressPercent = (step / totalSteps) * 100;
    elements.progressFill.style.width = `${progressPercent}%`;

    // Actualizar display de paso actual
    elements.currentStepDisplay.textContent = step;

    // Mostrar/ocultar botones
    elements.btnPrevious.style.display = step === 1 ? 'none' : 'inline-flex';

    if (step === totalSteps) {
        elements.btnNext.style.display = 'none';
        elements.btnSubmit.style.display = 'inline-flex';
        await updateReviewSection();
    } else {
        elements.btnNext.style.display = 'inline-flex';
        elements.btnSubmit.style.display = 'none';
    }

    // Scroll suave al inicio del formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// VALIDACIÓN POR PASO
// ============================================

/**
 * Valida los campos del paso actual
 * @param {number} step - Número del paso a validar
 * @returns {boolean} - true si es válido
 */
export function validateStep(step) {
    let isValid = true;

    if (step === 1) {
        isValid = validateStep1() && isValid;
    }

    if (step === 2) {
        isValid = validateStep2() && isValid;
    }

    // Pasos 3 y 4 son opcionales
    return isValid;
}

function validateStep1() {
    let isValid = true;

    // Validar título
    const titulo = document.getElementById('titulo');
    if (!titulo.value.trim()) {
        showError('titulo', 'El título es obligatorio');
        isValid = false;
    } else if (titulo.value.trim().length < 10) {
        showError('titulo', 'El título debe tener al menos 10 caracteres');
        isValid = false;
    } else {
        hideError('titulo');
    }

    // Validar categoría
    const categoria = document.getElementById('categoria');
    if (!categoria.value) {
        showError('categoria', 'Selecciona una categoría');
        isValid = false;
    } else {
        hideError('categoria');
    }

    // Validar descripción
    const descripcion = document.getElementById('descripcion');
    if (!descripcion.value.trim()) {
        showError('descripcion', 'La descripción es obligatoria');
        isValid = false;
    } else if (descripcion.value.trim().length < 50) {
        showError('descripcion', 'La descripción debe tener al menos 50 caracteres');
        isValid = false;
    } else {
        hideError('descripcion');
    }

    return isValid;
}

function validateStep2() {
    let isValid = true;

    // Validar departamento
    const departamento = document.getElementById('departamento');
    if (!departamento.value) {
        showError('departamento', 'Selecciona un departamento');
        isValid = false;
    } else {
        hideError('departamento');
    }

    // Validar provincia
    const provincia = document.getElementById('provincia');
    if (!provincia.value) {
        showError('provincia', 'Selecciona una provincia');
        isValid = false;
    } else {
        hideError('provincia');
    }

    // Validar distrito
    const distrito = document.getElementById('distrito');
    if (!distrito.value) {
        showError('distrito', 'Selecciona un distrito');
        isValid = false;
    } else {
        hideError('distrito');
    }

    // Validar salario
    const salario = document.getElementById('salario');
    if (!salario.value.trim()) {
        showError('salario', 'El salario es obligatorio');
        isValid = false;
    } else {
        hideError('salario');
    }

    // Validar vacantes
    const vacantes = document.getElementById('vacantes');
    const vacantesVal = parseInt(vacantes.value) || 0;
    if (vacantesVal < 1 || vacantesVal > 20) {
        showError('vacantes', 'Las vacantes deben ser entre 1 y 20');
        isValid = false;
    } else {
        hideError('vacantes');
    }

    return isValid;
}

/**
 * Muestra un mensaje de error en un campo
 */
export function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (field) field.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

/**
 * Oculta el mensaje de error de un campo
 */
export function hideError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (field) field.classList.remove('error');
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

// ============================================
// SECCIÓN DE REVISIÓN
// ============================================

/**
 * Actualiza la sección de revisión con los datos del formulario
 */
async function updateReviewSection() {
    const { callbacks } = state;

    // Información Básica
    document.getElementById('review-titulo').textContent =
        document.getElementById('titulo').value || '-';

    const categoriaSelect = document.getElementById('categoria');
    document.getElementById('review-categoria').textContent =
        categoriaSelect.options[categoriaSelect.selectedIndex]?.text || '-';

    document.getElementById('review-descripcion').textContent =
        document.getElementById('descripcion').value || '-';

    // Detalles del Trabajo - Ubicación
    if (callbacks.obtenerUbicacionCompleta) {
        const ubicacion = await callbacks.obtenerUbicacionCompleta();
        if (ubicacion) {
            document.getElementById('review-ubicacion').textContent =
                `${ubicacion.distrito}, ${ubicacion.provincia}, ${ubicacion.departamento}`;

            // Dirección exacta
            const direccionContainer = document.getElementById('review-direccion-exacta-container');
            if (direccionContainer) {
                if (ubicacion.direccion_exacta) {
                    direccionContainer.style.display = 'flex';
                    document.getElementById('review-direccion-exacta').textContent = ubicacion.direccion_exacta;
                } else {
                    direccionContainer.style.display = 'none';
                }
            }

            // Referencia
            const referenciaContainer = document.getElementById('review-referencia-container');
            if (referenciaContainer) {
                if (ubicacion.referencia) {
                    referenciaContainer.style.display = 'flex';
                    document.getElementById('review-referencia').textContent = ubicacion.referencia;
                } else {
                    referenciaContainer.style.display = 'none';
                }
            }
        } else {
            document.getElementById('review-ubicacion').textContent = '-';
        }
    }

    document.getElementById('review-salario').textContent =
        document.getElementById('salario').value || '-';

    const duracion = document.getElementById('duracion').value;
    document.getElementById('review-duracion').textContent =
        duracion || 'No especificado';

    const horario = document.getElementById('horario').value;
    document.getElementById('review-horario').textContent =
        horario || 'No especificado';

    const vacantesInput = document.getElementById('vacantes');
    const vacantesValue = vacantesInput ? parseInt(vacantesInput.value) || 1 : 1;
    const reviewVacantes = document.getElementById('review-vacantes');
    if (reviewVacantes) {
        reviewVacantes.textContent = vacantesValue === 1 ? '1 persona' : `${vacantesValue} personas`;
    }

    // Requisitos
    const experienciaSelect = document.getElementById('experiencia');
    const experienciaValue = experienciaSelect.value;
    document.getElementById('review-experiencia').textContent =
        experienciaValue ? experienciaSelect.options[experienciaSelect.selectedIndex].text : 'No especificado';

    const habilidades = document.getElementById('habilidades').value;
    const habilidadesContainer = document.getElementById('review-habilidades-container');
    if (habilidadesContainer) {
        if (habilidades) {
            habilidadesContainer.style.display = 'flex';
            document.getElementById('review-habilidades').textContent = habilidades;
        } else {
            habilidadesContainer.style.display = 'none';
        }
    }

    // Fotos
    if (callbacks.actualizarReviewFotos) {
        callbacks.actualizarReviewFotos();
    }
}

// ============================================
// EVENT LISTENERS - NAVEGACIÓN
// ============================================
function initNavigationListeners() {
    const { elements, callbacks } = state;

    elements.btnNext.addEventListener('click', () => {
        if (validateStep(state.currentStep)) {
            state.currentStep++;
            showStep(state.currentStep);
        } else {
            if (typeof toastWarning === 'function') {
                toastWarning('Por favor completa todos los campos obligatorios');
            }
        }
    });

    elements.btnPrevious.addEventListener('click', () => {
        state.currentStep--;
        showStep(state.currentStep);
    });
}
