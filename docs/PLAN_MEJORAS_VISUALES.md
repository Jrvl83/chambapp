# PLAN: Mejoras Visuales — ChambaYa

**Creado:** 27 Febrero 2026
**Última actualización:** 02 Marzo 2026 (sesión 29)

## REFERENCIAS DE DISEÑO

| Pantalla | Archivo |
|----------|---------|
| Dashboard trabajador | `docs/archivo/chambaya-dashboard (1).html` |
| Mis Postulaciones (trabajador) | `docs/archivo/chambaya-postulaciones.html` |
| Explorar / Mapa de ofertas | `docs/archivo/chambaya-explorar.html` |
| Perfil del trabajador (editable) | `docs/archivo/chambaya-perfil-trabajador.html` |
| Perfil trabajador — tab Fotos | `docs/archivo/chambaya-fotos.html` |
| Perfil trabajador — tab Reseñas | `docs/archivo/chambaya-resenas.html` |
| Perfil trabajador — tab Skills | `docs/archivo/chambaya-skills-v2.html` |
| Detalle de oferta (bottom sheet) | `docs/archivo/chambaya-detalle-oferta.html` |
| Alertas (trabajador y empleador) | `docs/archivo/chambaya-alertas.html` — misma estructura para ambos roles, solo cambia el contenido de las notificaciones |
| Dashboard empleador | `docs/archivo/empleador/chambaya-dashboard-empleador.html` |
| Publicar oferta — Step 1 (Básico) | `docs/archivo/empleador/chambaya-publicar-oferta.html` |
| Publicar oferta — Step 2 (Detalles) | `docs/archivo/empleador/chambaya-publicar-step2.html` |
| Publicar oferta — Step 3 (Requisitos) | `docs/archivo/empleador/chambaya-publicar-step3.html` |
| Publicar oferta — Step 4 (Revisar) | `docs/archivo/empleador/chambaya-publicar-step4.html` |
| Ver Candidatos (empleador) | `docs/archivo/empleador/chambaya-ver-candidatos.html` |
| Perfil empleador (editable) | `docs/archivo/empleador/chambaya-perfil-empleador.html` |
| Modal calificación (empleador→trabajador y trabajador→empleador) | `docs/archivo/empleador/chambaya-calificacion-modal.html` — un archivo con dos phone frames, un flujo por rol |
| Historial de calificaciones (trabajador) | `docs/archivo/empleador/chambaya-historial-calificaciones.html` — tabs Recibidas/Dadas, summary card, filtros |
| Perfil público del trabajador (vista empleador) | `docs/archivo/chambaya-perfil-publico-trabajador.html` — read-only, hero, bio, portfolio, skills, reseñas, disponibilidad |
| Historial de ofertas (empleador) | `docs/archivo/empleador/chambaya-historial-ofertas.html` — stats 5 estados, filtro, cards con acciones por estado |
| Login | `docs/archivo/chambaya-login.html` — 2 frames: formulario + modal selección de rol post-Google |
| Registro | `docs/archivo/chambaya-registro.html` — 3 frames: paso 1 tipo, paso 2 datos, paso 3 contraseña |
| Perfil trabajador — tab Experiencia | `docs/archivo/chambaya-perfil-experiencia.html` — 2 frames: lista experiencias + modal agregar |
| Perfil trabajador — tab Horario | `docs/archivo/chambaya-perfil-horario.html` — toggle disponibilidad, pills días, horario, zona |

Abrir en el navegador para comparar con la implementación real.

**Dirección visual confirmada:** App de trabajo seria.
Color primario #0066FF (azul) como base de confianza y profesionalismo.
Naranja #FF6B00 reservado exclusivamente para urgencia y estados pendientes.

---

## AUDITORÍA Y ESTANDARIZACIÓN DE MOCKUPS ✅ (sesión 29)

Antes de implementar las mejoras en el código real, se auditaron todos los mockups y se corrigieron inconsistencias. Los mockups ahora son la referencia canónica confiable.

### Problemas encontrados y corregidos

**Bottom nav — orden de tabs:**
- Dashboard trabajador tenía orden distinto: `Mis Apps | Inicio | Explorar | Alertas | Perfil`
- Explorar tenía tab "Publicar" en lugar de "Mis Apps"
- Ver Candidatos tenía nav incorrecto (tab Explorar, sin Alertas)
- Historial Ofertas tenía tab extra "Historial" (6 tabs en lugar de 5)
- Historial Calificaciones tenía nav de trabajador completo (pantalla de empleador)

**Botón volver:**
- `chambaya-historial-calificaciones.html` usaba "Volver al Perfil" (no estándar)

**Íconos SVG del nav — trabajador:**
- Dashboard usaba tamaño 22×22; el resto 20×20 o sin tamaño explícito
- Mis Apps tenía dos variantes de ícono (maletín vs clipboard)
- Estados activos mixtos: algunos filled, otros outline del mismo color

**Íconos SVG del nav — empleador:**
- Todos los tabs activos usaban outline en lugar de filled

### Estándares decididos (aplicar al código real)

**Orden de tabs:**
- Trabajador: `Inicio | Explorar | Mis Apps | Alertas | Perfil`
- Empleador: `Inicio | [FAB publicar] | Candidatos | Alertas | Perfil`

**Botón volver:** `← Volver` (flecha Unicode + texto)

**Íconos nav:**
| Atributo | Inactivo | Activo |
|----------|----------|--------|
| fill | `none` | `#0066FF` |
| stroke | `#A0AEC0` | `#0066FF` |
| stroke-width | `2` | `1.5` |
| width/height | `20` | `20` |
| indicador | — | `<div class="nav-dot">` |

**Ícono Mis Apps:** clipboard (Variante B)
```html
<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
<rect x="9" y="3" width="6" height="4" rx="1"/>
```

**Ícono Inicio activo:** agregar detalle de puerta en blanco
```html
<polyline points="9 22 9 12 15 12 15 22" stroke="#fff" stroke-width="2" fill="none"/>
```

### Archivos modificados (todos en `docs/archivo/`)

| Archivo | Cambios |
|---------|---------|
| `chambaya-dashboard (1).html` | Nav reordenado, tamaño 22→20, Mis Apps briefcase→clipboard |
| `chambaya-explorar.html` | Tab "Publicar"→"Mis Apps" clipboard, Explorar activo filled |
| `chambaya-postulaciones.html` | Tamaño explícito 20×20, Mis Apps activo filled |
| `chambaya-alertas.html` | Alertas activo filled |
| `chambaya-perfil-experiencia.html` | Perfil activo filled |
| `chambaya-perfil-horario.html` | Perfil activo filled |
| `empleador/chambaya-dashboard-empleador.html` | Inicio activo filled + detalle puerta blanco |
| `empleador/chambaya-ver-candidatos.html` | Nav reemplazado completo + CSS nav-fab-wrap, Candidatos activo filled |
| `empleador/chambaya-historial-ofertas.html` | Tab Historial eliminado, tab Alertas agregado, Inicio activo filled |
| `empleador/chambaya-historial-calificaciones.html` | Nav trabajador→empleador, "Volver al Perfil"→"← Volver", Perfil activo filled |
| `empleador/chambaya-perfil-empleador.html` | Perfil activo filled |
| `empleador/chambaya-calificacion-modal.html` | Candidatos activo filled (frame 1), Perfil activo filled (frame 2) |

*Ya correctos (sin cambios): `perfil-trabajador`, `fotos`, `resenas`, `skills-v2`*

### Commits (branch `feature/mejoras-visuales`)
1. `docs(mockups): estandarizar bottom nav y botón volver en todos los mockups`
2. `docs(mockups): estandarizar íconos del bottom nav trabajador`
3. `docs(mockups): estandarizar ícono activo filled en bottom nav empleador`

---

## ESTADO

```
MEJORAS VISUALES: ░░░░░░░░░░░░░░░░░░░░  0% (0/14 tareas)
```

---

## PRÓXIMA SESIÓN — MV-0: Plan de implementación detallado

> **Hacer antes de tocar cualquier archivo de código.**

Crear un documento `docs/PLAN_IMPLEMENTACION_MV.md` que detalle cómo ejecutar cada tarea MV-1 a MV-14 con criterios de ingeniería claros.

**El plan debe incluir por cada tarea:**
- Archivos afectados (HTML, CSS, JS) con rutas exactas
- Fragmento de código "antes / después" para casos representativos
- Variables CSS nuevas en `design-system.css` (si aplica)
- Orden de edición recomendado para evitar regresiones
- Cómo verificar que quedó bien (qué revisar en el navegador / DevTools)
- Riesgos conocidos (SW cache, iOS safe-area, flex overflow, etc.)

**Buenas prácticas que el plan debe respetar:**
- No romper el SW de caché: bumpar `?v=N` en cada CSS/JS tocado
- No duplicar variables CSS — agregar en `design-system.css`, no inline
- Cambios atómicos: un commit por tarea MV, mensaje descriptivo
- Revisar en Chrome DevTools mobile + Firefox + Safari iOS antes de cerrar tarea
- No mezclar tareas: si MV-1 toca `dashboard.css`, ese commit solo toca MV-1
- Probar en la rama `feature/mejoras-visuales` antes de merge a `main`

---

## BLOQUE 1 — Ajustes del mockup v2 (prioridad inmediata)

*Correcciones puntuales para cuando el mockup se lleve a código real.*

| # | Tarea | Descripción | Prioridad |
|---|-------|-------------|-----------|
| MV-1 | **Fix icono de distancia** | Reemplazar emoji 🕐 (reloj) usado para distancia en km por texto plano "· X km" o ícono SVG de ubicación. El reloj comunica tiempo, no distancia — confunde al usuario. Afecta: dashboard trabajador, cards de ofertas en mapa, mis-aplicaciones-trabajador. | 🔴 Alta |
| MV-2 | **Estilo de avatares de empleador** | Cambiar avatares de iniciales de fondo sólido puro (ej: fondo #FF6B00 + texto blanco) a fondo claro con inicial de color (ej: fondo #FFF3ED + texto #FF6B00). Más suave, menos agresivo. Patrón ya usado en `css/components.css`. Afecta: activity cards del dashboard, mis-aplicaciones. | 🔴 Alta |
| MV-3 | **Stat "Pendientes" más prominente** | La stat de pendientes es la más urgente — debe destacar visualmente. Opciones: (a) número con fondo pill naranja suave, (b) borde top de la stat-card en naranja, (c) número más grande que los demás. Afecta: dashboard trabajador y empleador. | 🟡 Media |

---

## BLOQUE 2 — Consistencia global

*Problemas detectados en auditoría visual del codebase (UX_UI_GUIA_MAESTRA.md).*

| # | Tarea | Descripción | Prioridad |
|---|-------|-------------|-----------|
| MV-4 | **Reemplazar emojis por íconos SVG** | La app usa emojis como íconos funcionales (💼, 🔧, ⭐, 📍, etc.) — inconsistentes entre plataformas y no escalan bien. Reemplazar por Phosphor Icons (CDN ya disponible) o set SVG inline. Priorizar: bottom nav, stat cards, category tags, botones de acción. | 🟡 Media |
| MV-5 | **Unificar border-radius de cards** | Algunas cards usan 12px, otras 14px, otras 16px dependiendo de cuándo se crearon. Estandarizar a 14px para cards compactas y 16px para cards principales. Revisar: dashboard, mis-aplicaciones, mis-aplicaciones-trabajador, mapa-ofertas. | 🟡 Media |
| MV-6 | **Unificar sombras de cards** | Hay al menos 3 variantes de box-shadow en uso. Estandarizar a `0 2px 8px rgba(0,0,0,0.08)` (sutil) como valor único de card shadow. Definir en `design-system.css` como `--shadow-card`. | 🟡 Media |
| MV-7 | **Colores de estado consistentes** | Los estados (pendiente/aceptado/rechazado/completado) usan colores distintos en diferentes páginas. Estandarizar: pendiente=#FF6B00, aceptado=#00C48C, rechazado=#CBD5E0/#718096, completado=#9B59B6. Definir en `design-system.css` como variables `--state-*`. | 🔴 Alta |
| MV-16 | **Botón y modal Reportar al design system** | El botón "Reportar" (`reportar-modal.js`) y su modal usan estilos propios que no siguen el design system de los mockups. Alinear: botón outline rojo discreto (estilo `cta-cancel`), modal con `border-radius: 14px` + `--shadow-modal`, textarea con border `#E2E8F0`, botón enviar en `#EF4444` con `--radius-btn`, iconos SVG en lugar de emojis. Afecta: detalle de oferta, perfil público, perfil trabajador. | 🟡 Media |

---

## BLOQUE 3 — Identidad de marca

*Mejoras que refuerzan la imagen seria y profesional de ChambaYa.*

| # | Tarea | Descripción | Prioridad |
|---|-------|-------------|-----------|
| MV-8 | **Logo consistente en todas las páginas** | Algunas páginas muestran el logo como imagen PNG, otras como texto. Estandarizar: texto "Chamba**Ya**" con "Ya" en #0066FF + ícono CY a la izquierda. Revisar header-simple.css y todos los headers de página. | 🟡 Media |
| MV-9 | **Empty states con ilustraciones** | Los empty states actuales usan solo emoji + texto. Reemplazar por ilustraciones SVG simples de unDraw.co o Storyset.com, tono profesional (sin colores chillones). Páginas: dashboard (sin ofertas), mis-aplicaciones (sin candidatos), mis-aplicaciones-trabajador (sin postulaciones). | 🟢 Baja |
| MV-15 | **Badge de plan (Free / PRO)** | Agregar badge de plan en el hero del perfil trabajador, junto a "Trabajador" y "Perfil Completo". Free: outline gris discreto, sin ícono. PRO: fondo `#F59E0B` + ícono corona SVG + texto "PRO" blanco. Aparece también en: perfil público (señal de confianza para el empleador) y cards de candidatos en mis-aplicaciones del empleador (badge pequeño junto al nombre). Depende de F2-B7 (contador freemium) y F2-B10 (Premium UI). | 🔴 Alta (post-monetización) |
| MV-10 | **Splash screen nativo** | Diseñar splash screen para Capacitor (Android + iOS). Logo CY centrado, fondo #0066FF, sin texto — minimalista. Tamaños requeridos: múltiples densidades Android (mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi) + iOS (@1x/@2x/@3x). | 🔴 Alta (pre-stores) |
| MV-11 | **Iconos de app para stores** | Ícono nativo para Google Play + App Store. Logo CY sobre fondo azul #0066FF, border-radius redondeado (Android adaptive icon + iOS). Tamaños: 512×512 Play Store, 1024×1024 App Store + todos los tamaños intermedios. | 🔴 Alta (pre-stores) |

---

## BLOQUE 4 — Capturas para stores (pre-lanzamiento)

*Screenshots de alta calidad para las fichas de Google Play y App Store.*

| # | Tarea | Descripción | Prioridad |
|---|-------|-------------|-----------|
| MV-12 | **Screenshots Android** | 5-8 capturas para Google Play: dashboard trabajador, mapa de ofertas, perfil, postulación, dashboard empleador. Tamaño: 1080×1920px. Agregar marco de dispositivo + texto de beneficio en cada captura. | 🟡 Media (pre-stores) |
| MV-13 | **Screenshots iOS** | Mismas pantallas que Android pero en tamaño iPhone 6.5" (1284×2778px) y 5.5" (1242×2208px) — App Store requiere ambos. | 🟡 Media (pre-stores) |
| MV-14 | **Feature graphic Play Store** | Banner 1024×500px para la ficha de Google Play. Logo ChambaYa + tagline + captura de la app en dispositivo. Fondo azul #0066FF o imagen de Lima. | 🟡 Media (pre-stores) |

---

## NOTAS TÉCNICAS

### Variables CSS a agregar en design-system.css

```css
/* Sombras estandarizadas */
--shadow-card:   0 2px 8px rgba(0,0,0,0.08);
--shadow-modal:  0 8px 32px rgba(0,0,0,0.16);
--shadow-btn:    0 4px 14px rgba(0,102,255,0.25);

/* Estados de aplicación */
--state-pending:   #FF6B00;
--state-pending-bg: #FFF3ED;
--state-accepted:  #00C48C;
--state-accepted-bg: #EDFAF3;
--state-rejected:  #718096;
--state-rejected-bg: #F7FAFC;
--state-completed: #9B59B6;
--state-completed-bg: #F3EEFF;

/* Border radius estandarizados */
--radius-card-sm: 14px;   /* cards compactas */
--radius-card-lg: 16px;   /* cards principales */
--radius-pill:    20px;   /* pills y badges */
--radius-btn:     12px;   /* botones */
```

### Referencia de mockup v2

El archivo `docs/archivo/chambaya-dashboard (1).html` es la referencia visual aprobada para el dashboard trabajador. Abrirlo en el navegador para comparar implementaciones.

**Lo que el mockup v2 tiene bien:**
- Jerarquía tipográfica Poppins (títulos) + Inter (body)
- Borde izquierdo de color en activity cards y job cards
- Stat "Pendientes" en naranja, resto en oscuro
- Botón "Postular" en outline azul
- ⚙️ como botón de filtros (no chips)
- "A tratar" en gris sin formato de moneda

**Lo que el mockup v2 tiene mal (no replicar):**
- Emoji 🕐 para distancia → usar texto o SVG pin
- Avatares fondo sólido → usar fondo claro + inicial de color

---

## ORDEN DE IMPLEMENTACIÓN SUGERIDO

```
MV-7  → Estandarizar variables de estado en design-system.css  (base para todo)
MV-1  → Fix icono distancia                                     (rápido, alto impacto)
MV-2  → Fix avatares                                            (rápido)
MV-3  → Stat Pendientes destacada                               (rápido)
MV-6  → Unificar sombras en design-system.css                   (rápido)
MV-5  → Unificar border-radius                                  (medio)
MV-4  → Reemplazar emojis por SVG                               (lento, muchos archivos)
MV-8  → Logo consistente                                        (medio)
──── Pre-stores ────
MV-10 → Splash screen nativo
MV-11 → Iconos de app
MV-9  → Empty states con ilustraciones
MV-12 → Screenshots Android
MV-13 → Screenshots iOS
MV-14 → Feature graphic Play Store
```
