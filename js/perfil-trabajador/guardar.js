// ============================================
// GUARDAR PERFIL + FOTO DE PERFIL
// Modulo: perfil-trabajador/guardar.js
// ============================================

import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { optimizarImagen, validarArchivoImagen } from '../utils/image-utils.js';
import { validarNombre, validarTelefono, validarEdadMinima, validarHorarios } from '../utils/validators.js';
import { showFieldError, hideFieldError } from '../utils/form-errors.js';
import { sanitizeText } from '../utils/sanitize.js';
import { mensajeErrorAmigable } from '../utils/error-handler.js';

let _db = null;
let _storage = null;
let _auth = null;
let state = null;
let _onSaveComplete = null;

// ============================================
// INICIALIZAR MODULO
// ============================================
export function initGuardar(firebaseDb, firebaseStorage, firebaseAuth, sharedState, callbacks) {
    _db = firebaseDb;
    _storage = firebaseStorage;
    _auth = firebaseAuth;
    state = sharedState;
    _onSaveComplete = callbacks.onSaveComplete;
}

// ============================================
// HELPERS: OBTENER DATOS DE CHECKBOXES
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
// GUARDAR PERFIL COMPLETO
// ============================================
function validarCamposObligatorios() {
    let valid = true;

    const rNombre = validarNombre(document.getElementById('nombre').value);
    if (!rNombre.valid) { showFieldError('nombre', rNombre.error); valid = false; }
    else { hideFieldError('nombre'); }

    const rTel = validarTelefono(document.getElementById('telefono').value);
    if (!rTel.valid) { showFieldError('telefono', rTel.error); valid = false; }
    else { hideFieldError('telefono'); }

    const ubicacion = document.getElementById('ubicacion').value.trim();
    if (!ubicacion) { showFieldError('ubicacion', 'La ubicación es obligatoria'); valid = false; }
    else { hideFieldError('ubicacion'); }

    const fechaNac = document.getElementById('fechaNacimiento').value;
    const rEdad = validarEdadMinima(fechaNac);
    if (!rEdad.valid) { showFieldError('fechaNacimiento', rEdad.error); valid = false; }
    else { hideFieldError('fechaNacimiento'); }

    const hInicio = document.getElementById('horario-inicio')?.value || '';
    const hFin = document.getElementById('horario-fin')?.value || '';
    const rHorario = validarHorarios(hInicio, hFin);
    if (!rHorario.valid) { showFieldError('horario-fin', rHorario.error); valid = false; }
    else { hideFieldError('horario-fin'); }

    if (!valid && typeof toastWarning === 'function') {
        toastWarning('Revisa los campos marcados en rojo');
    }
    return valid;
}

function construirDatosActualizados() {
    return {
        email: state.perfilData.email || state.usuario.email,
        nombre: sanitizeText(document.getElementById('nombre').value.trim()),
        telefono: document.getElementById('telefono').value.trim(),
        ubicacion: sanitizeText(document.getElementById('ubicacion').value.trim()),
        fechaNacimiento: document.getElementById('fechaNacimiento').value || '',
        bio: sanitizeText(document.getElementById('bio').value.trim()),
        categorias: obtenerCategorias(),
        habilidades: state.habilidades,
        añosExperiencia: document.getElementById('años-experiencia').value,
        experiencia: state.experiencias,
        disponibilidad: {
            disponibilidadInmediata: document.getElementById('disponibilidad-inmediata').checked,
            diasDisponibles: obtenerDiasDisponibles(),
            horarioInicio: document.getElementById('horario-inicio').value || '',
            horarioFin: document.getElementById('horario-fin').value || '',
            zonasTrabajoPreferidas: sanitizeText(document.getElementById('zonas-trabajo').value.trim())
        }
    };
}

async function anexarFotoYPortfolio(datosActualizados) {
    if (state.fotoFile) {
        const fotoURL = await subirFoto();
        if (fotoURL) {
            datosActualizados.fotoPerfilURL = fotoURL;
        }
    } else if (state.perfilData.fotoPerfilURL) {
        datosActualizados.fotoPerfilURL = state.perfilData.fotoPerfilURL;
    }

    if (state.perfilData.portfolioURLs) {
        datosActualizados.portfolioURLs = state.perfilData.portfolioURLs;
    }
}

async function persistirPerfil(datosActualizados) {
    const userDocRef = doc(_db, 'usuarios', _auth.currentUser.uid);
    await setDoc(userDocRef, datosActualizados, { merge: true });

    const usuarioActualizado = { ...state.usuario, ...datosActualizados };
    localStorage.setItem('usuarioChambApp', JSON.stringify(usuarioActualizado));

    state.perfilData = { ...state.perfilData, ...datosActualizados };
}

export async function guardarPerfil() {
    try {
        if (!validarCamposObligatorios()) return;

        const datosActualizados = construirDatosActualizados();
        await anexarFotoYPortfolio(datosActualizados);
        await persistirPerfil(datosActualizados);

        if (typeof toastSuccess === 'function') {
            toastSuccess('¡Perfil actualizado exitosamente! 🎉');
        }

        _onSaveComplete();
    } catch (error) {
        console.error('Error al guardar perfil:', error);
        if (typeof toastError === 'function') {
            toastError(mensajeErrorAmigable(error, 'guardar el perfil'));
        }
    }
}

// ============================================
// SUBIR FOTO DE PERFIL A FIREBASE STORAGE
// ============================================
async function limpiarFotoAnterior() {
    if (state.perfilData.fotoPerfilURL && state.perfilData.fotoPerfilURL.includes('firebasestorage')) {
        try {
            const oldRef = ref(_storage, state.perfilData.fotoPerfilURL);
            await deleteObject(oldRef);
        } catch {
            // Error eliminando foto anterior (puede ya no existir)
        }
    }
}

async function subirFoto() {
    try {
        if (!state.fotoFile || state.uploadingFoto) return null;

        state.uploadingFoto = true;

        const timestamp = Date.now();
        const storageRef = ref(_storage, `perfiles/${_auth.currentUser.uid}/foto-perfil-${timestamp}.jpg`);

        await uploadBytes(storageRef, state.fotoFile);
        const downloadURL = await getDownloadURL(storageRef);

        await limpiarFotoAnterior();

        state.uploadingFoto = false;
        state.fotoFile = null;

        return downloadURL;

    } catch (error) {
        console.error('Error al subir foto:', error);
        state.uploadingFoto = false;

        if (typeof toastError === 'function') {
            toastError('Error al subir la foto');
        }

        return null;
    }
}

// ============================================
// PREVISUALIZAR FOTO DE PERFIL
// ============================================
async function procesarImagenPerfil(file) {
    const optimizedBlob = await optimizarImagen(file, 800, 800, 0.85);

    state.fotoFile = new File([optimizedBlob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
    });

    return optimizedBlob;
}

function mostrarPreviewAvatar(blob) {
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('avatar-preview').src = e.target.result;

        if (typeof toastSuccess === 'function') {
            toastSuccess('✅ Foto optimizada. Guarda el perfil para subirla.');
        }
    };
    reader.readAsDataURL(blob);
}

export async function previsualizarFoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    const validation = validarArchivoImagen(file, 15);
    if (!validation.valid) {
        if (typeof toastError === 'function') {
            toastError(validation.error);
        }
        event.target.value = '';
        return;
    }

    try {
        if (typeof toastInfo === 'function') {
            toastInfo('📸 Optimizando imagen...');
        }

        const optimizedBlob = await procesarImagenPerfil(file);
        mostrarPreviewAvatar(optimizedBlob);
    } catch (error) {
        console.error('Error al procesar imagen:', error);
        if (typeof toastError === 'function') {
            toastError('Error al procesar la imagen');
        }
        event.target.value = '';
    }
}
