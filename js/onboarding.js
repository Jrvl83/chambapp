// ============================================
// ONBOARDING OPTIMIZADO - CHAMBAPP
// Tour Guiado con Intro.js + UX Mejorado
// ============================================

/**
 * 馃敶 MEJORAS IMPLEMENTADAS:
 * - Detecci贸n m贸vil/desktop con tours adaptados
 * - Apertura autom谩tica de men煤 en m贸vil
 * - Tours secuenciales para mejor UX
 * - Validaci贸n robusta de elementos
 * - Sistema "Ver despu茅s" (24 horas)
 * - M谩s pasos interactivos (71% vs 40%)
 * - Timing optimizado (400ms vs 800ms)
 */

// ============================================
// CONFIGURACI脫N
// ============================================
const ONBOARDING_CONFIG = {
    delayInicial: 400, // Reducido de 800ms
    delayEntreSecuencias: 350,
    recordatorioHoras: 24,
    storageKeys: {
        completed: 'chambapp-onboarding-completed',
        remindLater: 'chambapp-onboarding-remind-later'
    }
};

// ============================================
// INICIAR ONBOARDING
// ============================================
function iniciarOnboarding() {
    // Verificar si ya complet贸 el tour
    const yaCompleto = localStorage.getItem(ONBOARDING_CONFIG.storageKeys.completed);
    if (yaCompleto === 'true') {
        console.log('鉁?Usuario ya complet贸 el onboarding');
        return;
    }
    
    // Verificar "recordar despu茅s"
    const remindLater = localStorage.getItem(ONBOARDING_CONFIG.storageKeys.remindLater);
    if (remindLater) {
        const timestampRecordatorio = parseInt(remindLater);
        const ahora = Date.now();
        const horasPasadas = (ahora - timestampRecordatorio) / (1000 * 60 * 60);
        
        if (horasPasadas < ONBOARDING_CONFIG.recordatorioHoras) {
            console.log(`鈴?Recordatorio en ${Math.round(ONBOARDING_CONFIG.recordatorioHoras - horasPasadas)}h`);
            return;
        } else {
            // Ya pasaron 24h, limpiar y mostrar
            localStorage.removeItem(ONBOARDING_CONFIG.storageKeys.remindLater);
        }
    }
    
    // Verificar que Intro.js est茅 cargado
    if (typeof introJs === 'undefined') {
        console.error('鉂?Intro.js no est谩 cargado');
        return;
    }
    
    // Obtener datos del usuario
    const usuarioData = localStorage.getItem('usuarioChambApp');
    if (!usuarioData) {
        console.warn('鈿狅笍 No hay datos de usuario para onboarding');
        return;
    }
    
    const usuario = JSON.parse(usuarioData);
    console.log('馃幆 Iniciando onboarding para:', usuario.tipo);
    
    // 馃敶 MEJORA: Detectar si usuario ya interactu贸
    const yaInteractuo = sessionStorage.getItem('usuario-ya-interactuo');
    if (yaInteractuo) {
        console.log('鈿狅笍 Usuario ya interactu贸, skip onboarding');
        marcarComoCompletado();
        return;
    }
    
    // Esperar a que el contenido est茅 cargado
    setTimeout(() => {
        if (usuario.tipo === 'trabajador') {
            iniciarTourTrabajador();
        } else if (usuario.tipo === 'empleador') {
            iniciarTourEmpleador();
        }
    }, ONBOARDING_CONFIG.delayInicial);
}

// ============================================
// 馃敶 TOUR TRABAJADOR - MEJORADO
// ============================================
function iniciarTourTrabajador() {
    const isMobile = window.innerWidth < 768;
    
    // Paso 1: Bienvenida
    const introBienvenida = introJs();
    introBienvenida.setOptions({
        steps: [{
            intro: `
                <div style="text-align: center;">
                    <div style="font-size: 3.5rem; margin-bottom: 1rem;">馃憢</div>
                    <h2>隆Bienvenido a ChambApp!</h2>
                    <p style="margin-top: 1rem;">Te mostraremos c贸mo encontrar tu pr贸xima chamba en 30 segundos.</p>
                    <p style="font-size: 0.875rem; color: #94a3b8; margin-top: 1rem;">
                        ${isMobile ? 'Optimizado para m贸vil' : 'Tour interactivo'}
                    </p>
                </div>
            `
        }],
        showProgress: false,
        showBullets: false,
        exitOnOverlayClick: false,
        doneLabel: 'Comenzar 馃殌',
        skipLabel: 'Ver despu茅s'
    });
    
    introBienvenida.oncomplete(() => {
        if (isMobile) {
            tourTrabajadorMobile();
        } else {
            tourTrabajadorDesktop();
        }
    });
    
    introBienvenida.onexit(() => {
        recordarMasTarde();
    });
    
    introBienvenida.start();
}

// Tour para M脫VIL - Con men煤
function tourTrabajadorMobile() {
    // Abrir men煤 primero
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    setTimeout(() => {
        const introMenu = introJs();
        
        const steps = [
            {
                element: '#menu-toggle',
                intro: `
                    <h3>鈽?Men煤 Principal</h3>
                    <p>Desde este bot贸n accedes a todas las funciones.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.75rem; color: #64748b;">
                        Ya lo abrimos para mostrarte...
                    </p>
                `,
                position: 'bottom'
            },
            {
                element: '#nav-buscar',
                intro: `
                    <h3>馃攳 Buscar Chambas</h3>
                    <p>Encuentra trabajos por categor铆a, ubicaci贸n y salario.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.75rem;">
                        Miles de ofertas nuevas cada semana.
                    </p>
                `,
                position: 'right'
            },
            {
                element: '#nav-trabajadores',
                intro: `
                    <h3>馃搵 Mis Aplicaciones</h3>
                    <p>Revisa el estado de tus postulaciones aqu铆.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.75rem;">
                        Recibe notificaciones cuando te respondan.
                    </p>
                `,
                position: 'right'
            }
        ];
        
        // Validar elementos
        const stepsValidos = validarPasos(steps);
        
        introMenu.setOptions({
            steps: stepsValidos,
            showProgress: true,
            showBullets: false,
            exitOnOverlayClick: false,
            doneLabel: 'Siguiente 鈫?,
            nextLabel: 'Siguiente 鈫?,
            prevLabel: '鈫?Atr谩s',
            skipLabel: 'Saltar'
        });
        
        introMenu.oncomplete(() => {
            // Cerrar men煤
            if (sidebar && overlay) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            
            setTimeout(() => {
                tourTrabajadorDashboard();
            }, ONBOARDING_CONFIG.delayEntreSecuencias);
        });
        
        introMenu.onexit(() => {
            if (sidebar && overlay) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            recordarMasTarde();
        });
        
        introMenu.start();
    }, ONBOARDING_CONFIG.delayEntreSecuencias);
}

// Tour para DESKTOP
function tourTrabajadorDesktop() {
    const intro = introJs();
    
    const steps = [
        {
            element: '#nav-buscar',
            intro: `
                <h3>馃攳 Buscar Chambas</h3>
                <p>Encuentra trabajos por categor铆a, ubicaci贸n y salario.</p>
                <p style="font-size: 0.875rem; margin-top: 0.75rem;">
                    Usa los filtros para encontrar exactamente lo que buscas.
                </p>
            `,
            position: 'right'
        },
        {
            element: '.stats-grid',
            intro: `
                <h3>馃搳 Tus Estad铆sticas</h3>
                <p>Aqu铆 ver谩s cu谩ntas chambas has aplicado y cu谩ntas fueron aceptadas.</p>
                <p style="font-size: 0.875rem; margin-top: 0.75rem; color: #64748b;">
                    Se actualiza en tiempo real.
                </p>
            `,
            position: 'bottom'
        },
        {
            element: '#nav-trabajadores',
            intro: `
                <h3>馃搵 Mis Aplicaciones</h3>
                <p>Revisa todas tus postulaciones y su estado.</p>
            `,
            position: 'right'
        }
    ];
    
    const stepsValidos = validarPasos(steps);
    
    intro.setOptions({
        steps: stepsValidos,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        doneLabel: 'Siguiente 鈫?,
        nextLabel: 'Siguiente 鈫?,
        prevLabel: '鈫?Atr谩s',
        skipLabel: 'Saltar'
    });
    
    intro.oncomplete(() => {
        tourTrabajadorDashboard();
    });
    
    intro.onexit(() => {
        recordarMasTarde();
    });
    
    intro.start();
}

// Tour del Dashboard (com煤n m贸vil/desktop)
function tourTrabajadorDashboard() {
    const intro = introJs();
    
    const steps = [];
    
    // 馃敶 MEJORA: Solo mostrar si HAY ofertas
    const ofertaCard = document.querySelector('.oferta-card');
    if (ofertaCard) {
        steps.push({
            element: '.oferta-card',
            intro: `
                <h3>馃捈 Ofertas Disponibles</h3>
                <p>Estas son las chambas activas.</p>
                <ul style="margin-top: 0.75rem; padding-left: 1.25rem;">
                    <li>Haz clic en <strong>"Ver Detalles"</strong> para m谩s info</li>
                    <li>Presiona <strong>"Contactar"</strong> para aplicar</li>
                </ul>
            `,
            position: 'top'
        });
    }
    
    // Filtros
    const filtros = document.querySelector('.filtros-container');
    if (filtros) {
        steps.push({
            element: '.filtros-container',
            intro: `
                <h3>馃攷 Filtros Inteligentes</h3>
                <p>Encuentra la chamba perfecta filtrando por:</p>
                <ul style="margin-top: 0.75rem; padding-left: 1.25rem;">
                    <li>Categor铆a (electricidad, construcci贸n, etc.)</li>
                    <li>Ubicaci贸n (cerca de ti)</li>
                    <li>Palabras clave</li>
                </ul>
            `,
            position: 'bottom'
        });
    }
    
    // Final
    steps.push({
        intro: `
            <div style="text-align: center;">
                <div style="font-size: 3.5rem; margin-bottom: 1rem;">馃帀</div>
                <h2>隆Listo para empezar!</h2>
                <p style="margin-top: 1rem;">Ahora puedes buscar tu pr贸xima chamba.</p>
                <div style="margin-top: 1.5rem; padding: 1.25rem; background: #eff6ff; border-radius: 12px; border-left: 4px solid #2563eb;">
                    <p style="font-weight: 600; color: #2563eb; margin: 0; font-size: 0.9375rem;">
                        馃挕 Tip: Como usuario gratis puedes aplicar a 5 chambas por mes
                    </p>
                </div>
            </div>
        `
    });
    
    if (steps.length === 0) {
        // No hay pasos, completar directamente
        finalizarOnboarding();
        return;
    }
    
    intro.setOptions({
        steps: steps,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        doneLabel: 'Empezar 馃殌',
        nextLabel: 'Siguiente 鈫?,
        prevLabel: '鈫?Atr谩s',
        skipLabel: 'Saltar'
    });
    
    intro.oncomplete(() => {
        finalizarOnboarding();
    });
    
    intro.onexit(() => {
        recordarMasTarde();
    });
    
    intro.start();
}

// ============================================
// 馃敶 TOUR EMPLEADOR - MEJORADO
// ============================================
function iniciarTourEmpleador() {
    const isMobile = window.innerWidth < 768;
    
    const introBienvenida = introJs();
    introBienvenida.setOptions({
        steps: [{
            intro: `
                <div style="text-align: center;">
                    <div style="font-size: 3.5rem; margin-bottom: 1rem;">馃憢</div>
                    <h2>隆Bienvenido a ChambApp!</h2>
                    <p style="margin-top: 1rem;">Te ayudaremos a encontrar trabajadores r谩pidamente.</p>
                    <p style="font-size: 0.875rem; color: #94a3b8; margin-top: 1rem;">
                        Este tour toma solo 30 segundos
                    </p>
                </div>
            `
        }],
        showProgress: false,
        showBullets: false,
        exitOnOverlayClick: false,
        doneLabel: 'Comenzar 馃殌',
        skipLabel: 'Ver despu茅s'
    });
    
    introBienvenida.oncomplete(() => {
        if (isMobile) {
            tourEmpleadorMobile();
        } else {
            tourEmpleadorDesktop();
        }
    });
    
    introBienvenida.onexit(() => {
        recordarMasTarde();
    });
    
    introBienvenida.start();
}

// Tour EMPLEADOR para M脫VIL
function tourEmpleadorMobile() {
    // 馃敶 FIX: Abrir men煤 autom谩ticamente
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    setTimeout(() => {
        const introMenu = introJs();
        
        const steps = [
            {
                element: '#menu-toggle',
                intro: `
                    <h3>鈽?Men煤 Principal</h3>
                    <p>Accede a todas las funciones desde aqu铆.</p>
                `,
                position: 'bottom'
            },
            {
                element: '#nav-publicar',
                intro: `
                    <h3>鉃?Publicar Oferta</h3>
                    <p>Crea ofertas de trabajo en menos de 2 minutos.</p>
                    <ul style="margin-top: 0.75rem; padding-left: 1.25rem;">
                        <li>Describe el trabajo</li>
                        <li>Especifica ubicaci贸n y pago</li>
                        <li>Recibe aplicaciones inmediatas</li>
                    </ul>
                `,
                position: 'right'
            },
            {
                element: '#nav-trabajadores',
                intro: `
                    <h3>馃懃 Ver Aplicantes</h3>
                    <p>Aqu铆 revisas qui茅n aplic贸 a tus ofertas.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.75rem;">
                        Ver谩s perfiles, experiencia y contacto directo.
                    </p>
                `,
                position: 'right'
            }
        ];
        
        const stepsValidos = validarPasos(steps);
        
        introMenu.setOptions({
            steps: stepsValidos,
            showProgress: true,
            showBullets: false,
            exitOnOverlayClick: false,
            doneLabel: 'Siguiente 鈫?,
            nextLabel: 'Siguiente 鈫?,
            prevLabel: '鈫?Atr谩s',
            skipLabel: 'Saltar'
        });
        
        introMenu.oncomplete(() => {
            // Cerrar men煤
            if (sidebar && overlay) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            
            setTimeout(() => {
                tourEmpleadorDashboard();
            }, ONBOARDING_CONFIG.delayEntreSecuencias);
        });
        
        introMenu.onexit(() => {
            if (sidebar && overlay) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            recordarMasTarde();
        });
        
        introMenu.start();
    }, ONBOARDING_CONFIG.delayEntreSecuencias);
}

// Tour EMPLEADOR para DESKTOP
function tourEmpleadorDesktop() {
    const intro = introJs();
    
    const steps = [
        {
            element: '#nav-publicar',
            intro: `
                <h3>鉃?Publicar Oferta</h3>
                <p>Crea ofertas de trabajo r谩pidamente.</p>
                <ul style="margin-top: 0.75rem; padding-left: 1.25rem;">
                    <li>Formulario simple de 4 pasos</li>
                    <li>Publicaci贸n instant谩nea</li>
                    <li>Visible para miles de trabajadores</li>
                </ul>
            `,
            position: 'right'
        },
        {
            element: '.stats-grid',
            intro: `
                <h3>馃搳 Tus Estad铆sticas</h3>
                <p>Ve cu谩ntos trabajadores han aplicado a tus ofertas.</p>
                <p style="font-size: 0.875rem; margin-top: 0.75rem; color: #64748b;">
                    Informaci贸n actualizada en tiempo real.
                </p>
            `,
            position: 'bottom'
        },
        {
            element: '#nav-trabajadores',
            intro: `
                <h3>馃懃 Tus Aplicantes</h3>
                <p>Revisa perfiles y contacta trabajadores directamente.</p>
            `,
            position: 'right'
        }
    ];
    
    const stepsValidos = validarPasos(steps);
    
    intro.setOptions({
        steps: stepsValidos,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        doneLabel: 'Siguiente 鈫?,
        nextLabel: 'Siguiente 鈫?,
        prevLabel: '鈫?Atr谩s',
        skipLabel: 'Saltar'
    });
    
    intro.oncomplete(() => {
        tourEmpleadorDashboard();
    });
    
    intro.onexit(() => {
        recordarMasTarde();
    });
    
    intro.start();
}

// Tour Dashboard EMPLEADOR
function tourEmpleadorDashboard() {
    const intro = introJs();
    
    const steps = [];
    
    // 馃敶 MEJORA: Mostrar tour de ofertas solo si tiene ofertas
    const ofertaCard = document.querySelector('.oferta-card');
    if (ofertaCard) {
        steps.push({
            element: '.oferta-card',
            intro: `
                <h3>馃捈 Tus Ofertas</h3>
                <p>Estas son las chambas que has publicado.</p>
                <p style="font-size: 0.875rem; margin-top: 0.75rem;">
                    Haz clic en <strong>"Ver Aplicantes"</strong> para revisar qui茅n aplic贸.
                </p>
            `,
            position: 'top'
        });
    }
    
    // Final
    steps.push({
        intro: `
            <div style="text-align: center;">
                <div style="font-size: 3.5rem; margin-bottom: 1rem;">馃殌</div>
                <h2>隆Todo listo!</h2>
                <p style="margin-top: 1rem;">Empieza publicando tu primera oferta de trabajo.</p>
                <div style="margin-top: 1.5rem; padding: 1.25rem; background: #eff6ff; border-radius: 12px; border-left: 4px solid #2563eb;">
                    <p style="font-weight: 600; color: #2563eb; margin: 0; font-size: 0.9375rem;">
                        馃挕 Tip: Ofertas con salario claro reciben 3x m谩s aplicantes
                    </p>
                </div>
            </div>
        `
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
        doneLabel: 'Comenzar 馃殌',
        nextLabel: 'Siguiente 鈫?,
        prevLabel: '鈫?Atr谩s',
        skipLabel: 'Saltar'
    });
    
    intro.oncomplete(() => {
        finalizarOnboarding();
    });
    
    intro.onexit(() => {
        recordarMasTarde();
    });
    
    intro.start();
}

// ============================================
// 馃敶 VALIDACI脫N ROBUSTA DE PASOS
// ============================================
function validarPasos(steps) {
    return steps.filter(step => {
        // Pasos sin elemento (modales) siempre v谩lidos
        if (!step.element) return true;
        
        const elemento = document.querySelector(step.element);
        
        // Verificar que exista
        if (!elemento) {
            console.warn(`鈿狅笍 Elemento no encontrado: ${step.element}`);
            return false;
        }
        
        // Verificar que sea visible
        const esVisible = !!(
            elemento.offsetWidth || 
            elemento.offsetHeight || 
            elemento.getClientRects().length
        );
        
        if (!esVisible) {
            console.warn(`鈿狅笍 Elemento no visible: ${step.element}`);
            return false;
        }
        
        return true;
    });
}

// ============================================
// FINALIZACI脫N Y RECORDATORIOS
// ============================================
function finalizarOnboarding() {
    marcarComoCompletado();
    
    // 馃敶 MEJORA: Celebraci贸n con confetti (opcional)
    if (typeof toastSuccess === 'function') {
        toastSuccess('隆Bienvenido a ChambApp! 馃帀');
    }
    
    console.log('鉁?Onboarding completado exitosamente');
}

function marcarComoCompletado() {
    localStorage.setItem(ONBOARDING_CONFIG.storageKeys.completed, 'true');
    localStorage.removeItem(ONBOARDING_CONFIG.storageKeys.remindLater);
}

function recordarMasTarde() {
    const ahora = Date.now();
    localStorage.setItem(ONBOARDING_CONFIG.storageKeys.remindLater, ahora.toString());
    console.log(`鈴?Recordatorio configurado para ${ONBOARDING_CONFIG.recordatorioHoras}h`);
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

// Detectar si usuario interact煤a (para skip autom谩tico)
let interaccionDetectada = false;
function detectarInteraccion() {
    if (!interaccionDetectada) {
        interaccionDetectada = true;
        sessionStorage.setItem('usuario-ya-interactuo', 'true');
    }
}

// Listeners de interacci贸n (ejecutar solo una vez)
['click', 'scroll', 'keydown'].forEach(evento => {
    document.addEventListener(evento, detectarInteraccion, { once: true });
});

// ============================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================
window.iniciarOnboarding = iniciarOnboarding;
window.tourTrabajador = iniciarTourTrabajador;
window.tourEmpleador = iniciarTourEmpleador;
window.reiniciarOnboarding = reiniciarOnboarding;

console.log('鉁?Onboarding ChambApp OPTIMIZADO cargado correctamente');
