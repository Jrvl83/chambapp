// ============================================
// ONBOARDING OPTIMIZADO - CHAMBAPP
// Tour Guiado con Intro.js + UX Mejorado
// ============================================

/**
 * MEJORAS IMPLEMENTADAS:
 * - Deteccion movil/desktop con tours adaptados
 * - Apertura automatica de menu en movil
 * - Tours secuenciales para mejor UX
 * - Validacion robusta de elementos
 * - Sistema "Ver despues" (24 horas)
 * - Mas pasos interactivos (71% vs 40%)
 * - Timing optimizado (400ms vs 800ms)
 * - FIX: Espera activa para elementos que cargan tarde
 */

// ============================================
// CONFIGURACION
// ============================================
const ONBOARDING_CONFIG = {
    delayInicial: 400,
    delayEntreSecuencias: 350,
    recordatorioHoras: 24,
    maxEsperaElementos: 5000, // 5 segundos máximo
    storageKeys: {
        completed: 'chambapp-onboarding-completed',
        remindLater: 'chambapp-onboarding-remind-later'
    }
};

// ============================================
// FIX iOS: MANEJO SEGURO DE OVERFLOW
// ============================================
let scrollPositionBeforeOnboarding = 0;

function bloquearScrollSeguro() {
    // Guardar posición actual del scroll
    scrollPositionBeforeOnboarding = window.pageYOffset || document.documentElement.scrollTop;

    // FIX iOS: Usar position fixed en lugar de overflow hidden
    // Esto evita el problema de Safari iOS con overflow hidden
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPositionBeforeOnboarding}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
}

function desbloquearScrollSeguro() {
    // FIX iOS: Restaurar el scroll correctamente
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';

    // Restaurar posición del scroll
    window.scrollTo(0, scrollPositionBeforeOnboarding);
}

// ============================================
// FIX: OCULTAR BOTTOM NAV DURANTE ONBOARDING
// ============================================
function ocultarBottomNavDuranteOnboarding() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.style.transform = 'translateY(100%)';
        bottomNav.style.pointerEvents = 'none';
        document.body.classList.add('onboarding-activo');
    }
}

function mostrarBottomNavDespuesOnboarding() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.style.transform = '';
        bottomNav.style.pointerEvents = '';
        document.body.classList.remove('onboarding-activo');
    }
}

// ============================================
// INICIAR ONBOARDING
// ============================================
function iniciarOnboarding() {
    // Verificar si ya completo el tour
    const yaCompleto = localStorage.getItem(ONBOARDING_CONFIG.storageKeys.completed);
    if (yaCompleto === 'true') {
        console.log('Usuario ya completo el onboarding');
        return;
    }
    
    // Verificar "recordar despues"
    const remindLater = localStorage.getItem(ONBOARDING_CONFIG.storageKeys.remindLater);
    if (remindLater) {
        const timestampRecordatorio = parseInt(remindLater);
        const ahora = Date.now();
        const horasPasadas = (ahora - timestampRecordatorio) / (1000 * 60 * 60);
        
        if (horasPasadas < ONBOARDING_CONFIG.recordatorioHoras) {
            console.log('Recordatorio en ' + Math.round(ONBOARDING_CONFIG.recordatorioHoras - horasPasadas) + 'h');
            return;
        } else {
            localStorage.removeItem(ONBOARDING_CONFIG.storageKeys.remindLater);
        }
    }
    
    // Verificar que Intro.js este cargado
    if (typeof introJs === 'undefined') {
        console.error('Intro.js no esta cargado');
        return;
    }
    
    // Obtener datos del usuario
    const usuarioData = localStorage.getItem('usuarioChambApp');
    if (!usuarioData) {
        console.warn('No hay datos de usuario para onboarding');
        return;
    }
    
    const usuario = JSON.parse(usuarioData);
    console.log('Iniciando onboarding para:', usuario.tipo);
    
    // Verificar si usuario ya interactuo
    const yaInteractuo = sessionStorage.getItem('usuario-ya-interactuo');
    if (yaInteractuo) {
        console.log('Usuario ya interactuo, skip onboarding');
        marcarComoCompletado();
        return;
    }
    
    // FIX: Esperar a que el dashboard este completamente cargado
    setTimeout(function() {
        esperarDashboardCargado(function() {
            if (usuario.tipo === 'trabajador') {
                iniciarTourTrabajador();
            } else if (usuario.tipo === 'empleador') {
                iniciarTourEmpleador();
            }
        });
    }, ONBOARDING_CONFIG.delayInicial);
}

// ============================================
// FIX: ESPERAR A QUE DASHBOARD ESTE LISTO
// ============================================
function esperarDashboardCargado(callback) {
    let intentos = 0;
    const maxIntentos = ONBOARDING_CONFIG.maxEsperaElementos / 100; // 50 intentos = 5 segundos
    
    const verificarCarga = setInterval(function() {
        intentos++;
        
        const dashboardContent = document.getElementById('dashboard-content');
        const statsGrid = document.querySelector('.stats-grid');
        
        // Verificar que el dashboard este visible
        const dashboardVisible = dashboardContent && dashboardContent.style.display !== 'none';
        
        if (dashboardVisible || intentos >= maxIntentos) {
            clearInterval(verificarCarga);
            
            if (dashboardVisible) {
                console.log('Dashboard cargado, iniciando onboarding');
            } else {
                console.warn('Timeout esperando dashboard, iniciando onboarding de todas formas');
            }
            
            callback();
        }
    }, 100);
}

// ============================================
// TOUR TRABAJADOR - MEJORADO
// ============================================
function iniciarTourTrabajador() {
    const isMobile = window.innerWidth < 768;

    // FIX iOS: Ocultar bottom nav durante el onboarding
    if (isMobile) {
        ocultarBottomNavDuranteOnboarding();
    }

    // Paso 1: Bienvenida - FIX iOS: Contenido compacto
    const introBienvenida = introJs();
    introBienvenida.setOptions({
        steps: [{
            intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">👋</div><h2>¡Bienvenido!</h2><p>Te mostramos cómo encontrar tu próxima chamba.</p></div>'
        }],
        showProgress: false,
        showBullets: false,
        exitOnOverlayClick: false,
        doneLabel: 'Comenzar 🚀',
        skipLabel: 'Ver despues'
    });
    
    introBienvenida.oncomplete(function() {
        if (isMobile) {
            tourTrabajadorMobile();
        } else {
            tourTrabajadorDesktop();
        }
    });
    
    introBienvenida.onexit(function() {
        recordarMasTarde();
    });
    
    introBienvenida.start();
}

// Tour para MOVIL - Con menu
function tourTrabajadorMobile() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    // FIX iOS: Solo mostrar sidebar si existe y no hay bottom-nav
    const tieneBottomNav = document.body.classList.contains('has-bottom-nav');

    if (sidebar && overlay && !tieneBottomNav) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        bloquearScrollSeguro();
    } else if (tieneBottomNav) {
        // Con bottom-nav, ir directo al tour del dashboard
        console.log('Bottom nav detectado, saltando tour de sidebar');
        tourTrabajadorDashboard();
        return;
    }
    
    setTimeout(function() {
        const introMenu = introJs();
        
        // FIX iOS: Pasos compactos
        const steps = [
            {
                element: '#menu-toggle',
                intro: '<h3>☰ Menú</h3><p>Accede a todas las funciones.</p>',
                position: 'bottom'
            },
            {
                element: '#nav-buscar',
                intro: '<h3>🔍 Buscar</h3><p>Encuentra trabajos por categoría y ubicación.</p>',
                position: 'right'
            },
            {
                element: '#nav-trabajadores',
                intro: '<h3>📋 Aplicaciones</h3><p>Estado de tus postulaciones.</p>',
                position: 'right'
            }
        ];
        
        const stepsValidos = validarPasos(steps);
        
        if (stepsValidos.length === 0) {
            console.warn('No hay pasos validos en menu mobile, saltando al dashboard');
            if (sidebar && overlay) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                desbloquearScrollSeguro();
            }
            tourTrabajadorDashboard();
            return;
        }
        
        introMenu.setOptions({
            steps: stepsValidos,
            showProgress: true,
            showBullets: false,
            exitOnOverlayClick: false,
            doneLabel: 'Siguiente →',
            nextLabel: 'Siguiente →',
            prevLabel: '← Atras',
            skipLabel: 'Saltar'
        });
        
        introMenu.oncomplete(function() {
            if (sidebar && overlay) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                desbloquearScrollSeguro();
            }
            
            setTimeout(function() {
                tourTrabajadorDashboard();
            }, ONBOARDING_CONFIG.delayEntreSecuencias);
        });
        
        introMenu.onexit(function() {
            if (sidebar && overlay) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                desbloquearScrollSeguro();
            }
            recordarMasTarde();
        });
        
        introMenu.start();
    }, ONBOARDING_CONFIG.delayEntreSecuencias);
}

// Tour para DESKTOP
function tourTrabajadorDesktop() {
    const intro = introJs();
    
    // FIX iOS: Pasos compactos
    const steps = [
        {
            element: '#nav-buscar',
            intro: '<h3>🔍 Buscar</h3><p>Encuentra trabajos por categoría y ubicación.</p>',
            position: 'right'
        },
        {
            element: '.stats-grid',
            intro: '<h3>📊 Estadísticas</h3><p>Chambas aplicadas y aceptadas.</p>',
            position: 'bottom'
        },
        {
            element: '#nav-trabajadores',
            intro: '<h3>📋 Aplicaciones</h3><p>Estado de tus postulaciones.</p>',
            position: 'right'
        }
    ];
    
    const stepsValidos = validarPasos(steps);
    
    if (stepsValidos.length === 0) {
        console.warn('No hay pasos validos en desktop, saltando al dashboard');
        tourTrabajadorDashboard();
        return;
    }
    
    intro.setOptions({
        steps: stepsValidos,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        doneLabel: 'Siguiente →',
        nextLabel: 'Siguiente →',
        prevLabel: '← Atras',
        skipLabel: 'Saltar'
    });
    
    intro.oncomplete(function() {
        tourTrabajadorDashboard();
    });
    
    intro.onexit(function() {
        recordarMasTarde();
    });
    
    intro.start();
}

// Tour del Dashboard (comun movil/desktop)
function tourTrabajadorDashboard() {
    const intro = introJs();
    
    const steps = [];
    
    // FIX iOS: Pasos compactos
    const ofertaCard = document.querySelector('.oferta-card');
    if (ofertaCard) {
        steps.push({
            element: '.oferta-card',
            intro: '<h3>📄 Ofertas</h3><p>Haz clic en "Ver Detalles" o "Contactar" para aplicar.</p>',
            position: 'top'
        });
    }

    const filtros = document.querySelector('.filtros-container');
    if (filtros) {
        steps.push({
            element: '.filtros-container',
            intro: '<h3>🔎 Filtros</h3><p>Filtra por categoría, ubicación y más.</p>',
            position: 'bottom'
        });
    }

    steps.push({
        intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">🎉</div><h2>¡Listo!</h2><p>Busca tu próxima chamba.</p></div>'
    });
    
    if (steps.length === 0) {
        finalizarOnboarding();
        return;
    }
    
    intro.setOptions({
        steps: steps,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        doneLabel: 'Empezar 🚀',
        nextLabel: 'Siguiente →',
        prevLabel: '← Atras',
        skipLabel: 'Saltar'
    });
    
    intro.oncomplete(function() {
        finalizarOnboarding();
    });
    
    intro.onexit(function() {
        recordarMasTarde();
    });
    
    intro.start();
}

// ============================================
// TOUR EMPLEADOR - MEJORADO
// ============================================
function iniciarTourEmpleador() {
    const isMobile = window.innerWidth < 768;

    // FIX iOS: Ocultar bottom nav durante el onboarding
    if (isMobile) {
        ocultarBottomNavDuranteOnboarding();
    }

    // FIX iOS: Contenido compacto
    const introBienvenida = introJs();
    introBienvenida.setOptions({
        steps: [{
            intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">👋</div><h2>¡Bienvenido!</h2><p>Te ayudamos a encontrar trabajadores.</p></div>'
        }],
        showProgress: false,
        showBullets: false,
        exitOnOverlayClick: false,
        doneLabel: 'Comenzar 🚀',
        skipLabel: 'Ver despues'
    });
    
    introBienvenida.oncomplete(function() {
        if (isMobile) {
            tourEmpleadorMobile();
        } else {
            tourEmpleadorDesktop();
        }
    });
    
    introBienvenida.onexit(function() {
        recordarMasTarde();
    });
    
    introBienvenida.start();
}

// Tour EMPLEADOR para MOVIL
function tourEmpleadorMobile() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    // FIX iOS: Solo mostrar sidebar si existe y no hay bottom-nav
    const tieneBottomNav = document.body.classList.contains('has-bottom-nav');

    if (sidebar && overlay && !tieneBottomNav) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        bloquearScrollSeguro();
    } else if (tieneBottomNav) {
        // Con bottom-nav, ir directo al tour del dashboard
        console.log('Bottom nav detectado, saltando tour de sidebar');
        tourEmpleadorDashboard();
        return;
    }
    
    setTimeout(function() {
        const introMenu = introJs();
        
        // FIX iOS: Pasos compactos
        const steps = [
            {
                element: '#menu-toggle',
                intro: '<h3>☰ Menú</h3><p>Accede a todas las funciones.</p>',
                position: 'bottom'
            },
            {
                element: '#nav-publicar',
                intro: '<h3>➕ Publicar</h3><p>Crea ofertas de trabajo en minutos.</p>',
                position: 'right'
            },
            {
                element: '#nav-trabajadores',
                intro: '<h3>👥 Aplicantes</h3><p>Revisa quién aplicó a tus ofertas.</p>',
                position: 'right'
            }
        ];
        
        const stepsValidos = validarPasos(steps);
        
        if (stepsValidos.length === 0) {
            console.warn('No hay pasos validos en menu mobile empleador, saltando al dashboard');
            if (sidebar && overlay) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                desbloquearScrollSeguro();
            }
            tourEmpleadorDashboard();
            return;
        }
        
        introMenu.setOptions({
            steps: stepsValidos,
            showProgress: true,
            showBullets: false,
            exitOnOverlayClick: false,
            doneLabel: 'Siguiente →',
            nextLabel: 'Siguiente →',
            prevLabel: '← Atras',
            skipLabel: 'Saltar'
        });
        
        introMenu.oncomplete(function() {
            if (sidebar && overlay) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                desbloquearScrollSeguro();
            }
            
            setTimeout(function() {
                tourEmpleadorDashboard();
            }, ONBOARDING_CONFIG.delayEntreSecuencias);
        });
        
        introMenu.onexit(function() {
            if (sidebar && overlay) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                desbloquearScrollSeguro();
            }
            recordarMasTarde();
        });
        
        introMenu.start();
    }, ONBOARDING_CONFIG.delayEntreSecuencias);
}

// Tour EMPLEADOR para DESKTOP
function tourEmpleadorDesktop() {
    const intro = introJs();
    
    // FIX iOS: Pasos compactos
    const steps = [
        {
            element: '#nav-publicar',
            intro: '<h3>➕ Publicar</h3><p>Crea ofertas en 4 pasos simples.</p>',
            position: 'right'
        },
        {
            element: '.stats-grid',
            intro: '<h3>📊 Estadísticas</h3><p>Aplicantes a tus ofertas en tiempo real.</p>',
            position: 'bottom'
        },
        {
            element: '#nav-trabajadores',
            intro: '<h3>👥 Aplicantes</h3><p>Revisa perfiles y contacta trabajadores.</p>',
            position: 'right'
        }
    ];
    
    const stepsValidos = validarPasos(steps);
    
    if (stepsValidos.length === 0) {
        console.warn('No hay pasos validos en desktop empleador, saltando al dashboard');
        tourEmpleadorDashboard();
        return;
    }
    
    intro.setOptions({
        steps: stepsValidos,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        doneLabel: 'Siguiente →',
        nextLabel: 'Siguiente →',
        prevLabel: '← Atras',
        skipLabel: 'Saltar'
    });
    
    intro.oncomplete(function() {
        tourEmpleadorDashboard();
    });
    
    intro.onexit(function() {
        recordarMasTarde();
    });
    
    intro.start();
}

// Tour Dashboard EMPLEADOR
function tourEmpleadorDashboard() {
    const intro = introJs();
    
    const steps = [];
    
    // FIX iOS: Pasos compactos
    const ofertaCard = document.querySelector('.oferta-card');
    if (ofertaCard) {
        steps.push({
            element: '.oferta-card',
            intro: '<h3>📄 Ofertas</h3><p>Clic en "Ver Aplicantes" para revisar.</p>',
            position: 'top'
        });
    }

    steps.push({
        intro: '<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:0.5rem">🚀</div><h2>¡Listo!</h2><p>Publica tu primera oferta.</p></div>'
    });
    
    if (steps.length === 0) {
        finalizarOnboarding();
        return;
    }
    
    intro.setOptions({
        steps: steps,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        doneLabel: 'Comenzar 🚀',
        nextLabel: 'Siguiente →',
        prevLabel: '← Atras',
        skipLabel: 'Saltar'
    });
    
    intro.oncomplete(function() {
        finalizarOnboarding();
    });
    
    intro.onexit(function() {
        recordarMasTarde();
    });
    
    intro.start();
}

// ============================================
// VALIDACION ROBUSTA DE PASOS (MEJORADA)
// ============================================
function validarPasos(steps) {
    const stepsValidos = steps.filter(function(step) {
        if (!step.element) return true;
        
        const elemento = document.querySelector(step.element);
        
        if (!elemento) {
            console.warn('Elemento no encontrado: ' + step.element);
            return false;
        }
        
        const esVisible = !!(
            elemento.offsetWidth || 
            elemento.offsetHeight || 
            elemento.getClientRects().length
        );
        
        if (!esVisible) {
            console.warn('Elemento no visible: ' + step.element);
            return false;
        }
        
        return true;
    });
    
    // FIX: Log de pasos validos
    console.log('Pasos validos: ' + stepsValidos.length + ' de ' + steps.length);
    
    return stepsValidos;
}

// ============================================
// FINALIZACION Y RECORDATORIOS
// ============================================
function finalizarOnboarding() {
    marcarComoCompletado();

    // FIX iOS: Restaurar bottom nav y scroll
    mostrarBottomNavDespuesOnboarding();
    desbloquearScrollSeguro();

    if (typeof toastSuccess === 'function') {
        toastSuccess('¡Bienvenido a ChambApp! 🎉');
    }

    console.log('Onboarding completado exitosamente');
}

function marcarComoCompletado() {
    localStorage.setItem(ONBOARDING_CONFIG.storageKeys.completed, 'true');
    localStorage.removeItem(ONBOARDING_CONFIG.storageKeys.remindLater);
}

function recordarMasTarde() {
    const ahora = Date.now();
    localStorage.setItem(ONBOARDING_CONFIG.storageKeys.remindLater, ahora.toString());

    // FIX iOS: Restaurar bottom nav y scroll al salir
    mostrarBottomNavDespuesOnboarding();
    desbloquearScrollSeguro();

    console.log('Recordatorio configurado para ' + ONBOARDING_CONFIG.recordatorioHoras + 'h');
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================
function reiniciarOnboarding() {
    localStorage.removeItem(ONBOARDING_CONFIG.storageKeys.completed);
    localStorage.removeItem(ONBOARDING_CONFIG.storageKeys.remindLater);
    sessionStorage.removeItem('usuario-ya-interactuo');
    location.reload();
}

// Detectar si usuario interactuo (para skip automatico)
var interaccionDetectada = false;
function detectarInteraccion() {
    if (!interaccionDetectada) {
        interaccionDetectada = true;
        sessionStorage.setItem('usuario-ya-interactuo', 'true');
    }
}

// Listeners de interaccion (ejecutar solo una vez)
['click', 'scroll', 'keydown'].forEach(function(evento) {
    document.addEventListener(evento, detectarInteraccion, { once: true });
});

// ============================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================
window.iniciarOnboarding = iniciarOnboarding;
window.tourTrabajador = iniciarTourTrabajador;
window.tourEmpleador = iniciarTourEmpleador;
window.reiniciarOnboarding = reiniciarOnboarding;

console.log('Onboarding ChambApp OPTIMIZADO cargado correctamente');
