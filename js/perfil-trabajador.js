// ============================================
// PERFIL TRABAJADOR - EDITABLE CON STORAGE
// ChambApp - JavaScript con Firestore + Storage
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Inicializar Firebase
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Variables globales
let perfilData = {};
let experiencias = [];
let habilidades = [];
let fotoFile = null;
let portfolioFiles = [];
let usuario = null;
let uploadingFoto = false;
let uploadingPortfolio = false;

// ============================================
// VERIFICAR AUTENTICACIÓN CON FIREBASE AUTH
// ============================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('✅ Usuario autenticado:', user.uid);
        
        const usuarioStr = localStorage.getItem('usuarioChambApp');
        if (!usuarioStr) {
            alert('Debes iniciar sesión');
            window.location.href = 'login.html';
            return;
        }
        
        usuario = JSON.parse(usuarioStr);
        
        if (usuario.tipo !== 'trabajador') {
            alert('Esta página es solo para trabajadores');
            window.location.href = 'dashboard.html';
            return;
        }
        
        await cargarPerfil();
        inicializarTabs();
        inicializarEventos();
        
    } else {
        console.log('❌ No hay usuario autenticado');
        alert('Debes iniciar sesión');
        window.location.href = 'login.html';
    }
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
            perfilData = {
                email: usuario.email,
                nombre: usuario.nombre || '',
                telefono: usuario.telefono || '',
                tipo: 'trabajador'
            };
            
            await setDoc(userDocRef, perfilData, { merge: true });
            console.log('✅ Perfil inicial creado');
        }
        
        cargarDatosPersonales();
        cargarExperiencias();
        cargarHabilidades();
        cargarDisponibilidad();
        cargarPortfolio();
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
    document.getElementById('profile-name').textContent = perfilData.nombre || 'Usuario';
    document.getElementById('profile-email').textContent = perfilData.email || usuario.email;
    
    document.getElementById('nombre').value = perfilData.nombre || '';
    document.getElementById('email').value = perfilData.email || usuario.email;
    document.getElementById('telefono').value = perfilData.telefono || '';
    document.getElementById('ubicacion').value = perfilData.ubicacion || '';
    document.getElementById('fechaNacimiento').value = perfilData.fechaNacimiento || '';
    document.getElementById('bio').value = perfilData.bio || '';
    
    const bioCount = (perfilData.bio || '').length;
    document.getElementById('bio-count').textContent = bioCount;
    
    if (perfilData.fotoPerfilURL) {
        document.getElementById('avatar-preview').src = perfilData.fotoPerfilURL;
    } else {
        const nombre = perfilData.nombre || usuario.nombre || 'Usuario';
        document.getElementById('avatar-preview').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&size=150&background=2563eb&color=fff`;
    }
}

// ============================================
// CARGAR PORTFOLIO
// ============================================
function cargarPortfolio() {
    const portfolioURLs = perfilData.portfolioURLs || [];
    const container = document.getElementById('portfolio-grid');
    const emptyState = document.getElementById('portfolio-empty');
    
    if (portfolioURLs.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    container.innerHTML = '';
    
    portfolioURLs.forEach((url, index) => {
        const card = document.createElement('div');
        card.className = 'portfolio-item';
        card.innerHTML = `
            <img src="${url}" alt="Trabajo ${index + 1}" onclick="abrirLightbox(${index})">
            <button class="btn-eliminar-portfolio" onclick="eliminarFotoPortfolio(${index})">
                🗑️
            </button>
        `;
        container.appendChild(card);
    });
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
    const categorias = perfilData.categorias || [];
    const checkboxes = document.querySelectorAll('.categoria-checkbox input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = categorias.includes(checkbox.value);
    });
    
    habilidades = perfilData.habilidades || [];
    mostrarHabilidades();
    
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
    
    if (disponibilidad.disponibilidadInmediata !== undefined) {
        document.getElementById('disponibilidad-inmediata').checked = disponibilidad.disponibilidadInmediata;
    }
    
    const diasDisponibles = disponibilidad.diasDisponibles || [];
    const diasCheckboxes = document.querySelectorAll('.dia-checkbox input[type="checkbox"]');
    diasCheckboxes.forEach(checkbox => {
        checkbox.checked = diasDisponibles.includes(checkbox.value);
    });
    
    if (disponibilidad.horarioInicio) {
        document.getElementById('horario-inicio').value = disponibilidad.horarioInicio;
    }
    if (disponibilidad.horarioFin) {
        document.getElementById('horario-fin').value = disponibilidad.horarioFin;
    }
    
    if (disponibilidad.zonasTrabajoPreferidas) {
        document.getElementById('zonas-trabajo').value = disponibilidad.zonasTrabajoPreferidas;
    }
}

// ============================================
// GUARDAR PERFIL
// ============================================
async function guardarPerfil() {
    try {
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
        
        const datosActualizados = {
            email: perfilData.email || usuario.email,
            nombre: nombre,
            telefono: telefono,
            ubicacion: ubicacion,
            fechaNacimiento: document.getElementById('fechaNacimiento').value || '',
            bio: document.getElementById('bio').value.trim(),
            categorias: obtenerCategorias(),
            habilidades: habilidades,
            añosExperiencia: document.getElementById('años-experiencia').value,
            experiencia: experiencias,
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
        
        // Mantener portfolioURLs si existen
        if (perfilData.portfolioURLs) {
            datosActualizados.portfolioURLs = perfilData.portfolioURLs;
        }
        
        const userDocRef = doc(db, 'usuarios', auth.currentUser.uid);
        await setDoc(userDocRef, datosActualizados, { merge: true });
        
        const usuarioActualizado = { ...usuario, ...datosActualizados };
        localStorage.setItem('usuarioChambApp', JSON.stringify(usuarioActualizado));
        
        console.log('✅ Perfil guardado exitosamente');
        
        if (typeof toastSuccess === 'function') {
            toastSuccess('¡Perfil actualizado exitosamente! 🎉');
        } else {
            alert('¡Perfil actualizado exitosamente!');
        }
        
        perfilData = { ...perfilData, ...datosActualizados };
        calcularCompletitud();
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
// SUBIR FOTO DE PERFIL A FIREBASE STORAGE
// ============================================
async function subirFoto() {
    try {
        if (!fotoFile || uploadingFoto) return null;
        
        uploadingFoto = true;
        console.log('📤 Subiendo foto de perfil...');
        
        // Crear referencia con timestamp para evitar cache
        const timestamp = Date.now();
        const storageRef = ref(storage, `perfiles/${auth.currentUser.uid}/foto-perfil-${timestamp}.jpg`);
        
        // Subir archivo
        await uploadBytes(storageRef, fotoFile);
        
        // Obtener URL de descarga
        const downloadURL = await getDownloadURL(storageRef);
        
        console.log('✅ Foto subida exitosamente:', downloadURL);
        
        // Limpiar foto anterior si existe
        if (perfilData.fotoPerfilURL && perfilData.fotoPerfilURL.includes('firebasestorage')) {
            try {
                const oldRef = ref(storage, perfilData.fotoPerfilURL);
                await deleteObject(oldRef);
                console.log('🗑️ Foto anterior eliminada');
            } catch (error) {
                console.log('⚠️ No se pudo eliminar foto anterior:', error);
            }
        }
        
        uploadingFoto = false;
        fotoFile = null;
        
        return downloadURL;
        
    } catch (error) {
        console.error('❌ Error al subir foto:', error);
        uploadingFoto = false;
        
        if (typeof toastError === 'function') {
            toastError('Error al subir la foto');
        }
        
        return null;
    }
}

// ============================================
// SUBIR FOTOS DE PORTFOLIO
// ============================================
async function subirFotosPortfolio() {
    try {
        if (portfolioFiles.length === 0) {
            if (typeof toastError === 'function') {
                toastError('Selecciona al menos una imagen');
            }
            return;
        }
        
        if (uploadingPortfolio) return;
        
        const portfolioActual = perfilData.portfolioURLs || [];
        
        // Límite de 10 fotos totales en portfolio
        if (portfolioActual.length + portfolioFiles.length > 10) {
            if (typeof toastError === 'function') {
                toastError('Máximo 10 fotos en portfolio');
            }
            return;
        }
        
        uploadingPortfolio = true;
        
        if (typeof toastInfo === 'function') {
            toastInfo(`Subiendo ${portfolioFiles.length} foto(s)...`);
        }
        
        const uploadPromises = portfolioFiles.map(async (file, index) => {
            const timestamp = Date.now();
            const storageRef = ref(storage, `portfolios/${auth.currentUser.uid}/trabajo-${timestamp}-${index}.jpg`);
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
        });
        
        const urls = await Promise.all(uploadPromises);
        
        // Actualizar Firestore
        const portfolioURLs = [...portfolioActual, ...urls];
        const userDocRef = doc(db, 'usuarios', auth.currentUser.uid);
        await setDoc(userDocRef, { portfolioURLs }, { merge: true });
        
        // Actualizar estado local
        perfilData.portfolioURLs = portfolioURLs;
        
        console.log('✅ Portfolio actualizado:', portfolioURLs);
        
        if (typeof toastSuccess === 'function') {
            toastSuccess('¡Fotos agregadas al portfolio! 🎉');
        }
        
        portfolioFiles = [];
        document.getElementById('portfolio-input').value = '';
        document.getElementById('portfolio-preview').innerHTML = '';
        
        cargarPortfolio();
        calcularCompletitud();
        
        uploadingPortfolio = false;
        
    } catch (error) {
        console.error('❌ Error al subir portfolio:', error);
        uploadingPortfolio = false;
        
        if (typeof toastError === 'function') {
            toastError('Error al subir las fotos');
        }
    }
}

// ============================================
// ELIMINAR FOTO DE PORTFOLIO
// ============================================
async function eliminarFotoPortfolio(index) {
    try {
        if (!confirm('¿Eliminar esta foto del portfolio?')) return;
        
        const portfolioURLs = perfilData.portfolioURLs || [];
        const urlToDelete = portfolioURLs[index];
        
        // Eliminar de Storage
        if (urlToDelete.includes('firebasestorage')) {
            try {
                const storageRef = ref(storage, urlToDelete);
                await deleteObject(storageRef);
                console.log('🗑️ Foto eliminada de Storage');
            } catch (error) {
                console.log('⚠️ No se pudo eliminar de Storage:', error);
            }
        }
        
        // Eliminar de array
        portfolioURLs.splice(index, 1);
        
        // Actualizar Firestore
        const userDocRef = doc(db, 'usuarios', auth.currentUser.uid);
        await setDoc(userDocRef, { portfolioURLs }, { merge: true });
        
        perfilData.portfolioURLs = portfolioURLs;
        
        if (typeof toastSuccess === 'function') {
            toastSuccess('Foto eliminada del portfolio');
        }
        
        cargarPortfolio();
        calcularCompletitud();
        
    } catch (error) {
        console.error('❌ Error al eliminar foto:', error);
        if (typeof toastError === 'function') {
            toastError('Error al eliminar la foto');
        }
    }
}

// ============================================
// OPTIMIZACIÓN DE IMÁGENES
// ============================================

/**
 * Optimizar imagen antes de subir
 * Redimensiona y comprime automáticamente
 * @param {File} file - Archivo de imagen original
 * @param {number} maxWidth - Ancho máximo en píxeles
 * @param {number} maxHeight - Alto máximo en píxeles
 * @param {number} quality - Calidad JPEG (0-1)
 * @returns {Promise<Blob>} - Imagen optimizada
 */
async function optimizarImagen(file, maxWidth = 1920, maxHeight = 1920, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                // Calcular dimensiones manteniendo aspect ratio
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                
                // Crear canvas para redimensionar
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                
                // Aplicar suavizado para mejor calidad
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // Dibujar imagen redimensionada
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convertir a blob JPEG
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            console.log(`📐 Optimización: ${Math.round(file.size / 1024)}KB → ${Math.round(blob.size / 1024)}KB`);
                            resolve(blob);
                        } else {
                            reject(new Error('Error al convertir imagen'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            
            img.onerror = () => reject(new Error('Error al cargar imagen'));
            img.src = e.target.result;
        };
        
        reader.onerror = () => reject(new Error('Error al leer archivo'));
        reader.readAsDataURL(file);
    });
}

/**
 * Validar y preparar archivo de imagen
 * @param {File} file - Archivo a validar
 * @returns {Object} - {valid, error, file, isHEIC}
 */
function validarArchivo(file) {
    // Extensiones válidas
    const extensionesValidas = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
    const nombreArchivo = file.name.toLowerCase();
    const tieneExtensionValida = extensionesValidas.some(ext => nombreArchivo.endsWith(ext));
    
    // Detectar si es HEIC
    const isHEIC = nombreArchivo.endsWith('.heic') || nombreArchivo.endsWith('.heif');
    
    // Validar que sea imagen por tipo MIME o por extensión
    const esTipoImagen = file.type.startsWith('image/') || file.type === '';
    
    if (!esTipoImagen && !tieneExtensionValida) {
        return {
            valid: false,
            error: 'Por favor selecciona una imagen válida (JPG, PNG, HEIC)'
        };
    }
    
    // Si es HEIC en desktop, mostrar mensaje informativo
    if (isHEIC && file.type === '') {
        console.log('⚠️ Archivo HEIC detectado en desktop');
        return {
            valid: false,
            error: 'Archivos HEIC (iPhone) no soportados en desktop. Por favor:\n• Usa tu iPhone para subir, o\n• Convierte a JPG primero, o\n• Envíate la foto por WhatsApp/email (convierte automáticamente)'
        };
    }
    
    // Si tiene extensión válida pero tipo vacío (otros casos), es válido
    if (file.type === '' && tieneExtensionValida && !isHEIC) {
        console.log('✅ Archivo con extensión válida detectado:', nombreArchivo);
    }
    
    // Límite aumentado a 15MB para archivo original
    const MAX_SIZE = 15 * 1024 * 1024; // 15MB
    if (file.size > MAX_SIZE) {
        return {
            valid: false,
            error: 'La imagen es muy grande (máx. 15MB)'
        };
    }
    
    return { valid: true, file, isHEIC };
}

// ============================================
// PREVISUALIZAR FOTO DE PERFIL
// ============================================
async function previsualizarFoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar archivo
    const validation = validarArchivo(file);
    if (!validation.valid) {
        if (typeof toastError === 'function') {
            toastError(validation.error);
        } else {
            alert(validation.error);
        }
        event.target.value = '';
        return;
    }
    
    try {
        // Mostrar mensaje de procesamiento
        if (typeof toastInfo === 'function') {
            toastInfo('📸 Optimizando imagen...');
        }
        
        // Optimizar imagen
        const optimizedBlob = await optimizarImagen(file, 800, 800, 0.85);
        
        // Crear File desde Blob para mantener compatibilidad
        fotoFile = new File([optimizedBlob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
        });
        
        // Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('avatar-preview').src = e.target.result;
            
            if (typeof toastSuccess === 'function') {
                toastSuccess('✅ Foto optimizada. Guarda el perfil para subirla.');
            }
        };
        reader.readAsDataURL(optimizedBlob);
        
    } catch (error) {
        console.error('❌ Error al procesar imagen:', error);
        if (typeof toastError === 'function') {
            toastError('Error al procesar la imagen');
        }
        event.target.value = '';
    }
}

// ============================================
// PREVISUALIZAR FOTOS DE PORTFOLIO
// ============================================
async function previsualizarPortfolio(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    // Validar archivos
    const validaciones = files.map(f => validarArchivo(f));
    const errores = validaciones.filter(v => !v.valid);
    
    if (errores.length > 0) {
        if (typeof toastError === 'function') {
            toastError(errores[0].error);
        }
        event.target.value = '';
        return;
    }
    
    try {
        // Mostrar progreso
        if (typeof toastInfo === 'function') {
            toastInfo(`📸 Optimizando ${files.length} imagen(es)...`);
        }
        
        // Optimizar todas las imágenes
        const optimizacionesPromises = files.map(file => 
            optimizarImagen(file, 1920, 1920, 0.85)
                .then(blob => new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                }))
        );
        
        portfolioFiles = await Promise.all(optimizacionesPromises);
        
        // Mostrar previews
        const previewContainer = document.getElementById('portfolio-preview');
        previewContainer.innerHTML = '';
        
        portfolioFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'portfolio-preview-item';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview ${index + 1}">
                    <button type="button" onclick="removerPreviewPortfolio(${index})">×</button>
                `;
                previewContainer.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
        
        if (typeof toastSuccess === 'function') {
            toastSuccess('✅ Imágenes optimizadas y listas para subir');
        }
        
    } catch (error) {
        console.error('❌ Error al procesar imágenes:', error);
        if (typeof toastError === 'function') {
            toastError('Error al procesar las imágenes');
        }
        event.target.value = '';
    }
}

// ============================================
// REMOVER PREVIEW DE PORTFOLIO
// ============================================
async function removerPreviewPortfolio(index) {
    portfolioFiles.splice(index, 1);
    
    if (portfolioFiles.length === 0) {
        document.getElementById('portfolio-input').value = '';
        document.getElementById('portfolio-preview').innerHTML = '';
    } else {
        // Re-renderizar previews
        const previewContainer = document.getElementById('portfolio-preview');
        previewContainer.innerHTML = '';
        
        portfolioFiles.forEach((file, i) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'portfolio-preview-item';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview ${i + 1}">
                    <button type="button" onclick="removerPreviewPortfolio(${i})">×</button>
                `;
                previewContainer.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
    }
}

// ============================================
// LIGHTBOX PARA PORTFOLIO
// ============================================
function abrirLightbox(index) {
    const portfolioURLs = perfilData.portfolioURLs || [];
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCounter = document.getElementById('lightbox-counter');
    
    lightboxImg.src = portfolioURLs[index];
    lightboxCounter.textContent = `${index + 1} / ${portfolioURLs.length}`;
    lightbox.classList.add('active');
    
    // Guardar index actual
    lightbox.dataset.currentIndex = index;
}

function cerrarLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}

function navegarLightbox(direction) {
    const portfolioURLs = perfilData.portfolioURLs || [];
    const lightbox = document.getElementById('lightbox');
    let currentIndex = parseInt(lightbox.dataset.currentIndex);
    
    if (direction === 'prev') {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : portfolioURLs.length - 1;
    } else {
        currentIndex = currentIndex < portfolioURLs.length - 1 ? currentIndex + 1 : 0;
    }
    
    abrirLightbox(currentIndex);
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
        perfilData.añosExperiencia,
        (perfilData.portfolioURLs && perfilData.portfolioURLs.length > 0)
    ];
    
    const camposCompletos = campos.filter(campo => campo).length;
    completitud = Math.round((camposCompletos / campos.length) * 100);
    
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
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
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
    const bioTextarea = document.getElementById('bio');
    bioTextarea.addEventListener('input', (e) => {
        document.getElementById('bio-count').textContent = e.target.value.length;
    });
    
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
    
    // Cerrar lightbox con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarLightbox();
        }
    });
}

// ============================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================
window.guardarPerfil = guardarPerfil;
window.previsualizarFoto = previsualizarFoto;
window.previsualizarPortfolio = previsualizarPortfolio;
window.subirFotosPortfolio = subirFotosPortfolio;
window.eliminarFotoPortfolio = eliminarFotoPortfolio;
window.removerPreviewPortfolio = removerPreviewPortfolio;
window.abrirLightbox = abrirLightbox;
window.cerrarLightbox = cerrarLightbox;
window.navegarLightbox = navegarLightbox;
window.agregarExperiencia = agregarExperiencia;
window.cerrarModalExperiencia = cerrarModalExperiencia;
window.guardarExperiencia = guardarExperiencia;
window.eliminarExperiencia = eliminarExperiencia;
window.agregarHabilidad = agregarHabilidad;
window.agregarHabilidadEnter = agregarHabilidadEnter;
window.eliminarHabilidad = eliminarHabilidad;

console.log('✅ Perfil Trabajador con Storage cargado correctamente');
