# UX/UI GUIA MAESTRA - CHAMBAPP

**Documento de Identidad Visual y Mejoras UX**
**Versión:** 1.2
**Fecha:** 28 Enero 2026
**Autor:** Análisis de Experto UX/UI

---

## RESUMEN EJECUTIVO

ChambApp es un marketplace de trabajo temporal en Perú que conecta trabajadores ("chamberos") con empleadores. La app debe transmitir **confianza**, **velocidad** y **accesibilidad** para un público diverso que incluye personas con distintos niveles de alfabetización digital.

---

## 1. ANÁLISIS DEL ESTADO ACTUAL

### 1.1 Lo Que Está Bien
- Sistema de diseño estructurado (design-system.css, components.css)
- Variables CSS organizadas
- Bottom navigation móvil bien implementado
- Componentes accesibles (min-height 44px en botones)
- Soporte para safe-area (notch iPhone)
- Colores de categorías bien diferenciados

### 1.2 Problemas Detectados (Actualizado 28 Ene 2026)

#### ✅ RESUELTO: Inconsistencia de Colores
~~| Archivo | Primary Color |~~
~~|---------|---------------|~~
~~| `index.html` (landing) | `#0066FF` |~~
~~| `design-system.css` (app) | `#2563eb` |~~

**Estado:** SOLUCIONADO - Paleta unificada #0066FF en 15 CSS, 4 HTML y 1 JS (28 Ene 2026)

#### ✅ RESUELTO: Falta de Personalidad de Marca
- ~~No hay logo oficial~~ → Logo oficial creado e integrado (27 Ene)
- Uso de emojis como iconos (💼, 🔧, ⭐) - funcional pero no profesional (PENDIENTE)
- No hay ilustraciones o elementos gráficos distintivos (PENDIENTE)

#### ✅ RESUELTO: Tipografía Inconsistente
- ~~Landing usa Poppins + Inter~~
- ~~App usa system fonts (-apple-system)~~
- **Estado:** SOLUCIONADO - Poppins + Inter en toda la app (28 Ene 2026)

#### ✅ RESUELTO: Headers y Footers Inconsistentes
- ~~Headers diferentes en Perfil, Alertas y Explorar~~ → Homologados con `header-simple.css` (28 Ene)
- ~~Footer faltante en página de Alertas~~ → Bottom-nav agregado (28 Ene)
- ~~Logo gigante en páginas secundarias~~ → Corregido con estilos centralizados (28 Ene)
- ~~Botón redundante "Ver Mapa" en dashboard~~ → Eliminado, se usa footer (28 Ene)

#### ✅ RESUELTO: Stats y Navegación Mejorados (28 Ene)
- **Stats clickeables en dashboard:** Los stats ahora son enlaces que llevan a las páginas correspondientes
  - Trabajador: Ofertas → Explorar, Aplicaciones → Mis postulaciones, Completados → Historial
  - Empleador: Ofertas Activas → scroll a sección, Postulaciones → Ver candidatos
- **Footer adaptable por rol:**
  - Trabajador: Explorar (🔍) + Postulaciones (📋)
  - Empleador: Candidatos (👥) + Publicar (➕)
- **Estadísticas de postulaciones corregidas:** Los cajones ahora coinciden con los filtros
  - Antes: "Aceptados" sumaba aceptados + completados (confuso)
  - Ahora: "Aceptados" = por hacer, "Completados" = terminados (consistente)

#### UX Móvil Mejorable
- Algunos touch targets muy pequeños en listas
- Falta feedback táctil en algunas interacciones
- Loading states básicos (solo spinner genérico)

#### Empty States Genéricos
- Mensaje de "No hay datos" sin guía de acción
- Falta ilustraciones que humanicen la experiencia

#### Páginas Pendientes por Crear
- [ ] **Historial de Contratados (Empleador)** - Página para que empleadores vean su historial de trabajadores contratados. Actualmente `historial-calificaciones.html` solo funciona para trabajadores. El stat "Contratados" en el dashboard empleador no tiene enlace por esta razón.

  **Especificación funcional:**
  - **Header:** Mostrar calificación promedio del empleador (estrellas). Al hacer clic, ver detalle de calificaciones recibidas de trabajadores.
  - **Lista de contrataciones:** Cada item debe mostrar:
    - Nombre de la chamba/oferta
    - Datos del trabajador (foto, nombre, contacto)
    - Calificación dada al trabajador (estrellas)
    - Si aún no se calificó → mostrar badge "Pendiente de calificar" con botón para calificar
  - **Ordenamiento:** Más recientes primero, con pendientes de calificar destacados arriba

---

## 2. IDENTIDAD DE MARCA PROPUESTA

### 2.1 Personalidad de ChambApp

| Atributo | Descripción |
|----------|-------------|
| **Cercana** | Habla como un amigo, no como una corporación |
| **Confiable** | Transmite seguridad en cada interacción |
| **Ágil** | Todo es rápido, sin fricción |
| **Peruana** | Orgullo local, lenguaje peruano |
| **Inclusiva** | Para todos, sin importar nivel tecnológico |

### 2.2 Arquetipo de Marca
**El Vecino Confiable** - Esa persona del barrio que siempre conoce a alguien que puede ayudarte. Accesible, honesto, resolutivo.

### 2.3 Tono de Voz

| Situación | Tono | Ejemplo |
|-----------|------|---------|
| Éxito | Celebratorio | "¡Bacán! Tu oferta ya está publicada" |
| Error | Comprensivo | "Algo salió mal, pero no te preocupes" |
| Vacío | Motivador | "Aún no tienes chambas, ¡busquemos una!" |
| Carga | Paciente | "Buscando las mejores chambas para ti..." |
| Onboarding | Amigable | "¡Hola! Cuéntanos qué sabes hacer" |

### 2.4 Vocabulario ChambApp

| Término Genérico | Término ChambApp |
|------------------|------------------|
| Trabajo | Chamba |
| Empleo temporal | Cachuelo |
| Trabajador | Chambero/Chambera |
| Aplicar | Postular |
| Notificación | Alerta |
| Perfil | Tu perfil |
| Dashboard | Inicio |

---

## 3. SISTEMA DE COLORES UNIFICADO

### 3.1 Paleta Principal

```css
:root {
    /* PRIMARY - Azul ChambApp (Confianza, Profesionalismo) */
    --primary: #0066FF;
    --primary-hover: #0052CC;
    --primary-light: #E6F2FF;
    --primary-dark: #003D99;

    /* SECONDARY - Verde Éxito (Logro, Dinero, Crecimiento) */
    --secondary: #00C48C;
    --secondary-hover: #00A876;
    --secondary-light: #E6FFF6;
    --secondary-dark: #008F66;

    /* ACCENT - Naranja Energía (Acción, Urgencia, Destacar) */
    --accent: #FF6B00;
    --accent-hover: #E05F00;
    --accent-light: #FFF3E6;
    --accent-dark: #CC5500;

    /* DANGER - Rojo Alerta */
    --danger: #FF3B3B;
    --danger-light: #FFEBEB;

    /* WARNING - Amarillo Atención */
    --warning: #FFBB00;
    --warning-light: #FFF8E6;

    /* NEUTRALES */
    --gray-900: #0F1419;  /* Textos principales */
    --gray-700: #4A5568;  /* Textos secundarios */
    --gray-500: #718096;  /* Textos terciarios */
    --gray-300: #CBD5E0;  /* Bordes */
    --gray-100: #F7FAFC;  /* Fondos */
    --white: #FFFFFF;
}
```

### 3.2 Uso de Colores

| Color | Uso Principal |
|-------|---------------|
| Primary (#0066FF) | CTAs, links, elementos interactivos, header |
| Secondary (#00C48C) | Éxito, dinero/salario, confirmaciones |
| Accent (#FF6B00) | Premium, destacar ofertas, urgente |
| Danger (#FF3B3B) | Errores, eliminar, alertas críticas |
| Warning (#FFBB00) | Advertencias, pendientes |

### 3.3 Colores de Categorías (Optimizados)

```css
:root {
    --cat-construccion: #F97316;  /* Naranja ladrillo */
    --cat-electricidad: #FBBF24;  /* Amarillo eléctrico */
    --cat-gasfiteria: #0EA5E9;    /* Azul agua */
    --cat-limpieza: #A855F7;      /* Morado limpio */
    --cat-jardineria: #22C55E;    /* Verde naturaleza */
    --cat-carpinteria: #D97706;   /* Marrón madera */
    --cat-pintura: #EC4899;       /* Rosa/Magenta */
    --cat-mecanica: #64748B;      /* Gris metal */
    --cat-otros: #6B7280;         /* Gris neutro */
}
```

---

## 4. TIPOGRAFÍA

### 4.1 Fuentes Recomendadas

```css
:root {
    /* Títulos - Poppins (moderna, amigable, buena legibilidad) */
    --font-display: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;

    /* Cuerpo - Inter (excelente legibilidad en pantallas) */
    --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### 4.2 Escala Tipográfica

| Elemento | Móvil | Desktop | Peso |
|----------|-------|---------|------|
| H1 (Page Title) | 28px | 36px | 700 |
| H2 (Section) | 22px | 28px | 600 |
| H3 (Card Title) | 18px | 20px | 600 |
| Body | 16px | 16px | 400 |
| Small | 14px | 14px | 400 |
| Caption | 12px | 12px | 500 |

### 4.3 Jerarquía Visual

```
H1: "Encuentra tu chamba ideal" (Poppins Bold)
    H2: "Chambas cerca de ti" (Poppins Semibold)
        H3: "Electricista Urgente" (Poppins Semibold)
            Body: "Buscamos electricista con experiencia..." (Inter Regular)
            Small: "Hace 2 horas • 3 km" (Inter Regular)
            Caption: "S/ 150/día" (Poppins Semibold)
```

---

## 5. ICONOGRAFÍA

### 5.1 Recomendación: Iconos SVG Custom

**Problema actual:** Uso de emojis que no escalan bien y lucen inconsistentes.

**Solución:** Crear set de iconos SVG simples y consistentes.

| Categoría | Icono Propuesto |
|-----------|-----------------|
| Construcción | Martillo + ladrillo |
| Electricidad | Rayo |
| Gasfitería | Llave inglesa + gota |
| Limpieza | Escoba brillante |
| Jardinería | Hoja/planta |
| Carpintería | Serrucho |
| Pintura | Rodillo |
| Mecánica | Engranaje |

**Estilo de iconos:**
- Stroke: 2px
- Corners: Redondeados
- Estilo: Outlined (no filled)
- Tamaño base: 24x24px

### 5.2 Alternativa Inmediata

Usar Heroicons (https://heroicons.com/) o Phosphor Icons (https://phosphoricons.com/) que son gratuitos y consistentes.

---

## 5.5 HEADER SIMPLE (Páginas Secundarias)

### Componente Centralizado
El header de TODAS las páginas secundarias está centralizado en `css/header-simple.css`. Es la **fuente única** de estilos para `.header`, `.header-content`, `.logo`, `.logo-img`, `.logo-text` y `.btn-volver`.

> **Regla (03/02/26):** NUNCA definir estos estilos en CSS de página. Si se necesita un override (ej: `max-width` diferente), definir solo esa propiedad en el CSS de página.

```html
<!-- Estructura HTML estándar del header -->
<header class="header">
    <div class="header-content">
        <a href="dashboard.html" class="logo">
            <img src="/assets/logo/logo-icono.png" alt="ChambApp" class="logo-img">
            <span class="logo-text">ChambApp</span>
        </a>
        <a href="dashboard.html" class="btn-volver">← Volver al Dashboard</a>
    </div>
</header>
```

```css
/* header-simple.css - Estilos del header */
.header { background: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
.header-content { max-width: 1200px; margin: 0 auto; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
.logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
.logo-img { height: 32px; width: auto; }
.logo-text { font-size: 1.25rem; font-weight: 700; color: #1e293b; }
.btn-volver { padding: 0.5rem 1rem; background: #64748b; color: white; border-radius: 6px; font-size: 0.875rem; font-weight: 500; }
```

### Páginas que usan Header Simple
| Página | Import | Override |
|--------|--------|----------|
| perfil-trabajador.html | `header-simple.css` | Ninguno |
| perfil-empleador.html | `header-simple.css` | Ninguno |
| notificaciones.html | `header-simple.css` | Ninguno |
| mis-aplicaciones.html | `header-simple.css` | Ninguno |
| mis-aplicaciones-trabajador.html | `header-simple.css` | Ninguno |
| historial-ofertas.html | `header-simple.css` | Ninguno |
| historial-calificaciones.html | `header-simple.css` | Ninguno |
| mapa-ofertas.html | `header-simple.css` | Ninguno |
| publicar-oferta.html | `header-simple.css` | `.header-content { max-width: 900px }` |

**Nota:** `dashboard.html` usa su propio header definido en `dashboard-main.css` con clase `.dashboard-header`.

### Páginas de Autenticación (login/register)

> **Regla (03/02/26):** login.html y register.html tienen CSS externalizado en `css/login.css` y `css/register.css`. Ambos usan `design-system.css` como base. NUNCA volver a poner CSS inline en estas páginas.

**Estructura CSS compartida:**
- Body: `display: flex; align-items: center; justify-content: center;` (centrado total)
- `<main>`: `width: 100%; max-width: Xpx;` (fija el ancho, evita variación por contenido)
- Container: `width: 100%; border-radius: var(--radius-xl);`
- Inputs: `border: 2px solid var(--gray-300); border-radius: var(--radius-md);`
- Botones: `border-radius: var(--radius-lg); min-height: 44px; white-space: nowrap;`

**Validación visual:** Los bordes verdes/rojos automáticos de `accessibility.css` (`input:valid/:invalid`) están anulados en login/register para evitar feedback prematuro.

**Register - Componentes:**
- Progress dots con micro-labels ("Tipo", "Datos", "Clave")
- Cards de tipo usuario: layout horizontal (emoji + texto)
- Indicador de fortaleza de contraseña (JS en register.js)
- Checkbox custom 24x24px con check azul
- Logo del header con fondo blanco redondeado sobre gradiente azul
- `form-content` con `min-height` fija y `flex` para botones anclados al fondo

---

## 6. COMPONENTES UI MEJORADOS

### 6.1 Botones

```css
/* Botón Primary - Más redondeado, más bold */
.btn-primary {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    border-radius: 12px;
    font-weight: 600;
    padding: 14px 24px;
    box-shadow: 0 4px 14px rgba(0, 102, 255, 0.25);
    transition: all 0.2s ease;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 102, 255, 0.35);
}

.btn-primary:active {
    transform: translateY(0);
}
```

### 6.2 Cards de Ofertas

```css
.offer-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.25s ease;
}

.offer-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
}

/* Indicador de categoría más sutil */
.offer-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    border-radius: 16px 16px 0 0;
    background: var(--category-color);
}
```

### 6.3 Inputs Mejorados

```css
.form-input {
    border: 2px solid var(--gray-300);
    border-radius: 12px;
    padding: 14px 16px;
    font-size: 16px; /* Previene zoom en iOS */
    transition: all 0.2s ease;
}

.form-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px var(--primary-light);
    outline: none;
}

/* Label flotante para mejor UX */
.form-group.floating label {
    position: absolute;
    top: 50%;
    left: 16px;
    transform: translateY(-50%);
    transition: all 0.2s ease;
    pointer-events: none;
    color: var(--gray-500);
}

.form-group.floating input:focus + label,
.form-group.floating input:not(:placeholder-shown) + label {
    top: 0;
    font-size: 12px;
    background: white;
    padding: 0 4px;
    color: var(--primary);
}
```

---

## 7. MICRO-INTERACCIONES (Task 31)

> **Estado:** ✅ IMPLEMENTADO (30 Enero 2026)
>
> **Archivo creado:** `css/animations.css`
>
> **Clases implementadas:**
> - `.touchable` / `.touchable-subtle` - Tap feedback para elementos interactivos
> - `.tap-ripple` - Efecto ripple en tap
> - `.success-animation` / `.success-glow` - Animaciones de éxito
> - `.heart-animation` / `.favorite-animation` - Animaciones para favoritos
> - `.page-content` / `.page-fade` - Transiciones de entrada de página
> - `.stagger-children` / `.stagger-fast` - Entrada secuencial de listas
> - `.hover-lift` / `.hover-scale` / `.hover-glow` - Estados hover mejorados
> - `.error-shake` / `.bounce-in` / `.attention-pulse` - Feedback visual
> - `.loading-dots` / `.progress-indeterminate` - Estados de carga
> - Soporte para `prefers-reduced-motion` (accesibilidad)
>
> **Páginas actualizadas:** dashboard, mis-aplicaciones, mis-aplicaciones-trabajador, notificaciones, mapa-ofertas, publicar-oferta, historial-calificaciones, perfil-trabajador, perfil-empleador, login, register, index

### 7.1 Animaciones de Feedback

```css
/* Tap feedback para elementos tocables */
.touchable {
    transition: transform 0.1s ease, opacity 0.1s ease;
}

.touchable:active {
    transform: scale(0.97);
    opacity: 0.9;
}

/* Success animation */
@keyframes success-pop {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
}

.success-animation {
    animation: success-pop 0.4s ease-out;
}

/* Like/favorite animation */
@keyframes heart-beat {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.2); }
    50% { transform: scale(0.95); }
    75% { transform: scale(1.1); }
}

.heart-animation {
    animation: heart-beat 0.4s ease-in-out;
}
```

### 7.2 Transiciones de Página

```css
/* Entrada de página */
@keyframes page-enter {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.page-content {
    animation: page-enter 0.3s ease-out;
}

/* Stagger para listas */
.list-item {
    opacity: 0;
    animation: page-enter 0.3s ease-out forwards;
}

.list-item:nth-child(1) { animation-delay: 0.05s; }
.list-item:nth-child(2) { animation-delay: 0.1s; }
.list-item:nth-child(3) { animation-delay: 0.15s; }
/* ... */
```

---

## 8. EMPTY STATES (Task 32)

> **Estado:** ✅ IMPLEMENTADO (30 Enero 2026)
>
> **Tono elegido:** Neutro y formal (no coloquial/peruano)
>
> **Archivos actualizados:**
> - `mis-aplicaciones.html`, `mis-aplicaciones-trabajador.html`
> - `notificaciones.html`, `dashboard.html`
> - `historial-calificaciones.html`
> - `js/dashboard/dashboard.js`, `js/mapa-ofertas.js`
> - `js/mis-aplicaciones.js`, `js/mis-aplicaciones-trabajador.js`
>
> **Cambios realizados:**
> - Reemplazado "chamba" por "oferta" en toda la app
> - Tono profesional y directo
> - Agregadas animaciones `.scale-in` a empty states
> - CTAs claros con clase `.touchable`

### 8.1 Diseño de Empty States

Cada empty state debe tener:
1. **Icono** - Emoji relacionado al contexto
2. **Título** - Claro, directo, comienza con "Sin..."
3. **Descripción** - Explica qué hacer, tono neutro
4. **CTA** - Acción clara

### 8.2 Ejemplos de Copy (Tono Neutro/Formal)

| Situación | Título | Descripción | CTA |
|-----------|--------|-------------|-----|
| Sin ofertas disponibles | "Sin ofertas disponibles" | "No hay ofertas de trabajo en este momento. Prueba explorando el mapa o vuelve más tarde." | "Explorar Mapa" |
| Sin postulaciones (trabajador) | "Sin postulaciones" | "Aún no has postulado a ninguna oferta. Explora las ofertas disponibles y postula a las que te interesen." | "Explorar Ofertas" |
| Sin notificaciones | "Sin notificaciones" | "No tienes notificaciones en este momento. Te avisaremos cuando haya novedades." | "Ir al Inicio" |
| Sin candidatos (empleador) | "Sin postulaciones" | "Aún no hay candidatos para tus ofertas. Publica una nueva oferta o edita las existentes para atraer más postulantes." | "Publicar Oferta" |
| Sin resultados filtro | "Sin resultados" | "No se encontraron ofertas con los filtros seleccionados. Prueba con otros criterios." | - |
| Error de conexión | "Error al cargar" | "Verifica tu conexión e intenta nuevamente." | "Reintentar" |

---

## 9. LOADING STATES (Task 34)

> **Estado:** ✅ IMPLEMENTADO (30 Enero 2026)
>
> **Archivos actualizados:**
> - `css/components.css` - Nuevos estilos de skeleton
> - `mis-aplicaciones.html`, `mis-aplicaciones-trabajador.html`
> - `notificaciones.html`, `historial-calificaciones.html`
> - `perfil-trabajador.html`, `perfil-empleador.html`
>
> **Skeletons implementados:**
> - `.skeleton-aplicacion` - Cards de candidatos/postulaciones
> - `.skeleton-notificacion` - Items de notificaciones
> - `.skeleton-calificacion` - Cards de calificaciones
> - `.skeleton-avatar`, `.skeleton-avatar-lg` - Avatares

### 9.1 Skeletons Contextuales

```css
/* Skeleton base con shimmer */
.skeleton {
    background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s ease-in-out infinite;
}

/* Skeleton para aplicación/candidato */
.skeleton-aplicacion { /* Card completa con header, body, actions */ }
.skeleton-avatar { width: 48px; height: 48px; border-radius: 50%; }
.skeleton-badge { height: 24px; width: 80px; border-radius: 9999px; }
.skeleton-btn { height: 36px; width: 100px; }

/* Skeleton para notificación */
.skeleton-notificacion { /* Icono + contenido */ }
.skeleton-notif-icon { width: 40px; height: 40px; }

/* Skeleton para calificación */
.skeleton-calificacion { /* Estrellas + texto */ }
.skeleton-estrella { width: 20px; height: 20px; }
```

### 9.2 Mensajes de Carga Contextuales (Tono Neutro)

| Página/Acción | Mensaje |
|---------------|---------|
| Candidatos | "Cargando candidatos..." |
| Postulaciones | "Cargando postulaciones..." |
| Notificaciones | "Cargando notificaciones..." |
| Calificaciones | "Cargando calificaciones..." |
| Mapa | "Cargando mapa de ofertas..." |
| Perfil | "Cargando perfil..." |
| Enviar postulación | "⏳ Enviando..." |
| Guardar cambios | "💾 Guardando..." |

---

## 10. ACCESIBILIDAD (Task 35)

### 10.1 Checklist WCAG 2.1 AA

- [ ] Contraste mínimo 4.5:1 para texto normal
- [ ] Contraste mínimo 3:1 para texto grande y UI
- [ ] Touch targets mínimo 44x44px
- [ ] Focus visible en todos los elementos interactivos
- [ ] Labels en todos los inputs
- [ ] Alt text en todas las imágenes
- [ ] Estructura de headings correcta (h1 > h2 > h3)
- [ ] Skip links para navegación por teclado
- [ ] Anuncios de cambios dinámicos (aria-live)

### 10.2 Mejoras de Contraste

| Elemento | Color Actual | Color Mejorado | Ratio |
|----------|--------------|----------------|-------|
| Texto gris sobre blanco | #94a3b8 | #64748b | 4.54:1 |
| Primary sobre blanco | #2563eb | #0066FF | 4.51:1 |
| Placeholder | #cbd5e1 | #94a3b8 | 3.02:1 |

---

## 11. DARK MODE (Task 36 - Opcional)

### 11.1 Paleta Dark Mode

```css
@media (prefers-color-scheme: dark) {
    :root {
        --bg-primary: #0F1419;
        --bg-secondary: #1A1D23;
        --bg-tertiary: #252A31;
        --text-primary: #FFFFFF;
        --text-secondary: #A0AEC0;
        --border: #2D3748;

        /* Primary ajustado para dark */
        --primary: #3B82F6;
        --primary-light: #1E3A5F;
    }
}
```

---

## 12. HOJA DE RUTA DE IMPLEMENTACIÓN

### Sprint 7: Fundamentos (Tasks 31-32)
| Día | Tarea | Estado |
|-----|-------|--------|
| 1-2 | Unificar paleta de colores en toda la app | ✅ COMPLETADO |
| 2-3 | Implementar tipografía consistente (Poppins + Inter) | ✅ COMPLETADO |
| 3-4 | Micro-interacciones básicas (tap, hover, transitions) | ✅ COMPLETADO (30 Ene) |
| 4-5 | Empty states con copy mejorado (tono neutro/formal) | ✅ COMPLETADO (30 Ene) |

### Sprint 8: Pulido (Tasks 33-36)
| Día | Tarea | Estado |
|-----|-------|--------|
| 1-2 | Error states y validaciones mejoradas | PENDIENTE |
| 2-3 | Loading states contextuales (skeletons) | ✅ COMPLETADO (30 Ene) |
| 3-4 | Auditoría y fixes de accesibilidad | PENDIENTE |
| 4-5 | Dark mode (si hay tiempo) | PENDIENTE |

### Refactorización (Pre-Sprint 8 continuación)
| Tarea | Estado |
|-------|--------|
| Eliminar CSS duplicado | ✅ COMPLETADO (30 Ene) |
| Mover estilos inline a CSS | 🔄 EN PROGRESO |
| Limpiar console.logs | PENDIENTE |
| Auditoría Lighthouse | PENDIENTE |

---

## 13. MÉTRICAS DE ÉXITO

| Métrica | Antes | Objetivo |
|---------|-------|----------|
| Lighthouse Performance | ~70 | >85 |
| Lighthouse Accessibility | ~80 | >95 |
| Tiempo de primera interacción | ~3s | <2s |
| Bounce rate landing | 40% | <25% |
| Tasa de conversión registro | 15% | >25% |

---

## 14. RECURSOS Y ASSETS NECESARIOS

### 14.1 Para Crear
- [ ] Logo oficial
- [ ] Set de iconos SVG (9 categorías + 20 UI icons)
- [ ] Ilustraciones para empty states (5-6)
- [ ] Favicon y app icons actualizados

### 14.2 Herramientas Sugeridas
- **Iconos:** Phosphor Icons o Heroicons
- **Ilustraciones:** unDraw.co o Storyset.com
- **Logo:** NanoBanana (ver prompt abajo)
- **Mockups:** Figma

---

## ANEXO: Recursos Externos

### Google Fonts Link
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
```

### Phosphor Icons CDN
```html
<script src="https://unpkg.com/@phosphor-icons/web"></script>
```

---

**Última actualización:** 03 Febrero 2026
**Próxima revisión:** Al completar Fase 2

