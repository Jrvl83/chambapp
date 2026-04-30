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

    // Fallback automático: window.load (páginas sin carga async pesada)
    // Si la página declara window.cyLoaderManual = true, espera cyHideLoader()
    if (!window.cyLoaderManual) {
        if (document.readyState === 'complete') {
            hide();
        } else {
            window.addEventListener('load', hide);
        }
    }

    // Fallback máximo: 8s por si algo falla
    setTimeout(hide, MAX_MS);

    // API para páginas con carga async pesada (ej: mapa, Firebase)
    window.cyHideLoader = hide;
}());
