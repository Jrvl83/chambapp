// ============================================
// PUBLICAR OFERTA - FORMULARIO MULTI-PASO
// ChambApp - Con Sistema de Edición
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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
// DETECTAR MODO: CREAR O EDITAR
// ============================================
const urlParams = new URLSearchParams(window.location.search);
const ofertaId = urlParams.get('id');
const modoEdicion = !!ofertaId;

console.log(modoEdicion ? `📝 Modo Edición - ID: ${ofertaId}` : '➕ Modo Crear Nueva');

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
// CARGAR DATOS SI ESTÁ EN MODO EDICIÓN
// ============================================
if (modoEdicion) {
    cargarOfertaParaEditar(ofertaId);
}

async function cargarOfertaParaEditar(id) {
    try {
        // Mostrar loading
        if (typeof toastLoading === 'function') {
            var loadingToast = toastLoading('Cargando oferta...');
        }
        
        // Obtener oferta de Firestore
        const docRef = doc(db, 'ofertas', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            if (loadingToast) loadingToast.remove();
            if (typeof toastError === 'function') {
                toastError('No se encontró la oferta');
            }
            setTimeout(() => window.location.href = 'dashboard.html', 2000);
            return;
        }
        
        const oferta = docSnap.data();
        
        // Verificar que sea el dueño de la oferta
        if (oferta.empleadorEmail !== usuario.email) {
            if (loadingToast) loadingToast.remove();
            if (typeof toastError === 'function') {
                toastError('No tienes permiso para editar esta oferta');
            }
            setTimeout(() => window.location.href = 'dashboard.html', 2000);
            return;
        }
        
        // Pre-llenar formulario
        document.getElementById('titulo').value = oferta.titulo || '';
        document.getElementById('categoria').value = oferta.categoria || '';
        document.getElementById('descripcion').value = oferta.descripcion || '';
        document.getElementById('ubicacion').value = oferta.ubicacion || '';
        document.getElementById('salario').value = oferta.salario || '';
        document.getElementById('duracion').value = oferta.duracion === 'No especificada' ? '' : oferta.duracion || '';
        document.getElementById('horario').value = oferta.horario === 'No especificado' ? '' : oferta.horario || '';
        
        // Campos opcionales del paso 3
        if (oferta.experiencia && oferta.experiencia !== 'No especificada') {
            document.getElementById('experiencia').value = oferta.experiencia;
        }
        if (oferta.habilidades && oferta.habilidades !== 'No especificadas') {
            document.getElementById('habilidades').value = oferta.habilidades;
        }
        if (oferta.requisitosAdicionales && oferta.requisitosAdicionales !== 'Ninguno') {
            document.getElementById('requisitos-adicionales').value = oferta.requisitosAdicionales;
        }
        
        // Checkboxes
        if (oferta.requiereHerramientas) {
            document.getElementById('herramientas').checked = true;
        }
        if (oferta.requiereTransporte) {
            document.getElementById('transporte').checked = true;
        }
        if (oferta.requiereEquipos) {
            document.getElementById('equipos').checked = true;
        }
        
        // Actualizar character counters
        document.getElementById('titulo-count').textContent = oferta.titulo?.length || 0;
        document.getElementById('descripcion-count').textContent = oferta.descripcion?.length || 0;
        
        // Cambiar textos del formulario
        document.querySelector('.step-header h2').textContent = '✏️ Editar Oferta';
        document.querySelector('.step-header p').textContent = 'Actualiza la información de tu oferta';
        btnSubmit.innerHTML = '💾 Guardar Cambios';
        
        if (loadingToast) loadingToast.remove();
        if (typeof toastSuccess === 'function') {
            toastSuccess('Oferta cargada correctamente');
        }
        
        console.log('✅ Oferta cargada para edición:', oferta.titulo);
        
    } catch (error) {
        console.error('Error al cargar oferta:', error);
        if (loadingToast) loadingToast.remove();
        if (typeof toastError === 'function') {
            toastError('Error al cargar la oferta');
        }
        setTimeout(() => window.location.href = 'dashboard.html', 2000);
    }
}

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
// SUBMIT FORM - CREAR O ACTUALIZAR
// ============================================
formOferta.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Deshabilitar botón submit
    btnSubmit.disabled = true;
    const originalText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = modoEdicion ? '💾 Guardando...' : '🚀 Publicando...';
    
    try {
        // Recopilar datos del formulario
        const ofertaData = {
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
            requiereEquipos: document.getElementById('equipos').checked
        };
        
        if (modoEdicion) {
            // ACTUALIZAR OFERTA EXISTENTE
            const docRef = doc(db, 'ofertas', ofertaId);
            await updateDoc(docRef, {
                ...ofertaData,
                fechaActualizacion: serverTimestamp()
            });
            
            if (typeof toastSuccess === 'function') {
                toastSuccess('¡Oferta actualizada exitosamente! 💾');
            }
            
            console.log('✅ Oferta actualizada:', ofertaId);
            
        } else {
            // CREAR NUEVA OFERTA
            const nuevaOferta = {
                ...ofertaData,
                empleadorId: auth.currentUser?.uid || usuario.uid || 'demo',
                empleadorNombre: usuario.nombre,
                empleadorEmail: usuario.email,
                empleadorTelefono: usuario.telefono || '',
                estado: 'activa',
                fechaCreacion: serverTimestamp(),
                aplicaciones: 0
            };
            
            await addDoc(collection(db, 'ofertas'), nuevaOferta);
            
            if (typeof toastSuccess === 'function') {
                toastSuccess('¡Oferta publicada exitosamente! 🎉');
            }
            
            console.log('✅ Oferta creada');
        }
        
        // Redirigir al dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error:', error);
        
        // Restaurar botón
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText;
        
        // Toast de error
        if (typeof toastError === 'function') {
            toastError(modoEdicion ? 'Error al actualizar la oferta' : 'Error al publicar la oferta');
        } else {
            alert('Error: ' + error.message);
        }
    }
});

// ============================================
// INICIALIZACIÓN
// ============================================
showStep(currentStep);

console.log('✅ Formulario multi-paso cargado correctamente');
