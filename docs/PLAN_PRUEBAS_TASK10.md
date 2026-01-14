# Plan de Pruebas - Task 10: Geocoding Ofertas

**Fecha:** 14 Enero 2026
**Versión:** 1.0
**Tester:** Joel

---

## Resumen

Este plan cubre las pruebas para las funcionalidades de geocoding implementadas en el formulario de publicar ofertas.

---

## 1. Pruebas del Formulario de Ubicación

### 1.1 Selección de UBIGEO (Departamento → Provincia → Distrito)

| # | Caso de Prueba | Pasos | Resultado Esperado | Estado |
|---|----------------|-------|-------------------|--------|
| 1.1.1 | Cargar departamentos | 1. Abrir publicar-oferta.html | Lista de 25 departamentos cargada | ⬜ |
| 1.1.2 | Seleccionar departamento | 1. Seleccionar "Lima" en departamento | Provincias de Lima se cargan automáticamente | ⬜ |
| 1.1.3 | Seleccionar provincia | 1. Seleccionar "Lima" en provincia | Distritos de Lima se cargan automáticamente | ⬜ |
| 1.1.4 | Seleccionar distrito | 1. Seleccionar "Miraflores" en distrito | Mapa se centra en Miraflores con marcador | ⬜ |
| 1.1.5 | Cambiar departamento | 1. Cambiar de "Lima" a "Arequipa" | Provincias y distritos se resetean | ⬜ |
| 1.1.6 | Validación campos vacíos | 1. Dejar departamento vacío, 2. Click "Siguiente" | Mensaje de error en departamento | ⬜ |

---

### 1.2 Mini-Mapa Preview

| # | Caso de Prueba | Pasos | Resultado Esperado | Estado |
|---|----------------|-------|-------------------|--------|
| 1.2.1 | Mapa inicial | 1. Abrir publicar-oferta.html, 2. Ir a Paso 2 | Mapa muestra placeholder "Selecciona un distrito" | ⬜ |
| 1.2.2 | Mapa se actualiza con distrito | 1. Seleccionar Lima > Lima > Miraflores | Mapa se centra en Miraflores, marcador visible | ⬜ |
| 1.2.3 | Info de ubicación | 1. Seleccionar un distrito | Texto "Miraflores, Lima, Lima" aparece debajo del mapa | ⬜ |
| 1.2.4 | Zoom del mapa | 1. Seleccionar distrito, 2. Usar controles de zoom | Zoom funciona correctamente | ⬜ |
| 1.2.5 | Mapa sin conexión | 1. Desconectar internet, 2. Cargar página | Placeholder visible, sin errores en consola bloqueantes | ⬜ |

---

### 1.3 Google Places Autocomplete

| # | Caso de Prueba | Pasos | Resultado Esperado | Estado |
|---|----------------|-------|-------------------|--------|
| 1.3.1 | Autocomplete aparece | 1. Escribir "Av. Larco" en campo dirección | Dropdown con sugerencias aparece | ⬜ |
| 1.3.2 | Seleccionar dirección | 1. Escribir "Av. Larco 345", 2. Seleccionar sugerencia | Dirección completa se llena, mapa se actualiza | ⬜ |
| 1.3.3 | Solo Perú | 1. Escribir "Times Square New York" | No debe mostrar resultados fuera de Perú | ⬜ |
| 1.3.4 | Coordenadas precisas | 1. Seleccionar dirección del autocomplete | Mapa muestra ubicación exacta (no solo distrito) | ⬜ |
| 1.3.5 | Campo opcional | 1. Dejar campo vacío, 2. Completar formulario | Formulario se envía correctamente sin dirección exacta | ⬜ |
| 1.3.6 | Escribir sin seleccionar | 1. Escribir dirección manualmente sin seleccionar | Se guarda el texto pero sin coordenadas precisas | ⬜ |

---

## 2. Pruebas de Validación

### 2.1 Validación de Bounds Perú

| # | Caso de Prueba | Pasos | Resultado Esperado | Estado |
|---|----------------|-------|-------------------|--------|
| 2.1.1 | Coordenadas válidas Lima | Coords: -12.0464, -77.0428 | Validación pasa (dentro de Perú) | ⬜ |
| 2.1.2 | Coordenadas válidas Cusco | Coords: -13.5320, -71.9675 | Validación pasa (dentro de Perú) | ⬜ |
| 2.1.3 | Coordenadas inválidas (Chile) | Coords: -33.4489, -70.6693 | Validación falla, warning mostrado | ⬜ |
| 2.1.4 | Coordenadas inválidas (Brasil) | Coords: -23.5505, -46.6333 | Validación falla, warning mostrado | ⬜ |
| 2.1.5 | Coordenadas límite norte | Coords: -0.0389, -75.0 | Validación pasa (frontera Ecuador) | ⬜ |
| 2.1.6 | Coordenadas límite sur | Coords: -18.3516, -70.0 | Validación pasa (frontera Chile) | ⬜ |

---

### 2.2 Validación de Formulario

| # | Caso de Prueba | Pasos | Resultado Esperado | Estado |
|---|----------------|-------|-------------------|--------|
| 2.2.1 | Campos obligatorios vacíos | 1. Dejar todos los campos vacíos, 2. Click Siguiente | Errores en título, categoría, descripción | ⬜ |
| 2.2.2 | Título muy corto | 1. Escribir "Trabajo" (7 chars) | Error: "mínimo 10 caracteres" | ⬜ |
| 2.2.3 | Descripción muy corta | 1. Escribir 30 caracteres | Error: "mínimo 50 caracteres" | ⬜ |
| 2.2.4 | Ubicación incompleta | 1. Seleccionar solo departamento | Error en provincia y distrito | ⬜ |
| 2.2.5 | Salario vacío | 1. Dejar salario vacío en paso 2 | Error: "El salario es obligatorio" | ⬜ |

---

## 3. Pruebas de Guardado en Firestore

### 3.1 Estructura de Datos

| # | Caso de Prueba | Pasos | Resultado Esperado | Estado |
|---|----------------|-------|-------------------|--------|
| 3.1.1 | Guardar con UBIGEO solamente | 1. Completar solo UBIGEO, 2. Publicar | Ubicación guardada con coordenadas del distrito | ⬜ |
| 3.1.2 | Guardar con dirección exacta | 1. Usar autocomplete, 2. Publicar | Ubicación guardada con coordenadas precisas | ⬜ |
| 3.1.3 | Guardar con referencia | 1. Agregar referencia, 2. Publicar | Campo referencia guardado correctamente | ⬜ |
| 3.1.4 | Flag es_ubicacion_precisa | 1. Usar autocomplete, 2. Verificar en Firestore | Campo es_ubicacion_precisa = true | ⬜ |
| 3.1.5 | Texto completo correcto | 1. Publicar oferta | texto_completo contiene dirección legible | ⬜ |

**Verificar en Firestore Console que la estructura sea:**
```javascript
ubicacion: {
    departamento: "string",
    provincia: "string",
    distrito: "string",
    direccion_exacta: "string",
    referencia: "string",
    coordenadas: { lat: number, lng: number },
    texto_completo: "string",
    es_ubicacion_precisa: boolean
}
```

---

## 4. Pruebas de Migración

### 4.1 Script de Migración

| # | Caso de Prueba | Pasos | Resultado Esperado | Estado |
|---|----------------|-------|-------------------|--------|
| 4.1.1 | Migrar oferta con string | 1. Crear oferta antigua con ubicacion="Miraflores", 2. Ejecutar migración | Convertida a objeto con coordenadas | ⬜ |
| 4.1.2 | Omitir oferta ya migrada | 1. Ejecutar migración 2 veces | Segunda vez: "ya migradas" incrementa | ⬜ |
| 4.1.3 | Migrar oferta sin ubicación | 1. Oferta con ubicacion=null | Convertida con Lima centro por defecto | ⬜ |
| 4.1.4 | Extracción de distrito | Ubicación: "Trabajo en Miraflores cerca al parque" | Distrito extraído: "Miraflores" | ⬜ |
| 4.1.5 | Resumen de migración | 1. Ejecutar migración completa | Console muestra: migradas, omitidas, errores | ⬜ |

**Comando para ejecutar migración:**
```javascript
import('./js/utils/migrar-ofertas.js').then(m => m.migrarOfertas());
```

---

## 5. Pruebas de Edición

### 5.1 Editar Oferta Existente

| # | Caso de Prueba | Pasos | Resultado Esperado | Estado |
|---|----------------|-------|-------------------|--------|
| 5.1.1 | Cargar oferta para editar | 1. Click "Editar" en una oferta | Formulario pre-llenado con datos existentes | ⬜ |
| 5.1.2 | Referencia pre-llenada | 1. Editar oferta con referencia | Campo referencia muestra valor guardado | ⬜ |
| 5.1.3 | Actualizar ubicación | 1. Cambiar distrito, 2. Guardar | Nueva ubicación guardada correctamente | ⬜ |
| 5.1.4 | Mantener coordenadas | 1. Editar sin cambiar ubicación, 2. Guardar | Coordenadas originales mantenidas | ⬜ |

---

## 6. Pruebas de UI/UX

### 6.1 Responsive Design

| # | Caso de Prueba | Dispositivo | Resultado Esperado | Estado |
|---|----------------|-------------|-------------------|--------|
| 6.1.1 | Mapa en móvil | iPhone 12 (390px) | Mapa visible, altura 150px | ⬜ |
| 6.1.2 | Mapa en tablet | iPad (768px) | Mapa visible, altura 180px | ⬜ |
| 6.1.3 | Mapa en desktop | Desktop (1024px+) | Mapa visible, altura 200px | ⬜ |
| 6.1.4 | Autocomplete en móvil | iPhone 12 | Dropdown aparece correctamente | ⬜ |
| 6.1.5 | Combos UBIGEO en móvil | iPhone 12 | Selects ocupan ancho completo | ⬜ |

### 6.2 Estados Visuales

| # | Caso de Prueba | Pasos | Resultado Esperado | Estado |
|---|----------------|-------|-------------------|--------|
| 6.2.1 | Loading departamentos | 1. Cargar página | "Cargando departamentos..." visible brevemente | ⬜ |
| 6.2.2 | Loading provincias | 1. Seleccionar departamento | "Cargando provincias..." visible brevemente | ⬜ |
| 6.2.3 | Placeholder mapa | 1. Antes de seleccionar distrito | Icono de mapa y texto placeholder | ⬜ |
| 6.2.4 | Info ubicación | 1. Después de seleccionar | Badge con texto de ubicación visible | ⬜ |
| 6.2.5 | Error de campo | 1. Dejar campo vacío, 2. Siguiente | Borde rojo y mensaje de error | ⬜ |

---

## 7. Pruebas de Rendimiento

| # | Caso de Prueba | Métrica | Umbral Aceptable | Estado |
|---|----------------|---------|------------------|--------|
| 7.1 | Carga inicial página | Time to Interactive | < 3 segundos | ⬜ |
| 7.2 | Carga Google Maps API | Tiempo de carga | < 2 segundos | ⬜ |
| 7.3 | Respuesta autocomplete | Tiempo primera sugerencia | < 500ms | ⬜ |
| 7.4 | Actualización mapa | Tiempo para centrar/marker | < 300ms | ⬜ |
| 7.5 | Carga UBIGEO | Tiempo cargar departamentos | < 1 segundo | ⬜ |

---

## 8. Pruebas Cross-Browser

| # | Navegador | Versión | Pruebas a Ejecutar | Estado |
|---|-----------|---------|-------------------|--------|
| 8.1 | Chrome | Latest | Todas las pruebas 1-7 | ⬜ |
| 8.2 | Firefox | Latest | Todas las pruebas 1-7 | ⬜ |
| 8.3 | Safari | Latest | Todas las pruebas 1-7 | ⬜ |
| 8.4 | Edge | Latest | Todas las pruebas 1-7 | ⬜ |
| 8.5 | Safari iOS | iPhone | Pruebas 1, 2, 6 | ⬜ |
| 8.6 | Chrome Android | Samsung | Pruebas 1, 2, 6 | ⬜ |

---

## 9. Casos de Error

| # | Caso de Prueba | Pasos | Resultado Esperado | Estado |
|---|----------------|-------|-------------------|--------|
| 9.1 | Sin conexión a internet | 1. Desconectar, 2. Intentar publicar | Toast error, datos no se pierden | ⬜ |
| 9.2 | API Key inválida | 1. Usar key incorrecta | Mapa no carga, formulario sigue funcionando | ⬜ |
| 9.3 | Firestore no disponible | 1. Simular error Firestore | Toast error, botón se reactiva | ⬜ |
| 9.4 | Sesión expirada | 1. Esperar timeout, 2. Publicar | Redirige a login | ⬜ |
| 9.5 | Usuario no empleador | 1. Login como trabajador, 2. Ir a publicar | Redirige a dashboard con mensaje | ⬜ |

---

## 10. Checklist Final

### Pre-requisitos
- [ ] Usuario empleador logueado
- [ ] Conexión a internet estable
- [ ] DevTools abierto para ver logs

### Pruebas Críticas (DEBE PASAR)
- [ ] 1.1.4 - Seleccionar distrito actualiza mapa
- [ ] 1.3.2 - Autocomplete selecciona y actualiza mapa
- [ ] 2.1.1 - Coordenadas Lima son válidas
- [ ] 3.1.1 - Oferta se guarda con coordenadas
- [ ] 5.1.1 - Edición carga datos correctamente

### Pruebas Importantes (DEBERÍA PASAR)
- [ ] 1.2.3 - Info ubicación visible
- [ ] 1.3.3 - Solo sugerencias de Perú
- [ ] 4.1.1 - Migración funciona
- [ ] 6.1.1 - Responsive en móvil

### Pruebas Deseables (NICE TO HAVE)
- [ ] 7.3 - Autocomplete < 500ms
- [ ] 9.1 - Manejo sin conexión

---

## Registro de Resultados

| Fecha | Tester | Pruebas Ejecutadas | Pasaron | Fallaron | Notas |
|-------|--------|-------------------|---------|----------|-------|
| | | | | | |

---

## Bugs Encontrados

| # | Descripción | Severidad | Estado | Notas |
|---|-------------|-----------|--------|-------|
| | | | | |

---

**Leyenda de Estados:**
- ⬜ Pendiente
- ✅ Pasó
- ❌ Falló
- ⏭️ Omitida

**Severidad de Bugs:**
- 🔴 Crítico - Bloquea funcionalidad
- 🟠 Alto - Funcionalidad afectada
- 🟡 Medio - Workaround disponible
- 🟢 Bajo - Cosmético/menor
