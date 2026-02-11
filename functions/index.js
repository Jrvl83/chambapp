// ============================================
// CLOUD FUNCTIONS - ChambApp
// Notificaciones Push + Calificaciones
// ============================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// ============================================
// NOTIFICACION: Nueva Postulacion (para Empleador)
// Trigger: Cuando se crea un documento en 'aplicaciones'
// ============================================
exports.notificarNuevaPostulacion = functions
    .region('us-central1')
    .firestore
    .document('aplicaciones/{aplicacionId}')
    .onCreate(async (snap, context) => {
        const aplicacion = snap.data();
        const empleadorId = aplicacion.empleadorId;

        console.log('Nueva postulacion creada:', context.params.aplicacionId);
        console.log('Empleador ID:', empleadorId);

        if (!empleadorId) {
            console.log('No hay empleadorId, saltando notificacion');
            return null;
        }

        try {
            // Construir datos de notificacion
            const nombreTrabajador = aplicacion.aplicanteNombre || 'Un trabajador';
            const tituloOferta = aplicacion.ofertaTitulo || 'tu oferta';
            const titulo = 'Nueva postulacion';
            const cuerpo = `${nombreTrabajador} se postulo a "${tituloOferta}"`;

            // Siempre guardar en Firestore (historial in-app)
            await db.collection('usuarios').doc(empleadorId)
                .collection('notificaciones').add({
                    tipo: 'nueva_postulacion',
                    titulo,
                    cuerpo,
                    leida: false,
                    url: '/mis-aplicaciones.html',
                    datos: {
                        aplicacionId: context.params.aplicacionId,
                        aplicanteNombre: aplicacion.aplicanteNombre,
                        ofertaTitulo: aplicacion.ofertaTitulo
                    },
                    fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
                });
            console.log('Notificacion guardada en Firestore para:', empleadorId);

            // Intentar push FCM solo si tiene token
            const empleadorDoc = await db.collection('usuarios').doc(empleadorId).get();
            if (!empleadorDoc.exists) return null;

            const empleadorData = empleadorDoc.data();
            const fcmToken = empleadorData.fcmToken;

            if (!fcmToken || empleadorData.notificacionesActivas === false) {
                console.log('Sin token FCM o notificaciones desactivadas, solo guardado in-app');
                return null;
            }

            const response = await messaging.send({
                notification: { title: titulo, body: cuerpo },
                data: {
                    tipo: 'nueva_postulacion',
                    aplicacionId: context.params.aplicacionId,
                    ofertaId: aplicacion.ofertaId || '',
                    url: '/mis-aplicaciones.html',
                    tag: 'postulacion-' + context.params.aplicacionId
                },
                token: fcmToken
            });
            console.log('Push FCM enviado:', response);
            return response;

        } catch (error) {
            console.error('Error en notificacion nueva postulacion:', error);
            return null;
        }
    });

// ============================================
// NOTIFICACION: Postulacion Aceptada (para Trabajador)
// Trigger: Cuando se actualiza 'estado' a 'aceptado' en 'aplicaciones'
// ============================================
exports.notificarPostulacionAceptada = functions
    .region('us-central1')
    .firestore
    .document('aplicaciones/{aplicacionId}')
    .onUpdate(async (change, context) => {
        const antes = change.before.data();
        const despues = change.after.data();

        // Solo notificar si cambio a 'aceptado'
        if (antes.estado === despues.estado || despues.estado !== 'aceptado') {
            return null;
        }

        console.log('Postulacion aceptada:', context.params.aplicacionId);

        const trabajadorId = despues.aplicanteId;

        if (!trabajadorId) {
            console.log('No hay aplicanteId, saltando notificacion');
            return null;
        }

        try {
            // Construir datos de notificacion
            const nombreEmpleador = despues.empleadorNombre || 'El empleador';
            const tituloOferta = despues.ofertaTitulo || 'la oferta';
            const titulo = '!Te aceptaron!';
            const cuerpo = `${nombreEmpleador} acepto tu postulacion para "${tituloOferta}"`;

            // Siempre guardar en Firestore (historial in-app)
            await db.collection('usuarios').doc(trabajadorId)
                .collection('notificaciones').add({
                    tipo: 'postulacion_aceptada',
                    titulo,
                    cuerpo,
                    leida: false,
                    url: '/mis-aplicaciones-trabajador.html',
                    datos: {
                        aplicacionId: context.params.aplicacionId,
                        empleadorNombre: despues.empleadorNombre,
                        ofertaTitulo: despues.ofertaTitulo
                    },
                    fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
                });
            console.log('Notificacion guardada en Firestore para:', trabajadorId);

            // Intentar push FCM solo si tiene token
            const trabajadorDoc = await db.collection('usuarios').doc(trabajadorId).get();
            if (!trabajadorDoc.exists) return null;

            const trabajadorData = trabajadorDoc.data();
            const fcmToken = trabajadorData.fcmToken;

            if (!fcmToken || trabajadorData.notificacionesActivas === false) {
                console.log('Sin token FCM o notificaciones desactivadas, solo guardado in-app');
                return null;
            }

            const response = await messaging.send({
                notification: { title: titulo, body: cuerpo },
                data: {
                    tipo: 'postulacion_aceptada',
                    aplicacionId: context.params.aplicacionId,
                    ofertaId: despues.ofertaId || '',
                    url: '/mis-aplicaciones-trabajador.html',
                    tag: 'aceptacion-' + context.params.aplicacionId
                },
                token: fcmToken
            });
            console.log('Push FCM enviado:', response);
            return response;

        } catch (error) {
            console.error('Error en notificacion aceptacion:', error);
            return null;
        }
    });

// ============================================
// TAREA PROGRAMADA: Marcar Ofertas Caducadas
// Schedule: Diariamente a las 00:00 hora Peru (UTC-5)
// ============================================
exports.marcarOfertasCaducadas = functions
    .region('us-central1')
    .pubsub.schedule('0 5 * * *')  // 00:00 Peru = 05:00 UTC
    .timeZone('America/Lima')
    .onRun(async (context) => {
        console.log('Iniciando tarea: marcar ofertas caducadas');

        try {
            const ahora = admin.firestore.Timestamp.now();

            // Query: ofertas activas con fecha expirada
            const snapshot = await db.collection('ofertas')
                .where('estado', '==', 'activa')
                .where('fechaExpiracion', '<', ahora)
                .get();

            if (snapshot.empty) {
                console.log('No hay ofertas para caducar');
                return null;
            }

            console.log(`Ofertas a caducar: ${snapshot.size}`);

            // Batch update (max 500 por batch)
            const batch = db.batch();
            let caducadas = 0;
            let enCurso = 0;

            snapshot.docs.forEach(docSnap => {
                const data = docSnap.data();
                const aceptadosCount = data.aceptadosCount || 0;

                if (aceptadosCount > 0) {
                    // Tiene trabajadores aceptados: pasar a en_curso (siguen trabajando)
                    batch.update(docSnap.ref, {
                        estado: 'en_curso',
                        fechaCaducidad: admin.firestore.FieldValue.serverTimestamp()
                    });
                    enCurso++;
                } else {
                    // Sin aceptados: caducar normalmente
                    batch.update(docSnap.ref, {
                        estado: 'caducada',
                        fechaCaducidad: admin.firestore.FieldValue.serverTimestamp()
                    });
                    caducadas++;
                }
            });

            await batch.commit();
            console.log(`${caducadas} ofertas caducadas, ${enCurso} pasadas a en_curso (con aceptados)`);

            return null;

        } catch (error) {
            console.error('Error marcando ofertas caducadas:', error);
            return null;
        }
    });

// ============================================
// CALIFICACION: Actualizar Promedio del Usuario
// Trigger: Cuando se crea un documento en 'calificaciones'
// ============================================

function determinarUsuarioCalificado(calificacion) {
    const tipo = calificacion.tipo || 'empleador_a_trabajador';

    if (tipo === 'trabajador_a_empleador') {
        return calificacion.empleadorId;
    }
    return calificacion.trabajadorId;
}

function calcularNuevoPromedio(data, nuevaPuntuacion) {
    const promedioActual = data.calificacionPromedio || 0;
    const totalActual = data.totalCalificaciones || 0;

    const nuevoTotal = totalActual + 1;
    const sumaTotal = (promedioActual * totalActual) + nuevaPuntuacion;
    const nuevoPromedio = Number((sumaTotal / nuevoTotal).toFixed(2));

    const distribucion = data.distribucionCalificaciones || {
        '5': 0, '4': 0, '3': 0, '2': 0, '1': 0
    };
    distribucion[String(nuevaPuntuacion)] = (distribucion[String(nuevaPuntuacion)] || 0) + 1;

    return { nuevoPromedio, nuevoTotal, distribucion };
}

exports.actualizarPromedioCalificacion = functions
    .region('us-central1')
    .firestore
    .document('calificaciones/{calificacionId}')
    .onCreate(async (snap, context) => {
        const calificacion = snap.data();
        const puntuacion = calificacion.puntuacion;

        if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
            console.log('Puntuacion invalida:', puntuacion);
            return null;
        }

        const targetUserId = determinarUsuarioCalificado(calificacion);

        if (!targetUserId) {
            console.log('No se pudo determinar usuario a actualizar');
            return null;
        }

        console.log('Actualizando promedio para usuario:', targetUserId);

        try {
            const userRef = db.collection('usuarios').doc(targetUserId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                console.log('Usuario no encontrado:', targetUserId);
                return null;
            }

            const { nuevoPromedio, nuevoTotal, distribucion } = calcularNuevoPromedio(userDoc.data(), puntuacion);

            await userRef.update({
                calificacionPromedio: nuevoPromedio,
                totalCalificaciones: nuevoTotal,
                distribucionCalificaciones: distribucion
            });

            console.log(`Promedio actualizado: ${nuevoPromedio} (${nuevoTotal} calificaciones)`);
            return null;

        } catch (error) {
            console.error('Error actualizando promedio:', error);
            return null;
        }
    });
