// ============================================
// ONBOARDING - MIS APLICACIONES (TRABAJADOR)
// Tour para panel de aplicaciones del trabajador
// ============================================

/**
 * Tour guiado para mis-aplicaciones-trabajador.html
 * Explica cómo revisar el estado de sus postulaciones
 */

// FIX iOS: Funciones para manejar bottom nav durante onboarding
function ocultarBottomNavAplicacionesTrabajador() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.style.transform = 'translateY(100%)';
        bottomNav.style.pointerEvents = 'none';
        document.body.classList.add('onboarding-activo');
    }
}

function mostrarBottomNavAplicacionesTrabajador() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.style.transform = '';
        bottomNav.style.pointerEvents = '';
        document.body.classList.remove('onboarding-activo');
    }
}

function iniciarOnboardingAplicacionesTrabajador() {
    // Verificar si ya vio el tour
    const yaVioTour = localStorage.getItem('chambapp-onboarding-aplicaciones-trabajador');
    if (yaVioTour === 'true') {
        console.log('✓ Usuario ya vio el tour de aplicaciones (trabajador)');
        return;
    }
    
    // Verificar que Intro.js esté cargado
    if (typeof introJs === 'undefined') {
        console.error('❌ Intro.js no está cargado');
        return;
    }
    
    // Esperar a que el contenido cargue
    setTimeout(() => {
        mostrarTourAplicacionesTrabajador();
    }, 800);
}

function mostrarTourAplicacionesTrabajador() {
    // FIX iOS: Ocultar bottom nav en móvil
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        ocultarBottomNavAplicacionesTrabajador();
    }

    const intro = introJs();

    // FIX iOS: Pasos compactos
    const steps = [
        {
            intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">📋</div><h2>Tus Aplicaciones</h2><p>Sigue el estado de tus postulaciones.</p></div>'
        }
    ];

    // Stats (si existen)
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
        steps.push({
            element: '.stats-grid',
            intro: '<h3>📊 Tu Rendimiento</h3><p>Total aplicadas, pendientes, contactados y tasa de respuesta.</p>',
            position: 'bottom'
        });
    }

    // Filtros
    const filtrosContainer = document.querySelector('.filters-container');
    if (filtrosContainer) {
        steps.push({
            element: '.filters-container',
            intro: '<h3>🔍 Filtros</h3><p>Organiza por estado o categoría.</p>',
            position: 'bottom'
        });
    }

    // Lista de aplicaciones (si hay)
    const aplicacionesContainer = document.getElementById('aplicaciones-container');
    const hayAplicaciones = aplicacionesContainer && aplicacionesContainer.children.length > 0;

    if (hayAplicaciones) {
        steps.push({
            element: '#aplicaciones-container',
            intro: '<h3>📝 Postulaciones</h3><p>Título, fecha, estado y datos del empleador.</p>',
            position: 'top'
        });
    }

    // Final con tips compactos
    steps.push({
        intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">🎯</div><h2>¡Listo!</h2><p style="margin:0.5rem 0;font-size:0.8125rem"><strong>Tips:</strong> Responde rápido, personaliza tu mensaje, aplica a varias ofertas.</p></div>'
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
        localStorage.setItem('chambapp-onboarding-aplicaciones-trabajador', 'true');
        // FIX iOS: Restaurar bottom nav
        mostrarBottomNavAplicacionesTrabajador();
        if (typeof toastSuccess === 'function') {
            toastSuccess('¡Ya sabes cómo seguir tus aplicaciones! 📋');
        }
    });

    intro.onexit(() => {
        localStorage.setItem('chambapp-onboarding-aplicaciones-trabajador', 'true');
        // FIX iOS: Restaurar bottom nav
        mostrarBottomNavAplicacionesTrabajador();
    });

    intro.start();
}

// ============================================
// FUNCIÓN PARA REINICIAR (TESTING)
// ============================================
function reiniciarOnboardingAplicacionesTrabajador() {
    localStorage.removeItem('chambapp-onboarding-aplicaciones-trabajador');
    location.reload();
}

// ============================================
// EXPONER FUNCIONES
// ============================================
window.iniciarOnboardingAplicacionesTrabajador = iniciarOnboardingAplicacionesTrabajador;
window.reiniciarOnboardingAplicacionesTrabajador = reiniciarOnboardingAplicacionesTrabajador;

console.log('✅ Onboarding Mis Aplicaciones (Trabajador) cargado');
