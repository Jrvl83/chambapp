// ============================================
// ONBOARDING - MIS APLICACIONES
// Tour para panel de aplicaciones
// ============================================

/**
 * Tour guiado para mis-aplicaciones.html
 * Explica cómo gestionar aplicaciones recibidas
 */

function iniciarOnboardingAplicaciones() {
    // Verificar si ya vio el tour
    const yaVioTour = localStorage.getItem('chambapp-onboarding-aplicaciones');
    if (yaVioTour === 'true') {
        console.log('✓ Usuario ya vio el tour de aplicaciones');
        return;
    }
    
    // Verificar que Intro.js esté cargado
    if (typeof introJs === 'undefined') {
        console.error('❌ Intro.js no está cargado');
        return;
    }
    
    // Esperar a que el contenido cargue
    setTimeout(() => {
        mostrarTourAplicaciones();
    }, 800);
}

function mostrarTourAplicaciones() {
    const intro = introJs();
    
    const steps = [
        {
            intro: `
                <div style="text-align: center;">
                    <div style="font-size: 3.5rem; margin-bottom: 1rem;">👥</div>
                    <h2>Panel de Aplicaciones</h2>
                    <p style="margin-top: 1rem;">Aquí gestionas todas las aplicaciones a tus ofertas.</p>
                    <p style="font-size: 0.875rem; color: #94a3b8; margin-top: 1rem;">
                        Tour rápido de 20 segundos
                    </p>
                </div>
            `
        }
    ];
    
    // Solo agregar pasos si existen los elementos
    const stats = document.getElementById('stats');
    if (stats) {
        steps.push({
            element: '#stats',
            intro: `
                <h3>📊 Resumen Rápido</h3>
                <p>Ve de un vistazo:</p>
                <ul style="margin-top: 0.75rem; padding-left: 1.25rem;">
                    <li>Total de aplicaciones recibidas</li>
                    <li>Aplicaciones pendientes de revisar</li>
                    <li>Ofertas activas que tienes</li>
                </ul>
            `,
            position: 'bottom'
        });
    }
    
    const aplicacionesContainer = document.getElementById('aplicaciones-container');
    if (aplicacionesContainer && aplicacionesContainer.children.length > 0) {
        steps.push({
            element: '#aplicaciones-container',
            intro: `
                <h3>📋 Lista de Aplicantes</h3>
                <p>Para cada aplicante verás:</p>
                <ul style="margin-top: 0.75rem; padding-left: 1.25rem;">
                    <li>Nombre y datos de contacto</li>
                    <li>Mensaje de presentación</li>
                    <li>Oferta a la que aplicó</li>
                </ul>
                <p style="font-size: 0.875rem; margin-top: 0.75rem; color: #2563eb;">
                    💡 Haz clic en "Llamar" o "Email" para contactar directamente
                </p>
            `,
            position: 'top'
        });
    }
    
    // Final
    steps.push({
        intro: `
            <div style="text-align: center;">
                <div style="font-size: 3.5rem; margin-bottom: 1rem;">✅</div>
                <h2>¡Eso es todo!</h2>
                <p style="margin-top: 1rem;">Cuando recibas aplicaciones, aparecerán aquí automáticamente.</p>
                <div style="margin-top: 1.5rem; padding: 1.25rem; background: #dcfce7; border-radius: 12px; border-left: 4px solid #16a34a;">
                    <p style="font-weight: 600; color: #166534; margin: 0; font-size: 0.9375rem;">
                        📧 Recibirás notificaciones cuando alguien aplique a tus ofertas
                    </p>
                </div>
            </div>
        `
    });
    
    intro.setOptions({
        steps: steps,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        doneLabel: 'Entendido 👍',
        nextLabel: 'Siguiente →',
        prevLabel: '← Atrás',
        skipLabel: 'Saltar'
    });
    
    intro.oncomplete(() => {
        localStorage.setItem('chambapp-onboarding-aplicaciones', 'true');
        if (typeof toastSuccess === 'function') {
            toastSuccess('¡Ya sabes cómo gestionar aplicaciones! 👥');
        }
    });
    
    intro.onexit(() => {
        localStorage.setItem('chambapp-onboarding-aplicaciones', 'true');
    });
    
    intro.start();
}

// ============================================
// FUNCIÓN PARA REINICIAR (TESTING)
// ============================================
function reiniciarOnboardingAplicaciones() {
    localStorage.removeItem('chambapp-onboarding-aplicaciones');
    location.reload();
}

// ============================================
// EXPONER FUNCIONES
// ============================================
window.iniciarOnboardingAplicaciones = iniciarOnboardingAplicaciones;
window.reiniciarOnboardingAplicaciones = reiniciarOnboardingAplicaciones;

console.log('✅ Onboarding Mis Aplicaciones cargado');
