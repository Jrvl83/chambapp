/**
 * ============================================
 * BOTTOM NAVIGATION COMPONENT - CHAMBAPP PWA
 * Mobile-first navigation pattern
 * ============================================
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        breakpoint: 768, // Mobile breakpoint in pixels
        hideOnScroll: false, // Hide bottom nav when scrolling down
        scrollThreshold: 50, // Pixels to scroll before hiding
        storageKey: 'chambapp-user-role'
    };

    // ============================================
    // STATE
    // ============================================
    let lastScrollY = 0;
    let isHidden = false;
    let userRole = null;

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const bottomNav = document.getElementById('bottom-nav');
    const bottomNavAdd = document.getElementById('bottom-nav-add');

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        if (!bottomNav) {
            console.warn('Bottom nav element not found');
            return;
        }

        // Detect user role
        detectUserRole();

        // Setup mobile detection
        handleResize();
        window.addEventListener('resize', debounce(handleResize, 100));

        // Setup scroll hiding (if enabled)
        if (CONFIG.hideOnScroll) {
            window.addEventListener('scroll', debounce(handleScroll, 10), { passive: true });
        }

        // Mark current page as active
        setActivePage();

        // Update navigation based on role
        updateNavigationForRole();

        // Add ripple effect listeners
        setupRippleEffects();

        console.log('📱 Bottom Navigation initialized');
    }

    // ============================================
    // USER ROLE DETECTION
    // ============================================
    function detectUserRole() {
        // Try to get from localStorage first
        const stored = localStorage.getItem(CONFIG.storageKey);
        if (stored) {
            userRole = stored;
            document.body.setAttribute('data-user-role', userRole);
            return;
        }

        // Try to get from Firebase user data (will be set by dashboard.js)
        // Default to empleador until we know
        userRole = 'empleador';
    }

    /**
     * Update user role (called from dashboard.js after Firebase loads)
     * @param {string} role - 'trabajador' or 'empleador'
     */
    function setUserRole(role) {
        userRole = role;
        localStorage.setItem(CONFIG.storageKey, role);
        document.body.setAttribute('data-user-role', role);
        updateNavigationForRole();
    }

    // ============================================
    // NAVIGATION UPDATES
    // ============================================
    function updateNavigationForRole() {
        const bottomNavExplore = bottomNav.querySelector('[data-page="explore"]');
        const bottomNavHome = bottomNav.querySelector('[data-page="home"]');

        // Actualizar botón Home según rol (reemplaza redundancia)
        if (bottomNavHome) {
            const iconHome = bottomNavHome.querySelector('.bottom-nav-icon');
            const labelHome = bottomNavHome.querySelector('.bottom-nav-label');

            if (userRole === 'trabajador') {
                bottomNavHome.href = 'mis-aplicaciones-trabajador.html';
                if (iconHome) iconHome.textContent = '📋';
                if (labelHome) labelHome.textContent = 'Mis Apps';
            } else {
                // Empleador: historial de ofertas
                bottomNavHome.href = 'historial-ofertas.html';
                if (iconHome) iconHome.textContent = '📋';
                if (labelHome) labelHome.textContent = 'Historial';
            }
        }

        // Actualizar botón central (Add)
        if (bottomNavAdd) {
            const iconAdd = bottomNavAdd.querySelector('.bottom-nav-icon');
            const labelAdd = bottomNavAdd.querySelector('.bottom-nav-label');

            if (userRole === 'trabajador') {
                bottomNavAdd.href = 'mapa-ofertas.html';
                if (iconAdd) iconAdd.textContent = '🔍';
                if (labelAdd) labelAdd.textContent = 'Explorar';
            } else {
                bottomNavAdd.href = 'publicar-oferta.html';
                if (iconAdd) iconAdd.textContent = '➕';
                if (labelAdd) labelAdd.textContent = 'Publicar';
            }
        }

        // Actualizar botón Explorar según rol
        if (bottomNavExplore) {
            const iconExplore = bottomNavExplore.querySelector('.bottom-nav-icon');
            const labelExplore = bottomNavExplore.querySelector('.bottom-nav-label');

            if (userRole === 'trabajador') {
                bottomNavExplore.href = 'dashboard.html';
                if (iconExplore) iconExplore.textContent = '🏠';
                if (labelExplore) labelExplore.textContent = 'Inicio';
            } else {
                // Empleador: ver candidatos
                bottomNavExplore.href = 'mis-aplicaciones.html';
                if (iconExplore) iconExplore.textContent = '👥';
                if (labelExplore) labelExplore.textContent = 'Candidatos';
            }
        }

        // Actualizar botón Perfil según rol
        const bottomNavProfile = bottomNav.querySelector('[data-page="profile"]');
        if (bottomNavProfile) {
            if (userRole === 'trabajador') {
                bottomNavProfile.href = 'perfil-trabajador.html';
            } else {
                bottomNavProfile.href = 'perfil-empleador.html';
            }
        }
    }

    // ============================================
    // ACTIVE PAGE DETECTION
    // ============================================
    function setActivePage() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'dashboard.html';

        const navItems = bottomNav.querySelectorAll('.bottom-nav-item');

        navItems.forEach(item => {
            const href = item.getAttribute('href');
            const isActive = href === currentPage ||
                            (currentPage === 'dashboard.html' && href === 'dashboard.html') ||
                            (currentPage === '' && href === 'dashboard.html') ||
                            (currentPage === 'index.html' && href === 'dashboard.html');

            if (isActive) {
                item.classList.add('active');
                item.setAttribute('aria-current', 'page');
            } else {
                item.classList.remove('active');
                item.removeAttribute('aria-current');
            }
        });
    }

    /**
     * Manually set active page (for SPA-like navigation)
     * @param {string} page - Page identifier (home, explore, add, messages, profile)
     */
    function setActive(page) {
        const navItems = bottomNav.querySelectorAll('.bottom-nav-item');

        navItems.forEach(item => {
            const itemPage = item.getAttribute('data-page');

            if (itemPage === page) {
                item.classList.add('active');
                item.setAttribute('aria-current', 'page');
            } else {
                item.classList.remove('active');
                item.removeAttribute('aria-current');
            }
        });
    }

    // ============================================
    // MOBILE DETECTION & BODY CLASS
    // ============================================
    function handleResize() {
        const isMobile = window.innerWidth <= CONFIG.breakpoint;

        if (isMobile) {
            document.body.classList.add('has-bottom-nav');
        } else {
            document.body.classList.remove('has-bottom-nav');
        }
    }

    // ============================================
    // SCROLL HIDING
    // ============================================
    function handleScroll() {
        if (!CONFIG.hideOnScroll) return;

        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > lastScrollY;
        const scrolledPastThreshold = currentScrollY > CONFIG.scrollThreshold;

        if (scrollingDown && scrolledPastThreshold && !isHidden) {
            bottomNav.classList.add('hidden');
            isHidden = true;
        } else if (!scrollingDown && isHidden) {
            bottomNav.classList.remove('hidden');
            isHidden = false;
        }

        lastScrollY = currentScrollY;
    }

    // ============================================
    // RIPPLE EFFECT
    // ============================================
    function setupRippleEffects() {
        const navItems = bottomNav.querySelectorAll('.bottom-nav-item');

        navItems.forEach(item => {
            item.addEventListener('touchstart', handleTouchStart, { passive: true });
        });
    }

    function handleTouchStart(e) {
        const item = e.currentTarget;

        // Add haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    // ============================================
    // BADGE MANAGEMENT
    // ============================================
    /**
     * Set badge count for a nav item
     * @param {string} page - Page identifier (home, explore, add, messages, profile)
     * @param {number} count - Badge count (0 to hide)
     */
    function setBadge(page, count) {
        const item = bottomNav.querySelector(`[data-page="${page}"]`);
        if (!item) return;

        let badge = item.querySelector('.bottom-nav-badge');

        if (count <= 0) {
            // Remove badge
            if (badge) badge.remove();
            return;
        }

        if (!badge) {
            // Create badge
            badge = document.createElement('span');
            badge.className = 'bottom-nav-badge';
            item.appendChild(badge);
        }

        // Update badge count
        badge.textContent = count > 99 ? '99+' : count;
    }

    // ============================================
    // SHOW/HIDE METHODS
    // ============================================
    function show() {
        if (bottomNav) {
            bottomNav.classList.remove('hidden');
            isHidden = false;
        }
    }

    function hide() {
        if (bottomNav) {
            bottomNav.classList.add('hidden');
            isHidden = true;
        }
    }

    // ============================================
    // UTILITIES
    // ============================================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ============================================
    // PUBLIC API
    // ============================================
    window.BottomNav = {
        init,
        setUserRole,
        setActive,
        setBadge,
        show,
        hide,

        // Enable/disable scroll hiding
        enableScrollHide: () => { CONFIG.hideOnScroll = true; },
        disableScrollHide: () => { CONFIG.hideOnScroll = false; show(); }
    };

    // ============================================
    // AUTO-INIT ON DOM READY
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
