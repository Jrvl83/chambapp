/**
 * Panel de Administración — Orquestador principal
 * Auth guard + navegación por tabs + init bajo demanda
 *
 * @module admin/index
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// UID del fundador — único admin autorizado
const ADMIN_UIDS = ['XkBmgSWZKZeUyLKAyOn8GHmzOAb2'];

// Estado de tabs ya inicializadas (carga bajo demanda)
const tabsInicializadas = new Set();

let db, auth;

// ─── Init ────────────────────────────────────────────────────────────────────

function initFirebase() {
    const app = initializeApp(window.firebaseConfig);
    auth = getAuth(app);
    db   = getFirestore(app);
}

function initAdmin() {
    initFirebase();
    initTabs();
    initSignOut();

    onAuthStateChanged(auth, async (user) => {
        if (!user || !ADMIN_UIDS.includes(user.uid)) {
            window.location.href = 'login.html';
            return;
        }
        // Cargar tab inicial: Stats
        await cargarTab('stats');
    });
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

function initTabs() {
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            activarTab(tab);
            cargarTab(tab);
        });
    });
}

function activarTab(tabId) {
    // Actualizar botones
    document.querySelectorAll('.admin-tab').forEach(btn => {
        const esActivo = btn.dataset.tab === tabId;
        btn.classList.toggle('active', esActivo);
        btn.setAttribute('aria-selected', esActivo);
    });

    // Mostrar/ocultar contenido
    document.querySelectorAll('.admin-tab-content').forEach(panel => {
        const esActivo = panel.id === `tab-${tabId}`;
        panel.classList.toggle('active', esActivo);
        panel.hidden = !esActivo;
    });
}

async function cargarTab(tabId) {
    if (tabsInicializadas.has(tabId)) return;
    tabsInicializadas.add(tabId);

    try {
        switch (tabId) {
            case 'stats': {
                const [{ initStats }, { initMetricas }] = await Promise.all([
                    import('./stats.js?v=2'),
                    import('./metricas.js?v=2'),
                ]);
                await initStats(db, { onReportesBadge: actualizarBadgeReportes });
                await initMetricas(db);
                break;
            }
            case 'usuarios': {
                const { initUsuarios } = await import('./usuarios.js?v=2');
                await initUsuarios(db, auth);
                break;
            }
            case 'ofertas': {
                const { initOfertas } = await import('./ofertas.js?v=5');
                await initOfertas(db, auth);
                break;
            }
            case 'reportes': {
                const { initReportes } = await import('./reportes.js?v=2');
                await initReportes(db, auth, { onPendientesActualizados: actualizarBadgeReportes });
                break;
            }
        }
    } catch (err) {
        console.error(`Error cargando tab ${tabId}:`, err);
        mostrarErrorTab(tabId);
    }
}

// ─── Badge reportes ───────────────────────────────────────────────────────────

function actualizarBadgeReportes(cantidad) {
    const badge = document.getElementById('reportes-badge');
    if (!badge) return;
    badge.textContent = cantidad;
    badge.hidden = cantidad === 0;
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

function initSignOut() {
    document.getElementById('btn-signout')?.addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'login.html';
    });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mostrarErrorTab(tabId) {
    const contenedor = document.getElementById(`${tabId}-container`);
    if (!contenedor) return;
    contenedor.innerHTML = `
        <div class="admin-empty">
            <p class="admin-empty-text">Error al cargar esta sección.</p>
            <button class="btn btn-outline btn-sm" onclick="location.reload()">Reintentar</button>
        </div>
    `;
}

// Exponer modal helpers al scope global para que los módulos lo usen
export function abrirModal(htmlContenido) {
    const overlay   = document.getElementById('modal-overlay');
    const body      = document.getElementById('modal-body');
    body.innerHTML  = htmlContenido;
    overlay.hidden  = false;
    overlay.classList.add('active');
    document.getElementById('modal-close').onclick = cerrarModal;
    overlay.onclick = (e) => { if (e.target === overlay) cerrarModal(); };
}

export function cerrarModal() {
    const overlay  = document.getElementById('modal-overlay');
    overlay.hidden = true;
    overlay.classList.remove('active');
    document.getElementById('modal-body').innerHTML = '';
}

window.adminModal = { abrirModal, cerrarModal };

// ─── Arrancar ─────────────────────────────────────────────────────────────────

initAdmin();
