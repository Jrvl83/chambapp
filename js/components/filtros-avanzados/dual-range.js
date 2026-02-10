/**
 * Componente DualRangeSlider - Slider de rango dual
 * @module components/filtros-avanzados/dual-range
 */

import { debounce } from './constants.js';

// ============================================
// CLASE: DualRangeSlider
// ============================================
export class DualRangeSlider {
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
            this.handleMinInput();
            debouncedChange();
        });

        this.rangeMax.addEventListener('input', () => {
            this.handleMaxInput();
            debouncedChange();
        });
    }

    handleMinInput() {
        let val = parseInt(this.rangeMin.value);
        if (val > this.valueMax - this.options.step) {
            val = this.valueMax - this.options.step;
            this.rangeMin.value = val;
        }
        this.valueMin = val;
        this.updateTrack();
        this.minDisplay.textContent = this.options.formatValue(this.valueMin);
    }

    handleMaxInput() {
        let val = parseInt(this.rangeMax.value);
        if (val < this.valueMin + this.options.step) {
            val = this.valueMin + this.options.step;
            this.rangeMax.value = val;
        }
        this.valueMax = val;
        this.updateTrack();
        this.maxDisplay.textContent = this.options.formatMax(this.valueMax);
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
