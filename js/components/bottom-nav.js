/**
 * ============================================
 * BOTTOM NAVIGATION COMPONENT - CHAMBAPP PWA
 * Mobile-first navigation pattern
 * ============================================
 */

(function() {
    'use strict';

    // ============================================
    // SVG ICON CONSTANTS (nav 20×20)
    // ============================================
    const NAV_ICON_HOME = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
    const NAV_ICON_EXPLORE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
    const NAV_ICON_APPS = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>';
    const NAV_ICON_BELL = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
    const NAV_ICON_USER = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const NAV_ICON_PEOPLE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
    const NAV_ICON_PLUS = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';

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
                if (iconHome) iconHome.innerHTML = NAV_ICON_APPS;
                if (labelHome) labelHome.textContent = 'Mis Apps';
            } else {
                // Empleador: historial de ofertas
                bottomNavHome.href = 'historial-ofertas.html';
                if (iconHome) iconHome.innerHTML = NAV_ICON_APPS;
                if (labelHome) labelHome.textContent = 'Historial';
            }
        }

        // Actualizar botón central (Add)
        if (bottomNavAdd) {
            const iconAdd = bottomNavAdd.querySelector('.bottom-nav-icon');
            const labelAdd = bottomNavAdd.querySelector('.bottom-nav-label');

            if (userRole === 'trabajador') {
                bottomNavAdd.href = 'mapa-ofertas.html';
                if (iconAdd) iconAdd.innerHTML = NAV_ICON_EXPLORE;
                if (labelAdd) labelAdd.textContent = 'Explorar';
            } else {
                bottomNavAdd.href = 'publicar-oferta.html';
                if (iconAdd) iconAdd.innerHTML = NAV_ICON_PLUS;
                if (labelAdd) labelAdd.textContent = 'Publicar';
            }
        }

        // Actualizar botón Explorar según rol
        if (bottomNavExplore) {
            const iconExplore = bottomNavExplore.querySelector('.bottom-nav-icon');
            const labelExplore = bottomNavExplore.querySelector('.bottom-nav-label');

            if (userRole === 'trabajador') {
                bottomNavExplore.href = 'dashboard.html';
                if (iconExplore) iconExplore.innerHTML = NAV_ICON_HOME;
                if (labelExplore) labelExplore.textContent = 'Inicio';
            } else {
                // Empleador: ver candidatos
                bottomNavExplore.href = 'mis-aplicaciones.html';
                if (iconExplore) iconExplore.innerHTML = NAV_ICON_PEOPLE;
                if (labelExplore) labelExplore.textContent = 'Talento';
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
