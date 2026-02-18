// ============================================
// TOURS CONFIG - CHAMBAPP
// Definiciones de guided tours por pagina
// Requiere: js/components/guided-tour.js
// ============================================

(function() {
    'use strict';

    if (typeof GuidedTour === 'undefined') return;

    // ============================================
    // TOUR: DASHBOARD
    // Multi-secuencia: bienvenida -> nav/menu -> dashboard content
    // ============================================

    GuidedTour.registerTour('dashboard', {
        onComplete: '\u00a1Bienvenido a ChambaYa! \ud83c\udf89',
        sequences: function(role, mobile) {
            var isEmpleador = role === 'empleador';

            // Secuencia 1: Bienvenida
            var bienvenida = {
                doneLabel: 'Comenzar \ud83d\ude80',
                steps: [{
                    intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">\ud83d\udc4b</div><h2>\u00a1Bienvenido!</h2><p>' +
                        (isEmpleador
                            ? 'Te ayudamos a encontrar trabajadores.'
                            : 'Te mostramos c\u00f3mo encontrar tu pr\u00f3xima chamba.') +
                        '</p></div>'
                }]
            };

            // Secuencia 2: Navegacion (mobile con bottom-nav va directo al dashboard)
            var navSteps = [];

            if (mobile) {
                // Con bottom-nav, no hay sidebar. Saltar nav.
                // Si existiera sidebar sin bottom-nav:
                var tieneBottomNav = document.body.classList.contains('has-bottom-nav') ||
                    document.querySelector('.bottom-nav') !== null;

                if (!tieneBottomNav) {
                    navSteps.push({
                        element: '#menu-toggle',
                        intro: '<h3>\u2630 Men\u00fa</h3><p>Accede a todas las funciones.</p>',
                        position: 'bottom'
                    });
                }
            }

            if (isEmpleador) {
                navSteps.push({
                    element: '#nav-publicar',
                    intro: '<h3>\u2795 Publicar</h3><p>Crea ofertas de trabajo en minutos.</p>',
                    position: 'right'
                });
                navSteps.push({
                    element: '#nav-trabajadores',
                    intro: '<h3>\ud83d\udc65 Aplicantes</h3><p>Revisa qui\u00e9n aplic\u00f3 a tus ofertas.</p>',
                    position: 'right'
                });
            } else {
                navSteps.push({
                    element: '#nav-buscar',
                    intro: '<h3>\ud83d\udd0d Buscar</h3><p>Encuentra trabajos por categor\u00eda y ubicaci\u00f3n.</p>',
                    position: 'right'
                });
                navSteps.push({
                    element: '#nav-trabajadores',
                    intro: '<h3>\ud83d\udccb Aplicaciones</h3><p>Estado de tus postulaciones.</p>',
                    position: 'right'
                });
            }

            // Solo agregar stats en desktop (siempre visible)
            if (!mobile) {
                navSteps.push({
                    element: '.stats-grid',
                    intro: '<h3>\ud83d\udcca Estad\u00edsticas</h3><p>' +
                        (isEmpleador
                            ? 'Aplicantes a tus ofertas en tiempo real.'
                            : 'Chambas aplicadas y aceptadas.') +
                        '</p>',
                    position: 'bottom'
                });
            }

            var navegacion = {
                doneLabel: 'Siguiente \u2192',
                steps: navSteps
            };

            // Secuencia 3: Contenido del dashboard
            var dashSteps = [];

            // Stats en mobile (si no se mostro en nav)
            if (mobile) {
                dashSteps.push({
                    element: '.stats-grid',
                    intro: '<h3>\ud83d\udcca Estad\u00edsticas</h3><p>' +
                        (isEmpleador
                            ? 'Aplicantes a tus ofertas en tiempo real.'
                            : 'Chambas aplicadas y aceptadas.') +
                        '</p>',
                    position: 'bottom'
                });
            }

            // Oferta card (dinamica, puede no existir)
            dashSteps.push({
                element: '.oferta-card',
                intro: '<h3>\ud83d\udcc4 Ofertas</h3><p>' +
                    (isEmpleador
                        ? 'Clic en "Ver Candidatos" para revisar.'
                        : 'Haz clic en "Ver Detalles" o "Contactar" para aplicar.') +
                    '</p>',
                position: 'top'
            });

            // Filtros (selector corregido)
            dashSteps.push({
                element: '#filtros-avanzados-container',
                intro: '<h3>\ud83d\udd0e Filtros</h3><p>Filtra por categor\u00eda, ubicaci\u00f3n y m\u00e1s.</p>',
                position: 'bottom',
                showForRole: 'trabajador'
            });

            // Pantalla final
            dashSteps.push({
                intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">' +
                    (isEmpleador ? '\ud83d\ude80' : '\ud83c\udf89') +
                    '</div><h2>\u00a1Listo!</h2><p>' +
                    (isEmpleador
                        ? 'Publica tu primera oferta.'
                        : 'Busca tu pr\u00f3xima chamba.') +
                    '</p></div>'
            });

            var dashboard = {
                doneLabel: isEmpleador ? 'Comenzar \ud83d\ude80' : 'Empezar \ud83d\ude80',
                steps: dashSteps
            };

            // Si no hay pasos de nav validos, omitir esa secuencia
            var seqs = [bienvenida];
            if (navSteps.length > 0) seqs.push(navegacion);
            seqs.push(dashboard);

            return seqs;
        }
    });

    // ============================================
    // TOUR: PUBLICAR OFERTA
    // Tour simple de 7 pasos
    // ============================================

    GuidedTour.registerTour('publicar', {
        doneLabel: 'Comenzar \ud83d\udcdd',
        onComplete: '\u00a1Ahora completa tu primera oferta! \ud83d\udcbc',
        steps: [
            {
                intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">\ud83d\udcdd</div><h2>Publicar Oferta</h2><p>Te guiamos en 4 pasos simples.</p></div>'
            },
            {
                element: '.progress-container',
                intro: '<h3>\ud83d\udcca Tu Progreso</h3><p>4 pasos para publicar tu oferta.</p>',
                position: 'bottom'
            },
            {
                element: '#titulo',
                intro: '<h3>\ud83d\udcdd T\u00edtulo</h3><p>S\u00e9 espec\u00edfico: "Electricista para instalaci\u00f3n" es mejor que "Necesito ayuda".</p>',
                position: 'bottom'
            },
            {
                element: '#categoria',
                intro: '<h3>\ud83c\udff7\ufe0f Categor\u00eda</h3><p>Selecciona la que mejor describa el trabajo.</p>',
                position: 'bottom'
            },
            {
                element: '#descripcion',
                intro: '<h3>\ud83d\udccb Descripci\u00f3n</h3><p>Incluye tareas, materiales necesarios y resultado esperado.</p>',
                position: 'top'
            },
            {
                element: '#btnNext',
                intro: '<h3>\u27a1\ufe0f Navegaci\u00f3n</h3><p>Avanza o retrocede entre pasos.</p>',
                position: 'top'
            },
            {
                intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">\ud83d\ude80</div><h2>\u00a1Listo!</h2><p>Completa los 4 pasos y publica.</p><p style="margin-top:0.75rem;padding:0.75rem;background:#fef3c7;border-radius:8px;font-size:0.8125rem"><strong>\ud83d\udca1 Tip:</strong> Ofertas con salario claro reciben m\u00e1s aplicantes.</p></div>'
            }
        ]
    });

    // ============================================
    // TOUR: APLICACIONES EMPLEADOR
    // Tour simple
    // ============================================

    GuidedTour.registerTour('aplicaciones-empleador', {
        doneLabel: 'Entendido \ud83d\udc4d',
        onComplete: '\u00a1Ya sabes c\u00f3mo gestionar aplicaciones! \ud83d\udc65',
        steps: [
            {
                intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">\ud83d\udc65</div><h2>Panel de Aplicaciones</h2><p>Gestiona las aplicaciones a tus ofertas.</p></div>'
            },
            {
                element: '#stats',
                intro: '<h3>\ud83d\udcca Resumen</h3><p>Total de aplicaciones, pendientes y ofertas activas.</p>',
                position: 'bottom'
            },
            {
                element: '#aplicaciones-container',
                intro: '<h3>\ud83d\udccb Aplicantes</h3><p>Nombre, contacto y mensaje de cada aplicante. Haz clic para contactar.</p>',
                position: 'top'
            },
            {
                intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">\u2705</div><h2>\u00a1Listo!</h2><p>Las aplicaciones aparecer\u00e1n aqu\u00ed autom\u00e1ticamente.</p></div>'
            }
        ]
    });

    // ============================================
    // TOUR: APLICACIONES TRABAJADOR
    // Tour simple
    // ============================================

    GuidedTour.registerTour('aplicaciones-trabajador', {
        doneLabel: 'Entendido \ud83d\udc4d',
        onComplete: '\u00a1Ya sabes c\u00f3mo seguir tus aplicaciones! \ud83d\udccb',
        steps: [
            {
                intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">\ud83d\udccb</div><h2>Tus Aplicaciones</h2><p>Sigue el estado de tus postulaciones.</p></div>'
            },
            {
                element: '.stats-grid',
                intro: '<h3>\ud83d\udcca Tu Rendimiento</h3><p>Total aplicadas, pendientes, contactados y tasa de respuesta.</p>',
                position: 'bottom'
            },
            {
                element: '.filters-container',
                intro: '<h3>\ud83d\udd0d Filtros</h3><p>Organiza por estado o categor\u00eda.</p>',
                position: 'bottom'
            },
            {
                element: '#aplicaciones-container',
                intro: '<h3>\ud83d\udcdd Postulaciones</h3><p>T\u00edtulo, fecha, estado y datos del empleador.</p>',
                position: 'top'
            },
            {
                intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">\ud83c\udfaf</div><h2>\u00a1Listo!</h2><p style="margin:0.5rem 0;font-size:0.8125rem"><strong>Tips:</strong> Responde r\u00e1pido, personaliza tu mensaje, aplica a varias ofertas.</p></div>'
            }
        ]
    });

})();
