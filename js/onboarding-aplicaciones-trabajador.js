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

    const steps = [
        {
            intro: `
                <div style="text-align: center;">
                    <div style="font-size: 3.5rem; margin-bottom: 1rem;">📋</div>
                    <h2>Tus Aplicaciones</h2>
                    <p style="margin-top: 1rem;">Aquí sigues el estado de todas tus postulaciones.</p>
                    <p style="font-size: 0.875rem; color: #94a3b8; margin-top: 1rem;">
                        Tour rápido de 30 segundos
                    </p>
                </div>
            `
        }
    ];
    
    // Stats (si existen)
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
        steps.push({
            element: '.stats-grid',
            intro: `
                <h3>📊 Tu Rendimiento</h3>
                <p>Ve de un vistazo:</p>
                <ul style="margin-top: 0.75rem; padding-left: 1.25rem;">
                    <li><strong>Total:</strong> Cuántas chambas aplicaste</li>
                    <li><strong>Pendientes:</strong> Esperando respuesta</li>
                    <li><strong>Contactados:</strong> Empleadores que te llamaron</li>
                    <li><strong>Tasa:</strong> % de respuestas que recibes</li>
                </ul>
            `,
            position: 'bottom'
        });
    }
    
    // Filtros
    const filtrosContainer = document.querySelector('.filters-container');
    if (filtrosContainer) {
        steps.push({
            element: '.filters-container',
            intro: `
                <h3>🔍 Filtrar Aplicaciones</h3>
                <p>Organiza tus postulaciones por:</p>
                <ul style="margin-top: 0.75rem; padding-left: 1.25rem;">
                    <li>Estado (pendiente, contactado, cancelada)</li>
                    <li>Categoría del trabajo</li>
                </ul>
                <p style="font-size: 0.875rem; margin-top: 0.75rem; color: #64748b;">
                    Útil cuando tienes muchas aplicaciones activas
                </p>
            `,
            position: 'bottom'
        });
    }
    
    // Lista de aplicaciones (si hay)
    const aplicacionesContainer = document.getElementById('aplicaciones-container');
    const hayAplicaciones = aplicacionesContainer && aplicacionesContainer.children.length > 0;
    
    if (hayAplicaciones) {
        steps.push({
            element: '#aplicaciones-container',
            intro: `
                <h3>📝 Tus Postulaciones</h3>
                <p>Para cada aplicación verás:</p>
                <ul style="margin-top: 0.75rem; padding-left: 1.25rem;">
                    <li>Título y categoría de la chamba</li>
                    <li>Cuándo aplicaste</li>
                    <li>Estado actual (pendiente/contactado)</li>
                    <li>Datos del empleador</li>
                </ul>
            `,
            position: 'top'
        });
    }
    
    // Tips finales
    steps.push({
        intro: `
            <div style="text-align: center;">
                <div style="font-size: 3.5rem; margin-bottom: 1rem;">💡</div>
                <h2>Tips para Más Respuestas</h2>
                <div style="text-align: left; margin-top: 1.5rem;">
                    <div style="padding: 1rem; background: #eff6ff; border-radius: 8px; margin-bottom: 1rem;">
                        <strong style="color: #2563eb;">1. Responde rápido</strong>
                        <p style="margin: 0.5rem 0 0 0; font-size: 0.9375rem;">
                            Los primeros 3 aplicantes tienen 80% más chances
                        </p>
                    </div>
                    <div style="padding: 1rem; background: #dcfce7; border-radius: 8px; margin-bottom: 1rem;">
                        <strong style="color: #16a34a;">2. Mensaje personalizado</strong>
                        <p style="margin: 0.5rem 0 0 0; font-size: 0.9375rem;">
                            Menciona por qué eres ideal para ESE trabajo específico
                        </p>
                    </div>
                    <div style="padding: 1rem; background: #fef3c7; border-radius: 8px;">
                        <strong style="color: #d97706;">3. Sigue aplicando</strong>
                        <p style="margin: 0.5rem 0 0 0; font-size: 0.9375rem;">
                            Aplica a 5-10 ofertas para aumentar tus chances
                        </p>
                    </div>
                </div>
            </div>
        `
    });
    
    // Final
    steps.push({
        intro: `
            <div style="text-align: center;">
                <div style="font-size: 3.5rem; margin-bottom: 1rem;">🎯</div>
                <h2>¡Todo Claro!</h2>
                <p style="margin-top: 1rem;">Ahora sabes cómo seguir tus aplicaciones.</p>
                <div style="margin-top: 1.5rem; padding: 1.25rem; background: #eff6ff; border-radius: 12px; border-left: 4px solid #2563eb;">
                    <p style="font-weight: 600; color: #2563eb; margin: 0; font-size: 0.9375rem;">
                        📲 Revisa esta página regularmente para ver si te contactaron
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
