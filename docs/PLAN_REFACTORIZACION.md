# PLAN DE REFACTORIZACIÓN - CHAMBAPP

**Task:** Revisión y limpieza de código
**Fecha:** 30 Enero 2026
**Última actualización:** 30 Enero 2026
**Prioridad:** Alta (antes de continuar con nuevas features)

---

## OBJETIVO

Revisar y limpiar el código existente para cumplir con las REGLAS_DESARROLLO.md antes de continuar agregando funcionalidades.

---

## 1. AUDITORÍA CSS

### 1.1 Eliminar Duplicados ✅ COMPLETADO
| Archivo 1 | Archivo 2 | Elementos duplicados | Estado |
|-----------|-----------|---------------------|--------|
| components.css | dashboard-main.css | `.skeleton`, `@keyframes skeleton-loading` | ✅ Eliminado |
| components.css | dashboard-main.css | `.spinner`, `@keyframes spin` | ✅ Eliminado |
| components.css | mapa-ofertas.css | `.spinner`, `@keyframes spin` | ✅ Eliminado |

**Resultado:** Todos los estilos de spinner y skeleton ahora están solo en `components.css`.

### 1.2 Mover Estilos Inline a CSS
**Archivos revisados:**
- [x] dashboard.html - Modal ubicación movido a clases CSS
- [x] mis-aplicaciones.html - Inline margin removido
- [ ] mis-aplicaciones-trabajador.html - Solo display:none (funcional)
- [ ] notificaciones.html - Solo display:none (funcional)
- [ ] perfil-trabajador.html - Revisar estilos inline
- [ ] perfil-empleador.html - Revisar estilos inline
- [ ] publicar-oferta.html - Solo display:none (funcional)
- [ ] historial-calificaciones.html - Solo display:none (funcional)
- [ ] mapa-ofertas.html - Solo display:none (funcional)
- [ ] login.html - Logo height inline (menor prioridad)
- [ ] register.html - Solo display:none (funcional)

**Nota:** Los `style="display: none;"` son funcionales para JS y son aceptables.

### 1.3 Verificar Uso de Variables
Buscar valores hardcodeados que deberían usar variables:
- [ ] Colores: `#0066FF`, `#ffffff`, etc. → `var(--primary)`, `var(--white)`
- [ ] Espaciado: `16px`, `1rem`, etc. → `var(--space-md)`
- [ ] Bordes: `8px`, `12px` → `var(--radius-md)`, `var(--radius-lg)`

---

## 2. AUDITORÍA JAVASCRIPT

### 2.1 Archivos Largos a Modularizar
| Archivo | Líneas | Acción | Prioridad |
|---------|--------|--------|-----------|
| dashboard.js | ~1500 | Dividir en módulos | Baja |
| mis-aplicaciones.js | ~1100 | Dividir en módulos | Baja |
| perfil-trabajador.js | ~1200 | Dividir en módulos | Baja |

### 2.2 Limpiar Console.logs
**Inventario actual:**
| Archivo | console.log | console.error/warn |
|---------|-------------|-------------------|
| publicar-oferta.js | 33 | 22 |
| perfil-trabajador.js | 17 | 9 |
| dashboard.js | 17 | - |
| perfil-empleador.js | 12 | 4 |
| onboarding.js | 11 | 9 |
| mapa-ofertas.js | 7 | 12 |
| **Total** | **100+** | **82** |

**Estado:** Pendiente - requiere limpieza cuidadosa para no eliminar logs de error.

### 2.3 Código Muerto
Buscar y eliminar:
- [ ] Funciones no utilizadas
- [ ] Variables no utilizadas
- [ ] Código comentado

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

### Fase 1: CSS (Prioridad Alta) - EN PROGRESO
1. ✅ Eliminar CSS duplicado
2. 🔄 Mover estilos inline a archivos CSS (parcial)
3. [ ] Reemplazar valores hardcodeados por variables

### Fase 2: JavaScript (Prioridad Media) - PENDIENTE
1. [ ] Limpiar console.logs y código muerto
2. [ ] (Opcional) Modularizar archivos largos

### Fase 3: HTML/Accesibilidad (Prioridad Media) - PENDIENTE
1. [ ] Agregar alt, labels, aria-labels faltantes
2. [ ] Verificar semántica

### Fase 4: Performance (Prioridad Alta) - PENDIENTE
1. [ ] Correr Lighthouse
2. [ ] Corregir issues críticos

---

## 6. CRITERIOS DE ÉXITO

- [x] No hay CSS duplicado entre archivos
- [ ] No hay estilos inline de diseño en HTML
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Performance > 80
- [ ] No hay errores en consola
- [ ] Código cumple con REGLAS_DESARROLLO.md

---

## 7. PROGRESO

| Fecha | Cambios |
|-------|---------|
| 30/01/26 | Eliminados CSS duplicados (spinner, skeleton) de dashboard-main.css y mapa-ofertas.css |
| 30/01/26 | Modal ubicación movido de estilos inline a clases CSS |
| 30/01/26 | Inventario de console.logs realizado (100+ encontrados) |

---

**Nota:** Este plan se ejecutará ANTES de continuar con Task 33, 35 y 36 del Sprint 8.
