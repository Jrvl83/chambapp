# PLAN DE REFACTORIZACIÓN JS - ChambApp

**Fecha:** 04 Febrero 2026
**Objetivo:** Reducir archivos JS de 1000-2000 líneas a módulos de máximo 500 líneas
**Regla violada:** REGLAS_DESARROLLO.md sección 3.1 (máx 500 líneas por archivo)

---

## DIAGNÓSTICO

### Archivos que Violan el Límite de 500 Líneas

| Archivo | Líneas | Exceso | Prioridad |
|---------|--------|--------|-----------|
| `publicar-oferta.js` | 2,067 | 4.1x | **CRÍTICA** |
| `dashboard.js` | 1,823 | 3.6x | **CRÍTICA** |
| `filtros-avanzados.js` | 1,462 | 2.9x | Alta |
| `perfil-trabajador.js` | 1,319 | 2.6x | Alta |
| `mis-aplicaciones.js` | 1,273 | 2.5x | Alta |
| `mapa-ofertas.js` | 1,185 | 2.4x | Alta |
| `mis-aplicaciones-trabajador.js` | 856 | 1.7x | Media |

**Total:** 9,985 líneas en 7 archivos → Meta: ~20 módulos de ~500 líneas

---

## PROBLEMAS IDENTIFICADOS

### 1. Código Duplicado (15 patrones)

| Patrón | Archivos | Líneas Estimadas |
|--------|----------|------------------|
| Generación de estrellas HTML | 4 archivos | ~60 líneas x4 |
| Formateo de fechas | 3 archivos | ~30 líneas x3 |
| Cálculo de distancias | 3 archivos | ~25 líneas x3 |
| Normalización de ubicación | 3 archivos | ~15 líneas x3 |
| Validación de imágenes | 2 archivos | ~40 líneas x2 |
| Optimización de imágenes | 2 archivos | ~55 líneas x2 |
| Card de oferta HTML | 3 archivos | ~50 líneas x3 |
| Modal de postulación | 2 archivos | ~80 líneas x2 |
| Carga de Google Maps API | 2 archivos | ~40 líneas x2 |
| Selector departamento/provincia/distrito | 2 archivos | ~65 líneas x2 |

**Ahorro estimado:** ~800 líneas al centralizar

### 2. Funciones que Exceden 30 Líneas (31 funciones)

**CRÍTICAS (>100 líneas) - Dividir urgentemente:**

| Función | Archivo | Líneas |
|---------|---------|--------|
| `crearAplicacionCard()` | mis-aplicaciones.js | 159 |
| `verDetalleOferta()` | mapa-ofertas.js | 132 |
| `verDetalleCalificaciones()` | mis-aplicaciones.js | 117 |
| `cargarOfertaParaEditar()` | publicar-oferta.js | 112 |
| `updateChips()` | filtros-avanzados.js | 109 |
| `autocompletarUbigeo()` | publicar-oferta.js | 105 |
| `enviarCalificacion()` | mis-aplicaciones.js | 104 |
| `aplicarFiltrosAvanzados()` | dashboard.js | 97 |
| `obtenerDistritoPorCoordenadas()` | publicar-oferta.js | 87 |

### 3. Console.logs de Debug (8 encontrados)

| Archivo | Líneas |
|---------|--------|
| publicar-oferta.js | 131, 177, 245 |
| dashboard.js | 172, 351 |
| mis-aplicaciones.js | 172, 964 |
| mapa-ofertas.js | 1024 |

### 4. Código Muerto/Comentado

| Archivo | Descripción |
|---------|-------------|
| publicar-oferta.js | `obtenerDistritoPorCodigoPostal()` líneas 577-708 (duplicado, no usado) |

---

## ARQUITECTURA PROPUESTA

### Nuevos Módulos Compartidos (`js/utils/`)

```
js/utils/
├── formatting.js        # Fechas, estrellas, distancias, moneda
├── image-utils.js       # Optimización, validación, preview
├── location-utils.js    # Geocoding, distancias, normalización
├── firebase-helpers.js  # Queries comunes, batching, transactions
└── dom-helpers.js       # Escapado HTML, creación de elementos
```

### Módulos por Página

```
js/publicar-oferta/
├── index.js             # Orquestador principal (~100 líneas)
├── form-navigation.js   # Steps, validación, progreso (~150 líneas)
├── ubicacion.js         # RENIEC + Google Maps + autocomplete (~300 líneas)
├── fotos.js             # Upload, preview, galería (~200 líneas)
└── submit.js            # Crear/editar/reutilizar oferta (~150 líneas)

js/dashboard/
├── index.js             # Orquestador principal (~100 líneas)
├── estadisticas.js      # Cards de stats (~100 líneas)
├── ofertas-trabajador.js # Vista trabajador (~200 líneas)
├── ofertas-empleador.js  # Vista empleador (~200 líneas)
├── geolocation.js       # Ubicación del usuario (~150 líneas)
└── postulacion.js       # Modal y envío (~150 líneas)

js/mis-aplicaciones/
├── index.js             # Orquestador (~80 líneas)
├── cards.js             # Renderizado de cards (~200 líneas)
├── acciones.js          # Aceptar, rechazar, completar (~200 líneas)
├── calificaciones.js    # Sistema de rating (~250 líneas)
└── filtros.js           # Filtrado local (~100 líneas)

js/mapa-ofertas/
├── index.js             # Orquestador (~80 líneas)
├── mapa.js              # Inicialización Google Maps (~150 líneas)
├── markers.js           # Creación y clustering (~200 líneas)
├── detalle.js           # Modal de detalle (~200 líneas)
└── postulacion.js       # Formulario en mapa (~150 líneas)

js/perfil/
├── perfil-trabajador.js # Reducido (~400 líneas)
├── perfil-empleador.js  # Ya está bien (~350 líneas)
├── portfolio.js         # Galería de trabajos (~200 líneas)
└── resenas.js           # Reseñas compartido (~200 líneas)

js/components/
├── filtros-avanzados/
│   ├── index.js         # Orquestador (~100 líneas)
│   ├── custom-dropdown.js (~200 líneas)
│   ├── multi-select.js  (~200 líneas)
│   ├── dual-range.js    (~150 líneas)
│   └── chips.js         (~150 líneas)
├── oferta-card.js       # Card reutilizable (~150 líneas)
├── rating-display.js    # Estrellas reutilizable (~80 líneas)
└── location-selector.js # Departamento/Provincia/Distrito (~200 líneas)
```

---

## FASES DE IMPLEMENTACIÓN

### FASE 0: Preparación (1 sesión) ✅ COMPLETADA
> **Objetivo:** Limpiar código sin cambiar estructura

- [x] **0.1** Eliminar 18 console.logs de debug (4 archivos)
- [x] **0.2** Commit: "chore: Limpiar console.logs de debug"

**Estado:** Completada 04/02/26

---

### FASE 1: Módulos Utilitarios Compartidos (1-2 sesiones) ✅ COMPLETADA
> **Objetivo:** Crear base reutilizable antes de dividir archivos grandes

#### 1.1 `js/utils/formatting.js` (~131 líneas) ✅
Extraer de: mis-aplicaciones.js, perfil-trabajador.js, dashboard.js, historial-ofertas.js, historial-calificaciones.js, mis-aplicaciones-trabajador.js

```javascript
// Funciones incluidas:
export function formatearFecha(timestamp, formato = 'relativo') { }
export function formatearFechaHora(timestamp) { }
export function generarEstrellasHTML(puntuacion, maxEstrellas = 5) { }
export function formatearMoneda(cantidad) { }
export function capitalizarPalabras(texto) { }
export function truncarTexto(texto, maxLength = 100) { }
export function formatearNumero(numero) { }
```
**Líneas eliminadas:** ~117 líneas duplicadas

#### 1.2 `js/utils/image-utils.js` (~175 líneas) ✅
Extraer de: perfil-trabajador.js, perfil-empleador.js, publicar-oferta.js

```javascript
export async function optimizarImagen(file, maxWidth, maxHeight, quality) { }
export function validarArchivoImagen(file, maxSizeMB) { }
export function crearPreviewImagen(file) { }
export function esFormatoHEIC(file) { }
export function blobToFile(blob, nombreOriginal) { }
export function obtenerDimensiones(source) { }
```
**Líneas eliminadas:** ~245 líneas duplicadas

#### 1.3 Módulos de ubicación ✅ YA EXISTÍAN
Los módulos ya existían y están siendo usados correctamente:
- `js/utils/distance.js` - Cálculo de distancia Haversine
- `js/utils/geolocation.js` - GPS + geocodificación
- `js/utils/ubigeo-api.js` - UBIGEO del Perú
- `js/utils/google-maps.js` - Google Maps API

#### 1.4 `js/utils/dom-helpers.js` (~140 líneas) ✅
Extraer de: filtros-avanzados.js, fcm-init.js, notificaciones.js

```javascript
export function escapeHtml(text) { }
export function escaparHTML(text) { }
export function crearElemento(tag, attrs, children) { }
export function toggleVisibility(element, visible) { }
export function addClass/removeClass/toggleClass() { }
export function getById(id) { }
export function qs/qsa(selector, parent) { }
```
**Líneas eliminadas:** ~18 líneas duplicadas

**Commits:**
- "refactor: Crear formatting.js y actualizar 6 archivos"
- "refactor: Crear image-utils.js y actualizar 3 archivos"
- "refactor: Crear dom-helpers.js y actualizar 3 archivos"

**Total Fase 1:** ~380 líneas duplicadas eliminadas

**Testing:** ✅ Verificado que todas las páginas funcionan correctamente

---

### FASE 2: Componentes Reutilizables (1-2 sesiones)
> **Objetivo:** Unificar componentes visuales duplicados

#### 2.1 `js/components/oferta-card.js` (~200 líneas)
Unificar desde: dashboard.js, mapa-ofertas.js, filtros-avanzados.js

```javascript
export function crearOfertaCard(oferta, opciones = {}) {
    // opciones: { mostrarDistancia, mostrarVacantes, onClick, compacta }
}
export function crearOfertaCardCompacta(oferta) { }
export function crearOfertaCardMapa(oferta) { }
```

#### 2.2 `js/components/rating-display.js` (~100 líneas)
Unificar desde: mis-aplicaciones.js, perfil-trabajador.js

```javascript
export function crearRatingDisplay(rating, totalResenas) { }
export function crearRatingInput(onChange) { }
export function crearResenaCard(resena) { }
```

#### 2.3 `js/components/location-selector.js` (~250 líneas)
Extraer de: publicar-oferta.js

```javascript
export class LocationSelector {
    constructor(containerId, opciones) { }
    async cargarDepartamentos() { }
    async cargarProvincias(departamentoId) { }
    async cargarDistritos(provinciaId) { }
    getUbicacion() { }
    setUbicacion(ubicacion) { }
}
```

**Commit:** "refactor: Crear componentes reutilizables (oferta-card, rating, location-selector)"

---

### FASE 3: Dividir publicar-oferta.js (1-2 sesiones)
> **Archivo más grande: 2,067 líneas → 5 módulos**

#### Estructura final:
```
js/publicar-oferta/
├── index.js             # Imports + inicialización (~100 líneas)
├── form-navigation.js   # showStep, validateStep, progress (~150 líneas)
├── ubicacion.js         # RENIEC combos + Google Maps preview (~300 líneas)
├── fotos.js             # Upload, preview, eliminar (~200 líneas)
└── submit.js            # Crear/editar/reutilizar + review section (~200 líneas)
```

#### Pasos:
1. Crear carpeta `js/publicar-oferta/`
2. Extraer `form-navigation.js` (funciones showStep, validateStep, updateProgress)
3. Extraer `ubicacion.js` (todo lo relacionado con RENIEC y Google Maps)
4. Extraer `fotos.js` (sistema G6 de fotos)
5. Extraer `submit.js` (manejo del formulario y submit)
6. Crear `index.js` que orqueste todo
7. Actualizar `publicar-oferta.html` para importar desde `index.js`

**Commit:** "refactor: Dividir publicar-oferta.js en 5 módulos"

**Testing:**
- Crear nueva oferta
- Editar oferta existente
- Reutilizar oferta
- Verificar fotos, ubicación, validación

---

### FASE 4: Dividir dashboard.js (1-2 sesiones)
> **1,823 líneas → 6 módulos**

#### Estructura final:
```
js/dashboard/
├── index.js             # Imports + inicialización (~100 líneas)
├── estadisticas.js      # Carga y render de stats cards (~100 líneas)
├── ofertas-trabajador.js # Vista y cards para trabajador (~200 líneas)
├── ofertas-empleador.js  # Vista y cards para empleador (~200 líneas)
├── geolocation.js       # Obtener/guardar ubicación usuario (~150 líneas)
└── postulacion.js       # Modal de postulación rápida (~150 líneas)
```

**Commit:** "refactor: Dividir dashboard.js en 6 módulos"

---

### FASE 5: Dividir mis-aplicaciones.js (1 sesión)
> **1,273 líneas → 5 módulos**

#### Estructura final:
```
js/mis-aplicaciones/
├── index.js             # Imports + inicialización (~80 líneas)
├── cards.js             # crearGrupoOferta, crearAplicacionCard (~250 líneas)
├── acciones.js          # aceptar, rechazar, completar, WhatsApp (~200 líneas)
├── calificaciones.js    # Rating modal, enviar, actualizar promedio (~300 líneas)
└── filtros.js           # Filtrado por estado (~100 líneas)
```

**Commit:** "refactor: Dividir mis-aplicaciones.js en 5 módulos"

---

### FASE 6: Dividir mapa-ofertas.js (1 sesión)
> **1,185 líneas → 5 módulos**

#### Estructura final:
```
js/mapa-ofertas/
├── index.js             # Imports + inicialización (~80 líneas)
├── mapa.js              # Inicialización Google Maps (~150 líneas)
├── markers.js           # Creación markers + clustering (~200 líneas)
├── detalle.js           # Modal detalle oferta (~200 líneas)
└── postulacion.js       # Formulario postulación en mapa (~150 líneas)
```

**Commit:** "refactor: Dividir mapa-ofertas.js en 5 módulos"

---

### FASE 7: Dividir filtros-avanzados.js (1 sesión)
> **1,462 líneas → 5 módulos**

#### Estructura final:
```
js/components/filtros-avanzados/
├── index.js             # FiltrosAvanzados class principal (~150 líneas)
├── custom-dropdown.js   # Clase CustomDropdown (~200 líneas)
├── multi-select.js      # Clase MultiSelectDropdown (~220 líneas)
├── dual-range.js        # Clase DualRangeSlider (~150 líneas)
└── chips.js             # Gestión de chips activos (~150 líneas)
```

**Commit:** "refactor: Dividir filtros-avanzados.js en 5 módulos"

---

### FASE 8: Reducir perfil-trabajador.js (1 sesión)
> **1,319 líneas → ~400 líneas + módulos compartidos**

- Extraer portfolio a `js/perfil/portfolio.js`
- Extraer reseñas a `js/perfil/resenas.js` (compartido con perfil-empleador)
- Usar `image-utils.js` para optimización
- Usar `rating-display.js` para estrellas

**Commit:** "refactor: Reducir perfil-trabajador.js usando módulos compartidos"

---

## RESUMEN DE COMMITS

| Fase | Commit | Archivos Afectados |
|------|--------|-------------------|
| 0 | chore: Limpiar console.logs y código muerto | 4 archivos |
| 1 | refactor: Crear módulos utilitarios compartidos | +4 nuevos |
| 2 | refactor: Crear componentes reutilizables | +3 nuevos |
| 3 | refactor: Dividir publicar-oferta.js | 1 → 5 |
| 4 | refactor: Dividir dashboard.js | 1 → 6 |
| 5 | refactor: Dividir mis-aplicaciones.js | 1 → 5 |
| 6 | refactor: Dividir mapa-ofertas.js | 1 → 5 |
| 7 | refactor: Dividir filtros-avanzados.js | 1 → 5 |
| 8 | refactor: Reducir perfil-trabajador.js | 1 archivo |

**Total:** 7 archivos grandes → ~35 módulos pequeños

---

## MÉTRICAS DE ÉXITO

| Métrica | Antes | Actual (Fase 1) | Meta |
|---------|-------|-----------------|------|
| Archivos >500 líneas | 7 | 7 (pendiente Fases 2-8) | 0 |
| Líneas duplicadas | ~800 | ~420 (-380) | <100 |
| Funciones >30 líneas | 31 | 31 (pendiente Fases 2-8) | <5 |
| Console.logs debug | 18 | 0 ✅ | 0 |
| Nuevos módulos utils | 0 | 3 (formatting, image-utils, dom-helpers) | 4 |

---

## RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Romper funcionalidad existente | Media | Alto | Testing exhaustivo por fase |
| Imports circulares | Media | Medio | Diseño de dependencias unidireccional |
| Problemas con ES6 modules en navegador | Baja | Alto | Verificar compatibilidad, usar bundler si necesario |
| Merge conflicts | Media | Bajo | Commits pequeños y frecuentes |

---

## TESTING POR FASE

### Checklist de Testing Manual

**Después de cada fase:**
- [ ] No hay errores en consola
- [ ] Login/logout funciona
- [ ] Navegación entre páginas funciona

**Fase 3 (publicar-oferta):**
- [ ] Crear nueva oferta completa (4 pasos)
- [ ] Editar oferta existente
- [ ] Reutilizar oferta
- [ ] Fotos se suben correctamente
- [ ] Ubicación funciona (combos + mapa)
- [ ] Validaciones funcionan

**Fase 4 (dashboard):**
- [ ] Dashboard trabajador carga
- [ ] Dashboard empleador carga
- [ ] Estadísticas correctas
- [ ] Postulación rápida funciona
- [ ] Geolocalización funciona

**Fase 5 (mis-aplicaciones):**
- [ ] Lista de aplicaciones carga
- [ ] Aceptar aplicación funciona
- [ ] Rechazar aplicación funciona
- [ ] Marcar completado funciona
- [ ] Calificar trabajador funciona
- [ ] WhatsApp abre correctamente

**Fase 6 (mapa-ofertas):**
- [ ] Mapa carga correctamente
- [ ] Markers se muestran
- [ ] Clustering funciona
- [ ] Detalle de oferta abre
- [ ] Postulación desde mapa funciona

---

## PRÓXIMOS PASOS

1. **Aprobar este plan**
2. **Comenzar con Fase 0** (limpieza rápida, bajo riesgo)
3. **Fase 1** es la más importante - crea la base para todo lo demás
4. **Fases 3-7** pueden hacerse en paralelo si hay tiempo

---

**Tiempo estimado total:** 8-12 sesiones de trabajo
**Prioridad:** Alta (deuda técnica acumulada)
**Dependencias:** Ninguna externa

---

*Plan creado: 04 Febrero 2026*
*Última actualización: 04 Febrero 2026*
