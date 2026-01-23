// ============================================
// ONBOARDING - MIS APLICACIONES
// Tour para panel de aplicaciones
// ============================================

/**
 * Tour guiado para mis-aplicaciones.html
 * Explica cómo gestionar aplicaciones recibidas
 */

// FIX iOS: Funciones para manejar bottom nav durante onboarding
function ocultarBottomNavAplicaciones() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.style.transform = 'translateY(100%)';
        bottomNav.style.pointerEvents = 'none';
        document.body.classList.add('onboarding-activo');
    }
}

function mostrarBottomNavAplicaciones() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.style.transform = '';
        bottomNav.style.pointerEvents = '';
        document.body.classList.remove('onboarding-activo');
    }
}

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
    // FIX iOS: Ocultar bottom nav en móvil
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        ocultarBottomNavAplicaciones();
    }

    const intro = introJs();

    // FIX iOS: Pasos compactos
    const steps = [
        {
            intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">👥</div><h2>Panel de Aplicaciones</h2><p>Gestiona las aplicaciones a tus ofertas.</p></div>'
        }
    ];

    // Solo agregar pasos si existen los elementos
    const stats = document.getElementById('stats');
    if (stats) {
        steps.push({
            element: '#stats',
            intro: '<h3>📊 Resumen</h3><p>Total de aplicaciones, pendientes y ofertas activas.</p>',
            position: 'bottom'
        });
    }

    const aplicacionesContainer = document.getElementById('aplicaciones-container');
    if (aplicacionesContainer && aplicacionesContainer.children.length > 0) {
        steps.push({
            element: '#aplicaciones-container',
            intro: '<h3>📋 Aplicantes</h3><p>Nombre, contacto y mensaje de cada aplicante. Haz clic para contactar.</p>',
            position: 'top'
        });
    }

    // Final
    steps.push({
        intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">✅</div><h2>¡Listo!</h2><p>Las aplicaciones aparecerán aquí automáticamente.</p></div>'
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
        // FIX iOS: Restaurar bottom nav
        mostrarBottomNavAplicaciones();
        if (typeof toastSuccess === 'function') {
            toastSuccess('¡Ya sabes cómo gestionar aplicaciones! 👥');
        }
    });

    intro.onexit(() => {
        localStorage.setItem('chambapp-onboarding-aplicaciones', 'true');
        // FIX iOS: Restaurar bottom nav
        mostrarBottomNavAplicaciones();
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
