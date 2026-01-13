# 🚀 CONTEXTO CLAUDE CODE - CHAMBAPP

**Archivo de Inicialización para Claude Code**  
**Actualizado:** 13 Enero 2026  
**Lee este archivo al inicio de cada sesión**

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### Progreso General
- **Fase Actual:** Fase 1 - Experiencia WOW
- **Progreso Fase 1:** 45% completo (15/44 tareas)
- **Progreso Total:** ~10% del proyecto (15/176 tareas)
- **Tiempo Invertido:** ~2 meses
- **Tiempo Restante:** 4-5 meses hasta lanzamiento

### Última Tarea Completada ✅
**Task 9 Parte 2:** Geolocalización GPS trabajadores
- ✅ Google Geocoding API integrada
- ✅ Badge ubicación dinámico en dashboard
- ✅ Actualización background automática
- ✅ Permiso geolocalización con fallback
- ✅ Reverse geocoding (coords → dirección)

### Próxima Tarea Crítica 🎯
**Task 10:** Geocoding Ofertas (2 días)
- Agregar ubicación a ofertas publicadas
- Google Places API autocomplete
- Mini-mapa preview ubicación
- Validar coordenadas en Perú

### Pendiente Menor ⚠️
- Fix warning onboarding `.stats-grid`

---

## 🔧 CONFIGURACIÓN TÉCNICA ACTUAL

### Stack Tecnológico
```javascript
Frontend:  HTML5, CSS3, JavaScript ES6+ (vanilla, no frameworks)
Backend:   Firebase (Auth + Firestore + Storage + Functions)
Hosting:   GitHub Pages (jrvl83.github.io/chambapp)
APIs:      Google Maps, Geocoding, Places
Payments:  Culqi (pendiente integración)
```

### Google Cloud Setup
```
API Key: AIzaSyBxopsd9CPAU2CSV91z8YAw_upxochOGYE
Restricción: Solo Geocoding API
Referrer: Sin restricción (solo API restringida)
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
├── editar-perfil.html
├── css/
│   ├── design-tokens.css
│   ├── global.css
│   └── components/
├── js/
│   ├── config/
│   │   └── firebase-config.js
│   ├── auth/
│   │   ├── login.js
│   │   └── register.js
│   ├── dashboard/
│   │   ├── dashboard.js
│   │   └── ofertas.js
│   └── utils/
│       ├── validators.js
│       ├── helpers.js
│       └── geolocation.js (NUEVO)
└── assets/
```

---

## 💼 MODELO DE NEGOCIO

### Freemium Asimétrico
**Solo trabajadores pagan, empleadores gratis siempre**

#### Trabajadores:
- **Gratis:** 5 aplicaciones/mes, 10 mensajes/mes, con publicidad
- **Premium (S/. 20/mes):** Aplicaciones ilimitadas, destacado 10x, sin publicidad, estadísticas, soporte prioritario

#### Empleadores:
- **TODO GRATIS:** Publicar ilimitado, ver aplicantes ilimitado, mensajes ilimitados

#### Diferenciador Clave:
**"0% comisiones" vs competencia (15-25%)**

### Proyecciones Año 1
- Usuarios: 30,000 (21K trabajadores, 9K empleadores)
- Premium: 2,100 trabajadores (10% conversión)
- Ingresos mes 12: S/. 42,000/mes
- Breakeven: Mes 6

---

## 📋 TAREAS COMPLETADAS (1-9)

### ✅ Fundamentos Técnicos (Tasks 1-3)
1. Estructura archivos JS separados (modular)
2. Sistema design tokens CSS (variables globales)
3. Componentes UI reutilizables (buttons, cards, modals)

### ✅ Perfiles Completos (Tasks 4-7)
4. Estructura Firestore perfiles
5. Upload fotos/imágenes (Firebase Storage)
6. Página perfil trabajador (portfolio, experiencia, skills)
7. Editor perfil interactivo (multi-sección)

### ✅ Geolocalización (Tasks 8-9)
8. Integración Google Maps API (setup completo)
9. Permiso ubicación usuario (GPS + reverse geocoding + badge)

---

## 🎯 PRÓXIMAS 3 TAREAS (10-12)

### Task 10: Geocoding Ofertas (2 días) 🔜 SIGUIENTE
**Objetivo:** Ofertas necesitan ubicación precisa

**Subtareas:**
- [ ] Agregar campo `coordenadas: {lat, lng}` a schema ofertas
- [ ] Modificar `publicar-oferta.html`: agregar selector ubicación
- [ ] Integrar Google Places API (autocomplete direcciones)
- [ ] Función convertir dirección → coordenadas (geocoding)
- [ ] Mini-mapa preview ubicación en form
- [ ] Validar coordenadas están en Perú
- [ ] Guardar dirección legible + coordenadas en Firestore
- [ ] Migrar ofertas existentes (Lima centro default)

**Archivos a Modificar:**
- `js/dashboard/publicar-oferta.js` (agregar lógica geocoding)
- `publicar-oferta.html` (agregar input dirección + mapa)
- `css/pages/publicar-oferta.css` (estilos mapa preview)
- Firestore schema `ofertas` (agregar campos ubicación)

---

### Task 11: Búsqueda por Distancia (2 días)
**Objetivo:** Filtrar ofertas por cercanía

**Subtareas:**
- [ ] Crear filtro "Distancia máxima" (dropdown: 5km, 10km, 20km, 50km)
- [ ] Implementar cálculo Haversine (distancia entre 2 puntos)
- [ ] Ordenar ofertas por cercanía al usuario
- [ ] Mostrar "A X km de ti" en cada card oferta
- [ ] Caché resultados cálculo (performance)
- [ ] Testing diferentes ubicaciones

**Archivos a Crear/Modificar:**
- `js/utils/distance-calculator.js` (nuevo)
- `js/dashboard/dashboard.js` (agregar filtro distancia)
- `dashboard.html` (UI filtro)

---

### Task 12: Mapa Interactivo Ofertas (3-4 días)
**Objetivo:** Vista de mapa con pins de ofertas

**Subtareas:**
- [ ] Crear `/mapa-ofertas.html` (página nueva)
- [ ] Mostrar pins en mapa por cada oferta
- [ ] Cluster pins cuando hay muchos cercanos
- [ ] Click pin → preview oferta (tooltip/modal)
- [ ] Filtros sidebar (categoría, salario, distancia)
- [ ] Actualizar mapa real-time al aplicar filtros
- [ ] Botón "Buscar en esta área" (mover mapa)
- [ ] Toggle vista lista/mapa
- [ ] Responsive móvil

**Archivos a Crear:**
- `mapa-ofertas.html` (nuevo)
- `js/mapa/mapa-ofertas.js` (nuevo)
- `css/pages/mapa-ofertas.css` (nuevo)

---

## 🎨 PRINCIPIOS DE DISEÑO UX/UI

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
--spacing-2xl: 48px;

/* Shadows */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.15);
```

### Principios Core
1. **Mobile-First:** Diseñar primero para 360-414px
2. **Simplicidad Radical:** Max 3 opciones por pantalla
3. **Feedback Inmediato:** Loading states + toasts en toda acción
4. **Accesibilidad:** WCAG 2.1 AA (contraste 4.5:1, keyboard nav)
5. **Micro-interacciones:** Hover states, animaciones sutiles
6. **Performance:** Skeletons > spinners, lazy loading, optimistic UI

---

## 📖 REGLAS DE TRABAJO CON CLAUDE CODE

### Regla #1: Investigación Autónoma
Claude Code **DEBE:**
- ✅ Identificar qué archivos necesita revisar
- ✅ Acceder al repositorio y leer código existente
- ✅ Analizar dependencias antes de proponer cambios
- ❌ **NO** asumir implementaciones sin verificar
- ❌ **NO** preguntar al usuario sobre detalles técnicos

### Regla #2: Archivos Completos
Claude Code **DEBE entregar:**
- ✅ Archivos completos y funcionales
- ✅ Instrucciones de instalación claras
- ✅ Ruta exacta del archivo en repositorio
- ❌ **NO** snippets para copiar/pegar
- ❌ **NO** instrucciones "modifica línea X"

### Regla #3: Decisiones
**JOEL decide (estrategia):**
- QUÉ funcionalidad implementar
- PARA QUIÉN (trabajadores/empleadores)
- CUÁNDO hacerlo (priorización)

**CLAUDE CODE decide (técnico):**
- CÓMO implementar técnicamente
- Diseño UX/UI completo
- Arquitectura de código
- Componentes a usar
- Colores, animaciones, transiciones
- Mensajes al usuario
- Accesibilidad y performance

**Claude Code SOLO pregunta a Joel:**
- Decisiones de negocio/estrategia
- Prioridades del roadmap
- Aprobación de pivotes grandes

---

## 🚨 DECISIONES ARQUITECTÓNICAS CLAVE

### ✅ Decisiones Permanentes (NO cambiar)

1. **NO usar frameworks frontend**
   - Vanilla JavaScript ES6+ modules
   - Razón: Joel aprende fundamentos, control total

2. **Firebase como backend**
   - Cloud Firestore (NoSQL)
   - Razón: Sin servidor, escalable, gratis tier generoso

3. **Mobile-first design**
   - Diseñar primero 360-414px
   - Razón: 80%+ usuarios en móvil

4. **GitHub Pages hosting**
   - Estático + Firebase backend separado
   - Razón: Gratis, HTTPS auto, deploy simple

5. **SIN intermediación de pagos**
   - ChambApp no maneja dinero entre usuarios
   - Solo cobra suscripciones Premium (Culqi)
   - Razón: Simplifica arquitectura, 0% comisión

6. **Geolocalización SOLO trabajadores**
   - Empleadores solo especifican ubicación DEL TRABAJO
   - Trabajadores buscan ofertas CERCANAS a ellos
   - Razón: Marketplace público, no headhunting

7. **Calidad > Velocidad**
   - Retrasar lanzamiento 4-5 meses
   - Razón: Primera impresión crítica, producto excepcional

---

## 💻 COMANDOS ÚTILES PARA CLAUDE CODE

### Al Iniciar Sesión:
```
"Hola Claude Code. Lee estos archivos en la raíz del proyecto:
- CONTEXTO_CLAUDE_CODE.md (este archivo)
- FASE_1_DETALLADA.md (roadmap actual)
- COMPROMISOS_Y_REGLAS_CHAMBAPP.txt (reglas completas)

Estoy en Task 10 (Geocoding Ofertas).
¿Qué archivos del repo necesitas revisar para empezar?"
```

### Antes de Empezar Cualquier Task:
```
"Task [NÚMERO]: [NOMBRE]

Paso 1: ¿Qué archivos existentes necesitas revisar?
Paso 2: Propón arquitectura completa de la solución
Paso 3: Genera archivos completos (no snippets)
Paso 4: Especifica rutas exactas en repositorio
Paso 5: Instrucciones testing"
```

### Para Continuar una Task Iniciada:
```
"Continuando Task [NÚMERO]. 
Ya completé: [listar subtareas hechas]
Siguiente subtarea: [descripción]
¿Qué necesitas?"
```

---

## 📚 DOCUMENTOS DE REFERENCIA

Los siguientes documentos están en el proyecto (consultarlos según necesidad):

1. **CONTEXTO_CLAUDE_CODE.md** ← Este archivo (leer siempre al inicio)
2. **FASE_1_DETALLADA.md** - 44 tareas Fase 1 con subtareas
3. **ROADMAP_COMPLETO.md** - Vista general 4 fases (176 tareas)
4. **COMPROMISOS_Y_REGLAS_CHAMBAPP.txt** - Reglas trabajo y arquitectura
5. **MONETIZACION_DEFINITIVO_CHAMBAPP.txt** - Modelo negocio completo

---

## 🎯 METAS FASE 1

Al completar las 44 tareas de Fase 1 (3 meses), ChambApp tendrá:

### Features Core:
- ✅ Sistema auth completo
- ✅ Perfiles ricos (trabajadores + empleadores)
- ✅ Ofertas con ubicación precisa
- ✅ Búsqueda por distancia
- ✅ Mapa interactivo
- ⏳ Sistema calificaciones 5 estrellas
- ⏳ Chat 1-1 tiempo real
- ⏳ Notificaciones push
- ⏳ Búsqueda avanzada con filtros
- ⏳ PWA instalable

### Métricas Objetivo:
- Performance Score: >90 (Lighthouse)
- Accessibility Score: >90
- PWA Score: 100
- First Contentful Paint: <1.5s
- Mobile-First: 100% responsive

---

## ⚠️ WARNINGS/ISSUES CONOCIDOS

### Pendientes Resolver:
- Warning onboarding `.stats-grid` (Task pendiente)
- Google Cloud sin restricción referrer (por ahora OK, agregar después)

### Notas Importantes:
- Firebase Plan Blaze: Monitorear costos mensual
- API Keys: Nunca commitear en código (usar variables entorno)
- Testing manual: Probar cada cambio en móvil real

---

## 🎉 HITOS RECIENTES

- ✅ **Dic 2025:** Sistema UBIGEO Perú completo
- ✅ **Dic 2025:** Perfiles con fotos y portfolios
- ✅ **Ene 2026:** Google Geocoding API integrada
- ✅ **Ene 2026:** Badge ubicación dinámico trabajadores
- ✅ **Ene 2026:** Firebase Plan Blaze activado
- 🎯 **Ene 2026:** Completar geolocalización (Tasks 10-12)

---

## 📞 SOPORTE

Si Claude Code necesita clarificación sobre:
- **Decisiones de negocio** → Preguntar a Joel
- **Decisiones técnicas** → Decidir autónomamente según reglas
- **Arquitectura** → Consultar COMPROMISOS_Y_REGLAS.txt
- **Roadmap** → Consultar FASE_1_DETALLADA.md

---

**Última actualización:** 13 Enero 2026  
**Versión:** 1.0  
**Proyecto:** ChambApp - Marketplace de Trabajos Perú  
**Fundador:** Joel (jrvl83)

---

**🚀 ¡Listo para desarrollar! Revisa este archivo al inicio de cada sesión.**
