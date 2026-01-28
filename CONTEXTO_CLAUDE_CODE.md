# CONTEXTO CLAUDE CODE - CHAMBAPP

**Archivo de Inicialización para Claude Code**
**Actualizado:** 28 Enero 2026
**Lee este archivo al inicio de cada sesión**

---

## ESTADO ACTUAL DEL PROYECTO

### Progreso General
- **Fase Actual:** Fase 1 - Experiencia WOW
- **Progreso Fase 1:** 59% completo (29/49 tareas)
- **Progreso Total:** ~17% del proyecto (29/176 tareas)
- **Tiempo Invertido:** ~2.5 meses
- **Tiempo Restante:** 3-4 meses hasta lanzamiento

### Últimas Tareas Completadas
**Unificación Paleta de Colores:** (28 Ene 2026)
- Paleta unificada en TODOS los archivos CSS (15 archivos)
- Primary: `#0066FF` (antes #2563eb)
- Primary Dark: `#0052CC` (antes #1d4ed8)
- Secondary: `#00C48C` (antes #10b981)
- Accent: `#FF6B00`
- Sombras actualizadas: `rgba(0, 102, 255, ...)` (antes rgba(37, 99, 235, ...))
- Estilos inline en HTML actualizados (login, perfil-empleador, perfil-trabajador, test-maps)
- Fix notificaciones.html: Header y logo con estilos correctos
- Tipografía Inter añadida a todos los CSS

**UX/UI Branding:** Logo e Identidad Visual (27 Ene 2026)
- Documento `docs/UX_UI_GUIA_MAESTRA.md` con identidad de marca completa
- Logo oficial creado con NanoBanana (Logo 1 - C con apretón de manos)
- Archivos logo: `assets/logo/logo-completo.png` y `assets/logo/logo-icono.png`
- CSS actualizado en `dashboard-main.css` para estilos del logo
- 12 páginas HTML actualizadas con nuevo logo (header + footer landing)
- Colores de marca definidos: Primary #0066FF, Accent #FF6B00
- Tipografía: Poppins (títulos) + Inter (cuerpo)

**Task 29:** Centro de Notificaciones In-App (27 Ene 2026)
- Nueva página `/notificaciones.html`
- Lista de notificaciones en tiempo real (onSnapshot)
- Filtros: Todas / Sin leer / Leídas
- Acciones: Marcar como leída, marcar todas, eliminar
- Badge de contador en sidebar y bottom-nav
- Bottom-nav actualizado: "Mensajes" → "Alertas" (🔔)
- Reglas Firestore para subcolección `usuarios/{uid}/notificaciones`
- Tiempo relativo (hace X minutos/horas/días)

**Tasks 27-28:** Notificaciones Push con Firebase Cloud Messaging (26 Ene 2026)
- **Task 27:** Setup Firebase Cloud Messaging
  - Firebase CLI configurado (proyecto chambapp-7785b)
  - Service Worker FCM (`firebase-messaging-sw.js`)
  - Módulo cliente FCM (`js/notifications/fcm-init.js`)
  - VAPID key configurada
  - Estilos para banner y toast (`css/notifications.css`)
  - Manifest PWA (`manifest.json`)
  - Iconos PWA placeholder (8 tamaños)
- **Task 28:** Tipos de Notificaciones (Cloud Functions)
  - `notificarNuevaPostulacion`: Trigger al crear aplicación → notifica empleador
  - `notificarPostulacionAceptada`: Trigger al aceptar → notifica trabajador
  - Historial guardado en `usuarios/{uid}/notificaciones/`
  - Cloud Functions desplegadas en us-central1

**Tasks 23-24:** Filtros Avanzados Dashboard (22 Ene 2026)
- Componente `FiltrosAvanzados` modular
- Multiselect categorías, range slider salario
- Chips removibles, persistencia localStorage

**UX Mejoras:** Bottom Navigation + Dashboard por rol (22 Ene 2026)
- Bottom nav móvil estilo apps nativas
- Vista empleador compacta con timeline actividad

**Tasks 14-17 + Mejora Rating:** Sistema de Calificaciones Expandido (21 Ene 2026)
- **Task 14:** Vista de reseñas recibidas para trabajador
  - Nueva pestaña "Reseñas" en perfil trabajador
  - Resumen con promedio y distribución de estrellas (barras visuales)
  - Lista de reseñas con nombre empleador, trabajo, estrellas, comentario, fecha
  - Query a colección `calificaciones` filtrado por `trabajadorId`
- **Task 15:** Calificación bidireccional (trabajador → empleador)
  - Botón "Calificar Empleador" en mis-aplicaciones-trabajador cuando estado = completado
  - Modal con estrellas interactivas y comentario opcional
  - Campo `tipo: "trabajador_a_empleador"` en calificaciones
  - Campos en aplicaciones: `calificadoPorTrabajador`, `calificacionTrabajadorId`
  - Actualiza promedio del empleador en su perfil
- **Task 16:** Historial completo de calificaciones
  - Nueva página `/historial-calificaciones.html`
  - Tabs: "Recibidas" / "Dadas"
  - Filtros por puntuación y fecha
  - Link desde perfil trabajador
- **Task 17:** Responder a calificaciones recibidas
  - Modal para escribir respuesta (max 300 chars)
  - Campo `respuesta` y `fechaRespuesta` en documentos de calificación
  - Botón "Responder" en cada reseña sin respuesta
- **Mejora Extra:** Rating visible en postulaciones para empleador
  - Empleador ve ★ 4.5 (12) junto al nombre del trabajador
  - Click en rating abre modal con detalle de calificaciones
  - Muestra todas las reseñas recibidas por el trabajador
  - "Sin calificaciones aún" si el trabajador es nuevo

### Estado Actual (28 Ene 2026)
**Sistema de Notificaciones:** COMPLETO Y FUNCIONANDO ✅
**Branding:** Logo e identidad visual implementados ✅
**Paleta de Colores:** UNIFICADA EN TODA LA APP ✅

**Probado y validado:**
- ✅ Notificaciones push en Android Chrome
- ✅ Notificaciones push en iPhone Safari (PWA instalada)
- ✅ Flujo completo: Trabajador postula → Empleador recibe notif push
- ✅ Flujo completo: Empleador acepta → Trabajador recibe notif push
- ✅ Centro de notificaciones in-app funcionando
- ✅ Badge de contador actualiza en tiempo real
- ✅ Logo oficial integrado en todas las páginas
- ✅ Íconos PWA generados (8 tamaños) + favicon
- ✅ Colores unificados en 15 CSS + 4 HTML + 1 JS

### Próximas Tareas
**UX/UI Polish - Continuar:**
1. **Tasks 31-32:** Micro-interacciones y animaciones
2. **Tasks 33-36:** Empty states mejorados, loading states, accesibilidad
3. Reemplazar emojis por íconos SVG (sidebar, stats, categorías)

**Opciones adicionales:**
- **Tasks 45-48:** Panel de Administración (config, usuarios, analytics)
- **Tasks 25-26:** Búsqueda Avanzada Premium (guardar búsquedas, alertas)

> **Flujo completo funcionando:** Postulación → Notif Empleador → Aceptar → Notif Trabajador → WhatsApp → Completado → ⭐ Calificar

### Pendiente Menor (Sprint UX/UI Polish)
- Fix warning onboarding `.stats-grid`
- Actualizar google.maps.Marker a AdvancedMarkerElement (deprecation warning)

---

## CONFIGURACIÓN TÉCNICA ACTUAL

### Stack Tecnológico
```
Frontend:  HTML5, CSS3, JavaScript ES6+ (vanilla, no frameworks)
Backend:   Firebase (Auth + Firestore + Storage + Cloud Functions)
Hosting:   Firebase Hosting (chambapp-7785b.web.app) - Principal
           GitHub Pages (jrvl83.github.io/chambapp) - Backup
APIs:      Google Maps, Geocoding, Places, Firebase Cloud Messaging
Payments:  Culqi (pendiente integración)
```

### Google Cloud Setup
```
API Key Maps: AIzaSyBxopsd9CPAU2CSV91z8YAw_upxochOGYE
APIs Activas: Maps JavaScript API, Geocoding API, Places API (new)
Firebase Plan: Blaze (activo)
```

### Estructura de Carpetas
```
chambapp/
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── publicar-oferta.html
├── perfil-trabajador.html
├── perfil-empleador.html
├── mis-aplicaciones.html
├── mis-aplicaciones-trabajador.html
├── mapa-ofertas.html
├── historial-calificaciones.html
├── manifest.json (PWA - Task 27)
├── firebase-messaging-sw.js (Service Worker FCM - Task 27)
├── firebase.json (Firebase CLI config)
├── .firebaserc (Firebase project config)
├── css/
│   ├── design-system.css
│   ├── components.css
│   ├── accessibility.css
│   ├── toast.css
│   ├── filtros-avanzados.css (Task 23-24)
│   ├── bottom-nav.css (UX mejora)
│   ├── dashboard-empleador.css (UX mejora)
│   ├── notifications.css (Task 27)
│   └── ...
├── js/
│   ├── config/
│   │   ├── firebase-config.js
│   │   └── firebase-init.js
│   ├── auth/
│   │   ├── login.js
│   │   └── register.js
│   ├── dashboard/
│   │   └── dashboard.js (integra FCM - Task 27)
│   ├── components/
│   │   ├── filtros-avanzados.js (Task 23-24)
│   │   └── bottom-nav.js (UX mejora)
│   ├── notifications/
│   │   └── fcm-init.js (Task 27)
│   ├── utils/
│   │   ├── geolocation.js
│   │   ├── distance.js
│   │   ├── google-maps.js
│   │   └── ubigeo-api.js
│   ├── toast.js
│   └── onboarding.js
├── assets/
│   ├── icons/ (PWA icons - 8 tamaños)
│   └── logo/ (Logo oficial ChambApp)
│       ├── logo-completo.png (logo con texto)
│       └── logo-icono.png (solo símbolo)
├── functions/ (Cloud Functions - Task 28)
│   ├── index.js (notificarNuevaPostulacion, notificarPostulacionAceptada)
│   └── package.json
├── data/
│   ├── ubigeo_departamento.json
│   ├── ubigeo_provincia.json
│   └── ubigeo_distrito.json
└── docs/
    └── ...
```

---

## MODELO DE NEGOCIO

### Freemium Asimétrico
**Solo trabajadores pagan, empleadores gratis siempre**

#### Trabajadores:
- **Gratis:** 5 aplicaciones/mes, 10 mensajes/mes, con publicidad
- **Premium (S/. 20/mes):** Aplicaciones ilimitadas, destacado 10x, sin publicidad, estadísticas, soporte prioritario

#### Empleadores:
- **TODO GRATIS:** Publicar ilimitado, ver aplicantes ilimitado, mensajes ilimitados

#### Diferenciador Clave:
**"0% comisiones" vs competencia (15-25%)**

---

## TAREAS COMPLETADAS (1-13, 21)

### Fundamentos Técnicos (Tasks 1-3)
1. Estructura archivos JS separados (modular)
2. Sistema design tokens CSS (variables globales)
3. Componentes UI reutilizables (buttons, cards, modals)

### Perfiles Completos (Tasks 4-7)
4. Estructura Firestore perfiles
5. Upload fotos/imágenes (Firebase Storage)
6. Página perfil trabajador (portfolio, experiencia, skills)
7. Editor perfil interactivo (multi-sección)

### Geolocalización (Tasks 8-12)
8. Integración Google Maps API (setup completo)
9. Permiso ubicación usuario (GPS + reverse geocoding + badge)
10. **Geocoding Ofertas** (completada 14 Ene 2026)
    - Google Places API Autocomplete
    - Mini-mapa preview en formulario
    - Validación bounds Perú
    - Estructura ubicación en Firestore:
      ```javascript
      ubicacion: {
          departamento: "Lima",
          provincia: "Lima",
          distrito: "Miraflores",
          direccion_exacta: "Av. Larco 345",
          referencia: "Frente al parque",
          coordenadas: { lat: -12.119, lng: -77.030 },
          texto_completo: "Av. Larco 345, Miraflores",
          es_ubicacion_precisa: true
      }
      ```
11. **Búsqueda por Distancia** (completada 14 Ene 2026)
    - Filtro "Distancia máxima" (5km, 10km, 20km, 50km)
    - Badge "A X km de ti" con colores (verde ≤5km, amarillo 5-15km, rojo >15km)
    - Ordenar ofertas por cercanía
    - Fix: `obtenerCoordenadasDistrito` ahora filtra por depto/provincia
12. **Mapa Interactivo Ofertas** (completada 19 Ene 2026)
    - Página `/mapa-ofertas.html` con mapa Google Maps
    - Markers por categoría con colores diferentes
    - Clustering de markers cercanos (MarkerClusterer)
    - Click en cluster con misma ubicación → lista de ofertas
    - Preview rápido al hacer click en marker
    - Modal detalle completo SIN salir del mapa
    - Postulación directa desde el mapa
    - Filtros por categoría y distancia en sidebar
    - Solo visible para trabajadores (empleadores redirigidos)
    - Responsive móvil (sidebar como drawer)
    - Markers/pins por cada oferta con coordenadas
    - Clustering de pins cercanos (MarkerClusterer)
    - Click en pin → preview de oferta
    - Sidebar con lista de ofertas y filtros
    - Botón "Ver Mapa" en dashboard
    - Colores de markers por categoría
    - Responsive móvil (sidebar como drawer)

### Gestión de Postulaciones (Task 21)
21. **Aceptar/Rechazar + WhatsApp** (completada 19 Ene 2026)
    - Vista empleador: botones Aceptar/Rechazar
    - Estados: pendiente → aceptado | rechazado → completado
    - Botón WhatsApp con mensaje pre-llenado
    - Botón "Marcar como Completado"
    - Filtros por estado en ambas vistas
    - Vista trabajador: ver estado y contacto del empleador
    - Teléfonos guardados en aplicaciones
    - **Migración Nueva Places API** (AutocompleteSuggestion + códigos postales)

### Sistema de Calificaciones (Task 13)
13. **Calificaciones Empleador → Trabajador** (completada 20 Ene 2026)
    - Modal con estrellas interactivas (1-5 estrellas)
    - Colección Firestore `calificaciones`:
      ```javascript
      {
        aplicacionId, trabajadorId, trabajadorEmail, trabajadorNombre,
        empleadorId, empleadorEmail, empleadorNombre,
        ofertaId, ofertaTitulo, ofertaCategoria,
        puntuacion: 1-5, comentario: string,
        fechaCalificacion, fechaTrabajoCompletado
      }
      ```
    - Campos agregados en `usuarios` (trabajadores):
      - `calificacionPromedio`, `totalCalificaciones`, `distribucionCalificaciones`
    - Campos agregados en `aplicaciones`:
      - `calificado: boolean`, `calificacionId: string`
    - Badge de calificación en perfil trabajador (★ 4.5)
    - Estado "Ya Calificado" en vista empleador
    - Reglas Firestore actualizadas para colección `calificaciones`

### Mejoras iOS (14 Ene 2026)
- viewport-fit=cover en todos los HTML
- Meta tags Apple en todos los HTML
- Compatibilidad con notch/Dynamic Island

---

## TAREAS COMPLETADAS (14-17) - 21 Ene 2026

### Tasks 14-17: Mejoras Sistema de Calificaciones ✅
**Objetivo:** Expandir el sistema de calificaciones

**Subtareas completadas:**
- [x] Task 14: Vista de reseñas recibidas para trabajador
- [x] Task 15: Calificación bidireccional (trabajador → empleador)
- [x] Task 16: Historial completo de calificaciones
- [x] Task 17: Responder a calificaciones recibidas

**Archivos creados/modificados:**
- `perfil-trabajador.html` - Nueva pestaña "Reseñas" + Modal responder
- `js/perfil-trabajador.js` - Funciones cargarResenasRecibidas, enviarRespuesta
- `css/perfil-trabajador.css` - Estilos reseñas y distribución
- `mis-aplicaciones-trabajador.html` - Modal calificar empleador
- `js/mis-aplicaciones-trabajador.js` - Sistema calificación empleador
- `css/mis-aplicaciones-trabajador.css` - Estilos modal calificación
- `historial-calificaciones.html` - Nueva página (Task 16)
- `js/historial-calificaciones.js` - Lógica historial
- `css/historial-calificaciones.css` - Estilos historial
- `mis-aplicaciones.html` - Modal detalle calificaciones trabajador
- `js/mis-aplicaciones.js` - Rating trabajador + verDetalleCalificaciones()
- `css/mis-aplicaciones.css` - Estilos rating y modal detalle

---

### Orden de Desarrollo Actualizado (21 Ene 2026)

**Flujo lógico del usuario (COMPLETO CON CALIFICACIÓN BIDIRECCIONAL):**
```
Postulación → Aceptar/Rechazar → WhatsApp → Trabajo → Completado → ⭐ Calificar (ambos) → ★ Perfiles actualizados
```

**Tareas completadas recientemente:**
1. ✅ **Task 21:** Aceptar/Rechazar + Botón WhatsApp (19 Ene 2026)
2. ✅ **Task 13:** Sistema de Calificaciones (20 Ene 2026)
3. ✅ **Tasks 14-17:** Mejoras al Sistema de Calificaciones (21 Ene 2026)

**Próximas tareas:**
1. **Tasks 18-20, 22-23:** Chat In-App (DIFERIDO - WhatsApp cubre la necesidad)
2. **Sprint UX/UI Polish:** Warnings pendientes, mejoras visuales

---

## PRINCIPIOS DE DISEÑO UX/UI

### Design Tokens (Usar siempre)
```css
/* Colores ChambApp - ACTUALIZADOS 28 Ene 2026 */
--primary: #0066FF;        /* Azul ChambApp */
--primary-dark: #0052CC;   /* Hover/gradientes */
--secondary: #00C48C;      /* Verde éxito */
--accent: #FF6B00;         /* Naranja acción */
--warning: #f59e0b;        /* Amarillo atención */
--danger: #ef4444;         /* Rojo urgencia */

/* Espaciado (8px grid) */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

/* Tipografía */
--font-display: 'Poppins', sans-serif;  /* Títulos */
--font-body: 'Inter', sans-serif;       /* Cuerpo */
```

### Principios Core
1. **Mobile-First:** Diseñar primero para 360-414px
2. **Simplicidad Radical:** Max 3 opciones por pantalla
3. **Feedback Inmediato:** Loading states + toasts en toda acción
4. **Accesibilidad:** WCAG 2.1 AA (contraste 4.5:1, keyboard nav)

---

## REGLAS DE TRABAJO CON CLAUDE CODE

### Regla #1: Investigación Autónoma
- Identificar qué archivos necesita revisar
- Acceder al repositorio y leer código existente
- Analizar dependencias antes de proponer cambios
- **NO** asumir implementaciones sin verificar

### Regla #2: Archivos Completos
- Entregar archivos completos y funcionales
- Instrucciones de instalación claras
- Ruta exacta del archivo en repositorio
- **NO** snippets para copiar/pegar

### Regla #3: Decisiones
**JOEL decide:** QUÉ, PARA QUIÉN, CUÁNDO
**CLAUDE CODE decide:** CÓMO (técnico, UX/UI, arquitectura)

---

## DECISIONES ARQUITECTÓNICAS CLAVE

1. **NO usar frameworks frontend** - Vanilla JS ES6+ modules
2. **Firebase como backend** - Firestore NoSQL
3. **Mobile-first design** - 360-414px primero
4. **GitHub Pages hosting** - Estático + Firebase
5. **SIN intermediación de pagos** - Solo suscripciones Premium
6. **Geolocalización SOLO trabajadores** - Empleadores especifican ubicación del trabajo

---

## WARNINGS/ISSUES CONOCIDOS

### Pendientes Resolver:
- Warning onboarding `.stats-grid`
- google.maps.Marker deprecated (usar AdvancedMarkerElement)
- Meta tag `apple-mobile-web-app-capable` deprecated

### Resueltos:
- ✅ google.maps.places.Autocomplete migrado a AutocompleteSuggestion (19 Ene 2026)

### Notas Importantes:
- Firebase Plan Blaze: Monitorear costos mensual
- Testing manual: Probar cada cambio en móvil real

---

## HITOS RECIENTES

- **Dic 2025:** Sistema UBIGEO Perú completo (1892 distritos)
- **Dic 2025:** Perfiles con fotos y portfolios
- **Ene 2026:** Google Geocoding API integrada
- **Ene 2026:** Badge ubicación dinámico trabajadores
- **Ene 2026:** Firebase Plan Blaze activado
- **14 Ene 2026:** Task 10 completada - Geocoding Ofertas
- **14 Ene 2026:** Task 11 completada - Búsqueda por Distancia
- **19 Ene 2026:** Task 12 completada - Mapa Interactivo Ofertas
- **19 Ene 2026:** Task 21 completada - Aceptar/Rechazar + WhatsApp
- **20 Ene 2026:** Task 13 completada - Sistema de Calificaciones
- **21 Ene 2026:** Tasks 14-17 completadas - Sistema de Calificaciones expandido
- **22 Ene 2026:** Tasks 23-24 completadas - Filtros Avanzados Dashboard
- **22 Ene 2026:** UX Mejoras - Bottom Navigation + Dashboard por rol
- **23 Ene 2026:** Fix iOS Safari onboarding + Estadísticas trabajador
- **26 Ene 2026:** Tasks 27-28 completadas - Notificaciones Push FCM
- **26 Ene 2026:** Firebase Hosting configurado como hosting principal
- **26 Ene 2026:** Cloud Functions desplegadas (notificaciones automáticas)
- **27 Ene 2026:** Task 29 completada - Centro de Notificaciones In-App
- **27 Ene 2026:** Reglas Firestore configuradas y desplegadas
- **27 Ene 2026:** Fix compatibilidad notificaciones Android Chrome
- **27 Ene 2026:** UX_UI_GUIA_MAESTRA.md creada - Identidad visual completa
- **27 Ene 2026:** Logo oficial integrado en todas las páginas
- **28 Ene 2026:** Íconos PWA generados (8 tamaños) + favicon desde logo oficial
- **28 Ene 2026:** Rediseño visual UX/UI dashboard (stat cards, ofertas cards, animaciones)
- **28 Ene 2026:** Paleta de colores unificada en toda la app (15 CSS, 4 HTML, 1 JS)
- **28 Ene 2026:** Fix header notificaciones.html (logo gigante)

---

## COMANDOS ÚTILES

### Ejecutar localmente:
```bash
cd C:\Users\JOEL\Documents\Proyectos\Chambapp
npx serve
```

### Desplegar a producción (Firebase Hosting):
```bash
firebase deploy --only hosting
```

### Desplegar Cloud Functions:
```bash
firebase deploy --only functions
```

### Ver logs de Cloud Functions:
```bash
firebase functions:log
```

### Commit y push a GitHub:
```bash
git add . && git commit -m "mensaje" && git push origin main
```

---

## URLS DE PRODUCCIÓN

| Servicio | URL |
|----------|-----|
| **App (Principal)** | https://chambapp-7785b.web.app |
| **GitHub Pages (Backup)** | https://jrvl83.github.io/chambapp |
| **Firebase Console** | https://console.firebase.google.com/project/chambapp-7785b |
| **GitHub Repo** | https://github.com/Jrvl83/chambapp |

---

**Última actualización:** 28 Enero 2026
**Versión:** 2.1
**Proyecto:** ChambApp - Marketplace de Trabajos Perú
**Fundador:** Joel (jrvl83)

---

**Listo para desarrollar! Revisa este archivo al inicio de cada sesión.**
