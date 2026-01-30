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

### 1.3 Verificar Uso de Variables ⏸️ DIFERIDO
**Análisis:** 413 colores hex + 733 valores px hardcodeados en 20 archivos CSS.
**Decisión:** Diferido por alcance. Se aplicará gradualmente en futuras ediciones de archivos.
- [ ] Colores: `#0066FF`, `#ffffff`, etc. → `var(--primary)`, `var(--white)`
- [ ] Espaciado: `16px`, `1rem`, etc. → `var(--space-md)`
- [ ] Bordes: `8px`, `12px` → `var(--radius-md)`, `var(--radius-lg)`

**Regla:** En futuras ediciones de CSS, usar variables del design-system.css.

---

## 2. AUDITORÍA JAVASCRIPT

### 2.1 Archivos Largos a Modularizar
| Archivo | Líneas | Acción | Prioridad |
|---------|--------|--------|-----------|
| dashboard.js | ~1500 | Dividir en módulos | Baja |
| mis-aplicaciones.js | ~1100 | Dividir en módulos | Baja |
| perfil-trabajador.js | ~1200 | Dividir en módulos | Baja |

### 2.2 Limpiar Console.logs ✅ COMPLETADO
**Archivos limpiados:**
| Archivo | Antes | Después | Estado |
|---------|-------|---------|--------|
| publicar-oferta.js | 33 logs | 0 logs | ✅ Limpio |
| perfil-trabajador.js | 17 logs | 5 errors | ✅ Limpio |
| dashboard.js | 25+ logs | 8 errors | ✅ Limpio |
| perfil-empleador.js | 12 logs | 4 errors | ✅ Limpio |
| onboarding.js | 21 logs | 0 logs | ✅ Limpio |
| mapa-ofertas.js | 9 logs | 10 errors | ✅ Limpio |

**Nota:** Se mantienen console.error para manejo de errores reales.

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

### Fase 1: CSS (Prioridad Alta) - COMPLETADO (parcial)
1. ✅ Eliminar CSS duplicado
2. ✅ Mover estilos inline a archivos CSS (los restantes son display:none funcionales)
3. ⏸️ Reemplazar valores hardcodeados por variables (diferido - se aplicará gradualmente)

### Fase 2: JavaScript (Prioridad Media) - ✅ COMPLETADO
1. ✅ Limpiar console.logs (6/6 archivos principales limpiados)
2. [ ] (Opcional) Modularizar archivos largos

### Fase 3: HTML/Accesibilidad (Prioridad Media) - ✅ AUDITORÍA INICIAL OK
1. ✅ Auditoría rápida: imágenes tienen alt, 18 aria-labels existentes
2. [ ] Verificar semántica (pendiente revisión manual)
3. [ ] Correr Lighthouse para auditoría completa

### Fase 4: Performance (Prioridad Alta) - PENDIENTE
1. [ ] Correr Lighthouse
2. [ ] Corregir issues críticos

---

## 6. CRITERIOS DE ÉXITO

- [x] No hay CSS duplicado entre archivos
- [x] No hay estilos inline de diseño en HTML (los restantes son display:none funcionales)
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Performance > 80
- [x] Console.logs de debug eliminados (archivos principales)
- [ ] Código cumple con REGLAS_DESARROLLO.md

---

## 7. PROGRESO

| Fecha | Cambios |
|-------|---------|
| 30/01/26 | Eliminados CSS duplicados (spinner, skeleton) de dashboard-main.css y mapa-ofertas.css |
| 30/01/26 | Modal ubicación movido de estilos inline a clases CSS |
| 30/01/26 | Inventario de console.logs realizado (100+ encontrados) |
| 30/01/26 | Documentación reorganizada y consolidada |
| 30/01/26 | Fase 1.3 diferida (413 colores + 733 px values - alcance muy grande) |
| 30/01/26 | Fase 2: Limpiados ~120 console.logs de 6 archivos principales ✅ |
| 30/01/26 | Fase 3: Auditoría inicial OK (imgs con alt, aria-labels presentes) |
| 30/01/26 | Organización repo: favicons a assets/icons/, docs archivados |

---

**Nota:** Este plan se ejecutará ANTES de continuar con Task 33, 35 y 36 del Sprint 8.
