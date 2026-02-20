# REGLAS DE DESARROLLO - CHAMBAPP

**Documento de Estándares y Buenas Prácticas**
**Versión:** 2.0
**Fecha:** 11 Febrero 2026

---

## FILOSOFÍA DE DESARROLLO

> Desarrollar como un **guru de desarrollo web** y un **guru de UX/UI**: código limpio, performante, accesible y con experiencia de usuario excepcional.

---

## 1. PRINCIPIOS FUNDAMENTALES

### 1.1 Código Limpio
- **DRY (Don't Repeat Yourself):** No duplicar código. Si algo se usa 2+ veces, crear función/clase reutilizable.
- **KISS (Keep It Simple, Stupid):** Soluciones simples sobre complejas.
- **Single Responsibility:** Cada función/archivo tiene UNA responsabilidad.
- **Nombres descriptivos:** Variables y funciones con nombres que expliquen su propósito.

```javascript
// MAL
function proc(d) { ... }
const x = getData();

// BIEN
function procesarPostulacion(datos) { ... }
const ofertasActivas = obtenerOfertasActivas();
```

### 1.2 Organización de Archivos
```
css/
  ├── design-system.css    # Reset *, body, variables, colores, tipografía (FUENTE ÚNICA)
  ├── components.css       # Componentes reutilizables (spinner, skeleton, etc.)
  ├── modal.css            # Modal unificado (12 modales, 7 páginas)
  ├── oferta-detalle.css   # Detalle de oferta compartido
  ├── calificacion-modal.css # Modal de calificación
  ├── header-simple.css    # Header de páginas secundarias (FUENTE ÚNICA)
  ├── bottom-nav.css       # Bottom navigation móvil
  ├── animations.css       # Animaciones y transiciones
  └── [pagina].css         # Estilos específicos de página (SIN duplicar base)

js/
  ├── config/              # Configuración (Firebase, API keys, tours)
  ├── auth/                # Login y registro
  ├── utils/               # Funciones utilitarias compartidas
  │   ├── formatting.js        # Fechas, estrellas, moneda
  │   ├── image-utils.js       # Optimización/validación imágenes
  │   ├── dom-helpers.js       # escapeHtml, crearElemento, etc.
  │   └── calificacion-utils.js # Promedio compartido
  ├── components/          # Componentes JS reutilizables
  │   ├── oferta-card.js       # Card de oferta (3 variantes)
  │   ├── oferta-detalle.js    # Detalle compartido (3 páginas)
  │   ├── rating-input.js      # Input de calificación con estrellas
  │   ├── guided-tour.js       # Motor de guided tours
  │   └── filtros-avanzados/   # 6 módulos de filtros
  └── [pagina]/            # Módulos por página (index.js = orquestador)
      ├── dashboard/           # 6 módulos
      ├── publicar-oferta/     # 6 módulos
      ├── mis-aplicaciones/    # 5 módulos
      ├── mapa-ofertas/        # 5 módulos
      ├── perfil-trabajador/   # 5 módulos
      ├── perfil-publico/      # 2 módulos (read-only para empleadores)
      └── mis-aplicaciones-trabajador/ # 4 módulos
```

### 1.3 Convenciones de Nombres

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Archivos CSS/JS | kebab-case | `mis-aplicaciones.css` |
| Clases CSS | kebab-case | `.stat-card-link` |
| IDs HTML | kebab-case | `#loading-screen` |
| Variables JS | camelCase | `ofertasActivas` |
| Funciones JS | camelCase | `cargarOfertas()` |
| Constantes JS | UPPER_SNAKE | `MAX_RESULTADOS` |

---

## 2. ESTÁNDARES CSS

### 2.1 Uso Obligatorio de Variables
```css
/* SIEMPRE usar variables del design-system */
.boton {
    background: var(--primary);        /* BIEN */
    color: var(--white);               /* BIEN */
    border-radius: var(--radius-md);   /* BIEN */
    padding: var(--space-md);          /* BIEN */
}

/* NUNCA valores hardcodeados */
.boton {
    background: #0066FF;    /* MAL - usar var(--primary) */
    padding: 16px;          /* MAL - usar var(--space-md) */
}
```

### 2.2 No Estilos Inline
```html
<!-- MAL -->
<div style="padding: 1rem; background: white;">

<!-- BIEN -->
<div class="card">
```

### 2.3 No Duplicar Estilos
- Antes de crear un estilo, verificar si ya existe en:
  1. `design-system.css`
  2. `components.css`
  3. Archivo CSS de la página

### 2.4 Arquitectura CSS: Fuente Única de Verdad

> **Lección aprendida (03/02/26):** Se duplicaron resets `*`, variables `:root` y `body` en 9 CSS individuales, causando que algunas páginas usaran Inter y otras fuentes del sistema. Los headers se veían diferentes entre páginas.

**Reglas obligatorias:**

1. **`design-system.css` es la ÚNICA fuente de estilos base:**
   - Reset `* { margin: 0; padding: 0; box-sizing: border-box; }`
   - `body { font-family, background, color, min-height }`
   - Variables `:root` globales (colores, tipografía, espaciado, sombras)

2. **Los CSS de página NUNCA deben definir:**
   - Reset `*` (ya está en design-system.css)
   - `body { font-family }` (ya está en design-system.css)
   - Variables `:root` que ya existen en design-system.css (ej: `--primary`, `--dark`, `--light`)

3. **Los CSS de página SÍ pueden definir:**
   - Variables `:root` nuevas exclusivas de esa página (ej: `--whatsapp`, `--completado`)
   - Overrides de variables con valores diferentes para esa página (ej: dashboard usa `--light: #f7fafc`)
   - Override de `body` solo para propiedades específicas (ej: `publicar-oferta.css` define `body { background: linear-gradient(...) }`)
   - Estilos de componentes propios de la página

4. **Header: usar `header-simple.css` en todas las páginas secundarias:**
   - NUNCA definir `.header`, `.header-content`, `.logo`, `.logo-img`, `.btn-volver` en CSS de página
   - Si se necesita un override (ej: `max-width` diferente), solo definir esa propiedad

```css
/* ✅ BIEN - CSS de página */
:root {
    --whatsapp: #25D366;    /* Variable nueva, exclusiva de esta página */
}

/* ✅ BIEN - Override específico */
.header-content {
    max-width: 900px;       /* Solo sobreescribe max-width */
}

/* ❌ MAL - Duplica lo que ya está en design-system.css */
* { margin: 0; padding: 0; box-sizing: border-box; }
:root { --primary: #0066FF; --dark: #1e293b; }
body { font-family: 'Inter', sans-serif; background: var(--light); }
```

### 2.5 Organización de CSS
```css
/* Orden de propiedades */
.elemento {
    /* 1. Posicionamiento */
    position: relative;
    top: 0;
    z-index: 1;

    /* 2. Box Model */
    display: flex;
    width: 100%;
    padding: var(--space-md);
    margin: 0;

    /* 3. Tipografía */
    font-size: var(--text-base);
    color: var(--gray-900);

    /* 4. Visual */
    background: var(--white);
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-md);

    /* 5. Animaciones */
    transition: all var(--transition-base);
}
```

---

## 3. ESTÁNDARES JAVASCRIPT

### 3.1 Modularización
- Archivos JS no deben exceder **500 líneas**
- Si excede, dividir en módulos por responsabilidad
- Cada carpeta de página tiene un `index.js` que actúa como orquestador

```javascript
// js/dashboard/index.js (orquestador)
import { initEmpleador } from './empleador.js';
import { initTrabajador } from './trabajador.js';
import { initModalDetalle } from './modal-detalle.js';
import { initGeolocation } from './geolocation.js';
```

### 3.2 Funciones Pequeñas
- Máximo **30 líneas** por función
- Si es más larga, dividir en funciones auxiliares

### 3.3 Manejo de Errores
```javascript
// SIEMPRE manejar errores
try {
    const datos = await obtenerDatos();
    procesarDatos(datos);
} catch (error) {
    console.error('Error al obtener datos:', error);
    mostrarMensajeError('No se pudieron cargar los datos. Intenta nuevamente.');
}
```

### 3.4 Comentarios Útiles
```javascript
// MAL - comentario obvio
// Incrementar contador
contador++;

// BIEN - explica el POR QUÉ
// Incrementar después de validar para evitar contar intentos fallidos
contador++;
```

### 3.5 Patrones de Modularización

> **Establecidos durante la refactorización JS (Feb 2026).** 7 archivos → 41 módulos.

#### Shared State
Objeto `state` compartido entre módulos de una misma página. El `index.js` lo crea y lo pasa a cada módulo.
```javascript
// index.js
const state = { ofertas: [], usuario: null, filtros: {} };
initCards(state);
initFiltros(state);
```

#### Callback Injection
Para comunicación entre módulos sin imports circulares. El orquestador inyecta callbacks.
```javascript
// index.js
initAcciones(state, { recargarUI: () => cargarDatos(state) });
```

#### Entry Points Legacy
Los archivos originales (`js/dashboard.js`, `js/mapa-ofertas.js`, etc.) se conservan como redirects al nuevo `index.js` modular, para no romper `<script src>` existentes.

#### Template Extraction
Templates HTML grandes (>15 líneas) se extraen a funciones separadas para mantener la lógica legible.

---

## 4. PRINCIPIOS UX/UI

### 4.1 Consistencia Visual
- **Un solo archivo** para cada tipo de componente
- **Mismos estilos** para elementos similares en toda la app
- **Mismo comportamiento** para interacciones similares

### 4.2 Feedback al Usuario
| Acción | Feedback Requerido |
|--------|-------------------|
| Click en botón | Efecto visual (scale, color) |
| Carga de datos | Spinner + mensaje contextual |
| Éxito | Toast verde + mensaje claro |
| Error | Toast rojo + mensaje útil |
| Formulario inválido | Borde rojo + mensaje específico |

### 4.3 Loading States
```html
<!-- Estándar: Spinner centrado con mensaje -->
<div class="loading-state">
    <div class="spinner"></div>
    <p>Cargando [contexto]...</p>
</div>
```

### 4.4 Empty States
```html
<!-- Estándar: Icono + título + descripción + CTA -->
<div class="empty-state">
    <div class="empty-icon">[emoji]</div>
    <h3>Sin [elementos]</h3>
    <p>[Descripción y guía de acción]</p>
    <a href="[accion]" class="btn btn-primary">[CTA]</a>
</div>
```

### 4.5 Tono de Voz
- **Neutro y formal** (no coloquial)
- **Claro y directo**
- **Sin jerga** ("chamba" → "oferta")
- **Mensajes útiles** que guíen al usuario

---

## 5. ACCESIBILIDAD (WCAG 2.1 AA)

### 5.1 Obligatorio
- [ ] Contraste mínimo 4.5:1 para texto
- [ ] Touch targets mínimo 44x44px
- [ ] Labels en todos los inputs
- [ ] Alt text en todas las imágenes
- [ ] Focus visible en elementos interactivos
- [ ] Soporte para `prefers-reduced-motion`

### 5.2 Estructura HTML
```html
<!-- Jerarquía correcta de headings -->
<h1>Título de página</h1>
  <h2>Sección</h2>
    <h3>Subsección</h3>

<!-- Labels asociados -->
<label for="email">Correo electrónico</label>
<input type="email" id="email" name="email">

<!-- Botones con texto descriptivo -->
<button aria-label="Cerrar modal">×</button>
```

---

## 6. PERFORMANCE

### 6.1 Objetivos Lighthouse
| Métrica | Mínimo | Ideal |
|---------|--------|-------|
| Performance | 80 | 90+ |
| Accessibility | 90 | 100 |
| Best Practices | 90 | 100 |
| SEO | 90 | 100 |

### 6.2 Optimizaciones
- Imágenes optimizadas (WebP cuando sea posible)
- CSS crítico inline o precargado
- JavaScript defer/async cuando corresponda
- Lazy loading para imágenes below-the-fold

---

## 7. SEGURIDAD

### 7.1 Reglas Básicas
- **NUNCA** exponer API keys en código cliente
- **SIEMPRE** validar inputs en cliente Y servidor
- **NUNCA** confiar en datos del usuario sin sanitizar
- **SIEMPRE** usar HTTPS

### 7.2 Firebase Security Rules
- Validar permisos en Firestore rules
- No permitir lectura/escritura pública

---

## 8. CONTROL DE VERSIONES

### 8.1 Commits
```
tipo: descripción corta

- Detalle 1
- Detalle 2

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Tipos:**
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `refactor:` Refactorización sin cambio funcional
- `style:` Cambios de formato/estilo
- `docs:` Documentación
- `perf:` Mejoras de performance

### 8.2 Antes de Commit
- [ ] Código funciona correctamente
- [ ] No hay console.log de debug
- [ ] No hay código comentado innecesario
- [ ] Estilos en archivos CSS (no inline)
- [ ] Sin duplicación de código

---

## 9. CHECKLIST PRE-DEPLOY

### 9.1 Funcionalidad
- [ ] Feature funciona en desktop y móvil
- [ ] No hay errores en consola
- [ ] Loading states funcionan
- [ ] Empty states funcionan
- [ ] Errores se manejan correctamente

### 9.2 Código
- [ ] No hay código duplicado
- [ ] No hay estilos inline
- [ ] Variables CSS utilizadas
- [ ] JavaScript sin errores

### 9.3 UX/UI
- [ ] Consistencia visual con el resto de la app
- [ ] Feedback en todas las interacciones
- [ ] Mensajes claros y útiles
- [ ] Accesible (contraste, touch targets, labels)

### 9.4 Performance
- [ ] Lighthouse Performance > 80
- [ ] Sin recursos bloqueantes innecesarios

---

## 10. DEUDA TÉCNICA CONOCIDA

> Actualizar esta sección cuando se identifique deuda técnica.

### 10.1 Pendiente

| Fecha | Archivo | Problema | Prioridad |
|-------|---------|----------|-----------|
| 30/01/26 | General | Meta tags SEO/OG faltantes | Media |
| 30/01/26 | 20 archivos CSS | 413 colores hex + 733 valores px hardcodeados (deberían ser variables CSS) | Baja - aplicar gradualmente |

### 10.2 Historial Resuelto

<details>
<summary>Ver 14 items resueltos (Ene-Feb 2026)</summary>

| Fecha | Problema | Resolución |
|-------|----------|------------|
| 30/01/26 | CSS duplicado (spinner, skeleton) | Centralizado en components.css |
| 30/01/26 | Estilos inline en HTML | Movidos a archivos CSS |
| 30/01/26 | Console.logs de debug | Eliminados de 6 archivos |
| 31/01/26 | Lighthouse bajo | Performance 85, A11y 92, SEO 100 |
| 03/02/26 | Reset/body duplicado en 9 CSS | Centralizado en design-system.css |
| 03/02/26 | CSS inline en login/register | Externalizado a login.css y register.css |
| 03/02/26 | Bordes prematuros input:valid | Anulado en login.css y register.css |
| 04/02/26 | Guided tours rotos | Motor centralizado guided-tour.js + tours.js |
| 04/02/26 | 7 archivos JS >500 líneas | 41 módulos, todos <500 líneas |
| 04/02/26 | 15 patrones de código duplicado | Creados formatting.js, image-utils.js, dom-helpers.js, oferta-card.js, rating-input.js |
| 04/02/26 | 31 funciones >30 líneas | Todas corregidas en Fases 3-9 |
| 04/02/26 | Console.logs restantes | Eliminados (Fase 0) |
| 10/02/26 | Modal CSS duplicado ~740 líneas | Unificado en css/modal.css |
| 10/02/26 | UX mis-aplicaciones-trabajador | Hero compacto, stats pills, CSS 855→522 líneas |
| 19/02/26 | UX Ver Candidatos (empleador) | Banner urgencia, collapsed rechazados, botones WhatsApp/Completado, sort por pendientes |
| 19/02/26 | UX Perfil Empleador | CSS extraído, barra completitud, bio, stats, logout al fondo, flotante guardar |
| 19/02/26 | iOS safe-area modales/headers | `max(Xrem, env(...))` correcto; fix WebKit hero bug con `:has()`; revertir cambios en CSS que funcionaban |
| 19/02/26 | Android text overflow | `flex-shrink:0` en pills scroll; abreviar labels stats (Completadas→Complet.) |

</details>

---

## 11. TESTING

### 11.1 Checklist de Pruebas Manuales
Antes de cada deploy, verificar en dispositivo real o emulador:

**Flujos críticos:**
- [ ] Registro nuevo usuario (trabajador y empleador)
- [ ] Login/Logout
- [ ] Publicar oferta (empleador)
- [ ] Postular a oferta (trabajador)
- [ ] Aceptar/Rechazar postulación
- [ ] Contacto WhatsApp funciona
- [ ] Calificaciones se guardan

**Dispositivos:**
- [ ] Chrome Android
- [ ] Safari iOS
- [ ] Chrome Desktop
- [ ] Firefox Desktop

### 11.2 Pruebas de Regresión
Después de cambios importantes, verificar que features existentes no se rompieron.

---

## 12. MANEJO DE ERRORES Y FALLBACKS

### 12.1 Estrategia de Errores
```javascript
// SIEMPRE mostrar feedback al usuario
try {
    const resultado = await operacionRiesgosa();
    toastSuccess('Operación exitosa');
} catch (error) {
    console.error('Contexto del error:', error);
    toastError('Mensaje amigable para el usuario');
}
```

### 12.2 Fallbacks Requeridos
| Servicio | Fallback |
|----------|----------|
| Firebase Auth | Mostrar pantalla de error + botón reintentar |
| Firestore | Mostrar datos en caché si existen |
| Google Maps | Mostrar mensaje "Mapa no disponible" + dirección en texto |
| Storage (fotos) | Mostrar avatar/imagen placeholder |
| FCM (notificaciones) | App funciona sin notificaciones |

### 12.3 Mensajes de Error
- **Ser específico:** "No se pudo guardar la foto" vs "Error"
- **Dar solución:** "Verifica tu conexión e intenta de nuevo"
- **No mostrar errores técnicos** al usuario (solo en console.error)

---

## 13. MANEJO DE ESTADO

### 13.1 Dónde Guardar Datos
| Tipo de dato | Dónde | Ejemplo |
|--------------|-------|---------|
| Sesión usuario | localStorage | `usuarioChambApp` |
| Preferencias UI | localStorage | `chambapp-tema`, `chambapp-filtros` |
| Datos temporales | sessionStorage | `ofertaEnEdicion` |
| Datos persistentes | Firestore | perfiles, ofertas, aplicaciones |
| Caché de consultas | Variable JS | `todasLasOfertas` |

### 13.2 Convenciones de Keys
```javascript
// localStorage keys nuevas - usar prefijo chambapp-
localStorage.setItem('chambapp-tema', 'dark');
localStorage.setItem('chambapp-onboarding-completed', 'true');
localStorage.setItem('chambapp-filtros', JSON.stringify(filtros));

// Key legacy (mantener por compatibilidad, no crear nuevas con este formato)
localStorage.getItem('usuarioChambApp'); // ← formato antiguo, NO usar para keys nuevas
```

### 13.3 Sincronización
- Al iniciar sesión: cargar datos de Firestore → localStorage
- Al cerrar sesión: limpiar localStorage
- Cambios importantes: guardar en Firestore inmediatamente

---

## 14. PWA Y OFFLINE

### 14.1 Service Worker
- `firebase-messaging-sw.js` maneja notificaciones push
- Caché de assets estáticos (CSS, JS, imágenes)

### 14.2 Qué Funciona Offline
| Feature | Offline | Notas |
|---------|---------|-------|
| Ver ofertas cargadas | ✅ | Si ya se cargaron |
| Publicar oferta | ❌ | Requiere conexión |
| Postular | ❌ | Requiere conexión |
| Ver perfil propio | ✅ | Desde localStorage |
| Editar perfil | ❌ | Requiere conexión |

### 14.3 Detectar Conexión
```javascript
// Verificar estado de conexión
if (!navigator.onLine) {
    toastWarning('Sin conexión. Algunas funciones no disponibles.');
}

// Escuchar cambios
window.addEventListener('online', () => toastSuccess('Conexión restaurada'));
window.addEventListener('offline', () => toastWarning('Sin conexión'));
```

---

## 15. IMÁGENES Y ASSETS

### 15.1 Formatos y Tamaños
| Tipo | Formato | Tamaño máximo | Dimensiones |
|------|---------|---------------|-------------|
| Foto perfil | JPEG | 500KB optimizado | 800x800px |
| Portfolio | JPEG | 500KB optimizado | 1920x1920px |
| Logo | PNG | - | SVG preferido |
| Iconos PWA | PNG | - | Múltiples tamaños |

### 15.2 Optimización Automática
```javascript
// Ya implementado en perfil-trabajador.js y perfil-empleador.js
const optimizedBlob = await optimizarImagen(file, maxWidth, maxHeight, quality);
```

### 15.3 Lazy Loading
```html
<!-- Imágenes below-the-fold -->
<img src="foto.jpg" alt="Descripción" loading="lazy">
```

---

## 16. SEO Y COMPARTIR

### 16.1 Meta Tags Requeridos
```html
<head>
    <title>ChambaYa - Encuentra trabajo en Perú</title>
    <meta name="description" content="Marketplace de trabajos temporales...">

    <!-- Open Graph (Facebook, WhatsApp) -->
    <meta property="og:title" content="ChambaYa">
    <meta property="og:description" content="Encuentra chambas cerca de ti">
    <meta property="og:image" content="/assets/logo/og-image.png">
    <meta property="og:url" content="https://chambapp-7785b.web.app">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
</head>
```

### 16.2 URLs Amigables
- Usar IDs cortos cuando sea posible
- Evitar parámetros innecesarios en URLs públicas

---

## 17. ANALYTICS Y MONITOREO

### 17.1 Eventos a Trackear
| Evento | Cuándo | Datos |
|--------|--------|-------|
| `registro_completado` | Usuario completa registro | tipo (trabajador/empleador) |
| `oferta_publicada` | Empleador publica oferta | categoría |
| `postulacion_enviada` | Trabajador postula | categoría oferta |
| `postulacion_aceptada` | Empleador acepta | - |
| `contacto_whatsapp` | Click en botón WhatsApp | contexto |
| `calificacion_enviada` | Usuario califica | estrellas |

### 17.2 Implementación (Firebase Analytics)
```javascript
// Ejemplo de evento
firebase.analytics().logEvent('postulacion_enviada', {
    categoria: 'construccion',
    ubicacion: 'Lima'
});
```

### 17.3 Monitoreo de Errores
- Errores críticos → console.error + considerar Firebase Crashlytics
- Revisar Firebase Console periódicamente

---

## 18. VERSIONADO

### 18.1 Semantic Versioning
```
MAJOR.MINOR.PATCH

v1.0.0 - Primera versión estable
v1.1.0 - Nueva feature (filtros avanzados)
v1.1.1 - Bugfix (corrección menor)
v2.0.0 - Cambio breaking (nuevo modelo de datos)
```

### 18.2 Dónde Documentar Versión
- `package.json` → campo "version"
- `manifest.json` → referencia
- Tag en Git → `git tag v1.0.0`

### 18.3 Changelog
Mantener registro de cambios importantes en `docs/CHANGELOG.md` (crear cuando sea necesario).

---

## 19. RATE LIMITING Y SPAM

### 19.1 Protecciones Cliente
```javascript
// Debounce en búsquedas
let debounceTimer;
input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => buscar(), 300);
});

// Deshabilitar botón después de click
btn.disabled = true;
await enviarFormulario();
btn.disabled = false;
```

### 19.2 Protecciones Firebase
- Firestore Rules: limitar escrituras por usuario
- Cloud Functions: rate limiting en endpoints sensibles

### 19.3 Límites de Negocio (Planificado - Fase 2)

> **Nota:** Estos límites aún NO están implementados. Se implementarán con el sistema freemium en Fase 2. Actualmente todo es ilimitado.

| Acción | Límite Free | Límite Premium |
|--------|-------------|----------------|
| Postulaciones/mes | 5 | Ilimitado |
| Mensajes/día | 10 | Ilimitado |
| Ofertas activas | 3 | 10 |

---

**Última actualización:** 19 Febrero 2026
**Próxima revisión:** Al iniciar Fase 2 (Diferenciación)
