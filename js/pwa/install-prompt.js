// ============================================
// PWA INSTALL PROMPT - ChambApp
// Modulo: js/pwa/install-prompt.js
// Captura beforeinstallprompt y muestra banner
// ============================================

let deferredPrompt = null;

// ============================================
// LISTENERS DE INSTALACION
// ============================================

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // No mostrar si fue descartado recientemente
    if (fueDescartadoRecientemente()) return;

    // No mostrar si ya esta instalada
    if (isInstalledPWA()) return;

    mostrarBanner();
});

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    ocultarBanner();
    localStorage.removeItem('chambapp-pwa-install-dismissed');
});

// ============================================
// VERIFICACIONES
// ============================================

function isInstalledPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
}

function fueDescartadoRecientemente() {
    const dismissed = localStorage.getItem('chambapp-pwa-install-dismissed');
    if (!dismissed) return false;

    const diasCooldown = 7;
    const msCooldown = diasCooldown * 24 * 60 * 60 * 1000;
    return (Date.now() - parseInt(dismissed)) < msCooldown;
}

// ============================================
// UI DEL BANNER
// ============================================

function crearBannerHTML() {
    return `
        <div class="pwa-install-banner" id="pwa-install-banner">
            <div class="pwa-install-content">
                <img src="/assets/icons/icon-72.png" alt="" class="pwa-install-icon">
                <div class="pwa-install-text">
                    <strong>Instalar ChambaYa</strong>
                    <span>Acceso rapido desde tu inicio</span>
                </div>
            </div>
            <div class="pwa-install-actions">
                <button class="pwa-install-btn" id="pwa-install-btn">Instalar</button>
                <button class="pwa-install-close" id="pwa-install-close" aria-label="Cerrar">&times;</button>
            </div>
        </div>
    `;
}

function inyectarEstilos() {
    if (document.getElementById('pwa-install-styles')) return;

    const style = document.createElement('style');
    style.id = 'pwa-install-styles';
    style.textContent = `
        .pwa-install-banner {
            position: fixed;
            bottom: 70px;
            left: 12px;
            right: 12px;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.15);
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 1500;
            animation: pwa-slide-up 0.3s ease-out;
            border: 1px solid #E2E8F0;
        }
        .pwa-install-content {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 0;
        }
        .pwa-install-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            flex-shrink: 0;
        }
        .pwa-install-text {
            display: flex;
            flex-direction: column;
            min-width: 0;
        }
        .pwa-install-text strong {
            font-size: 0.875rem;
            color: #0F1419;
        }
        .pwa-install-text span {
            font-size: 0.75rem;
            color: #718096;
        }
        .pwa-install-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }
        .pwa-install-btn {
            background: #0066FF;
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 10px;
            font-size: 0.8125rem;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
        }
        .pwa-install-btn:active { background: #0052CC; }
        .pwa-install-close {
            background: none;
            border: none;
            font-size: 1.25rem;
            color: #718096;
            cursor: pointer;
            padding: 4px;
            line-height: 1;
        }
        @keyframes pwa-slide-up {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

function mostrarBanner() {
    inyectarEstilos();

    const existing = document.getElementById('pwa-install-banner');
    if (existing) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = crearBannerHTML();
    document.body.appendChild(wrapper.firstElementChild);

    document.getElementById('pwa-install-btn')
        .addEventListener('click', instalarApp);

    document.getElementById('pwa-install-close')
        .addEventListener('click', descartarBanner);
}

function ocultarBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.remove();
}

function descartarBanner() {
    localStorage.setItem('chambapp-pwa-install-dismissed', String(Date.now()));
    ocultarBanner();
}

// ============================================
// INSTALAR APP
// ============================================

async function instalarApp() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
        ocultarBanner();
    }

    deferredPrompt = null;
}
