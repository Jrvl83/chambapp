# PLAN DE REFACTORIZACIÓN - CHAMBAPP

**Task:** Revisión y limpieza de código
**Fecha:** 30 Enero 2026
**Prioridad:** Alta (antes de continuar con nuevas features)

---

## OBJETIVO

Revisar y limpiar el código existente para cumplir con las REGLAS_DESARROLLO.md antes de continuar agregando funcionalidades.

---

## 1. AUDITORÍA CSS

### 1.1 Eliminar Duplicados
| Archivo 1 | Archivo 2 | Elementos duplicados |
|-----------|-----------|---------------------|
| components.css | dashboard-main.css | `.skeleton`, `@keyframes skeleton-loading` |
| components.css | dashboard-main.css | `.spinner`, `@keyframes spin` |
| components.css | mapa-ofertas.css | `.spinner`, `@keyframes spin` |

**Acción:** Mantener solo en `components.css`, eliminar de los demás.

### 1.2 Mover Estilos Inline a CSS
Buscar y mover todos los `style="..."` a archivos CSS correspondientes.

**Archivos a revisar:**
- [ ] dashboard.html
- [ ] mis-aplicaciones.html
- [ ] mis-aplicaciones-trabajador.html
- [ ] notificaciones.html
- [ ] perfil-trabajador.html
- [ ] perfil-empleador.html
- [ ] publicar-oferta.html
- [ ] historial-calificaciones.html
- [ ] mapa-ofertas.html
- [ ] login.html
- [ ] register.html

### 1.3 Verificar Uso de Variables
Buscar valores hardcodeados que deberían usar variables:
- Colores: `#0066FF`, `#ffffff`, etc. → `var(--primary)`, `var(--white)`
- Espaciado: `16px`, `1rem`, etc. → `var(--space-md)`
- Bordes: `8px`, `12px` → `var(--radius-md)`, `var(--radius-lg)`

---

## 2. AUDITORÍA JAVASCRIPT

### 2.1 Archivos Largos a Modularizar
| Archivo | Líneas | Acción |
|---------|--------|--------|
| dashboard.js | ~1500 | Dividir en módulos |
| mis-aplicaciones.js | ~1100 | Dividir en módulos |
| perfil-trabajador.js | ~1200 | Dividir en módulos |

### 2.2 Limpiar Console.logs
Buscar y eliminar `console.log` de debug (mantener solo errores).

### 2.3 Código Muerto
Buscar y eliminar:
- Funciones no utilizadas
- Variables no utilizadas
- Código comentado

---

## 3. AUDITORÍA HTML

### 3.1 Accesibilidad
- [ ] Verificar todos los `<img>` tienen `alt`
- [ ] Verificar todos los `<input>` tienen `<label>`
- [ ] Verificar jerarquía de headings (h1 > h2 > h3)
- [ ] Verificar `aria-label` en botones de icono

### 3.2 Semántica
- [ ] Usar `<main>`, `<nav>`, `<header>`, `<footer>` correctamente
- [ ] Usar `<button>` para acciones, `<a>` para navegación

---

## 4. PERFORMANCE (LIGHTHOUSE)

### 4.1 Ejecutar Auditoría
Correr Lighthouse en las páginas principales:
- [ ] index.html (landing)
- [ ] dashboard.html
- [ ] mapa-ofertas.html
- [ ] perfil-trabajador.html

### 4.2 Documentar Resultados
| Página | Performance | Accessibility | Best Practices | SEO |
|--------|-------------|---------------|----------------|-----|
| index.html | ? | ? | ? | ? |
| dashboard.html | ? | ? | ? | ? |
| mapa-ofertas.html | ? | ? | ? | ? |
| perfil-trabajador.html | ? | ? | ? | ? |

### 4.3 Corregir Issues Críticos
Priorizar correcciones con mayor impacto.

---

## 5. ORDEN DE EJECUCIÓN

### Fase 1: CSS (Prioridad Alta)
1. Eliminar CSS duplicado
2. Mover estilos inline a archivos CSS
3. Reemplazar valores hardcodeados por variables

### Fase 2: JavaScript (Prioridad Media)
1. Limpiar console.logs y código muerto
2. (Opcional) Modularizar archivos largos

### Fase 3: HTML/Accesibilidad (Prioridad Media)
1. Agregar alt, labels, aria-labels faltantes
2. Verificar semántica

### Fase 4: Performance (Prioridad Alta)
1. Correr Lighthouse
2. Corregir issues críticos

---

## 6. CRITERIOS DE ÉXITO

- [ ] No hay CSS duplicado entre archivos
- [ ] No hay estilos inline en HTML
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Performance > 80
- [ ] No hay errores en consola
- [ ] Código cumple con REGLAS_DESARROLLO.md

---

## 7. ESTIMACIÓN

| Fase | Complejidad |
|------|-------------|
| Fase 1: CSS | Media |
| Fase 2: JavaScript | Baja (solo limpieza) |
| Fase 3: HTML | Baja |
| Fase 4: Performance | Variable |

---

**Nota:** Este plan se ejecutará ANTES de continuar con Task 33, 35 y 36 del Sprint 8.
