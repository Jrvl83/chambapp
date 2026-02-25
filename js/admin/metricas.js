/**
 * Admin — Métricas de Conversión y Crecimiento
 * Barras de conversión CSS + tabla de crecimiento 7d/30d
 *
 * @module admin/metricas
 */

import {
    collection, query, where, getCountFromServer, Timestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ─── Init ────────────────────────────────────────────────────────────────────

export async function initMetricas(db) {
    const contenedor = document.getElementById('metricas-container');
    if (!contenedor) return;

    try {
        // Reutilizar datos ya cargados por stats.js
        const statsData  = window._adminStatsData || {};
        const conversion = calcularConversion(statsData._apps || [], statsData._ofertas || []);
        const crecimiento = await cargarCrecimiento(db);

        contenedor.innerHTML = renderConversion(conversion) + renderCrecimiento(crecimiento);
    } catch (err) {
        console.error('Error cargando métricas:', err);
        contenedor.innerHTML = `
            <div class="admin-section">
                <p class="admin-empty-text">No se pudieron cargar las métricas.</p>
            </div>`;
    }
}

// ─── Conversión ───────────────────────────────────────────────────────────────

function calcularConversion(apps, ofertas) {
    const total      = apps.length;
    const aceptadas  = apps.filter(a => ['aceptado', 'completado'].includes(a.estado)).length;
    const completadas= apps.filter(a => a.estado === 'completado').length;
    const conAceptado= ofertas.filter(o => (o.aceptadosCount || 0) > 0).length;

    return {
        tasaAceptacion:  total     > 0 ? +(aceptadas   / total      * 100).toFixed(1) : 0,
        tasaCompletacion:aceptadas > 0 ? +(completadas / aceptadas  * 100).toFixed(1) : 0,
        tasaResolucion:  ofertas.length > 0 ? +(conAceptado / ofertas.length * 100).toFixed(1) : 0,
    };
}

// ─── Crecimiento ──────────────────────────────────────────────────────────────

async function cargarCrecimiento(db) {
    const ahora   = new Date();
    const hace7d  = new Date(ahora - 7  * 24 * 60 * 60 * 1000);
    const hace30d = new Date(ahora - 30 * 24 * 60 * 60 * 1000);

    // Queries en paralelo con los campos confirmados
    const [u7, u30, o7, o30, a7, a30] = await Promise.all([
        contarDesde(db, 'usuarios',     'createdAt',      hace7d),
        contarDesde(db, 'usuarios',     'createdAt',      hace30d),
        contarDesde(db, 'ofertas',      'fechaCreacion',  hace7d),
        contarDesde(db, 'ofertas',      'fechaCreacion',  hace30d),
        contarDesde(db, 'aplicaciones', 'fechaAplicacion',hace7d),
        contarDesde(db, 'aplicaciones', 'fechaAplicacion',hace30d),
    ]);

    return {
        usuarios:     { d7: u7,  d30: u30 },
        ofertas:      { d7: o7,  d30: o30 },
        aplicaciones: { d7: a7,  d30: a30 },
    };
}

async function contarDesde(db, coleccion, campo, desde) {
    try {
        const snap = await getCountFromServer(query(
            collection(db, coleccion),
            where(campo, '>=', Timestamp.fromDate(desde))
        ));
        return snap.data().count;
    } catch {
        return '—';
    }
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderConversion({ tasaAceptacion, tasaCompletacion, tasaResolucion }) {
    return `
        <div class="admin-section">
            <div class="admin-stat-card">
                <h3 class="admin-section-title" style="margin-bottom:1rem">Conversión</h3>
                ${barraConversion('Postulación → Aceptado', tasaAceptacion, 'naranja')}
                ${barraConversion('Aceptado → Completado',  tasaCompletacion, 'verde')}
                ${barraConversion('Oferta → Resolución',    tasaResolucion,   'azul')}
            </div>
        </div>
    `;
}

function barraConversion(nombre, valor, color) {
    const ancho = typeof valor === 'number' ? valor : 0;
    return `
        <div class="metrica-barra-row">
            <div class="metrica-barra-label">
                <span class="metrica-barra-nombre">${nombre}</span>
                <span class="metrica-barra-valor metrica-barra-valor--${color}">${valor}%</span>
            </div>
            <div class="metrica-barra-track">
                <div class="metrica-barra-fill metrica-barra-fill--${color}"
                     style="width:${ancho}%"></div>
            </div>
        </div>
    `;
}

function renderCrecimiento({ usuarios, ofertas, aplicaciones }) {
    return `
        <div class="admin-section" style="padding-top:0">
            <div class="admin-stat-card">
                <h3 class="admin-section-title" style="margin-bottom:1rem">Crecimiento</h3>
                <table class="admin-growth-table">
                    <thead>
                        <tr>
                            <th>Métrica</th>
                            <th>7 días</th>
                            <th>30 días</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filaCrecimiento('Nuevos usuarios',     usuarios.d7,     usuarios.d30)}
                        ${filaCrecimiento('Nuevas ofertas',      ofertas.d7,      ofertas.d30)}
                        ${filaCrecimiento('Nuevas aplicaciones', aplicaciones.d7, aplicaciones.d30)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function filaCrecimiento(nombre, d7, d30) {
    const fmt = v => typeof v === 'number'
        ? `<span class="admin-growth-positive"><span class="admin-growth-arrow">↑</span>+${v}</span>`
        : `<span style="color:var(--gray-400)">${v}</span>`;
    return `
        <tr>
            <td>${nombre}</td>
            <td>${fmt(d7)}</td>
            <td>${fmt(d30)}</td>
        </tr>
    `;
}
