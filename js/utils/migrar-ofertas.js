// ============================================
// SCRIPT DE MIGRACION - OFERTAS
// ChambApp - Task 10
// ============================================
// Este script migra ofertas con ubicacion string
// al nuevo formato estructurado con coordenadas
//
// EJECUTAR UNA SOLA VEZ desde la consola del navegador:
// 1. Abrir dashboard.html
// 2. Abrir DevTools (F12)
// 3. Ir a Console
// 4. Copiar y pegar el contenido de este archivo
// 5. Ejecutar: migrarOfertas()
// ============================================

import { db } from '../config/firebase-init.js';
import { collection, getDocs, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Coordenadas por defecto (centro de Lima)
const LIMA_CENTRO = {
    lat: -12.0464,
    lng: -77.0428
};

/**
 * Migrar ofertas con ubicacion string al nuevo formato
 * @returns {Promise<{migradas: number, errores: number, omitidas: number}>}
 */
export async function migrarOfertas() {
    console.log('🔄 Iniciando migracion de ofertas...');

    let migradas = 0;
    let errores = 0;
    let omitidas = 0;

    try {
        // Obtener todas las ofertas
        const ofertasRef = collection(db, 'ofertas');
        const snapshot = await getDocs(ofertasRef);

        console.log(`📊 Total de ofertas encontradas: ${snapshot.size}`);

        for (const docSnap of snapshot.docs) {
            const oferta = docSnap.data();
            const id = docSnap.id;

            try {
                // Verificar si ya tiene el nuevo formato
                if (oferta.ubicacion && typeof oferta.ubicacion === 'object' && oferta.ubicacion.coordenadas) {
                    console.log(`⏭️ Oferta ${id} ya tiene formato nuevo, omitiendo...`);
                    omitidas++;
                    continue;
                }

                // Construir nuevo objeto de ubicacion
                let nuevaUbicacion;

                if (typeof oferta.ubicacion === 'string') {
                    // Formato antiguo: string simple
                    nuevaUbicacion = {
                        departamento: 'Lima',
                        provincia: 'Lima',
                        distrito: extraerDistrito(oferta.ubicacion) || 'Lima',
                        direccion_exacta: '',
                        referencia: oferta.ubicacion,
                        coordenadas: LIMA_CENTRO,
                        texto_completo: oferta.ubicacion || 'Lima, Lima, Lima',
                        es_ubicacion_precisa: false,
                        migrado: true,
                        fecha_migracion: new Date().toISOString()
                    };
                } else if (!oferta.ubicacion) {
                    // Sin ubicacion
                    nuevaUbicacion = {
                        departamento: 'Lima',
                        provincia: 'Lima',
                        distrito: 'Lima',
                        direccion_exacta: '',
                        referencia: '',
                        coordenadas: LIMA_CENTRO,
                        texto_completo: 'Lima, Lima, Lima',
                        es_ubicacion_precisa: false,
                        migrado: true,
                        fecha_migracion: new Date().toISOString()
                    };
                } else {
                    // Ya es objeto pero sin coordenadas
                    nuevaUbicacion = {
                        ...oferta.ubicacion,
                        coordenadas: oferta.ubicacion.coordenadas || LIMA_CENTRO,
                        es_ubicacion_precisa: false,
                        migrado: true,
                        fecha_migracion: new Date().toISOString()
                    };
                }

                // Actualizar en Firestore
                const docRef = doc(db, 'ofertas', id);
                await updateDoc(docRef, {
                    ubicacion: nuevaUbicacion
                });

                console.log(`✅ Oferta ${id} migrada: ${nuevaUbicacion.texto_completo}`);
                migradas++;

            } catch (error) {
                console.error(`❌ Error migrando oferta ${id}:`, error);
                errores++;
            }
        }

        console.log('');
        console.log('========================================');
        console.log('📊 RESUMEN DE MIGRACION');
        console.log('========================================');
        console.log(`✅ Migradas: ${migradas}`);
        console.log(`⏭️ Omitidas (ya migradas): ${omitidas}`);
        console.log(`❌ Errores: ${errores}`);
        console.log(`📊 Total procesadas: ${migradas + omitidas + errores}`);
        console.log('========================================');

        return { migradas, errores, omitidas };

    } catch (error) {
        console.error('❌ Error en migracion:', error);
        throw error;
    }
}

/**
 * Intentar extraer distrito de un string de ubicacion
 * @param {string} ubicacion
 * @returns {string|null}
 */
function extraerDistrito(ubicacion) {
    if (!ubicacion) return null;

    // Distritos comunes de Lima
    const distritos = [
        'Miraflores', 'San Isidro', 'Surco', 'La Molina', 'San Borja',
        'Barranco', 'Chorrillos', 'Magdalena', 'Jesus Maria', 'Lince',
        'Pueblo Libre', 'San Miguel', 'Breña', 'Lima', 'Rimac',
        'La Victoria', 'El Agustino', 'San Juan de Lurigancho', 'SJL',
        'Ate', 'Santa Anita', 'San Juan de Miraflores', 'SJM',
        'Villa El Salvador', 'VES', 'Villa Maria del Triunfo', 'VMT',
        'Surquillo', 'San Luis', 'Callao', 'Ventanilla', 'Bellavista'
    ];

    const ubicacionLower = ubicacion.toLowerCase();

    for (const distrito of distritos) {
        if (ubicacionLower.includes(distrito.toLowerCase())) {
            return distrito;
        }
    }

    return null;
}

// Hacer disponible globalmente para ejecutar desde consola
if (typeof window !== 'undefined') {
    window.migrarOfertas = migrarOfertas;
}

console.log('✅ Script de migracion cargado');
console.log('📝 Para ejecutar, llama: migrarOfertas()');
