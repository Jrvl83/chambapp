/**
 * Componente CustomDropdown - Dropdown con seleccion simple
 * @module components/filtros-avanzados/custom-dropdown
 */

import { escapeHtml } from '../../utils/dom-helpers.js';

// ============================================
// CLASE: CustomDropdown
// ============================================
export class CustomDropdown {
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
                ${this.renderOptions()}
            </div>
        `;

        this.trigger = this.container.querySelector('.dropdown-trigger');
        this.menu = this.container.querySelector('.dropdown-menu');
        this.valueDisplay = this.container.querySelector('.dropdown-value');
    }

    renderOptions() {
        return this.options.items.map((item, index) => `
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
        `).join('');
    }

    bindEvents() {
        this.trigger.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });

        this.menu.addEventListener('click', (e) => {
            const option = e.target.closest('.dropdown-option');
            if (option) {
                this.selectByValue(option.dataset.value);
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
                this.selectByValue(focused.dataset.value);
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

        const item = this.options.items.find(i => i.value === value);
        this.valueDisplay.textContent = item ? item.label : this.options.placeholder;
        this.valueDisplay.classList.toggle('placeholder', !item || !value);

        this.updateSelectedState(value);
        this.close();
        this.trigger.focus();

        if (oldValue !== value && this.options.onChange) {
            this.options.onChange(value);
        }
    }

    updateSelectedState(value) {
        this.menu.querySelectorAll('.dropdown-option').forEach(opt => {
            const isSelected = opt.dataset.value === value;
            opt.classList.toggle('selected', isSelected);
            opt.setAttribute('aria-selected', isSelected);
        });
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

        this.updateSelectedState(value);

        if (!silent && oldValue !== value && this.options.onChange) {
            this.options.onChange(value);
        }
    }

    destroy() {
        this.container.innerHTML = '';
    }
}
