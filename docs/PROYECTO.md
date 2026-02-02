# PROYECTO CHAMBAPP

**Marketplace de Trabajos Temporales - Perú**
**Última actualización:** 31 Enero 2026

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
FASE 1: ████████████████████░░░░░░░░ 65% (32/49 tareas)
FASE 2: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (0/44 tareas)
FASE 3: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (0/44 tareas)
FASE 4: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% (0/44 tareas)

TOTAL:  18% del proyecto (32/176 tareas)
```

### Features Implementadas
- Registro/Login con Firebase Auth
- Perfiles trabajadores y empleadores con fotos
- Publicar ofertas de trabajo con geolocalización
- Mapa interactivo de ofertas (Google Maps)
- Postulaciones con estados (pendiente/aceptado/rechazado/completado)
- Contacto directo vía WhatsApp
- Sistema de calificaciones bidireccional (5 estrellas)
- Filtros avanzados (categorías, salario, distancia, fecha)
- Notificaciones push (FCM)
- Centro de notificaciones in-app
- Bottom navigation móvil (estilo app nativa)
- Dashboard diferenciado por rol

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
| G4 | Editar/Eliminar ofertas | Botones en cards del dashboard del empleador | Alta | Pendiente |
| G5 | Historial de publicaciones | Nueva página para empleador con todas sus ofertas (activas, en curso, completadas, caducadas) + opciones reutilizar/renovar | Media | Pendiente |
| G6 | Fotos en ofertas | Galería de imágenes al publicar oferta (máx 5 fotos) | Media | Pendiente |

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

---

## CONTEXTO PARA PRÓXIMA SESIÓN

> **Última sesión:** 02 Febrero 2026
> **Sprint activo:** Gestión de Ofertas (G1-G6)

### Resumen de lo completado
1. ✅ Plan de refactorización completado (Lighthouse: Perf 85, A11y 92, SEO 100)
2. ✅ G1: Sistema de estados completo
3. ✅ G2: Cloud Function `marcarOfertasCaducadas` (ejecuta diariamente 00:00 Lima)
4. ✅ G3: Conteo correcto implementado

### Archivos modificados
**G1 - Sistema de estados:**
- `js/publicar-oferta.js` - Agregado `fechaExpiracion` (14 días)
- `js/mis-aplicaciones.js` - Estados `en_curso` y `completada`

**G2 - Caducidad automática:**
- `functions/index.js` - Cloud Function scheduled `marcarOfertasCaducadas`

**G3 - Filtrado de ofertas expiradas:**
- `js/mapa-ofertas.js` - Filtro en cargarOfertas()
- `js/dashboard/dashboard.js` - Filtro en estadísticas y listado
- `index.html` - Filtro en conteo general y por categoría

### Próximas tareas prioritarias
1. **G4: Editar/Eliminar** - Agregar botones en dashboard del empleador

2. **G5: Historial** - Nueva página `historial-ofertas.html`

3. **G6: Fotos** - Reutilizar lógica de portfolio de trabajador

### Notas técnicas
- Estados de oferta: `activa` | `en_curso` | `completada` | `caducada`
- Ofertas visibles: `estado === 'activa' AND fechaExpiracion > ahora`
- Firebase Timestamp se importa de firestore.js

---

**Fundador:** Joel (jrvl83)
**Versión documento:** 3.1
