/**
 * Template HTML, chips y conteo de filtros activos
 * @module components/filtros-avanzados/chips
 */

import { CATEGORIAS, DISTANCIAS, FECHAS, ORDENAR, formatearSalario } from './constants.js';
import { escapeHtml } from '../../utils/dom-helpers.js';

// ============================================
// TEMPLATE HTML - SECCIONES
// ============================================

function renderQuickBar(busquedaVal, busqueda) {
    return `
        <div class="filtros-quick-bar">
            <div class="filtros-quick-row-1">
                <div class="input-wrapper filtros-quick-search">
                    <input
                        type="text"
                        id="filtro-texto-mobile"
                        placeholder="Buscar por titulo..."
                        autocomplete="off"
                        value="${busquedaVal}"
                    >
                    <button class="input-icon-clear" id="clear-busqueda-mobile" ${busqueda ? '' : 'hidden'} aria-label="Limpiar busqueda" type="button">✕</button>
                </div>
                <button class="btn-filtros-avanzados" id="btn-toggle-avanzados" type="button" aria-label="Filtros avanzados">
                    <span class="btn-filtros-icon">⚙️</span>
                    <span class="filtros-badge-count" id="filtros-count-mobile" hidden>0</span>
                </button>
            </div>
            <div class="filtros-quick-row-2">
                <div class="dropdown-custom" id="dropdown-categorias-mobile"></div>
                <div class="dropdown-custom" id="dropdown-ordenar-mobile"></div>
                <button class="btn-limpiar-todo" id="btn-limpiar-mobile" title="Limpiar filtros" type="button">
                    <span>🔄</span>
                </button>
            </div>
        </div>
    `;
}

function renderDesktopHeader() {
    return `
        <div class="filtros-header">
            <button class="filtros-toggle" aria-expanded="true" aria-controls="filtros-body">
                <span class="filtros-icon">🔎</span>
                <span class="filtros-title">Buscar y Filtrar</span>
                <span class="filtros-badge-count" id="filtros-count" hidden>0</span>
                <span class="filtros-chevron" aria-hidden="true"></span>
            </button>
            <button class="btn-limpiar-todo" id="btn-limpiar-filtros" title="Limpiar todos los filtros">
                <span>🔄</span>
                <span class="btn-text">Limpiar</span>
            </button>
        </div>
    `;
}

function renderDesktopFiltersRow1(busquedaVal, ubicacionVal, busqueda) {
    return `
        <div class="filtros-row filtros-desktop-only">
            <div class="filtro-grupo filtro-busqueda">
                <label for="filtro-texto">🔎 Buscar</label>
                <div class="input-wrapper">
                    <input
                        type="text"
                        id="filtro-texto"
                        placeholder="Buscar por titulo, descripcion..."
                        autocomplete="off"
                        value="${busquedaVal}"
                    >
                    <button class="input-icon-clear" id="clear-busqueda" ${busqueda ? '' : 'hidden'} aria-label="Limpiar busqueda" type="button">✕</button>
                </div>
            </div>
            <div class="filtro-grupo filtro-ubicacion">
                <label for="filtro-ubicacion">📍 Ubicacion</label>
                <div class="autocomplete-wrapper">
                    <input
                        type="text"
                        id="filtro-ubicacion"
                        placeholder="Distrito, zona..."
                        autocomplete="off"
                        value="${ubicacionVal}"
                    >
                    <div class="autocomplete-dropdown" id="ubicacion-dropdown"></div>
                </div>
            </div>
        </div>
    `;
}

function renderDesktopFiltersRow2(userLocation) {
    return `
        <div class="filtros-row filtros-desktop-only">
            <div class="filtro-grupo filtro-categorias">
                <label>🏷️ Categorias</label>
                <div class="dropdown-custom" id="dropdown-categorias"></div>
            </div>
            <div class="filtro-grupo filtro-distancia" id="filtro-distancia-grupo" ${userLocation ? '' : 'hidden'}>
                <label>📏 Distancia</label>
                <div class="dropdown-custom" id="dropdown-distancia"></div>
            </div>
            <div class="filtro-grupo filtro-salario">
                <label>💰 Rango Salarial</label>
                <div class="range-slider-container" id="salario-slider"></div>
            </div>
        </div>
    `;
}

function renderDesktopFiltersRow3() {
    return `
        <div class="filtros-row filtros-desktop-only">
            <div class="filtro-grupo filtro-fecha">
                <label>📅 Publicacion</label>
                <div class="dropdown-custom" id="dropdown-fecha"></div>
            </div>
            <div class="filtro-grupo filtro-ordenar">
                <label>🔄 Ordenar por</label>
                <div class="dropdown-custom" id="dropdown-ordenar"></div>
            </div>
        </div>
    `;
}

function renderMobileFilters(state, ubicacionVal, userLocation) {
    return `
        <div class="filtros-sheet-title filtros-mobile-only">Filtros avanzados</div>
        <div class="filtros-mobile-only">
            <div class="filtros-sheet-grid">
                <div class="filtro-grupo filtro-ubicacion">
                    <label for="filtro-ubicacion-mobile">📍 Ubicacion</label>
                    <div class="input-wrapper">
                        <input
                            type="text"
                            id="filtro-ubicacion-mobile"
                            placeholder="Distrito, zona..."
                            autocomplete="off"
                            value="${ubicacionVal}"
                        >
                    </div>
                </div>
                <div class="filtro-grupo filtro-distancia" id="filtro-distancia-grupo-mobile" ${userLocation ? '' : 'hidden'}>
                    <label>📏 Distancia</label>
                    <div class="dropdown-custom" id="dropdown-distancia-mobile"></div>
                </div>
            </div>

            <div class="filtro-grupo filtro-salario">
                <label>💰 Rango Salarial</label>
                <div class="salario-inputs">
                    <input type="number" id="salario-min" placeholder="Min S/" min="0" max="5000" step="50" value="${state.salarioMin || ''}">
                    <span class="salario-separator">—</span>
                    <input type="number" id="salario-max" placeholder="Max S/" min="0" max="5000" step="50" value="${state.salarioMax >= 5000 ? '' : state.salarioMax}">
                </div>
            </div>

            <div class="filtro-grupo filtro-fecha">
                <label>📅 Publicacion</label>
                <div class="fecha-chips">
                    <button type="button" class="fecha-chip ${state.fechaPublicacion === 'hoy' ? 'active' : ''}" data-value="hoy">Hoy</button>
                    <button type="button" class="fecha-chip ${state.fechaPublicacion === 'ultimos3' ? 'active' : ''}" data-value="ultimos3">3 dias</button>
                    <button type="button" class="fecha-chip ${state.fechaPublicacion === 'ultimos7' ? 'active' : ''}" data-value="ultimos7">7 dias</button>
                    <button type="button" class="fecha-chip ${!state.fechaPublicacion ? 'active' : ''}" data-value="">Todas</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Genera el HTML completo del componente de filtros
 * @param {Object} state - Estado actual de filtros
 * @param {Object|null} userLocation - Ubicacion del usuario
 * @returns {string} HTML del componente
 */
export function renderFiltrosHTML(state, userLocation) {
    const busquedaVal = escapeHtml(state.busqueda);
    const ubicacionVal = escapeHtml(state.ubicacion);

    return `
        <div class="filtros-overlay" id="filtros-overlay"></div>
        ${renderQuickBar(busquedaVal, state.busqueda)}
        ${renderDesktopHeader()}
        <div class="filtros-chips" id="filtros-chips"></div>
        <div class="filtros-body" id="filtros-body">
            ${renderDesktopFiltersRow1(busquedaVal, ubicacionVal, state.busqueda)}
            ${renderDesktopFiltersRow2(userLocation)}
            ${renderDesktopFiltersRow3()}
            ${renderMobileFilters(state, ubicacionVal, userLocation)}
            <div class="filtros-row filtros-aplicar-row">
                <button class="btn btn-primary btn-aplicar-filtros" id="btn-aplicar-filtros" type="button">
                    Ver resultados
                </button>
            </div>
        </div>
        <div class="filtros-resultados" id="filtros-resultados" role="status" aria-live="polite">
            Mostrando todas las ofertas
        </div>
    `;
}

// ============================================
// CHIPS DE FILTROS ACTIVOS
// ============================================

/**
 * Construye los datos de chips activos
 * @param {Object} state - Estado de filtros
 * @returns {Array} Array de objetos chip
 */
export function getActiveChips(state) {
    const chips = [];

    if (state.busqueda) {
        chips.push({ type: 'busqueda', icon: '🔎', label: state.busqueda });
    }

    state.categorias.forEach(cat => {
        const item = CATEGORIAS.find(c => c.value === cat);
        if (item) {
            chips.push({ type: 'categoria', icon: item.icon, label: item.label, value: cat });
        }
    });

    if (state.ubicacion) {
        chips.push({ type: 'ubicacion', icon: '📍', label: state.ubicacion });
    }

    if (state.distanciaMax) {
        const item = DISTANCIAS.find(d => d.value === state.distanciaMax);
        chips.push({
            type: 'distancia',
            icon: '📏',
            label: item ? item.label : `${state.distanciaMax} km`
        });
    }

    addSalarioChip(chips, state);
    addFechaChip(chips, state);

    return chips;
}

function addSalarioChip(chips, state) {
    if (state.salarioMin > 0 || state.salarioMax < 5000) {
        const minText = formatearSalario(state.salarioMin);
        const maxText = state.salarioMax >= 5000 ? 'S/ 5,000+' : formatearSalario(state.salarioMax);
        chips.push({ type: 'salario', icon: '💰', label: `${minText} - ${maxText}` });
    }
}

function addFechaChip(chips, state) {
    if (state.fechaPublicacion) {
        const item = FECHAS.find(f => f.value === state.fechaPublicacion);
        chips.push({
            type: 'fecha',
            icon: '📅',
            label: item ? item.label : state.fechaPublicacion
        });
    }
}

/**
 * Renderiza el HTML de los chips
 * @param {Array} chips - Array de datos de chip
 * @returns {string} HTML de chips
 */
export function renderChipsHTML(chips) {
    return chips.map((chip, i) => `
        <span class="chip" data-type="${chip.type}" data-index="${i}">
            <span class="chip-icon">${chip.icon}</span>
            <span class="chip-label">${escapeHtml(chip.label)}</span>
            <button class="chip-remove" aria-label="Quitar filtro ${escapeHtml(chip.label)}" type="button">✕</button>
        </span>
    `).join('');
}

// ============================================
// CONTEO DE FILTROS
// ============================================

/**
 * Cuenta el total de filtros activos
 * @param {Object} state - Estado de filtros
 * @returns {number} Cantidad de filtros activos
 */
export function countActiveFilters(state) {
    let count = 0;
    if (state.busqueda) count++;
    count += state.categorias.length;
    if (state.ubicacion) count++;
    if (state.distanciaMax) count++;
    if (state.salarioMin > 0 || state.salarioMax < 5000) count++;
    if (state.fechaPublicacion) count++;
    return count;
}

/**
 * Cuenta filtros avanzados (para badge mobile)
 * @param {Object} state - Estado de filtros
 * @returns {number} Cantidad de filtros avanzados
 */
export function countAdvancedFilters(state) {
    let count = 0;
    if (state.ubicacion) count++;
    if (state.distanciaMax) count++;
    if (state.salarioMin > 0 || state.salarioMax < 5000) count++;
    if (state.fechaPublicacion) count++;
    return count;
}
