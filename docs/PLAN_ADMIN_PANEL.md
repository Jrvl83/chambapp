# PLAN: Panel de Administración — Tasks 45-48

**Estado:** 🕐 Pendiente (semana siguiente)
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
| `js/admin/stats.js` | Task 45 — Stats globales |
| `js/admin/usuarios.js` | Task 46 — Gestión de usuarios |
| `js/admin/ofertas.js` | Task 47 — Gestión de ofertas |
| `js/admin/reportes.js` | Task 48 — Sistema de reportes |
| `css/admin.css` | Estilos exclusivos del panel |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `firestore.rules` | Agregar `isAdmin()` + colección `reportes` |
| `js/components/oferta-card.js` | Agregar botón "Reportar" en cards |
| `perfil-publico.html` + `js/perfil-publico/index.js` | Agregar botón "Reportar perfil" |

---

## TASK 45 — Stats Globales (Dashboard Admin)

### Vista
Primera tab al entrar al panel. Carga inmediata.

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
└─────────────────────────────────────┘
```

### Implementación (`js/admin/stats.js`)

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

## TASK 46 — Gestión de Usuarios

### Vista
Tab "Usuarios". Carga bajo demanda (solo al hacer clic en el tab).

```
[🔍 Buscar por nombre o email...    ]

TRABAJADORES (180)          EMPLEADORES (67)
─────────────────────────────────────────
│ 👤 Juan Pérez              │
│ juan@email.com             │
│ Lima · Registrado 10 feb   │
│ 12 apps · ⭐ 4.5           │
│                [Ver perfil] [Bloquear] │
├────────────────────────────┤
│ 👤 María García  🚫 BLOQUEADA │
│ ...                        │
│            [Ver perfil] [Desbloquear]  │
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
   - Lo más rápido de hacer, da valor inmediato, verifica que la conexión a Firestore funciona

3. **Task 48: Reportes** — la colección `reportes` + botón "Reportar" en app + tab reportes en admin
   - Prioridad real más alta antes del lanzamiento (moderación)

4. **Task 47: Ofertas** (`js/admin/ofertas.js`)
   - Lista todas las ofertas, botón eliminar con confirmación

5. **Task 46: Usuarios** (`js/admin/usuarios.js`)
   - Lo más complejo (búsqueda, bloqueo, check en login)

6. **Último: Firestore rules** — actualizar después de tener todo probado en local

---

## Qué NO entra en este plan

- Panel multi-admin / sistema de roles → Fase 2
- Emails automáticos al moderar → Fase 2
- Analytics / gráficos de tendencias → Fase 2
- Exportar datos a CSV → Fase 2
- Historial de acciones del admin en UI → solo en Firestore (`auditoria`), sin vista por ahora

---

## Checklist de verificación

### Task 45 — Stats
- [ ] Stats cargan correctamente al entrar al panel
- [ ] Badge de reportes pendientes visible en tab
- [ ] Números se actualizan si se cambia de tab y se vuelve

### Task 46 — Usuarios
- [ ] Lista de trabajadores y empleadores separados
- [ ] Búsqueda por nombre o email funciona
- [ ] Bloquear usuario → usuario no puede volver a entrar
- [ ] Desbloquear funciona

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
