# Plan de Implementación — Mejoras Visuales ChambaYa

**Creado:** 03 Marzo 2026 (sesión 30)
**Branch:** `feature/mejoras-visuales`
**Referencia de diseño:** `docs/PLAN_MEJORAS_VISUALES.md` + mockups en `docs/archivo/`

---

## ORDEN DE EJECUCIÓN

```
1. MV-7  ✅ Variables de estado en design-system.css     (537b0fc)
2. MV-1  ✅ Fix ícono distancia                          (a58857d)
3. MV-2  ✅ Avatares suaves                              (3dc8e5e)
4. MV-3  ✅ Stat Pendientes destacada                    (b5b2078)
5. MV-6  ✅ Unificar sombras                             (9d1382e)
6. MV-5  ✅ Unificar border-radius                       (c2589ae)
7. MV-4  ✅ Emojis → SVG                                 (7ba6ef5)
8. MV-8  ✅ Logo two-tone                                (2e25e40)
9. MV-16 ✅ Reportar modal al design system              (9f4f3ff)
10. MV-9 ✅ Empty states SVG                             (pendiente commit)
── Pre-stores ──
11. MV-10 → Splash screen nativo                        (diseño, no código)
12. MV-11 → Iconos de app para stores                   (diseño)
13. MV-12 → Screenshots Android                         (diseño)
14. MV-13 → Screenshots iOS                             (diseño)
15. MV-14 → Feature graphic Play Store                  (diseño)
```

Un commit por tarea MV. Mensaje: `style(MV-N): descripción corta`

---

## REGLAS TRANSVERSALES

1. **Cache bust:** Bumpar `?v=N` en cada CSS/JS tocado (el SW cachea agresivamente)
2. **Variables CSS:** Agregar SOLO en `design-system.css`, nunca inline ni en archivos locales
3. **Commits atómicos:** Un commit por tarea MV, sin mezclar
4. **Verificar:** Chrome DevTools mobile (iPhone 12) + Firefox antes de cerrar tarea
5. **Máximos:** 500 líneas/archivo, 30 líneas/función
6. **Seguridad:** `escapeHtml()` para datos de usuario en templates

---

## MV-7 — Variables de Estado en design-system.css

**Prioridad:** 🔴 Foundation — debe hacerse primero, todo lo demás depende de esto.

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `css/design-system.css` | Agregar variables de estado, redefinir `--shadow-card`, agregar radius nuevos |
| 11+ HTML files | Agregar `?v=1` a la referencia de `design-system.css` |

### Variables a agregar

Insertar después de la sección `--completado-dark` (línea ~54), antes de la escala de grises:

```css
/* ============================================
   ESTADOS DE APLICACIÓN
   ============================================ */
--state-pending:       #FF6B00;
--state-pending-bg:    #FFF3ED;
--state-accepted:      #00C48C;
--state-accepted-bg:   #EDFAF3;
--state-rejected:      #718096;
--state-rejected-bg:   #F7FAFC;
--state-completed:     #9B59B6;
--state-completed-bg:  #F3EEFF;
```

Redefinir en la sección de sombras existente (línea ~192):

```css
/* ANTES */
--shadow-card: var(--shadow-md);

/* DESPUÉS */
--shadow-card: 0 2px 8px rgba(0,0,0,0.08);
```

Agregar después de `--shadow-modal`:

```css
--shadow-btn: 0 4px 14px rgba(0,102,255,0.25);
```

Agregar después de `--radius-full: 9999px` (línea ~179):

```css
/* Border-radius semánticos para cards */
--radius-card:    14px;   /* cards compactas (stats, aplicaciones) */
--radius-card-lg: 16px;   /* cards principales (ofertas, secciones) */
--radius-pill:    20px;   /* pills, badges, filtros */
--radius-btn:     12px;   /* botones */
```

### Notas de diseño

- `--state-pending-bg: #FFF3ED` difiere de `--accent-light: #FFF3E6` intencionalmente (match mockup)
- `--state-rejected: #718096` no está en la escala de grises actual (`--gray-500: #64748b`) — es el gris del mockup
- `--shadow-card` se redefine in-place (ya existe apuntando a `var(--shadow-md)`)
- `--radius-card` y `--radius-card-lg` son nombres NUEVOS, no pisan `--radius-lg`/`--radius-xl`

### Verificación

- Chrome DevTools > Elements > `:root` > filtrar por `--state-` → deben aparecer 8 variables
- Inspeccionar cualquier card con `var(--shadow-card)` → debe resolver a `0 2px 8px rgba(0,0,0,0.08)`

### Riesgos

- `--shadow-card` ya es consumida por `.stat-card` en `dashboard-main.css:438`. Redefinirla cambia esas cards de sombra media → sombra sutil. Efecto deseado.
- `design-system.css` no tiene `?v=N` → agregar `?v=1` en TODOS los HTML que lo referencian

### Commit

```
style(MV-7): add state variables and shadow/radius tokens to design-system
```

---

## MV-1 — Fix Ícono de Distancia

**Prioridad:** 🔴 Alta — rápido, alto impacto.

### Problema

`generarDistanciaBadge()` en `js/components/oferta-card.js:49` usa `📏` (regla) para mostrar distancia. El mockup usaba `🕐` (reloj). Ambos son incorrectos — un ícono de ubicación/pin es lo semánticamente correcto.

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `js/components/oferta-card.js` | Línea 49: reemplazar `📏` por SVG pin en `generarDistanciaBadge()` |
| `css/dashboard-main.css` | Agregar `display: inline-flex; align-items: center; gap: 3px` a `.distancia-badge` |

### Antes / Después — oferta-card.js:49

```js
// ANTES
return `<span class="${claseBase} ${colorClase}">📏 A ${distanciaFormateada} de ti</span>`;

// DESPUÉS
return `<span class="${claseBase} ${colorClase}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> A ${distanciaFormateada} de ti</span>`;
```

### Antes / Después — CSS .distancia-badge

```css
/* AGREGAR a la definición existente de .distancia-badge */
display: inline-flex;
align-items: center;
gap: 3px;
```

### Verificación

- Dashboard trabajador > card de oferta con distancia calculada → badge muestra pin SVG + texto
- El SVG hereda `currentColor` del span → color cambia según `distancia-cerca`/`media`/`lejos`
- Chrome Android emulador: SVG alineado verticalmente con el texto

### Riesgos

- SVG dentro de `<span>` necesita `display: inline-flex` para evitar desalineamiento vertical
- Los atributos SVG usan comillas dobles — funciona dentro de template literals con backticks

### Commit

```
style(MV-1): replace emoji ruler with SVG pin icon in distance badges
```

---

## MV-2 — Avatares de Fondo Suave

**Prioridad:** 🔴 Alta — rápido.

### Problema

`crearAvatarHTML()` en `js/mis-aplicaciones/cards.js:49-57` genera avatares con fondo sólido de color fuerte + texto blanco. Los mockups muestran fondo claro + inicial de color (más suave y profesional).

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `js/mis-aplicaciones/cards.js` | Cambiar paleta de colores en `crearAvatarHTML()` |
| `css/mis-aplicaciones.css` | Actualizar `.aplicacion-avatar` (línea ~1100) + eliminar duplicado (línea ~268) |

### Antes / Después — cards.js

```js
// ANTES
const colores = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2', '#db2777'];
const color = colores[(nombre || '').charCodeAt(0) % colores.length];
return `<div class="aplicacion-avatar" style="--avatar-color:${color}">${iniciales.toUpperCase()}</div>`;

// DESPUÉS
const AVATAR_PALETTES = [
    { bg: '#EBF2FF', text: '#2563EB' },
    { bg: '#ECFDF5', text: '#059669' },
    { bg: '#FFFBEB', text: '#D97706' },
    { bg: '#F3EEFF', text: '#7C3AED' },
    { bg: '#E0F7FA', text: '#0891B2' },
    { bg: '#FDE7F3', text: '#DB2777' },
];
const idx = (nombre || '').charCodeAt(0) % AVATAR_PALETTES.length;
const { bg, text } = AVATAR_PALETTES[idx];
return `<div class="aplicacion-avatar" style="--avatar-bg:${bg};--avatar-text:${text}">${iniciales.toUpperCase()}</div>`;
```

### Antes / Después — CSS mis-aplicaciones.css:~1100

```css
/* ANTES */
color: white;
background: var(--avatar-color, var(--primary));

/* DESPUÉS */
color: var(--avatar-text, var(--primary));
background: var(--avatar-bg, var(--primary-light));
```

### Verificación

- `mis-aplicaciones.html` (empleador) con 2+ candidatos → avatares muestran círculos claros con iniciales de color
- Nombres distintos → colores distintos (determinista por charCode)

### Riesgos

- Hay 2 definiciones de `.aplicacion-avatar` en `mis-aplicaciones.css` (líneas ~268 y ~1100). Eliminar la primera (la segunda gana por cascada).
- `AVATAR_PALETTES` debe ser constante a nivel de módulo, NO dentro de la función

### Commit

```
style(MV-2): change avatars from solid to light-tinted backgrounds
```

---

## MV-3 — Stat "Pendientes" Más Prominente

**Prioridad:** 🟡 Media

### Problema

La stat "Pendientes" es la info más urgente pero visualmente no destaca. El mockup la muestra con número naranja y fondo de ícono naranja.

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `css/mis-aplicaciones.css` | `.stat-card.stat-pendiente` → usar `--state-pending` |
| `css/dashboard-main.css` | `.stat-card.stat-card-urgente .stat-icon` y `.stat-info h3` → naranja |
| `dashboard.html` | Agregar clase `stat-card-urgente` al `<a id="stat-pendientes">` |

### Antes / Después — mis-aplicaciones.css

```css
/* ANTES */
.stat-card.stat-pendiente { border-left-color: var(--warning); }
.stat-card.stat-pendiente .number { color: var(--warning); }

/* DESPUÉS */
.stat-card.stat-pendiente { border-left-color: var(--state-pending); }
.stat-card.stat-pendiente .number { color: var(--state-pending); font-weight: 800; }
```

### Antes / Después — dashboard-main.css

```css
/* AGREGAR (reemplazar el :nth-child(2) que es frágil) */
.stat-card.stat-card-urgente .stat-icon {
    background: var(--state-pending-bg);
    color: var(--state-pending);
}
.stat-card.stat-card-urgente .stat-info h3 {
    color: var(--state-pending);
}
```

### Antes / Después — dashboard.html:232

```html
<!-- ANTES -->
<a href="mis-aplicaciones.html" class="stat-card stat-card-link touchable hover-lift" id="stat-pendientes">

<!-- DESPUÉS -->
<a href="mis-aplicaciones.html" class="stat-card stat-card-link touchable hover-lift stat-card-urgente" id="stat-pendientes">
```

### Verificación

- Dashboard empleador: stat "Pendientes" con número naranja y fondo ícono `#FFF3ED`
- `mis-aplicaciones.html`: stat "Pendientes" con borde izquierdo naranja y número naranja

### Riesgos

- `dashboard-main.css` tiene `:root { --warning: #FFBB00 }` que sobreescribe el design-system. Usar `--state-pending` (que no tiene override local) evita este problema.

### Commit

```
style(MV-3): highlight Pendientes stat in state-pending orange
```

---

## MV-6 — Unificar Sombras de Cards

**Prioridad:** 🟡 Media

### Problema

~25 ocurrencias de `box-shadow: 0 2px 8px rgba(0,0,0,0.08)` hardcodeado en ~11 archivos CSS. Tras MV-7, `--shadow-card` ya tiene este valor → reemplazar todas.

### Archivos afectados (con ocurrencias)

| Archivo | Ocurrencias | Variantes |
|---------|-------------|-----------|
| `css/mis-aplicaciones.css` | 5 | exactas |
| `css/historial-calificaciones.css` | 5 | exactas |
| `css/perfil-empleador.css` | 3 | exactas |
| `css/perfil-trabajador.css` | 2 | + 1 con `0.06` (también reemplazar) |
| `css/mis-aplicaciones-trabajador.css` | 2 | exactas |
| `css/dashboard-main.css` | 2 | exactas |
| `css/dashboard-empleador.css` | 1 | `0.06` variante |
| `css/mapa-ofertas.css` | 1 | exacta |
| `css/filtros-avanzados.css` | 1 | exacta |
| `css/login.css` | 1 | exacta |
| `css/register.css` | 1 | exacta |
| `css/publicar-oferta.css` | 1 | `0.1` variante |

### Qué NO tocar

- Sombras `rgba(0,0,0,0.2)` en fotos/avatares — intencionalmente pesadas
- Sombras azules `rgba(0,102,255,0.3)` — son glow de botones CTA, reemplazar por `var(--shadow-btn)` donde aplique
- `toast.css`, `introjs-custom.css` — no son cards

### Patrón de reemplazo

```css
/* ANTES */
box-shadow: 0 2px 8px rgba(0,0,0,0.08);
/* o */
box-shadow: 0 2px 8px rgba(0,0,0,0.06);

/* DESPUÉS */
box-shadow: var(--shadow-card);
```

### Verificación

- DevTools > "Styles" panel → debe mostrar `var(--shadow-card)` en lugar de valor hardcodeado
- DevTools > "Computed" > `box-shadow` → debe resolver a `0 2px 8px rgba(0, 0, 0, 0.08)`

### Riesgos

- Si `design-system.css` no cargó (cache viejo sin `?v=1`), `var(--shadow-card)` resuelve a `initial` = `none` = cards sin sombra. Por eso MV-7 debe hacerse primero y con bump de versión.

### Commit

```
style(MV-6): replace hardcoded card shadows with var(--shadow-card)
```

---

## MV-5 — Unificar Border-Radius de Cards

**Prioridad:** 🟡 Media

### Estandarización

| Tipo de elemento | Variable | Valor | Ejemplos |
|------------------|----------|-------|----------|
| Cards principales | `--radius-card-lg` | 16px | `.oferta-card`, `.section`, `.empleador-section` |
| Cards compactas | `--radius-card` | 14px | `.aplicacion-card`, `.stat-card`, `.stat-mini`, `.oferta-grupo` |
| Botones | `--radius-btn` | 12px | `.btn`, `.filtro-btn` |
| Pills/badges | `--radius-pill` | 20px | `.oferta-categoria`, `.distancia-badge` |

### Archivos afectados

| Archivo | Selectores a cambiar |
|---------|---------------------|
| `css/dashboard-main.css` | `.section` (12px→`--radius-card-lg`), `.stat-card` (`--radius-lg`→`--radius-card`) |
| `css/dashboard-empleador.css` | `.empleador-section` (12px→`--radius-card-lg`) |
| `css/mis-aplicaciones.css` | `.stat-card` (12px→`--radius-card`), `.aplicacion-card` (12px→`--radius-card`), `.oferta-grupo` (12px→`--radius-card-lg`) |
| `css/mis-aplicaciones-trabajador.css` | `.aplicacion-card` (12px→`--radius-card`) |
| `css/perfil-trabajador.css` | Section cards (12px→`--radius-card`), profile header (16px→`--radius-card-lg`) |
| `css/perfil-empleador.css` | Ídem |
| `css/mapa-ofertas.css` | Sidebar panel y preview (12px→`--radius-card`), bottom sheet top corners: `--radius-card-lg` `--radius-card-lg` 0 0 |

### Verificación

- Comparar side-by-side: dashboard antes vs después — cards ligeramente más redondeadas (12→14px compactas, 12→16px secciones)
- Verificar que `:hover` y `:active` siguen viéndose bien con el nuevo radio

### Riesgos

- `--radius-card-lg: 16px` = mismo valor que `--radius-xl: 16px`. Son variables DISTINTAS por semántica. No eliminar `--radius-xl`.
- Bottom sheet en `mapa-ofertas.css:668`: `border-radius: 16px 16px 0 0` → `var(--radius-card-lg) var(--radius-card-lg) 0 0`

### Commit

```
style(MV-5): standardize card border-radius with --radius-card tokens
```

---

## MV-4 — Reemplazar Emojis por SVG

**Prioridad:** 🟡 Media — tarea más grande, considerar dividir en sub-commits.

### Inventario de emojis funcionales (~100+ ocurrencias)

| Emoji | Uso | Ocurrencias | Dónde |
|-------|-----|-------------|-------|
| 👤 | Avatar, "Publicado por", nav Perfil | ~30 | 10+ JS, 9 HTML |
| 📍 | Ubicación | ~25 | 8 JS, 5 HTML |
| ⭐ | Calificación, botones calificar | ~20 | 7 JS, 5 HTML |
| 🔔 | Alertas, nav, toasts | ~15 | 4 JS, 7 HTML |
| 💰 | Salario | ~10 | 6 JS, 1 HTML |
| 📋 | Requisitos, nav Mis Apps, empty states | ~12 | 5 JS, 4 HTML |
| 💼 | Empleador, experiencia | ~8 | 2 JS, 3 HTML |
| 🔧 | Categoría gasfitería | ~8 | 5 JS, 2 HTML |
| 🕐 | Horario | ~5 | 4 JS |
| 🏷️ | Categorías filtro | ~3 | 2 JS |
| 🏠 | Nav Inicio | ~2 | 1 JS, 9 HTML |
| 🔍 | Nav Explorar, empty state | ~3 | 1 JS, 9 HTML |
| ➕ | Nav Publicar/FAB | ~1 | 7 HTML |
| ⏳ | Stat pendientes | ~1 | 1 HTML |
| 🤝 | Stat contratados | ~1 | 1 HTML |

### Estrategia

**Paso 1 — Crear `js/utils/icons.js` (archivo nuevo, constantes SVG)**

```js
// Íconos de navegación (20x20)
export const ICON_HOME = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

export const ICON_EXPLORE = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;

export const ICON_APPS = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>`;

export const ICON_BELL = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;

export const ICON_USER = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

// Íconos de contenido (14x14)
export const ICON_PIN = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

export const ICON_MONEY = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;

export const ICON_CLOCK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

export const ICON_CLIPBOARD = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>`;

export const ICON_STAR = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

export const ICON_BRIEFCASE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`;
```

**Paso 2 — Bottom nav HTML (9 archivos)**

Corregir orden Y reemplazar emojis simultáneamente.

Nav trabajador (5 archivos: `dashboard.html`, `mapa-ofertas.html`, `mis-aplicaciones-trabajador.html`, `notificaciones.html`, `perfil-trabajador.html`):

```
Inicio | Explorar | Mis Apps | Alertas | Perfil
```

Nav empleador (4 archivos: `dashboard.html` [cuando es empleador se maneja por JS], `mis-aplicaciones.html`, `historial-ofertas.html`, `perfil-empleador.html`):

```
Inicio | [FAB publicar] | Candidatos | Alertas | Perfil
```

Patrón HTML por tab:

```html
<!-- Tab inactivo -->
<a href="dashboard.html" class="bottom-nav-item" data-page="home">
    <span class="bottom-nav-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" stroke-width="2" aria-hidden="true">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
    </span>
    <span class="bottom-nav-label">Inicio</span>
</a>

<!-- Tab activo (filled) -->
<a href="dashboard.html" class="bottom-nav-item active" data-page="home" aria-current="page">
    <span class="bottom-nav-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#0066FF" stroke="none" aria-hidden="true">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22" stroke="#fff" stroke-width="2" fill="none"/>
        </svg>
    </span>
    <span class="bottom-nav-label">Inicio</span>
</a>
```

**Paso 3 — Stat icons en dashboard.html**

```html
<!-- ANTES -->
<div class="stat-icon">📋</div>

<!-- DESPUÉS -->
<div class="stat-icon" aria-hidden="true">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
    </svg>
</div>
```

**Paso 4 — Labels de categoría en JS (quitar emojis)**

```js
// ANTES (mis-aplicaciones/cards.js, mis-aplicaciones-trabajador/cards.js, etc.)
'construccion': '🏗️ Construcción',
'gasfiteria': '🔧 Gasfitería',

// DESPUÉS
'construccion': 'Construcción',
'gasfiteria': 'Gasfitería',
```

**Paso 5 — Content emojis en templates JS**

Reemplazar 📍, 💰, 🕐, 📋, 👤 por SVGs importados de `icons.js` en:
- `js/components/oferta-detalle.js` (5 emojis)
- `js/dashboard/dashboard.js` (~8 emojis)
- `js/mapa-ofertas.js` (~5 emojis)
- `js/mis-aplicaciones-trabajador.js` (~6 emojis)
- `js/mis-aplicaciones-trabajador/cards.js` (~4 emojis)
- `js/historial-ofertas.js` (2 emojis)
- `js/components/oferta-card.js` (2 emojis: 📍, 🔔)
- `js/perfil-publico/templates.js` (👤 en reviews)

### CSS — bottom-nav.css

```css
/* LIMPIAR — ya no aplica con SVG */
/* Quitar font-size: 1.5rem de .bottom-nav-icon (era para sizing de emoji) */

/* AGREGAR — centrado del SVG */
.bottom-nav-icon svg {
    display: block;
}
```

### Verificación

- Cada página: 5 tabs con SVG, activo=filled azul, inactivos=stroke gris
- Confirmar `.nav-dot` indicador en tab activo
- Content icons alineados con texto (inline-flex)
- Safari iOS: SVGs inline renderizan correctamente

### Riesgos

- **`js/components/bottom-nav.js`** puede sobreescribir el nav dinámicamente por JS (detectado: `iconHome.textContent = '📋'`). Revisar este archivo — si renderiza nav desde JS, los SVGs deben ir en el JS, no en el HTML.
- SVG inline en HTML es verboso (~225 líneas nuevas entre 9 archivos). Mecánico pero alto volumen.
- `aria-hidden="true"` en SVGs — el label accesible viene del `<span class="bottom-nav-label">`

### Sub-commits sugeridos

```
style(MV-4a): create js/utils/icons.js SVG constants
style(MV-4b): replace emoji bottom nav with SVG icons + fix nav order
style(MV-4c): replace emoji stat icons with SVG
style(MV-4d): remove emojis from category labels
style(MV-4e): replace content emojis in JS templates with SVG
```

---

## MV-8 — Logo Consistente Two-Tone

**Prioridad:** 🟡 Media

### Problema

El logo dice "ChambaYa" en un solo color. El mockup muestra "Chamba" en oscuro + "Ya" en azul `#0066FF`.

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `css/header-simple.css` | Agregar `.logo-ya { color: var(--primary); }` |
| `css/dashboard-main.css` | Agregar `.logo-ya { color: var(--primary); }` |
| 11 HTML files con header | Cambiar `>ChambaYa</span>` → `>Chamba<span class="logo-ya">Ya</span></span>` |

### HTML — Find/Replace mecánico

```html
<!-- ANTES -->
<span class="logo-text">ChambaYa</span>

<!-- DESPUÉS -->
<span class="logo-text">Chamba<span class="logo-ya">Ya</span></span>
```

Archivos: `dashboard.html`, `mapa-ofertas.html`, `mis-aplicaciones.html`, `mis-aplicaciones-trabajador.html`, `notificaciones.html`, `perfil-trabajador.html`, `perfil-empleador.html`, `historial-ofertas.html`, `historial-calificaciones.html`, `perfil-publico.html`, `publicar-oferta.html`

**NO tocar:** `login.html` y `register.html` (usan `logo-completo.png` como imagen).

### CSS

```css
.logo-ya {
    color: var(--primary);
}
```

### Verificación

- Header de cada página: "Chamba" en color oscuro, "Ya" en azul
- En móvil <480px, `.logo-text { display: none }` sigue funcionando (el span anidado hereda)
- `admin.html` tiene estructura distinta (`ChambaYa <span class="admin-label">Admin</span>`) — aplicar `.logo-ya` también

### Commit

```
style(MV-8): add two-tone ChambaYa logo text with primary blue Ya
```

---

## MV-16 — Reportar Modal al Design System

**Prioridad:** 🟡 Media

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `js/components/reportar-modal.js` | Reemplazar emojis por SVG flag, alinear estructura del modal |
| `css/modal.css` | Agregar variante `.modal-reportar` con `border-radius: var(--radius-card-lg)` y `box-shadow: var(--shadow-modal)` |

### Commit

```
style(MV-16): align reportar modal to design system
```

---

## MV-9 — Empty States con Ilustraciones SVG

**Prioridad:** 🟢 Baja — hacer después de MV-4 (cuando los emojis ya estén removidos).

### Patrón

```html
<!-- ANTES -->
<div class="empty-state-icon">🔍</div>

<!-- DESPUÉS -->
<div class="empty-state-illustration" aria-hidden="true">
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="38" fill="var(--primary-light)"/>
        <circle cx="34" cy="34" r="14" stroke="var(--primary)" stroke-width="3" fill="none"/>
        <line x1="44" y1="44" x2="58" y2="58" stroke="var(--primary)" stroke-width="3" stroke-linecap="round"/>
    </svg>
</div>
```

### Archivos afectados

- `js/dashboard/trabajador.js:204` — "Sin ofertas" → lupa SVG
- `dashboard.html:261` — "Sin ofertas publicadas" → clipboard SVG
- `mis-aplicaciones-trabajador.html:128` — "Sin postulaciones" → lista vacía SVG
- `historial-ofertas.html:96` — "Sin ofertas publicadas" → clipboard SVG

### Commit

```
style(MV-9): replace emoji empty states with simple SVG illustrations
```

---

## MV-10 a MV-14 — Assets para Stores (Diseño)

Estas tareas requieren herramientas de diseño (Figma/Canva), no cambios de código.

| Tarea | Descripción | Herramienta |
|-------|-------------|-------------|
| MV-10 | Splash screen: logo CY sobre `#0066FF`, sin texto, múltiples densidades | Figma → export PNG |
| MV-11 | App icon: CY monogram sobre `#0066FF`, adaptive icon Android + iOS | Figma → export PNG |
| MV-12 | Screenshots Android: 5-8 pantallas 1080×1920px con device frame | Chrome DevTools + Figma |
| MV-13 | Screenshots iOS: 6.5" (1284×2778) y 5.5" (1242×2208) | Xcode Simulator + Figma |
| MV-14 | Feature graphic: 1024×500px, logo + tagline + device mockup | Figma/Canva |

---

## MAPA DE VERSIONES CSS

Al tocar un CSS, bumpar `?v=N` en todos los HTML que lo referencian:

| CSS | Tareas que lo tocan | HTML que lo carga |
|-----|--------------------|--------------------|
| `design-system.css` | MV-7, MV-5 | Todos (11+) |
| `dashboard-main.css` | MV-3, MV-5, MV-6, MV-8 | `dashboard.html` |
| `mis-aplicaciones.css` | MV-2, MV-3, MV-5, MV-6 | `mis-aplicaciones.html` |
| `mis-aplicaciones-trabajador.css` | MV-5, MV-6 | `mis-aplicaciones-trabajador.html` |
| `dashboard-empleador.css` | MV-5, MV-6 | `dashboard.html` |
| `header-simple.css` | MV-8 | ~8 páginas |
| `bottom-nav.css` | MV-4 | 9 páginas |
| `perfil-trabajador.css` | MV-5, MV-6 | `perfil-trabajador.html` |
| `perfil-empleador.css` | MV-5, MV-6 | `perfil-empleador.html` |
| `historial-calificaciones.css` | MV-6 | `historial-calificaciones.html` |
| `mapa-ofertas.css` | MV-5, MV-6 | `mapa-ofertas.html` |
| `filtros-avanzados.css` | MV-6 | varias páginas |

---

## CHECKLIST DE REGRESIÓN (por tarea)

Antes de cerrar cualquier MV, verificar:

- [ ] Bottom nav visible, sin solapamiento con contenido
- [ ] SVG icons no desbordan sus contenedores
- [ ] `var(--shadow-card)` resuelve (no vacío/none)
- [ ] Colores de estado correctos (naranja pendiente, verde aceptado)
- [ ] Logo two-tone: "Chamba" oscuro, "Ya" azul
- [ ] Sin flex overflow en pills o stat cards
- [ ] `env(safe-area-inset-bottom)` sigue funcionando en bottom nav
- [ ] CSS cache bust: versión bumpeada en HTML
