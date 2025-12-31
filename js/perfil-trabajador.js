// ============================================
// PERFIL TRABAJADOR - EDITABLE
// ChambApp - JavaScript con Firestore
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Inicializar Firebase
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Verificar autenticación
const usuarioStr = localStorage.getItem('usuarioChambApp');
if (!usuarioStr) {
    alert('Debes iniciar sesión');
    window.location.href = 'login.html';
}

const usuario = JSON.parse(usuarioStr);

// Verificar que sea TRABAJADOR
if (usuario.tipo !== 'trabajador') {
    alert('Esta página es solo para trabajadores');
    window.location.href = 'dashboard.html';
}

// Variables globales
let perfilData = {};
let experiencias = [];
let habilidades = [];
let fotoFile = null;

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    cargarPerfil();
    inicializarTabs();
    inicializarEventos();
});

// ============================================
// CARGAR PERFIL DESDE FIRESTORE
// ============================================
async function cargarPerfil() {
    try {
        const userDocRef = doc(db, 'usuarios', auth.currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
            perfilData = docSnap.data();
            console.log('✅ Perfil cargado:', perfilData);
        } else {
            console.log('⚠️ No existe perfil, creando uno nuevo');
            // Crear perfil inicial
            perfilData = {
                email: usuario.email,
                nombre: usuario.nombre || '',
                telefono: usuario.telefono || '',
                tipo: 'trabajador'
            };
            
            // Guardar perfil inicial en Firestore
            await setDoc(userDocRef, perfilData, { merge: true });
            console.log('✅ Perfil inicial creado');
        }
        
        // Cargar datos en el formulario
        cargarDatosPersonales();
        cargarExperiencias();
        cargarHabilidades();
        cargarDisponibilidad();
        calcularCompletitud();
        
    } catch (error) {
        console.error('❌ Error al cargar perfil:', error);
        if (typeof toastError === 'function') {
            toastError('Error al cargar el perfil');
        }
    }
}

// ============================================
// CARGAR DATOS PERSONALES
// ============================================
function cargarDatosPersonales() {
    // Header
    document.getElementById('profile-name').textContent = perfilData.nombre || 'Usuario';
    document.getElementById('profile-email').textContent = perfilData.email || usuario.email;
    
    // Formulario
    document.getElementById('nombre').value = perfilData.nombre || '';
    document.getElementById('email').value = perfilData.email || usuario.email; // ← ARREGLADO
    document.getElementById('telefono').value = perfilData.telefono || '';
    document.getElementById('ubicacion').value = perfilData.ubicacion || '';
    document.getElementById('fechaNacimiento').value = perfilData.fechaNacimiento || '';
    document.getElementById('bio').value = perfilData.bio || '';
    
    // Actualizar contador de bio
    const bioCount = (perfilData.bio || '').length;
    document.getElementById('bio-count').textContent = bioCount;
    
    // Avatar
    if (perfilData.fotoPerfilURL) {
        document.getElementById('avatar-preview').src = perfilData.fotoPerfilURL;
    } else {
        const nombre = perfilData.nombre || usuario.nombre || 'Usuario';
        document.getElementById('avatar-preview').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&size=150&background=2563eb&color=fff`;
    }
}

// ============================================
// CARGAR EXPERIENCIAS
// ============================================
function cargarExperiencias() {
    experiencias = perfilData.experiencia || [];
    mostrarExperiencias();
}

function mostrarExperiencias() {
    const container = document.getElementById('experiencias-container');
    const emptyState = document.getElementById('experiencias-empty');
    
    if (experiencias.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'flex';
    emptyState.style.display = 'none';
    container.innerHTML = '';
    
    experiencias.forEach((exp, index) => {
        const expCard = `
            <div class="experiencia-item">
                <div class="experiencia-header">
                    <div>
                        <div class="experiencia-puesto">${exp.puesto}</div>
                        ${exp.empresa ? `<div class="experiencia-empresa">📍 ${exp.empresa}</div>` : ''}
                        <div class="experiencia-periodo">📅 ${exp.periodo}</div>
                    </div>
                    <button class="btn-eliminar-exp" onclick="eliminarExperiencia(${index})">
                        🗑️ Eliminar
                    </button>
                </div>
                ${exp.descripcion ? `<div class="experiencia-descripcion">${exp.descripcion}</div>` : ''}
            </div>
        `;
        container.innerHTML += expCard;
    });
}

// ============================================
// CARGAR HABILIDADES
// ============================================
function cargarHabilidades() {
    // Categorías
    const categorias = perfilData.categorias || [];
    const checkboxes = document.querySelectorAll('.categoria-checkbox input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = categorias.includes(checkbox.value);
    });
    
    // Habilidades específicas
    habilidades = perfilData.habilidades || [];
    mostrarHabilidades();
    
    // Años de experiencia
    if (perfilData.añosExperiencia) {
        document.getElementById('años-experiencia').value = perfilData.añosExperiencia;
    }
}

function mostrarHabilidades() {
    const container = document.getElementById('habilidades-tags');
    container.innerHTML = '';
    
    habilidades.forEach((habilidad, index) => {
        const tag = document.createElement('div');
        tag.className = 'habilidad-tag';
        tag.innerHTML = `
            ${habilidad}
            <button onclick="eliminarHabilidad(${index})">×</button>
        `;
        container.appendChild(tag);
    });
}

// ============================================
// CARGAR DISPONIBILIDAD
// ============================================
function cargarDisponibilidad() {
    const disponibilidad = perfilData.disponibilidad || {};
    
    // Disponibilidad inmediata
    if (disponibilidad.disponibilidadInmediata !== undefined) {
        document.getElementById('disponibilidad-inmediata').checked = disponibilidad.disponibilidadInmediata;
    }
    
    // Días disponibles
    const diasDisponibles = disponibilidad.diasDisponibles || [];
    const diasCheckboxes = document.querySelectorAll('.dia-checkbox input[type="checkbox"]');
    diasCheckboxes.forEach(checkbox => {
        checkbox.checked = diasDisponibles.includes(checkbox.value);
    });
    
    // Horario
    if (disponibilidad.horarioInicio) {
        document.getElementById('horario-inicio').value = disponibilidad.horarioInicio;
    }
    if (disponibilidad.horarioFin) {
        document.getElementById('horario-fin').value = disponibilidad.horarioFin;
    }
    
    // Zonas de trabajo
    if (disponibilidad.zonasTrabajoPreferidas) {
        document.getElementById('zonas-trabajo').value = disponibilidad.zonasTrabajoPreferidas;
    }
}

// ============================================
// GUARDAR PERFIL
// ============================================
async function guardarPerfil() {
    try {
        // Validar campos requeridos
        const nombre = document.getElementById('nombre').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const ubicacion = document.getElementById('ubicacion').value.trim();
        
        if (!nombre || !telefono || !ubicacion) {
            if (typeof toastError === 'function') {
                toastError('Por favor completa los campos obligatorios');
            } else {
                alert('Por favor completa los campos obligatorios');
            }
            return;
        }
        
        // Preparar datos
        const datosActualizados = {
            // Mantener email (nunca cambiar)
            email: perfilData.email || usuario.email,
            
            // Datos personales
            nombre: nombre,
            telefono: telefono,
            ubicacion: ubicacion,
            fechaNacimiento: document.getElementById('fechaNacimiento').value || '',
            bio: document.getElementById('bio').value.trim(),
            
            // Categorías
            categorias: obtenerCategorias(),
            
            // Habilidades
            habilidades: habilidades,
            añosExperiencia: document.getElementById('años-experiencia').value,
            
            // Experiencia
            experiencia: experiencias,
            
            // Disponibilidad
            disponibilidad: {
                disponibilidadInmediata: document.getElementById('disponibilidad-inmediata').checked,
                diasDisponibles: obtenerDiasDisponibles(),
                horarioInicio: document.getElementById('horario-inicio').value || '',
                horarioFin: document.getElementById('horario-fin').value || '',
                zonasTrabajoPreferidas: document.getElementById('zonas-trabajo').value.trim()
            }
        };
        
        // Subir foto si existe
        if (fotoFile) {
            const fotoURL = await subirFoto();
            if (fotoURL) {
                datosActualizados.fotoPerfilURL = fotoURL;
            }
        } else if (perfilData.fotoPerfilURL) {
            datosActualizados.fotoPerfilURL = perfilData.fotoPerfilURL;
        }
        
        // Guardar en Firestore (crear si no existe, actualizar si existe)
        const userDocRef = doc(db, 'usuarios', auth.currentUser.uid);
        await setDoc(userDocRef, datosActualizados, { merge: true });
        
        // Actualizar localStorage
        const usuarioActualizado = { ...usuario, ...datosActualizados };
        localStorage.setItem('usuarioChambApp', JSON.stringify(usuarioActualizado));
        
        console.log('✅ Perfil guardado exitosamente');
        
        if (typeof toastSuccess === 'function') {
            toastSuccess('¡Perfil actualizado exitosamente! 🎉');
        } else {
            alert('¡Perfil actualizado exitosamente!');
        }
        
        // IMPORTANTE: Recargar perfil desde Firestore para asegurar persistencia
        perfilData = { ...perfilData, ...datosActualizados };
        
        // Recalcular completitud
        calcularCompletitud();
        
        // Recargar UI con datos actualizados
        cargarDatosPersonales();
        
    } catch (error) {
        console.error('❌ Error al guardar perfil:', error);
        if (typeof toastError === 'function') {
            toastError('Error al guardar el perfil');
        } else {
            alert('Error al guardar el perfil: ' + error.message);
        }
    }
}

// ============================================
// SUBIR FOTO A FIREBASE STORAGE
// ============================================
async function subirFoto() {
    try {
        if (!fotoFile) return null;
        
        const storageRef = ref(storage, `perfiles/${auth.currentUser.uid}/foto-perfil.jpg`);
        await uploadBytes(storageRef, fotoFile);
        const downloadURL = await getDownloadURL(storageRef);
        
        console.log('✅ Foto subida:', downloadURL);
        return downloadURL;
        
    } catch (error) {
        console.error('❌ Error al subir foto:', error);
        return null;
    }
}

// ============================================
// PREVISUALIZAR FOTO
// ============================================
function previsualizarFoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
        if (typeof toastError === 'function') {
            toastError('Por favor selecciona una imagen válida');
        } else {
            alert('Por favor selecciona una imagen válida');
        }
        return;
    }
    
    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        if (typeof toastError === 'function') {
            toastError('La imagen es muy grande (máx. 5MB)');
        } else {
            alert('La imagen es muy grande (máx. 5MB)');
        }
        return;
    }
    
    fotoFile = file;
    
    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('avatar-preview').src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function obtenerCategorias() {
    const categorias = [];
    const checkboxes = document.querySelectorAll('.categoria-checkbox input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        categorias.push(checkbox.value);
    });
    return categorias;
}

function obtenerDiasDisponibles() {
    const dias = [];
    const checkboxes = document.querySelectorAll('.dia-checkbox input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        dias.push(checkbox.value);
    });
    return dias;
}

// ============================================
// EXPERIENCIA
// ============================================
function agregarExperiencia() {
    document.getElementById('modal-experiencia').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Limpiar formulario
    document.getElementById('exp-puesto').value = '';
    document.getElementById('exp-empresa').value = '';
    document.getElementById('exp-inicio').value = '';
    document.getElementById('exp-fin').value = '';
    document.getElementById('exp-actual').checked = false;
    document.getElementById('exp-descripcion').value = '';
}

function cerrarModalExperiencia() {
    document.getElementById('modal-experiencia').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function guardarExperiencia() {
    const puesto = document.getElementById('exp-puesto').value.trim();
    const empresa = document.getElementById('exp-empresa').value.trim();
    const inicio = document.getElementById('exp-inicio').value;
    const fin = document.getElementById('exp-actual').checked ? 'Presente' : document.getElementById('exp-fin').value;
    const descripcion = document.getElementById('exp-descripcion').value.trim();
    
    if (!puesto) {
        if (typeof toastError === 'function') {
            toastError('El puesto es obligatorio');
        } else {
            alert('El puesto es obligatorio');
        }
        return;
    }
    
    const periodo = inicio && fin ? `${inicio} - ${fin}` : 'Sin fecha especificada';
    
    const nuevaExperiencia = {
        puesto: puesto,
        empresa: empresa,
        periodo: periodo,
        descripcion: descripcion
    };
    
    experiencias.push(nuevaExperiencia);
    mostrarExperiencias();
    cerrarModalExperiencia();
    
    if (typeof toastSuccess === 'function') {
        toastSuccess('Experiencia agregada');
    }
}

function eliminarExperiencia(index) {
    if (confirm('¿Estás seguro de eliminar esta experiencia?')) {
        experiencias.splice(index, 1);
        mostrarExperiencias();
        
        if (typeof toastSuccess === 'function') {
            toastSuccess('Experiencia eliminada');
        }
    }
}

// ============================================
// HABILIDADES
// ============================================
function agregarHabilidad() {
    const input = document.getElementById('nueva-habilidad');
    const habilidad = input.value.trim();
    
    if (!habilidad) return;
    
    if (habilidades.includes(habilidad)) {
        if (typeof toastError === 'function') {
            toastError('Esta habilidad ya existe');
        } else {
            alert('Esta habilidad ya existe');
        }
        return;
    }
    
    habilidades.push(habilidad);
    mostrarHabilidades();
    input.value = '';
    
    if (typeof toastSuccess === 'function') {
        toastSuccess('Habilidad agregada');
    }
}

function agregarHabilidadEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        agregarHabilidad();
    }
}

function eliminarHabilidad(index) {
    habilidades.splice(index, 1);
    mostrarHabilidades();
}

// ============================================
// CALCULAR COMPLETITUD
// ============================================
function calcularCompletitud() {
    let completitud = 0;
    const campos = [
        perfilData.nombre,
        perfilData.telefono,
        perfilData.ubicacion,
        perfilData.bio,
        perfilData.fotoPerfilURL,
        (perfilData.categorias && perfilData.categorias.length > 0),
        (perfilData.habilidades && perfilData.habilidades.length > 0),
        (perfilData.experiencia && perfilData.experiencia.length > 0),
        (perfilData.disponibilidad && perfilData.disponibilidad.diasDisponibles && perfilData.disponibilidad.diasDisponibles.length > 0),
        perfilData.añosExperiencia
    ];
    
    const camposCompletos = campos.filter(campo => campo).length;
    completitud = Math.round((camposCompletos / campos.length) * 100);
    
    // Actualizar UI
    document.getElementById('completeness-percentage').textContent = `${completitud}%`;
    document.getElementById('progress-fill').style.width = `${completitud}%`;
    
    if (completitud === 100) {
        document.getElementById('completeness-tip').textContent = '¡Felicidades! Tu perfil está completo 🎉';
        document.getElementById('badge-completado').style.display = 'inline-block';
    } else if (completitud >= 70) {
        document.getElementById('completeness-tip').textContent = '¡Casi listo! Completa algunos campos más';
        document.getElementById('badge-completado').style.display = 'none';
    } else {
        document.getElementById('completeness-tip').textContent = 'Completa tu perfil para recibir más oportunidades';
        document.getElementById('badge-completado').style.display = 'none';
    }
}

// ============================================
// TABS
// ============================================
function inicializarTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover active de todos
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Agregar active al seleccionado
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// ============================================
// EVENTOS
// ============================================
function inicializarEventos() {
    // Character counter para bio
    const bioTextarea = document.getElementById('bio');
    bioTextarea.addEventListener('input', (e) => {
        document.getElementById('bio-count').textContent = e.target.value.length;
    });
    
    // Checkbox "Trabajo actual"
    const checkboxActual = document.getElementById('exp-actual');
    const inputFin = document.getElementById('exp-fin');
    
    checkboxActual.addEventListener('change', (e) => {
        if (e.target.checked) {
            inputFin.disabled = true;
            inputFin.value = '';
        } else {
            inputFin.disabled = false;
        }
    });
}

// ============================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================
window.guardarPerfil = guardarPerfil;
window.previsualizarFoto = previsualizarFoto;
window.agregarExperiencia = agregarExperiencia;
window.cerrarModalExperiencia = cerrarModalExperiencia;
window.guardarExperiencia = guardarExperiencia;
window.eliminarExperiencia = eliminarExperiencia;
window.agregarHabilidad = agregarHabilidad;
window.agregarHabilidadEnter = agregarHabilidadEnter;
window.eliminarHabilidad = eliminarHabilidad;

console.log('✅ Perfil Trabajador cargado correctamente');
