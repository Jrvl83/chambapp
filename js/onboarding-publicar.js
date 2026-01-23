// ============================================
// ONBOARDING - PUBLICAR OFERTA
// Tour para el formulario de 4 pasos
// ============================================

/**
 * Tour guiado para publicar-oferta.html
 * Explica cada paso del formulario multi-paso
 */

// FIX iOS: Funciones para manejar bottom nav durante onboarding
function ocultarBottomNavPublicar() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.style.transform = 'translateY(100%)';
        bottomNav.style.pointerEvents = 'none';
        document.body.classList.add('onboarding-activo');
    }
}

function mostrarBottomNavPublicar() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.style.transform = '';
        bottomNav.style.pointerEvents = '';
        document.body.classList.remove('onboarding-activo');
    }
}

function iniciarOnboardingPublicar() {
    // Verificar si ya vio el tour
    const yaVioTour = localStorage.getItem('chambapp-onboarding-publicar');
    if (yaVioTour === 'true') {
        console.log('✓ Usuario ya vio el tour de publicar');
        return;
    }
    
    // Verificar que Intro.js esté cargado
    if (typeof introJs === 'undefined') {
        console.error('❌ Intro.js no está cargado');
        return;
    }
    
    // Esperar a que el DOM esté listo
    setTimeout(() => {
        mostrarTourPublicar();
    }, 600);
}

function mostrarTourPublicar() {
    // FIX iOS: Ocultar bottom nav en móvil
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        ocultarBottomNavPublicar();
    }

    const intro = introJs();

    // FIX iOS: Pasos más compactos para móvil
    const stepsCompletos = [
        {
            intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">📝</div><h2>Publicar Oferta</h2><p>Te guiamos en 4 pasos simples.</p></div>'
        },
        {
            element: '.progress-container',
            intro: '<h3>📊 Tu Progreso</h3><p>4 pasos para publicar tu oferta.</p>',
            position: 'bottom'
        },
        {
            element: '#titulo',
            intro: '<h3>📝 Título</h3><p>Sé específico: "Electricista para instalación" es mejor que "Necesito ayuda".</p>',
            position: 'bottom'
        },
        {
            element: '#categoria',
            intro: '<h3>🏷️ Categoría</h3><p>Selecciona la que mejor describa el trabajo.</p>',
            position: 'bottom'
        },
        {
            element: '#descripcion',
            intro: '<h3>📋 Descripción</h3><p>Incluye tareas, materiales necesarios y resultado esperado.</p>',
            position: 'top'
        },
        {
            element: '#btnNext',
            intro: '<h3>➡️ Navegación</h3><p>Avanza o retrocede entre pasos.</p>',
            position: 'top'
        },
        {
            intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">🚀</div><h2>¡Listo!</h2><p>Completa los 4 pasos y publica.</p><p style="margin-top:0.75rem;padding:0.75rem;background:#fef3c7;border-radius:8px;font-size:0.8125rem"><strong>💡 Tip:</strong> Ofertas con salario claro reciben más aplicantes.</p></div>'
        }
    ];

    // Filtrar pasos que tienen elementos que no existen
    const steps = stepsCompletos.filter(step => {
        if (!step.element) return true;
        const el = document.querySelector(step.element);
        return el && (el.offsetWidth > 0 || el.offsetHeight > 0);
    });

    intro.setOptions({
        steps: steps,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        doneLabel: 'Comenzar 📝',
        nextLabel: 'Siguiente →',
        prevLabel: '← Atrás',
        skipLabel: 'Saltar'
    });
    
    intro.oncomplete(() => {
        localStorage.setItem('chambapp-onboarding-publicar', 'true');
        // FIX iOS: Restaurar bottom nav
        mostrarBottomNavPublicar();
        if (typeof toastSuccess === 'function') {
            toastSuccess('¡Ahora completa tu primera oferta! 💼');
        }
    });

    intro.onexit(() => {
        localStorage.setItem('chambapp-onboarding-publicar', 'true');
        // FIX iOS: Restaurar bottom nav
        mostrarBottomNavPublicar();
    });

    intro.start();
}

// ============================================
// FUNCIÓN PARA REINICIAR (TESTING)
// ============================================
function reiniciarOnboardingPublicar() {
    localStorage.removeItem('chambapp-onboarding-publicar');
    location.reload();
}

// ============================================
// EXPONER FUNCIONES
// ============================================
window.iniciarOnboardingPublicar = iniciarOnboardingPublicar;
window.reiniciarOnboardingPublicar = reiniciarOnboardingPublicar;

console.log('✅ Onboarding Publicar Oferta cargado');
