/**
 * Filtros Avanzados - Clase principal orquestadora
 * Sistema de filtros con bottom sheet, badge "+" y apply-on-button
 *
 * @module components/filtros-avanzados/index
 */

import { CATEGORIAS, DISTANCIAS, FECHAS, ORDENAR, STORAGE_KEY, DEFAULT_STATE, debounce } from './constants.js';
import { CustomDropdown } from './custom-dropdown.js';
import { MultiSelectDropdown } from './multi-select.js';
import { DualRangeSlider } from './dual-range.js';
import {
    renderFiltrosHTML,
    getActiveChips, renderChipsHTML,
    countActiveFilters, countAdvancedFilters,
    hayFiltrosActivos
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
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        this.loadPersistedState();
        this.render();
        this.initComponents();
        this.bindTriggerEvents();
        this.bindSheetEvents();
        this.bindSharedEvents();
        this._actualizarBadge();
    }

    // --- Render ---

    render() {
        this.container.innerHTML = renderFiltrosHTML(this.state, this.userLocation);
        this.cacheElements();
    }

    cacheElements() {
        const q = (sel) => this.container.querySelector(sel);
        this.elements = {
            overlay: q('#filtros-overlay'),
            sheet: q('#filtros-sheet'),
            badge: q('#filtros-badge-activo'),
            busqueda: q('#filtro-texto-mobile'),
            clearBusqueda: q('#clear-busqueda-mobile'),
            ubicacion: q('#filtro-ubicacion-mobile'),
            distanciaGrupo: q('#filtro-distancia-grupo-mobile'),
            salarioMin: q('#salario-min'),
            salarioMax: q('#salario-max'),
            btnAplicar: q('#btn-aplicar-filtros'),
            limpiar: q('#btn-limpiar-filtros'),
        };
    }

    // --- Componentes ---

    initComponents() {
        this.components.categorias = new MultiSelectDropdown('#dropdown-categorias-mobile', {
            placeholder: 'Todas las categorías',
            placeholderMultiple: '{count} categorías',
            items: CATEGORIAS.map(c => ({ ...c, color: true })),
            values: this.state.categorias,
            showColors: true,
            onChange: (v) => { this.state.categorias = v; this.onFilterChange(); }
        });

        this.components.ordenar = new CustomDropdown('#dropdown-ordenar-mobile', {
            placeholder: 'Más recientes', items: ORDENAR,
            value: this.state.ordenar,
            onChange: (v) => { this.state.ordenar = v; this.onFilterChange(); }
        });

        this.components.distancia = new CustomDropdown('#dropdown-distancia-mobile', {
            placeholder: 'Cualquier distancia', items: DISTANCIAS,
            value: this.state.distanciaMax,
            onChange: (v) => { this.state.distanciaMax = v; this.onFilterChange(); }
        });
    }

    // --- Eventos ---

    bindTriggerEvents() {
        const btnAbrir = this.container.querySelector('#btn-abrir-filtros');
        if (btnAbrir) btnAbrir.addEventListener('click', () => this._abrirSheet());

        const btnCerrar = this.container.querySelector('#btn-cerrar-filtros');
        if (btnCerrar) btnCerrar.addEventListener('click', () => this._cerrarSheet());
    }

    bindSheetEvents() {
        const debouncedSearch = debounce(() => {
            this.state.busqueda = this.elements.busqueda?.value.trim() || '';
            if (this.elements.clearBusqueda) {
                this.elements.clearBusqueda.hidden = !this.state.busqueda;
            }
            this.onFilterChange();
        }, this.options.debounceMs);
        this.elements.busqueda?.addEventListener('input', debouncedSearch);

        this.elements.clearBusqueda?.addEventListener('click', () => {
            this.state.busqueda = '';
            if (this.elements.busqueda) this.elements.busqueda.value = '';
            if (this.elements.clearBusqueda) this.elements.clearBusqueda.hidden = true;
            this.onFilterChange();
        });

        const debouncedUbicacion = debounce(() => {
            this.state.ubicacion = this.elements.ubicacion?.value.trim() || '';
            this.onFilterChange();
        }, this.options.debounceMs);
        this.elements.ubicacion?.addEventListener('input', debouncedUbicacion);

        this.bindSalarioEvents();
        this.bindFechaChips();

        this.elements.btnAplicar?.addEventListener('click', () => {
            this._cerrarSheet();
            this._actualizarBadge();
            this.notifyChange();
        });

        this.elements.limpiar?.addEventListener('click', () => this.clearAll());
    }

    bindSalarioEvents() {
        const debouncedSalario = debounce(() => {
            this.state.salarioMin = parseInt(this.elements.salarioMin?.value) || 0;
            this.state.salarioMax = parseInt(this.elements.salarioMax?.value) || 5000;
            this.onFilterChange();
        }, this.options.debounceMs);
        this.elements.salarioMin?.addEventListener('input', debouncedSalario);
        this.elements.salarioMax?.addEventListener('input', debouncedSalario);
    }

    bindFechaChips() {
        this.container.querySelectorAll('.fecha-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                this.state.fechaPublicacion = btn.dataset.value;
                this.container.querySelectorAll('.fecha-chip').forEach(b => {
                    b.classList.toggle('active', b.dataset.value === this.state.fechaPublicacion);
                });
                this.onFilterChange();
            });
        });
    }

    bindSharedEvents() {
        this.elements.overlay?.addEventListener('click', () => this._cerrarSheet());
        window.addEventListener('resize', debounce(() => {
            this.isMobile = window.innerWidth <= 768;
        }, 150));
    }

    // --- Sheet ---

    _abrirSheet() {
        if (this.elements.sheet) this.elements.sheet.setAttribute('aria-hidden', 'false');
        this.elements.overlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    _cerrarSheet() {
        // Mover foco fuera del sheet antes de ocultarlo (evita warning aria-hidden)
        if (document.activeElement?.closest('#filtros-sheet')) {
            this.container.querySelector('#btn-abrir-filtros')?.focus();
        }
        if (this.elements.sheet) this.elements.sheet.setAttribute('aria-hidden', 'true');
        this.elements.overlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    // --- Filtros ---

    onFilterChange() {
        this._actualizarBadge();
        this.persistState();
        // notifyChange() NO se llama aquí — solo al pulsar "Filtrar"
    }

    _actualizarBadge() {
        if (this.elements.badge) {
            this.elements.badge.hidden = !hayFiltrosActivos(this.state);
        }
    }

    // --- Sincronización ---

    syncControls() {
        if (this.elements.busqueda) this.elements.busqueda.value = this.state.busqueda;
        if (this.elements.clearBusqueda) this.elements.clearBusqueda.hidden = !this.state.busqueda;
        if (this.elements.ubicacion) this.elements.ubicacion.value = this.state.ubicacion;

        this.components.categorias?.setValues?.(this.state.categorias, true);
        this.components.ordenar?.setValue?.(this.state.ordenar, true);
        this.components.distancia?.setValue?.(this.state.distanciaMax, true);

        if (this.elements.salarioMin) this.elements.salarioMin.value = this.state.salarioMin || '';
        if (this.elements.salarioMax) {
            this.elements.salarioMax.value = this.state.salarioMax >= 5000 ? '' : this.state.salarioMax;
        }

        this.container.querySelectorAll('.fecha-chip').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === this.state.fechaPublicacion);
        });
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

    // --- API Pública ---

    getState() { return { ...this.state }; }

    setState(newState, silent = false) {
        this.state = { ...this.state, ...newState };
        this.syncControls();
        this._actualizarBadge();
        this.persistState();
        if (!silent) this.notifyChange();
    }

    onChange(callback) { this.callbacks.onChange = callback; }
    onClear(callback) { this.callbacks.onClear = callback; }

    clearAll() {
        this.state = { ...DEFAULT_STATE };
        this.resetComponents();
        this._actualizarBadge();
        this.persistState();
        this._cerrarSheet();
        if (this.callbacks.onClear) this.callbacks.onClear();
        this.notifyChange();
    }

    resetComponents() {
        if (this.elements.busqueda) this.elements.busqueda.value = '';
        if (this.elements.clearBusqueda) this.elements.clearBusqueda.hidden = true;
        if (this.elements.ubicacion) this.elements.ubicacion.value = '';
        this.components.categorias?.clearAll?.(true);
        this.components.ordenar?.setValue?.('recientes', true);
        this.components.distancia?.setValue?.('', true);
        if (this.elements.salarioMin) this.elements.salarioMin.value = '';
        if (this.elements.salarioMax) this.elements.salarioMax.value = '';
        this.container.querySelectorAll('.fecha-chip').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === '');
        });
    }

    setUserLocation(ubicacion) {
        this.userLocation = ubicacion;
        if (this.elements.distanciaGrupo) {
            this.elements.distanciaGrupo.hidden = !ubicacion;
        }
    }

    updateResultsCount(mostradas, total) {
        // No-op en el nuevo diseño (sin contador visible)
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
