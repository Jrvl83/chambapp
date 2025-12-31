// ============================================
// ONBOARDING FIRST-TIME USER - VERSIÓN MEJORADA
// ChambApp - Tour Guiado con Intro.js
// ============================================

// Agregar estilos INMEDIATAMENTE
(function agregarEstilos() {
    const style = document.createElement('style');
    style.textContent = `
        /* Intro.js - Estilos personalizados ChambApp */
        
        .introjs-tooltip {
            max-width: 450px !important;
            border-radius: 16px !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
            padding: 0 !important;
        }
        
        .introjs-tooltiptext {
            padding: 1.5rem !important;
            font-size: 1rem !important;
            line-height: 1.7 !important;
            color: #1e293b !important;
        }
        
        .introjs-tooltiptext h2 {
            margin: 0 0 1rem 0 !important;
            font-size: 1.5rem !important;
            color: #1e293b !important;
        }
        
        .introjs-tooltiptext h3 {
            margin: 0 0 0.75rem 0 !important;
            font-size: 1.125rem !important;
            color: #1e293b !important;
        }
        
        .introjs-tooltiptext p {
            margin: 0.5rem 0 !important;
            color: #64748b !important;
        }
        
        .introjs-tooltiptext ul {
            margin: 0.75rem 0 !important;
            padding-left: 1.5rem !important;
        }
        
        .introjs-tooltiptext ul li {
            margin: 0.5rem 0 !important;
            color: #475569 !important;
        }
        
        .introjs-tooltip-header {
            padding: 0 !important;
        }
        
        .introjs-tooltipbuttons {
            padding: 1rem 1.5rem !important;
            border-top: 2px solid #f1f5f9 !important;
            display: flex !important;
            gap: 0.75rem !important;
            justify-content: space-between !important;
        }
        
        .introjs-button {
            border-radius: 8px !important;
            padding: 0.75rem 1.5rem !important;
            font-weight: 600 !important;
            font-size: 1rem !important;
            text-shadow: none !important;
            border: none !important;
            cursor: pointer !important;
            transition: all 0.3s !important;
        }
        
        .introjs-nextbutton,
        .introjs-donebutton {
            background: #2563eb !important;
            color: white !important;
        }
        
        .introjs-nextbutton:hover,
        .introjs-donebutton:hover {
            background: #1d4ed8 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
        }
        
        .introjs-prevbutton {
            background: transparent !important;
            color: #64748b !important;
            border: 2px solid #e2e8f0 !important;
        }
        
        .introjs-prevbutton:hover {
            background: #f8fafc !important;
            border-color: #cbd5e1 !important;
        }
        
        .introjs-skipbutton {
            color: #64748b !important;
            background: transparent !important;
            padding: 0.75rem 1rem !important;
        }
        
        .introjs-skipbutton:hover {
            color: #475569 !important;
        }
        
        .introjs-helperLayer {
            border-radius: 12px !important;
            box-shadow: 0 0 0 5000px rgba(0, 0, 0, 0.6) !important;
            border: 3px solid #2563eb !important;
        }
        
        .introjs-helperNumberLayer {
            display: none !important;
        }
        
        .introjs-arrow {
            border: 8px solid transparent !important;
        }
        
        .introjs-arrow.top {
            border-bottom-color: white !important;
        }
        
        .introjs-arrow.bottom {
            border-top-color: white !important;
        }
        
        .introjs-arrow.left {
            border-right-color: white !important;
        }
        
        .introjs-arrow.right {
            border-left-color: white !important;
        }
        
        .introjs-progressbar {
            background: #2563eb !important;
            border-radius: 4px !important;
        }
        
        .introjs-progress {
            background: #e2e8f0 !important;
            border-radius: 4px !important;
            overflow: hidden !important;
            height: 6px !important;
        }
        
        .introjs-bullets {
            display: none !important;
        }
        
        /* Responsive */
        @media (max-width: 640px) {
            .introjs-tooltip {
                max-width: 90% !important;
            }
            
            .introjs-tooltiptext {
                padding: 1.25rem !important;
                font-size: 0.9375rem !important;
            }
            
            .introjs-tooltipbuttons {
                flex-direction: column !important;
            }
            
            .introjs-button {
                width: 100% !important;
            }
        }
    `;
    document.head.appendChild(style);
})();

/**
 * Inicia el onboarding automáticamente para usuarios nuevos
 */
function iniciarOnboarding() {
    // Verificar si es primera vez
    const yaVioTour = localStorage.getItem('chambapp-onboarding-completed');
    if (yaVioTour === 'true') {
        console.log('✓ Usuario ya vio el onboarding');
        return;
    }
    
    // Verificar que Intro.js esté cargado
    if (typeof introJs === 'undefined') {
        console.error('❌ Intro.js no está cargado');
        return;
    }
    
    // Obtener datos del usuario
    const usuarioData = localStorage.getItem('usuarioChambApp');
    if (!usuarioData) {
        console.warn('⚠️ No hay datos de usuario para onboarding');
        return;
    }
    
    const usuario = JSON.parse(usuarioData);
    console.log('🎯 Iniciando onboarding para:', usuario.tipo);
    
    // Esperar a que el DOM esté completamente cargado
    setTimeout(() => {
        if (usuario.tipo === 'trabajador') {
            tourTrabajador();
        } else if (usuario.tipo === 'empleador') {
            tourEmpleador();
        }
    }, 800);
}

// ============================================
// TOUR PARA TRABAJADORES
// ============================================
function tourTrabajador() {
    const intro = introJs();
    
    intro.setOptions({
        steps: [
            {
                intro: `
                    <div style="text-align: center;">
                        <div style="font-size: 3.5rem; margin-bottom: 1rem;">👋</div>
                        <h2>¡Bienvenido a ChambApp!</h2>
                        <p style="margin-top: 1rem;">Te mostraremos cómo funciona en 30 segundos.</p>
                        <p style="font-size: 0.875rem; color: #94a3b8; margin-top: 1rem;">
                            Puedes saltar el tour en cualquier momento
                        </p>
                    </div>
                `
            },
            {
                element: '#nav-buscar',
                intro: `
                    <h3>🔍 Busca chambas aquí</h3>
                    <p>Encuentra trabajos por categoría, ubicación y salario.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.75rem;">
                        Usa los filtros para encontrar exactamente lo que buscas.
                    </p>
                `,
                position: 'right'
            },
            {
                element: '.oferta-card',
                intro: `
                    <h3>💼 Ofertas de trabajo</h3>
                    <p>Aquí verás todas las chambas disponibles.</p>
                    <ul style="margin-top: 0.75rem;">
                        <li>Haz clic en "Ver Detalles" para más información</li>
                        <li>Presiona "Contactar" para aplicar al trabajo</li>
                    </ul>
                `,
                position: 'top'
            },
            {
                element: '#nav-trabajadores',
                intro: `
                    <h3>📋 Tus aplicaciones</h3>
                    <p>Aquí verás todas las chambas a las que has aplicado.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.75rem;">
                        Puedes revisar el estado de tus postulaciones en cualquier momento.
                    </p>
                `,
                position: 'right'
            },
            {
                intro: `
                    <div style="text-align: center;">
                        <div style="font-size: 3.5rem; margin-bottom: 1rem;">🎉</div>
                        <h2>¡Listo para empezar!</h2>
                        <p style="margin-top: 1rem;">Ahora puedes buscar tu próxima chamba.</p>
                        <div style="margin-top: 1.5rem; padding: 1.25rem; background: #eff6ff; border-radius: 12px; border-left: 4px solid #2563eb;">
                            <p style="font-weight: 600; color: #2563eb; margin: 0; font-size: 0.9375rem;">
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
        scrollToElement: true,
        scrollPadding: 50
    });
    
    intro.oncomplete(() => {
        localStorage.setItem('chambapp-onboarding-completed', 'true');
        if (typeof toastSuccess === 'function') {
            toastSuccess('¡Bienvenido a ChambApp! 🎉');
        }
    });
    
    intro.onexit(() => {
        localStorage.setItem('chambapp-onboarding-completed', 'true');
    });
    
    intro.start();
}

// ============================================
// TOUR PARA EMPLEADORES
// ============================================
function tourEmpleador() {
    const intro = introJs();
    
    intro.setOptions({
        steps: [
            {
                intro: `
                    <div style="text-align: center;">
                        <div style="font-size: 3.5rem; margin-bottom: 1rem;">👋</div>
                        <h2>¡Bienvenido a ChambApp!</h2>
                        <p style="margin-top: 1rem;">Te ayudaremos a encontrar trabajadores rápidamente.</p>
                        <p style="font-size: 0.875rem; color: #94a3b8; margin-top: 1rem;">
                            Este tour toma solo 30 segundos
                        </p>
                    </div>
                `
            },
            {
                element: '#nav-publicar',
                intro: `
                    <h3>➕ Publica ofertas aquí</h3>
                    <p>Crea ofertas de trabajo en menos de 2 minutos.</p>
                    <ul style="margin-top: 0.75rem;">
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
                    <h3>📊 Tus estadísticas</h3>
                    <p>Ve cuántos trabajadores han aplicado a tus ofertas.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.75rem;">
                        Información actualizada en tiempo real.
                    </p>
                `,
                position: 'bottom'
            },
            {
                element: '#nav-trabajadores',
                intro: `
                    <h3>👥 Tus aplicantes</h3>
                    <p>Revisa quién ha aplicado a tus ofertas de trabajo.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.75rem;">
                        Podrás ver perfiles, experiencia y calificaciones.
                    </p>
                `,
                position: 'right'
            },
            {
                intro: `
                    <div style="text-align: center;">
                        <div style="font-size: 3.5rem; margin-bottom: 1rem;">🚀</div>
                        <h2>¡Todo listo!</h2>
                        <p style="margin-top: 1rem;">Empieza publicando tu primera oferta de trabajo.</p>
                        <div style="margin-top: 1.5rem; padding: 1.25rem; background: #eff6ff; border-radius: 12px; border-left: 4px solid #2563eb;">
                            <p style="font-weight: 600; color: #2563eb; margin: 0; font-size: 0.9375rem;">
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
        scrollToElement: true,
        scrollPadding: 50
    });
    
    intro.oncomplete(() => {
        localStorage.setItem('chambapp-onboarding-completed', 'true');
        if (typeof toastSuccess === 'function') {
            toastSuccess('¡Bienvenido a ChambApp! 🎉');
        }
    });
    
    intro.onexit(() => {
        localStorage.setItem('chambapp-onboarding-completed', 'true');
    });
    
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
// EXPONER FUNCIONES GLOBALMENTE
// ============================================
window.iniciarOnboarding = iniciarOnboarding;
window.tourTrabajador = tourTrabajador;
window.tourEmpleador = tourEmpleador;
window.reiniciarOnboarding = reiniciarOnboarding;

console.log('✅ Onboarding ChambApp cargado correctamente');
