// ============================================
// GUIDED TOUR ENGINE - CHAMBAPP
// Motor centralizado para tours guiados (Intro.js)
// Reemplaza: onboarding.js, onboarding-publicar.js,
//   onboarding-aplicaciones-empleador.js,
//   onboarding-aplicaciones-trabajador.js
// ============================================

(function() {
    'use strict';

    // Registro de tours
    var tours = {};

    // Estado interno
    var scrollPositionBefore = 0;
    var currentTourId = null;
    var hideEnforcerInterval = null;

    // Mapa de compatibilidad con localStorage keys legacy
    var STORAGE_KEYS = {
        'dashboard': {
            completed: 'chambapp-onboarding-completed',
            remindLater: 'chambapp-onboarding-remind-later'
        },
        'publicar': {
            completed: 'chambapp-onboarding-publicar'
        },
        'aplicaciones-empleador': {
            completed: 'chambapp-onboarding-aplicaciones'
        },
        'aplicaciones-trabajador': {
            completed: 'chambapp-onboarding-aplicaciones-trabajador'
        }
    };

    var REMIND_HOURS = 24;

    // ============================================
    // HELPERS
    // ============================================

    function isMobile() {
        return window.innerWidth < 768;
    }

    function getUserRole() {
        try {
            var data = localStorage.getItem('usuarioChambApp');
            if (data) {
                var usuario = JSON.parse(data);
                return usuario.tipo || null;
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    function waitForElement(selector, callback, maxWait) {
        maxWait = maxWait || 5000;
        var elapsed = 0;
        var interval = setInterval(function() {
            elapsed += 100;
            var el = document.querySelector(selector);
            var visible = el && (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0);
            if (visible) {
                clearInterval(interval);
                callback(true);
            } else if (elapsed >= maxWait) {
                clearInterval(interval);
                callback(false);
            }
        }, 100);
    }

    // ============================================
    // STORAGE
    // ============================================

    function getKeys(tourId) {
        return STORAGE_KEYS[tourId] || {
            completed: 'chambapp-tour-' + tourId,
            remindLater: 'chambapp-tour-' + tourId + '-remind'
        };
    }

    function isCompleted(tourId) {
        var keys = getKeys(tourId);
        return localStorage.getItem(keys.completed) === 'true';
    }

    function markCompleted(tourId) {
        var keys = getKeys(tourId);
        localStorage.setItem(keys.completed, 'true');
        if (keys.remindLater) {
            localStorage.removeItem(keys.remindLater);
        }
    }

    function isRemindedLater(tourId) {
        var keys = getKeys(tourId);
        if (!keys.remindLater) return false;
        var ts = localStorage.getItem(keys.remindLater);
        if (!ts) return false;
        var hours = (Date.now() - parseInt(ts)) / (1000 * 60 * 60);
        if (hours >= REMIND_HOURS) {
            localStorage.removeItem(keys.remindLater);
            return false;
        }
        return true;
    }

    function remindLater(tourId) {
        var keys = getKeys(tourId);
        if (keys.remindLater) {
            localStorage.setItem(keys.remindLater, Date.now().toString());
        }
    }

    // ============================================
    // iOS SCROLL BLOCKING
    // ============================================

    function lockScroll() {
        scrollPositionBefore = window.pageYOffset || document.documentElement.scrollTop;
        document.body.style.position = 'fixed';
        document.body.style.top = '-' + scrollPositionBefore + 'px';
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
    }

    function unlockScroll() {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollPositionBefore);
    }

    // ============================================
    // BOTTOM NAV MANAGEMENT
    // ============================================

    function forceHideElements() {
        var nav = document.querySelector('.bottom-nav');
        if (nav) nav.style.display = 'none';
        var notif = document.getElementById('notif-prompt-banner');
        if (notif) notif.style.display = 'none';
        if (!document.body.classList.contains('onboarding-activo')) {
            document.body.classList.add('onboarding-activo');
        }
    }

    function hideBottomNav() {
        forceHideElements();
        // Enforcer: re-aplica cada 200ms mientras el tour esté activo
        if (hideEnforcerInterval) clearInterval(hideEnforcerInterval);
        hideEnforcerInterval = setInterval(forceHideElements, 200);
    }

    function showBottomNav() {
        if (hideEnforcerInterval) {
            clearInterval(hideEnforcerInterval);
            hideEnforcerInterval = null;
        }
        var nav = document.querySelector('.bottom-nav');
        if (nav) nav.style.display = '';
        var notif = document.getElementById('notif-prompt-banner');
        if (notif) notif.style.display = '';
        document.body.classList.remove('onboarding-activo');
    }

    // ============================================
    // STEP VALIDATION
    // ============================================

    function validateSteps(steps) {
        var role = getUserRole();
        var mobile = isMobile();

        return steps.filter(function(step) {
            // Filtrar por dispositivo
            if (step.showOn === 'mobile' && !mobile) return false;
            if (step.showOn === 'desktop' && mobile) return false;

            // Filtrar por rol
            if (step.showForRole && step.showForRole !== role) return false;

            // Pasos sin element (welcome/completion) siempre pasan
            if (!step.element) return true;

            var el = document.querySelector(step.element);
            if (!el) return false;

            var visible = !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
            return visible;
        });
    }

    // ============================================
    // CLEANUP
    // ============================================

    function cleanup(tourId, completed) {
        showBottomNav();
        unlockScroll();
        currentTourId = null;

        if (completed) {
            markCompleted(tourId);
        } else {
            remindLater(tourId);
        }
    }

    // ============================================
    // STEP COUNTER
    // ============================================

    function addStepCounters(steps) {
        if (steps.length <= 1) return;
        for (var i = 0; i < steps.length; i++) {
            steps[i].title = 'Paso ' + (i + 1) + ' de ' + steps.length;
        }
    }

    // ============================================
    // TOUR RUNNER: SINGLE (publicar, aplicaciones)
    // ============================================

    function runSingleTour(tourId, config) {
        if (typeof introJs === 'undefined') return;

        var validSteps = validateSteps(config.steps);
        if (validSteps.length === 0) return;

        addStepCounters(validSteps);
        hideBottomNav();
        currentTourId = tourId;
        var intro = introJs();

        intro.setOptions({
            steps: validSteps,
            showProgress: true,
            showBullets: false,
            exitOnOverlayClick: false,
            scrollToElement: true,
            scrollTo: 'tooltip',
            doneLabel: config.doneLabel || 'Entendido',
            nextLabel: 'Siguiente \u2192',
            prevLabel: '\u2190 Atr\u00e1s',
            skipLabel: 'Saltar'
        });

        intro.oncomplete(function() {
            cleanup(tourId, true);
            if (config.onComplete && typeof toastSuccess === 'function') {
                toastSuccess(config.onComplete);
            }
        });

        intro.onexit(function() {
            cleanup(tourId, true);
        });

        intro.start();
    }

    // ============================================
    // TOUR RUNNER: MULTI-SEQUENCE (dashboard)
    // ============================================

    function runSequences(tourId, sequences, seqIndex) {
        if (typeof introJs === 'undefined') return;
        seqIndex = seqIndex || 0;

        if (seqIndex >= sequences.length) {
            cleanup(tourId, true);
            var config = tours[tourId];
            if (config && config.onComplete && typeof toastSuccess === 'function') {
                toastSuccess(config.onComplete);
            }
            return;
        }

        // Re-enforce hiding al inicio de cada secuencia
        hideBottomNav();

        var seq = sequences[seqIndex];
        var transitioning = false;

        // beforeStart hook
        if (seq.beforeStart) {
            seq.beforeStart();
        }

        var validSteps = validateSteps(seq.steps);
        if (validSteps.length === 0) {
            // Ejecutar afterComplete y saltar a siguiente secuencia
            if (seq.afterComplete) seq.afterComplete();
            runSequences(tourId, sequences, seqIndex + 1);
            return;
        }

        addStepCounters(validSteps);

        var intro = introJs();
        intro.setOptions({
            steps: validSteps,
            showProgress: validSteps.length > 1,
            showBullets: false,
            exitOnOverlayClick: false,
            scrollToElement: true,
            scrollTo: 'tooltip',
            doneLabel: seq.doneLabel || 'Siguiente \u2192',
            nextLabel: 'Siguiente \u2192',
            prevLabel: '\u2190 Atr\u00e1s',
            skipLabel: 'Saltar'
        });

        intro.oncomplete(function() {
            // Marcar transición para que onexit no haga cleanup
            transitioning = true;
            if (seq.afterComplete) seq.afterComplete();
            setTimeout(function() {
                runSequences(tourId, sequences, seqIndex + 1);
            }, 350);
        });

        intro.onexit(function() {
            if (seq.afterComplete) seq.afterComplete();
            // Solo hacer cleanup si el usuario realmente salió (no transición)
            if (!transitioning) {
                cleanup(tourId, false);
            }
        });

        intro.start();
    }

    // ============================================
    // PUBLIC API
    // ============================================

    window.GuidedTour = {
        registerTour: function(tourId, config) {
            tours[tourId] = config;
        },

        start: function(tourId, options) {
            options = options || {};
            var config = tours[tourId];
            if (!config) return;

            // Verificar completado (salvo force)
            if (!options.force && isCompleted(tourId)) return;

            // Verificar remind later
            if (!options.force && isRemindedLater(tourId)) return;

            // Verificar Intro.js cargado
            if (typeof introJs === 'undefined') return;

            // Scroll al inicio para que el primer paso sea visible
            window.scrollTo(0, 0);

            // Dashboard usa secuencias, el resto tour simple
            if (config.sequences) {
                var role = getUserRole();
                var seqs = typeof config.sequences === 'function'
                    ? config.sequences(role, isMobile())
                    : config.sequences;

                hideBottomNav();
                currentTourId = tourId;
                runSequences(tourId, seqs, 0);
            } else {
                runSingleTour(tourId, config);
            }
        },

        isCompleted: function(tourId) {
            return isCompleted(tourId);
        },

        reset: function(tourId) {
            var keys = getKeys(tourId);
            localStorage.removeItem(keys.completed);
            if (keys.remindLater) localStorage.removeItem(keys.remindLater);
        },

        resetAll: function() {
            var ids = Object.keys(STORAGE_KEYS);
            for (var i = 0; i < ids.length; i++) {
                this.reset(ids[i]);
            }
            // Limpiar cualquier tour custom
            Object.keys(tours).forEach(function(id) {
                if (!STORAGE_KEYS[id]) {
                    var keys = getKeys(id);
                    localStorage.removeItem(keys.completed);
                    if (keys.remindLater) localStorage.removeItem(keys.remindLater);
                }
            });
        },

        _helpers: {
            isMobile: isMobile,
            getUserRole: getUserRole,
            waitForElement: waitForElement
        }
    };

})();
