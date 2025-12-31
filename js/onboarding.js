// ============================================
// ONBOARDING FIRST-TIME USER
// ChambApp - Tour Guiado con Intro.js
// ============================================

/**
 * Inicia el onboarding automáticamente para usuarios nuevos
 */
function iniciarOnboarding() {
    // Verificar si es primera vez
    const yaVioTour = localStorage.getItem('chambapp-onboarding-completed');
    if (yaVioTour === 'true') {
        return; // Ya vio el tour
    }
    
    // Obtener datos del usuario
    const usuarioData = localStorage.getItem('usuarioChambApp');
    if (!usuarioData) {
        console.warn('No hay datos de usuario para onboarding');
        return;
    }
    
    const usuario = JSON.parse(usuarioData);
    
    // Esperar a que el DOM esté completamente cargado
    setTimeout(() => {
        if (usuario.tipo === 'trabajador') {
            tourTrabajador();
        } else if (usuario.tipo === 'empleador') {
            tourEmpleador();
        }
    }, 1000); // Esperar 1 segundo después de cargar el dashboard
}

// ============================================
// TOUR PARA TRABAJADORES
// ============================================
function tourTrabajador() {
    // Verificar que Intro.js esté cargado
    if (typeof introJs === 'undefined') {
        console.error('Intro.js no está cargado. Incluye la librería desde CDN.');
        return;
    }
    
    const intro = introJs();
    
    intro.setOptions({
        steps: [
            {
                intro: `
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">👋</div>
                        <h2 style="margin-bottom: 1rem;">¡Bienvenido a ChambApp!</h2>
                        <p>Te mostraremos cómo funciona en 30 segundos.</p>
                        <p style="font-size: 0.875rem; color: #64748b; margin-top: 1rem;">
                            Puedes saltar el tour en cualquier momento
                        </p>
                    </div>
                `
            },
            {
                element: '#nav-buscar',
                intro: `
                    <h3 style="margin-bottom: 0.75rem;">🔍 Busca chambas aquí</h3>
                    <p>Encuentra trabajos por categoría, ubicación y salario.</p>
                    <p style="font-size: 0.875rem; color: #64748b; margin-top: 0.5rem;">
                        Usa los filtros para encontrar exactamente lo que buscas.
                    </p>
                `,
                position: 'right'
            },
            {
                element: '.oferta-card',
                intro: `
                    <h3 style="margin-bottom: 0.75rem;">💼 Ofertas de trabajo</h3>
                    <p>Aquí verás todas las chambas disponibles.</p>
                    <ul style="text-align: left; margin-top: 0.75rem; padding-left: 1.25rem;">
                        <li>Haz clic en "Ver Detalles" para más información</li>
                        <li>Presiona "Contactar" para aplicar al trabajo</li>
                    </ul>
                `,
                position: 'top'
            },
            {
                element: '#nav-trabajadores',
                intro: `
                    <h3 style="margin-bottom: 0.75rem;">📋 Tus aplicaciones</h3>
                    <p>Aquí verás todas las chambas a las que has aplicado.</p>
                    <p style="font-size: 0.875rem; color: #64748b; margin-top: 0.5rem;">
                        Puedes revisar el estado de tus postulaciones en cualquier momento.
                    </p>
                `,
                position: 'right'
            },
            {
                intro: `
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                        <h2 style="margin-bottom: 1rem;">¡Listo para empezar!</h2>
                        <p>Ahora puedes buscar tu próxima chamba.</p>
                        <div style="margin-top: 1.5rem; padding: 1rem; background: #eff6ff; border-radius: 8px;">
                            <p style="font-weight: 600; color: #2563eb; margin: 0;">
                                💡 Tip: Como usuario gratis puedes completar hasta 5 chambas
                            </p>
                        </div>
                    </div>
                `
            }
        ],
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        doneLabel: 'Empezar 🚀',
        nextLabel: 'Siguiente →',
        prevLabel: '← Atrás',
        skipLabel: 'Saltar',
        hidePrev: false,
        hideNext: false,
        scrollToElement: true,
        scrollTo: 'tooltip',
        tooltipClass: 'customTooltip',
        highlightClass: 'customHighlight'
    });
    
    // Callback al completar o salir
    intro.oncomplete(() => {
        localStorage.setItem('chambapp-onboarding-completed', 'true');
        toastSuccess('¡Bienvenido a ChambApp! 🎉');
    });
    
    intro.onexit(() => {
        localStorage.setItem('chambapp-onboarding-completed', 'true');
    });
    
    // Iniciar el tour
    intro.start();
}

// ============================================
// TOUR PARA EMPLEADORES
// ============================================
function tourEmpleador() {
    // Verificar que Intro.js esté cargado
    if (typeof introJs === 'undefined') {
        console.error('Intro.js no está cargado. Incluye la librería desde CDN.');
        return;
    }
    
    const intro = introJs();
    
    intro.setOptions({
        steps: [
            {
                intro: `
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">👋</div>
                        <h2 style="margin-bottom: 1rem;">¡Bienvenido a ChambApp!</h2>
                        <p>Te ayudaremos a encontrar trabajadores rápidamente.</p>
                        <p style="font-size: 0.875rem; color: #64748b; margin-top: 1rem;">
                            Este tour toma solo 30 segundos
                        </p>
                    </div>
                `
            },
            {
                element: '#nav-publicar',
                intro: `
                    <h3 style="margin-bottom: 0.75rem;">➕ Publica ofertas aquí</h3>
                    <p>Crea ofertas de trabajo en menos de 2 minutos.</p>
                    <ul style="text-align: left; margin-top: 0.75rem; padding-left: 1.25rem;">
                        <li>Describe el trabajo que necesitas</li>
                        <li>Especifica ubicación y salario</li>
                        <li>Publica y recibe aplicaciones</li>
                    </ul>
                `,
                position: 'right'
            },
            {
                element: '.stats-grid',
                intro: `
                    <h3 style="margin-bottom: 0.75rem;">📊 Tus estadísticas</h3>
                    <p>Ve cuántos trabajadores han aplicado a tus ofertas.</p>
                    <p style="font-size: 0.875rem; color: #64748b; margin-top: 0.5rem;">
                        Información actualizada en tiempo real.
                    </p>
                `,
                position: 'bottom'
            },
            {
                element: '#nav-trabajadores',
                intro: `
                    <h3 style="margin-bottom: 0.75rem;">👥 Tus aplicantes</h3>
                    <p>Revisa quién ha aplicado a tus ofertas de trabajo.</p>
                    <p style="font-size: 0.875rem; color: #64748b; margin-top: 0.5rem;">
                        Podrás ver perfiles, experiencia y calificaciones.
                    </p>
                `,
                position: 'right'
            },
            {
                intro: `
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🚀</div>
                        <h2 style="margin-bottom: 1rem;">¡Todo listo!</h2>
                        <p>Empieza publicando tu primera oferta de trabajo.</p>
                        <div style="margin-top: 1.5rem; padding: 1rem; background: #eff6ff; border-radius: 8px;">
                            <p style="font-weight: 600; color: #2563eb; margin: 0;">
                                💡 Tip: Sé específico en la descripción para atraer mejores candidatos
                            </p>
                        </div>
                    </div>
                `
            }
        ],
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        doneLabel: 'Comenzar 🚀',
        nextLabel: 'Siguiente →',
        prevLabel: '← Atrás',
        skipLabel: 'Saltar',
        hidePrev: false,
        hideNext: false,
        scrollToElement: true,
        scrollTo: 'tooltip',
        tooltipClass: 'customTooltip',
        highlightClass: 'customHighlight'
    });
    
    // Callback al completar o salir
    intro.oncomplete(() => {
        localStorage.setItem('chambapp-onboarding-completed', 'true');
        toastSuccess('¡Bienvenido a ChambApp! 🎉');
    });
    
    intro.onexit(() => {
        localStorage.setItem('chambapp-onboarding-completed', 'true');
    });
    
    // Iniciar el tour
    intro.start();
}

// ============================================
// FUNCIÓN PARA REINICIAR ONBOARDING (TESTING)
// ============================================
function reiniciarOnboarding() {
    localStorage.removeItem('chambapp-onboarding-completed');
    location.reload();
}

// ============================================
// ESTILOS PERSONALIZADOS PARA INTRO.JS
// ============================================
function agregarEstilosOnboarding() {
    const styles = `
        <style>
            /* Tooltip personalizado */
            .customTooltip.introjs-tooltip {
                max-width: 400px;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }
            
            .customTooltip .introjs-tooltiptext {
                padding: 1.25rem;
                font-size: 0.9375rem;
                line-height: 1.6;
            }
            
            .customTooltip .introjs-tooltip-header {
                padding: 1rem 1.25rem 0;
            }
            
            .customTooltip .introjs-tooltipbuttons {
                padding: 1rem 1.25rem;
                border-top: 1px solid #e2e8f0;
            }
            
            /* Botones */
            .customTooltip .introjs-button {
                border-radius: 8px;
                padding: 0.625rem 1.25rem;
                font-weight: 600;
                font-size: 0.9375rem;
                text-shadow: none;
            }
            
            .customTooltip .introjs-nextbutton {
                background: #2563eb;
                border: none;
            }
            
            .customTooltip .introjs-nextbutton:hover {
                background: #1d4ed8;
            }
            
            .customTooltip .introjs-prevbutton {
                background: transparent;
                color: #64748b;
                border: 1px solid #e2e8f0;
            }
            
            .customTooltip .introjs-skipbutton {
                color: #64748b;
            }
            
            /* Highlight */
            .customHighlight.introjs-helperLayer {
                border-radius: 8px;
                box-shadow: 0 0 0 5000px rgba(0, 0, 0, 0.5);
            }
            
            /* Progress bar */
            .introjs-progress {
                background: #e2e8f0;
            }
            
            .introjs-progressbar {
                background: #2563eb;
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Agregar estilos personalizados
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', agregarEstilosOnboarding);
} else {
    agregarEstilosOnboarding();
}

// Exponer funciones globalmente
window.iniciarOnboarding = iniciarOnboarding;
window.tourTrabajador = tourTrabajador;
window.tourEmpleador = tourEmpleador;
window.reiniciarOnboarding = reiniciarOnboarding;

// ============================================
// NOTAS DE USO
// ============================================

/*
INTEGRACIÓN EN dashboard.html:

1. Agregar Intro.js desde CDN en <head>:
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/intro.js@7/minified/introjs.min.css">
   <script src="https://cdn.jsdelivr.net/npm/intro.js@7/intro.min.js"></script>

2. Agregar este archivo:
   <script src="js/onboarding.js"></script>

3. Al final del dashboard.js, llamar:
   window.addEventListener('load', () => {
       setTimeout(() => {
           iniciarOnboarding();
       }, 1500);
   });

TESTING:
// En consola del navegador:
reiniciarOnboarding(); // Borra localStorage y recarga

PERSONALIZACIÓN:
- Editar los steps[] para cambiar contenido
- Cambiar posiciones: 'top', 'right', 'bottom', 'left'
- Ajustar duraciones y efectos en setOptions()

ACCESIBILIDAD:
- Tour navegable con teclado (Enter, Esc, flechas)
- Screen reader compatible
- Puede saltarse en cualquier momento
*/
