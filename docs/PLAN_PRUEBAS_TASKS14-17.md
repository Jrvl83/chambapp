# Plan de Pruebas - Tasks 14-17: Sistema de Calificaciones Expandido

**Fecha:** 21 Enero 2026
**Versión:** 1.0
**Autor:** Claude Code

---

## Resumen de Funcionalidades a Probar

| Task | Funcionalidad | Archivos Principales |
|------|---------------|---------------------|
| 14 | Vista de reseñas recibidas en perfil trabajador | `perfil-trabajador.html/js/css` |
| 15 | Calificación bidireccional (trabajador → empleador) | `mis-aplicaciones-trabajador.html/js/css` |
| 16 | Historial completo de calificaciones | `historial-calificaciones.html/js/css` |
| 17 | Responder a calificaciones recibidas | `perfil-trabajador.html/js` |

---

## Prerrequisitos

### Datos de Prueba Necesarios
1. **Usuario Trabajador** con cuenta activa
2. **Usuario Empleador** con cuenta activa
3. **Al menos 1 oferta publicada** por el empleador
4. **Al menos 1 aplicación en estado "completado"** (para poder calificar)
5. **Al menos 1 calificación existente** de empleador a trabajador (para probar Task 14 y 17)

### Cómo Crear Datos de Prueba
```
1. Login como Empleador → Publicar oferta → Logout
2. Login como Trabajador → Postular a oferta → Logout
3. Login como Empleador → Aceptar postulación → Marcar como completado → Calificar trabajador → Logout
4. Login como Trabajador → Listo para probar
```

---

## Task 14: Vista de Reseñas Recibidas

### Caso 14.1: Acceso a pestaña Reseñas
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Login como trabajador | Dashboard carga correctamente | ⬜ |
| 2 | Ir a "Mi Perfil" | Página perfil-trabajador.html carga | ⬜ |
| 3 | Click en pestaña "⭐ Reseñas" | Tab se activa y muestra contenido | ⬜ |

### Caso 14.2: Resumen de calificaciones (con reseñas)
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Navegar a pestaña Reseñas | Sección resumen visible | ⬜ |
| 2 | Verificar promedio | Número grande con formato X.X | ⬜ |
| 3 | Verificar estrellas | 5 estrellas (llenas/vacías según promedio) | ⬜ |
| 4 | Verificar total | Texto "X reseña(s)" correcto | ⬜ |
| 5 | Verificar distribución | 5 barras (5★ a 1★) con porcentajes | ⬜ |

### Caso 14.3: Lista de reseñas
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Verificar cards de reseñas | Cards con borde izquierdo verde | ⬜ |
| 2 | Verificar datos en card | Nombre empleador, trabajo, estrellas, fecha | ⬜ |
| 3 | Verificar comentario | Comentario en itálica con comillas | ⬜ |
| 4 | Verificar botón responder | Botón "💬 Responder" visible si no hay respuesta | ⬜ |

### Caso 14.4: Estado vacío (sin reseñas)
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Login con trabajador sin reseñas | Tab Reseñas accesible | ⬜ |
| 2 | Click en tab Reseñas | Empty state visible | ⬜ |
| 3 | Verificar mensaje | "Aún no has recibido reseñas" | ⬜ |

### Caso 14.5: Link a historial
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | En tab Reseñas, buscar botón "📋 Ver Historial Completo" | Botón visible | ⬜ |
| 2 | Click en botón | Navega a historial-calificaciones.html | ⬜ |

---

## Task 15: Calificación Bidireccional (Trabajador → Empleador)

### Caso 15.1: Visibilidad del botón calificar
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Login como trabajador | Dashboard carga | ⬜ |
| 2 | Ir a "Mis Postulaciones" | Lista de aplicaciones | ⬜ |
| 3 | Buscar aplicación con estado "Completado" | Card con badge 🏁 Completado | ⬜ |
| 4 | Verificar botón | "⭐ Calificar Empleador" visible | ⬜ |

### Caso 15.2: Abrir modal de calificación
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Click "⭐ Calificar Empleador" | Modal se abre | ⬜ |
| 2 | Verificar header | "⭐ Calificar Empleador" | ⬜ |
| 3 | Verificar info empleador | Nombre y trabajo mostrados | ⬜ |
| 4 | Verificar estrellas | 5 estrellas vacías (☆) | ⬜ |
| 5 | Verificar textarea | Campo comentario vacío, placeholder visible | ⬜ |
| 6 | Verificar botón enviar | Deshabilitado inicialmente | ⬜ |

### Caso 15.3: Selección de estrellas
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Hover sobre estrella 3 | Estrellas 1-3 cambian color (hover) | ⬜ |
| 2 | Click en estrella 4 | Estrellas 1-4 llenas (★), texto "Bueno" | ⬜ |
| 3 | Click en estrella 5 | Estrellas 1-5 llenas (★), texto "Excelente" | ⬜ |
| 4 | Verificar botón enviar | Ahora habilitado | ⬜ |

### Caso 15.4: Enviar calificación exitosa
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Seleccionar 5 estrellas | Estrellas llenas | ⬜ |
| 2 | Escribir comentario (opcional) | Contador de caracteres actualiza | ⬜ |
| 3 | Click "⭐ Enviar Calificación" | Botón muestra "⏳ Enviando..." | ⬜ |
| 4 | Esperar respuesta | Toast "¡Gracias por calificar a [Nombre]!" | ⬜ |
| 5 | Verificar modal | Modal se cierra automáticamente | ⬜ |
| 6 | Verificar card | Botón cambia a "★ Ya calificaste" | ⬜ |

### Caso 15.5: Validación sin estrellas
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Abrir modal | Modal visible | ⬜ |
| 2 | NO seleccionar estrellas | Botón deshabilitado | ⬜ |
| 3 | Intentar enviar (si botón habilitado) | Toast error "Selecciona una calificación" | ⬜ |

### Caso 15.6: Ya calificado
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Buscar aplicación ya calificada | Card con "★ Ya calificaste" | ⬜ |
| 2 | Verificar que NO hay botón calificar | Solo badge, no botón | ⬜ |

### Caso 15.7: Cerrar modal
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Abrir modal, click botón ✕ | Modal se cierra | ⬜ |
| 2 | Abrir modal, click "Cancelar" | Modal se cierra | ⬜ |
| 3 | Abrir modal, presionar ESC | Modal se cierra | ⬜ |

---

## Task 16: Historial Completo de Calificaciones

### Caso 16.1: Acceso a la página
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Login como trabajador | Dashboard carga | ⬜ |
| 2 | Ir a perfil → tab Reseñas → "Ver Historial" | Página historial-calificaciones.html | ⬜ |
| 3 | Verificar header | "⭐ Historial de Calificaciones" | ⬜ |

### Caso 16.2: Tabs Recibidas/Dadas
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Verificar tabs | "📥 Recibidas" y "📤 Dadas" visibles | ⬜ |
| 2 | Tab "Recibidas" activo por defecto | Tab azul/seleccionado | ⬜ |
| 3 | Click "📤 Dadas" | Tab cambia, lista se actualiza | ⬜ |
| 4 | Click "📥 Recibidas" | Vuelve a lista de recibidas | ⬜ |

### Caso 16.3: Filtros
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Verificar filtro puntuación | Dropdown con opciones 1-5 estrellas | ⬜ |
| 2 | Seleccionar "5 estrellas" | Lista filtra solo 5★ | ⬜ |
| 3 | Verificar filtro fecha | Dropdown con 7 días, 30 días, 3 meses | ⬜ |
| 4 | Seleccionar "Últimos 7 días" | Lista filtra por fecha | ⬜ |
| 5 | Click "🔄 Limpiar" | Filtros se resetean, lista completa | ⬜ |

### Caso 16.4: Cards de calificación
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Verificar card recibida | Borde verde, avatar 👤 | ⬜ |
| 2 | Verificar card dada | Borde azul, avatar 🏢 | ⬜ |
| 3 | Verificar datos | Nombre, trabajo, estrellas, fecha, comentario | ⬜ |
| 4 | Verificar respuesta (si existe) | Sección "Tu respuesta:" visible | ⬜ |

### Caso 16.5: Estado vacío
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Tab "Dadas" sin calificaciones | Empty state | ⬜ |
| 2 | Mensaje correcto | "No has dado calificaciones" | ⬜ |

### Caso 16.6: Botón volver
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Click "← Volver al Perfil" | Navega a perfil-trabajador.html | ⬜ |

---

## Task 17: Responder a Calificaciones Recibidas

### Caso 17.1: Botón responder visible
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Ir a perfil → tab Reseñas | Lista de reseñas | ⬜ |
| 2 | Buscar reseña SIN respuesta | Botón "💬 Responder" visible | ⬜ |
| 3 | Buscar reseña CON respuesta | NO hay botón, solo texto de respuesta | ⬜ |

### Caso 17.2: Abrir modal responder
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Click "💬 Responder" | Modal se abre | ⬜ |
| 2 | Verificar header | "💬 Responder Reseña" | ⬜ |
| 3 | Verificar preview | Nombre empleador + estrellas + comentario | ⬜ |
| 4 | Verificar textarea | Campo vacío con placeholder | ⬜ |
| 5 | Verificar contador | "0/300" visible | ⬜ |

### Caso 17.3: Escribir respuesta
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Escribir texto | Contador actualiza en tiempo real | ⬜ |
| 2 | Escribir 300 caracteres | Contador muestra "300/300" | ⬜ |
| 3 | Intentar escribir más | No permite (maxlength) | ⬜ |

### Caso 17.4: Enviar respuesta exitosa
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Escribir respuesta | Texto en textarea | ⬜ |
| 2 | Click "💬 Enviar Respuesta" | Botón muestra "⏳ Enviando..." | ⬜ |
| 3 | Esperar respuesta | Toast "¡Respuesta enviada!" | ⬜ |
| 4 | Verificar modal | Modal se cierra | ⬜ |
| 5 | Verificar card | Respuesta visible, botón desaparece | ⬜ |

### Caso 17.5: Validación sin texto
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Abrir modal | Modal visible | ⬜ |
| 2 | Dejar textarea vacío | - | ⬜ |
| 3 | Click "Enviar Respuesta" | Toast error "Escribe una respuesta" | ⬜ |

### Caso 17.6: Cerrar modal
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Abrir modal, click ✕ | Modal se cierra | ⬜ |
| 2 | Abrir modal, click "Cancelar" | Modal se cierra | ⬜ |
| 3 | Abrir modal, presionar ESC | Modal se cierra | ⬜ |

---

## Pruebas de Integración

### Caso INT.1: Flujo completo calificación bidireccional
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Empleador califica trabajador (Task 13) | Calificación guardada | ⬜ |
| 2 | Trabajador ve reseña en perfil (Task 14) | Reseña visible en tab | ⬜ |
| 3 | Trabajador responde reseña (Task 17) | Respuesta guardada | ⬜ |
| 4 | Trabajador califica empleador (Task 15) | Calificación guardada | ⬜ |
| 5 | Trabajador ve historial (Task 16) | Ambas calificaciones visibles | ⬜ |

### Caso INT.2: Actualización de promedios
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Empleador con 0 calificaciones | Sin badge de calificación | ⬜ |
| 2 | Trabajador califica empleador con 5★ | - | ⬜ |
| 3 | Verificar perfil empleador en Firestore | `calificacionPromedio: 5`, `totalCalificaciones: 1` | ⬜ |

---

## Pruebas Responsive (Mobile)

### Caso MOB.1: Perfil trabajador - Tab Reseñas
| # | Dispositivo | Verificar | Estado |
|---|-------------|-----------|--------|
| 1 | iPhone SE (375px) | Tabs hacen scroll horizontal | ⬜ |
| 2 | iPhone 12 (390px) | Cards de reseña ocupan 100% ancho | ⬜ |
| 3 | iPad (768px) | Layout adapta correctamente | ⬜ |

### Caso MOB.2: Modal calificación empleador
| # | Dispositivo | Verificar | Estado |
|---|-------------|-----------|--------|
| 1 | iPhone SE | Modal ocupa 95% ancho | ⬜ |
| 2 | iPhone SE | Estrellas tienen tamaño táctil (44px) | ⬜ |
| 3 | iPhone SE | Botones son accesibles | ⬜ |

### Caso MOB.3: Historial calificaciones
| # | Dispositivo | Verificar | Estado |
|---|-------------|-----------|--------|
| 1 | iPhone SE | Tabs ocupan 50% cada uno | ⬜ |
| 2 | iPhone SE | Filtros en columna | ⬜ |
| 3 | iPhone SE | Cards legibles | ⬜ |

---

## Pruebas de Error

### Caso ERR.1: Sin conexión
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Desactivar internet | - | ⬜ |
| 2 | Intentar calificar empleador | Toast error de conexión | ⬜ |
| 3 | Intentar responder reseña | Toast error de conexión | ⬜ |

### Caso ERR.2: Índice Firestore pendiente
| # | Paso | Resultado Esperado | Estado |
|---|------|-------------------|--------|
| 1 | Primera vez cargando historial | Si falla índice, mensaje amigable | ⬜ |
| 2 | Mensaje | "Configurando sistema..." | ⬜ |

---

## Checklist Final

- [ ] Task 14: Vista reseñas funciona correctamente
- [ ] Task 15: Calificación bidireccional funciona
- [ ] Task 16: Historial muestra todas las calificaciones
- [ ] Task 17: Responder reseñas funciona
- [ ] Todos los toasts muestran mensajes correctos
- [ ] Modales se cierran con ESC, ✕, y Cancelar
- [ ] Responsive funciona en móvil
- [ ] No hay errores en consola del navegador
- [ ] Datos se guardan correctamente en Firestore

---

## Notas de Ejecución

**Fecha de ejecución:** _______________
**Ejecutado por:** _______________
**Ambiente:** Local / Producción
**Navegador:** _______________
**Dispositivo móvil:** _______________

### Bugs encontrados:
1. _______________
2. _______________
3. _______________

### Observaciones:
_______________
