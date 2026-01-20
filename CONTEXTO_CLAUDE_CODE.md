# CONTEXTO CLAUDE CODE - CHAMBAPP

**Archivo de Inicialización para Claude Code**
**Actualizado:** 19 Enero 2026
**Lee este archivo al inicio de cada sesión**

---

## ESTADO ACTUAL DEL PROYECTO

### Progreso General
- **Fase Actual:** Fase 1 - Experiencia WOW
- **Progreso Fase 1:** 43% completo (19/44 tareas)
- **Progreso Total:** ~11% del proyecto (19/176 tareas)
- **Tiempo Invertido:** ~2 meses
- **Tiempo Restante:** 4-5 meses hasta lanzamiento

### Última Tarea Completada
**Task 21:** Aceptar/Rechazar Postulaciones + WhatsApp (19 Ene 2026)
- Botones "Aceptar" y "Rechazar" en vista empleador (mis-aplicaciones.html)
- Estados: pendiente → aceptado | rechazado → completado
- Botón WhatsApp con mensaje pre-llenado al aceptar
- Botón "Marcar como Completado" para trabajos terminados
- Filtros por estado en ambas vistas (empleador y trabajador)
- Vista trabajador muestra estado y datos de contacto del empleador
- Teléfonos guardados en aplicaciones (dashboard.js y mapa-ofertas.js)
- **Migración a Nueva Places API:**
  - Reemplazado Autocomplete legacy por AutocompleteSuggestion
  - Input y dropdown de sugerencias custom (sin pantalla negra)
  - Autollenado de departamento/provincia/distrito
  - Mapeo de códigos postales para distritos de Lima
  - Reverse geocoding como fallback

### Próxima Tarea Crítica
**Task 13:** Sistema de Calificaciones
- Modelo Firestore para calificaciones
- UI de estrellas (dar/ver calificación)
- Promedio en perfil trabajador
- Calificación después de trabajo completado

> **Nota:** Ahora que Task 21 está completada, se puede probar el flujo completo: Postulación → Aceptar → WhatsApp → Completado → Calificación

### Pendiente Menor (Sprint UX/UI Polish)
- Fix warning onboarding `.stats-grid`
- Actualizar google.maps.Marker a AdvancedMarkerElement (deprecation warning)

---

## CONFIGURACIÓN TÉCNICA ACTUAL

### Stack Tecnológico
```
Frontend:  HTML5, CSS3, JavaScript ES6+ (vanilla, no frameworks)
Backend:   Firebase (Auth + Firestore + Storage + Functions)
Hosting:   GitHub Pages (jrvl83.github.io/chambapp)
APIs:      Google Maps, Geocoding, Places
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
├── mapa-ofertas.html (nuevo Task 12)
├── css/
│   ├── design-system.css
│   ├── components.css
│   ├── accessibility.css
│   ├── toast.css
│   ├── publicar-oferta.css (actualizado Task 10)
│   ├── mapa-ofertas.css (nuevo Task 12)
│   └── ...
├── js/
│   ├── config/
│   │   ├── firebase-config.js
│   │   ├── firebase-init.js
│   │   └── api-keys.js
│   ├── auth/
│   │   ├── login.js
│   │   └── register.js
│   ├── dashboard/
│   │   └── dashboard.js
│   ├── utils/
│   │   ├── geolocation.js
│   │   ├── distance.js
│   │   ├── google-maps.js
│   │   ├── ubigeo-api.js
│   │   └── migrar-ofertas.js (nuevo Task 10)
│   ├── publicar-oferta.js (actualizado Task 10)
│   ├── mapa-ofertas.js (nuevo Task 12)
│   ├── toast.js
│   └── onboarding.js
├── data/
│   ├── ubigeo_departamento.json
│   ├── ubigeo_provincia.json
│   └── ubigeo_distrito.json
└── docs/
    └── PLAN_PRUEBAS_TASK10.md (nuevo)
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

## TAREAS COMPLETADAS (1-12, 21)

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

### Mejoras iOS (14 Ene 2026)
- viewport-fit=cover en todos los HTML
- Meta tags Apple en todos los HTML
- Compatibilidad con notch/Dynamic Island

---

## PRÓXIMAS TAREAS (13-17)

### Task 13: Sistema de Calificaciones (SIGUIENTE)
**Objetivo:** Calificaciones 5 estrellas bidireccionales

**Subtareas:**
- [ ] Modelo Firestore para calificaciones
- [ ] UI de estrellas (dar/ver calificación)
- [ ] Promedio en perfil trabajador
- [ ] Calificación después de trabajo completado (desde botón ⭐ Calificar)

---

### Orden de Desarrollo Actualizado (19 Ene 2026)

**Flujo lógico del usuario (YA FUNCIONAL hasta Completado):**
```
Postulación → Aceptar/Rechazar → WhatsApp → Trabajo → Completado → [Calificación]
```

**Próximas tareas:**
1. ✅ **Task 21:** Aceptar/Rechazar + Botón WhatsApp (COMPLETADA)
2. **Tasks 13-17:** Sistema de Calificaciones (SIGUIENTE)
3. **Tasks 18-20, 22-23:** Chat In-App (DIFERIDO - WhatsApp cubre la necesidad)

---

## PRINCIPIOS DE DISEÑO UX/UI

### Design Tokens (Usar siempre)
```css
/* Colores */
--primary: #2563eb;      /* Azul confianza */
--success: #16a34a;      /* Verde éxito */
--warning: #f59e0b;      /* Amarillo atención */
--danger: #dc2626;       /* Rojo urgencia */

/* Espaciado (8px grid) */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
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
- **14 Ene 2026:** Compatibilidad iOS mejorada (9 archivos HTML)
- **14 Ene 2026:** Task 11 completada - Búsqueda por Distancia
- **14 Ene 2026:** Fix bug coordenadas distritos duplicados (Miraflores, Comas, etc.)
- **19 Ene 2026:** Task 12 completada - Mapa Interactivo Ofertas
- **19 Ene 2026:** Task 21 completada - Aceptar/Rechazar + WhatsApp
- **19 Ene 2026:** Migración a Nueva Places API (AutocompleteSuggestion)

---

## COMANDOS ÚTILES

### Ejecutar localmente:
```bash
cd C:\Users\JOEL\Documents\Proyectos\Chambapp
npx serve
```

### Migrar ofertas existentes (una vez):
```javascript
import('./js/utils/migrar-ofertas.js').then(m => m.migrarOfertas());
```

---

**Última actualización:** 19 Enero 2026
**Versión:** 1.4
**Proyecto:** ChambApp - Marketplace de Trabajos Perú
**Fundador:** Joel (jrvl83)

---

**Listo para desarrollar! Revisa este archivo al inicio de cada sesión.**
