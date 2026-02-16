/**
 * Módulo de submit del formulario de ofertas
 * Maneja: crear/actualizar ofertas, cargar datos en modo edición
 *
 * @module publicar-oferta/submit
 */

import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { sanitizeText } from '../utils/sanitize.js';
import { mensajeErrorAmigable } from '../utils/error-handler.js';

// ============================================
// VARIABLES DEL MÓDULO
// ============================================
let state = null;

/**
 * Inicializa el módulo con el estado compartido
 * @param {Object} sharedState - Estado compartido
 */
export function initSubmit(sharedState) {
    state = sharedState;
    initSubmitListener();
}

// ============================================
// CARGAR OFERTA PARA EDITAR/REUTILIZAR
// ============================================
export async function cargarOfertaParaEditar(id) {
    const { db, usuario, modoEdicion, modoReutilizar, callbacks, elements } = state;

    try {
        if (typeof toastLoading === 'function') {
            var loadingToast = toastLoading('Cargando oferta...');
        }

        const docRef = doc(db, 'ofertas', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            if (loadingToast) loadingToast.remove();
            if (typeof toastError === 'function') toastError('No se encontró la oferta');
            setTimeout(() => window.location.href = 'dashboard.html', 2000);
            return;
        }

        const oferta = docSnap.data();

        // Verificar permisos
        if (oferta.empleadorEmail !== usuario.email) {
            if (loadingToast) loadingToast.remove();
            if (typeof toastError === 'function') toastError('No tienes permiso para editar esta oferta');
            setTimeout(() => window.location.href = 'dashboard.html', 2000);
            return;
        }

        // Pre-llenar formulario
        document.getElementById('titulo').value = oferta.titulo || '';
        document.getElementById('categoria').value = oferta.categoria || '';
        document.getElementById('descripcion').value = oferta.descripcion || '';

        // Ubicación
        if (typeof oferta.ubicacion === 'string') {
            document.getElementById('referencia').value = oferta.ubicacion;
        } else if (oferta.ubicacion && typeof oferta.ubicacion === 'object') {
            if (callbacks.precargarUbicacion) {
                await callbacks.precargarUbicacion(oferta.ubicacion);
            }
        }

        document.getElementById('salario').value = oferta.salario || '';
        document.getElementById('duracion').value = oferta.duracion === 'No especificada' ? '' : oferta.duracion || '';
        document.getElementById('horario').value = oferta.horario === 'No especificado' ? '' : oferta.horario || '';

        const vacantesInput = document.getElementById('vacantes');
        if (vacantesInput) vacantesInput.value = oferta.vacantes || 1;

        // Campos opcionales
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
        if (oferta.requiereHerramientas) document.getElementById('herramientas').checked = true;
        if (oferta.requiereTransporte) document.getElementById('transporte').checked = true;
        if (oferta.requiereEquipos) document.getElementById('equipos').checked = true;

        // Character counters
        document.getElementById('titulo-count').textContent = oferta.titulo?.length || 0;
        document.getElementById('descripcion-count').textContent = oferta.descripcion?.length || 0;

        // Cargar fotos (solo en modo edición)
        if (modoEdicion && oferta.imagenesURLs && callbacks.cargarFotosExistentes) {
            callbacks.cargarFotosExistentes(oferta.imagenesURLs);
        }

        // Actualizar textos según modo
        const headerTitle = document.querySelector('.step-header h2');
        const headerDesc = document.querySelector('.step-header p');

        if (modoReutilizar) {
            if (headerTitle) headerTitle.textContent = 'Reutilizar Oferta';
            if (headerDesc) headerDesc.textContent = 'Publica nueva oferta basada en una anterior';
            elements.btnSubmit.innerHTML = 'Publicar Oferta';
        } else {
            if (headerTitle) headerTitle.textContent = 'Editar Oferta';
            if (headerDesc) headerDesc.textContent = 'Actualiza la información de tu oferta';
            elements.btnSubmit.innerHTML = 'Guardar Cambios';
        }

        if (loadingToast) loadingToast.remove();
        if (typeof toastSuccess === 'function') {
            toastSuccess(modoReutilizar ? 'Datos cargados. Modifica y publica.' : 'Oferta cargada');
        }

    } catch (error) {
        console.error('Error al cargar oferta:', error);
        if (typeof toastError === 'function') toastError('Error al cargar la oferta');
        setTimeout(() => window.location.href = 'dashboard.html', 2000);
    }
}

// ============================================
// SUBMIT DEL FORMULARIO
// ============================================
function initSubmitListener() {
    const { elements, db, auth, usuario, modoEdicion, ofertaId, callbacks } = state;

    elements.formOferta.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validar ubicación
        const ubicacion = callbacks.obtenerUbicacionCompleta ? await callbacks.obtenerUbicacionCompleta() : null;
        if (!ubicacion) {
            if (typeof toastError === 'function') toastError('Por favor selecciona la ubicación completa');
            state.currentStep = 2;
            callbacks.showStep(state.currentStep);
            return;
        }

        // Deshabilitar botón
        elements.btnSubmit.disabled = true;
        const originalText = elements.btnSubmit.innerHTML;
        elements.btnSubmit.innerHTML = modoEdicion ? 'Guardando...' : 'Publicando...';

        try {
            // Recopilar datos (sanitizar campos de texto libre)
            const ofertaData = {
                titulo: sanitizeText(document.getElementById('titulo').value.trim()),
                categoria: document.getElementById('categoria').value,
                descripcion: sanitizeText(document.getElementById('descripcion').value.trim()),
                ubicacion: ubicacion,
                salario: sanitizeText(document.getElementById('salario').value.trim()),
                duracion: sanitizeText(document.getElementById('duracion').value.trim()) || 'No especificada',
                horario: sanitizeText(document.getElementById('horario').value.trim()) || 'No especificado',
                experiencia: document.getElementById('experiencia').value || 'No especificada',
                habilidades: sanitizeText(document.getElementById('habilidades').value.trim()) || 'No especificadas',
                requisitosAdicionales: sanitizeText(document.getElementById('requisitos-adicionales').value.trim()) || 'Ninguno',
                requiereHerramientas: document.getElementById('herramientas').checked,
                requiereTransporte: document.getElementById('transporte').checked,
                requiereEquipos: document.getElementById('equipos').checked,
                vacantes: parseInt(document.getElementById('vacantes').value) || 1
            };

            if (modoEdicion) {
                await actualizarOferta(ofertaData, ofertaId);
            } else {
                await crearOferta(ofertaData);
            }

            // Redirigir
            setTimeout(() => window.location.href = 'dashboard.html', 1500);

        } catch (error) {
            console.error('Error:', error);
            elements.btnSubmit.disabled = false;
            elements.btnSubmit.innerHTML = originalText;
            if (typeof toastError === 'function') {
                toastError(mensajeErrorAmigable(error, modoEdicion ? 'actualizar la oferta' : 'publicar la oferta'));
            }
        }
    });
}

async function actualizarOferta(ofertaData, ofertaId) {
    const { db, callbacks } = state;

    // Fecha de expiración (+14 días)
    const nuevaFechaExpiracion = new Date();
    nuevaFechaExpiracion.setDate(nuevaFechaExpiracion.getDate() + 14);

    // Subir fotos nuevas
    let nuevasURLs = [];
    if (callbacks.subirFotosOferta) {
        if (typeof toastInfo === 'function') toastInfo('Subiendo fotos...');
        nuevasURLs = await callbacks.subirFotosOferta(ofertaId);
    }

    // Combinar fotos
    const fotosExistentes = callbacks.getFotosExistentes ? callbacks.getFotosExistentes() : [];
    const imagenesURLs = [...fotosExistentes, ...nuevasURLs];

    // Eliminar fotos marcadas
    if (callbacks.eliminarFotosMarcadas) {
        await callbacks.eliminarFotosMarcadas();
    }

    // Validar vacantes
    const docRef = doc(db, 'ofertas', ofertaId);
    const ofertaActual = await getDoc(docRef);
    if (ofertaActual.exists()) {
        const aceptadosActuales = ofertaActual.data().aceptadosCount || 0;
        if (ofertaData.vacantes < aceptadosActuales) {
            ofertaData.vacantes = aceptadosActuales;
            if (typeof toastInfo === 'function') {
                toastInfo(`Vacantes ajustadas a ${aceptadosActuales}`);
            }
        }
    }

    await updateDoc(docRef, {
        ...ofertaData,
        imagenesURLs,
        fechaActualizacion: serverTimestamp(),
        fechaExpiracion: Timestamp.fromDate(nuevaFechaExpiracion)
    });

    if (typeof toastSuccess === 'function') {
        toastSuccess('¡Oferta actualizada! Visible por 14 días más');
    }
}

async function crearOferta(ofertaData) {
    const { db, auth, usuario, callbacks } = state;

    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 14);

    const nuevaOferta = {
        ...ofertaData,
        empleadorId: auth.currentUser?.uid || usuario.uid || 'demo',
        empleadorNombre: usuario.nombre,
        empleadorEmail: usuario.email,
        empleadorTelefono: usuario.telefono || '',
        estado: 'activa',
        fechaCreacion: serverTimestamp(),
        fechaExpiracion: Timestamp.fromDate(fechaExpiracion),
        aplicaciones: 0,
        aceptadosCount: 0,
        trabajadoresAceptados: [],
        imagenesURLs: []
    };

    const docRef = await addDoc(collection(db, 'ofertas'), nuevaOferta);

    // Subir fotos
    if (callbacks.subirFotosOferta) {
        if (typeof toastInfo === 'function') toastInfo('Subiendo fotos...');
        const imagenesURLs = await callbacks.subirFotosOferta(docRef.id);
        if (imagenesURLs.length > 0) {
            await updateDoc(docRef, { imagenesURLs });
        }
    }

    if (typeof toastSuccess === 'function') {
        toastSuccess('¡Oferta publicada exitosamente!');
    }
}
