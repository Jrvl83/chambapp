# UX/UI GUIA MAESTRA - CHAMBAPP

**Documento de Identidad Visual y Mejoras UX**
**Versión:** 1.1
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

#### UX Móvil Mejorable
- Algunos touch targets muy pequeños en listas
- Falta feedback táctil en algunas interacciones
- Loading states básicos (solo spinner genérico)

#### Empty States Genéricos
- Mensaje de "No hay datos" sin guía de acción
- Falta ilustraciones que humanicen la experiencia

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

### 8.1 Diseño de Empty States

Cada empty state debe tener:
1. **Ilustración** - Simple, amigable, relacionada al contexto
2. **Título** - Claro, en tono ChambApp
3. **Descripción** - Explica qué hacer
4. **CTA** - Acción clara

### 8.2 Ejemplos de Copy

| Situación | Título | Descripción | CTA |
|-----------|--------|-------------|-----|
| Sin ofertas cercanas | "No hay chambas por aquí... aún" | "Estamos creciendo cada día. Amplía tu búsqueda o vuelve pronto." | "Ampliar búsqueda" |
| Sin postulaciones | "Tu bandeja está vacía" | "Las chambas que te interesan aparecerán aquí." | "Explorar chambas" |
| Sin notificaciones | "Todo tranquilo por acá" | "Cuando haya novedades, te avisamos al toque." | "Ir al inicio" |
| Sin trabajadores aplicando | "Nadie ha postulado aún" | "Tu oferta es nueva. Compártela para más alcance." | "Compartir oferta" |
| Error de conexión | "Sin conexión" | "Revisa tu internet e intenta de nuevo." | "Reintentar" |

---

## 9. LOADING STATES (Task 34)

### 9.1 Skeletons Contextuales

```css
/* Skeleton para card de oferta */
.skeleton-offer {
    height: 160px;
    border-radius: 16px;
    background: linear-gradient(
        90deg,
        var(--gray-100) 0%,
        var(--gray-200) 50%,
        var(--gray-100) 100%
    );
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s infinite;
}

@keyframes skeleton-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* Skeleton para perfil */
.skeleton-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
}

/* Skeleton para stats */
.skeleton-stat {
    width: 100%;
    height: 100px;
    border-radius: 12px;
}
```

### 9.2 Mensajes de Carga Contextuales

| Acción | Mensaje |
|--------|---------|
| Cargando ofertas | "Buscando chambas cerca de ti..." |
| Cargando perfil | "Preparando tu perfil..." |
| Enviando postulación | "Enviando tu postulación..." |
| Guardando cambios | "Guardando..." |
| Subiendo foto | "Subiendo tu foto..." |

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
| Día | Tarea |
|-----|-------|
| 1-2 | Unificar paleta de colores en toda la app |
| 2-3 | Implementar tipografía consistente (Poppins + Inter) |
| 3-4 | Micro-interacciones básicas (tap, hover, transitions) |
| 4-5 | Empty states con ilustraciones y copy mejorado |

### Sprint 8: Pulido (Tasks 33-36)
| Día | Tarea |
|-----|-------|
| 1-2 | Error states y validaciones mejoradas |
| 2-3 | Loading states contextuales (skeletons) |
| 3-4 | Auditoría y fixes de accesibilidad |
| 4-5 | Dark mode (si hay tiempo) |

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

**Última actualización:** 27 Enero 2026
**Próxima revisión:** Al completar Sprint 8

