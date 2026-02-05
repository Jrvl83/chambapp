// ============================================
// PERFIL EMPLEADOR - SIMPLE
// ChambApp - JavaScript para empleadores
// ============================================

// Firebase - Importar instancias centralizadas
import { auth, db, storage } from './config/firebase-init.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { optimizarImagen, validarArchivoImagen } from './utils/image-utils.js';

// Variables globales
let perfilData = {};
let fotoFile = null;
let usuario = null;
let uploadingFoto = false;

// ============================================
// VERIFICAR AUTENTICACIÓN
// ============================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const usuarioStr = localStorage.getItem('usuarioChambApp');
        if (!usuarioStr) {
            toastError('Debes iniciar sesión');
            setTimeout(() => window.location.href = 'login.html', 1000);
            return;
        }
        
        usuario = JSON.parse(usuarioStr);
        
        if (usuario.tipo !== 'empleador') {
            toastError('Esta página es solo para empleadores');
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
            return;
        }
        
        await cargarPerfil();
        
    } else {
        toastError('Debes iniciar sesión');
        setTimeout(() => window.location.href = 'login.html', 1000);
    }
});

// ============================================
// CARGAR PERFIL
// ============================================
async function cargarPerfil() {
    try {
        const userDocRef = doc(db, 'usuarios', auth.currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
            perfilData = docSnap.data();
        } else {
            perfilData = {
                email: usuario.email,
                nombre: usuario.nombre || '',
                telefono: usuario.telefono || '',
                tipo: 'empleador'
            };
            
            await setDoc(userDocRef, perfilData, { merge: true });
        }
        
        cargarDatosPersonales();
        
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        if (typeof toastError === 'function') {
            toastError('Error al cargar el perfil');
        }
    }
}

// ============================================
// CARGAR DATOS EN FORMULARIO
// ============================================
function cargarDatosPersonales() {
    document.getElementById('profile-name').textContent = perfilData.nombre || 'Usuario';
    document.getElementById('profile-email').textContent = perfilData.email || usuario.email;
    
    document.getElementById('nombre').value = perfilData.nombre || '';
    document.getElementById('email').value = perfilData.email || usuario.email;
    document.getElementById('telefono').value = perfilData.telefono || '';
    document.getElementById('ubicacion').value = perfilData.ubicacion || '';
    
    if (perfilData.fotoPerfilURL) {
        document.getElementById('avatar-preview').src = perfilData.fotoPerfilURL;
    } else {
        const nombre = perfilData.nombre || usuario.nombre || 'Usuario';
        document.getElementById('avatar-preview').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&size=120&background=2563eb&color=fff`;
    }
}

// ============================================
// VALIDAR ARCHIVO (alias para compatibilidad)
// ============================================
function validarArchivo(file) {
    return validarArchivoImagen(file, 15);
}

// ============================================
// PREVISUALIZAR FOTO
// ============================================
async function previsualizarFoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const validation = validarArchivo(file);
    if (!validation.valid) {
        if (typeof toastError === 'function') {
            toastError(validation.error);
        } else {
            toastError(validation.error);
        }
        event.target.value = '';
        return;
    }
    
    try {
        if (typeof toastInfo === 'function') {
            toastInfo('📸 Optimizando imagen...');
        }
        
        const optimizedBlob = await optimizarImagen(file, 800, 800, 0.85);
        
        fotoFile = new File([optimizedBlob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
        });
        
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('avatar-preview').src = e.target.result;
            
            if (typeof toastSuccess === 'function') {
                toastSuccess('✅ Foto optimizada. Guarda el perfil para subirla.');
            }
        };
        reader.readAsDataURL(optimizedBlob);
        
    } catch (error) {
        console.error('Error al procesar imagen:', error);
        if (typeof toastError === 'function') {
            toastError('Error al procesar la imagen');
        }
        event.target.value = '';
    }
}

// ============================================
// SUBIR FOTO A STORAGE
// ============================================
async function subirFoto() {
    try {
        if (!fotoFile || uploadingFoto) return null;
        
        uploadingFoto = true;

        const timestamp = Date.now();
        const storageRef = ref(storage, `perfiles/${auth.currentUser.uid}/foto-perfil-${timestamp}.jpg`);
        
        await uploadBytes(storageRef, fotoFile);
        const downloadURL = await getDownloadURL(storageRef);

        if (perfilData.fotoPerfilURL && perfilData.fotoPerfilURL.includes('firebasestorage')) {
            try {
                const oldRef = ref(storage, perfilData.fotoPerfilURL);
                await deleteObject(oldRef);
            } catch {
                // Error eliminando foto anterior
            }
        }
        
        uploadingFoto = false;
        fotoFile = null;
        
        return downloadURL;
        
    } catch (error) {
        console.error('Error al subir foto:', error);
        uploadingFoto = false;
        
        if (typeof toastError === 'function') {
            toastError('Error al subir la foto');
        }
        
        return null;
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
        
        // Deshabilitar botón
        const btnGuardar = document.getElementById('btn-guardar');
        btnGuardar.disabled = true;
        btnGuardar.textContent = '💾 Guardando...';
        
        const datosActualizados = {
            email: perfilData.email || usuario.email,
            nombre: nombre,
            telefono: telefono,
            ubicacion: ubicacion,
            tipo: 'empleador'
        };
        
        if (fotoFile) {
            const fotoURL = await subirFoto();
            if (fotoURL) {
                datosActualizados.fotoPerfilURL = fotoURL;
            }
        } else if (perfilData.fotoPerfilURL) {
            datosActualizados.fotoPerfilURL = perfilData.fotoPerfilURL;
        }
        
        const userDocRef = doc(db, 'usuarios', auth.currentUser.uid);
        await setDoc(userDocRef, datosActualizados, { merge: true });
        
        const usuarioActualizado = { ...usuario, ...datosActualizados };
        localStorage.setItem('usuarioChambApp', JSON.stringify(usuarioActualizado));

        if (typeof toastSuccess === 'function') {
            toastSuccess('¡Perfil actualizado exitosamente! 🎉');
        } else {
            alert('¡Perfil actualizado exitosamente!');
        }
        
        perfilData = { ...perfilData, ...datosActualizados };
        cargarDatosPersonales();
        
        // Restaurar botón
        btnGuardar.disabled = false;
        btnGuardar.textContent = '💾 Guardar Cambios';
        
    } catch (error) {
        console.error('Error al guardar perfil:', error);
        if (typeof toastError === 'function') {
            toastError('Error al guardar el perfil');
        } else {
            alert('Error al guardar el perfil: ' + error.message);
        }
        
        // Restaurar botón
        const btnGuardar = document.getElementById('btn-guardar');
        btnGuardar.disabled = false;
        btnGuardar.textContent = '💾 Guardar Cambios';
    }
}

// ============================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================
window.guardarPerfil = guardarPerfil;
window.previsualizarFoto = previsualizarFoto;
