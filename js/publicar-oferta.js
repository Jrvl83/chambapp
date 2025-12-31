// ============================================
// PUBLICAR OFERTA - FORMULARIO MULTI-PASO
// ChambApp - JavaScript con Validación
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Inicializar Firebase
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Verificar autenticación
const usuarioStr = localStorage.getItem('usuarioChambApp');
if (!usuarioStr) {
    alert('Debes iniciar sesión para publicar ofertas');
    window.location.href = 'login.html';
}

const usuario = JSON.parse(usuarioStr);

// Verificar que sea empleador
if (usuario.tipo !== 'empleador') {
    alert('Solo los empleadores pueden publicar ofertas');
    window.location.href = 'dashboard.html';
}

// ============================================
// VARIABLES GLOBALES
// ============================================
let currentStep = 1;
const totalSteps = 4;

const formSteps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.progress-steps .step');
const progressFill = document.getElementById('progressFill');
const currentStepDisplay = document.getElementById('currentStep');

const btnPrevious = document.getElementById('btnPrevious');
const btnNext = document.getElementById('btnNext');
const btnSubmit = document.getElementById('btnSubmit');
const formOferta = document.getElementById('formOferta');

// ============================================
// CHARACTER COUNTERS
// ============================================
const titulo = document.getElementById('titulo');
const descripcion = document.getElementById('descripcion');

titulo.addEventListener('input', () => {
    document.getElementById('titulo-count').textContent = titulo.value.length;
});

descripcion.addEventListener('input', () => {
    document.getElementById('descripcion-count').textContent = descripcion.value.length;
});

// ============================================
// NAVEGACIÓN ENTRE PASOS
// ============================================
function showStep(step) {
    // Ocultar todos los pasos
    formSteps.forEach(s => s.classList.remove('active'));
    
    // Mostrar paso actual
    const currentFormStep = document.querySelector(`.form-step[data-step="${step}"]`);
    if (currentFormStep) {
        currentFormStep.classList.add('active');
    }
    
    // Actualizar indicadores de progreso
    progressSteps.forEach((s, index) => {
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
    progressFill.style.width = `${progressPercent}%`;
    
    // Actualizar display de paso actual
    currentStepDisplay.textContent = step;
    
    // Mostrar/ocultar botones
    btnPrevious.style.display = step === 1 ? 'none' : 'inline-flex';
    
    if (step === totalSteps) {
        btnNext.style.display = 'none';
        btnSubmit.style.display = 'inline-flex';
        updateReviewSection();
    } else {
        btnNext.style.display = 'inline-flex';
        btnSubmit.style.display = 'none';
    }
    
    // Scroll suave al inicio del formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// VALIDACIÓN POR PASO
// ============================================
function validateStep(step) {
    let isValid = true;
    
    if (step === 1) {
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
    }
    
    if (step === 2) {
        // Validar ubicación
        const ubicacion = document.getElementById('ubicacion');
        if (!ubicacion.value.trim()) {
            showError('ubicacion', 'La ubicación es obligatoria');
            isValid = false;
        } else {
            hideError('ubicacion');
        }
        
        // Validar salario
        const salario = document.getElementById('salario');
        if (!salario.value.trim()) {
            showError('salario', 'El salario es obligatorio');
            isValid = false;
        } else {
            hideError('salario');
        }
    }
    
    // Paso 3 y 4 son opcionales
    
    return isValid;
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);
    
    field.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function hideError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);
    
    field.classList.remove('error');
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

// ============================================
// ACTUALIZAR SECCIÓN DE REVISIÓN
// ============================================
function updateReviewSection() {
    // Información Básica
    document.getElementById('review-titulo').textContent = 
        document.getElementById('titulo').value || '-';
    
    const categoriaSelect = document.getElementById('categoria');
    document.getElementById('review-categoria').textContent = 
        categoriaSelect.options[categoriaSelect.selectedIndex].text || '-';
    
    document.getElementById('review-descripcion').textContent = 
        document.getElementById('descripcion').value || '-';
    
    // Detalles del Trabajo
    document.getElementById('review-ubicacion').textContent = 
        document.getElementById('ubicacion').value || '-';
    
    document.getElementById('review-salario').textContent = 
        document.getElementById('salario').value || '-';
    
    const duracion = document.getElementById('duracion').value;
    document.getElementById('review-duracion').textContent = 
        duracion || 'No especificado';
    
    const horario = document.getElementById('horario').value;
    document.getElementById('review-horario').textContent = 
        horario || 'No especificado';
    
    // Requisitos
    const experienciaSelect = document.getElementById('experiencia');
    const experienciaValue = experienciaSelect.value;
    document.getElementById('review-experiencia').textContent = 
        experienciaValue ? experienciaSelect.options[experienciaSelect.selectedIndex].text : 'No especificado';
    
    const habilidades = document.getElementById('habilidades').value;
    const habilidadesContainer = document.getElementById('review-habilidades-container');
    if (habilidades) {
        habilidadesContainer.style.display = 'flex';
        document.getElementById('review-habilidades').textContent = habilidades;
    } else {
        habilidadesContainer.style.display = 'none';
    }
}

// ============================================
// EVENT LISTENERS - NAVEGACIÓN
// ============================================
btnNext.addEventListener('click', () => {
    if (validateStep(currentStep)) {
        currentStep++;
        showStep(currentStep);
    } else {
        if (typeof toastWarning === 'function') {
            toastWarning('Por favor completa todos los campos obligatorios');
        }
    }
});

btnPrevious.addEventListener('click', () => {
    currentStep--;
    showStep(currentStep);
});

// ============================================
// SUBMIT FORM
// ============================================
formOferta.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Deshabilitar botón submit
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Publicando...';
    
    try {
        // Recopilar datos del formulario
        const oferta = {
            titulo: document.getElementById('titulo').value.trim(),
            categoria: document.getElementById('categoria').value,
            descripcion: document.getElementById('descripcion').value.trim(),
            ubicacion: document.getElementById('ubicacion').value.trim(),
            salario: document.getElementById('salario').value.trim(),
            duracion: document.getElementById('duracion').value.trim() || 'No especificada',
            horario: document.getElementById('horario').value.trim() || 'No especificado',
            experiencia: document.getElementById('experiencia').value || 'No especificada',
            habilidades: document.getElementById('habilidades').value.trim() || 'No especificadas',
            requisitosAdicionales: document.getElementById('requisitos-adicionales').value.trim() || 'Ninguno',
            requiereHerramientas: document.getElementById('herramientas').checked,
            requiereTransporte: document.getElementById('transporte').checked,
            requiereEquipos: document.getElementById('equipos').checked,
            empleadorId: auth.currentUser?.uid || usuario.uid || 'demo',
            empleadorNombre: usuario.nombre,
            empleadorEmail: usuario.email,
            empleadorTelefono: usuario.telefono || '',
            estado: 'activa',
            fechaCreacion: serverTimestamp(),
            aplicaciones: 0
        };
        
        // Guardar en Firestore
        await addDoc(collection(db, 'ofertas'), oferta);
        
        // Toast de éxito
        if (typeof toastSuccess === 'function') {
            toastSuccess('¡Oferta publicada exitosamente! 🎉');
        }
        
        // Redirigir al dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error al publicar oferta:', error);
        
        // Restaurar botón
        btnSubmit.disabled = false;
        btnSubmit.textContent = '🚀 Publicar Oferta';
        
        // Toast de error
        if (typeof toastError === 'function') {
            toastError('Error al publicar la oferta. Intenta de nuevo.');
        } else {
            alert('Error al publicar la oferta: ' + error.message);
        }
    }
});

// ============================================
// INICIALIZACIÓN
// ============================================
showStep(currentStep);

console.log('✅ Formulario multi-paso cargado correctamente');
