# PLAN: Mejoras Visuales — ChambaYa

**Creado:** 27 Febrero 2026
**Última actualización:** 27 Febrero 2026

## REFERENCIAS DE DISEÑO

| Pantalla | Archivo |
|----------|---------|
| Dashboard trabajador | `docs/archivo/chambaya-dashboard (1).html` |
| Mis Postulaciones (trabajador) | `docs/archivo/chambaya-postulaciones.html` |

Abrir en el navegador para comparar con la implementación real.

**Dirección visual confirmada:** App de trabajo seria.
Color primario #0066FF (azul) como base de confianza y profesionalismo.
Naranja #FF6B00 reservado exclusivamente para urgencia y estados pendientes.

---

## ESTADO

```
MEJORAS VISUALES: ░░░░░░░░░░░░░░░░░░░░  0% (0/14 tareas)
```

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

---

## BLOQUE 3 — Identidad de marca

*Mejoras que refuerzan la imagen seria y profesional de ChambaYa.*

| # | Tarea | Descripción | Prioridad |
|---|-------|-------------|-----------|
| MV-8 | **Logo consistente en todas las páginas** | Algunas páginas muestran el logo como imagen PNG, otras como texto. Estandarizar: texto "Chamba**Ya**" con "Ya" en #0066FF + ícono CY a la izquierda. Revisar header-simple.css y todos los headers de página. | 🟡 Media |
| MV-9 | **Empty states con ilustraciones** | Los empty states actuales usan solo emoji + texto. Reemplazar por ilustraciones SVG simples de unDraw.co o Storyset.com, tono profesional (sin colores chillones). Páginas: dashboard (sin ofertas), mis-aplicaciones (sin candidatos), mis-aplicaciones-trabajador (sin postulaciones). | 🟢 Baja |
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
