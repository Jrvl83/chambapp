// ============================================
// CLOUD FUNCTIONS - ChambApp
// Notificaciones Push
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
            // Obtener token FCM del empleador
            const empleadorDoc = await db.collection('usuarios').doc(empleadorId).get();

            if (!empleadorDoc.exists) {
                console.log('Empleador no encontrado:', empleadorId);
                return null;
            }

            const empleadorData = empleadorDoc.data();
            const fcmToken = empleadorData.fcmToken;

            if (!fcmToken) {
                console.log('Empleador no tiene token FCM:', empleadorId);
                return null;
            }

            // Verificar si tiene notificaciones activas
            if (empleadorData.notificacionesActivas === false) {
                console.log('Empleador tiene notificaciones desactivadas');
                return null;
            }

            // Construir mensaje
            const nombreTrabajador = aplicacion.aplicanteNombre || 'Un trabajador';
            const tituloOferta = aplicacion.ofertaTitulo || 'tu oferta';

            const message = {
                notification: {
                    title: 'Nueva postulacion',
                    body: `${nombreTrabajador} se postulo a "${tituloOferta}"`
                },
                data: {
                    tipo: 'nueva_postulacion',
                    aplicacionId: context.params.aplicacionId,
                    ofertaId: aplicacion.ofertaId || '',
                    url: '/mis-aplicaciones.html',
                    tag: 'postulacion-' + context.params.aplicacionId
                },
                token: fcmToken
            };

            // Enviar notificacion
            const response = await messaging.send(message);
            console.log('Notificacion enviada exitosamente:', response);

            // Guardar en coleccion de notificaciones del usuario (para historial)
            await db.collection('usuarios').doc(empleadorId)
                .collection('notificaciones').add({
                    tipo: 'nueva_postulacion',
                    titulo: message.notification.title,
                    cuerpo: message.notification.body,
                    leida: false,
                    url: '/mis-aplicaciones.html',
                    datos: {
                        aplicacionId: context.params.aplicacionId,
                        aplicanteNombre: aplicacion.aplicanteNombre,
                        ofertaTitulo: aplicacion.ofertaTitulo
                    },
                    fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
                });

            return response;

        } catch (error) {
            console.error('Error enviando notificacion nueva postulacion:', error);
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
            // Obtener token FCM del trabajador
            const trabajadorDoc = await db.collection('usuarios').doc(trabajadorId).get();

            if (!trabajadorDoc.exists) {
                console.log('Trabajador no encontrado:', trabajadorId);
                return null;
            }

            const trabajadorData = trabajadorDoc.data();
            const fcmToken = trabajadorData.fcmToken;

            if (!fcmToken) {
                console.log('Trabajador no tiene token FCM:', trabajadorId);
                return null;
            }

            // Verificar si tiene notificaciones activas
            if (trabajadorData.notificacionesActivas === false) {
                console.log('Trabajador tiene notificaciones desactivadas');
                return null;
            }

            // Construir mensaje
            const nombreEmpleador = despues.empleadorNombre || 'El empleador';
            const tituloOferta = despues.ofertaTitulo || 'la oferta';

            const message = {
                notification: {
                    title: '!Te aceptaron!',
                    body: `${nombreEmpleador} acepto tu postulacion para "${tituloOferta}"`
                },
                data: {
                    tipo: 'postulacion_aceptada',
                    aplicacionId: context.params.aplicacionId,
                    ofertaId: despues.ofertaId || '',
                    url: '/mis-aplicaciones-trabajador.html',
                    tag: 'aceptacion-' + context.params.aplicacionId
                },
                token: fcmToken
            };

            // Enviar notificacion
            const response = await messaging.send(message);
            console.log('Notificacion aceptacion enviada:', response);

            // Guardar en coleccion de notificaciones
            await db.collection('usuarios').doc(trabajadorId)
                .collection('notificaciones').add({
                    tipo: 'postulacion_aceptada',
                    titulo: message.notification.title,
                    cuerpo: message.notification.body,
                    leida: false,
                    url: '/mis-aplicaciones-trabajador.html',
                    datos: {
                        aplicacionId: context.params.aplicacionId,
                        empleadorNombre: despues.empleadorNombre,
                        ofertaTitulo: despues.ofertaTitulo
                    },
                    fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
                });

            return response;

        } catch (error) {
            console.error('Error enviando notificacion aceptacion:', error);
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
