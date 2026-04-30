(function () {
    var MIN_MS = 500;
    var MAX_MS = 8000;
    var start = Date.now();
    var hidden = false;

    var style = document.createElement('style');
    style.textContent =
        '#cy-loader{' +
            'position:fixed;inset:0;z-index:99999;' +
            'background:#fff;' +
            'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;' +
            'transition:opacity 0.3s ease;' +
        '}' +
        '#cy-loader.cy-loader--out{opacity:0;pointer-events:none;}' +
        '.cy-loader-logo{' +
            'font-family:Poppins,sans-serif;font-weight:700;font-size:32px;' +
            'letter-spacing:-0.5px;color:#0F1419;line-height:1;' +
        '}' +
        '.cy-loader-logo span{color:var(--primary,#0066FF);}' +
        '.cy-loader-spin{' +
            'width:32px;height:32px;border-radius:50%;' +
            'border:3px solid var(--primary-light,#E6F2FF);' +
            'border-top-color:var(--primary,#0066FF);' +
            'animation:cy-spin 0.7s linear infinite;' +
        '}' +
        '@keyframes cy-spin{to{transform:rotate(360deg);}}';
    document.head.appendChild(style);

    var el = document.createElement('div');
    el.id = 'cy-loader';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
        '<div class="cy-loader-logo">Chamba<span>Ya</span></div>' +
        '<div class="cy-loader-spin"></div>';
    document.body.appendChild(el);

    function hide() {
        if (hidden) return;
        hidden = true;
        var elapsed = Date.now() - start;
        var wait = Math.max(0, MIN_MS - elapsed);
        setTimeout(function () {
            el.classList.add('cy-loader--out');
            setTimeout(function () { el.remove(); style.remove(); }, 320);
        }, wait);
    }

    // IDs y clases de loading states internos usados en las páginas de la app
    var LOADING_SEL = '#loading-screen,#loading-state,#loading,#mapa-loading,.pp-loading';

    function isHidden(node) {
        return node.style.display === 'none' || node.classList.contains('oculto');
    }

    function waitForPageContent() {
        // Buscar el primer loading state visible en el DOM
        var nodes = document.querySelectorAll(LOADING_SEL);
        var target = null;
        for (var i = 0; i < nodes.length; i++) {
            if (!isHidden(nodes[i])) { target = nodes[i]; break; }
        }

        // Sin loading state interno → ocultar inmediatamente (login, register, etc.)
        if (!target) { hide(); return; }

        // Con loading state → esperar a que el JS de la página lo oculte
        var obs = new MutationObserver(function () {
            if (isHidden(target)) { obs.disconnect(); hide(); }
        });
        obs.observe(target, { attributes: true, attributeFilter: ['style', 'class'] });
    }

    window.addEventListener('load', waitForPageContent);

    // Fallback máximo: 8s por si algo falla (ej: Firebase offline, Maps error)
    setTimeout(hide, MAX_MS);

    // API manual para casos específicos (llamada desde JS de la página si se necesita)
    window.cyHideLoader = hide;
}());
