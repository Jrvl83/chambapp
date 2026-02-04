# PROYECTO CHAMBAPP

**Marketplace de Trabajos Temporales - Perú**
**Última actualización:** 03 Febrero 2026 (sesión 3)

---

## RESUMEN EJECUTIVO

ChambApp conecta trabajadores ("chamberos") con empleadores para trabajos temporales en Perú. Diferenciador clave: **0% comisiones** (competidores cobran 15-25%).

### URLs
| Entorno | URL |
|---------|-----|
| **Producción** | https://chambapp-7785b.web.app |
| Backup | https://jrvl83.github.io/chambapp |
| Firebase Console | https://console.firebase.google.com/project/chambapp-7785b |
| GitHub | https://github.com/Jrvl83/chambapp |

### Stack Tecnológico
```
Frontend:  HTML5, CSS3, JavaScript ES6+ (vanilla, sin frameworks)
Backend:   Firebase (Auth, Firestore, Storage, Cloud Functions)
Hosting:   Firebase Hosting
APIs:      Google Maps, Geocoding, Places, Firebase Cloud Messaging
Pagos:     Culqi (pendiente integración)
```

---

## PROGRESO ACTUAL

```
FASE 1: █████████████████████░░░░░░░ 67% (33/49 tareas)
FASE 2: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (0/44 tareas)
FASE 3: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (0/44 tareas)
FASE 4: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (0/44 tareas)

TOTAL:  19% del proyecto (33/176 tareas)
```

### Features Implementadas
- Registro/Login con Firebase Auth
- Perfiles trabajadores y empleadores con fotos
- Publicar ofertas de trabajo con geolocalización
- Mapa interactivo de ofertas (Google Maps)
- Postulaciones con estados (pendiente/aceptado/rechazado/completado)
- Contacto directo vía WhatsApp
- Sistema de calificaciones bidireccional (5 estrellas)
- Filtros avanzados con quick bar mobile + bottom sheet compacto
- Notificaciones push (FCM)
- Centro de notificaciones in-app
- Bottom navigation móvil (estilo app nativa)
- Dashboard diferenciado por rol
- Cards compactas horizontales en móvil

---

## FASE 1: EXPERIENCIA WOW (49 tareas)

### Tareas Completadas (32)

| # | Tarea | Fecha |
|---|-------|-------|
| 1-3 | Fundamentos técnicos (JS modular, CSS tokens, componentes) | Dic 2025 |
| 4-7 | Perfiles completos (Firestore, upload fotos, editor) | Dic 2025 |
| 8-12 | Geolocalización (Maps API, ubicación, geocoding, mapa) | 14-19 Ene |
| 13-17 | Calificaciones (estructura, estrellas, bidireccional, historial) | 20-21 Ene |
| 21 | Aceptar/Rechazar + WhatsApp | 19 Ene |
| 23-24 | Filtros avanzados dashboard | 22 Ene |
| 27-29 | Notificaciones push + centro in-app | 26-27 Ene |
| 31-32 | Micro-interacciones y empty states | 30 Ene |
| 34 | Loading states (spinner centrado) | 30 Ene |
| - | UX: Bottom nav, dashboard por rol, logo, colores unificados | 22-28 Ene |
| OB1 | Onboarding: externalizar CSS login/register, centrado, consistencia, UX mejoras | 03 Feb |

### Tareas Pendientes (12)

| # | Tarea | Prioridad |
|---|-------|-----------|
| GT1 | Centralizar guided tours / coach marks (ver sección Sprint GT) | **Alta** |
| 33 | Error states y validaciones | Media |
| 35 | Accesibilidad WCAG 2.1 AA | Media |
| 36 | Dark mode (opcional) | Baja |
| 37-39 | Performance y PWA | Alta (al final) |
| 40-44 | Testing y QA | Alta |
| 45-48 | Panel de administración | Media |

### Tareas Diferidas (6)
- Tasks 18-20, 22: Chat in-app (WhatsApp cubre la necesidad)
- Task 25-26: Búsqueda avanzada premium
- Task 30: Settings de notificaciones

---

## SPRINT: GESTIÓN DE OFERTAS (6 tareas) - NUEVO

> **Objetivo:** Mejorar el ciclo de vida de las ofertas y la experiencia del empleador.

### Tareas

| # | Tarea | Descripción | Prioridad | Estado |
|---|-------|-------------|-----------|--------|
| G1 | Sistema de estados | Implementar estados: `activa` → `en_curso` → `completada` + `caducada` | Alta | ✅ HECHO |
| G2 | Caducidad automática | Ofertas expiran en 14 días, Cloud Function diaria, opción renovar | Alta | ✅ HECHO |
| G3 | Conteo correcto | Solo mostrar/contar ofertas `activa` + no expiradas en index/dashboard | Alta | ✅ HECHO |
| G4 | Editar/Eliminar ofertas | Botones en cards del dashboard del empleador | Alta | ✅ HECHO |
| G5 | Historial de publicaciones | Nueva página para empleador con todas sus ofertas (activas, en curso, completadas, caducadas) + opciones reutilizar/renovar | Media | ✅ HECHO |
| G6 | Fotos en ofertas | Galería de imágenes al publicar oferta (máx 5 fotos) | Media | ✅ HECHO |

### Progreso G1 (31/01/26)
**Implementado:**
- ✅ `fechaExpiracion` se agrega al crear oferta (14 días)
- ✅ Al aceptar postulación → oferta cambia a `en_curso`
- ✅ Al marcar completado → oferta cambia a `completada`

**Pendiente G1:**
- [x] Estado `caducada` (Cloud Function G2 implementada)
- [x] Filtrar queries para excluir ofertas expiradas (G3)

### Flujo de Estados

```
Empleador publica oferta
        ↓
    [ACTIVA] ← visible, trabajadores postulan (14 días máx)
        │
        ├── Empleador acepta postulación
        │           ↓
        │      [EN_CURSO] ← NO visible, trabajo asignado
        │           ↓
        │      Trabajo termina, ambos califican
        │           ↓
        │     [COMPLETADA] ← en historial, reutilizable
        │
        └── Pasan 14 días sin aceptar
                    ↓
               [CADUCADA] ← en historial, renovable (+14 días)
```

### Regla de Visibilidad
```
Ofertas visibles para trabajadores:
→ estado === "activa" AND fechaExpiracion > ahora
```

---

## SPRINT: GUIDED TOURS / COACH MARKS (1 tarea)

> **Objetivo:** Centralizar y reparar el sistema de guided tours (tutoriales de primera visita) que se rompieron durante actualizaciones.

### Problema
ChambApp tenía guided tours en varias páginas pero se rompieron con las actualizaciones de HTML/CSS. Además, el código de tours estaba mezclado dentro de cada página (no centralizado), lo que dificulta el mantenimiento.

### Tareas

| # | Tarea | Descripción | Prioridad | Estado |
|---|-------|-------------|-----------|--------|
| GT1 | Centralizar guided tours | Buscar tours rotos existentes, crear arquitectura centralizada, reparar todos los tours | **Alta** | Pendiente |

### Arquitectura propuesta
```
js/components/guided-tour.js   → Motor del tour (highlight, tooltip, navegación)
css/guided-tour.css             → Estilos del overlay, tooltips, spotlight
js/config/tours.js              → Configuración de cada tour por página
```

### Funcionalidades del motor
- Highlight de elemento con overlay oscuro alrededor (spotlight)
- Tooltip posicionado automáticamente (arriba/abajo/izq/der)
- Navegación: "Siguiente", "Anterior", "Saltar"
- Progress dots (paso X de Y)
- `localStorage` para marcar tour como completado por página
- Responsive (ajustar posición en mobile)
- Solo se muestra en la primera visita del usuario

### Páginas que necesitan tour
- `dashboard.html` — Explicar stats, ofertas, filtros, bottom nav
- `publicar-oferta.html` — Guiar al empleador por el formulario
- `mapa-ofertas.html` — Explicar interacción con el mapa
- `perfil-trabajador.html` / `perfil-empleador.html` — Secciones del perfil

---

## FASES 2-4 (Resumen)

### Fase 2: Diferenciación y Premium (44 tareas | 1 mes)
- Sistema Freemium (5 apps/mes gratis, ilimitado S/.20/mes)
- Verificación DNI
- Dashboard estadísticas
- Matching inteligente
- Sistema favoritos

### Fase 3: Pre-Lanzamiento (44 tareas | 1 mes)
- 100+ ofertas reales pre-cargadas
- 50-100 trabajadores beta
- Blog SEO (20-30 artículos)
- Lista espera 500+ usuarios
- Partnerships estratégicos
- Centro de ayuda

### Fase 4: Lanzamiento (44 tareas | 1 mes)
- Product Hunt launch
- Email blast lista espera
- War room 24/7
- A/B testing agresivo
- Optimización post-launch

**Lanzamiento estimado:** Mayo 2026

---

## MODELO DE NEGOCIO

### Freemium Asimétrico
**Solo trabajadores pagan, empleadores siempre gratis**

| Plan | Trabajadores | Empleadores |
|------|--------------|-------------|
| Free | 5 apps/mes, 10 mensajes, con ads | Todo gratis |
| Premium S/.20/mes | Ilimitado, destacado 10x, sin ads | N/A |

**Diferenciador:** 0% comisiones vs competencia (15-25%)

---

## CONFIGURACIÓN TÉCNICA

### API Keys
```
Google Maps: AIzaSyBxopsd9CPAU2CSV91z8YAw_upxochOGYE
Firebase: chambapp-7785b
Plan: Blaze (activo)
```

### Estructura de Carpetas
```
chambapp/
├── index.html, login.html, register.html, dashboard.html
├── perfil-trabajador.html, perfil-empleador.html
├── mis-aplicaciones.html, mis-aplicaciones-trabajador.html
├── mapa-ofertas.html, publicar-oferta.html
├── historial-calificaciones.html, notificaciones.html
├── manifest.json, firebase-messaging-sw.js
├── css/
│   ├── design-system.css, components.css, animations.css
│   ├── dashboard-main.css, bottom-nav.css
│   └── [page-specific].css
├── js/
│   ├── config/, auth/, dashboard/, components/, utils/
│   └── [page-specific].js
├── assets/
│   ├── icons/ (PWA)
│   └── logo/ (logo-completo.png, logo-icono.png)
├── functions/ (Cloud Functions)
└── docs/ (documentación)
```

---

## COMANDOS ÚTILES

```bash
# Ejecutar localmente
cd C:\Users\JOEL\Documents\Proyectos\Chambapp
npx serve

# Deploy a producción
firebase deploy --only hosting

# Deploy Cloud Functions
firebase deploy --only functions

# Ver logs Cloud Functions
firebase functions:log

# Commit estándar
git add [files] && git commit -m "tipo: mensaje" && git push
```

### Tipos de Commit
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `refactor:` Refactorización
- `style:` Cambios de formato
- `docs:` Documentación
- `perf:` Performance

---

## DECISIONES ARQUITECTÓNICAS

1. **NO usar frameworks frontend** - Vanilla JS ES6+ modules
2. **Firebase como backend** - Firestore NoSQL
3. **Mobile-first design** - 360-414px primero
4. **SIN intermediación de pagos** - Solo suscripciones Premium
5. **Geolocalización SOLO trabajadores** - Empleadores especifican ubicación del trabajo
6. **Tono neutro/formal** - No coloquial ("oferta" no "chamba" en UI)

---

## DOCUMENTACIÓN RELACIONADA

| Documento | Descripción |
|-----------|-------------|
| [UX_UI_GUIA_MAESTRA.md](UX_UI_GUIA_MAESTRA.md) | Identidad visual, colores, tipografía, componentes |
| [REGLAS_DESARROLLO.md](REGLAS_DESARROLLO.md) | Estándares de código y buenas prácticas |
| [PLAN_REFACTORIZACION.md](PLAN_REFACTORIZACION.md) | Plan actual de limpieza de código |
| [PLAN_GUIDED_TOURS.md](PLAN_GUIDED_TOURS.md) | Plan GT1: Centralizar guided tours (próxima sesión) |

---

## CONTEXTO PARA PRÓXIMA SESIÓN

> **Última sesión:** 03 Febrero 2026 (sesión 4)
> **Sprint activo:** OB1 - Onboarding

### Resumen de lo completado (sesión 4 - 03/02/26)
1. ✅ **OB1: CSS externalizado de login.html y register.html**
   - Creados `css/login.css` y `css/register.css` (eliminadas ~500 líneas de CSS inline)
   - Ambas páginas ahora usan `design-system.css` (tipografía Inter, variables CSS, reset centralizado)
2. ✅ **Consistencia visual login/register:**
   - Mismo centrado flex (vertical + horizontal) en ambas páginas
   - Border-radius normalizados: inputs `var(--radius-md)` 8px, botones `var(--radius-lg)` 12px
   - Colores hardcoded reemplazados por variables CSS
   - Breakpoint unificado a 768px
   - Button min-height normalizado a 44px (WCAG AA)
3. ✅ **Mejoras UX del registro:**
   - Cards de tipo usuario: layout horizontal compacto (emoji izquierda, texto derecha)
   - Progress dots con micro-labels ("Tipo", "Datos", "Clave")
   - Indicador de fortaleza de contraseña (débil/media/fuerte con barra visual)
   - Checkbox custom de 24x24px con check azul
   - Logo de ChambApp agregado al header del registro
   - Botón "Crear Cuenta" ya no se parte en 2 líneas (`white-space: nowrap`)
   - Bordes de inputs más visibles (`var(--gray-300)`)
   - Ancho del container fijo entre pasos (fix `<main>` width)
4. ✅ **Fix validación prematura:** Anulados bordes verdes/rojos automáticos de `accessibility.css` en login/register

### Sesiones anteriores
- **Sesión 3 (03/02/26):** Cards compactas móvil, filtros reestructurados, chips de fecha
- **Sesión 2 (03/02/26):** Fix headers inconsistentes (centralizar CSS en design-system.css)
- **Sesión 1:** Plan de refactorización + Sprint G1-G6 completo

### Bottom Nav por Rol
| Botón | Trabajador | Empleador |
|-------|------------|-----------|
| 1º | Mis Apps | Historial |
| 2º | Inicio | Candidatos |
| 3º | Explorar | Publicar |
| 4º | Alertas | Alertas |
| 5º | Perfil Trab. | Perfil Emp. |

### Filtros Mobile - Arquitectura
```
SIEMPRE VISIBLE (quick bar):
[Buscar...          ] [⚙️]
[Categorias ▼] [Ordenar ▼] [🔄]
[chips activos scroll horizontal]

BOTTOM SHEET (~55vh, al tocar ⚙️):
  Ubicacion     Distancia
  [input]       [dropdown]
  Rango Salarial
  [Min S/] — [Max S/]
  Publicacion
  (Hoy)(3d)(7d)(Todas)
  [Ver X resultados]
```
- Controles duplicados mobile/desktop sincronizados via `syncControls()`
- CSS show/hide: `.filtros-quick-bar`, `.filtros-mobile-only` (ocultos en desktop)
- `.filtros-header`, `.filtros-desktop-only` (ocultos en mobile)
- Overlay: div `#filtros-overlay` con clase `.active`

### Próximas tareas sugeridas
1. **GT1** - Centralizar guided tours / coach marks (tours existentes rotos)
2. **Task 33** - Error states y validaciones
3. **Tasks 37-39** - Performance y PWA
4. **Fase 2: Diferenciación** - Sistema freemium, verificación DNI

### Notas técnicas
- Estados de oferta: `activa` | `en_curso` | `completada` | `caducada`
- Ofertas visibles: `estado === 'activa' AND fechaExpiracion > ahora`
- Al editar oferta: fechaExpiracion se resetea a +14 días
- Ordenamiento y filtro de fecha usan `fechaActualizacion || fechaCreacion`
- Cards móvil: layout horizontal con `data-categoria` para color de borde

---

**Fundador:** Joel (jrvl83)
**Versión documento:** 3.3
