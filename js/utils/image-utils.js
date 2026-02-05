// ============================================
// IMAGE-UTILS.JS - ChambApp
// Funciones de manejo de imágenes centralizadas
// ============================================

/**
 * Optimizar imagen redimensionando y comprimiendo
 * @param {File} file - Archivo de imagen original
 * @param {number} maxWidth - Ancho máximo (default 1200)
 * @param {number} maxHeight - Alto máximo (default 1200)
 * @param {number} quality - Calidad JPEG 0-1 (default 0.85)
 * @returns {Promise<Blob>} - Imagen optimizada como Blob
 */
export async function optimizarImagen(file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) {
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
 * Validar archivo de imagen
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo en MB (default 15)
 * @returns {Object} - {valid, error, file, isHEIC}
 */
export function validarArchivoImagen(file, maxSizeMB = 15) {
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
        return {
            valid: false,
            error: 'Archivos HEIC (iPhone) no soportados en desktop. Por favor:\n• Usa tu iPhone para subir, o\n• Convierte a JPG primero, o\n• Envíate la foto por WhatsApp/email (convierte automáticamente)'
        };
    }

    // Validar tamaño
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
        return {
            valid: false,
            error: `La imagen es muy grande (máx. ${maxSizeMB}MB)`
        };
    }

    return { valid: true, file, isHEIC };
}

/**
 * Crear preview de imagen (Data URL)
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} - Data URL de la imagen
 */
export function crearPreviewImagen(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Error al leer archivo'));
        reader.readAsDataURL(file);
    });
}

/**
 * Verificar si un archivo es formato HEIC
 * @param {File} file - Archivo a verificar
 * @returns {boolean}
 */
export function esFormatoHEIC(file) {
    const nombre = file.name.toLowerCase();
    return nombre.endsWith('.heic') || nombre.endsWith('.heif');
}

/**
 * Convertir Blob a File
 * @param {Blob} blob - Blob a convertir
 * @param {string} nombreOriginal - Nombre original del archivo
 * @returns {File} - Archivo con nombre y tipo correcto
 */
export function blobToFile(blob, nombreOriginal) {
    const nombreSinExtension = nombreOriginal.replace(/\.[^/.]+$/, '');
    const nuevoNombre = `${nombreSinExtension}_optimizado.jpg`;
    return new File([blob], nuevoNombre, { type: 'image/jpeg' });
}

/**
 * Obtener dimensiones de una imagen
 * @param {File|string} source - Archivo o URL de imagen
 * @returns {Promise<{width: number, height: number}>}
 */
export function obtenerDimensiones(source) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };

        img.onerror = () => reject(new Error('Error al cargar imagen'));

        if (typeof source === 'string') {
            img.src = source;
        } else {
            const reader = new FileReader();
            reader.onload = (e) => { img.src = e.target.result; };
            reader.onerror = () => reject(new Error('Error al leer archivo'));
            reader.readAsDataURL(source);
        }
    });
}
