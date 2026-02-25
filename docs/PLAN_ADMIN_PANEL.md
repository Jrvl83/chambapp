# PLAN: Panel de Administración — Tasks 45-48

**Estado:** ✅ Completado (sesión 24 — 25 feb 2026)
**Prioridad:** Media
**Estimado:** 1-2 sesiones

---

## Contexto

ChambaYa necesita herramientas de moderación antes del lanzamiento (mayo 2026). El panel es solo para el fundador — no hay equipo, no hay roles múltiples. Debe ser funcional y rápido de construir, sin over-engineering.

**Principios:**
- Una sola página (`admin.html`), navegación por tabs — no múltiples páginas
- Protección por UID hardcodeado en Firestore rules (sin sistema de roles complejo)
- Mismo stack y design system que el resto de la app
- Datos cargados bajo demanda al cambiar de tab

---

## Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `admin.html` | Página principal del panel |
| `js/admin/index.js` | Orquestador: auth check, tabs, init |
| `js/admin/stats.js` | Task 45 — Stats globales (conteos) |
| `js/admin/metricas.js` | Task 45b — Conversión y crecimiento |
| `js/admin/usuarios.js` | Task 46 — Gestión de usuarios + bloqueo |
| `js/admin/planes.js` | Task 46b — Gestión de plan premium + sorteos ⚠️ POST-PAGOS |
| `js/admin/ofertas.js` | Task 47 — Gestión de ofertas |
| `js/admin/reportes.js` | Task 48 — Sistema de reportes |
| `css/admin.css` | Estilos exclusivos del panel |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `firestore.rules` | Agregar `isAdmin()` + colecciones `reportes`, `auditoria` |
| `js/components/oferta-card.js` | Agregar botón "Reportar" en cards |
| `perfil-publico.html` + `js/perfil-publico/index.js` | Agregar botón "Reportar perfil" + badge "Verificado ✓" |
| `perfil-trabajador.html` + `js/perfil-trabajador/index.js` | Botón "Solicitar verificación" (post-pagos) + badge |
| `mis-aplicaciones.html` (cards candidatos) | Badge "Verificado ✓" en cards (post-pagos) |

---

## TASK 45 — Stats Globales (Dashboard Admin)

La tab "Stats" se divide en dos secciones: conteos básicos (stats.js) y métricas de conversión + crecimiento (metricas.js). Ambas cargan en paralelo al entrar al panel.

### Vista completa

```
┌─────────────────────────────────────┐
│  👤 Usuarios    💼 Ofertas          │
│  ──────────    ──────────           │
│  247 total     89 activas           │
│  180 trab.     34 en curso          │
│  67 empl.      156 completadas      │
│                23 caducadas         │
├─────────────────────────────────────┤
│  📋 Aplicaciones   ⭐ Calificaciones │
│  ─────────────    ──────────────    │
│  1,234 total       4.3 promedio     │
│  89 pendientes     312 reseñas      │
│  445 completadas                    │
├─────────────────────────────────────┤
│  🚨 Reportes Pendientes             │
│  ────────────────────               │
│   3 sin revisar → [Ver reportes]    │
├─────────────────────────────────────┤
│  📈 CONVERSIÓN                      │
│  ─────────────────────────────────  │
│  Postulación → Aceptado   36.2%     │
│  ████████░░░░░░░░░░░░░░░░           │
│  Aceptado → Completado    78.5%     │
│  ████████████████░░░░░░░            │
│  Oferta → Resolución      64.1%     │
│  (% ofertas con ≥1 aceptado)        │
│  ████████████░░░░░░░░░░░            │
├─────────────────────────────────────┤
│  🌱 CRECIMIENTO                     │
│  ─────────────────────────────────  │
│           7 días   30 días          │
│  Usuarios   +12     +47    ↑        │
│  Ofertas    +8      +31    ↑        │
│  Apps       +89     +312   ↑        │
└─────────────────────────────────────┘
```

### Implementación (`js/admin/stats.js`) — conteos básicos

```js
// Queries en paralelo con Promise.all
const [snapUsuarios, snapOfertas, snapAplicaciones,
       snapCalificaciones, snapReportes] = await Promise.all([
    getCountFromServer(collection(db, 'usuarios')),
    getDocs(collection(db, 'ofertas')),
    getCountFromServer(collection(db, 'aplicaciones')),
    getDocs(query(collection(db, 'calificaciones'), limit(500))),
    getDocs(query(collection(db, 'reportes'),
        where('estado', '==', 'pendiente')))
]);
```

**Nota:** `getCountFromServer()` de Firebase — más eficiente que traer todos los docs.
Para ofertas necesitamos el desglose por estado, así que traemos los docs y agrupamos en el cliente.

---

## TASK 45b — Métricas de Conversión y Crecimiento

### Módulo `js/admin/metricas.js`

Separado de stats.js para mantener cada archivo bajo 500 líneas y separar responsabilidades.

---

### Métricas de Conversión

Calculadas sobre los datos ya cargados (sin queries extra):

| Métrica | Fórmula | Ejemplo |
|---------|---------|---------|
| Postulación → Aceptado | `aceptadas / total_apps * 100` | 36.2% |
| Aceptado → Completado | `completadas / aceptadas * 100` | 78.5% |
| Oferta → Resolución | `ofertas_con_aceptado / total_ofertas * 100` | 64.1% |

```js
export function calcularConversion(snapAplicaciones, snapOfertas) {
    const apps = snapAplicaciones.docs.map(d => d.data());
    const total = apps.length;
    const aceptadas = apps.filter(a => a.estado === 'aceptado' || a.estado === 'completado').length;
    const completadas = apps.filter(a => a.estado === 'completado').length;

    const ofertas = snapOfertas.docs.map(d => d.data());
    const conAceptado = ofertas.filter(o => (o.aceptadosCount || 0) > 0).length;

    return {
        tasaAceptacion: total > 0 ? (aceptadas / total * 100).toFixed(1) : 0,
        tasaCompletacion: aceptadas > 0 ? (completadas / aceptadas * 100).toFixed(1) : 0,
        tasaResolucion: ofertas.length > 0 ? (conAceptado / ofertas.length * 100).toFixed(1) : 0,
    };
}
```

**Visualización:** Barras CSS puras (sin librerías externas), ancho = `${tasa}%`.

```html
<!-- Template de barra de conversión -->
<div class="metrica-barra-label">
    <span>Postulación → Aceptado</span>
    <span class="metrica-valor">36.2%</span>
</div>
<div class="metrica-barra-track">
    <div class="metrica-barra-fill" style="width: 36.2%"></div>
</div>
```

---

### Métricas de Crecimiento

Requieren queries por rango de fechas. Se hacen con `getCountFromServer()` + `where('fechaCreacion', '>=', fecha)`.

**Campos confirmados en el código:**
- `usuarios` → `createdAt` (register.js:224, google-auth.js:69)
- `ofertas` → `fechaCreacion` (submit.js:252)
- `aplicaciones` → `fechaAplicacion` (postulacion.js:112)

```js
export async function cargarCrecimiento() {
    const ahora = new Date();
    const hace7d  = new Date(ahora - 7  * 24 * 60 * 60 * 1000);
    const hace30d = new Date(ahora - 30 * 24 * 60 * 60 * 1000);

    const [u7, u30, o7, o30, a7, a30] = await Promise.all([
        getCountFromServer(query(collection(db, 'usuarios'),
            where('createdAt', '>=', Timestamp.fromDate(hace7d)))),
        getCountFromServer(query(collection(db, 'usuarios'),
            where('createdAt', '>=', Timestamp.fromDate(hace30d)))),
        getCountFromServer(query(collection(db, 'ofertas'),
            where('fechaCreacion', '>=', Timestamp.fromDate(hace7d)))),
        getCountFromServer(query(collection(db, 'ofertas'),
            where('fechaCreacion', '>=', Timestamp.fromDate(hace30d)))),
        getCountFromServer(query(collection(db, 'aplicaciones'),
            where('fechaAplicacion', '>=', Timestamp.fromDate(hace7d)))),
        getCountFromServer(query(collection(db, 'aplicaciones'),
            where('fechaAplicacion', '>=', Timestamp.fromDate(hace30d)))),
    ]);

    return {
        usuarios:  { d7: u7.data().count,  d30: u30.data().count },
        ofertas:   { d7: o7.data().count,  d30: o30.data().count },
        apps:      { d7: a7.data().count,  d30: a30.data().count },
    };
}
```

**Visualización:** Tabla simple con columnas "7 días" y "30 días". Sin gráficos de tendencia por ahora (requeriría datos históricos almacenados).

**⚠️ Nota sobre índices:** Las queries `where('fechaCreacion', '>=', ...)` en colecciones compuestas pueden requerir índices en Firestore. Si fallan al desplegar, crear el índice desde Firebase Console (el error en consola da el link directo).

---

## TASK 46 — Gestión de Usuarios

### Vista
Tab "Usuarios". Carga bajo demanda (solo al hacer clic en el tab).

Cada card de usuario muestra su plan actual y permite acceder a la gestión de premium.

```
[🔍 Buscar por nombre o email...    ]
                              [🎁 Sorteo]

TRABAJADORES (180)          EMPLEADORES (67)
─────────────────────────────────────────
│ 👤 Juan Pérez           ⭐ PREMIUM    │
│ juan@email.com           hasta 15 mar │
│ Lima · Registrado 10 feb              │
│ 12 apps · ⭐ 4.5                      │
│      [Ver perfil] [Plan] [Bloquear]   │
├───────────────────────────────────────┤
│ 👤 María García         FREE          │
│ maria@email.com                       │
│ Lima · Registrado 05 ene              │
│ 3 apps · ⭐ 4.8                       │
│      [Ver perfil] [Plan] [Bloquear]   │
├───────────────────────────────────────┤
│ 👤 Carlos López  🚫 BLOQUEADO         │
│ ...                                   │
│         [Ver perfil] [Desbloquear]    │
```

### Funciones de `js/admin/usuarios.js`

```js
// Cargar usuarios (paginados, 20 por vez)
export async function cargarUsuarios(tipo = null, ultimoDoc = null)

// Buscar por nombre o email (client-side sobre los cargados)
export function filtrarUsuarios(termino, lista)

// Bloquear/desbloquear — escribe campo bloqueado: true/false en Firestore
export async function toggleBloqueoUsuario(uid, bloquear)
```

**Efecto del bloqueo:** En `onAuthStateChanged` de `dashboard/index.js`, agregar check:
```js
if (usuario.bloqueado) {
    await signOut(auth);
    window.location.href = 'login.html?bloqueado=1';
}
```
Y en `login.html` mostrar mensaje si `?bloqueado=1` en URL.

---

## TASK 46b — Gestión de Plan Premium y Sorteos

Módulo separado (`js/admin/planes.js`) para no inflar `usuarios.js`. Se invoca desde los botones [Plan] y [🎁 Sorteo] de la tab Usuarios.

---

### Modelo de datos en Firestore

Campos nuevos en el doc `usuarios/{uid}`:

```js
{
    plan: 'free' | 'premium',         // campo principal que chequean las features
    premiumHasta: Timestamp | null,    // null si es free o expiró
    premiumHistorial: [                // array de entradas, append-only
        {
            desde: Timestamp,
            hasta: Timestamp,
            meses: number,
            origen: 'pago' | 'admin' | 'sorteo',
            nota: string,              // ej: "Ganador sorteo febrero 2026"
            adminUid: string           // quién lo asignó
        }
    ]
}
```

**Integración con el sistema de pago futuro:** El pago escribe exactamente los mismos campos con `origen: 'pago'`. La verificación de premium activo es siempre la misma independientemente del origen:
```js
const esPremiumActivo = usuario.plan === 'premium'
    && usuario.premiumHasta?.toDate() > new Date();
```

---

### Modal "Gestionar Plan" — dos estados

**Usuario FREE:**
```
┌──────────────────────────────────┐
│  Gestionar Plan — Juan Pérez     │
│  Estado actual: FREE             │
│                                  │
│  Otorgar Premium                 │
│  Duración: [1 mes ▾]             │
│            (opciones: 1,2,3,6)   │
│                                  │
│  Nota interna (opcional)         │
│  [Ganador sorteo febrero 2026  ] │
│                                  │
│  Válido hasta: 25 mar 2026       │  ← se calcula en tiempo real
│                                  │
│  [Cancelar]  [✓ Otorgar Premium] │
└──────────────────────────────────┘
```

**Usuario PREMIUM:**
```
┌──────────────────────────────────┐
│  Gestionar Plan — María García   │
│  Estado actual: ⭐ PREMIUM       │
│  Válido hasta: 15 mar 2026       │
│                                  │
│  Extender                        │
│  Meses adicionales: [1 mes ▾]    │
│                                  │
│  Nota interna (opcional)         │
│  [                             ] │
│                                  │
│  Nueva fecha: 15 abr 2026        │  ← premiumHasta + meses elegidos
│                                  │
│  [Cancelar]  [✓ Extender Plan]   │
└──────────────────────────────────┘
```

### Funciones de `js/admin/planes.js`

```js
// Abre el modal con el estado correcto según el plan actual del usuario
export function abrirModalPlan(usuario)

// Otorga o extiende premium — unifica ambos casos
export async function gestionarPlanPremium(uid, meses, nota, premiumHastaActual)
// Lógica:
//   - Si free: desde = ahora, hasta = ahora + meses
//   - Si premium vigente: desde = premiumHasta actual, hasta = premiumHasta + meses
//   - Escribe plan, premiumHasta, y hace arrayUnion en premiumHistorial
//   - Registra en auditoria

// Revoca premium (por si acaso — uso raro)
export async function revocarPremium(uid, motivo)
```

**Escritura en Firestore:**
```js
await updateDoc(doc(db, 'usuarios', uid), {
    plan: 'premium',
    premiumHasta: Timestamp.fromDate(nuevaFecha),
    premiumHistorial: arrayUnion({
        desde: Timestamp.fromDate(desde),
        hasta: Timestamp.fromDate(nuevaFecha),
        meses,
        origen: 'admin',
        nota: nota || '',
        adminUid: auth.currentUser.uid
    })
});
// + entrada en auditoria
```

---

### Feature: Sorteo de Premium

Botón "🎁 Sorteo" en la cabecera de la tab Usuarios (visible solo con trabajadores filtrados).

**Flujo:**

```
1. Admin aplica filtros que quiera (ej: solo trabajadores de Lima)
2. Pulsa [🎁 Sorteo]
3. Modal pide:
   - Nº de ganadores (1–10)
   - Duración del premio (1, 2, 3 meses)
   - Nota para historial ("Sorteo febrero 2026")
4. Admin pulsa [Realizar sorteo]
5. Se eligen N usuarios al azar de la lista visible
6. Modal de confirmación muestra los ganadores:
   ┌─────────────────────────────────┐
   │  🎉 Ganadores del sorteo        │
   │  ─────────────────────────────  │
   │  1. Juan Pérez · juan@email.com │
   │  2. Ana Torres · ana@email.com  │
   │  3. Luis Ríos  · luis@email.com │
   │                                 │
   │  Premio: 2 meses Premium        │
   │  Nota: "Sorteo febrero 2026"    │
   │                                 │
   │  [Cancelar] [✓ Asignar a todos] │
   └─────────────────────────────────┘
7. Al confirmar: Promise.all() asigna premium a todos en paralelo
8. Toast: "Premium asignado a 3 usuarios ✓"
```

**Algoritmo de selección aleatoria:**
```js
// Fisher-Yates shuffle sobre una copia del array, tomar los primeros N
function elegirGanadores(lista, n) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia.slice(0, n);
}
```

**Nota:** La selección es sobre los usuarios ya cargados en el cliente (los que pasaron el filtro activo). Si hay más de 20 (paginados), solo se sortea entre los visibles — documentar esto claramente en la UI ("Sorteando entre 20 usuarios cargados").

---

## TASK 46c — Verificación de Antecedentes (Premium) ⚠️ POST-PAGOS

Beneficio exclusivo del plan Premium para trabajadores. El badge "Verificado ✓" (ya visible en el mockup de `screen.png`) indica que el trabajador pasó una revisión de antecedentes.

**Por qué solo premium:** El costo por verificación (~$2 USD via Truora) no se justifica para usuarios free. Premium lo absorbe como parte del valor del plan.

---

### Flujo completo

```
TRABAJADOR PREMIUM                    ADMIN
─────────────────────────────────     ────────────────────────────
1. Ve botón "Solicitar verificación"
   en su perfil (solo si es premium)

2. Sube foto de su certificado de
   antecedentes (PNP/Poder Judicial)
   + selecciona tipo

3. Estado: "En revisión ⏳"           4. Ve solicitud en tab "Verificaciones"
                                          del panel admin

                                      5. Revisa documento subido
                                         [Aprobar ✓] [Rechazar ✗]

6. Si aprobado:
   - Badge "Verificado ✓" aparece
     en su perfil, cards y perfil
     público
   - Notificación en la app

7. Vigencia: 12 meses desde aprobación
   (el certificado PNP vence, el badge
   también)
```

---

### Modelo de datos — campos nuevos en `usuarios/{uid}`

```js
{
    verificado: false | true,
    verificacionEstado: null | 'pendiente' | 'aprobado' | 'rechazado',
    verificacionHasta: Timestamp | null,   // 12 meses desde aprobación
    verificacionDoc: string | null,        // URL del certificado en Storage
    verificacionTipo: 'policial' | 'judicial' | 'ambos',
    verificacionFecha: Timestamp | null,   // fecha de aprobación
    verificacionRechazadoMotivo: string    // si fue rechazado
}
```

**Nota:** Solo trabajadores pueden solicitar verificación — no tiene sentido para empleadores.

---

### Panel admin — nueva sub-sección en tab Usuarios

Se agrega un selector de vista en la tab Usuarios:

```
[ Todos ] [ Trabajadores ] [ Empleadores ] [ ⚠️ Verificaciones (3) ]
```

Vista "Verificaciones":

```
⏳ PENDIENTES (3)
┌──────────────────────────────────────────┐
│ 👤 Juan Pérez · juan@email.com           │
│ Tipo: Antecedentes policiales            │
│ Solicitado: hace 2 horas                 │
│                                          │
│ [Ver documento]  [✓ Aprobar] [✗ Rechazar]│
└──────────────────────────────────────────┘

✅ APROBADOS (14)   ✗ RECHAZADOS (2)
```

---

### Funciones en `js/admin/planes.js` (mismo módulo que premium)

```js
// Cargar solicitudes de verificación pendientes
export async function cargarVerificaciones(estado = 'pendiente')

// Aprobar — escribe verificado:true + fecha + vigencia 12 meses
export async function aprobarVerificacion(uid)

// Rechazar — escribe estado rechazado + motivo
export async function rechazarVerificacion(uid, motivo)
```

---

### Dónde aparece el badge "Verificado ✓"

- `perfil-trabajador.html` — junto al nombre (solo lectura, el propio usuario lo ve)
- `perfil-publico.html` — visible para empleadores (el mayor impacto)
- Cards de trabajadores en `mis-aplicaciones.html` — confianza al ver candidatos

---

### Fase 2 — Automatización con Truora (post-escala)

Cuando el volumen lo justifique, reemplazar el flujo manual por:

```
Premium user solicita → llamada a Truora API → resultado automático →
badge asignado sin intervención del admin
```

El modelo de datos no cambia — solo cambia quién escribe el campo `verificado`.

---

## TASK 47 — Gestión de Ofertas

### Vista
Tab "Ofertas". Todas las ofertas de todos los empleadores.

```
[Todos ▾] [Estado ▾] [Más recientes ▾]

📋 "Carpintero urgente"          ACTIVA
   Luis Mendoza · Lima · 19 feb
   3 postulantes · S/. 80/día
                        [Ver] [Eliminar]

📋 "Limpieza oficinas"       EN CURSO
   ...
```

### Funciones de `js/admin/ofertas.js`

```js
// Cargar todas las ofertas (sin filtro de empleadorId)
export async function cargarTodasOfertas(estado = null, ultimoDoc = null)

// Eliminar oferta + notificar al empleador con toast (no email por ahora)
export async function eliminarOfertaAdmin(ofertaId, motivo)
```

**La eliminación registra en `auditoria`:**
```js
await addDoc(collection(db, 'auditoria'), {
    accion: 'eliminar_oferta',
    ofertaId,
    motivo,
    adminUid: auth.currentUser.uid,
    timestamp: serverTimestamp()
});
```

---

## TASK 48 — Sistema de Reportes

### Estructura de datos en Firestore

Nueva colección `reportes`:
```js
{
    tipo: 'oferta' | 'usuario',
    objetoId: string,          // ofertaId o uid reportado
    objetoTitulo: string,      // título oferta o nombre usuario (desnormalizado)
    reportadoPor: uid,
    motivo: 'inapropiado' | 'spam' | 'fraude' | 'otro',
    descripcion: string,       // opcional, max 300 chars
    estado: 'pendiente' | 'revisado',
    timestamp: serverTimestamp(),
    accionAdmin: string        // qué hizo el admin al resolverlo
}
```

### Botón "Reportar" — dónde aparece

**En `perfil-publico.html`** (empleador ve perfil de trabajador):
- Link discreto al fondo: "⚑ Reportar este perfil"

**En cards de ofertas** (dashboard trabajador / mapa):
- Ícono de bandera en el menú de 3 puntos de la card
- O link pequeño al abrir el detalle de la oferta

### Modal de reporte

Reutiliza `css/modal.css`. HTML mínimo:

```html
<div class="modal-body">
    <h3>Reportar contenido</h3>
    <p class="reporte-subtitulo" id="reporte-subtitulo"><!-- "Oferta: Carpintero urgente" --></p>

    <label class="form-label">Motivo</label>
    <select id="reporte-motivo" class="form-control">
        <option value="inapropiado">Contenido inapropiado</option>
        <option value="spam">Spam o duplicado</option>
        <option value="fraude">Posible fraude</option>
        <option value="otro">Otro</option>
    </select>

    <label class="form-label">Descripción (opcional)</label>
    <textarea id="reporte-descripcion" class="form-control"
              placeholder="Cuéntanos más..." maxlength="300" rows="3"></textarea>

    <button class="btn btn-danger btn-block" id="btn-enviar-reporte">
        Enviar reporte
    </button>
</div>
```

### Vista admin — tab Reportes

```
🚨 PENDIENTES (3)          ✅ REVISADOS (47)

┌──────────────────────────────────────┐
│ 🚩 OFERTA · "Limpieza casas"         │
│ Reportado por: juan@gmail.com        │
│ Motivo: Posible fraude               │
│ "Piden depositar antes de empezar"   │
│ Hace 2 horas                         │
│              [Ver oferta] [Eliminar] │
│              [Ignorar — sin acción]  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 🚩 USUARIO · "Carlos Ruiz"          │
│ Reportado por: maria@gmail.com      │
│ Motivo: Spam                         │
│ Hace 1 día                           │
│         [Ver perfil] [Bloquear user] │
│         [Ignorar — sin acción]       │
└──────────────────────────────────────┘
```

---

## Seguridad — Firestore Rules

### Identificación del admin

**Opción elegida:** UID hardcodeado en las rules (más simple, sin query a Firestore).

```firestore
// En firestore.rules
function isAdmin() {
    return request.auth != null &&
           request.auth.uid == 'UID_DEL_FUNDADOR_AQUI';
}

match /reportes/{docId} {
    allow create: if request.auth != null;   // cualquier usuario puede reportar
    allow read, update: if isAdmin();
}

match /auditoria/{docId} {
    allow read, write: if isAdmin();
}
```

**Por qué UID hardcodeado y no campo `role`:**
- Con campo `role`, un atacante que escriba en su propio doc podría intentar escalar (aunque las rules lo previenen, el UID es más robusto)
- Solo hay un admin — no necesita escalar a sistema de roles hasta Fase 2+
- Sin query extra en cada request → más rápido y sin quota de reads

### Protección en `admin.html`

Además de las rules de Firestore, protección doble en el cliente:
```js
const ADMIN_UIDS = ['UID_DEL_FUNDADOR'];

onAuthStateChanged(auth, async (user) => {
    if (!user || !ADMIN_UIDS.includes(user.uid)) {
        window.location.href = 'login.html';
        return;
    }
    // continuar con init del panel
});
```

---

## Estructura de `admin.html`

```html
<body>
    <!-- Header simple sin bottom nav -->
    <header class="header">
        <div class="header-content">
            <span class="logo-text">ChambaYa Admin</span>
            <button onclick="cerrarSesion()" class="btn-volver">Salir</button>
        </div>
    </header>

    <!-- Tabs de navegación -->
    <div class="admin-tabs">
        <button class="admin-tab active" data-tab="stats">📊 Stats</button>
        <button class="admin-tab" data-tab="usuarios">👥 Usuarios</button>
        <button class="admin-tab" data-tab="ofertas">💼 Ofertas</button>
        <button class="admin-tab" data-tab="reportes">
            🚨 Reportes
            <span class="admin-tab-badge" id="reportes-badge" hidden></span>
        </button>
    </div>

    <!-- Contenido de cada tab (show/hide) -->
    <main class="admin-main">
        <div id="tab-stats" class="admin-tab-content active"></div>
        <div id="tab-usuarios" class="admin-tab-content" hidden></div>
        <div id="tab-ofertas" class="admin-tab-content" hidden></div>
        <div id="tab-reportes" class="admin-tab-content" hidden></div>
    </main>

    <!-- Modal reutilizado -->
    <div id="modal-overlay" class="modal-overlay" ...></div>

    <script src="js/config/firebase-config.js" defer></script>
    <script src="js/toast.js" defer></script>
    <script type="module" src="js/admin/index.js"></script>
</body>
```

---

## CSS (`css/admin.css`) — clases principales

```css
/* Tabs */
.admin-tabs { display: flex; border-bottom: 2px solid var(--border); }
.admin-tab { flex: 1; padding: 0.75rem; position: relative; }
.admin-tab.active { border-bottom: 2px solid var(--primary); color: var(--primary); }
.admin-tab-badge {
    position: absolute; top: 4px; right: 8px;
    background: var(--danger); color: white;
    font-size: 0.625rem; font-weight: 700;
    min-width: 16px; height: 16px;
    border-radius: 50%; display: inline-flex;
    align-items: center; justify-content: center;
}

/* Stats grid */
.admin-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem; }
.admin-stat-card { background: var(--white); border-radius: var(--radius-md);
                   padding: 1rem; box-shadow: var(--shadow-sm); }
.admin-stat-number { font-size: 2rem; font-weight: 700; color: var(--primary); }
.admin-stat-label { font-size: var(--text-sm); color: var(--gray); }

/* Tabla de usuarios/ofertas */
.admin-list { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; }
.admin-card { background: var(--white); border-radius: var(--radius-md);
              padding: 1rem; box-shadow: var(--shadow-sm); }
.admin-card--bloqueado { opacity: 0.6; border-left: 3px solid var(--danger); }
.admin-card--pendiente { border-left: 3px solid var(--warning); }

/* Acciones */
.admin-acciones { display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap; }
.btn-admin-danger { background: var(--danger-light); color: var(--danger);
                    border: 1px solid var(--danger); }
```

---

## Flujo completo de un reporte

```
1. Usuario ve algo sospechoso
2. Pulsa "⚑ Reportar" (en oferta o perfil)
3. Modal pide motivo + descripción opcional
4. Se crea doc en Firestore: reportes/{id}
5. Admin ve badge rojo "N" en tab Reportes
6. Admin revisa: puede [Ver contenido] [Eliminar oferta / Bloquear usuario] [Ignorar]
7. Al actuar:
   - Se escribe acción en el doc del reporte (estado: 'revisado', accionAdmin: '...')
   - Si eliminó oferta: se registra en auditoria
   - Si bloqueó usuario: se escribe bloqueado:true en usuarios/{uid}
8. Badge baja a N-1
```

---

## Orden de implementación sugerido

1. **Primero: auth + estructura base** (`admin.html` + `js/admin/index.js` + `css/admin.css`)
   - Sin datos aún, solo la shell con tabs y auth guard funcionando

2. **Task 45: Stats** (`js/admin/stats.js`)
   - Conteos básicos. Lo más rápido, verifica que la conexión a Firestore funciona

3. **Task 45b: Métricas** (`js/admin/metricas.js`)
   - Conversión: sobre los datos ya cargados en stats (sin queries extra)
   - Crecimiento: 6 queries `getCountFromServer` por rango de fechas
   - Verificar primero qué campo usa cada colección para la fecha de creación

4. **Task 48: Reportes** — la colección `reportes` + botón "Reportar" en app + tab reportes en admin
   - Prioridad real más alta antes del lanzamiento (moderación)

5. **Task 47: Ofertas** (`js/admin/ofertas.js`)
   - Lista todas las ofertas, botón eliminar con confirmación

6. **Task 46: Usuarios** (`js/admin/usuarios.js`)
   - Búsqueda, bloqueo, check en login

7. **Último: Firestore rules** — actualizar después de tener todo probado en local

> **Task 46b: Planes Premium** → implementar en sesión separada, después de completar el sistema de pagos. El modelo de datos ya está diseñado arriba para no tener que replantear nada.

---

## Qué NO entra en este plan

- Panel multi-admin / sistema de roles → Fase 2
- Emails automáticos al moderar → Fase 2
- Analytics / gráficos de tendencias → Fase 2
- Exportar datos a CSV → Fase 2
- Historial de acciones del admin en UI → solo en Firestore (`auditoria`), sin vista por ahora
- Integración con pasarela de pago → plan separado; el sistema de planes admin es el precursor que define el modelo de datos

---

## Checklist de verificación

### Task 45 — Stats
- [ ] Stats cargan correctamente al entrar al panel
- [ ] Badge de reportes pendientes visible en tab
- [ ] Números se actualizan si se cambia de tab y se vuelve

### Task 45b — Métricas
- [ ] Barras de conversión muestran % correctos (postulación→aceptado, aceptado→completado, oferta→resolución)
- [ ] Barras CSS se renderizan proporcionales al valor
- [ ] Tabla de crecimiento muestra columnas 7d y 30d para usuarios, ofertas y apps
- [ ] Si `fechaCreacion` no existe en alguna colección, mostrar "—" sin romper la vista
- [ ] Índices de Firestore creados si las queries de fecha los requieren

### Task 46 — Usuarios
- [ ] Lista de trabajadores y empleadores separados
- [ ] Plan actual (FREE / PREMIUM hasta X) visible en cada card
- [ ] Búsqueda por nombre o email funciona
- [ ] Bloquear usuario → usuario no puede volver a entrar
- [ ] Desbloquear funciona

### Task 46b + 46c ⚠️ POST-PAGOS (no implementar aún)

### Task 46b — Planes Premium
- [ ] Modal "Gestionar Plan" abre con estado correcto según plan actual del usuario
- [ ] Caso FREE: otorga premium con duración elegida, calcula fecha correctamente
- [ ] Caso PREMIUM vigente: extiende desde la fecha actual de expiración (no desde hoy)
- [ ] Campo nota guardado en historial
- [ ] Registro en `auditoria` por cada cambio de plan
- [ ] Sorteo: elegir N ganadores al azar de la lista visible
- [ ] Sorteo: modal de confirmación muestra los ganadores antes de asignar
- [ ] Sorteo: `Promise.all()` asigna premium a todos los ganadores en paralelo
- [ ] Toast confirma cuántos usuarios recibieron premium

### Task 46c — Verificación de Antecedentes
- [ ] Botón "Solicitar verificación" visible solo para trabajadores premium en su perfil
- [ ] Upload de certificado guardado en Storage, enlace en doc del usuario
- [ ] Estado "En revisión ⏳" visible para el trabajador tras solicitar
- [ ] Sub-vista "Verificaciones" en tab Usuarios del panel muestra cola pendiente
- [ ] Admin puede ver el documento subido antes de aprobar
- [ ] Aprobar → `verificado: true` + `verificacionHasta` = +12 meses
- [ ] Rechazar → estado rechazado + campo motivo
- [ ] Badge "Verificado ✓" aparece en perfil público, perfil trabajador y cards
- [ ] Badge desaparece automáticamente si `verificacionHasta < hoy` (expiró)

### Task 47 — Ofertas
- [ ] Lista todas las ofertas (no solo las del admin)
- [ ] Filtro por estado funciona
- [ ] Eliminar oferta muestra confirm modal y registra en auditoría

### Task 48 — Reportes
- [ ] Botón "Reportar" visible en ofertas y perfiles públicos
- [ ] Modal de reporte guarda doc en Firestore
- [ ] Tab reportes muestra cola pendiente
- [ ] Badge rojo muestra cantidad de pendientes
- [ ] Acciones admin (eliminar / bloquear / ignorar) funcionan
- [ ] Estado del reporte pasa a 'revisado' tras actuar

---

**Creado:** 19 Febrero 2026
**Para implementar:** Semana siguiente
