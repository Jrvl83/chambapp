/**
 * Admin — Stats Globales
 * Conteos básicos: usuarios, ofertas, aplicaciones, calificaciones, reportes
 *
 * @module admin/stats
 */

import {
    collection, getCountFromServer, getDocs, query, where, limit
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ─── Init ────────────────────────────────────────────────────────────────────

export async function initStats(db, { onReportesBadge } = {}) {
    try {
        const datos = await cargarDatos(db);
        renderStats(datos);
        if (onReportesBadge) onReportesBadge(datos.reportesPendientes);
    } catch (err) {
        console.error('Error cargando stats:', err);
        document.getElementById('stats-container').innerHTML = `
            <div class="admin-section">
                <p class="admin-empty-text">Error al cargar estadísticas.</p>
            </div>`;
    }
}

// ─── Carga de datos ───────────────────────────────────────────────────────────

async function cargarDatos(db) {
    const [
        snapUsuarios, snapOfertas, snapAplicaciones,
        snapCalificaciones, snapReportes
    ] = await Promise.all([
        getDocs(query(collection(db, 'usuarios'))),
        getDocs(collection(db, 'ofertas')),
        getDocs(collection(db, 'aplicaciones')),
        getDocs(query(collection(db, 'calificaciones'), limit(500))),
        getDocs(query(collection(db, 'reportes'), where('estado', '==', 'pendiente'))),
    ]);

    // Usuarios por tipo
    const usuarios = snapUsuarios.docs.map(d => d.data());
    const totalUsuarios    = usuarios.length;
    const totalTrabajadores = usuarios.filter(u => u.tipo === 'trabajador').length;
    const totalEmpleadores  = usuarios.filter(u => u.tipo === 'empleador').length;

    // Ofertas por estado
    const ofertas = snapOfertas.docs.map(d => d.data());
    const ofertasActivas    = ofertas.filter(o => o.estado === 'activa').length;
    const ofertasEnCurso    = ofertas.filter(o => o.estado === 'en_curso').length;
    const ofertasCompletadas= ofertas.filter(o => o.estado === 'completada').length;
    const ofertasCaducadas  = ofertas.filter(o => o.estado === 'caducada').length;

    // Aplicaciones por estado
    const apps = snapAplicaciones.docs.map(d => d.data());
    const appsTotal      = apps.length;
    const appsPendientes = apps.filter(a => a.estado === 'pendiente').length;
    const appsCompletadas= apps.filter(a => a.estado === 'completado').length;

    // Calificaciones — promedio
    const cals = snapCalificaciones.docs.map(d => d.data());
    const totalCals = cals.length;
    const promedioCal = totalCals > 0
        ? (cals.reduce((sum, c) => sum + (c.puntuacion || c.calificacion || 0), 0) / totalCals).toFixed(1)
        : '—';

    // Reportes pendientes
    const reportesPendientes = snapReportes.docs.length;

    return {
        totalUsuarios, totalTrabajadores, totalEmpleadores,
        ofertasActivas, ofertasEnCurso, ofertasCompletadas, ofertasCaducadas,
        appsTotal, appsPendientes, appsCompletadas,
        totalCals, promedioCal,
        reportesPendientes,
        // Pasar snapshots completos para metricas.js
        _apps: apps,
        _ofertas: ofertas,
    };
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderStats(d) {
    const contenedor = document.getElementById('stats-container');
    contenedor.innerHTML = `
        <div class="admin-section">
            <h2 class="admin-section-title">Vista general</h2>
            <div class="admin-stats-grid">
                ${cardStat('Usuarios', d.totalUsuarios, 'total',
                    `${d.totalTrabajadores} trabajadores · ${d.totalEmpleadores} empleadores`)}
                ${cardStat('Ofertas', d.ofertasActivas, 'activas',
                    `${d.ofertasEnCurso} en curso · ${d.ofertasCompletadas} completadas · ${d.ofertasCaducadas} caducadas`)}
                ${cardStat('Aplicaciones', d.appsTotal, 'total',
                    `${d.appsPendientes} pendientes · ${d.appsCompletadas} completadas`)}
                ${cardStat('Calificación', d.promedioCal, 'promedio',
                    `${d.totalCals} reseñas`)}
            </div>
        </div>

        ${d.reportesPendientes > 0 ? `
        <div class="admin-section" style="padding-top:0">
            <div class="admin-alert">
                <span class="admin-alert-text">
                    🚨 ${d.reportesPendientes} reporte${d.reportesPendientes !== 1 ? 's' : ''} pendiente${d.reportesPendientes !== 1 ? 's' : ''}
                </span>
                <span class="admin-alert-link" onclick="document.querySelector('[data-tab=reportes]').click()">
                    Ver reportes →
                </span>
            </div>
        </div>` : ''}

        <div id="metricas-container">
            <div class="admin-loading">
                <div class="admin-spinner"></div>
            </div>
        </div>
    `;

    // Guardar datos para metricas.js
    window._adminStatsData = d;
}

function cardStat(categoria, numero, sufijo, detalle) {
    return `
        <div class="admin-stat-card">
            <div class="admin-stat-category">${categoria}</div>
            <div class="admin-stat-number">${numero}
                <span style="font-size:var(--text-sm);font-weight:400;color:var(--gray-500)">${sufijo}</span>
            </div>
            <div class="admin-stat-sub">${detalle}</div>
        </div>
    `;
}
