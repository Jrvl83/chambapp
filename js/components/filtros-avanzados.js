/**
 * Filtros Avanzados - ChambApp
 * Task 24: Sistema de filtros profesional con dropdowns custom,
 * multiselect, range slider y persistencia
 */

// ============================================
// CONSTANTES
// ============================================
const CATEGORIAS = [
    { value: 'construccion', label: 'Construccion', icon: '🏗️' },
    { value: 'electricidad', label: 'Electricidad', icon: '⚡' },
    { value: 'gasfiteria', label: 'Gasfiteria', icon: '🔧' },
    { value: 'pintura', label: 'Pintura', icon: '🎨' },
    { value: 'carpinteria', label: 'Carpinteria', icon: '🪚' },
    { value: 'limpieza', label: 'Limpieza', icon: '🧹' },
    { value: 'jardineria', label: 'Jardineria', icon: '🌱' },
    { value: 'mecanica', label: 'Mecanica', icon: '🔩' },
    { value: 'otros', label: 'Otros', icon: '📦' }
];

const DISTANCIAS = [
    { value: '', label: 'Cualquier distancia' },
    { value: '5', label: 'Hasta 5 km' },
    { value: '10', label: 'Hasta 10 km' },
    { value: '20', label: 'Hasta 20 km' },
    { value: '50', label: 'Hasta 50 km' }
];

const FECHAS = [
    { value: '', label: 'Cualquier fecha' },
    { value: 'hoy', label: 'Hoy' },
    { value: 'ultimos3', label: 'Ultimos 3 dias' },
    { value: 'ultimos7', label: 'Ultimos 7 dias' }
];

const ORDENAR = [
    { value: 'recientes', label: 'Mas recientes' },
    { value: 'cercanas', label: 'Mas cercanas' },
    { value: 'salario-desc', label: 'Mayor salario' },
    { value: 'salario-asc', label: 'Menor salario' }
];

const STORAGE_KEY = 'chambapp-dashboard-filtros';

// ============================================
// UTILIDADES
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatearSalario(valor) {
    if (valor >= 5000) return 'S/ 5,000+';
    return 'S/ ' + valor.toLocaleString('es-PE');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// CLASE: CustomDropdown
// ============================================
class CustomDropdown {
    constructor(container, options = {}) {
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;

        this.options = {
            placeholder: 'Seleccionar...',
            items: [],
            value: '',
            onChange: null,
            ...options
        };

        this.isOpen = false;
        this.selectedIndex = -1;
        this.value = this.options.value;

        this.render();
        this.bindEvents();
    }

    render() {
        const selectedItem = this.options.items.find(i => i.value === this.value);
        const displayText = selectedItem ? selectedItem.label : this.options.placeholder;
        const isPlaceholder = !selectedItem;

        this.container.innerHTML = `
            <button class="dropdown-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                <span class="dropdown-value ${isPlaceholder ? 'placeholder' : ''}">${escapeHtml(displayText)}</span>
                <span class="dropdown-arrow" aria-hidden="true"></span>
            </button>
            <div class="dropdown-menu" role="listbox">
                ${this.options.items.map((item, index) => `
                    <div class="dropdown-option ${item.value === this.value ? 'selected' : ''}"
                         role="option"
                         data-value="${escapeHtml(item.value)}"
                         data-index="${index}"
                         tabindex="-1"
                         aria-selected="${item.value === this.value}">
                        ${item.icon ? `<span class="option-icon">${item.icon}</span>` : ''}
                        ${item.color ? `<span class="categoria-dot ${escapeHtml(item.value)}"></span>` : ''}
                        <span class="option-label">${escapeHtml(item.label)}</span>
                    </div>
                `).join('')}
            </div>
        `;

        this.trigger = this.container.querySelector('.dropdown-trigger');
        this.menu = this.container.querySelector('.dropdown-menu');
        this.valueDisplay = this.container.querySelector('.dropdown-value');
    }

    bindEvents() {
        // Click en trigger
        this.trigger.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });

        // Click en opciones
        this.menu.addEventListener('click', (e) => {
            const option = e.target.closest('.dropdown-option');
            if (option) {
                this.selectByValue(option.dataset.value);
            }
        });

        // Keyboard navigation
        this.trigger.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.menu.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Click fuera para cerrar
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.close();
            }
        });
    }

    handleKeydown(e) {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (this.isOpen) {
                    const focused = this.menu.querySelector('.dropdown-option:focus');
                    if (focused) {
                        this.selectByValue(focused.dataset.value);
                    }
                } else {
                    this.open();
                }
                break;
            case 'Escape':
                this.close();
                this.trigger.focus();
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!this.isOpen) {
                    this.open();
                } else {
                    this.focusNext();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (this.isOpen) {
                    this.focusPrev();
                }
                break;
            case 'Tab':
                if (this.isOpen) {
                    this.close();
                }
                break;
        }
    }

    focusNext() {
        const options = this.menu.querySelectorAll('.dropdown-option');
        const focused = this.menu.querySelector('.dropdown-option:focus');
        const currentIndex = focused ? parseInt(focused.dataset.index) : -1;
        const nextIndex = Math.min(currentIndex + 1, options.length - 1);
        options[nextIndex]?.focus();
    }

    focusPrev() {
        const options = this.menu.querySelectorAll('.dropdown-option');
        const focused = this.menu.querySelector('.dropdown-option:focus');
        const currentIndex = focused ? parseInt(focused.dataset.index) : options.length;
        const prevIndex = Math.max(currentIndex - 1, 0);
        options[prevIndex]?.focus();
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.trigger.setAttribute('aria-expanded', 'true');
        this.menu.classList.add('open');

        // Focus en opcion seleccionada o primera
        const selected = this.menu.querySelector('.dropdown-option.selected')
            || this.menu.querySelector('.dropdown-option');
        selected?.focus();
    }

    close() {
        this.isOpen = false;
        this.trigger.setAttribute('aria-expanded', 'false');
        this.menu.classList.remove('open');
    }

    selectByValue(value) {
        const oldValue = this.value;
        this.value = value;

        // Actualizar UI
        const item = this.options.items.find(i => i.value === value);
        this.valueDisplay.textContent = item ? item.label : this.options.placeholder;
        this.valueDisplay.classList.toggle('placeholder', !item || !value);

        // Actualizar selected
        this.menu.querySelectorAll('.dropdown-option').forEach(opt => {
            const isSelected = opt.dataset.value === value;
            opt.classList.toggle('selected', isSelected);
            opt.setAttribute('aria-selected', isSelected);
        });

        this.close();
        this.trigger.focus();

        // Callback
        if (oldValue !== value && this.options.onChange) {
            this.options.onChange(value);
        }
    }

    getValue() {
        return this.value;
    }

    setValue(value, silent = false) {
        const oldValue = this.value;
        this.value = value;

        const item = this.options.items.find(i => i.value === value);
        this.valueDisplay.textContent = item ? item.label : this.options.placeholder;
        this.valueDisplay.classList.toggle('placeholder', !item || !value);

        this.menu.querySelectorAll('.dropdown-option').forEach(opt => {
            const isSelected = opt.dataset.value === value;
            opt.classList.toggle('selected', isSelected);
            opt.setAttribute('aria-selected', isSelected);
        });

        if (!silent && oldValue !== value && this.options.onChange) {
            this.options.onChange(value);
        }
    }

    destroy() {
        this.container.innerHTML = '';
    }
}

// ============================================
// CLASE: MultiSelectDropdown
// ============================================
class MultiSelectDropdown {
    constructor(container, options = {}) {
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;

        this.options = {
            placeholder: 'Seleccionar...',
            placeholderMultiple: '{count} seleccionadas',
            items: [],
            values: [],
            onChange: null,
            showColors: false,
            ...options
        };

        this.isOpen = false;
        this.values = [...this.options.values];

        this.render();
        this.bindEvents();
    }

    render() {
        const displayText = this.getDisplayText();
        const isPlaceholder = this.values.length === 0;

        this.container.innerHTML = `
            <button class="dropdown-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                <span class="dropdown-value ${isPlaceholder ? 'placeholder' : ''}">${escapeHtml(displayText)}</span>
                <span class="dropdown-arrow" aria-hidden="true"></span>
            </button>
            <div class="dropdown-menu" role="listbox" aria-multiselectable="true">
                ${this.options.items.map((item, index) => `
                    <div class="dropdown-option"
                         role="option"
                         data-value="${escapeHtml(item.value)}"
                         data-index="${index}"
                         tabindex="-1"
                         aria-selected="${this.values.includes(item.value)}">
                        <input type="checkbox"
                               ${this.values.includes(item.value) ? 'checked' : ''}
                               tabindex="-1"
                               aria-hidden="true">
                        ${this.options.showColors ? `<span class="categoria-dot ${escapeHtml(item.value)}"></span>` : ''}
                        ${item.icon ? `<span class="option-icon">${item.icon}</span>` : ''}
                        <span class="option-label">${escapeHtml(item.label)}</span>
                    </div>
                `).join('')}
            </div>
        `;

        this.trigger = this.container.querySelector('.dropdown-trigger');
        this.menu = this.container.querySelector('.dropdown-menu');
        this.valueDisplay = this.container.querySelector('.dropdown-value');
    }

    getDisplayText() {
        if (this.values.length === 0) {
            return this.options.placeholder;
        }
        if (this.values.length === 1) {
            const item = this.options.items.find(i => i.value === this.values[0]);
            return item ? item.label : this.values[0];
        }
        return this.options.placeholderMultiple.replace('{count}', this.values.length);
    }

    bindEvents() {
        this.trigger.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });

        this.menu.addEventListener('click', (e) => {
            const option = e.target.closest('.dropdown-option');
            if (option) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleValue(option.dataset.value);
            }
        });

        this.trigger.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.menu.addEventListener('keydown', (e) => this.handleKeydown(e));

        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.close();
            }
        });
    }

    handleKeydown(e) {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (this.isOpen) {
                    const focused = this.menu.querySelector('.dropdown-option:focus');
                    if (focused) {
                        this.toggleValue(focused.dataset.value);
                    }
                } else {
                    this.open();
                }
                break;
            case 'Escape':
                this.close();
                this.trigger.focus();
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!this.isOpen) {
                    this.open();
                } else {
                    this.focusNext();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (this.isOpen) {
                    this.focusPrev();
                }
                break;
            case 'Tab':
                if (this.isOpen) {
                    this.close();
                }
                break;
        }
    }

    focusNext() {
        const options = this.menu.querySelectorAll('.dropdown-option');
        const focused = this.menu.querySelector('.dropdown-option:focus');
        const currentIndex = focused ? parseInt(focused.dataset.index) : -1;
        const nextIndex = Math.min(currentIndex + 1, options.length - 1);
        options[nextIndex]?.focus();
    }

    focusPrev() {
        const options = this.menu.querySelectorAll('.dropdown-option');
        const focused = this.menu.querySelector('.dropdown-option:focus');
        const currentIndex = focused ? parseInt(focused.dataset.index) : options.length;
        const prevIndex = Math.max(currentIndex - 1, 0);
        options[prevIndex]?.focus();
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.trigger.setAttribute('aria-expanded', 'true');
        this.menu.classList.add('open');

        const first = this.menu.querySelector('.dropdown-option');
        first?.focus();
    }

    close() {
        this.isOpen = false;
        this.trigger.setAttribute('aria-expanded', 'false');
        this.menu.classList.remove('open');
    }

    toggleValue(value) {
        const index = this.values.indexOf(value);
        if (index === -1) {
            this.values.push(value);
        } else {
            this.values.splice(index, 1);
        }

        this.updateUI();

        if (this.options.onChange) {
            this.options.onChange([...this.values]);
        }
    }

    updateUI() {
        this.valueDisplay.textContent = this.getDisplayText();
        this.valueDisplay.classList.toggle('placeholder', this.values.length === 0);

        this.menu.querySelectorAll('.dropdown-option').forEach(opt => {
            const isSelected = this.values.includes(opt.dataset.value);
            opt.setAttribute('aria-selected', isSelected);
            opt.querySelector('input[type="checkbox"]').checked = isSelected;
        });
    }

    getValues() {
        return [...this.values];
    }

    setValues(values, silent = false) {
        const oldValues = [...this.values];
        this.values = [...values];
        this.updateUI();

        if (!silent && JSON.stringify(oldValues) !== JSON.stringify(values) && this.options.onChange) {
            this.options.onChange([...this.values]);
        }
    }

    clearAll(silent = false) {
        this.setValues([], silent);
    }

    destroy() {
        this.container.innerHTML = '';
    }
}

// ============================================
// CLASE: DualRangeSlider
// ============================================
class DualRangeSlider {
    constructor(container, options = {}) {
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;

        this.options = {
            min: 0,
            max: 5000,
            step: 50,
            valueMin: 0,
            valueMax: 5000,
            formatValue: (v) => `S/ ${v.toLocaleString('es-PE')}`,
            formatMax: (v) => v >= 5000 ? 'S/ 5,000+' : `S/ ${v.toLocaleString('es-PE')}`,
            onChange: null,
            ...options
        };

        this.valueMin = this.options.valueMin;
        this.valueMax = this.options.valueMax;

        this.render();
        this.bindEvents();
        this.updateTrack();
    }

    render() {
        this.container.innerHTML = `
            <div class="range-values">
                <span class="range-min-value">${this.options.formatValue(this.valueMin)}</span>
                <span class="range-max-value">${this.options.formatMax(this.valueMax)}</span>
            </div>
            <div class="range-track">
                <div class="range-fill"></div>
                <input type="range"
                       class="range-input range-min"
                       min="${this.options.min}"
                       max="${this.options.max}"
                       step="${this.options.step}"
                       value="${this.valueMin}"
                       aria-label="Salario minimo">
                <input type="range"
                       class="range-input range-max"
                       min="${this.options.min}"
                       max="${this.options.max}"
                       step="${this.options.step}"
                       value="${this.valueMax}"
                       aria-label="Salario maximo">
            </div>
        `;

        this.rangeMin = this.container.querySelector('.range-min');
        this.rangeMax = this.container.querySelector('.range-max');
        this.fill = this.container.querySelector('.range-fill');
        this.minDisplay = this.container.querySelector('.range-min-value');
        this.maxDisplay = this.container.querySelector('.range-max-value');
    }

    bindEvents() {
        const debouncedChange = debounce(() => {
            if (this.options.onChange) {
                this.options.onChange({ min: this.valueMin, max: this.valueMax });
            }
        }, 150);

        this.rangeMin.addEventListener('input', () => {
            let val = parseInt(this.rangeMin.value);
            if (val > this.valueMax - this.options.step) {
                val = this.valueMax - this.options.step;
                this.rangeMin.value = val;
            }
            this.valueMin = val;
            this.updateTrack();
            this.minDisplay.textContent = this.options.formatValue(this.valueMin);
            debouncedChange();
        });

        this.rangeMax.addEventListener('input', () => {
            let val = parseInt(this.rangeMax.value);
            if (val < this.valueMin + this.options.step) {
                val = this.valueMin + this.options.step;
                this.rangeMax.value = val;
            }
            this.valueMax = val;
            this.updateTrack();
            this.maxDisplay.textContent = this.options.formatMax(this.valueMax);
            debouncedChange();
        });
    }

    updateTrack() {
        const range = this.options.max - this.options.min;
        const minPercent = ((this.valueMin - this.options.min) / range) * 100;
        const maxPercent = ((this.valueMax - this.options.min) / range) * 100;

        this.fill.style.left = minPercent + '%';
        this.fill.style.width = (maxPercent - minPercent) + '%';
    }

    getValues() {
        return { min: this.valueMin, max: this.valueMax };
    }

    setValues(min, max, silent = false) {
        this.valueMin = min;
        this.valueMax = max;
        this.rangeMin.value = min;
        this.rangeMax.value = max;
        this.minDisplay.textContent = this.options.formatValue(min);
        this.maxDisplay.textContent = this.options.formatMax(max);
        this.updateTrack();

        if (!silent && this.options.onChange) {
            this.options.onChange({ min, max });
        }
    }

    reset(silent = false) {
        this.setValues(this.options.min, this.options.max, silent);
    }

    destroy() {
        this.container.innerHTML = '';
    }
}

// ============================================
// CLASE PRINCIPAL: FiltrosAvanzados
// ============================================
class FiltrosAvanzados {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`FiltrosAvanzados: Container #${containerId} not found`);
            return;
        }

        this.options = {
            persistir: true,
            storageKey: STORAGE_KEY,
            debounceMs: 300,
            ...options
        };

        // Estado inicial
        this.state = {
            busqueda: '',
            categorias: [],
            ubicacion: '',
            distanciaMax: '',
            salarioMin: 0,
            salarioMax: 5000,
            fechaPublicacion: '',
            ordenar: 'recientes'
        };

        // Callbacks
        this.callbacks = {
            onChange: null,
            onClear: null
        };

        // Referencias a componentes
        this.components = {};

        // Ubicacion del usuario (para filtro distancia)
        this.userLocation = null;

        // Collapsed state - colapsado por defecto en móvil
        this.isCollapsed = window.innerWidth <= 768;
        this.isMobile = window.innerWidth <= 768;

        this.init();
    }

    init() {
        this.loadPersistedState();
        this.render();
        this.initComponents();
        this.bindEvents();
        this.updateChips();
        this.updateFilterCount();

        // Aplicar estado inicial colapsado en móvil
        if (this.isCollapsed) {
            this.elements.body.classList.add('collapsed');
            this.elements.toggle.setAttribute('aria-expanded', 'false');
        }
    }

    render() {
        const busquedaVal = escapeHtml(this.state.busqueda);
        const ubicacionVal = escapeHtml(this.state.ubicacion);

        this.container.innerHTML = `
            <!-- Overlay para bottom sheet -->
            <div class="filtros-overlay" id="filtros-overlay"></div>

            <!-- MOBILE: Barra rapida (oculta en desktop via CSS) -->
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
                        <button class="input-icon-clear" id="clear-busqueda-mobile" ${this.state.busqueda ? '' : 'hidden'} aria-label="Limpiar busqueda" type="button">✕</button>
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

            <!-- DESKTOP: Header toggle (oculto en movil via CSS) -->
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

            <!-- Chips de filtros activos -->
            <div class="filtros-chips" id="filtros-chips"></div>

            <!-- Body: panel expandible (desktop) / bottom sheet (movil) -->
            <div class="filtros-body" id="filtros-body">
                <!-- DESKTOP: filas originales (ocultas en movil via CSS) -->
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
                            <button class="input-icon-clear" id="clear-busqueda" ${this.state.busqueda ? '' : 'hidden'} aria-label="Limpiar busqueda" type="button">✕</button>
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

                <div class="filtros-row filtros-desktop-only">
                    <div class="filtro-grupo filtro-categorias">
                        <label>🏷️ Categorias</label>
                        <div class="dropdown-custom" id="dropdown-categorias"></div>
                    </div>
                    <div class="filtro-grupo filtro-distancia" id="filtro-distancia-grupo" ${this.userLocation ? '' : 'hidden'}>
                        <label>📏 Distancia</label>
                        <div class="dropdown-custom" id="dropdown-distancia"></div>
                    </div>
                    <div class="filtro-grupo filtro-salario">
                        <label>💰 Rango Salarial</label>
                        <div class="range-slider-container" id="salario-slider"></div>
                    </div>
                </div>

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

                <!-- MOBILE: contenido del sheet (oculto en desktop via CSS) -->
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
                        <div class="filtro-grupo filtro-distancia" id="filtro-distancia-grupo-mobile" ${this.userLocation ? '' : 'hidden'}>
                            <label>📏 Distancia</label>
                            <div class="dropdown-custom" id="dropdown-distancia-mobile"></div>
                        </div>
                    </div>

                    <div class="filtro-grupo filtro-salario">
                        <label>💰 Rango Salarial</label>
                        <div class="salario-inputs">
                            <input type="number" id="salario-min" placeholder="Min S/" min="0" max="5000" step="50" value="${this.state.salarioMin || ''}">
                            <span class="salario-separator">—</span>
                            <input type="number" id="salario-max" placeholder="Max S/" min="0" max="5000" step="50" value="${this.state.salarioMax >= 5000 ? '' : this.state.salarioMax}">
                        </div>
                    </div>

                    <div class="filtro-grupo filtro-fecha">
                        <label>📅 Publicacion</label>
                        <div class="fecha-chips">
                            <button type="button" class="fecha-chip ${this.state.fechaPublicacion === 'hoy' ? 'active' : ''}" data-value="hoy">Hoy</button>
                            <button type="button" class="fecha-chip ${this.state.fechaPublicacion === 'ultimos3' ? 'active' : ''}" data-value="ultimos3">3 dias</button>
                            <button type="button" class="fecha-chip ${this.state.fechaPublicacion === 'ultimos7' ? 'active' : ''}" data-value="ultimos7">7 dias</button>
                            <button type="button" class="fecha-chip ${!this.state.fechaPublicacion ? 'active' : ''}" data-value="">Todas</button>
                        </div>
                    </div>
                </div>

                <!-- Boton Aplicar (visible solo en movil via CSS) -->
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

        // Referencias - Desktop
        this.elements = {
            toggle: this.container.querySelector('.filtros-toggle'),
            body: this.container.querySelector('.filtros-body'),
            limpiar: this.container.querySelector('#btn-limpiar-filtros'),
            busqueda: this.container.querySelector('#filtro-texto'),
            clearBusqueda: this.container.querySelector('#clear-busqueda'),
            ubicacion: this.container.querySelector('#filtro-ubicacion'),
            ubicacionDropdown: this.container.querySelector('#ubicacion-dropdown'),
            chips: this.container.querySelector('#filtros-chips'),
            resultados: this.container.querySelector('#filtros-resultados'),
            badge: this.container.querySelector('#filtros-count'),
            distanciaGrupo: this.container.querySelector('#filtro-distancia-grupo'),
            btnAplicar: this.container.querySelector('#btn-aplicar-filtros'),
            // Referencias - Mobile
            busquedaMobile: this.container.querySelector('#filtro-texto-mobile'),
            clearBusquedaMobile: this.container.querySelector('#clear-busqueda-mobile'),
            ubicacionMobile: this.container.querySelector('#filtro-ubicacion-mobile'),
            btnToggleAvanzados: this.container.querySelector('#btn-toggle-avanzados'),
            limpiarMobile: this.container.querySelector('#btn-limpiar-mobile'),
            badgeMobile: this.container.querySelector('#filtros-count-mobile'),
            salarioMin: this.container.querySelector('#salario-min'),
            salarioMax: this.container.querySelector('#salario-max'),
            distanciaGrupoMobile: this.container.querySelector('#filtro-distancia-grupo-mobile'),
            overlay: this.container.querySelector('#filtros-overlay')
        };
    }

    initComponents() {
        // === DESKTOP COMPONENTS ===

        // Multiselect Categorias (desktop)
        this.components.categorias = new MultiSelectDropdown('#dropdown-categorias', {
            placeholder: 'Todas las categorias',
            placeholderMultiple: '{count} categorias',
            items: CATEGORIAS.map(c => ({ ...c, color: true })),
            values: this.state.categorias,
            showColors: true,
            onChange: (values) => {
                this.state.categorias = values;
                this.syncControls();
                this.onFilterChange();
            }
        });

        // Dropdown Distancia (desktop)
        this.components.distancia = new CustomDropdown('#dropdown-distancia', {
            placeholder: 'Cualquier distancia',
            items: DISTANCIAS,
            value: this.state.distanciaMax,
            onChange: (value) => {
                this.state.distanciaMax = value;
                this.syncControls();
                this.onFilterChange();
            }
        });

        // Dropdown Fecha (desktop)
        this.components.fecha = new CustomDropdown('#dropdown-fecha', {
            placeholder: 'Cualquier fecha',
            items: FECHAS,
            value: this.state.fechaPublicacion,
            onChange: (value) => {
                this.state.fechaPublicacion = value;
                this.syncControls();
                this.onFilterChange();
            }
        });

        // Dropdown Ordenar (desktop)
        this.components.ordenar = new CustomDropdown('#dropdown-ordenar', {
            placeholder: 'Mas recientes',
            items: ORDENAR,
            value: this.state.ordenar,
            onChange: (value) => {
                this.state.ordenar = value;
                this.syncControls();
                this.onFilterChange();
            }
        });

        // Range Slider Salario (desktop)
        this.components.salario = new DualRangeSlider('#salario-slider', {
            min: 0,
            max: 5000,
            step: 50,
            valueMin: this.state.salarioMin,
            valueMax: this.state.salarioMax,
            onChange: ({ min, max }) => {
                this.state.salarioMin = min;
                this.state.salarioMax = max;
                this.syncControls();
                this.onFilterChange();
            }
        });

        // === MOBILE COMPONENTS ===

        // Multiselect Categorias (mobile)
        this.components.categoriasMobile = new MultiSelectDropdown('#dropdown-categorias-mobile', {
            placeholder: 'Categorias',
            placeholderMultiple: '{count} cats.',
            items: CATEGORIAS.map(c => ({ ...c, color: true })),
            values: this.state.categorias,
            showColors: true,
            onChange: (values) => {
                this.state.categorias = values;
                this.syncControls();
                this.onFilterChange();
            }
        });

        // Dropdown Ordenar (mobile)
        this.components.ordenarMobile = new CustomDropdown('#dropdown-ordenar-mobile', {
            placeholder: 'Recientes',
            items: ORDENAR,
            value: this.state.ordenar,
            onChange: (value) => {
                this.state.ordenar = value;
                this.syncControls();
                this.onFilterChange();
            }
        });

        // Dropdown Distancia (mobile)
        this.components.distanciaMobile = new CustomDropdown('#dropdown-distancia-mobile', {
            placeholder: 'Cualquier',
            items: DISTANCIAS,
            value: this.state.distanciaMax,
            onChange: (value) => {
                this.state.distanciaMax = value;
                this.syncControls();
                this.onFilterChange();
            }
        });
    }

    bindEvents() {
        // === DESKTOP EVENTS ===

        // Toggle collapse (desktop header)
        this.elements.toggle.addEventListener('click', () => this.toggleCollapse());

        // Limpiar todo (desktop)
        this.elements.limpiar.addEventListener('click', () => this.clearAll());

        // Busqueda desktop con debounce
        const debouncedSearchDesktop = debounce(() => {
            this.state.busqueda = this.elements.busqueda.value.trim();
            this.elements.clearBusqueda.hidden = !this.state.busqueda;
            this.syncControls();
            this.onFilterChange();
        }, this.options.debounceMs);

        this.elements.busqueda.addEventListener('input', debouncedSearchDesktop);

        // Clear busqueda desktop
        this.elements.clearBusqueda.addEventListener('click', () => {
            this.state.busqueda = '';
            this.syncControls();
            this.onFilterChange();
            this.elements.busqueda.focus();
        });

        // Ubicacion desktop con debounce
        const debouncedUbicacionDesktop = debounce(() => {
            this.state.ubicacion = this.elements.ubicacion.value.trim();
            this.syncControls();
            this.onFilterChange();
        }, this.options.debounceMs);

        this.elements.ubicacion.addEventListener('input', debouncedUbicacionDesktop);

        // === MOBILE EVENTS ===

        // Toggle bottom sheet (mobile ⚙️ button)
        this.elements.btnToggleAvanzados.addEventListener('click', () => this.toggleCollapse());

        // Limpiar todo (mobile)
        this.elements.limpiarMobile.addEventListener('click', () => this.clearAll());

        // Aplicar filtros (cierra el bottom sheet en movil)
        if (this.elements.btnAplicar) {
            this.elements.btnAplicar.addEventListener('click', () => this.closeSheet());
        }

        // Busqueda mobile con debounce
        const debouncedSearchMobile = debounce(() => {
            this.state.busqueda = this.elements.busquedaMobile.value.trim();
            this.syncControls();
            this.onFilterChange();
        }, this.options.debounceMs);

        this.elements.busquedaMobile.addEventListener('input', debouncedSearchMobile);

        // Clear busqueda mobile
        this.elements.clearBusquedaMobile.addEventListener('click', () => {
            this.state.busqueda = '';
            this.syncControls();
            this.onFilterChange();
            this.elements.busquedaMobile.focus();
        });

        // Ubicacion mobile con debounce
        const debouncedUbicacionMobile = debounce(() => {
            this.state.ubicacion = this.elements.ubicacionMobile.value.trim();
            this.syncControls();
            this.onFilterChange();
        }, this.options.debounceMs);

        this.elements.ubicacionMobile.addEventListener('input', debouncedUbicacionMobile);

        // Salario inputs mobile con debounce
        const debouncedSalario = debounce(() => {
            const min = parseInt(this.elements.salarioMin.value) || 0;
            const max = parseInt(this.elements.salarioMax.value) || 5000;
            this.state.salarioMin = min;
            this.state.salarioMax = max;
            this.syncControls();
            this.onFilterChange();
        }, this.options.debounceMs);

        this.elements.salarioMin.addEventListener('input', debouncedSalario);
        this.elements.salarioMax.addEventListener('input', debouncedSalario);

        // Fecha chips mobile
        this.container.querySelectorAll('.fecha-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                this.state.fechaPublicacion = btn.dataset.value;
                this.syncControls();
                this.onFilterChange();
            });
        });

        // === SHARED EVENTS ===

        // Cerrar bottom sheet al hacer clic en overlay (movil)
        this.elements.overlay.addEventListener('click', () => {
            this.closeSheet();
        });

        // Manejar resize de ventana
        window.addEventListener('resize', debounce(() => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;

            if (wasMobile !== this.isMobile) {
                if (!this.isMobile) {
                    // Paso a desktop: expandir filtros, quitar clases movil
                    this.isCollapsed = false;
                    this.elements.body.classList.remove('collapsed');
                    this.container.classList.remove('sheet-open');
                    this.elements.overlay.classList.remove('active');
                    document.body.style.overflow = '';
                } else {
                    // Paso a movil: colapsar filtros
                    this.isCollapsed = true;
                    this.elements.body.classList.add('collapsed');
                }
                this.elements.toggle.setAttribute('aria-expanded', !this.isCollapsed);
                this.syncControls();
            }
        }, 150));
    }

    syncControls() {
        // Sync busqueda
        this.elements.busqueda.value = this.state.busqueda;
        this.elements.clearBusqueda.hidden = !this.state.busqueda;
        this.elements.busquedaMobile.value = this.state.busqueda;
        this.elements.clearBusquedaMobile.hidden = !this.state.busqueda;

        // Sync ubicacion
        this.elements.ubicacion.value = this.state.ubicacion;
        this.elements.ubicacionMobile.value = this.state.ubicacion;

        // Sync categorias (silent=true para evitar loop)
        this.components.categorias.setValues?.(this.state.categorias, true);
        this.components.categoriasMobile.setValues?.(this.state.categorias, true);

        // Sync ordenar
        this.components.ordenar.setValue?.(this.state.ordenar, true);
        this.components.ordenarMobile.setValue?.(this.state.ordenar, true);

        // Sync distancia
        this.components.distancia.setValue?.(this.state.distanciaMax, true);
        this.components.distanciaMobile.setValue?.(this.state.distanciaMax, true);

        // Sync salario (desktop slider + mobile inputs)
        this.components.salario.setValues?.(this.state.salarioMin, this.state.salarioMax, true);
        this.elements.salarioMin.value = this.state.salarioMin || '';
        this.elements.salarioMax.value = this.state.salarioMax >= 5000 ? '' : this.state.salarioMax;

        // Sync fecha (desktop dropdown + mobile chips)
        this.components.fecha.setValue?.(this.state.fechaPublicacion, true);
        this.container.querySelectorAll('.fecha-chip').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === this.state.fechaPublicacion);
        });
    }

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        this.elements.body.classList.toggle('collapsed', this.isCollapsed);
        this.elements.toggle.setAttribute('aria-expanded', !this.isCollapsed);

        // Manejar bottom sheet en móvil
        if (this.isMobile) {
            this.container.classList.toggle('sheet-open', !this.isCollapsed);
            this.elements.overlay.classList.toggle('active', !this.isCollapsed);

            // Bloquear scroll del body cuando el sheet está abierto
            document.body.style.overflow = this.isCollapsed ? '' : 'hidden';
        }
    }

    closeSheet() {
        if (!this.isCollapsed) {
            this.toggleCollapse();
        }
    }

    onFilterChange() {
        this.updateChips();
        this.updateFilterCount();
        this.persistState();
        this.notifyChange();
    }

    updateChips() {
        const chips = [];

        // Busqueda
        if (this.state.busqueda) {
            chips.push({
                type: 'busqueda',
                icon: '🔎',
                label: this.state.busqueda,
                onRemove: () => {
                    this.state.busqueda = '';
                    this.syncControls();
                    this.onFilterChange();
                }
            });
        }

        // Categorias
        this.state.categorias.forEach(cat => {
            const item = CATEGORIAS.find(c => c.value === cat);
            if (item) {
                chips.push({
                    type: 'categoria',
                    icon: item.icon,
                    label: item.label,
                    onRemove: () => {
                        this.state.categorias = this.state.categorias.filter(v => v !== cat);
                        this.syncControls();
                        this.onFilterChange();
                    }
                });
            }
        });

        // Ubicacion
        if (this.state.ubicacion) {
            chips.push({
                type: 'ubicacion',
                icon: '📍',
                label: this.state.ubicacion,
                onRemove: () => {
                    this.state.ubicacion = '';
                    this.syncControls();
                    this.onFilterChange();
                }
            });
        }

        // Distancia
        if (this.state.distanciaMax) {
            const item = DISTANCIAS.find(d => d.value === this.state.distanciaMax);
            chips.push({
                type: 'distancia',
                icon: '📏',
                label: item ? item.label : `${this.state.distanciaMax} km`,
                onRemove: () => {
                    this.state.distanciaMax = '';
                    this.syncControls();
                    this.onFilterChange();
                }
            });
        }

        // Salario (solo si no es el rango completo)
        if (this.state.salarioMin > 0 || this.state.salarioMax < 5000) {
            const minText = formatearSalario(this.state.salarioMin);
            const maxText = this.state.salarioMax >= 5000 ? 'S/ 5,000+' : formatearSalario(this.state.salarioMax);
            chips.push({
                type: 'salario',
                icon: '💰',
                label: `${minText} - ${maxText}`,
                onRemove: () => {
                    this.state.salarioMin = 0;
                    this.state.salarioMax = 5000;
                    this.syncControls();
                    this.onFilterChange();
                }
            });
        }

        // Fecha
        if (this.state.fechaPublicacion) {
            const item = FECHAS.find(f => f.value === this.state.fechaPublicacion);
            chips.push({
                type: 'fecha',
                icon: '📅',
                label: item ? item.label : this.state.fechaPublicacion,
                onRemove: () => {
                    this.state.fechaPublicacion = '';
                    this.syncControls();
                    this.onFilterChange();
                }
            });
        }

        // Renderizar chips
        this.elements.chips.innerHTML = chips.map((chip, i) => `
            <span class="chip" data-type="${chip.type}" data-index="${i}">
                <span class="chip-icon">${chip.icon}</span>
                <span class="chip-label">${escapeHtml(chip.label)}</span>
                <button class="chip-remove" aria-label="Quitar filtro ${escapeHtml(chip.label)}" type="button">✕</button>
            </span>
        `).join('');

        // Bind remove events
        this.elements.chips.querySelectorAll('.chip-remove').forEach((btn, i) => {
            btn.addEventListener('click', () => chips[i].onRemove());
        });
    }

    updateFilterCount() {
        let count = 0;

        if (this.state.busqueda) count++;
        count += this.state.categorias.length;
        if (this.state.ubicacion) count++;
        if (this.state.distanciaMax) count++;
        if (this.state.salarioMin > 0 || this.state.salarioMax < 5000) count++;
        if (this.state.fechaPublicacion) count++;

        // Desktop badge
        this.elements.badge.textContent = count;
        this.elements.badge.hidden = count === 0;

        // Mobile badge (solo filtros avanzados: ubicacion, distancia, salario, fecha)
        let countAvanzados = 0;
        if (this.state.ubicacion) countAvanzados++;
        if (this.state.distanciaMax) countAvanzados++;
        if (this.state.salarioMin > 0 || this.state.salarioMax < 5000) countAvanzados++;
        if (this.state.fechaPublicacion) countAvanzados++;

        this.elements.badgeMobile.textContent = countAvanzados;
        this.elements.badgeMobile.hidden = countAvanzados === 0;
    }

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
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
            }
        } catch (e) {
            console.warn('FiltrosAvanzados: No se pudo cargar de localStorage', e);
        }
    }

    notifyChange() {
        if (this.callbacks.onChange) {
            this.callbacks.onChange(this.getState());
        }
    }

    // ============================================
    // API PUBLICA
    // ============================================

    getState() {
        return { ...this.state };
    }

    setState(newState, silent = false) {
        this.state = { ...this.state, ...newState };
        this.syncControls();

        this.updateChips();
        this.updateFilterCount();
        this.persistState();

        if (!silent) {
            this.notifyChange();
        }
    }

    onChange(callback) {
        this.callbacks.onChange = callback;
    }

    onClear(callback) {
        this.callbacks.onClear = callback;
    }

    clearAll() {
        this.state = {
            busqueda: '',
            categorias: [],
            ubicacion: '',
            distanciaMax: '',
            salarioMin: 0,
            salarioMax: 5000,
            fechaPublicacion: '',
            ordenar: 'recientes'
        };

        // Reset desktop components
        this.elements.busqueda.value = '';
        this.elements.clearBusqueda.hidden = true;
        this.elements.ubicacion.value = '';
        this.components.categorias.clearAll(true);
        this.components.distancia.setValue('', true);
        this.components.salario.reset(true);
        this.components.fecha.setValue('', true);
        this.components.ordenar.setValue('recientes', true);

        // Reset mobile components
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

        this.updateChips();
        this.updateFilterCount();
        this.persistState();

        if (this.callbacks.onClear) {
            this.callbacks.onClear();
        }

        this.notifyChange();
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

        // Actualizar boton aplicar con conteo
        if (this.elements.btnAplicar) {
            this.elements.btnAplicar.textContent = `Ver ${mostradas} resultado${mostradas !== 1 ? 's' : ''}`;
        }
    }

    destroy() {
        Object.values(this.components).forEach(c => c.destroy?.());
        this.container.innerHTML = '';
    }
}

// ============================================
// EXPORTAR
// ============================================
window.FiltrosAvanzados = FiltrosAvanzados;
window.CustomDropdown = CustomDropdown;
window.MultiSelectDropdown = MultiSelectDropdown;
window.DualRangeSlider = DualRangeSlider;
