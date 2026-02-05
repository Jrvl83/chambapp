# PROYECTO CHAMBAPP

**Marketplace de Trabajos Temporales - Perú**
**Última actualización:** 04 Febrero 2026 (sesión 6)

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
FASE 1: ███████████████████████░░░░░ 71% (35/49 tareas)
FASE 2: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (0/44 tareas)
FASE 3: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (0/44 tareas)
FASE 4: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (0/44 tareas)

TOTAL:  20% del proyecto (35/176 tareas)
```

### Features Implementadas
- Registro/Login con Firebase Auth
- Perfiles trabajadores y empleadores con fotos
- Publicar ofertas de trabajo con geolocalización
- Mapa interactivo de ofertas (Google Maps)
- Postulaciones con estados (pendiente/aceptado/rechazado/completado)
- Vacantes múltiples por oferta (1-20 trabajadores)
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
| GT1 | Centralizar guided tours: 4 archivos → 2, fix selectores rotos, UX mejorada | 04 Feb |
| V1 | Vacantes múltiples: 1-20 por oferta, multi-aceptación con transaction, completar individual | 04 Feb |

### Tareas Pendientes (11)

| # | Tarea | Prioridad |
|---|-------|-----------|
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
| GT1 | Centralizar guided tours | Motor centralizado + config de 4 tours, fix selectores rotos, UX mejorada | **Alta** | ✅ HECHO |

### Arquitectura implementada
```
js/components/guided-tour.js   → Motor centralizado (IIFE → window.GuidedTour)
js/config/tours.js              → Definiciones de 4 tours (dashboard, publicar, aplicaciones x2)
css/introjs-custom.css          → Estilos personalizados (existente, mejorado)
```

### Funcionalidades del motor
- Intro.js v7 CDN con carga condicional (solo si tour no completado)
- Highlight con overlay oscuro + borde azul pulsante
- Tooltip posicionado automáticamente con scroll to tooltip
- Navegación: "Siguiente", "Atrás", "Saltar" + step counter nativo
- Barra de progreso animada con shimmer
- `localStorage` con compatibilidad de keys legacy
- Bottom nav enforcer (oculta bottom nav durante todo el tour)
- Multi-secuencia para dashboard, single para el resto
- Responsive mobile-first + iOS safe areas + dark mode

### Páginas con tour activo
- `dashboard.html` — Multi-secuencia: bienvenida → nav → stats/ofertas/filtros → listo
- `publicar-oferta.html` — 7 pasos: progreso, título, categoría, descripción, navegación
- `mis-aplicaciones.html` — 4 pasos: resumen, aplicantes, listo
- `mis-aplicaciones-trabajador.html` — 5 pasos: stats, filtros, postulaciones, listo

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
│   ├── config/ (firebase-config.js, tours.js)
│   ├── auth/, dashboard/, utils/
│   ├── components/ (bottom-nav.js, guided-tour.js)
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
| [PLAN_GUIDED_TOURS.md](PLAN_GUIDED_TOURS.md) | Plan GT1: Centralizar guided tours (completado 04/02/26) |
| [PLAN_REFACTORIZACION_JS.md](PLAN_REFACTORIZACION_JS.md) | Plan de modularización JS: 7 archivos >500 líneas → ~35 módulos |

---

## CONTEXTO PARA PRÓXIMA SESIÓN

> **Última sesión:** 04 Febrero 2026 (sesión 6)
> **Sprint activo:** Feature Vacantes

### Resumen de lo completado (sesión 6 - 04/02/26)
1. ✅ **V1: Sistema de vacantes múltiples por oferta**
   - Campo vacantes (input numérico 1-20) en formulario publicar-oferta
   - `runTransaction` para aceptación atómica (previene race conditions)
   - Lógica híbrida: oferta `activa` hasta llenar TODAS las vacantes → `en_curso`
   - Completar trabajo es individual por trabajador
   - Badge "👥 X vacantes" en dashboard trabajador, historial y mapa
   - Cloud Function: ofertas con aceptados parciales → `en_curso` en vez de `caducada`
   - Backward compatible: ofertas sin campo vacantes se tratan como `vacantes: 1`
   - Archivos modificados: publicar-oferta.html/js, mis-aplicaciones.js, dashboard.js, historial-ofertas.js, mapa-ofertas.js, functions/index.js

2. ✅ **Fixes durante implementación:**
   - Bug race condition: transaction antes de updateDoc aplicación
   - Bug validación: verificar vacantes disponibles dentro de transaction
   - Bug every() vacío: guard para array vacío en verificarTodosCompletados
   - Bug edición: no reducir vacantes por debajo de aceptados actuales
   - Bug servidor: `npx serve` elimina query strings → usar `http-server`

### Sesiones anteriores
- **Sesión 5 (04/02/26):** GT1 - Centralizar guided tours, motor único, fix selectores
- **Sesión 4 (03/02/26):** OB1 - CSS externalizado login/register, mejoras UX registro
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
1. **Task 33** - Error states y validaciones
2. **Task 35** - Accesibilidad WCAG 2.1 AA
3. **Tasks 37-39** - Performance y PWA
4. **Fase 2: Diferenciación** - Sistema freemium, verificación DNI

### Notas técnicas
- Estados de oferta: `activa` | `en_curso` | `completada` | `caducada`
- Ofertas visibles: `estado === 'activa' AND fechaExpiracion > ahora`
- Al editar oferta: fechaExpiracion se resetea a +14 días
- Ordenamiento y filtro de fecha usan `fechaActualizacion || fechaCreacion`
- Cards móvil: layout horizontal con `data-categoria` para color de borde
- **Vacantes:** oferta.vacantes (1-20), aceptadosCount, trabajadoresAceptados[]
- **Flujo vacantes:** activa (aceptando) → en_curso (todas llenas) → completada (todos terminaron)
- **Servidor local:** usar `npx http-server -p 8080 -c-1` (no `npx serve` que elimina query strings)

---

**Fundador:** Joel (jrvl83)
**Versión documento:** 3.5
