/**
 * Filtros Avanzados - Clase principal orquestadora
 * Sistema de filtros profesional con dropdowns custom,
 * multiselect, range slider y persistencia
 *
 * @module components/filtros-avanzados/index
 */

import { CATEGORIAS, DISTANCIAS, FECHAS, ORDENAR, STORAGE_KEY, DEFAULT_STATE, debounce } from './constants.js';
import { CustomDropdown } from './custom-dropdown.js';
import { MultiSelectDropdown } from './multi-select.js';
import { DualRangeSlider } from './dual-range.js';
import {
    renderFiltrosHTML, getActiveChips, renderChipsHTML,
    countActiveFilters, countAdvancedFilters
} from './chips.js';

class FiltrosAvanzados {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`FiltrosAvanzados: Container #${containerId} not found`);
            return;
        }
        this.options = { persistir: true, storageKey: STORAGE_KEY, debounceMs: 300, ...options };
        this.state = { ...DEFAULT_STATE };
        this.callbacks = { onChange: null, onClear: null };
        this.components = {};
        this.userLocation = null;
        this.isCollapsed = window.innerWidth <= 768;
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        this.loadPersistedState();
        this.render();
        this.initDesktopComponents();
        this.initMobileComponents();
        this.bindDesktopEvents();
        this.bindMobileEvents();
        this.bindSharedEvents();
        this.updateChips();
        this.updateFilterCount();

        if (this.isCollapsed) {
            this.elements.body.classList.add('collapsed');
            this.elements.toggle.setAttribute('aria-expanded', 'false');
        }
    }

    // --- Render ---

    render() {
        this.container.innerHTML = renderFiltrosHTML(this.state, this.userLocation);
        this.cacheElements();
    }

    cacheElements() {
        const q = (sel) => this.container.querySelector(sel);
        this.elements = {
            toggle: q('.filtros-toggle'),
            body: q('.filtros-body'),
            limpiar: q('#btn-limpiar-filtros'),
            busqueda: q('#filtro-texto'),
            clearBusqueda: q('#clear-busqueda'),
            ubicacion: q('#filtro-ubicacion'),
            ubicacionDropdown: q('#ubicacion-dropdown'),
            chips: q('#filtros-chips'),
            resultados: q('#filtros-resultados'),
            badge: q('#filtros-count'),
            distanciaGrupo: q('#filtro-distancia-grupo'),
            btnAplicar: q('#btn-aplicar-filtros'),
            busquedaMobile: q('#filtro-texto-mobile'),
            clearBusquedaMobile: q('#clear-busqueda-mobile'),
            ubicacionMobile: q('#filtro-ubicacion-mobile'),
            btnToggleAvanzados: q('#btn-toggle-avanzados'),
            limpiarMobile: q('#btn-limpiar-mobile'),
            badgeMobile: q('#filtros-count-mobile'),
            salarioMin: q('#salario-min'),
            salarioMax: q('#salario-max'),
            distanciaGrupoMobile: q('#filtro-distancia-grupo-mobile'),
            overlay: q('#filtros-overlay')
        };
    }

    // --- Helpers ---

    _onFieldChange(field) {
        return (value) => {
            this.state[field] = value;
            this.syncControls();
            this.onFilterChange();
        };
    }

    _onCategoriasChange(values) {
        this.state.categorias = values;
        this.syncControls();
        this.onFilterChange();
    }

    // --- Componentes ---

    initDesktopComponents() {
        this.components.categorias = new MultiSelectDropdown('#dropdown-categorias', {
            placeholder: 'Todas las categorias',
            placeholderMultiple: '{count} categorias',
            items: CATEGORIAS.map(c => ({ ...c, color: true })),
            values: this.state.categorias,
            showColors: true,
            onChange: (v) => this._onCategoriasChange(v)
        });

        this.components.distancia = new CustomDropdown('#dropdown-distancia', {
            placeholder: 'Cualquier distancia', items: DISTANCIAS,
            value: this.state.distanciaMax, onChange: this._onFieldChange('distanciaMax')
        });

        this.components.fecha = new CustomDropdown('#dropdown-fecha', {
            placeholder: 'Cualquier fecha', items: FECHAS,
            value: this.state.fechaPublicacion, onChange: this._onFieldChange('fechaPublicacion')
        });

        this.components.ordenar = new CustomDropdown('#dropdown-ordenar', {
            placeholder: 'Mas recientes', items: ORDENAR,
            value: this.state.ordenar, onChange: this._onFieldChange('ordenar')
        });

        this.components.salario = new DualRangeSlider('#salario-slider', {
            min: 0, max: 5000, step: 50,
            valueMin: this.state.salarioMin, valueMax: this.state.salarioMax,
            onChange: ({ min, max }) => {
                this.state.salarioMin = min;
                this.state.salarioMax = max;
                this.syncControls();
                this.onFilterChange();
            }
        });
    }

    initMobileComponents() {
        this.components.categoriasMobile = new MultiSelectDropdown('#dropdown-categorias-mobile', {
            placeholder: 'Categorias', placeholderMultiple: '{count} cats.',
            items: CATEGORIAS.map(c => ({ ...c, color: true })),
            values: this.state.categorias, showColors: true,
            onChange: (v) => this._onCategoriasChange(v)
        });

        this.components.ordenarMobile = new CustomDropdown('#dropdown-ordenar-mobile', {
            placeholder: 'Recientes', items: ORDENAR,
            value: this.state.ordenar, onChange: this._onFieldChange('ordenar')
        });

        this.components.distanciaMobile = new CustomDropdown('#dropdown-distancia-mobile', {
            placeholder: 'Cualquier', items: DISTANCIAS,
            value: this.state.distanciaMax, onChange: this._onFieldChange('distanciaMax')
        });
    }

    // --- Eventos ---

    bindDesktopEvents() {
        this.elements.toggle.addEventListener('click', () => this.toggleCollapse());
        this.elements.limpiar.addEventListener('click', () => this.clearAll());

        const debouncedSearch = debounce(() => {
            this.state.busqueda = this.elements.busqueda.value.trim();
            this.elements.clearBusqueda.hidden = !this.state.busqueda;
            this.syncControls();
            this.onFilterChange();
        }, this.options.debounceMs);
        this.elements.busqueda.addEventListener('input', debouncedSearch);

        this.elements.clearBusqueda.addEventListener('click', () => {
            this.state.busqueda = '';
            this.syncControls();
            this.onFilterChange();
            this.elements.busqueda.focus();
        });

        const debouncedUbicacion = debounce(() => {
            this.state.ubicacion = this.elements.ubicacion.value.trim();
            this.syncControls();
            this.onFilterChange();
        }, this.options.debounceMs);
        this.elements.ubicacion.addEventListener('input', debouncedUbicacion);
    }

    bindMobileEvents() {
        this.elements.btnToggleAvanzados.addEventListener('click', () => this.toggleCollapse());
        this.elements.limpiarMobile.addEventListener('click', () => this.clearAll());

        if (this.elements.btnAplicar) {
            this.elements.btnAplicar.addEventListener('click', () => this.closeSheet());
        }

        const debouncedSearchMobile = debounce(() => {
            this.state.busqueda = this.elements.busquedaMobile.value.trim();
            this.syncControls();
            this.onFilterChange();
        }, this.options.debounceMs);
        this.elements.busquedaMobile.addEventListener('input', debouncedSearchMobile);

        this.elements.clearBusquedaMobile.addEventListener('click', () => {
            this.state.busqueda = '';
            this.syncControls();
            this.onFilterChange();
            this.elements.busquedaMobile.focus();
        });

        const debouncedUbicacionMobile = debounce(() => {
            this.state.ubicacion = this.elements.ubicacionMobile.value.trim();
            this.syncControls();
            this.onFilterChange();
        }, this.options.debounceMs);
        this.elements.ubicacionMobile.addEventListener('input', debouncedUbicacionMobile);

        this.bindMobileSalarioEvents();
        this.bindMobileFechaChips();
    }

    bindMobileSalarioEvents() {
        const debouncedSalario = debounce(() => {
            this.state.salarioMin = parseInt(this.elements.salarioMin.value) || 0;
            this.state.salarioMax = parseInt(this.elements.salarioMax.value) || 5000;
            this.syncControls();
            this.onFilterChange();
        }, this.options.debounceMs);
        this.elements.salarioMin.addEventListener('input', debouncedSalario);
        this.elements.salarioMax.addEventListener('input', debouncedSalario);
    }

    bindMobileFechaChips() {
        this.container.querySelectorAll('.fecha-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                this.state.fechaPublicacion = btn.dataset.value;
                this.syncControls();
                this.onFilterChange();
            });
        });
    }

    bindSharedEvents() {
        this.elements.overlay.addEventListener('click', () => this.closeSheet());
        window.addEventListener('resize', debounce(() => this.handleResize(), 150));
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        if (wasMobile === this.isMobile) return;

        if (!this.isMobile) {
            this.isCollapsed = false;
            this.elements.body.classList.remove('collapsed');
            this.container.classList.remove('sheet-open');
            this.elements.overlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            this.isCollapsed = true;
            this.elements.body.classList.add('collapsed');
        }
        this.elements.toggle.setAttribute('aria-expanded', !this.isCollapsed);
        this.syncControls();
    }

    // --- Sincronizacion ---

    syncControls() {
        this.elements.busqueda.value = this.state.busqueda;
        this.elements.clearBusqueda.hidden = !this.state.busqueda;
        this.elements.busquedaMobile.value = this.state.busqueda;
        this.elements.clearBusquedaMobile.hidden = !this.state.busqueda;
        this.elements.ubicacion.value = this.state.ubicacion;
        this.elements.ubicacionMobile.value = this.state.ubicacion;

        this.components.categorias.setValues?.(this.state.categorias, true);
        this.components.categoriasMobile.setValues?.(this.state.categorias, true);
        this.components.ordenar.setValue?.(this.state.ordenar, true);
        this.components.ordenarMobile.setValue?.(this.state.ordenar, true);
        this.components.distancia.setValue?.(this.state.distanciaMax, true);
        this.components.distanciaMobile.setValue?.(this.state.distanciaMax, true);
        this.components.salario.setValues?.(this.state.salarioMin, this.state.salarioMax, true);
        this.elements.salarioMin.value = this.state.salarioMin || '';
        this.elements.salarioMax.value = this.state.salarioMax >= 5000 ? '' : this.state.salarioMax;

        this.components.fecha.setValue?.(this.state.fechaPublicacion, true);
        this.container.querySelectorAll('.fecha-chip').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === this.state.fechaPublicacion);
        });
    }

    // --- Toggle / Sheet ---

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        this.elements.body.classList.toggle('collapsed', this.isCollapsed);
        this.elements.toggle.setAttribute('aria-expanded', !this.isCollapsed);

        if (this.isMobile) {
            this.container.classList.toggle('sheet-open', !this.isCollapsed);
            this.elements.overlay.classList.toggle('active', !this.isCollapsed);
            document.body.style.overflow = this.isCollapsed ? '' : 'hidden';
        }
    }

    closeSheet() {
        if (!this.isCollapsed) this.toggleCollapse();
    }

    // --- Chips y filtros ---

    onFilterChange() {
        this.updateChips();
        this.updateFilterCount();
        this.persistState();
        this.notifyChange();
    }

    updateChips() {
        const chips = getActiveChips(this.state);
        this.elements.chips.innerHTML = renderChipsHTML(chips);
        this.elements.chips.querySelectorAll('.chip-remove').forEach((btn, i) => {
            btn.addEventListener('click', () => this.removeChip(chips[i]));
        });
    }

    removeChip(chip) {
        switch (chip.type) {
            case 'busqueda': this.state.busqueda = ''; break;
            case 'categoria':
                this.state.categorias = this.state.categorias.filter(v => v !== chip.value);
                break;
            case 'ubicacion': this.state.ubicacion = ''; break;
            case 'distancia': this.state.distanciaMax = ''; break;
            case 'salario': this.state.salarioMin = 0; this.state.salarioMax = 5000; break;
            case 'fecha': this.state.fechaPublicacion = ''; break;
        }
        this.syncControls();
        this.onFilterChange();
    }

    updateFilterCount() {
        const count = countActiveFilters(this.state);
        this.elements.badge.textContent = count;
        this.elements.badge.hidden = count === 0;

        const countAvanzados = countAdvancedFilters(this.state);
        this.elements.badgeMobile.textContent = countAvanzados;
        this.elements.badgeMobile.hidden = countAvanzados === 0;
    }

    // --- Persistencia ---

    persistState() {
        if (!this.options.persistir) return;
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.state));
        } catch (e) {
            console.warn('FiltrosAvanzados: No se pudo guardar en localStorage', e);
        }
    }

    loadPersistedState() {
        if (!this.options.persistir) return;
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) this.state = { ...this.state, ...JSON.parse(saved) };
        } catch (e) {
            console.warn('FiltrosAvanzados: No se pudo cargar de localStorage', e);
        }
    }

    notifyChange() {
        if (this.callbacks.onChange) this.callbacks.onChange(this.getState());
    }

    // --- API Publica ---

    getState() { return { ...this.state }; }

    setState(newState, silent = false) {
        this.state = { ...this.state, ...newState };
        this.syncControls();
        this.updateChips();
        this.updateFilterCount();
        this.persistState();
        if (!silent) this.notifyChange();
    }

    onChange(callback) { this.callbacks.onChange = callback; }
    onClear(callback) { this.callbacks.onClear = callback; }

    clearAll() {
        this.state = { ...DEFAULT_STATE };
        this.resetDesktopComponents();
        this.resetMobileComponents();
        this.updateChips();
        this.updateFilterCount();
        this.persistState();
        if (this.callbacks.onClear) this.callbacks.onClear();
        this.notifyChange();
    }

    resetDesktopComponents() {
        this.elements.busqueda.value = '';
        this.elements.clearBusqueda.hidden = true;
        this.elements.ubicacion.value = '';
        this.components.categorias.clearAll(true);
        this.components.distancia.setValue('', true);
        this.components.salario.reset(true);
        this.components.fecha.setValue('', true);
        this.components.ordenar.setValue('recientes', true);
    }

    resetMobileComponents() {
        this.elements.busquedaMobile.value = '';
        this.elements.clearBusquedaMobile.hidden = true;
        this.elements.ubicacionMobile.value = '';
        this.components.categoriasMobile.clearAll(true);
        this.components.ordenarMobile.setValue('recientes', true);
        this.components.distanciaMobile.setValue('', true);
        this.elements.salarioMin.value = '';
        this.elements.salarioMax.value = '';
        this.container.querySelectorAll('.fecha-chip').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === '');
        });
    }

    setUserLocation(ubicacion) {
        this.userLocation = ubicacion;
        this.elements.distanciaGrupo.hidden = !ubicacion;
        this.elements.distanciaGrupoMobile.hidden = !ubicacion;
    }

    updateResultsCount(mostradas, total) {
        if (mostradas === total) {
            this.elements.resultados.textContent = `Mostrando todas las ofertas (${total})`;
        } else {
            this.elements.resultados.textContent = `Mostrando ${mostradas} de ${total} ofertas`;
        }
        if (this.elements.btnAplicar) {
            this.elements.btnAplicar.textContent = `Ver ${mostradas} resultado${mostradas !== 1 ? 's' : ''}`;
        }
    }

    destroy() {
        Object.values(this.components).forEach(c => c.destroy?.());
        this.container.innerHTML = '';
    }
}

// Exportar al scope global
window.FiltrosAvanzados = FiltrosAvanzados;
window.CustomDropdown = CustomDropdown;
window.MultiSelectDropdown = MultiSelectDropdown;
window.DualRangeSlider = DualRangeSlider;
