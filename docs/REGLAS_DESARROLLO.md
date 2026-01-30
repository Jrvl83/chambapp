# REGLAS DE DESARROLLO - CHAMBAPP

**Documento de Estándares y Buenas Prácticas**
**Versión:** 1.0
**Fecha:** 30 Enero 2026

---

## FILOSOFÍA DE DESARROLLO

> Desarrollar como un **guru de desarrollo web** y un **guru de UX/UI**: código limpio, performante, accesible y con experiencia de usuario excepcional.

---

## 1. PRINCIPIOS FUNDAMENTALES

### 1.1 Código Limpio
- **DRY (Don't Repeat Yourself):** No duplicar código. Si algo se usa 2+ veces, crear función/clase reutilizable.
- **KISS (Keep It Simple, Stupid):** Soluciones simples sobre complejas.
- **Single Responsibility:** Cada función/archivo tiene UNA responsabilidad.
- **Nombres descriptivos:** Variables y funciones con nombres que expliquen su propósito.

```javascript
// MAL
function proc(d) { ... }
const x = getData();

// BIEN
function procesarPostulacion(datos) { ... }
const ofertasActivas = obtenerOfertasActivas();
```

### 1.2 Organización de Archivos
```
css/
  ├── design-system.css    # Variables, colores, tipografía
  ├── components.css       # Componentes reutilizables
  ├── animations.css       # Animaciones y transiciones
  └── [pagina].css         # Estilos específicos de página

js/
  ├── config/              # Configuración (Firebase, API keys)
  ├── components/          # Componentes JS reutilizables
  ├── utils/               # Funciones utilitarias
  └── [pagina].js          # Lógica específica de página
```

### 1.3 Convenciones de Nombres

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Archivos CSS/JS | kebab-case | `mis-aplicaciones.css` |
| Clases CSS | kebab-case | `.stat-card-link` |
| IDs HTML | kebab-case | `#loading-screen` |
| Variables JS | camelCase | `ofertasActivas` |
| Funciones JS | camelCase | `cargarOfertas()` |
| Constantes JS | UPPER_SNAKE | `MAX_RESULTADOS` |

---

## 2. ESTÁNDARES CSS

### 2.1 Uso Obligatorio de Variables
```css
/* SIEMPRE usar variables del design-system */
.boton {
    background: var(--primary);        /* BIEN */
    color: var(--white);               /* BIEN */
    border-radius: var(--radius-md);   /* BIEN */
    padding: var(--space-md);          /* BIEN */
}

/* NUNCA valores hardcodeados */
.boton {
    background: #0066FF;    /* MAL - usar var(--primary) */
    padding: 16px;          /* MAL - usar var(--space-md) */
}
```

### 2.2 No Estilos Inline
```html
<!-- MAL -->
<div style="padding: 1rem; background: white;">

<!-- BIEN -->
<div class="card">
```

### 2.3 No Duplicar Estilos
- Antes de crear un estilo, verificar si ya existe en:
  1. `design-system.css`
  2. `components.css`
  3. Archivo CSS de la página

### 2.4 Organización de CSS
```css
/* Orden de propiedades */
.elemento {
    /* 1. Posicionamiento */
    position: relative;
    top: 0;
    z-index: 1;

    /* 2. Box Model */
    display: flex;
    width: 100%;
    padding: var(--space-md);
    margin: 0;

    /* 3. Tipografía */
    font-size: var(--text-base);
    color: var(--gray-900);

    /* 4. Visual */
    background: var(--white);
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-md);

    /* 5. Animaciones */
    transition: all var(--transition-base);
}
```

---

## 3. ESTÁNDARES JAVASCRIPT

### 3.1 Modularización
- Archivos JS no deben exceder **500 líneas**
- Si excede, dividir en módulos por responsabilidad

```javascript
// dashboard.js (archivo principal)
import { cargarEstadisticas } from './dashboard/estadisticas.js';
import { cargarOfertas } from './dashboard/ofertas.js';
import { inicializarFiltros } from './dashboard/filtros.js';
```

### 3.2 Funciones Pequeñas
- Máximo **30 líneas** por función
- Si es más larga, dividir en funciones auxiliares

### 3.3 Manejo de Errores
```javascript
// SIEMPRE manejar errores
try {
    const datos = await obtenerDatos();
    procesarDatos(datos);
} catch (error) {
    console.error('Error al obtener datos:', error);
    mostrarMensajeError('No se pudieron cargar los datos. Intenta nuevamente.');
}
```

### 3.4 Comentarios Útiles
```javascript
// MAL - comentario obvio
// Incrementar contador
contador++;

// BIEN - explica el POR QUÉ
// Incrementar después de validar para evitar contar intentos fallidos
contador++;
```

---

## 4. PRINCIPIOS UX/UI

### 4.1 Consistencia Visual
- **Un solo archivo** para cada tipo de componente
- **Mismos estilos** para elementos similares en toda la app
- **Mismo comportamiento** para interacciones similares

### 4.2 Feedback al Usuario
| Acción | Feedback Requerido |
|--------|-------------------|
| Click en botón | Efecto visual (scale, color) |
| Carga de datos | Spinner + mensaje contextual |
| Éxito | Toast verde + mensaje claro |
| Error | Toast rojo + mensaje útil |
| Formulario inválido | Borde rojo + mensaje específico |

### 4.3 Loading States
```html
<!-- Estándar: Spinner centrado con mensaje -->
<div class="loading-state">
    <div class="spinner"></div>
    <p>Cargando [contexto]...</p>
</div>
```

### 4.4 Empty States
```html
<!-- Estándar: Icono + título + descripción + CTA -->
<div class="empty-state">
    <div class="empty-icon">[emoji]</div>
    <h3>Sin [elementos]</h3>
    <p>[Descripción y guía de acción]</p>
    <a href="[accion]" class="btn btn-primary">[CTA]</a>
</div>
```

### 4.5 Tono de Voz
- **Neutro y formal** (no coloquial)
- **Claro y directo**
- **Sin jerga** ("chamba" → "oferta")
- **Mensajes útiles** que guíen al usuario

---

## 5. ACCESIBILIDAD (WCAG 2.1 AA)

### 5.1 Obligatorio
- [ ] Contraste mínimo 4.5:1 para texto
- [ ] Touch targets mínimo 44x44px
- [ ] Labels en todos los inputs
- [ ] Alt text en todas las imágenes
- [ ] Focus visible en elementos interactivos
- [ ] Soporte para `prefers-reduced-motion`

### 5.2 Estructura HTML
```html
<!-- Jerarquía correcta de headings -->
<h1>Título de página</h1>
  <h2>Sección</h2>
    <h3>Subsección</h3>

<!-- Labels asociados -->
<label for="email">Correo electrónico</label>
<input type="email" id="email" name="email">

<!-- Botones con texto descriptivo -->
<button aria-label="Cerrar modal">×</button>
```

---

## 6. PERFORMANCE

### 6.1 Objetivos Lighthouse
| Métrica | Mínimo | Ideal |
|---------|--------|-------|
| Performance | 80 | 90+ |
| Accessibility | 90 | 100 |
| Best Practices | 90 | 100 |
| SEO | 90 | 100 |

### 6.2 Optimizaciones
- Imágenes optimizadas (WebP cuando sea posible)
- CSS crítico inline o precargado
- JavaScript defer/async cuando corresponda
- Lazy loading para imágenes below-the-fold

---

## 7. SEGURIDAD

### 7.1 Reglas Básicas
- **NUNCA** exponer API keys en código cliente
- **SIEMPRE** validar inputs en cliente Y servidor
- **NUNCA** confiar en datos del usuario sin sanitizar
- **SIEMPRE** usar HTTPS

### 7.2 Firebase Security Rules
- Validar permisos en Firestore rules
- No permitir lectura/escritura pública

---

## 8. CONTROL DE VERSIONES

### 8.1 Commits
```
tipo: descripción corta

- Detalle 1
- Detalle 2

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

**Tipos:**
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `refactor:` Refactorización sin cambio funcional
- `style:` Cambios de formato/estilo
- `docs:` Documentación
- `perf:` Mejoras de performance

### 8.2 Antes de Commit
- [ ] Código funciona correctamente
- [ ] No hay console.log de debug
- [ ] No hay código comentado innecesario
- [ ] Estilos en archivos CSS (no inline)
- [ ] Sin duplicación de código

---

## 9. CHECKLIST PRE-DEPLOY

### 9.1 Funcionalidad
- [ ] Feature funciona en desktop y móvil
- [ ] No hay errores en consola
- [ ] Loading states funcionan
- [ ] Empty states funcionan
- [ ] Errores se manejan correctamente

### 9.2 Código
- [ ] No hay código duplicado
- [ ] No hay estilos inline
- [ ] Variables CSS utilizadas
- [ ] JavaScript sin errores

### 9.3 UX/UI
- [ ] Consistencia visual con el resto de la app
- [ ] Feedback en todas las interacciones
- [ ] Mensajes claros y útiles
- [ ] Accesible (contraste, touch targets, labels)

### 9.4 Performance
- [ ] Lighthouse Performance > 80
- [ ] Sin recursos bloqueantes innecesarios

---

## 10. DEUDA TÉCNICA CONOCIDA

> Actualizar esta sección cuando se identifique deuda técnica

| Fecha | Archivo | Problema | Prioridad |
|-------|---------|----------|-----------|
| 30/01/26 | components.css + dashboard-main.css | CSS duplicado (.skeleton, .spinner) | Alta |
| 30/01/26 | Varios HTML | Estilos inline | Media |
| 30/01/26 | dashboard.js | 1500+ líneas, necesita modularizar | Media |
| 30/01/26 | General | Auditoría Lighthouse pendiente | Alta |

---

**Última actualización:** 30 Enero 2026
**Próxima revisión:** Después de Task de Refactorización
