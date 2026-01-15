# 🎯 FASE 1: EXPERIENCIA WOW - DETALLADO

**45 Tareas para Producto Excepcional**
**Duración:** 12-13 semanas (~3 meses)
**Progreso Actual:** 38% (17/45 tareas completadas)

---

## 📊 PROGRESO FASE 1

```
✅ COMPLETADAS: █████████████░░░░░░░░░░░░░░░ 17/45 (38%)
🔄 EN PROGRESO: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0/45 (0%)
⏳ PENDIENTES:  ████████████████░░░░░░░░░░░░ 28/45 (62%)
```

### Sprints (1 semana cada uno):
- **Sprint 1:** ✅ Tasks 1-3 (Fundamentos) - COMPLETADO
- **Sprint 2:** ✅ Tasks 4-7 (Perfiles) - COMPLETADO  
- **Sprint 3:** 🔄 Tasks 8-12 (Geolocalización) - EN PROGRESO (Task 9 completada)
- **Sprint 4:** ⏳ Tasks 13-17 (Calificaciones)
- **Sprint 5:** ⏳ Tasks 18-23 (Mensajería + Aceptar/Rechazar)
- **Sprint 6:** ⏳ Tasks 24-27 (Búsqueda Avanzada)
- **Sprint 7:** ⏳ Tasks 28-31 (Notificaciones)
- **Sprint 8-9:** ⏳ Tasks 32-37 (UX/UI Polish)
- **Sprint 10:** ⏳ Tasks 38-40 (Performance/PWA)
- **Sprint 11-12:** ⏳ Tasks 41-45 (Testing/QA)

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

## 🔴 PRIORIDAD 3: GEOLOCALIZACIÓN 🔄 EN PROGRESO

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

### 🎯 Task 10: Geocoding Ofertas [SIGUIENTE TAREA]
**Tiempo:** 2 días | **Estado:** 🔄 Próxima

**Objetivo:** Ofertas con ubicación precisa

**Subtareas:**
- [ ] Agregar campo `coordenadas: {lat, lng}` a schema ofertas en Firestore
- [ ] Agregar campo `direccion: string` legible
- [ ] Modificar `publicar-oferta.html`: agregar sección ubicación (Paso 3)
- [ ] Integrar Google Places API Autocomplete para direcciones
- [ ] Crear función `convertirDireccionACoordenadas(direccion)`
- [ ] Mostrar mini-mapa preview ubicación en formulario
- [ ] Validar coordenadas están dentro de Perú (bounds)
- [ ] Guardar ambos: dirección legible + coordenadas
- [ ] Migrar ofertas existentes (Lima centro default: -12.046374, -77.042793)
- [ ] Testing con diferentes direcciones

**Archivos a Modificar:**
```
- publicar-oferta.html (agregar input dirección + mapa preview)
- js/dashboard/publicar-oferta.js (lógica geocoding)
- css/pages/publicar-oferta.css (estilos mapa)
- Firestore: agregar campos a collection ofertas
```

**Por qué:** Ofertas necesitan ubicación para búsqueda por distancia

---

### Task 11: Búsqueda por Distancia
**Tiempo:** 2 días | **Estado:** ⏳ Pendiente

**Objetivo:** Feature #1 más solicitada

**Subtareas:**
- [ ] Crear filtro dropdown "Distancia máxima": 5km, 10km, 20km, 50km, Todas
- [ ] Implementar función `calcularDistanciaHaversine(lat1, lng1, lat2, lng2)`
- [ ] Obtener ubicación actual usuario (de Firestore)
- [ ] Filtrar ofertas por distancia al aplicar filtro
- [ ] Ordenar ofertas por cercanía (más cercanas primero)
- [ ] Mostrar "A X.X km de ti" en cada card oferta
- [ ] Caché resultados cálculo (performance)
- [ ] Testing con diferentes ubicaciones usuario

**Archivos a Crear/Modificar:**
```
- js/utils/distance-calculator.js (NUEVO - funciones Haversine)
- js/dashboard/dashboard.js (agregar filtro distancia)
- dashboard.html (UI filtro dropdown)
- css/components/filters.css (estilos)
```

**Algoritmo Haversine:**
```javascript
function calcularDistanciaHaversine(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radio Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * 
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distancia = R * c; // Distancia en km
  
  return distancia;
}
```

**Por qué:** Feature crítica para encontrar trabajo cercano

---

### Task 12: Mapa Interactivo Ofertas
**Tiempo:** 3-4 días | **Estado:** ⏳ Pendiente

**Objetivo:** UX premium

**Subtareas:**
- [ ] Crear `/mapa-ofertas.html` (página nueva)
- [ ] Inicializar mapa Google Maps centrado en Lima
- [ ] Mostrar pins (markers) en mapa para cada oferta
- [ ] Implementar clustering de pins cercanos (MarkerClusterer)
- [ ] Click en pin → mostrar preview oferta (InfoWindow)
- [ ] Sidebar con filtros (categoría, salario, distancia)
- [ ] Actualizar mapa en tiempo real al cambiar filtros
- [ ] Botón "Buscar en esta área" (cuando usuario mueve/zoom mapa)
- [ ] Toggle vista lista/mapa
- [ ] Responsive móvil (mapa arriba, lista abajo)
- [ ] Loading states mientras carga ofertas
- [ ] Link desde dashboard principal

**Archivos a Crear:**
```
- mapa-ofertas.html (NUEVO)
- js/mapa/mapa-ofertas.js (NUEVO)
- css/pages/mapa-ofertas.css (NUEVO)
```

**Componentes del Mapa:**
- Google Maps JavaScript API
- Marker Clusterer (para agrupar pins)
- InfoWindow custom con preview oferta
- Filtros sidebar sincronizados

**Por qué:** Diferenciador clave, competidores no tienen

---

## 🟠 PRIORIDAD 4: SISTEMA DE CALIFICACIONES (Semana 3)

### Task 13: Estructura Firestore Calificaciones
**Tiempo:** 1 día | **Estado:** ⏳ Pendiente

**Objetivo:** Base datos reviews

**Subtareas:**
- [ ] Crear colección `calificaciones/{id}`
- [ ] Schema: `{de: uid, para: uid, estrellas: 1-5, comentario: string, ofertaId: string, timestamp}`
- [ ] Validación: solo después trabajo completado
- [ ] Validación: una calificación por oferta
- [ ] Índices: `para` (para mostrar en perfil), `ofertaId` (única)
- [ ] Reglas seguridad: solo participantes de la oferta pueden calificar

**Schema Firestore:**
```javascript
calificaciones/{calificacionId}
{
  de: "uid_calificador",
  para: "uid_calificado",
  estrellas: 5,
  comentario: "Excelente trabajo, muy profesional",
  ofertaId: "oferta123",
  timestamp: serverTimestamp(),
  tipo: "trabajador" | "empleador"
}
```

**Agregar a usuarios/{uid}:**
```javascript
{
  calificacionPromedio: 4.8,
  totalCalificaciones: 47
}
```

**Por qué:** Base para trust & safety

---

### Task 14: Sistema de Estrellas Interactivo
**Tiempo:** 1 día | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Crear componente `/js/components/star-rating.js`
- [ ] Modo display (solo lectura, mostrar rating)
- [ ] Modo interactivo (seleccionar 1-5 estrellas)
- [ ] Hover states (previsualizar selección)
- [ ] Accesible (keyboard navigation: arrow keys)
- [ ] Animaciones suaves (fill stars)
- [ ] Responsive (tamaño adecuado móvil)
- [ ] Reutilizable en múltiples páginas

**Uso:**
```javascript
// Modo display
new StarRating('#rating-display', {
  rating: 4.5,
  readonly: true
});

// Modo interactivo
new StarRating('#rating-input', {
  onChange: (rating) => console.log(rating)
});
```

**Por qué:** Componente core reutilizable

---

### Task 15: Modal Calificar Trabajo
**Tiempo:** 2 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Trigger: cuando empleador marca oferta como "Completado"
- [ ] Modal con título "Califica a [nombre trabajador]"
- [ ] Star rating interactivo (1-5 estrellas)
- [ ] Textarea comentario (opcional, max 500 caracteres)
- [ ] Preview calificación antes de enviar
- [ ] Validación: estrellas obligatorio, comentario opcional
- [ ] Guardar en Firestore `calificaciones`
- [ ] Actualizar `calificacionPromedio` y `totalCalificaciones` del usuario
- [ ] No editable después (o solo 24h window)
- [ ] Email notification al calificado
- [ ] Loading states durante submit
- [ ] Toast "¡Gracias por tu calificación!"

**Archivos a Crear/Modificar:**
```
- js/components/modal-calificar.js (NUEVO)
- css/components/modal-calificar.css (NUEVO)
- Integrar en dashboard donde marca "Completado"
```

**Por qué:** Trust & safety fundamental

---

### Task 16: Mostrar Calificaciones en Perfil
**Tiempo:** 2 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] En perfil: mostrar promedio estrellas prominente (ej: "4.8 ★")
- [ ] Número total reviews (ej: "basado en 47 calificaciones")
- [ ] Histograma distribución:
  - 5★: 80% (barra visual)
  - 4★: 15%
  - 3★: 3%
  - 2★: 1%
  - 1★: 1%
- [ ] Lista últimos 10 comentarios con:
  - Foto calificador
  - Nombre
  - Rating
  - Comentario
  - Fecha relativa ("hace 2 días")
- [ ] Paginación si hay más de 10
- [ ] Filtrar por estrellas (dropdown: Todas, 5★, 4★, etc)
- [ ] Ordenar: Recientes primero, Mejores primero
- [ ] Botón "Reportar review inapropiado"

**Archivos a Modificar:**
```
- perfil-trabajador.html (agregar sección calificaciones)
- js/perfil/calificaciones.js (NUEVO - cargar y mostrar)
- css/pages/perfil.css (estilos calificaciones)
```

**Por qué:** Prueba social = más conversiones

---

### Task 17: Badges de Confianza
**Tiempo:** 1 día | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Badge "Top Rated" ⭐ (promedio >4.5 y mín 10 reviews)
- [ ] Badge "Nuevo" 🌟 (< 5 reviews)
- [ ] Badge "Verificado" ✓ (DNI verificado - futuro)
- [ ] Badge "Premium" 💎 (suscripción activa - futuro)
- [ ] Mostrar badges en:
  - Card oferta (cuando aplica)
  - Perfil trabajador (prominente)
  - Lista búsqueda trabajadores
- [ ] Diseño visual atractivo (colores distintivos)
- [ ] Tooltip explicativo al hover
- [ ] Lógica condicional para mostrar/ocultar

**Por qué:** Gamificación + señal confianza

---

## 🟠 PRIORIDAD 5: SISTEMA DE MENSAJERÍA (Semana 3-4)

> **NOTA IMPORTANTE:** Este sprint incluye también la funcionalidad de **Aceptar/Rechazar postulaciones**,
> ya que el flujo lógico es: Postulación → Conversación → Decisión (Aceptar/Rechazar) → Trabajo → Calificación.
> El empleador debe poder conversar con el trabajador ANTES de decidir si lo contrata.

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

### Task 21: Aceptar/Rechazar Postulaciones
**Tiempo:** 1-2 días | **Estado:** ⏳ Pendiente

**Objetivo:** Permitir al empleador decidir sobre candidatos después de conversar

**Flujo completo:**
```
Trabajador postula → Empleador ve en "Ver Candidatos" → Inicia chat →
Conversan → Empleador ACEPTA o RECHAZA → Notificación al trabajador
```

**Subtareas:**
- [ ] Agregar botones "Aceptar" y "Rechazar" en cada postulación (Ver Candidatos)
- [ ] Botón "Aceptar":
  - Cambiar estado aplicación a "aceptado"
  - Notificar al trabajador (email + in-app)
  - Mostrar datos de contacto completos
  - Actualizar UI con badge verde "ACEPTADO"
- [ ] Botón "Rechazar":
  - Modal confirmación "¿Seguro que deseas rechazar a [nombre]?"
  - Cambiar estado aplicación a "rechazado"
  - Notificar al trabajador (email + in-app) con mensaje genérico
  - Ocultar de lista activa o mostrar con badge gris "RECHAZADO"
- [ ] Estados de aplicación: `pendiente` → `aceptado` | `rechazado` | `completado`
- [ ] Filtro en "Ver Candidatos": Todos, Pendientes, Aceptados, Rechazados
- [ ] Vista trabajador: mostrar estado de sus aplicaciones (Pendiente/Aceptado/Rechazado)

**Archivos a Modificar:**
```
- js/mis-aplicaciones.js (botones aceptar/rechazar)
- css/mis-aplicaciones.css (estilos badges estados)
- js/mis-aplicaciones-trabajador.js (mostrar estado)
```

**Por qué:** Cierra el ciclo de contratación, da feedback al trabajador

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

### Task 23: Refactorizar Filtros Dashboard
**Tiempo:** 2-3 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Crear componente `/js/components/filtros-avanzados.js`
- [ ] Dropdowns custom (no `<select>` nativos)
- [ ] Multiselect categorías (checkboxes, elegir varias)
- [ ] Range slider salario (min-max visual)
- [ ] Date picker fecha publicación (últimos 7/30/90 días)
- [ ] Autocomplete ubicación (Google Places)
- [ ] Chip tags para filtros activos (removibles)
- [ ] Botón "Limpiar todos los filtros"
- [ ] Guardar estado filtros (localStorage)
- [ ] Animaciones suaves (collapse/expand)

**Archivos a Crear/Modificar:**
```
- js/components/filtros-avanzados.js (NUEVO)
- css/components/filtros.css (NUEVO)
- dashboard.html (reemplazar filtros actuales)
```

**Por qué:** UX profesional búsqueda

---

### Task 24: Ordenamiento Inteligente
**Tiempo:** 1-2 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Crear dropdown "Ordenar por":
  - Relevancia (default)
  - Más reciente
  - Salario: mayor a menor
  - Salario: menor a mayor
  - Distancia: más cercano
- [ ] Implementar algoritmo relevancia:
  ```javascript
  score = (matchKeywords * 0.4) + 
          (cercania * 0.3) + 
          (calificacionEmpleador * 0.2) + 
          (recencia * 0.1)
  ```
- [ ] Mantener ordenamiento en paginación
- [ ] Guardar preferencia usuario (localStorage)
- [ ] Indicador visual orden actual

**Por qué:** Mejores matches primero

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

### Task 27: Setup Firebase Cloud Messaging
**Tiempo:** 1 día | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Configurar FCM en Firebase Console
- [ ] Generar server key (para Cloud Functions)
- [ ] Crear `/firebase-messaging-sw.js` (service worker)
- [ ] Request permission navegador (botón en settings)
- [ ] Obtener y guardar FCM token en Firestore usuario
- [ ] Actualizar token si cambia (token refresh)
- [ ] Testing en Chrome, Firefox, Edge
- [ ] Testing móvil Android (Chrome)
- [ ] Safari iOS (usar APNs)

**Por qué:** Base técnica notificaciones

---

### Task 28: Tipos de Notificaciones
**Tiempo:** 2 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Nuevo mensaje recibido
- [ ] Aplicante nuevo a tu oferta
- [ ] Empleador te contactó
- [ ] Nueva oferta que match (alertas)
- [ ] Oferta favorita expira en 24h
- [ ] Recordatorio completar perfil (si <70%)
- [ ] Notificación upgrade premium (1 vez/semana max)
- [ ] Cada tipo tiene:
  - Título
  - Body
  - Icono
  - Click action (URL a abrir)

**Cloud Function:**
```javascript
exports.enviarNotificacion = functions.https.onCall(async (data) => {
  const { userId, tipo, payload } = data;
  
  // Obtener FCM token del usuario
  const userDoc = await admin.firestore()
    .collection('usuarios').doc(userId).get();
  const fcmToken = userDoc.data().fcmToken;
  
  // Construir mensaje
  const message = {
    notification: {
      title: getTitulo(tipo),
      body: getBody(tipo, payload),
      icon: '/assets/icon-192.png'
    },
    token: fcmToken
  };
  
  // Enviar
  await admin.messaging().send(message);
});
```

**Por qué:** Engagement hooks

---

### Task 29: Centro de Notificaciones In-App
**Tiempo:** 2 días | **Estado:** ⏳ Pendiente

**Subtareas:**
- [ ] Crear `/notificaciones.html`
- [ ] Colección Firestore `notificaciones/{userId}/items/{id}`
- [ ] Lista últimas 30 notificaciones:
  - Icono según tipo
  - Título y descripción
  - Timestamp relativo
  - Badge "no leída"
- [ ] Badge contador no leídas (navbar icono campanita)
- [ ] Marcar como leída al hacer click
- [ ] Botón "Marcar todas como leídas"
- [ ] Eliminar notificación individual
- [ ] Empty state bonito
- [ ] Real-time updates (`onSnapshot`)
- [ ] Link acción asociada (ej: click mensaje → ir a chat)

**Por qué:** Hub central notificaciones

---

### Task 30: Settings Notificaciones
**Tiempo:** 1-2 días | **Estado:** ⏳ Pendiente

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

### Task 31: Micro-interacciones y Animaciones
**Tiempo:** 3 días | **Estado:** ⏳ Pendiente

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

## 🟢 PRIORIDAD 9: PERFORMANCE Y PWA (Semana 6-7)

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

## 🟢 PRIORIDAD 10: TESTING Y QA (Semana 7-8)

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

## 📊 RESUMEN FASE 1

### Por Categoría

| Categoría | Tareas | Tiempo | Estado |
|-----------|--------|--------|--------|
| Fundamentos Técnicos | 3 | 1 semana | ✅ Completado |
| Perfiles Completos | 4 | 1.5 semanas | ✅ Completado |
| Geolocalización | 5 | 1.5 semanas | ✅ Completado |
| Calificaciones | 5 | 1 semana | ⏳ Pendiente |
| Mensajería + Aceptar/Rechazar | 6 | 1.5 semanas | ⏳ Pendiente |
| Búsqueda Avanzada | 4 | 1 semana | ⏳ Pendiente |
| Notificaciones | 4 | 1 semana | ⏳ Pendiente |
| UX/UI Polish | 6 | 2 semanas | ⏳ Pendiente |
| Performance/PWA | 3 | 1 semana | ⏳ Pendiente |
| Testing/QA | 5 | 2 semanas | ⏳ Pendiente |

**TOTAL:** 45 tareas | **12-13 semanas** (~3 meses)

---

### Progreso Actual

```
COMPLETADAS: 17/45 (38%)
EN PROGRESO: 0/45 (0%)
PENDIENTES:  28/45 (62%)
```

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### Esta Semana:
1. ✅ Fix warning `.stats-grid` (30 min)
2. 🎯 **Task 10:** Geocoding Ofertas (2 días)
3. 🎯 **Task 11:** Búsqueda por Distancia (2 días)

### Próxima Semana:
4. 🎯 **Task 12:** Mapa Interactivo (3-4 días)

### Siguientes 2 Semanas:
5. 🎯 **Tasks 13-17:** Sistema Calificaciones completo

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

**Última actualización:** 13 Enero 2026  
**Autor:** Joel (ChambApp Founder)  
**Próxima revisión:** Al completar cada 5 tareas

---

**🚀 ¡A ejecutar! Calidad sobre velocidad siempre.**
