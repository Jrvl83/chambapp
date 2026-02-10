/**
 * Componente MultiSelectDropdown - Dropdown con seleccion multiple
 * @module components/filtros-avanzados/multi-select
 */

import { escapeHtml } from '../../utils/dom-helpers.js';

// ============================================
// CLASE: MultiSelectDropdown
// ============================================
export class MultiSelectDropdown {
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
                ${this.renderOptions()}
            </div>
        `;

        this.trigger = this.container.querySelector('.dropdown-trigger');
        this.menu = this.container.querySelector('.dropdown-menu');
        this.valueDisplay = this.container.querySelector('.dropdown-value');
    }

    renderOptions() {
        return this.options.items.map((item, index) => `
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
        `).join('');
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
                this.handleEnterKey();
                break;
            case 'Escape':
                this.close();
                this.trigger.focus();
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!this.isOpen) { this.open(); } else { this.focusNext(); }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (this.isOpen) { this.focusPrev(); }
                break;
            case 'Tab':
                if (this.isOpen) { this.close(); }
                break;
        }
    }

    handleEnterKey() {
        if (this.isOpen) {
            const focused = this.menu.querySelector('.dropdown-option:focus');
            if (focused) {
                this.toggleValue(focused.dataset.value);
            }
        } else {
            this.open();
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
