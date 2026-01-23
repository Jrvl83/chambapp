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

    intro.setOptions({
        steps: [
            {
                intro: `
                    <div style="text-align: center;">
                        <div style="font-size: 3.5rem; margin-bottom: 1rem;">📝</div>
                        <h2>Publicar tu Primera Oferta</h2>
                        <p style="margin-top: 1rem;">Te guiaremos paso a paso para crear una oferta atractiva.</p>
                        <p style="font-size: 0.875rem; color: #94a3b8; margin-top: 1rem;">
                            Solo toma 2-3 minutos
                        </p>
                    </div>
                `
            },
            {
                element: '.progress-container',
                intro: `
                    <h3>📊 Progreso del Formulario</h3>
                    <p>Este indicador te muestra en qué paso estás.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.75rem;">
                        Son solo 4 pasos simples para completar tu oferta.
                    </p>
                `,
                position: 'bottom'
            },
            {
                element: '#titulo',
                intro: `
                    <h3>📝 Título Atractivo</h3>
                    <p>Sé específico y claro. Ejemplo:</p>
                    <ul style="margin-top: 0.75rem; padding-left: 1.25rem;">
                        <li>✅ "Electricista para instalación residencial"</li>
                        <li>❌ "Necesito ayuda"</li>
                    </ul>
                    <p style="font-size: 0.875rem; margin-top: 0.75rem; color: #2563eb;">
                        💡 Títulos claros reciben 2x más aplicantes
                    </p>
                `,
                position: 'bottom'
            },
            {
                element: '#categoria',
                intro: `
                    <h3>🏷️ Categoría Correcta</h3>
                    <p>Selecciona la categoría que mejor describa el trabajo.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.75rem;">
                        Esto ayuda a que los trabajadores adecuados encuentren tu oferta.
                    </p>
                `,
                position: 'bottom'
            },
            {
                element: '#descripcion',
                intro: `
                    <h3>📋 Descripción Detallada</h3>
                    <p>Incluye:</p>
                    <ul style="margin-top: 0.75rem; padding-left: 1.25rem;">
                        <li>Qué tareas específicas debe hacer</li>
                        <li>Materiales que debe traer (si aplica)</li>
                        <li>Resultado esperado</li>
                    </ul>
                    <p style="font-size: 0.875rem; margin-top: 0.75rem; color: #2563eb;">
                        💡 Mientras más detalle, mejores candidatos
                    </p>
                `,
                position: 'top'
            },
            {
                element: '#btnNext',
                intro: `
                    <h3>➡️ Navegación</h3>
                    <p>Usa estos botones para avanzar o retroceder entre pasos.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.75rem;">
                        Puedes volver atrás en cualquier momento para editar.
                    </p>
                `,
                position: 'top'
            },
            {
                intro: `
                    <div style="text-align: center;">
                        <div style="font-size: 3.5rem; margin-bottom: 1rem;">🚀</div>
                        <h2>¡Listo para Empezar!</h2>
                        <p style="margin-top: 1rem;">Completa los 4 pasos y tu oferta estará publicada.</p>
                        <div style="margin-top: 1.5rem; padding: 1.25rem; background: #fef3c7; border-radius: 12px; border-left: 4px solid #d97706;">
                            <p style="font-weight: 600; color: #92400e; margin: 0; font-size: 0.9375rem;">
                                ⚡ Tip: Ofertas con salario claro reciben aplicaciones en menos de 24 horas
                            </p>
                        </div>
                    </div>
                `
            }
        ],
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
