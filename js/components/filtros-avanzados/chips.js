/**
 * Template HTML, chips y conteo de filtros activos
 * @module components/filtros-avanzados/chips
 */

import { CATEGORIAS, DISTANCIAS, FECHAS, ORDENAR, formatearSalario } from './constants.js';
import { escapeHtml } from '../../utils/dom-helpers.js';

// ============================================
// TEMPLATE HTML
// ============================================

/**
 * Genera el HTML completo del componente de filtros
 * Estructura: botón tuerca + overlay + bottom sheet
 * @param {Object} state - Estado actual de filtros
 * @param {Object|null} userLocation - Ubicacion del usuario
 * @returns {string} HTML del componente
 */
export function renderFiltrosHTML(state, userLocation) {
    const busquedaVal = escapeHtml(state.busqueda);
    const ubicacionVal = escapeHtml(state.ubicacion);
    const hayFiltros = hayFiltrosActivos(state);

    return `
        <button class="btn-filtros-trigger" id="btn-abrir-filtros" type="button" aria-label="Abrir filtros">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
            <span class="filtros-badge-activo" id="filtros-badge-activo" ${hayFiltros ? '' : 'hidden'}>+</span>
        </button>

        <div class="filtros-overlay" id="filtros-overlay"></div>

        <div class="filtros-sheet" id="filtros-sheet" aria-hidden="true">
            <div class="filtros-sheet-handle"></div>
            <div class="filtros-sheet-header">
                <h3 class="filtros-sheet-titulo">Filtros</h3>
                <button class="filtros-sheet-close" id="btn-cerrar-filtros" type="button" aria-label="Cerrar filtros">✕</button>
            </div>
            <div class="filtros-sheet-body">
                <div class="filtro-grupo">
                    <div class="input-wrapper">
                        <input type="text" id="filtro-texto-mobile" class="filtro-input"
                               placeholder="Buscar por título..." autocomplete="off" value="${busquedaVal}">
                        <button class="input-icon-clear" id="clear-busqueda-mobile"
                                ${busquedaVal ? '' : 'hidden'} aria-label="Limpiar búsqueda" type="button">✕</button>
                    </div>
                </div>

                <div class="filtro-grupo">
                    <label class="filtro-label">🏷️ Categorías</label>
                    <div class="dropdown-custom" id="dropdown-categorias-mobile"></div>
                </div>

                <div class="filtro-grupo">
                    <label class="filtro-label">🔄 Ordenar por</label>
                    <div class="dropdown-custom" id="dropdown-ordenar-mobile"></div>
                </div>

                <div class="filtros-sheet-grid">
                    <div class="filtro-grupo">
                        <label class="filtro-label">📍 Ubicación</label>
                        <input type="text" id="filtro-ubicacion-mobile" class="filtro-input"
                               placeholder="Distrito, zona..." autocomplete="off" value="${ubicacionVal}">
                    </div>
                    <div class="filtro-grupo" id="filtro-distancia-grupo-mobile" ${userLocation ? '' : 'hidden'}>
                        <label class="filtro-label">📏 Distancia</label>
                        <div class="dropdown-custom" id="dropdown-distancia-mobile"></div>
                    </div>
                </div>

                <div class="filtro-grupo">
                    <label class="filtro-label">💰 Rango Salarial</label>
                    <div class="salario-inputs">
                        <input type="number" id="salario-min" placeholder="Min S/" min="0" max="5000" step="50"
                               value="${state.salarioMin || ''}">
                        <span class="salario-separator">—</span>
                        <input type="number" id="salario-max" placeholder="Max S/" min="0" max="5000" step="50"
                               value="${state.salarioMax >= 5000 ? '' : state.salarioMax}">
                    </div>
                </div>

                <div class="filtro-grupo">
                    <label class="filtro-label">📅 Publicación</label>
                    <div class="fecha-chips">
                        <button type="button" class="fecha-chip ${state.fechaPublicacion === 'hoy' ? 'active' : ''}" data-value="hoy">Hoy</button>
                        <button type="button" class="fecha-chip ${state.fechaPublicacion === 'ultimos3' ? 'active' : ''}" data-value="ultimos3">3 días</button>
                        <button type="button" class="fecha-chip ${state.fechaPublicacion === 'ultimos7' ? 'active' : ''}" data-value="ultimos7">7 días</button>
                        <button type="button" class="fecha-chip ${!state.fechaPublicacion ? 'active' : ''}" data-value="">Todas</button>
                    </div>
                </div>
            </div>

            <div class="filtros-sheet-footer">
                <button class="btn btn-outline filtros-btn-limpiar" id="btn-limpiar-filtros" type="button">Limpiar</button>
                <button class="btn btn-primary filtros-btn-filtrar" id="btn-aplicar-filtros" type="button">Filtrar</button>
            </div>
        </div>
    `;
}

/**
 * Verifica si hay algún filtro activo
 */
export function hayFiltrosActivos(state) {
    return !!(
        state.busqueda ||
        state.categorias.length > 0 ||
        state.ordenar !== 'recientes' ||
        state.ubicacion ||
        state.distanciaMax ||
        state.salarioMin > 0 ||
        state.salarioMax < 5000 ||
        state.fechaPublicacion
    );
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
