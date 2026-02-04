# Plan GT1: Centralizar Sistema de Guided Tours

**Fecha:** 03 Febrero 2026
**Estado:** ✅ Completado (04 Febrero 2026)
**Prioridad:** Alta

---

## Problema

ChambApp tiene **4 archivos JS de onboarding separados** con ~1150 líneas totales, usando Intro.js v7. El código tiene:
- **Duplicación masiva**: cada archivo repite las mismas funciones de bottom nav, scroll blocking, localStorage, step validation
- **Selectores rotos**: `dashboard-content` no existe (debería ser `dashboard-trabajador`/`dashboard-empleador`), `.filtros-container` no existe (debería ser `#filtros-avanzados-container`)
- **Tour del dashboard nunca arranca**: la inicialización en `dashboard.html:370` busca `#dashboard-content` que no existe, así que `iniciarOnboarding()` nunca se ejecuta

### Archivos actuales (a reemplazar)

| Archivo | Líneas | Página | localStorage key |
|---------|--------|--------|-----------------|
| `js/onboarding.js` | 722 | dashboard.html | `chambapp-onboarding-completed` + `chambapp-onboarding-remind-later` |
| `js/onboarding-publicar.js` | 145 | publicar-oferta.html | `chambapp-onboarding-publicar` |
| `js/onboarding-aplicaciones-empleador.js` | 134 | mis-aplicaciones.html | `chambapp-onboarding-aplicaciones` |
| `js/onboarding-aplicaciones-trabajador.js` | 147 | mis-aplicaciones-trabajador.html | `chambapp-onboarding-aplicaciones-trabajador` |

### Lo que se mantiene (ya funciona bien)
- `css/introjs-custom.css` — styling completo con dark mode, iOS safe areas, accesibilidad, responsive, animaciones
- Intro.js v7 desde CDN (`cdn.jsdelivr.net/npm/intro.js@7`)

---

## Arquitectura nueva

```
js/components/guided-tour.js   → Motor centralizado (IIFE → window.GuidedTour)
js/config/tours.js              → Definiciones de tours (datos + selectores)
css/introjs-custom.css          → Sin cambios (ya existente)
```

---

## Paso 1: Crear `js/components/guided-tour.js`

**Patrón**: IIFE idéntico a `bottom-nav.js` → exporta `window.GuidedTour`

**API pública**:
```javascript
window.GuidedTour = {
    registerTour(tourId, config),  // Registrar definición de tour
    start(tourId, options),        // Iniciar tour (options.force para ignorar localStorage)
    isCompleted(tourId),           // Verificar si ya completó
    reset(tourId),                 // Borrar estado de un tour
    resetAll(),                    // Borrar todos los estados
    _helpers: { isMobile, getUserRole, waitForElement }  // Para uso en tours.js
};
```

**Funcionalidad centralizada** (extraída de los 4 archivos):

1. **iOS scroll blocking** (`lockScroll`/`unlockScroll`):
   - `body.style.position = 'fixed'` + guardar/restaurar scroll position
   - Fuente: `onboarding.js:37-60`

2. **Bottom nav management** (`hideBottomNav`/`showBottomNav`):
   - `translateY(100%)` + `pointerEvents: none` + clase `onboarding-activo`
   - Fuente: `onboarding.js:65-81` (duplicado en los otros 3 archivos)

3. **localStorage management**:
   - `getStorageKey(tourId)` con mapa de compatibilidad legacy
   - `isCompleted(tourId)`, `markCompleted(tourId)`
   - `isRemindedLater(tourId)`, `remindLater(tourId)` (24h snooze)
   - Claves legacy preservadas para que usuarios existentes no re-vean tours

4. **Step validation** (`validateSteps`):
   - Filtrar pasos cuyo `element` no existe o no es visible
   - Soporte para `showOn: 'mobile'|'desktop'` y `showForRole: 'trabajador'|'empleador'`
   - Pasos sin `element` (welcome/completion screens) siempre pasan
   - Fuente: `onboarding.js:631-657`

5. **waitForElement(selector, callback, maxWait)**:
   - Poll cada 100ms hasta encontrar elemento visible o timeout (5s)
   - Necesario para dashboard (vistas se muestran dinámicamente)

6. **Tour runner simple** (`_runSingleTour`):
   - Para publicar, aplicaciones-empleador, aplicaciones-trabajador
   - Crea instancia introJs(), configura steps validados, bind oncomplete/onexit

7. **Tour runner multi-secuencia** (`_runSequences`):
   - Para dashboard (bienvenida → menú mobile → contenido dashboard)
   - Cada secuencia tiene: `steps[]`, `beforeStart()`, `afterComplete()`, `doneLabel`
   - `onexit` en cualquier secuencia → cleanup + remind later

8. **Cleanup** (`_cleanup`):
   - Restaurar bottom nav, unlock scroll
   - Marcar completado o remind-later según razón de salida
   - Ejecutar toast de completación si existe

---

## Paso 2: Crear `js/config/tours.js`

Script regular que llama `GuidedTour.registerTour()` para cada tour. Solo datos, sin lógica compleja.

### Tour: `dashboard`
- `waitFor`: `#dashboard-trabajador` o `#dashboard-empleador` según rol (FIX del bug principal)
- Usa `sequences` (multi-secuencia) según rol y dispositivo
- **Selectores corregidos**:
  - ~~`#dashboard-content`~~ → se usa `waitFor` con la vista correcta
  - ~~`.filtros-container`~~ → `#filtros-avanzados-container`
  - `.stats-grid`, `#menu-toggle`, `#nav-buscar`, `#nav-publicar`, `#nav-trabajadores` → OK, existen
  - `.oferta-card` → OK (dinámico, ya tiene null-check)

### Tour: `publicar`
- Steps directos (no secuencias)
- Selectores: `.progress-container`, `#titulo`, `#categoria`, `#descripcion`, `#btnNext` → todos OK

### Tour: `aplicaciones-empleador`
- Steps directos
- Selectores: `#stats`, `#aplicaciones-container` → OK

### Tour: `aplicaciones-trabajador`
- Steps directos
- Selectores: `.stats-grid`, `.filters-container`, `#aplicaciones-container` → OK

---

## Paso 3: Actualizar `dashboard.html`

**En `<head>` (líneas 37-64)**: Mantener carga condicional de Intro.js CDN, mismo patrón actual.

**En `<body>` scripts (líneas 359, 367-381)**: Reemplazar:
```html
<!-- ANTES -->
<script src="js/onboarding.js"></script>
...
<script>
    window.addEventListener('load', () => {
        const checkLoaded = setInterval(() => {
            const content = document.getElementById('dashboard-content'); // ← NO EXISTE
            ...
        });
    });
</script>

<!-- DESPUÉS -->
<script src="js/components/guided-tour.js"></script>
<script src="js/config/tours.js"></script>
<script>
    window.addEventListener('load', function() {
        if (typeof GuidedTour === 'undefined') return;
        var role = GuidedTour._helpers.getUserRole();
        var viewId = role === 'trabajador' ? 'dashboard-trabajador' : 'dashboard-empleador';
        GuidedTour._helpers.waitForElement('#' + viewId, function(visible) {
            if (visible) GuidedTour.start('dashboard');
        });
    });
</script>
```

---

## Paso 4: Actualizar `publicar-oferta.html`

**En `<head>` (líneas 35-36)**: Cambiar CSS always-loaded a carga condicional:
```html
<!-- ANTES: siempre carga -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/intro.js@7/minified/introjs.min.css">
<link rel="stylesheet" href="css/introjs-custom.css">

<!-- DESPUÉS: condicional -->
<script>
    (function() {
        if (localStorage.getItem('chambapp-onboarding-publicar') !== 'true') {
            var c1 = document.createElement('link'); c1.rel='stylesheet';
            c1.href='https://cdn.jsdelivr.net/npm/intro.js@7/minified/introjs.min.css';
            document.head.appendChild(c1);
            var c2 = document.createElement('link'); c2.rel='stylesheet';
            c2.href='css/introjs-custom.css';
            document.head.appendChild(c2);
        }
    })();
</script>
```

**En scripts (líneas 509-519)**: Reemplazar:
```html
<!-- ANTES -->
<script src="https://cdn.jsdelivr.net/npm/intro.js@7/intro.min.js"></script>
<script src="js/onboarding-publicar.js"></script>
<script>...</script>

<!-- DESPUÉS -->
<script>
    if (localStorage.getItem('chambapp-onboarding-publicar') !== 'true') {
        document.write('<script src="https://cdn.jsdelivr.net/npm/intro.js@7/intro.min.js"><\/script>');
    }
</script>
<script src="js/components/guided-tour.js"></script>
<script src="js/config/tours.js"></script>
<script>
    window.addEventListener('load', function() {
        setTimeout(function() {
            if (typeof GuidedTour !== 'undefined') GuidedTour.start('publicar');
        }, 1000);
    });
</script>
```

---

## Paso 5: Actualizar `mis-aplicaciones.html`

**En `<head>` (líneas 35-36)**: Carga condicional con key `chambapp-onboarding-aplicaciones`

**En scripts (líneas 215-225)**: Reemplazar 3 tags con:
```html
<script>
    if (localStorage.getItem('chambapp-onboarding-aplicaciones') !== 'true') {
        document.write('<script src="https://cdn.jsdelivr.net/npm/intro.js@7/intro.min.js"><\/script>');
    }
</script>
<script src="js/components/guided-tour.js"></script>
<script src="js/config/tours.js"></script>
<script>
    window.addEventListener('load', function() {
        setTimeout(function() {
            if (typeof GuidedTour !== 'undefined') GuidedTour.start('aplicaciones-empleador');
        }, 1500);
    });
</script>
```

---

## Paso 6: Actualizar `mis-aplicaciones-trabajador.html`

Mismo patrón que Paso 5 con key `chambapp-onboarding-aplicaciones-trabajador` y `GuidedTour.start('aplicaciones-trabajador')`.

---

## Paso 7: Eliminar archivos obsoletos

```
ELIMINAR:
  js/onboarding.js
  js/onboarding-publicar.js
  js/onboarding-aplicaciones-empleador.js
  js/onboarding-aplicaciones-trabajador.js
```

---

## Paso 8: Verificación

1. Borrar localStorage en el navegador (`GuidedTour.resetAll()` desde consola)
2. **Dashboard**: Verificar que el tour arranca (el bug `#dashboard-content` queda resuelto)
   - Probar con usuario trabajador: secuencia bienvenida → menú/nav → ofertas/filtros → listo
   - Probar con usuario empleador: secuencia bienvenida → publicar/nav → ofertas → listo
   - Probar "Saltar" → verificar que remind-later funciona (no re-muestra hasta 24h)
   - Probar en mobile (< 768px) y desktop
3. **Publicar oferta**: Verificar 7 pasos del tour con selectores correctos
4. **Mis aplicaciones (empleador)**: Verificar tour con #stats y #aplicaciones-container
5. **Mis aplicaciones (trabajador)**: Verificar tour con .stats-grid, .filters-container
6. Verificar que `GuidedTour.reset('dashboard')` desde consola permite re-ver el tour
7. Verificar que la carga condicional de Intro.js CDN funciona (no se carga si tour ya completado)

---

## Archivos a modificar/crear

| Archivo | Acción |
|---------|--------|
| `js/components/guided-tour.js` | **CREAR** — Motor centralizado (~200 líneas) |
| `js/config/tours.js` | **CREAR** — Definiciones de 4 tours (~250 líneas) |
| `dashboard.html` | Reemplazar scripts de onboarding (líneas 359, 367-381) |
| `publicar-oferta.html` | Reemplazar CSS head (35-36) + scripts (509-519) |
| `mis-aplicaciones.html` | Reemplazar CSS head (35-36) + scripts (215-225) |
| `mis-aplicaciones-trabajador.html` | Reemplazar CSS head (37-38) + scripts (249-259) |
| `js/onboarding.js` | **ELIMINAR** |
| `js/onboarding-publicar.js` | **ELIMINAR** |
| `js/onboarding-aplicaciones-empleador.js` | **ELIMINAR** |
| `js/onboarding-aplicaciones-trabajador.js` | **ELIMINAR** |

---

## Resultado final

- **4 archivos eliminados → 2 archivos nuevos** (guided-tour.js ~420 líneas + tours.js ~258 líneas)
- **1,297 líneas eliminadas, 899 líneas agregadas** (neto: -398 líneas)
- **Bug `#dashboard-content` resuelto** — tour del dashboard vuelve a funcionar
- **Selector `.filtros-container` corregido** → `#filtros-avanzados-container`
- **Texto "Ver Aplicantes" corregido** → "Ver Candidatos"
- **Carga condicional en las 4 páginas** — Intro.js no se descarga si tours ya completados
- **Compatibilidad total** — mismas localStorage keys, mismos tours, misma experiencia
- **Fácil agregar nuevos tours** — solo agregar `GuidedTour.registerTour('nuevo-id', {...})` en tours.js

### Fixes adicionales (durante testing visual)
- Bottom nav visible durante tour → flag `transitioning` + enforcer interval cada 200ms
- Step counter desaparecía entre pasos → `title` nativo en cada step (no más `onafterchange`)
- Tooltip perdido en containers altos → `scrollTo: 'tooltip'` global
- Scroll to top antes de iniciar cualquier tour
- CSS: botones compactos, skip como text link, border-radius consistente top/bottom, prev oculto cuando disabled
