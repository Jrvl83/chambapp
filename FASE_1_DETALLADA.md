# 🎯 FASE 1: EXPERIENCIA WOW - DETALLADO

**49 Tareas para Producto Excepcional**
**Duración:** 14-15 semanas (~3.5 meses)
**Progreso Actual:** 59% (29/49 tareas completadas)

---

## 📊 PROGRESO FASE 1

```
✅ COMPLETADAS: █████████████████░░░░░░░░░░░ 29/49 (59%)
⏸️ DIFERIDAS:   ███░░░░░░░░░░░░░░░░░░░░░░░░░ 6/49 (12%)
⏳ PENDIENTES:  ███████░░░░░░░░░░░░░░░░░░░░░ 14/49 (29%)
```

### Sprints (1 semana cada uno):
- **Sprint 1:** ✅ Tasks 1-3 (Fundamentos) - COMPLETADO
- **Sprint 2:** ✅ Tasks 4-7 (Perfiles) - COMPLETADO
- **Sprint 3:** ✅ Tasks 8-12 (Geolocalización) - COMPLETADO
- **Sprint 4:** ✅ Task 21 + Tasks 13-17 (Aceptar/Rechazar + Calificaciones) - COMPLETADO
  > ✅ Task 21 completada (19 Ene 2026)
  > ✅ Tasks 13-17 completadas (21 Ene 2026)
- **Sprint 5:** 🔄 Tasks 23-26 (Búsqueda Avanzada) + UX Polish - EN PROGRESO
  > ✅ Task 23 completada (22 Ene 2026)
  > ✅ UX: Bottom Navigation PWA (22 Ene 2026)
  > ✅ UX: Dashboard diferenciado por rol (22 Ene 2026)
  > ✅ Task 24 completada (22 Ene 2026)
- **Sprint 6:** ✅ Tasks 27-29 (Notificaciones Push + Centro In-App) - COMPLETADO
  > ✅ Task 27 completada (26 Ene 2026) - Setup FCM + Cloud Functions desplegadas
  > ✅ Task 28 completada (26 Ene 2026) - 2 tipos de notificaciones implementadas
  > ✅ Task 29 completada (27 Ene 2026) - Centro de Notificaciones In-App
- **Sprint 7-8:** 🔄 Tasks 31-36 (UX/UI Polish) - EN PROGRESO
  > ✅ Branding: Logo e identidad visual (27 Ene 2026)
  > ✅ UX_UI_GUIA_MAESTRA.md creada
  > ⏳ Pendiente: Íconos PWA, favicon, micro-interacciones
- **Sprint 9:** ⏳ Tasks 45-48 (Panel Admin) - NUEVO
- **Sprint 10-11:** ⏳ Tasks 40-44 (Testing/QA)
- **Sprint 12:** ⏳ Tasks 37-39 (PWA) - AL FINAL
- **Diferido:** ⏸️ Tasks 18-20, 22 (Chat In-App) - WhatsApp cubre necesidad inicial
- **Diferido:** ⏸️ Task 30 (Settings Notificaciones) - No crítico con solo 2 tipos

---

## 🔴 PRIORIDAD 1: FUNDAMENTOS TÉCNICOS ✅ COMPLETADO

### ✅ Task 1: Estructura de Archivos JS Separados
**Tiempo:** 1-2 días | **Estado:** ✅ Completado

**Objetivo:** Base modular para mantenimiento eficiente

**Subtareas Completadas:**
- ✅ JavaScript extraído de HTML a archivos separados
- ✅ Creado `/js/auth/login.js` y `/js/auth/register.js`
- ✅ Creado `/js/dashboard/ofertas.js` y `/js/dashboard/aplicaciones.js`
- ✅ Creado `/js/utils/validators.js` y `/js/utils/helpers.js`
- ✅ Todos los HTML actualizados con imports correctos
- ✅ Testing de compatibilidad pasado

**Por qué primero:** Base sólida para todo lo demás

---

### ✅ Task 2: Sistema de Design Tokens CSS
**Tiempo:** 2-3 días | **Estado:** ✅ Completado

**Objetivo:** Consistencia visual en toda la aplicación

**Subtareas Completadas:**
- ✅ Creado `/css/design-tokens.css` con variables globales
- ✅ Paleta de colores definida (primary, success, warning, danger)
- ✅ Tipografía estandarizada (tamaños, weights, line-heights)
- ✅ Sistema de espaciado 8px grid (4, 8, 16, 24, 32, 48)
- ✅ Shadows definidos (elevation system)
- ✅ Border-radius consistentes
- ✅ Transitions/animations estándar
- ✅ Aplicado a todos los componentes existentes

**Por qué primero:** Consistencia visual garantizada

---

### ✅ Task 3: Componentes Reutilizables UI
**Tiempo:** 3-4 días | **Estado:** ✅ Completado

**Objetivo:** Acelerar desarrollo futuro

**Subtareas Completadas:**
- ✅ Creado `/css/components/buttons.css`
- ✅ Creado `/css/components/cards.css`
- ✅ Creado `/css/components/forms.css`
- ✅ Creado `/css/components/modals.css`
- ✅ Creado `/css/components/alerts.css`
- ✅ Creado `/js/components/modal.js` (lógica reutilizable)
- ✅ Creado `/js/components/dropdown.js`
- ✅ Documentación de cada componente

**Por qué primero:** Acelera desarrollo, UX consistente

---

## 🔴 PRIORIDAD 2: PERFILES COMPLETOS ✅ COMPLETADO

### ✅ Task 4: Estructura Firestore Perfiles
**Tiempo:** 1 día | **Estado:** ✅ Completado

**Objetivo:** Base de datos robusta para perfiles

**Subtareas Completadas:**
- ✅ Schema completo `usuarios/{uid}/perfil` diseñado
- ✅ Campos trabajador: foto, bio, experiencia[], habilidades[], certificaciones[]
- ✅ Campos empleador: logo, descripción, verificado
- ✅ Índices creados para búsquedas eficientes
- ✅ Reglas de seguridad implementadas
- ✅ Usuarios existentes migrados al nuevo schema

---

### ✅ Task 5: Upload de Fotos/Imágenes
**Tiempo:** 2 días | **Estado:** ✅ Completado

**Objetivo:** Perfiles con foto = 10x más confianza

**Subtareas Completadas:**
- ✅ Firebase Storage integrado
- ✅ Función upload foto perfil implementada
- ✅ Resize automático 200x200px thumbnail
- ✅ Compresión imágenes WebP
- ✅ Preview antes de upload
- ✅ Crop/rotate básico
- ✅ Loading states
- ✅ Error handling completo

---

### ✅ Task 6: Página Perfil Trabajador
**Tiempo:** 3-4 días | **Estado:** ✅ Completado

**Objetivo:** Core value proposition para empleadores

**Subtareas Completadas:**
- ✅ Creado `/perfil-trabajador.html`
- ✅ Sección foto + nombre + ubicación
- ✅ Bio/descripción (500 caracteres)
- ✅ Experiencia laboral con tabs
- ✅ Habilidades con badges visuales
- ✅ Portfolio con fotos antes/después
- ✅ Certificaciones/diplomas
- ✅ Calificaciones (placeholder)
- ✅ Botón "Editar Perfil" (solo dueño)
- ✅ Responsive móvil perfecto
- ✅ Skeleton loading states

---

### ✅ Task 7: Editor de Perfil Interactivo
**Tiempo:** 3-4 días | **Estado:** ✅ Completado

**Objetivo:** Trabajadores muestran experiencia

**Subtareas Completadas:**
- ✅ Creado `/editar-perfil.html`
- ✅ Form multi-sección (datos, experiencia, skills, portfolio)
- ✅ Agregar/eliminar experiencias dinámicamente
- ✅ Agregar/eliminar habilidades con autocomplete
- ✅ Upload múltiple portfolio (max 10 fotos)
- ✅ Preview en tiempo real
- ✅ Validación inline
- ✅ Guardar como draft (localStorage)
- ✅ Progress indicator (% completitud)
- ✅ Guardar en Firestore
- ✅ Feedback visual éxito/error

---

## 🔴 PRIORIDAD 3: GEOLOCALIZACIÓN ✅ COMPLETADO

### ✅ Task 8: Integración Google Maps API
**Tiempo:** 1 día | **Estado:** ✅ Completado

**Objetivo:** Requisito para geolocalización

**Subtareas Completadas:**
- ✅ Cuenta Google Cloud creada
- ✅ Maps JavaScript API activada
- ✅ API key obtenida: `AIzaSyBxopsd9CPAU2CSV91z8YAw_upxochOGYE`
- ✅ Restricción: Solo Geocoding API
- ✅ Google Maps SDK cargado
- ✅ Componente mapa reutilizable creado
- ✅ Estilos mapa configurados
- ✅ Testing en Chrome/Firefox/Safari
- ✅ Manejo de errores implementado

---

### ✅ Task 9: Pedir Permiso Ubicación Usuario
**Tiempo:** 1-2 días | **Estado:** ✅ Completado

**Objetivo:** Base para ofertas cercanas

**Subtareas Completadas:**
- ✅ Solicitud `navigator.geolocation` permission
- ✅ UI explicativa (por qué necesitamos ubicación)
- ✅ Guardar coordenadas en Firestore
- ✅ Fallback selector ciudad manual
- ✅ Detectar ciudad automáticamente (reverse geocoding)
- ✅ Settings cambiar ubicación después
- ✅ Privacy notice implementado
- ✅ Badge ubicación dinámico en dashboard
- ✅ Actualización background automática

---

### ✅ Task 10: Geocoding Ofertas
**Tiempo:** 2 días | **Estado:** ✅ Completado (14 Ene 2026)

**Objetivo:** Ofertas con ubicación precisa

**Subtareas Completadas:**
- ✅ Google Places API Autocomplete integrado
- ✅ Mini-mapa preview en formulario publicar oferta
- ✅ Validación bounds Perú
- ✅ Estructura ubicación en Firestore:
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
- ✅ Script migración ofertas existentes
- ✅ Testing con diferentes direcciones

**Archivos Creados/Modificados:**
```
- publicar-oferta.html (sección ubicación con autocomplete)
- js/publicar-oferta.js (lógica geocoding)
- css/publicar-oferta.css (estilos mapa preview)
- js/utils/migrar-ofertas.js (NUEVO - migración)
```

**Por qué:** Ofertas necesitan ubicación para búsqueda por distancia

---

### ✅ Task 11: Búsqueda por Distancia
**Tiempo:** 2 días | **Estado:** ✅ Completado (14 Ene 2026)

**Objetivo:** Feature #1 más solicitada

**Subtareas Completadas:**
- ✅ Filtro dropdown "Distancia máxima": 5km, 10km, 20km, 50km
- ✅ Función `calcularDistanciaHaversine()` en js/utils/distance.js
- ✅ Badge "A X km de ti" con colores (verde ≤5km, amarillo 5-15km, rojo >15km)
- ✅ Ordenar ofertas por cercanía
- ✅ Fix: `obtenerCoordenadasDistrito` filtra por depto/provincia (evita duplicados)
- ✅ Testing con diferentes ubicaciones

**Archivos Creados/Modificados:**
```
- js/utils/distance.js (funciones Haversine)
- js/dashboard/dashboard.js (filtro distancia integrado)
- dashboard.html (dropdown distancia)
- css/dashboard-main.css (estilos badge distancia)
```

**Por qué:** Feature crítica para encontrar trabajo cercano

---

### ✅ Task 12: Mapa Interactivo Ofertas
**Tiempo:** 3-4 días | **Estado:** ✅ Completado (19 Ene 2026)

**Objetivo:** UX premium

**Subtareas Completadas:**
- ✅ Página `/mapa-ofertas.html` creada
- ✅ Google Maps centrado en Lima con ubicación usuario
- ✅ Markers por categoría con colores SVG personalizados
- ✅ Clustering de markers cercanos (MarkerClusterer)
- ✅ Click en cluster con misma ubicación → modal lista ofertas
- ✅ Preview rápido al hacer click en marker
- ✅ Modal detalle completo SIN salir del mapa
- ✅ Postulación directa desde el mapa
- ✅ Sidebar con filtros (categoría, distancia)
- ✅ Solo visible para trabajadores (empleadores redirigidos)
- ✅ Responsive móvil (sidebar como drawer desde abajo)
- ✅ Botón "Ver Mapa" en dashboard (solo trabajadores)
- ✅ Link en navegación lateral

**Archivos Creados:**
```
- mapa-ofertas.html (NUEVO)
- js/mapa-ofertas.js (NUEVO)
- css/mapa-ofertas.css (NUEVO)
```

**Componentes del Mapa:**
- Google Maps JavaScript API
- MarkerClusterer (agrupación pins)
- Markers SVG con colores por categoría
- Modal detalle + postulación in-page
- Filtros sidebar sincronizados

**Por qué:** Diferenciador clave, competidores no tienen

---

## 🟠 PRIORIDAD 4: SISTEMA DE CALIFICACIONES ✅ COMPLETADO

### ✅ Task 13: Estructura Firestore Calificaciones
**Tiempo:** 1 día | **Estado:** ✅ Completado (20 Ene 2026)

**Objetivo:** Base datos reviews

**Subtareas Completadas:**
- [x] Crear colección `calificaciones/{id}`
- [x] Schema completo con campos bidireccionales
- [x] Validación: solo después trabajo completado
- [x] Validación: una calificación por oferta por tipo
- [x] Índices creados para consultas eficientes
- [x] Reglas seguridad implementadas

**Schema Firestore Implementado:**
```javascript
calificaciones/{calificacionId}
{
  trabajadorId: "uid_trabajador",
  trabajadorEmail: "email",
  trabajadorNombre: "nombre",
  empleadorId: "uid_empleador",
  empleadorEmail: "email",
  empleadorNombre: "nombre",
  ofertaId: "oferta123",
  ofertaTitulo: "título",
  aplicacionId: "aplicacion123",
  estrellas: 5,
  comentario: "Excelente trabajo",
  tipo: "empleador_a_trabajador" | "trabajador_a_empleador",
  fechaCalificacion: serverTimestamp(),
  respuesta: null | "texto respuesta",
  fechaRespuesta: null | timestamp
}
```

**Campos en usuarios/{uid}:**
```javascript
{
  calificacionPromedio: 4.8,
  totalCalificaciones: 47,
  distribucionCalificaciones: {1: 0, 2: 0, 3: 1, 4: 2, 5: 10}
}
```

---

### ✅ Task 14: Vista de Reseñas Recibidas para Trabajador
**Tiempo:** 1 día | **Estado:** ✅ Completado (21 Ene 2026)

**Subtareas Completadas:**
- [x] Nueva pestaña "Reseñas" en perfil-trabajador.html
- [x] Resumen con promedio grande + estrellas visuales
- [x] Barras de distribución (5★ a 1★) con porcentajes
- [x] Lista de reseñas con cards detalladas
- [x] Nombre empleador, trabajo, estrellas, comentario, fecha
- [x] Botón "Responder" para reseñas sin respuesta (Task 17)
- [x] Empty state si no hay reseñas
- [x] Responsive móvil perfecto

**Archivos Modificados:**
```
- perfil-trabajador.html (nueva pestaña reseñas)
- js/perfil-trabajador.js (cargarResenasRecibidas, renderizar)
- css/perfil-trabajador.css (estilos reseñas y distribución)
```

---

### ✅ Task 15: Calificación Bidireccional (Trabajador → Empleador)
**Tiempo:** 2 días | **Estado:** ✅ Completado (21 Ene 2026)

**Subtareas Completadas:**
- [x] Modal calificación en mis-aplicaciones-trabajador.html
- [x] Botón "⭐ Calificar Empleador" en estado completado
- [x] Sistema de estrellas interactivo con textos descriptivos
- [x] Textarea comentario opcional (max 300 chars)
- [x] Guardar en Firestore con tipo "trabajador_a_empleador"
- [x] Actualizar promedio empleador automáticamente
- [x] Validación: solo una calificación por aplicación
- [x] Toast feedback "Calificación enviada"

**Archivos Modificados:**
```
- mis-aplicaciones-trabajador.html (modal calificación)
- js/mis-aplicaciones-trabajador.js (funciones calificar)
- css/mis-aplicaciones-trabajador.css (estilos modal)
```

---

### ✅ Task 16: Historial Completo de Calificaciones
**Tiempo:** 2 días | **Estado:** ✅ Completado (21 Ene 2026)

**Subtareas Completadas:**
- [x] Nueva página historial-calificaciones.html
- [x] Tabs: "Recibidas" / "Dadas"
- [x] Filtros por puntuación (todas, 5★, 4★, etc)
- [x] Ordenamiento por fecha
- [x] Lista con todos los detalles de cada calificación
- [x] Ver respuestas si existen
- [x] Link desde perfil trabajador
- [x] Empty states apropiados
- [x] Responsive móvil

**Archivos Creados:**
```
- historial-calificaciones.html (NUEVO)
- js/historial-calificaciones.js (NUEVO)
- css/historial-calificaciones.css (NUEVO)
```

---

### ✅ Task 17: Responder a Calificaciones Recibidas
**Tiempo:** 1 día | **Estado:** ✅ Completado (21 Ene 2026)

**Subtareas Completadas:**
- [x] Modal para escribir respuesta (max 300 chars)
- [x] Botón "💬 Responder" en cada reseña sin respuesta
- [x] Guardar respuesta y fechaRespuesta en Firestore
- [x] Mostrar respuesta después de enviar
- [x] Validación: solo una respuesta por calificación
- [x] Reglas Firestore actualizadas para permitir update

**Reglas Firestore:**
```javascript
allow update: if request.auth != null &&
  resource.data.trabajadorId == request.auth.uid &&
  (!('respuesta' in resource.data) || resource.data.respuesta == null) &&
  request.resource.data.respuesta != null;
```

---

### ✅ Mejora Extra: Rating Visible en Postulaciones
**Estado:** ✅ Completado (21 Ene 2026)

**Funcionalidad:**
- [x] Empleador ve rating del trabajador en cada postulación
- [x] Click en estrellas abre modal con detalle de calificaciones
- [x] "Sin calificaciones aún" para trabajadores nuevos
- [x] Cache de ratings para performance

**Archivos Modificados:**
```
- js/mis-aplicaciones.js (cargarRatingsTrabajadores, verDetalleCalificaciones)
- css/mis-aplicaciones.css (estilos rating y modal detalle)
- mis-aplicaciones.html (modal detalle calificaciones)
```

---

## 🟠 PRIORIDAD 5: SISTEMA DE MENSAJERÍA (DIFERIDO)

> **ACTUALIZACIÓN 19 Ene 2026:** El chat in-app se difiere porque WhatsApp cubrirá la necesidad inicial de comunicación. Task 21 (Aceptar/Rechazar) se adelantó al Sprint 4 con integración WhatsApp.
>
> **Nuevo flujo:** Postulación → Aceptar/Rechazar → WhatsApp → Trabajo → Completado → Calificación
>
> Las tasks de mensajería (18-20, 22-23) se implementarán después si hay demanda de chat in-app.

### Task 18: Estructura Firestore Chat
**Tiempo:** 1 día | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Crear colección `conversaciones/{conversacionId}`
- [ ] Crear subcollection `conversaciones/{id}/mensajes/{mensajeId}`
- [ ] Schema conversación:
```javascript
{
  participantes: [uid1, uid2],
  ultimoMensaje: "Hola, ¿cuándo puedes...?",
  ultimoMensajeTimestamp: serverTimestamp(),
  noLeidosPor: {
    uid1: 2,
    uid2: 0
  }
}
```
- [ ] Schema mensaje:
```javascript
{
  de: uid,
  texto: "Mensaje aquí",
  timestamp: serverTimestamp(),
  leido: false
}
```
- [ ] Índices: `participantes`, `timestamp`
- [ ] Reglas seguridad: solo participantes leen/escriben

**Por qué:** Base datos chat

---

### Task 19: Lista de Conversaciones
**Tiempo:** 2 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Crear `/mensajes.html`
- [ ] Lista conversaciones activas ordenadas por última actividad
- [ ] Mostrar por conversación:
  - Avatar otro usuario
  - Nombre
  - Último mensaje (truncado a 50 chars)
  - Timestamp relativo ("hace 5 min")
  - Badge contador mensajes no leídos
- [ ] Click conversación → ir a `/chat.html?id={conversacionId}`
- [ ] Real-time updates (Firestore `onSnapshot`)
- [ ] Empty state: "No tienes conversaciones aún"
- [ ] Skeleton loading (mientras carga)
- [ ] Responsive móvil
- [ ] Link desde navbar

**Archivos a Crear:**
```
- mensajes.html (NUEVO)
- js/mensajes/lista-conversaciones.js (NUEVO)
- css/pages/mensajes.css (NUEVO)
```

**Por qué:** Inbox de mensajes

---

### Task 20: Chat 1-1 en Tiempo Real
**Tiempo:** 3-4 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Crear `/chat.html?conversacionId=xxx`
- [ ] Header chat:
  - Avatar + nombre otro usuario
  - Estado online/offline (presence)
  - Botón back a lista
- [ ] Área mensajes scrollable (scroll bottom por default)
- [ ] Input mensaje + botón enviar
- [ ] Enter para enviar (Shift+Enter para nueva línea)
- [ ] Mensajes en tiempo real (`onSnapshot`)
- [ ] Scroll automático a último mensaje
- [ ] Timestamp cada mensaje (o agrupar por día)
- [ ] Indicador "escribiendo..." cuando otro usuario escribe
- [ ] Marcar mensajes como leídos automáticamente
- [ ] Copy/paste imágenes (nice to have - opcional)
- [ ] Diseño tipo WhatsApp (burbujas izq/der)
- [ ] Responsive móvil perfecto

**Archivos a Crear:**
```
- chat.html (NUEVO)
- js/chat/chat-tiempo-real.js (NUEVO)
- css/pages/chat.css (NUEVO)
```

**Por qué:** Core communication feature

---

### ✅ Task 21: Aceptar/Rechazar Postulaciones + WhatsApp [COMPLETADA]
**Tiempo:** 1 día | **Estado:** ✅ COMPLETADA (19 Ene 2026)

**Objetivo:** Permitir al empleador decidir sobre candidatos y contactarlos por WhatsApp

**Flujo implementado:**
```
Trabajador postula → Empleador ve en "Ver Candidatos" →
Empleador ACEPTA o RECHAZA → Si acepta: Botón WhatsApp visible →
Contactan por WhatsApp → Trabajo → Marcar Completado → [Calificación]
```

**Subtareas completadas:**
- [x] Agregar botones "Aceptar" y "Rechazar" en cada postulación (Ver Candidatos)
- [x] Botón "Aceptar":
  - Cambiar estado aplicación a "aceptado"
  - Mostrar número de teléfono del trabajador
  - Mostrar botón "Contactar por WhatsApp" con mensaje pre-llenado
  - Actualizar UI con badge verde "ACEPTADO"
- [x] Botón "Rechazar":
  - Modal confirmación "¿Seguro que deseas rechazar a [nombre]?"
  - Cambiar estado aplicación a "rechazado"
  - Mostrar con badge gris "RECHAZADO"
- [x] Botón "Marcar como Completado":
  - Solo visible en postulaciones aceptadas
  - Cambia estado a "completado"
  - Muestra botón "Calificar" (placeholder para Task 13-15)
- [x] Estados de aplicación: `pendiente` → `aceptado` | `rechazado` | `completado`
- [x] Filtro en "Ver Candidatos": Todos, Pendientes, Aceptados, Rechazados, Completados
- [x] Vista trabajador: mostrar estado de sus aplicaciones con colores
- [x] Teléfonos guardados en aplicaciones (dashboard.js y mapa-ofertas.js)
- [x] **Bonus: Migración a Nueva Places API** (AutocompleteSuggestion)

**Archivos Modificados:**
```
- mis-aplicaciones.html (UI botones y filtros)
- js/mis-aplicaciones.js (lógica aceptar/rechazar/completar + escape HTML)
- css/mis-aplicaciones.css (estilos badges estados + WhatsApp)
- mis-aplicaciones-trabajador.html (UI estado)
- js/mis-aplicaciones-trabajador.js (mostrar estado + contacto empleador)
- css/mis-aplicaciones-trabajador.css (estilos estados)
- js/dashboard/dashboard.js (guardar teléfonos en aplicación)
- js/mapa-ofertas.js (guardar teléfonos en aplicación)
- js/publicar-oferta.js (Nueva Places API + mapeo códigos postales)
- css/publicar-oferta.css (estilos dropdown sugerencias)
- publicar-oferta.html (contenedor autocomplete)
```

**Por qué:** Prerequisito para calificaciones + contacto directo vía WhatsApp

---

### Task 22: Notificaciones Mensajes
**Tiempo:** 1-2 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Push notification cuando recibe mensaje (si está offline/otra pestaña)
- [ ] Badge contador en tab browser (favicon con número)
- [ ] Badge contador en navbar "Mensajes"
- [ ] Sonido opcional al recibir mensaje (con permission)
- [ ] Vibración en móvil
- [ ] Notification click → abrir chat directo
- [ ] Settings para desactivar sonido/vibración

**Requiere:** Task 27 (Setup FCM) completado primero

**Por qué:** Engagement + respuesta rápida

---

### Task 23: Límites Mensajes Free vs Premium
**Tiempo:** 1 día | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Implementar contador `mensajesMes: {count, limite: 10}` en Firestore
- [ ] Free: máx 10 conversaciones activas/mes
- [ ] Premium: ilimitado
- [ ] Al intentar 11va conversación → Modal upgrade Premium
- [ ] Contador visual "X/10 conversaciones este mes"
- [ ] Reset automático cada mes (Cloud Function)
- [ ] No contar conversaciones ya iniciadas (solo nuevas)

**Por qué:** Incentivo upgrade Premium

---

## 🟡 PRIORIDAD 6: BÚSQUEDA AVANZADA (Semana 4)

### ✅ Task 23: Refactorizar Filtros Dashboard
**Tiempo:** 2-3 días | **Estado:** ✅ Completado (22 Ene 2026)

**Subtareas Completadas:**
- [x] Crear componente `/js/components/filtros-avanzados.js`
- [x] Dropdowns custom (no `<select>` nativos)
- [x] Multiselect categorías (checkboxes, elegir varias)
- [x] Range slider salario (min-max visual)
- [x] Date picker fecha publicación (últimos 7/30/90 días)
- [x] Chip tags para filtros activos (removibles)
- [x] Botón "Limpiar todos los filtros"
- [x] Guardar estado filtros (localStorage)
- [x] Animaciones suaves (collapse/expand)
- [ ] Autocomplete ubicación (Google Places) - Diferido, input texto funciona

**Archivos Creados/Modificados:**
```
- js/components/filtros-avanzados.js (NUEVO - 1172 líneas)
- css/filtros-avanzados.css (NUEVO - 781 líneas)
- dashboard.html (filtros reemplazados)
- js/dashboard/dashboard.js (integración con nuevo componente)
```

**Componentes implementados:**
- `FiltrosAvanzados` - Clase principal del componente
- `CustomDropdown` - Dropdown estilizado con teclado
- `MultiSelectDropdown` - Selección múltiple con checkboxes
- `DualRangeSlider` - Slider dual para rango de salario

**Por qué:** UX profesional búsqueda

---

### ✅ Task 24: Sistema de Filtros Avanzados + Ordenamiento
**Tiempo:** 1-2 días | **Estado:** ✅ Completado (22 Ene 2026)

**Implementación completa sistema de filtros profesional:**

**Archivos creados:**
- `js/components/filtros-avanzados.js` - Componente modular completo
- `css/filtros-avanzados.css` - Estilos siguiendo design system

**Clases implementadas:**
- ✅ `CustomDropdown` - Dropdown accesible con navegación teclado
- ✅ `MultiSelectDropdown` - Checkboxes para categorías múltiples
- ✅ `DualRangeSlider` - Slider dual min/max salario
- ✅ `FiltrosAvanzados` - Clase principal con API pública

**Filtros disponibles:**
- ✅ Búsqueda texto (título, descripción) con debounce 300ms
- ✅ Multiselect categorías (9 categorías con colores)
- ✅ Ubicación (texto libre)
- ✅ Distancia máxima (5, 10, 20, 50 km) - se habilita con geolocalización
- ✅ Rango salarial (S/ 0 - S/ 5,000+)
- ✅ Fecha publicación (últimos 7/30/90 días)
- ✅ Ordenamiento: Más recientes, Más cercanas, Mayor/Menor salario

**Features UX:**
- ✅ Chips removibles para filtros activos (animados)
- ✅ Colores por tipo de chip (categoría=verde, ubicación=azul, salario=naranja)
- ✅ Badge contador de filtros activos
- ✅ Persistencia en localStorage
- ✅ Header colapsable
- ✅ Contador resultados ("Mostrando X de Y ofertas")
- ✅ Botón "Limpiar" para resetear todos

**Accesibilidad:**
- ✅ ARIA labels completos
- ✅ Navegación por teclado (Tab, Enter, Escape, Arrow keys)
- ✅ Focus visible
- ✅ Touch targets mínimo 44px
- ✅ Soporte prefers-reduced-motion

**Por qué:** UX profesional nivel app nativa

---

### Task 25: Guardar Búsquedas (Premium)
**Tiempo:** 2 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Botón "Guardar esta búsqueda" en filtros
- [ ] Modal: "Nombre tu búsqueda" (ej: "Electricista Miraflores")
- [ ] Guardar todos filtros activos + ordenamiento
- [ ] Crear página `/mis-busquedas.html`
- [ ] Lista búsquedas guardadas con:
  - Nombre
  - Descripción filtros
  - Fecha guardado
  - Botón "Cargar"
  - Botón "Eliminar"
- [ ] Cargar búsqueda → aplicar filtros automáticamente
- [ ] Límite: 5 búsquedas free, ilimitado premium
- [ ] Modal upgrade al intentar 6ta

**Por qué:** Convenience premium feature

---

### Task 26: Alertas Automáticas Nuevas Ofertas (Premium)
**Tiempo:** 2-3 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Toggle "Alertarme cuando hay ofertas nuevas" en búsqueda guardada
- [ ] Cloud Function: check nuevas ofertas cada hora
- [ ] Si match con búsqueda guardada → enviar:
  - Email: "Nueva oferta perfecta para ti"
  - Push notification
- [ ] Configurar frecuencia: inmediata, diaria (resumen), semanal
- [ ] Pausar/reactivar alertas
- [ ] Unsubscribe fácil
- [ ] Solo premium (incentivo)
- [ ] Template email atractivo

**Requiere:** Cloud Functions setup

**Por qué:** Premium killer feature

---

## 🟡 PRIORIDAD 7: NOTIFICACIONES PUSH (Semana 5)

### ✅ Task 27: Setup Firebase Cloud Messaging
**Tiempo:** 1 día | **Estado:** ✅ Completado (26 Ene 2026)

**Subtareas Completadas:**
- [x] Configurar FCM en Firebase Console
- [x] Generar VAPID key para Web Push
- [x] Crear `/firebase-messaging-sw.js` (service worker)
- [x] Crear módulo `js/notifications/fcm-init.js`
- [x] Funciones: initializeFCM, requestNotificationPermission
- [x] Funciones: verificarEstadoNotificaciones, eliminarTokenFCM
- [x] Obtener y guardar FCM token en Firestore usuario
- [x] Toast notificación en foreground con sonido
- [x] Estilos `css/notifications.css` (banner + toast)
- [x] Cloud Functions desplegadas en us-central1
- [x] manifest.json con gcm_sender_id

**Archivos Creados:**
```
- firebase-messaging-sw.js (Service Worker FCM)
- js/notifications/fcm-init.js (Módulo cliente)
- css/notifications.css (Estilos UI)
- manifest.json (PWA config)
- firebase.json (Firebase CLI config)
- .firebaserc (Proyecto chambapp-7785b)
- functions/index.js (Cloud Functions)
- functions/package.json (Dependencias)
```

**Pendiente para integración completa:**
- [ ] Importar fcm-init.js en dashboard.html
- [ ] Crear iconos PWA (assets/icons/)

**Por qué:** Base técnica notificaciones

---

### ✅ Task 28: Tipos de Notificaciones
**Tiempo:** 2 días | **Estado:** ✅ Completado (26 Ene 2026)

**Subtareas Completadas:**
- [x] **notificarNuevaPostulacion** - Empleador recibe cuando alguien aplica
- [x] **notificarPostulacionAceptada** - Trabajador recibe cuando lo aceptan
- [x] Guardar historial en `usuarios/{uid}/notificaciones/`
- [x] Verificar si usuario tiene notificaciones activas
- [x] Verificar si usuario tiene token FCM válido

**Pendientes (futuras iteraciones):**
- [ ] Nuevo mensaje recibido (requiere chat in-app)
- [ ] Nueva oferta que match (alertas premium)
- [ ] Oferta favorita expira en 24h
- [ ] Recordatorio completar perfil (si <70%)

**Cloud Functions Implementadas (functions/index.js):**
```javascript
// 1. Nueva Postulación → Notifica Empleador
exports.notificarNuevaPostulacion = functions
    .region('us-central1')
    .firestore.document('aplicaciones/{aplicacionId}')
    .onCreate(async (snap, context) => {
        // Obtiene token FCM del empleador
        // Envía: "Nueva postulación: {nombre} se postuló a {oferta}"
        // Guarda en historial de notificaciones
    });

// 2. Postulación Aceptada → Notifica Trabajador
exports.notificarPostulacionAceptada = functions
    .region('us-central1')
    .firestore.document('aplicaciones/{aplicacionId}')
    .onUpdate(async (change, context) => {
        // Solo si estado cambió a 'aceptado'
        // Envía: "¡Te aceptaron! {empleador} aceptó tu postulación"
        // Guarda en historial de notificaciones
    });
```

**Schema Notificación Guardada:**
```javascript
usuarios/{uid}/notificaciones/{id}
{
    tipo: 'nueva_postulacion' | 'postulacion_aceptada',
    titulo: 'string',
    cuerpo: 'string',
    leida: false,
    url: '/mis-aplicaciones.html',
    datos: { aplicacionId, ofertaTitulo, ... },
    fechaCreacion: serverTimestamp()
}
```

**Por qué:** Engagement hooks automáticos

---

### ✅ Task 29: Centro de Notificaciones In-App
**Tiempo:** 1 día | **Estado:** ✅ Completado (27 Ene 2026)

**Subtareas Completadas:**
- [x] Crear `/notificaciones.html`
- [x] Subcolección Firestore `usuarios/{uid}/notificaciones/{id}`
- [x] Lista notificaciones con:
  - Icono según tipo (👤 postulación, 🎉 aceptación)
  - Título y descripción
  - Timestamp relativo ("Hace X minutos/horas/días")
  - Indicador visual "no leída" (borde azul + punto)
- [x] Badge contador no leídas en sidebar y bottom-nav
- [x] Marcar como leída al hacer click
- [x] Botón "Marcar todas como leídas"
- [x] Eliminar notificación individual con confirmación
- [x] Empty states (sin notificaciones / sin resultados de filtro)
- [x] Real-time updates (`onSnapshot`)
- [x] Click en notificación → navega a URL asociada
- [x] Filtros: Todas / Sin leer / Leídas
- [x] Reglas Firestore para subcolección notificaciones

**Archivos Creados:**
```
- notificaciones.html
- js/notificaciones.js
- css/notificaciones.css
- firestore.rules
```

**Por qué:** Hub central notificaciones

---

### Task 30: Settings Notificaciones
**Tiempo:** 1-2 días | **Estado:** ⏸️ Diferido

**Subtareas:**
- [ ] Crear sección en `/settings.html`: "Notificaciones"
- [ ] Toggle por cada tipo de notificación:
  - Nuevos mensajes
  - Nuevos aplicantes
  - Alertas ofertas
  - Recordatorios
  - Marketing (premium)
- [ ] Elegir canal por tipo: Email / Push / Ambos / Ninguno
- [ ] Frecuencia: Inmediato, Resumen diario, Resumen semanal
- [ ] Quiet hours: "No molestar entre 10pm - 8am"
- [ ] Guardar preferencias en Firestore
- [ ] Aplicar preferencias en Cloud Functions
- [ ] Testing exhaustivo

**Por qué:** Control usuario = mejor UX

---

## 🟡 PRIORIDAD 8: UX/UI POLISH GLOBAL (Semana 5-6)

### ✅ UX Mejora: Bottom Navigation Móvil (PWA)
**Tiempo:** 0.5 días | **Estado:** ✅ Completado (22 Ene 2026)

**Objetivo:** Navegación mobile-first estilo apps nativas (Uber, Rappi, LinkedIn)

**Subtareas Completadas:**
- [x] Crear `css/bottom-nav.css` con estilos profesionales
- [x] Crear `js/components/bottom-nav.js` con lógica de navegación
- [x] 5 tabs: Inicio | Explorar | Publicar/Buscar | Mensajes | Perfil
- [x] Botón central FAB para acción principal (estilo Uber)
- [x] Adaptativo por rol: trabajador ve "Buscar", empleador ve "Publicar"
- [x] Safe areas para notch/home indicator (iOS)
- [x] Touch targets 44px+ para accesibilidad
- [x] Ripple effect en tap
- [x] Soporte para badges de notificaciones
- [x] Modo landscape compacto (solo iconos)
- [x] Oculta sidebar automáticamente en móvil
- [x] Agregado a 7 páginas principales

**Archivos Creados/Modificados:**
```
- css/bottom-nav.css (NUEVO - 300 líneas)
- js/components/bottom-nav.js (NUEVO - 250 líneas)
- dashboard.html, mapa-ofertas.html, publicar-oferta.html,
  perfil-trabajador.html, perfil-empleador.html,
  mis-aplicaciones.html, mis-aplicaciones-trabajador.html
```

---

### ✅ UX Mejora: Dashboard Diferenciado por Rol
**Tiempo:** 0.5 días | **Estado:** ✅ Completado (22 Ene 2026)

**Objetivo:** Experiencias separadas y optimizadas para trabajador y empleador

**Vista Trabajador:**
- Stats: Ofertas Disponibles | Mis Aplicaciones | Trabajos Completados
- Filtros avanzados con multiselect y range slider
- Cards de ofertas con badge "Ya aplicaste" y distancia
- Botón "Ver Mapa" para explorar

**Vista Empleador (Nuevo diseño compacto):**
- Saludo personalizado con nombre
- Alerta de postulaciones pendientes (animación pulsante)
- Stats compactos en una línea (Ofertas | Postulaciones | Contratados)
- Cards de ofertas con badge de nuevas postulaciones
- Timeline de actividad reciente con tiempo relativo
- Sin filtros innecesarios

**Subtareas Completadas:**
- [x] Eliminar sección "Trabajadores Destacados" (datos falsos)
- [x] Crear `css/dashboard-empleador.css` para vista empleador
- [x] Implementar vistas separadas en HTML (dashboard-trabajador, dashboard-empleador)
- [x] Actualizar JS para cargar datos según rol
- [x] Alerta pendientes con animación
- [x] Timeline de actividad con iconos por estado
- [x] Cards compactas con conteo de aplicaciones
- [x] Empty states específicos por rol

**Archivos Creados/Modificados:**
```
- css/dashboard-empleador.css (NUEVO - 350 líneas)
- css/dashboard-main.css (section-actions responsive)
- dashboard.html (vistas separadas trabajador/empleador)
- js/dashboard/dashboard.js (lógica separada por rol)
```

---

### Task 31: Micro-interacciones y Animaciones
**Tiempo:** 3 días | **Estado:** 🔄 Parcialmente Completado

**Subtareas:**
- [ ] Hover states todos los botones (transform: scale(1.02))
- [ ] Loading skeletons en lugar de spinners (todas las listas)
- [ ] Transiciones suaves entre páginas (fade in/out)
- [ ] Animaciones entrada/salida modales (slide up)
- [ ] Ripple effect botones (Material Design)
- [ ] Smooth scroll automático (CSS: scroll-behavior: smooth)
- [ ] Toast notifications slide-in desde arriba
- [ ] Progress bars animados (width transition)
- [ ] Pulse effect en nuevos items (highlight background)
- [ ] Bounce en badges contador (animación)

**CSS Ejemplo:**
```css
.button {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.button:active {
  transform: translateY(0);
}
```

**Por qué:** "Juice" hace app feel premium

---

### Task 32: Estados Vacíos (Empty States)
**Tiempo:** 2 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Ilustraciones custom para cada empty state (usar Undraw.co)
- [ ] Sin ofertas dashboard:
  - Ilustración
  - Título: "No hay ofertas aún"
  - Copy: "Explora otras categorías o ajusta filtros"
  - CTA: "Ver todas las categorías"
- [ ] Sin aplicaciones:
  - "Busca tu primera chamba"
  - CTA: "Explorar ofertas"
- [ ] Sin mensajes:
  - "Postula a ofertas y empieza a conversar"
- [ ] Sin favoritos:
  - "Guarda ofertas que te interesen"
- [ ] Sin notificaciones:
  - "Todo al día ✓"
- [ ] Copy motivacional, NUNCA "No hay datos" genérico

**Por qué:** Oportunidades de engagement

---

### Task 33: Error States y Validaciones
**Tiempo:** 2 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Mensajes error humanos:
  - ❌ "Error 500" 
  - ✅ "No pudimos guardar. Intenta de nuevo"
- [ ] Validación inline forms (real-time, al perder focus)
- [ ] Error boundaries (catch JS errors, mostrar UI recovery)
- [ ] Página 404 custom con:
  - Ilustración divertida
  - "Esta página no existe"
  - Navegación a dashboard
  - Búsqueda
- [ ] Offline detection banner:
  - "Sin conexión. Mostrando contenido guardado"
  - Retry automático cuando vuelve online
- [ ] Retry automático requests fallidos (exponential backoff)
- [ ] Error illustrations friendly (no intimidantes)

**Por qué:** Errores inevitables, manejarlos bien

---

### Task 34: Loading States Optimizados
**Tiempo:** 2-3 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Skeleton screens en:
  - Lista ofertas dashboard
  - Perfil trabajador
  - Lista mensajes
  - Cards
- [ ] Lazy loading imágenes (IntersectionObserver)
- [ ] Blur-up effect fotos (tiny placeholder → full res)
- [ ] Optimistic UI updates:
  - Enviar mensaje → aparecer inmediato, confirmar después
  - Favorito → animar inmediato
- [ ] Infinite scroll ofertas (no paginación con números)
- [ ] Defer non-critical CSS/JS (load async)
- [ ] Code splitting (si aplica)
- [ ] Reducir bundle size (minify, tree shake)

**Por qué:** Perceived performance

---

### Task 35: Accesibilidad WCAG 2.1 AA
**Tiempo:** 2-3 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Contraste colores mínimo 4.5:1 (verificar con herramienta)
- [ ] Keyboard navigation completa:
  - Tab entre interactivos
  - Enter/Space para activar
  - Esc para cerrar modales
- [ ] Focus indicators visibles (outline o box-shadow)
- [ ] ARIA labels completos:
  - Botones sin texto
  - Iconos
  - Form inputs
- [ ] Alt text todas las imágenes descriptivo
- [ ] Headings jerárquicos (H1 → H2 → H3, no saltar)
- [ ] Skip to main content link
- [ ] Testing screen reader (NVDA en Windows, VoiceOver en Mac)
- [ ] Lighthouse Accessibility score >90

**Por qué:** Inclusión + SEO

---

### Task 36: Dark Mode (Opcional pero WOW)
**Tiempo:** 2-3 días | **Estado:** ⏳ Opcional

**Subtareas:**
- [ ] Detectar `prefers-color-scheme: dark`
- [ ] Crear paleta colores oscuros en design-tokens.css
- [ ] Toggle manual dark/light (switch en settings)
- [ ] Guardar preferencia (localStorage)
- [ ] Transición suave entre temas (CSS transitions)
- [ ] Testing exhaustivo (todos los componentes)
- [ ] Asegurar contraste mínimo en dark mode

**Por qué:** Feature esperada Gen Z

---

## 🟠 PRIORIDAD 9: PANEL DE ADMINISTRACIÓN (Semana 7-8)

> **NUEVO (23 Ene 2026):** Panel admin nivel 3 con configuraciones dinámicas, gestión de usuarios y analytics. Se implementa ANTES del testing para tener visibilidad durante las pruebas con usuarios reales.

### Task 45: Setup Admin + Configuraciones Dinámicas
**Tiempo:** 2-3 días | **Estado:** ⏳ Pendiente

**Objetivo:** Base del panel admin con configuraciones editables

**Subtareas:**
- [ ] Crear página `/admin.html` protegida
- [ ] Agregar campo `rol: 'admin'` en Firestore para usuarios autorizados
- [ ] Reglas Firestore: solo admins pueden leer/escribir `config/`
- [ ] Colección `config/categorias` con categorías dinámicas:
  ```javascript
  {
    id: "electricidad",
    nombre: "Electricidad",
    icono: "⚡",
    color: "#f59e0b",
    activo: true,
    orden: 1
  }
  ```
- [ ] CRUD de categorías (agregar, editar, desactivar)
- [ ] Colección `config/limites` para límites free/premium:
  ```javascript
  {
    aplicacionesMesFree: 5,
    aplicacionesMesPremium: 999,
    ofertasMesFree: 3,
    ofertasMesPremium: 999
  }
  ```
- [ ] UI para editar límites
- [ ] Migrar código hardcodeado para leer de Firestore
- [ ] Cache local de configuraciones (localStorage + refresh periódico)

**Archivos a crear:**
```
- admin.html
- js/admin/admin.js
- js/admin/config-manager.js
- css/admin.css
```

**Por qué:** Elimina necesidad de modificar código para cambios de configuración

---

### Task 46: Gestión de Usuarios
**Tiempo:** 2-3 días | **Estado:** ⏳ Pendiente

**Objetivo:** Ver y gestionar usuarios desde el admin

**Subtareas:**
- [ ] Lista de usuarios con paginación (50 por página)
- [ ] Búsqueda por nombre, email, teléfono
- [ ] Filtros: tipo (trabajador/empleador), estado (activo/suspendido), premium
- [ ] Ver detalle de usuario:
  - Datos básicos
  - Ofertas publicadas (empleador)
  - Aplicaciones realizadas (trabajador)
  - Calificación promedio
  - Fecha registro, último acceso
- [ ] Acciones:
  - Suspender cuenta (soft ban)
  - Reactivar cuenta
  - Marcar como premium (manual)
  - Eliminar cuenta (soft delete)
- [ ] Log de acciones admin (quién hizo qué, cuándo)
- [ ] Modal confirmación para acciones destructivas

**Por qué:** Control sobre usuarios problemáticos y gestión de cuentas

---

### Task 47: Dashboard Analytics
**Tiempo:** 3-4 días | **Estado:** ⏳ Pendiente

**Objetivo:** Métricas en tiempo real del uso de la app

**Subtareas:**
- [ ] KPIs principales (cards en la parte superior):
  - Total usuarios registrados
  - Usuarios activos (últimos 7 días)
  - Ofertas activas
  - Aplicaciones este mes
  - Tasa de conversión (aplicaciones → aceptados)
- [ ] Gráfico: Registros por día (últimos 30 días)
- [ ] Gráfico: Ofertas publicadas por día
- [ ] Gráfico: Aplicaciones por día
- [ ] Top 5 categorías más usadas
- [ ] Top 5 distritos con más ofertas
- [ ] Usuarios por tipo (pie chart: trabajadores vs empleadores)
- [ ] Colección `analytics/daily/{fecha}` para agregar datos diarios
- [ ] Cloud Function para calcular métricas diarias (cron cada noche)
- [ ] Filtro de rango de fechas

**Librerías sugeridas:**
- Chart.js o ApexCharts para gráficos
- Lightweight, no requiere framework

**Por qué:** Visibilidad del estado de la app y toma de decisiones basada en datos

---

### Task 48: Sistema de Reportes y Moderación
**Tiempo:** 2 días | **Estado:** ⏳ Pendiente

**Objetivo:** Gestionar contenido reportado por usuarios

**Subtareas:**
- [ ] Botón "Reportar" en ofertas y perfiles (para usuarios)
- [ ] Modal con razones predefinidas:
  - Contenido inapropiado
  - Información falsa
  - Spam
  - Otro (texto libre)
- [ ] Colección `reportes/{id}`:
  ```javascript
  {
    tipo: "oferta" | "usuario",
    targetId: "id_oferta_o_usuario",
    reportadoPor: "uid",
    razon: "spam",
    descripcion: "...",
    estado: "pendiente" | "revisado" | "accion_tomada",
    fechaReporte: timestamp,
    revisadoPor: null | "admin_uid",
    fechaRevision: null | timestamp,
    accionTomada: null | "eliminado" | "advertencia" | "ignorado"
  }
  ```
- [ ] Vista admin: Lista de reportes pendientes
- [ ] Acciones desde admin:
  - Ver contenido reportado
  - Marcar como revisado
  - Tomar acción (eliminar oferta, suspender usuario)
  - Ignorar reporte
- [ ] Badge contador de reportes pendientes en sidebar admin
- [ ] Notificación email al admin cuando hay nuevo reporte (opcional)

**Por qué:** Mantener calidad del contenido y confianza de usuarios

---

## 🟢 PRIORIDAD 10: TESTING Y QA (Semana 9-10)

> **NOTA:** El testing se realiza DESPUÉS del panel admin para poder monitorear métricas durante las pruebas.

### Task 40: Testing Cross-Browser
**Tiempo:** 2-3 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Chrome/Edge (Chromium) - Windows + Mac
- [ ] Firefox - Windows + Mac
- [ ] Safari - macOS
- [ ] Safari iOS - iPhone
- [ ] Chrome Android - Samsung/Xiaomi
- [ ] Samsung Internet Browser
- [ ] Testing responsive: móvil (360px), tablet (768px), desktop (1024px+)
- [ ] Fix bugs encontrados
- [ ] Documentar issues por browser

**Por qué:** Funciona para todos

---

### Task 41: Testing Real Devices
**Tiempo:** 2 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] iPhone (Safari iOS) - varios modelos
- [ ] Android (Chrome) - varios fabricantes
- [ ] Tablet Android
- [ ] Desktop Windows
- [ ] Desktop macOS
- [ ] Conexiones lentas: 3G simulation (Chrome DevTools)
- [ ] Fix issues específicos de dispositivos
- [ ] Touch interactions (tap, swipe, pinch zoom)

**Por qué:** Emuladores no son suficientes

---

### Task 42: Security Audit
**Tiempo:** 2 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Revisar reglas Firestore completas (no over-permissive)
- [ ] Validación input server-side (Cloud Functions)
- [ ] Sanitize user content (XSS prevention)
- [ ] Rate limiting endpoints (evitar abuse)
- [ ] Secure headers (CSP, X-Frame-Options)
- [ ] HTTPS everywhere (force redirect)
- [ ] Secrets en environment variables (no hardcoded)
- [ ] Fix vulnerabilidades encontradas
- [ ] Testing con OWASP Top 10

**Por qué:** Proteger usuarios y datos

---

### Task 43: Beta Testing con Usuarios Reales
**Tiempo:** 1 semana (paralelo) | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Reclutar 20-30 beta testers (Facebook groups trabajadores)
- [ ] Onboarding beta testers (video call guiado)
- [ ] Recolectar feedback:
  - Forms post-uso
  - Interviews 1-1 (5-10 usuarios)
- [ ] Instalar Hotjar o Microsoft Clarity (heatmaps, recordings)
- [ ] Identificar pain points principales
- [ ] Priorizar fixes críticos
- [ ] Iterar basado en feedback

**Por qué:** Feedback real invaluable

---

### Task 44: Documentation y README
**Tiempo:** 1-2 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] README.md completo en repo:
  - ¿Qué es ChambApp?
  - Setup instructions (clonar, Firebase config)
  - Architecture overview
  - Deployment guide
  - Contributing guidelines
- [ ] Documentar APIs principales
- [ ] Code comments en funciones complejas
- [ ] Troubleshooting common issues
- [ ] Changelog (versiones)

**Por qué:** Mantenimiento futuro

---

## 🟢 PRIORIDAD 11: PERFORMANCE Y PWA (Semana 11 - AL FINAL)

> **IMPORTANTE (23 Ene 2026):** PWA se implementa AL FINAL cuando toda la funcionalidad y UX/UI estén completos. Esto evita problemas de caché del Service Worker durante el desarrollo.

### Task 37: Optimización Performance
**Tiempo:** 2-3 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Minify CSS/JS (build process)
- [ ] Compress imágenes WebP (convertir todas)
- [ ] Lazy load todo below the fold
- [ ] CDN para assets estáticos (jsDelivr o Cloudflare)
- [ ] Caché agresivo (Service Worker estrategias)
- [ ] Reduce Firebase reads:
  - Batch queries
  - Pagination
  - Use cache when possible
- [ ] Lighthouse Performance score >90
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3s
- [ ] Largest Contentful Paint <2.5s

**Por qué:** Speed = retention

---

### Task 38: Conversión a PWA
**Tiempo:** 2 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Crear `manifest.json` completo
- [ ] Icons todos los tamaños: 72, 96, 128, 144, 152, 192, 384, 512
- [ ] Generar icons desde logo (usar PWA Asset Generator)
- [ ] Service Worker básico (precache assets)
- [ ] Offline fallback page
- [ ] Install prompt custom (no usar browser default)
- [ ] Splash screen branded
- [ ] Testing instalación iOS (Safari)
- [ ] Testing instalación Android (Chrome)
- [ ] Lighthouse PWA score 100

**Por qué:** Instalable = app feel

---

### Task 39: Modo Offline Básico
**Tiempo:** 2-3 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Service Worker estrategias:
  - Network-first: datos dinámicos (ofertas, mensajes)
  - Cache-first: assets estáticos (CSS, JS, imágenes)
  - Stale-while-revalidate: imágenes perfil
- [ ] Caché páginas principales (dashboard, perfil)
- [ ] Mostrar ofertas cacheadas cuando offline
- [ ] Banner: "Sin conexión. Mostrando contenido guardado"
- [ ] Queue acciones offline (enviar mensaje) → sync después
- [ ] Background sync (cuando vuelve online)
- [ ] Testing modo avión

**Por qué:** Reliability conexiones malas Perú

---

## 📊 RESUMEN FASE 1

### Por Categoría

| Categoría | Tareas | Tiempo | Estado |
|-----------|--------|--------|--------|
| Fundamentos Técnicos | 3 | 1 semana | ✅ Completado |
| Perfiles Completos | 4 | 1.5 semanas | ✅ Completado |
| Geolocalización | 5 | 1.5 semanas | ✅ Completado (19 Ene 2026) |
| Aceptar/Rechazar + WhatsApp | 1 | 1 día | ✅ Completado (19 Ene 2026) |
| Calificaciones | 5 (+1 extra) | 1 semana | ✅ Completado (21 Ene 2026) |
| Búsqueda Avanzada | 2 | 3 días | ✅ Parcial (Tasks 23-24 listas) |
| Mensajería In-App | 5 | 1.5 semanas | ⏸️ Diferido (WhatsApp cubre) |
| Notificaciones | 4 | 1 semana | 🔄 En Progreso (2/4 completadas) |
| UX/UI Polish | 6 | 2 semanas | ⏳ Pendiente |
| **Panel Admin (NUEVO)** | 4 | 1.5 semanas | ⏳ Pendiente |
| Testing/QA | 5 | 2 semanas | ⏳ Pendiente |
| Performance/PWA | 3 | 1 semana | ⏳ Pendiente (AL FINAL) |

**TOTAL:** 49 tareas | **14-15 semanas** (~3.5 meses)

---

### Progreso Actual

```
COMPLETADAS: 28/49 (57%)
DIFERIDAS:   5/49 (10%)
PENDIENTES:  16/49 (33%)
```

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### Completado Recientemente:
- ✅ **Task 10:** Geocoding Ofertas (14 Ene 2026)
- ✅ **Task 11:** Búsqueda por Distancia (14 Ene 2026)
- ✅ **Task 12:** Mapa Interactivo Ofertas (19 Ene 2026)
- ✅ **Task 21:** Aceptar/Rechazar Postulaciones + WhatsApp (19 Ene 2026)
- ✅ **Task 13:** Sistema de Calificaciones base (20 Ene 2026)
- ✅ **Tasks 14-17:** Sistema de Calificaciones completo (21 Ene 2026)
- ✅ **Tasks 23-24:** Filtros Avanzados Dashboard (22 Ene 2026)
- ✅ **UX:** Bottom Navigation + Dashboard por rol (22 Ene 2026)
- ✅ **FIX:** Onboarding iOS Safari (23 Ene 2026)
- ✅ **FIX:** Estadísticas trabajador - campo aplicanteId (23 Ene 2026)
- ✅ **Task 27:** Setup FCM + Cloud Functions desplegadas (26 Ene 2026)
- ✅ **Task 28:** Notificaciones nueva postulación y aceptación (26 Ene 2026)
- ✅ **Task 29:** Centro de Notificaciones In-App (27 Ene 2026)
- ✅ **FIX:** Compatibilidad notificaciones Android Chrome (27 Ene 2026)
- ✅ **Reglas Firestore** configuradas y desplegadas (27 Ene 2026)
- ✅ **Branding:** UX_UI_GUIA_MAESTRA.md con identidad visual (27 Ene 2026)
- ✅ **Branding:** Logo oficial integrado en 12 páginas (27 Ene 2026)

### Orden de Ejecución (Actualizado 27 Ene 2026):
| Orden | Sprint | Tasks | Descripción |
|-------|--------|-------|-------------|
| ✅ | 6 | 27-29 | **Notificaciones Push + Centro In-App** - COMPLETADO |
| 🔄 | 7-8 | 31-36 | **UX/UI Polish** - EN PROGRESO (Branding completado) |
| 2 | 9 | 45-48 | **Panel Admin** (config, usuarios, analytics, reportes) |
| 3 | 10-11 | 40-44 | **Testing/QA** |
| 4 | 12 | 37-39 | **PWA** (AL FINAL, cuando todo esté listo) |

### Diferido:
- ⏸️ **Tasks 18-20, 22:** Chat In-App (WhatsApp cubre necesidad)
- ⏸️ **Tasks 25-26:** Búsqueda Avanzada Premium (poco impacto con pocas ofertas)
- ⏸️ **Task 30:** Settings Notificaciones (no crítico con solo 2 tipos)

---

## 💡 TIPS PARA EJECUCIÓN

### Método Task-Based:
1. **Leer task completa** antes de empezar
2. **Revisar archivos existentes** relacionados
3. **Crear subtareas checklist** en Notion/Trello
4. **Commit por subtarea** (no todo al final)
5. **Testing exhaustivo** antes de marcar completa
6. **Documentar decisiones** importantes

### Señales de Que Una Task Está Completa:
- ✅ Todas las subtareas checked
- ✅ Testing manual OK (móvil + desktop)
- ✅ Sin errores consola
- ✅ Performance adecuado
- ✅ Código commiteado a GitHub
- ✅ Documentado en changelog

---

**Última actualización:** 27 Enero 2026 (sesión tarde)
**Autor:** Joel (ChambApp Founder)
**Próxima revisión:** Al completar Sprint 7-8 (UX/UI Polish)

---

## NOTAS PARA CONTINUAR MAÑANA

### Trabajo Completado Hoy (27 Ene 2026 - Sesión Tarde):
1. ✅ UX_UI_GUIA_MAESTRA.md - Documento completo de identidad visual
2. ✅ Logo oficial creado con NanoBanana (Logo 1 - C con apretón de manos)
3. ✅ Logo integrado en 12 páginas HTML (header + footer landing)
4. ✅ CSS actualizado para estilos del logo
5. ✅ Desplegado a Firebase Hosting

### Pendiente Para Mañana:
1. **Generar íconos PWA** desde logo-icono.png:
   - Tamaños: 72, 96, 128, 144, 152, 192, 384, 512 px
   - Usar herramienta online o script
2. **Actualizar favicon** con el nuevo logo
3. **Actualizar manifest.json** con nuevos íconos
4. **Continuar Tasks 31-36** (micro-interacciones, empty states, etc.)

### Archivos Clave Creados/Modificados:
- `docs/UX_UI_GUIA_MAESTRA.md` - Guía completa de diseño
- `assets/logo/logo-completo.png` - Logo con texto
- `assets/logo/logo-icono.png` - Solo símbolo (para íconos PWA)
- `css/dashboard-main.css` - Estilos .logo, .logo-img, .logo-text

---

**🚀 ¡A ejecutar! Calidad sobre velocidad siempre.**
