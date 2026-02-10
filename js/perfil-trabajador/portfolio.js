// ============================================
// PORTFOLIO - Galeria, Upload, Lightbox
// Modulo: perfil-trabajador/portfolio.js
// ============================================

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { optimizarImagen, validarArchivoImagen } from '../utils/image-utils.js';

let _db = null;
let _storage = null;
let _auth = null;
let state = null;
let _onCompletitudChange = null;

// ============================================
// INICIALIZAR MODULO
// ============================================
export function initPortfolio(firebaseDb, firebaseStorage, firebaseAuth, sharedState, callbacks) {
    _db = firebaseDb;
    _storage = firebaseStorage;
    _auth = firebaseAuth;
    state = sharedState;
    _onCompletitudChange = callbacks.onCompletitudChange;
}

// ============================================
// CARGAR PORTFOLIO GRID
// ============================================
export function cargarPortfolio() {
    const portfolioURLs = state.perfilData.portfolioURLs || [];
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
// SUBIR FOTOS DE PORTFOLIO
// ============================================
function validarSubidaPortfolio() {
    if (state.portfolioFiles.length === 0) {
        if (typeof toastError === 'function') {
            toastError('Selecciona al menos una imagen');
        }
        return false;
    }

    if (state.uploadingPortfolio) return false;

    const portfolioActual = state.perfilData.portfolioURLs || [];
    if (portfolioActual.length + state.portfolioFiles.length > 10) {
        if (typeof toastError === 'function') {
            toastError('Máximo 10 fotos en portfolio');
        }
        return false;
    }

    return true;
}

async function ejecutarSubidaPortfolio(portfolioActual) {
    const uploadPromises = state.portfolioFiles.map(async (file, index) => {
        const timestamp = Date.now();
        const storageRef = ref(_storage, `portfolios/${_auth.currentUser.uid}/trabajo-${timestamp}-${index}.jpg`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    });

    return await Promise.all(uploadPromises);
}

function limpiarUIPortfolio() {
    state.portfolioFiles = [];
    document.getElementById('portfolio-input').value = '';
    document.getElementById('portfolio-preview').innerHTML = '';
    cargarPortfolio();
    _onCompletitudChange();
}

async function guardarPortfolioFirestore(portfolioURLs) {
    const userDocRef = doc(_db, 'usuarios', _auth.currentUser.uid);
    await setDoc(userDocRef, { portfolioURLs }, { merge: true });
    state.perfilData.portfolioURLs = portfolioURLs;
}

export async function subirFotosPortfolio() {
    if (!validarSubidaPortfolio()) return;

    state.uploadingPortfolio = true;
    const portfolioActual = state.perfilData.portfolioURLs || [];

    if (typeof toastInfo === 'function') {
        toastInfo(`Subiendo ${state.portfolioFiles.length} foto(s)...`);
    }

    try {
        const urls = await ejecutarSubidaPortfolio(portfolioActual);
        await guardarPortfolioFirestore([...portfolioActual, ...urls]);

        if (typeof toastSuccess === 'function') {
            toastSuccess('¡Fotos agregadas al portfolio! 🎉');
        }
        limpiarUIPortfolio();
    } catch (error) {
        console.error('Error al subir portfolio:', error);
        if (typeof toastError === 'function') {
            toastError('Error al subir las fotos');
        }
    } finally {
        state.uploadingPortfolio = false;
    }
}

// ============================================
// ELIMINAR FOTO DE PORTFOLIO
// ============================================
async function eliminarDeStorage(url) {
    if (url.includes('firebasestorage')) {
        try {
            const storageRef = ref(_storage, url);
            await deleteObject(storageRef);
        } catch {
            // Error eliminando de Storage (puede ya no existir)
        }
    }
}

export async function eliminarFotoPortfolio(index) {
    try {
        if (!confirm('¿Eliminar esta foto del portfolio?')) return;

        const portfolioURLs = state.perfilData.portfolioURLs || [];
        const urlToDelete = portfolioURLs[index];

        await eliminarDeStorage(urlToDelete);

        portfolioURLs.splice(index, 1);

        const userDocRef = doc(_db, 'usuarios', _auth.currentUser.uid);
        await setDoc(userDocRef, { portfolioURLs }, { merge: true });

        state.perfilData.portfolioURLs = portfolioURLs;

        if (typeof toastSuccess === 'function') {
            toastSuccess('Foto eliminada del portfolio');
        }

        cargarPortfolio();
        _onCompletitudChange();

    } catch (error) {
        console.error('Error al eliminar foto:', error);
        if (typeof toastError === 'function') {
            toastError('Error al eliminar la foto');
        }
    }
}

// ============================================
// PREVISUALIZAR FOTOS DE PORTFOLIO
// ============================================
function validarArchivosPortfolio(files) {
    const validaciones = files.map(f => validarArchivoImagen(f, 15));
    const errores = validaciones.filter(v => !v.valid);

    if (errores.length > 0) {
        if (typeof toastError === 'function') {
            toastError(errores[0].error);
        }
        return false;
    }
    return true;
}

async function optimizarArchivosPortfolio(files) {
    const optimizaciones = files.map(file =>
        optimizarImagen(file, 1920, 1920, 0.85)
            .then(blob => new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
            }))
    );
    return await Promise.all(optimizaciones);
}

function renderPreviewItems(files, container) {
    container.innerHTML = '';

    files.forEach((file, i) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.createElement('div');
            preview.className = 'portfolio-preview-item';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${i + 1}">
                <button type="button" onclick="removerPreviewPortfolio(${i})">×</button>
            `;
            container.appendChild(preview);
        };
        reader.readAsDataURL(file);
    });
}

export async function previsualizarPortfolio(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (!validarArchivosPortfolio(files)) {
        event.target.value = '';
        return;
    }

    try {
        if (typeof toastInfo === 'function') {
            toastInfo(`📸 Optimizando ${files.length} imagen(es)...`);
        }
        state.portfolioFiles = await optimizarArchivosPortfolio(files);
        renderPreviewItems(state.portfolioFiles, document.getElementById('portfolio-preview'));

        if (typeof toastSuccess === 'function') {
            toastSuccess('✅ Imágenes optimizadas y listas para subir');
        }
    } catch (error) {
        console.error('Error al procesar imágenes:', error);
        if (typeof toastError === 'function') { toastError('Error al procesar las imágenes'); }
        event.target.value = '';
    }
}

// ============================================
// REMOVER PREVIEW DE PORTFOLIO
// ============================================
export function removerPreviewPortfolio(index) {
    state.portfolioFiles.splice(index, 1);

    if (state.portfolioFiles.length === 0) {
        document.getElementById('portfolio-input').value = '';
        document.getElementById('portfolio-preview').innerHTML = '';
    } else {
        const previewContainer = document.getElementById('portfolio-preview');
        renderPreviewItems(state.portfolioFiles, previewContainer);
    }
}

// ============================================
// LIGHTBOX PARA PORTFOLIO
// ============================================
export function abrirLightbox(index) {
    const portfolioURLs = state.perfilData.portfolioURLs || [];
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCounter = document.getElementById('lightbox-counter');

    lightboxImg.src = portfolioURLs[index];
    lightboxCounter.textContent = `${index + 1} / ${portfolioURLs.length}`;
    lightbox.classList.add('active');

    lightbox.dataset.currentIndex = index;
}

export function cerrarLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}

export function navegarLightbox(direction) {
    const portfolioURLs = state.perfilData.portfolioURLs || [];
    const lightbox = document.getElementById('lightbox');
    let currentIndex = parseInt(lightbox.dataset.currentIndex);

    if (direction === 'prev') {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : portfolioURLs.length - 1;
    } else {
        currentIndex = currentIndex < portfolioURLs.length - 1 ? currentIndex + 1 : 0;
    }

    abrirLightbox(currentIndex);
}
