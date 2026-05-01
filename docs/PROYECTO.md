# PROYECTO CHAMBAYA (ex-ChambApp)

**Marketplace de Trabajos Temporales - Perú**
**Última actualización:** 01 Mayo 2026 (sesión 37)

---

## RESUMEN EJECUTIVO

ChambaYa conecta trabajadores ("chamberos") con empleadores para trabajos temporales en Perú. Diferenciador clave: **0% comisiones** (competidores cobran 15-25%).

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
FASE 1: ██████████████████████████████ 100% ✅ COMPLETADA
FASE 2: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (0/44 tareas)
FASE 3: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (0/44 tareas)
FASE 4: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (0/44 tareas)

TOTAL:  32% del proyecto (62/194 tareas)
```

> **Nota:** Fase 1 incluye 48 tareas numeradas (1-48) + 3 extras (OB1, GT1, V1) + Sprint G1-G6 (6) + tareas nuevas (49-51) = 62 tareas totales.

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
- Perfil público de trabajador (read-only para empleadores)
- Validaciones inline y error states en formularios
- Modal de confirmación customizado (reemplaza confirm() nativo)
- PWA instalable (Service Worker con cacheo, install prompt, offline page)
- Login con Google (Gmail) + detección automática de cuentas Google
- Emails brandeados ChambaYa (verificación + reset password)
- Performance: resource hints, defer scripts, lazy CSS/imágenes, Firestore offline
- Panel de administración (stats, métricas, reportes, ofertas, usuarios, bloqueo)
- Sistema de reportes bidireccional (ofertas y perfiles de trabajador)
- Bloqueo de cuentas con página dedicada `cuenta-suspendida.html`
- **Fase 2 Mejoras Visuales (MV-1→MV-19):** variables de estado CSS, SVG icons (icons.js), logo two-tone ChambaYa, reportar modal al design system, empty states SVG, emoji cleanup completa, login rediseñado al mockup, dashboard trabajador rediseñado (bottom nav flat 5 tabs, offer cards), page loading overlay con MutationObserver (13 páginas)
- **Safe areas modulares:** `--safe-top`/`--safe-bottom` en `design-system.css`; migrados 6 archivos CSS; fix modal scroll-through iOS (`touch-action:none` + `overscroll-behavior:contain`)
- **Header compartido modular:** `shared-header.css` + `shared-header.js` inyecta avatar+nombre+plan en 10 páginas vía `#app-header`
- **Expiración de sesión 90 días (BT1):** `loginTimestamp` en localStorage al login; `verificarExpiracionSesion()` en `auth-guard.js`

---

## FASE 1: EXPERIENCIA WOW (60 tareas)

### Tareas Completadas (41)

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
| 33 | Error states, validaciones inline, modal confirmación, sanitización | 16 Feb |
| 34 | Loading states (spinner centrado) | 30 Ene |
| 37-39 | Performance + PWA (SW caching, offline, install prompt, lazy CSS/imgs, Firestore persistence) | 17 Feb |
| 49-50 | Login con Google (Gmail) + Email templates brandeados ChambaYa | 17 Feb |
| 51 | Auditoría de seguridad: XSS prevention (escapeHtml en 6 archivos), Firestore/Storage rules endurecidas, limpieza config/keys, SW reload fix, Firestore persistence API migrada | 17 Feb |
| 45-48 | Panel de administración: stats globales, métricas, gestión de reportes, ofertas y usuarios, bloqueo/desbloqueo de cuentas | 26 Feb |
| - | Sistema de reportes: reportar-modal.js reutilizable, botones en ofertas y perfil público, admin ver detalle completo (fotos, postulantes, perfil trabajador) | 26 Feb |
| - | Bloqueo consistente: auth-guard.js (verificarBloqueo + manejarBloqueado), cuenta-suspendida.html, check en 10 páginas protegidas | 26 Feb |
| - | UX: Bottom nav, dashboard por rol, logo, colores unificados | 22-28 Ene |
| OB1 | Onboarding: externalizar CSS login/register, centrado, consistencia, UX mejoras | 03 Feb |
| GT1 | Centralizar guided tours: 4 archivos → 2, fix selectores rotos, UX mejorada | 04 Feb |
| V1 | Vacantes múltiples: 1-20 por oferta, multi-aceptación con transaction, completar individual | 04 Feb |

### Tareas Pendientes (0) — FASE COMPLETADA ✅

| # | Tarea | Estado |
|---|-------|--------|
| 40-44 | Testing y QA | ✅ HECHO |
| 45-48 | Panel de administración | ✅ HECHO |
| 35 | Accesibilidad WCAG 2.1 AA | ⏩ Diferida (post-lanzamiento) |
| 36 | Dark mode | ⏩ Diferida (opcional) |

### Backlog Técnico (a futuro)

| # | Tarea | Descripción | Prioridad |
|---|-------|-------------|-----------|
| BT3 | **Distribución nativa Android + iOS (Capacitor + Codemagic)** | **Cambio de foco estratégico: salir en Google Play Store y App Store en lugar de solo PWA.** Usar Capacitor (Ionic) para envolver la app web existente en una shell nativa sin reescribir JS/HTML/CSS. **Stack de build:** Codemagic como CI/CD en Mac virtual (no se necesita Mac físico). **Cuentas requeridas (ninguna creada aún):** Apple Developer Program $99/año (apple.com) + Google Play Developer $25 única vez. **Plugins a migrar:** FCM web → `@capacitor-firebase/messaging`, Geolocation API → `@capacitor/geolocation`, `<input type="file">` → `@capacitor/camera`. **Pasos técnicos:** (1) `npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios`. (2) `npx cap init` + `npx cap add android` + `npx cap add ios`. (3) Migrar plugins nativos. (4) Ajustar splash screen, iconos y deep links. (5) Conectar repo a Codemagic + configurar `codemagic.yaml`. (6) Subir certificados Apple a Codemagic (lo más complejo — portal de Apple es confuso). (7) Build Android → AAB → Google Play internal track. (8) Build iOS → IPA → App Store review (1-3 días). **Costos estimados:** Codemagic free tier 500 min/mes (suficiente en esta etapa), pago ~$45/mes solo si se supera. **Dificultad real:** la parte técnica es moderada; lo más confuso es el portal de certificados de Apple (primera vez). | 🔴 CRÍTICA |
| BT1 | ~~Expiración de sesión~~ | ✅ **COMPLETADO 01/05/26 (sesión 37)** — `loginTimestamp` guardado al login (email + Google). `verificarExpiracionSesion()` en `auth-guard.js`: si pasaron >90 días → limpia localStorage + redirect login. Llamado en `mis-aplicaciones`, `mis-aplicaciones-trabajador` y `publicar-oferta`. | ✅ Hecho |
| BT2 | Optimización de costos Firebase a escala | (1) Reemplazar `onSnapshot` por `getDoc` donde no se necesite tiempo real. (2) Revisar índices compuestos y agregar paginación (`limit` + cursor). (3) Verificar que `optimizarImagen()` se aplica en todos los flujos de subida. (4) Cachear resultado de `verificarBloqueo` en `sessionStorage` con TTL 5-10 min. (5) Desnormalizar datos críticos en documentos de aplicación para eliminar queries en cascada. | Baja (pre-escala) |

### Tareas Diferidas (7)
- Tasks 18, 19, 20: Chat in-app (WhatsApp cubre la necesidad)
- Task 22: Historial de mensajes (mismo motivo)
- Tasks 25-26: Búsqueda avanzada premium
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
La app tenía guided tours en varias páginas pero se rompieron con las actualizaciones de HTML/CSS. Además, el código de tours estaba mezclado dentro de cada página (no centralizado), lo que dificulta el mantenimiento.

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

### Fase 2: Diferenciación y Premium (0% — 24 tareas definidas, reordenada 27/02/26)

> Reordenada 27/02/26: construir todo primero, publicar en stores al final.
> Motivo: (1) lanzar con freemium desde el día 1 evita que usuarios se acostumbren a todo gratis,
> (2) cada update en App Store requiere review Apple de 1-3 días — mejor llegar completo.

---

#### BLOQUE A — Preparación (hacer primero, en paralelo con features)

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| F2-A1 | **Registrar dominio chambaya.com** | Registrar en Namecheap o GoDaddy (~$12/año). Evaluar también chambaya.pe (dominio peruano, más local). Apuntar DNS a Firebase Hosting (`firebase hosting:sites`). **Hacerlo YA** — es prerequisito para el flujo de pago Premium y para las fichas de stores. | Pendiente |
| F2-A2 | Crear cuentas en stores | Apple Developer Program ($99/año) + Google Play Developer ($25). Hacerlo YA porque Apple puede tardar días en aprobar la cuenta. | Pendiente |
| F2-A3 | Integrar Capacitor | `npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios` + `npx cap init` + `npx cap add android/ios` | Pendiente |
| F2-A4 | Migrar plugins nativos | FCM web → `@capacitor-firebase/messaging`. Geolocation API → `@capacitor/geolocation`. `<input type="file">` → `@capacitor/camera` | Pendiente |
| F2-A5 | Assets nativos | Splash screen + iconos en todos los tamaños requeridos por Android (mipmap) e iOS (Assets.xcassets). Adaptar logo CY. | Pendiente |
| F2-A6 | Deep links | Configurar URL scheme (`chambaya://`) y App Links (Android) / Universal Links (iOS) | Pendiente |
| F2-A7 | Configurar Codemagic | Conectar repo GitHub + `codemagic.yaml` + subir certificados Apple + keystore Android | Pendiente |

---

#### BLOQUE B — Features y monetización (construir antes de publicar)

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| F2-B1 | Expiración de sesión | `loginTimestamp` en localStorage al login. Check en `auth-guard.js`: si >90 días → signOut + redirect login. | ✅ COMPLETADO (01/05/26) |
| F2-B2 | Sistema favoritos — trabajador | Ícono bookmark en cards de oferta. Colección `favoritos` en Firestore por usuario. Nueva sección "Guardadas" en mis-aplicaciones-trabajador. | Pendiente |
| F2-B3 | Sistema favoritos — empleador | Ícono bookmark en perfil público de trabajador. Sección "Talentos guardados" en dashboard empleador. | Pendiente |
| F2-B4 | Dashboard estadísticas trabajador | Página o sección con: total postulaciones, tasa de aceptación, calificación promedio, categorías más aplicadas, historial visual. | Pendiente |
| F2-B5 | Matching inteligente | Ordenar ofertas por score: categoría del trabajador (peso alto) + distancia (peso medio) + salario (peso bajo). Badge "Recomendada para ti". | Pendiente |
| F2-B6 | Verificación DNI | Integrar API RENIEC o similar. Badge "Verificado ✓" en perfil público. Aumenta confianza del empleador. | Pendiente |
| F2-B7 | Sistema Freemium | Límite de 5 chambas **concluidas** (no postulaciones, no mensual — límite único vitalicio). Campo `chambasCompletadas` en Firestore en el perfil del trabajador. Al marcar una chamba como completada, incrementar contador. Al llegar a 5, bloquear nuevas postulaciones y mostrar modal de upgrade con instrucciones para ir a la web (ver F2-B8). | Pendiente |
| F2-B8 | Página web `/premium` (chambaya.com/premium) | **Nueva página en el proyecto web existente** (ya hospedado en Firebase). Detecta si el usuario tiene sesión activa via Firebase Auth. Si no está logueado → redirect a login.html con `?redirect=premium`. Si está logueado → muestra beneficios Premium + formulario de pago Culqi (S/.20/mes). Al confirmar pago, Cloud Function webhook de Culqi actualiza `plan: 'premium'` + `premiumDesde` en Firestore. La app nativa detecta el cambio via `onSnapshot` y desbloquea al instante. | Pendiente |
| F2-B9 | Modal de upgrade en app (estilo Spotify) | Modal que aparece al intentar postular con 5 chambas ya concluidas. Muestra beneficios Premium + instrucciones para ir a chambaya.com/premium. **iOS:** URL como texto plano (Apple prohíbe links directos a páginas de pago externas). **Android:** botón "Activar Premium" que abre el navegador directamente a chambaya.com/premium. | Pendiente |
| F2-B10 | UI Premium | Badge "PRO" en perfil trabajador. Destacar perfil en búsquedas de empleadores (aparece primero). Ocultar modal de límite. | Pendiente |

---

#### BLOQUE C — Admin: features post-pagos (después de implementar freemium)

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| F2-C1 | Admin — Gestión de planes Premium (Task 46b) | `js/admin/planes.js`. Modal en tab Usuarios para otorgar/extender premium manualmente con duración elegida (1/2/3/6 meses) y nota interna. Historial de cambios (`premiumHistorial` array con origen: `pago | admin | sorteo`). Feature sorteo: elegir N ganadores al azar de la lista filtrada visible, modal confirmación, asignación en batch con `Promise.all()`. Modelo de datos: `plan`, `premiumHasta`, `premiumHistorial` en doc usuario. | Pendiente |
| F2-C2 | Admin — Verificación de antecedentes (Task 46c) | Solo para trabajadores Premium. Botón "Solicitar verificación" en perfil trabajador. Sube certificado PNP/Poder Judicial a Storage. Estado "En revisión ⏳". Admin aprueba/rechaza desde sub-vista "Verificaciones" en tab Usuarios. Al aprobar: badge "Verificado ✓" en perfil público, perfil propio y cards de candidatos. Vigencia 12 meses. Campos: `verificado`, `verificacionEstado`, `verificacionHasta`, `verificacionDoc`. | Pendiente |
| F2-C3 | Admin — Gestión dinámica de categorías | Nueva tab "Categorías" en panel admin. Colección Firestore `categorias/{slug}` con campos: `nombre`, `icono` (emoji), `color` (hex), `orden` (int), `activa` (bool). Admin puede crear, editar, activar/desactivar categorías. Desactivar oculta la categoría en la app sin borrar ofertas existentes. **Cambio en la app:** `js/components/filtros-avanzados/constants.js` deja de hardcodear — todas las páginas que usan categorías (filtros, publicar-oferta, dashboard matching) las cargan desde Firestore al iniciar. Caché en `sessionStorage` con TTL 1 hora para no hacer reads en cada página. Firestore rules: solo admin puede escribir en `categorias`, todos pueden leer. | Pendiente |
| F2-C4 | Admin — Configuración global de la app | Nueva tab "Configuración" en panel admin. Colección Firestore `admin/config` (single doc). Admin edita y guarda — la app lee al iniciar con caché `sessionStorage` TTL 1h y fallback a valores por defecto si Firestore falla. **Campos configurables:** (1) `duracionOfertaDias` (default: 14) — vigencia de ofertas activas; al cambiar afecta nuevas ofertas y Cloud Function de caducidad. (2) `maxFotosOferta` (default: 5) — máximo de fotos al publicar oferta; en Premium podría ser mayor. (3) `maxFotosPortfolio` (default: 10) — máximo de fotos en portfolio del trabajador. (4) `maxVacantesOferta` (default: 20) — máximo de vacantes por oferta. (5) `salarioMaxFiltro` (default: 5000) — techo del slider salarial en filtros. (6) `textoNotifNuevaApp` y `textoNotifAceptado` — copy de las notificaciones push (evita redesplegar Cloud Functions para cambiar texto). **Seguridad:** Firestore rules: solo admin puede leer/escribir `admin/config`. La app lee via Cloud Function o con regla especial de solo lectura pública. | Pendiente |

---

#### BLOQUE D — Publicación en stores (cuando todo lo anterior esté listo)

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| F2-D1 | Build interno + QA nativo | Build Android (AAB) → Google Play internal testing. Build iOS (IPA) → TestFlight. Verificar funcionalidad completa en dispositivo real. | Pendiente |
| F2-D2 | Publicar Android | Google Play: internal → closed testing → production. Redactar ficha (descripción, capturas, categoría). | Pendiente |
| F2-D3 | Publicar iOS | App Store Connect: subir build → review Apple (1-3 días). Redactar ficha App Store. | Pendiente |

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
| Free | Hasta 5 chambas concluidas (límite único, no mensual). Sin ads por ahora. | Todo gratis siempre |
| Premium S/.20/mes | Chambas ilimitadas, destacado en búsquedas. Sin ads. | N/A |

> **Nota:** El límite free es sobre **chambas concluidas** (no postulaciones enviadas). Una vez alcanzadas las 5, se muestra modal de upgrade. El contador vive en Firestore en el perfil del trabajador (`chambasCompletadas`). No hay reset mensual.

**Diferenciador:** 0% comisiones vs competencia (15-25%)

---

## CONFIGURACIÓN TÉCNICA

### API Keys
```
Google Maps: (ver js/config/api-keys.js - restringida por dominio en Google Cloud Console)
Firebase: chambapp-7785b
Plan: Blaze (activo)
```

> **Nota:** No incluir API keys en documentación. Están en `js/config/api-keys.js` y restringidas por dominio/referrer en la consola de Google Cloud.

### Estructura de Carpetas
```
chambapp/
├── index.html                          # Landing page
├── login.html, register.html           # Auth
├── dashboard.html                      # Dashboard principal (empleador/trabajador)
├── publicar-oferta.html                # Publicar oferta (empleador)
├── mapa-ofertas.html                   # Mapa interactivo de ofertas
├── mis-aplicaciones.html               # Gestión de aplicantes (empleador)
├── mis-aplicaciones-trabajador.html    # Mis postulaciones (trabajador)
├── perfil-trabajador.html              # Perfil del trabajador (editable)
├── perfil-publico.html                 # Perfil público trabajador (read-only, empleadores)
├── perfil-empleador.html               # Perfil del empleador
├── historial-ofertas.html              # Historial de ofertas (empleador)
├── historial-calificaciones.html       # Historial de calificaciones
├── notificaciones.html                 # Centro de notificaciones
├── offline.html                        # Fallback offline PWA
├── manifest.json                      # PWA manifest (scope: "/")
├── firebase-messaging-sw.js           # Service Worker (FCM + cacheo PWA)
│
├── css/
│   ├── design-system.css               # Variables CSS, tokens, reset
│   ├── components.css                  # Componentes reutilizables (cards, badges, etc.)
│   ├── modal.css                       # Modal unificado (12 modales, 7 páginas)
│   ├── calificacion-modal.css          # Modal de calificación (estrellas, comentario)
│   ├── oferta-detalle.css              # Detalle de oferta compartido
│   ├── animations.css                  # Animaciones globales
│   ├── bottom-nav.css                  # Navegación inferior móvil
│   ├── toast.css                       # Notificaciones toast
│   ├── notifications.css               # Badge de notificaciones
│   ├── header-simple.css               # Header legacy (páginas que aún no migraron)
│   ├── shared-header.css               # Header compartido modular (todas las páginas)
│   ├── accessibility.css               # Estilos de accesibilidad
│   ├── introjs-custom.css              # Estilos guided tours
│   ├── filtros-avanzados.css           # Filtros avanzados
│   ├── login.css, register.css         # Auth pages
│   ├── styles.css                      # Landing page
│   ├── dashboard-main.css              # Dashboard
│   ├── dashboard-empleador.css         # Dashboard empleador
│   ├── publicar-oferta.css             # Publicar oferta
│   ├── mapa-ofertas.css                # Mapa de ofertas
│   ├── mis-aplicaciones.css            # Aplicaciones empleador
│   ├── mis-aplicaciones-trabajador.css # Aplicaciones trabajador
│   ├── perfil-trabajador.css           # Perfil trabajador (editable)
│   ├── perfil-publico.css             # Perfil público trabajador (read-only)
│   ├── historial-ofertas.css           # Historial ofertas
│   ├── historial-calificaciones.css    # Historial calificaciones
│   └── notificaciones.css              # Centro notificaciones
│
├── js/
│   ├── config/
│   │   ├── firebase-config.js          # Configuración Firebase
│   │   ├── firebase-init.js            # Inicialización Firebase
│   │   ├── api-keys.js                 # API keys
│   │   └── tours.js                    # Definiciones de guided tours
│   │
│   ├── auth/
│   │   ├── login.js                    # Login
│   │   ├── register.js                 # Registro
│   │   └── google-auth.js             # Login con Google (Gmail)
│   │
│   ├── utils/
│   │   ├── formatting.js              # Fechas, estrellas, moneda
│   │   ├── image-utils.js             # Optimización/validación imágenes
│   │   ├── dom-helpers.js             # escapeHtml, crearElemento, etc.
│   │   ├── validators.js              # Validaciones puras (nombre, tel, edad, horarios)
│   │   ├── form-errors.js             # UI errores inline (showFieldError/hideFieldError)
│   │   ├── error-handler.js           # Mensajes amigables + toast retry
│   │   ├── calificacion-utils.js      # Utilidad compartida de calificaciones
│   │   ├── employer-rating.js         # Rating del empleador
│   │   ├── google-maps.js             # Carga Google Maps API
│   │   ├── geolocation.js             # Geolocalización del usuario
│   │   ├── distance.js                # Cálculo de distancias
│   │   ├── ubigeo-api.js              # API ubigeo Perú
│   │   ├── sanitize.js                # Sanitización de datos
│   │   ├── auth-guard.js              # verificarBloqueo + manejarBloqueado + verificarExpiracionSesion
│   │   ├── shared-header.js           # Header modular inyectado vía #app-header (sesión 37)
│   │   ├── page-loader.js             # Overlay de carga con logo+spinner, MutationObserver (sesión 36)
│   │   ├── icons.js                   # Constantes SVG reutilizables (sesión 32)
│   │   ├── logger.js                  # Logger
│   │   └── migrar-ofertas.js          # Migración de datos
│   │
│   ├── components/
│   │   ├── oferta-card.js             # Card de oferta reutilizable
│   │   ├── oferta-detalle.js          # Detalle de oferta compartido (3 páginas)
│   │   ├── rating-input.js            # Input de calificación con estrellas
│   │   ├── confirm-modal.js           # Modal confirmación (reemplaza confirm())
│   │   ├── reportar-modal.js          # Modal reportar oferta/usuario (sesión 25)
│   │   ├── bottom-nav.js              # Navegación inferior móvil
│   │   ├── guided-tour.js             # Motor de guided tours
│   │   ├── filtros-avanzados.js       # Entry point (legacy)
│   │   └── filtros-avanzados/         # Módulos de filtros
│   │       ├── index.js               # Coordinador
│   │       ├── constants.js           # Constantes (categorías, etc.)
│   │       ├── custom-dropdown.js     # Dropdown personalizado
│   │       ├── multi-select.js        # Selector múltiple
│   │       ├── dual-range.js          # Rango dual (salario)
│   │       └── chips.js               # Chips de filtros activos
│   │
│   ├── dashboard/                     # Módulos del dashboard
│   │   ├── index.js                   # Coordinador
│   │   ├── dashboard.js               # Entry point (legacy)
│   │   ├── empleador.js               # Vista empleador
│   │   ├── trabajador.js              # Vista trabajador
│   │   ├── modal-detalle.js           # Modal detalle oferta
│   │   ├── geolocation.js             # Geo del dashboard
│   │   └── notificaciones-push.js     # Push notifications
│   │
│   ├── publicar-oferta/               # Módulos publicar oferta
│   │   ├── index.js                   # Coordinador
│   │   ├── form-navigation.js         # Navegación multi-paso
│   │   ├── ubicacion.js               # Selección de ubicación
│   │   ├── google-maps-ubicacion.js   # Mapa para ubicación
│   │   ├── fotos.js                   # Galería de fotos
│   │   └── submit.js                  # Envío del formulario
│   │
│   ├── mapa-ofertas/                  # Módulos mapa de ofertas
│   │   ├── index.js                   # Coordinador
│   │   ├── mapa.js                    # Inicialización del mapa
│   │   ├── markers.js                 # Marcadores y clusters
│   │   ├── detalle.js                 # Modal detalle oferta
│   │   └── postulacion.js             # Postulación desde mapa
│   │
│   ├── mis-aplicaciones/              # Módulos aplicaciones (empleador)
│   │   ├── index.js                   # Coordinador
│   │   ├── cards.js                   # Renderizado de cards
│   │   ├── acciones.js                # Aceptar/rechazar/completar
│   │   ├── calificaciones.js          # Calificar trabajador
│   │   └── filtros.js                 # Filtros de aplicaciones
│   │
│   ├── mis-aplicaciones-trabajador/   # Módulos aplicaciones (trabajador)
│   │   ├── index.js                   # Coordinador
│   │   ├── cards.js                   # Renderizado de cards
│   │   ├── detalle.js                 # Modal detalle oferta
│   │   └── calificaciones.js          # Calificar empleador
│   │
│   ├── perfil-trabajador/             # Módulos perfil trabajador (editable)
│   │   ├── index.js                   # Coordinador
│   │   ├── portfolio.js               # Portafolio de fotos
│   │   ├── resenas.js                 # Reseñas y respuestas
│   │   ├── guardar.js                 # Guardar perfil
│   │   └── experiencia-habilidades.js # Experiencia y skills
│   │
│   ├── perfil-publico/                # Módulos perfil público (read-only)
│   │   ├── index.js                   # Coordinador + render
│   │   └── templates.js              # Templates HTML puros
│   │
│   ├── pwa/
│   │   ├── install-prompt.js          # Banner instalación PWA (cooldown 7 días)
│   │   └── sw-update.js              # Detección nuevo SW + toast actualización
│   │
│   ├── notifications/
│   │   └── fcm-init.js               # Inicialización FCM
│   │
│   ├── toast.js                       # Sistema de toasts
│   ├── notificaciones.js              # Centro de notificaciones
│   ├── historial-ofertas.js           # Historial de ofertas
│   ├── historial-calificaciones.js    # Historial de calificaciones
│   ├── perfil-empleador.js            # Perfil del empleador
│   │
│   │  # Legacy entry points (redirigen a módulos)
│   ├── publicar-oferta.js
│   ├── mapa-ofertas.js
│   ├── mis-aplicaciones.js
│   ├── mis-aplicaciones-trabajador.js
│   └── perfil-trabajador.js
│
├── assets/
│   ├── icons/                         # Iconos PWA
│   └── logo/                          # logo-completo.png, logo-icono.png
│
├── functions/
│   ├── index.js                       # Cloud Functions (caducidad, ratings)
│   └── package.json
│
└── docs/
    ├── PROYECTO.md                    # Este archivo
    ├── REGLAS_DESARROLLO.md           # Estándares de código
    ├── SEGURIDAD.md                   # Checklist de seguridad y acciones manuales
    ├── PLAN_REFACTORIZACION.md        # Plan refactorización CSS
    ├── PLAN_REFACTORIZACION_JS.md     # Plan modularización JS
    ├── PLAN_GUIDED_TOURS.md           # Plan guided tours (completado)
    ├── UX_UI_GUIA_MAESTRA.md         # Guía de diseño
    └── README.md
```

---

## COMANDOS ÚTILES

```bash
# Ejecutar localmente (http-server preserva query strings, serve los elimina)
cd C:\Users\JOEL\Documents\Proyectos\Chambapp
npx http-server -p 8080 -c-1

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
| [PLAN_MEJORAS_VISUALES.md](PLAN_MEJORAS_VISUALES.md) | 14 tareas de pulido visual: ajustes mockup, consistencia global, identidad de marca, assets para stores |

---

## CONTEXTO PARA PRÓXIMA SESIÓN

> **Última sesión:** 27 Febrero 2026 (sesión 26)

### Decisiones estratégicas tomadas (sesión 26)
- ✅ **Fase 1 declarada COMPLETA (100%)** — Tasks 40-44 (Testing/QA) confirmados. Tasks 35 (accesibilidad) y 36 (dark mode) diferidos a post-lanzamiento.
- ✅ **Cambio de foco: distribución nativa** — Salir en Google Play Store + App Store (no solo PWA). Via Capacitor + Codemagic (Mac virtual, sin Mac físico). Documentado como BT3.
- ✅ **Monetización definida** — Freemium: 5 chambas **concluidas** (límite vitalicio, no mensual). Premium S/.20/mes vía Culqi en **web** (chambaya.com/premium), no dentro de la app — evita 30% de Apple/Google (estrategia Spotify). Sin ads por ahora.
- ✅ **Dominio chambaya.com** — No registrado aún. Prioridad alta (F2-A1). Evaluar también chambaya.pe.
- ✅ **Fase 2 estructurada** — 24 tareas en 4 bloques: Preparación nativa (A), Features + monetización (B), Admin post-pagos (C), Publicación en stores (D).
- ✅ **Admin: categorías dinámicas (F2-C3)** — Colección Firestore `categorias/{slug}`. App carga desde Firestore en lugar de hardcodear en constants.js. Caché sessionStorage TTL 1h.
- ✅ **Admin: config global (F2-C4)** — Single doc `admin/config` con: duracionOfertaDias, maxFotosOferta, maxFotosPortfolio, maxVacantesOferta, salarioMaxFiltro, textos notificaciones push.

### Implementaciones completadas (sesiones 24-25)
- ✅ **Panel Admin (tasks 45-48):** stats globales, métricas, gestión de reportes/ofertas/usuarios, bloqueo de cuentas
- ✅ **Sistema de Reportes:** `reportar-modal.js` reutilizable, botones en ofertas y perfil público, admin con detalle completo
- ✅ **Bloqueo Consistente:** `auth-guard.js` + `cuenta-suspendida.html` + check en 10 páginas protegidas

### Refactorizaciones completadas
- ✅ **JS modularizado:** 7 archivos >500 líneas → 41 módulos (0 archivos >500 líneas) + 2 módulos perfil-publico
- ✅ **CSS modal unificado:** `css/modal.css` reemplaza duplicados en 8 archivos (~740 líneas eliminadas)
- ✅ **Detalle de oferta compartido:** `js/components/oferta-detalle.js` + `css/oferta-detalle.css` (3 páginas)
- ✅ **UX mis-aplicaciones-trabajador:** Prioridad de contenido corregida (~570px→190px sobre cards), contacto colapsable, stats como pills filtro, CSS 855→522 líneas
- ✅ **Error states y validaciones (Task 33):** validators.js, form-errors.js, confirm-modal.js, error-handler.js + sanitización en guardados
- ✅ **Performance + PWA (Tasks 37-39):** SW con cacheo, offline page, install prompt, lazy CSS/imgs, Firestore persistence, iOS standalone fixes
- ✅ **Auditoría de seguridad (Task 51):** escapeHtml en 6 archivos, Firestore/Storage rules endurecidas, limpieza config, SW reload fix, Firestore persistence API migrada
- ✅ **Login con Google (Tasks 49-50):** google-auth.js, botón "Continuar con Google" en login/register, detección cuentas Google en forgot password, email templates brandeados ChambaYa
- ✅ **Rebrand ChambApp → ChambaYa:** 15 HTML, manifest, 13 JS, docs. Nuevo logo CY monogram. Keys internos y Firebase config sin cambio.
- ✅ **UX Ver Candidatos (sesión 19):** banner urgencia reemplaza header estático, cards rechazadas colapsadas, botones WhatsApp/Llamar/Completado, grupos ordenados por pendientes.
- ✅ **UX Perfil Empleador (sesión 20):** CSS extraído a perfil-empleador.css, barra completitud dinámica, campo bio, stats (ofertas + contratados), cerrar sesión al fondo, botón flotante guardar.
- ✅ **iOS/Android Viewport Fixes (sesiones 21-22):** safe-area modal/header con `max()`, bug hero border-radius en WebKit, abreviar labels stats, flex-shrink en pills scroll.
- ✅ **UX Dashboard Trabajador:** Actividad reciente (banner postulaciones aceptadas), smart sort (match categoría + distancia), filtros overhaul (solo tuerca visible, modal completo con Limpiar/Filtrar, badge "+").

### Sesiones
- **Sesión 37 (01/05/26):** Safe areas modulares (--safe-top/--safe-bottom en design-system.css, 6 CSS migrados). Fix modal iOS: scroll-through (touch-action:none + overscroll-behavior:contain), título bajo notch (max-height con safe areas). Header compartido modular: shared-header.css + shared-header.js, reemplaza header-simple en 10 páginas con div#app-header inyectado; avatar, nombre, plan, dropdown. BT1 completado: expiración sesión 90 días (loginTimestamp + verificarExpiracionSesion). Commit + push GitHub.
- **Sesión 36 (30/04/26):** MV-19 — page loading overlay (logo ChambaYa + spinner CSS, IIFE page-loader.js como primer script en body, MutationObserver en #loading-screen/#loading-state/#mapa-loading, fallback 8s, 13 páginas). Fix bug mapa-ofertas: MutationObserver detecta cuando el mapa termina de inicializar. Validado en Android + iOS. Merge feature/mejoras-visuales → main. Deploy producción.
- **Sesión 35 (28/04/26):** MV-17 — Rediseño login al mockup (fondo blanco, role cards, inputs con íconos SVG). MV-18 — Dashboard trabajador al mockup (bottom nav flat 5 tabs sin FAB, offer cards con barra lateral de color por categoría, `.oferta-card--trabajador`).
- **Sesión 34 (27/04/26):** MV-9 — Empty states SVG (lupa/clipboard/lista, 6 archivos). MV-4b — Emoji cleanup completa (sidebar nav SVG, filtros, modals, cards, labels).
- **Sesión 33 (25/04/26):** MV-8 — Logo two-tone "Chamba"+"Ya" azul (12 HTML + 2 CSS). MV-16 — Reportar modal al design system (SVG flag, variante danger, tokens CSS).
- **Sesión 32 (24/04/26):** MV-4 — Emojis→SVG completo: icons.js (ES module exports), 9 HTML navs, 8 JS templates, 6 category labels.
- **Sesión 31 (21/04/26):** MV-7 Variables de estado design-system.css. MV-1 ícono distancia SVG pin. MV-2 avatares fondo suave. MV-3 stat Pendientes naranja. MV-6 sombras var(--shadow-card). MV-5 border-radius var(--radius-card).
- **Sesiones 27-30 (Mar 2026):** Planificación Fase 2 Mejoras Visuales. Auditoría y estandarización de mockups (bottom nav, íconos, botón volver). Branch feature/mejoras-visuales creado.
- **Sesión 26 (27/02/26):** Planificación estratégica Fase 2. Fase 1 declarada completa (100%). Cambio de foco a distribución nativa (Capacitor + Codemagic, BT3). Monetización definida: 5 chambas concluidas vitalicio (no mensual), pago via web con Culqi (estilo Spotify, evita 30% stores), sin ads. Dominio chambaya.com pendiente registrar (F2-A1). Fase 2 estructurada en 24 tareas (4 bloques). Admin: categorías dinámicas F2-C3 (Firestore `categorias/{slug}`, caché sessionStorage TTL 1h) + config global F2-C4 (single doc `admin/config` con 6 parámetros de negocio). Cuentas Apple Developer + Google Play NO creadas aún.
- **Sesión 25 (26/02/26):** Sistema de reportes + bloqueo consistente. `js/components/reportar-modal.js`: modal reutilizable con motivos (fraude/spam/inapropiado/otro), guarda en colección Firestore `reportes`. Botón "🚩 Reportar oferta" en modal detalle (dashboard, mapa, mis-aplicaciones-trabajador). Botón "🚩 Reportar perfil" en perfil público (solo para usuarios auth ≠ dueño del perfil). Admin reportes: Ver Oferta y Ver Perfil muestran detalle completo con fotos vía `adminModal`. XSS prevention con `data-*` attributes en onclick. `js/utils/auth-guard.js`: `manejarBloqueado()` y `verificarBloqueo()`. `cuenta-suspendida.html`: página dedicada para usuarios bloqueados. Check bloqueado en 10 páginas protegidas (inline para pages con Firestore read propio, `verificarBloqueo` para el resto; páginas solo-localStorage migradas a `onAuthStateChanged`). Fix bug `historial-ofertas.js`: `cargarOfertas()` se llamaba cuando `!userDoc.exists()`. Backlog BT1 (sesión expiración 30 días) y BT2 (optimización costos Firebase) documentados en PROYECTO.md.
- **Sesión 24 (26/02/26):** Panel de administración (tasks 45-48). `admin.html` + `js/admin/` (index, stats, metricas, reportes, ofertas, usuarios) + `css/admin.css`. Auth guard por UID hardcodeado. Gestión completa: estadísticas globales, métricas de crecimiento, reportes con acciones (resolver/ignorar), listado y bloqueo de ofertas y usuarios.
- **Sesión 23 (19/02/26):** UX Dashboard Trabajador — Actividad reciente: banner verde con count de postulaciones aceptadas + CTA "Ver aplicaciones". Smart sort: ofertas con match de categoría del trabajador aparecen primero, luego el resto; ambos grupos ordenados por distancia (o fecha si sin ubicación). Filtros overhaul: barra básica eliminada, solo tuerca ⚙️ visible con badge "+" si hay filtros activos; modal/sheet completo con búsqueda + categorías + ordenar + ubicación + distancia + salario + fecha; filtros aplican solo al pulsar "Filtrar", "Limpiar" resetea y aplica inmediatamente.
- **Sesión 22 (19/02/26):** Android text overflow — `flex-shrink: 0` en `.filtro-btn` de mis-aplicaciones-trabajador (pills se comprimían ignorando overflow-x:auto). Labels stats historial-ofertas abreviados ("Completadas"→"Complet.", "Caducadas"→"Caducad.") para caber en min-width:60px. Bump CSS `?v=1`.
- **Sesión 21 (19/02/26):** iOS/Android safe-area fixes. Fórmula correcta: `max(Xrem, env(safe-area-inset-top, 0px))` no `calc(Xrem + env(...))`. Bug hero+border-radius+margin-negativo en WebKit (hero aparecía fuera del modal); fix con CSS `:has()` y margin-top:0. publicar-oferta.css tenía @media override que pisaba header-simple.css. dashboard-main.css revertido (estaba bien antes). Modal: padding-top + max-height con safe-areas para centrado correcto en iOS.
- **Sesión 20 (19/02/26):** UX Perfil Empleador. CSS extraído de inline a `css/perfil-empleador.css`. Barra de completitud (5 campos, tip dinámico). Campo "Sobre ti" (bio) 300 chars. Stats row (ofertas + contratados, visible si ≥1 oferta). Cerrar Sesión movido al fondo. Botón flotante 💾 Guardar solo en móvil.
- **Sesión 19 (19/02/26):** UX Ver Candidatos (`mis-aplicaciones.html`). Banner urgencia reemplaza header estático (aparece solo si hay pendientes). Cards rechazadas colapsadas por defecto (expandibles con tap). Badge PENDIENTE eliminado (redundante). Grupos ordenados por cantidad de pendientes. Botones aceptado: WhatsApp full-width > Llamar link > Marcar completado outline.
- **Sesión 18 (17/02/26):** Tasks 49-50 + Rebrand. Login con Google: google-auth.js con GoogleAuthProvider, botón "Continuar con Google" en login.html y register.html, detección automática de cuentas Google en forgot password (muestra toast "usa Google para iniciar sesión"). Email templates brandeados con diseño ChambaYa (verificación + reset password) documentados en SEGURIDAD.md. Fix toast móvil angosto (css/toast.css width:95%). Rebrand ChambApp → ChambaYa: 15 HTML, manifest.json, 13 JS (solo textos visibles, keys internos sin cambio). Nuevo logo CY monogram generado con sharp en todos los tamaños PWA. 43 archivos modificados.
- **Sesión 17 (17/02/26):** Task 51 - Auditoría de seguridad proactiva. XSS prevention: escapeHtml() aplicado en 6 archivos (historial-calificaciones, oferta-card, dashboard, index, mis-aplicaciones-trabajador, mis-aplicaciones). Firestore rules: ofertas create restringido a empleadores, aplicaciones update con ownership check (uid+email). Storage rules: ofertas solo imágenes <5MB. Limpieza: eliminados console.log de config, document.write→createElement en 3 HTML, eliminados 6 Lighthouse JSONs con API keys, eliminada GOOGLE_GEOCODING_API_KEY deprecated, geolocation.js migrado a GOOGLE_MAPS_API_KEY. Creado docs/SEGURIDAD.md con checklist acciones manuales GCP. Fix SW: controllerchange solo recarga si había controller previo (evita recarga doble en primera visita). Migrado enableIndexedDbPersistence() a initializeFirestore() con persistentLocalCache. 20 archivos modificados.
- **Sesión 16 (17/02/26):** Tasks 37-39 - Performance + PWA completa. Sub-tasks: 37A resource hints + defer en 14 HTML, 37B lazy loading imágenes dinámicas, 38A Firestore offline persistence, 38B CSS no-crítico diferido (media="print"), 39A Service Worker con cacheo (Cache First/Network First/SWR), 39B offline.html, 39C install prompt + manifest update, 39D SW update notification. Fixes iOS: scope:"/" en manifest, apple-mobile-web-app-capable + link manifest en todos los HTML, safe-area-inset-top en header-simple.css para notch. 22 archivos modificados, 3 nuevos (offline.html, install-prompt.js, sw-update.js).
- **Sesión 15 (16/02/26):** Task 33 - Error states y validaciones: 4 módulos nuevos (validators.js, form-errors.js, confirm-modal.js, error-handler.js). Validaciones inline en perfiles trabajador/empleador (nombre, teléfono 9 dígitos, edad mínima 18, horarios). Modal de confirmación customizado reemplaza 6 confirm() nativos. Sanitización con sanitizeText() en guardado de perfiles y ofertas. Validación onblur en campos obligatorios. Mensajes de error contextuales con detección red/permisos y botón "Reintentar".
- **Sesión 14 (12/02/26):** UX mejoras dashboard empleador: saludo contextual (reemplaza alerta amarilla), stats "Pendientes" con urgencia, cards ordenadas por prioridad, ocultar "Ver Candidatos" si 0 postulaciones, badge singular/plural, fecha corta, salario "S/.", bottom nav "Talento", botón "Nueva Oferta" outline. Fix settings.local.json corrupto.
- **Sesión 13 (11/02/26):** Perfil público de trabajador (`perfil-publico.html` + 2 módulos JS + CSS). Página read-only para que empleadores evalúen trabajadores antes de aceptar/rechazar. Link "Ver Perfil" en cards de mis-aplicaciones. UX mejoras perfil-trabajador (save floating inteligente, CSS compactación, distribución condicional).
- **Sesión 12 (11/02/26):** Actualización de todos los MD con estado actual del proyecto.
- **Sesión 11 (10/02/26):** UX mejoras mis-aplicaciones-trabajador (hero compacto, stats pills, contacto colapsable, mensaje compacto, acciones mejoradas). Extraído `calificacion-modal.css`. Actualización de todos los MD.
- **Sesión 10 (10/02/26):** CSS modal unificado, detalle de oferta compartido, actualización estructura
- **Sesión 9 (10/02/26):** Refactorización JS Fases 5-9, calificación empleador, Cloud Function ratings
- **Sesión 8 (07/02/26):** Refactorización JS Fases 2-4 (componentes, publicar-oferta, dashboard)
- **Sesión 7 (04/02/26):** Refactorización JS Fases 0-1 (limpieza + módulos utilitarios)
- **Sesión 6 (04/02/26):** V1 - Vacantes múltiples (1-20 por oferta, transactions, badges)
- **Sesión 5 (04/02/26):** GT1 - Centralizar guided tours, motor único, fix selectores
- **Sesión 4 (03/02/26):** OB1 - CSS externalizado login/register, mejoras UX registro
- **Sesión 3 (03/02/26):** Cards compactas móvil, filtros reestructurados, chips de fecha
- **Sesión 2 (03/02/26):** Fix headers inconsistentes (centralizar CSS en design-system.css)
- **Sesión 1:** Plan de refactorización + Sprint G1-G6 completo

### Bottom Nav por Rol
| Botón | Trabajador | Empleador |
|-------|------------|-----------|
| 1º | Mis Apps | Historial |
| 2º | Inicio | Talento |
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

### Próximas tareas (en orden)
1. **F2-A1** — Registrar dominio chambaya.com (o .pe) — sin código, solo trámite
2. **F2-A2** — Crear cuenta Apple Developer + Google Play — sin código, urgente por tiempos de aprobación
3. **F2-A3 a F2-A7** — Integración Capacitor + Codemagic (en paralelo con Bloque B)
4. **F2-B7 + F2-B8** — Sistema Freemium + página /premium con Culqi (prioritario para lanzar con modelo completo)
5. **F2-C3 + F2-C4** — Admin: categorías dinámicas + config global (hacerlos juntos, mismo patrón Firestore)

**Completados recientemente:**
- ✅ BT1 / F2-B1: Expiración sesión 90 días (01/05/26)
- ✅ Fase 2 Mejoras Visuales MV-1→MV-19 (30/04/26)
- ✅ Safe areas modulares + header compartido (01/05/26)

### Notas técnicas
- Estados de oferta: `activa` | `en_curso` | `completada` | `caducada`
- Ofertas visibles: `estado === 'activa' AND fechaExpiracion > ahora`
- Al editar oferta: fechaExpiracion se resetea a +14 días
- Ordenamiento y filtro de fecha usan `fechaActualizacion || fechaCreacion`
- Cards móvil: layout horizontal con `data-categoria` para color de borde
- **Vacantes:** oferta.vacantes (1-20), aceptadosCount, trabajadoresAceptados[]
- **Flujo vacantes:** activa (aceptando) → en_curso (todas llenas) → completada (todos terminaron)
- **Servidor local:** usar `npx http-server -p 8080 -c-1` (preserva query strings necesarios para editar/reutilizar ofertas)
- **Validaciones:** `validators.js` retorna `{ valid, error }`, `form-errors.js` maneja UI (showFieldError/hideFieldError)
- **Confirm modal:** `confirmar({titulo, mensaje, tipo})` retorna `Promise<boolean>`, usa `css/modal.css`
- **Error handler:** `mensajeErrorAmigable(error, contexto)` detecta red/permisos, `toastErrorConRetry(msg, fn)` agrega "Reintentar"
- **Sanitización:** `sanitizeText()` de sanitize.js aplicado en guardado de perfiles y ofertas (previene XSS)
- **PWA Service Worker:** `firebase-messaging-sw.js` maneja FCM + cacheo (Cache First para estáticos, Network First para HTML, SWR para Firebase Storage). Nunca cachear auth/firestore/maps endpoints.
- **PWA iOS:** Requiere `apple-mobile-web-app-capable`, `<link rel="manifest">`, y `scope: "/"` en manifest.json en CADA HTML. Sin esto, iOS abre Safari al navegar entre páginas.
- **Safe areas:** Variables `--safe-top: env(safe-area-inset-top, 0px)` y `--safe-bottom: env(safe-area-inset-bottom, 0px)` en `design-system.css`. Usar `max(var(--safe-top), Xrem)` — nunca `calc()`. Migrados: login.css, register.css, modal.css, bottom-nav.css, header-simple.css, shared-header.css.
- **Modal scroll-through iOS:** `touch-action:none` en `.modal-overlay` + `overscroll-behavior:contain` en `.modal-content`. `max-height: calc(100vh - var(--safe-top) - var(--safe-bottom) - 5rem)`.
- **Header compartido:** `initSharedHeader(auth, db)` en `js/utils/shared-header.js`. Recibe instancias Firebase como params (evita conflicto singleton con firebase-init.js). Inyecta HTML en `<div id="app-header">`. Carga usuario de Firestore, muestra avatar+nombre+plan, dropdown con "Mi Perfil" (adapta URL por rol) y "Cerrar Sesión".
- **CSS cache bust:** Cambiar `?v=N` al modificar CSS cacheados (header-simple.css?v=3)
- **Firestore offline:** `initializeFirestore()` con `persistentLocalCache` + `persistentMultipleTabManager` en firebase-init.js
- **XSS prevention:** `escapeHtml()` de dom-helpers.js en todo innerHTML con datos de usuario. `textContent` para texto plano.
- **Firestore rules:** ofertas create solo empleadores, aplicaciones update con ownership (uid+email). Read de aplicaciones no puede tener resource.data checks (rompe list queries).
- **Storage rules:** ofertas/ solo imágenes <5MB
- **SW reload:** `controllerchange` solo recarga si `hadController` (evita recarga en primera instalación)
- **Seguridad:** checklist de acciones manuales en `docs/SEGURIDAD.md`
- **auth-guard.js:** `manejarBloqueado(auth)` limpia localStorage + signOut + redirect `cuenta-suspendida.html`. `verificarBloqueo(db, auth, uid)` fetch Firestore + llama manejarBloqueado si bloqueado. `verificarExpiracionSesion()` verifica `loginTimestamp` en localStorage: si >90 días limpia y redirige. Usado en páginas protegidas.
- **Reportar modal:** `initReportarModal()` inyecta el modal al body una vez por página. `window.abrirReportarModal(tipo, objetoId, objetoTitulo)` lo abre. Guarda en colección Firestore `reportes` con campos: tipo, objetoId, objetoTitulo, reportadoPor, reportadoPorUid, motivo, descripcion, estado='pendiente', timestamp.
- **Admin panel:** UID hardcodeado `XkBmgSWZKZeUyLKAyOn8GHmzOAb2` en index.js y login.js. Modales via `window.adminModal.abrirModal(titulo, html)`. Queries sin orderBy para evitar índices compuestos.

---

**Fundador:** Joel (jrvl83)
**Versión documento:** 7.0
