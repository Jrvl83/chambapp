/**
 * Módulo de gestión de fotos para ofertas
 * Maneja: selección, optimización, preview, upload y eliminación
 *
 * @module publicar-oferta/fotos
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { optimizarImagen, validarArchivoImagen } from '../utils/image-utils.js';

// ============================================
// CONSTANTES Y ESTADO DEL MÓDULO
// ============================================
const MAX_FOTOS = 5;
const MAX_FILE_SIZE_MB = 10;

let fotosFiles = [];           // Archivos nuevos seleccionados
let fotosExistentes = [];      // URLs de fotos existentes (modo edición)
let fotosAEliminar = [];       // URLs de fotos a eliminar al guardar
let storageRef = null;         // Referencia a Firebase Storage

/**
 * Inicializa el módulo de fotos
 * @param {Object} storage - Referencia a Firebase Storage
 */
export function initFotos(storage) {
    storageRef = storage;

    const uploadArea = document.getElementById('fotos-upload-area');
    const inputFotos = document.getElementById('fotos-input');
    const btnAgregarMas = document.getElementById('btn-agregar-mas-fotos');

    if (!uploadArea || !inputFotos) return;

    // Click en área de upload
    uploadArea.addEventListener('click', () => inputFotos.click());

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        procesarFotosSeleccionadas(files);
    });

    // Input file change
    inputFotos.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        procesarFotosSeleccionadas(files);
        e.target.value = ''; // Reset para permitir seleccionar mismos archivos
    });

    // Botón agregar más
    if (btnAgregarMas) {
        btnAgregarMas.addEventListener('click', () => inputFotos.click());
    }

    // Exponer funciones para onclick en HTML
    window.removerFotoExistente = removerFotoExistente;
    window.removerFotoNueva = removerFotoNueva;
}

// ============================================
// PROCESAR FOTOS SELECCIONADAS
// ============================================
async function procesarFotosSeleccionadas(files) {
    const totalActual = fotosFiles.length + fotosExistentes.length;
    const espacioDisponible = MAX_FOTOS - totalActual;

    if (espacioDisponible <= 0) {
        if (typeof toastWarning === 'function') {
            toastWarning(`Máximo ${MAX_FOTOS} fotos por oferta`);
        }
        return;
    }

    // Filtrar archivos válidos
    const archivosValidos = [];
    for (const file of files) {
        if (archivosValidos.length >= espacioDisponible) break;

        const validacion = validarArchivoImagen(file, MAX_FILE_SIZE_MB);
        if (validacion.valid) {
            archivosValidos.push(file);
        } else {
            if (typeof toastError === 'function') {
                toastError(validacion.error);
            }
        }
    }

    if (archivosValidos.length === 0) return;

    // Mostrar mensaje de optimización
    if (typeof toastInfo === 'function') {
        toastInfo(`Optimizando ${archivosValidos.length} foto(s)...`);
    }

    // Optimizar y agregar fotos
    for (const file of archivosValidos) {
        try {
            const optimizada = await optimizarImagen(file, 1200, 1200, 0.85);
            const fileOptimizado = new File([optimizada], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
            });
            fotosFiles.push({
                file: fileOptimizado,
                preview: URL.createObjectURL(optimizada)
            });
        } catch (error) {
            console.error('Error optimizando foto:', error);
        }
    }

    actualizarPreviewFotos();

    if (typeof toastSuccess === 'function') {
        toastSuccess(`${archivosValidos.length} foto(s) agregada(s)`);
    }
}

// ============================================
// ACTUALIZAR PREVIEW DE FOTOS
// ============================================
function actualizarPreviewFotos() {
    const previewContainer = document.getElementById('fotos-preview');
    const countContainer = document.getElementById('fotos-count');
    const countText = document.getElementById('fotos-count-text');
    const btnAgregarMas = document.getElementById('btn-agregar-mas-fotos');
    const uploadArea = document.getElementById('fotos-upload-area');

    if (!previewContainer) return;

    const totalFotos = fotosExistentes.length + fotosFiles.length;

    // Mostrar/ocultar área de upload
    if (totalFotos > 0) {
        uploadArea.style.display = 'none';
        countContainer.style.display = 'flex';
        countText.textContent = `${totalFotos}/${MAX_FOTOS} fotos`;

        if (totalFotos < MAX_FOTOS) {
            btnAgregarMas.style.display = 'inline';
        } else {
            btnAgregarMas.style.display = 'none';
            countContainer.classList.add('limit-reached');
        }
    } else {
        uploadArea.style.display = 'block';
        countContainer.style.display = 'none';
        countContainer.classList.remove('limit-reached');
    }

    // Renderizar previews
    previewContainer.innerHTML = '';

    // Fotos existentes (modo edición)
    fotosExistentes.forEach((url, index) => {
        const item = document.createElement('div');
        item.className = 'foto-preview-item';
        item.innerHTML = `
            <img src="${url}" alt="Foto ${index + 1}">
            <button type="button" class="btn-remove-foto" onclick="removerFotoExistente(${index})">×</button>
        `;
        previewContainer.appendChild(item);
    });

    // Fotos nuevas
    fotosFiles.forEach((foto, index) => {
        const item = document.createElement('div');
        item.className = 'foto-preview-item';
        item.innerHTML = `
            <img src="${foto.preview}" alt="Foto nueva ${index + 1}">
            <button type="button" class="btn-remove-foto" onclick="removerFotoNueva(${index})">×</button>
        `;
        previewContainer.appendChild(item);
    });
}

// ============================================
// REMOVER FOTOS
// ============================================

/**
 * Marca una foto existente para eliminar
 */
function removerFotoExistente(index) {
    const url = fotosExistentes[index];
    fotosAEliminar.push(url);
    fotosExistentes.splice(index, 1);
    actualizarPreviewFotos();
}

/**
 * Remueve una foto nueva de la lista
 */
function removerFotoNueva(index) {
    // Revocar URL para liberar memoria
    URL.revokeObjectURL(fotosFiles[index].preview);
    fotosFiles.splice(index, 1);
    actualizarPreviewFotos();
}

// ============================================
// SUBIR Y ELIMINAR FOTOS EN STORAGE
// ============================================

/**
 * Sube las fotos nuevas a Firebase Storage
 * @param {string} ofertaId - ID de la oferta
 * @returns {Promise<string[]>} - URLs de las fotos subidas
 */
export async function subirFotosOferta(ofertaId) {
    if (fotosFiles.length === 0) return [];

    const urls = [];
    const timestamp = Date.now();

    for (let i = 0; i < fotosFiles.length; i++) {
        const foto = fotosFiles[i];
        const fileRef = ref(storageRef, `ofertas/${ofertaId}/foto-${timestamp}-${i}.jpg`);

        try {
            await uploadBytes(fileRef, foto.file);
            const downloadURL = await getDownloadURL(fileRef);
            urls.push(downloadURL);
        } catch (error) {
            console.error(`Error subiendo foto ${i}:`, error);
        }
    }

    return urls;
}

/**
 * Elimina las fotos marcadas de Firebase Storage
 */
export async function eliminarFotosMarcadas() {
    for (const url of fotosAEliminar) {
        try {
            const fileRef = ref(storageRef, url);
            await deleteObject(fileRef);
        } catch (error) {
            // Ignorar errores de eliminación (puede que ya no exista)
            console.warn('Error eliminando foto:', error);
        }
    }
    fotosAEliminar = [];
}

// ============================================
// CARGAR FOTOS EXISTENTES
// ============================================

/**
 * Carga fotos existentes en modo edición
 * @param {string[]} imagenesURLs - URLs de las imágenes
 */
export function cargarFotosExistentes(imagenesURLs) {
    if (!imagenesURLs || !Array.isArray(imagenesURLs)) return;

    fotosExistentes = [...imagenesURLs];
    fotosFiles = [];
    fotosAEliminar = [];
    actualizarPreviewFotos();
}

// ============================================
// ACTUALIZAR REVIEW DE FOTOS
// ============================================

/**
 * Actualiza la sección de revisión con las fotos
 */
export function actualizarReviewFotos() {
    const section = document.getElementById('review-fotos-section');
    const grid = document.getElementById('review-fotos-grid');

    if (!section || !grid) return;

    const totalFotos = fotosExistentes.length + fotosFiles.length;

    if (totalFotos === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    grid.innerHTML = '';

    // Fotos existentes
    fotosExistentes.forEach((url, index) => {
        const item = document.createElement('div');
        item.className = 'review-foto-item';
        item.innerHTML = `<img src="${url}" alt="Foto ${index + 1}">`;
        grid.appendChild(item);
    });

    // Fotos nuevas
    fotosFiles.forEach((foto, index) => {
        const item = document.createElement('div');
        item.className = 'review-foto-item';
        item.innerHTML = `<img src="${foto.preview}" alt="Foto nueva ${index + 1}">`;
        grid.appendChild(item);
    });
}

// ============================================
// GETTERS PARA ESTADO
// ============================================

/**
 * Obtiene las URLs de fotos existentes
 */
export function getFotosExistentes() {
    return [...fotosExistentes];
}

/**
 * Obtiene el número total de fotos
 */
export function getTotalFotos() {
    return fotosExistentes.length + fotosFiles.length;
}

/**
 * Resetea el estado de fotos
 */
export function resetFotos() {
    // Liberar memoria de previews
    fotosFiles.forEach(foto => URL.revokeObjectURL(foto.preview));

    fotosFiles = [];
    fotosExistentes = [];
    fotosAEliminar = [];
}
