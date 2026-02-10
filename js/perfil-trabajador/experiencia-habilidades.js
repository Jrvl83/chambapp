// ============================================
// EXPERIENCIA Y HABILIDADES - CRUD
// Modulo: perfil-trabajador/experiencia-habilidades.js
// ============================================

let state = null;

// ============================================
// INICIALIZAR MODULO
// ============================================
export function initExpHabilidades(sharedState) {
    state = sharedState;
}

// ============================================
// EXPERIENCIAS - CARGAR Y MOSTRAR
// ============================================
export function cargarExperiencias() {
    state.experiencias = state.perfilData.experiencia || [];
    mostrarExperiencias();
}

function renderExperienciaCard(exp, index) {
    return `
        <div class="experiencia-item">
            <div class="experiencia-header">
                <div>
                    <div class="experiencia-puesto">${exp.puesto}</div>
                    ${exp.empresa ? `<div class="experiencia-empresa">📍 ${exp.empresa}</div>` : ''}
                    <div class="experiencia-periodo">📅 ${exp.periodo}</div>
                </div>
                <button class="btn-eliminar-exp" onclick="eliminarExperiencia(${index})">
                    🗑️ Eliminar
                </button>
            </div>
            ${exp.descripcion ? `<div class="experiencia-descripcion">${exp.descripcion}</div>` : ''}
        </div>
    `;
}

export function mostrarExperiencias() {
    const container = document.getElementById('experiencias-container');
    const emptyState = document.getElementById('experiencias-empty');

    if (state.experiencias.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'flex';
    emptyState.style.display = 'none';
    container.innerHTML = '';

    state.experiencias.forEach((exp, index) => {
        container.innerHTML += renderExperienciaCard(exp, index);
    });
}

// ============================================
// EXPERIENCIAS - CRUD
// ============================================
export function agregarExperiencia() {
    document.getElementById('modal-experiencia').classList.add('active');
    document.body.style.overflow = 'hidden';

    document.getElementById('exp-puesto').value = '';
    document.getElementById('exp-empresa').value = '';
    document.getElementById('exp-inicio').value = '';
    document.getElementById('exp-fin').value = '';
    document.getElementById('exp-actual').checked = false;
    document.getElementById('exp-descripcion').value = '';
}

export function cerrarModalExperiencia() {
    document.getElementById('modal-experiencia').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function obtenerDatosExperiencia() {
    const puesto = document.getElementById('exp-puesto').value.trim();
    const empresa = document.getElementById('exp-empresa').value.trim();
    const inicio = document.getElementById('exp-inicio').value;
    const esActual = document.getElementById('exp-actual').checked;
    const fin = esActual ? 'Presente' : document.getElementById('exp-fin').value;
    const descripcion = document.getElementById('exp-descripcion').value.trim();

    if (!puesto) {
        if (typeof toastError === 'function') {
            toastError('El puesto es obligatorio');
        } else {
            alert('El puesto es obligatorio');
        }
        return null;
    }

    const periodo = inicio && fin ? `${inicio} - ${fin}` : 'Sin fecha especificada';

    return { puesto, empresa, periodo, descripcion };
}

export function guardarExperiencia() {
    const datos = obtenerDatosExperiencia();
    if (!datos) return;

    state.experiencias.push(datos);
    mostrarExperiencias();
    cerrarModalExperiencia();

    if (typeof toastSuccess === 'function') {
        toastSuccess('Experiencia agregada');
    }
}

export function eliminarExperiencia(index) {
    if (confirm('¿Estás seguro de eliminar esta experiencia?')) {
        state.experiencias.splice(index, 1);
        mostrarExperiencias();

        if (typeof toastSuccess === 'function') {
            toastSuccess('Experiencia eliminada');
        }
    }
}

// ============================================
// HABILIDADES - CARGAR Y MOSTRAR
// ============================================
export function cargarHabilidades() {
    const categorias = state.perfilData.categorias || [];
    const checkboxes = document.querySelectorAll('.categoria-checkbox input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = categorias.includes(checkbox.value);
    });

    state.habilidades = state.perfilData.habilidades || [];
    mostrarHabilidades();

    if (state.perfilData.añosExperiencia) {
        document.getElementById('años-experiencia').value = state.perfilData.añosExperiencia;
    }
}

function mostrarHabilidades() {
    const container = document.getElementById('habilidades-tags');
    container.innerHTML = '';

    state.habilidades.forEach((habilidad, index) => {
        const tag = document.createElement('div');
        tag.className = 'habilidad-tag';
        tag.innerHTML = `
            ${habilidad}
            <button onclick="eliminarHabilidad(${index})">×</button>
        `;
        container.appendChild(tag);
    });
}

// ============================================
// HABILIDADES - CRUD
// ============================================
export function agregarHabilidad() {
    const input = document.getElementById('nueva-habilidad');
    const habilidad = input.value.trim();

    if (!habilidad) return;

    if (state.habilidades.includes(habilidad)) {
        if (typeof toastError === 'function') {
            toastError('Esta habilidad ya existe');
        } else {
            alert('Esta habilidad ya existe');
        }
        return;
    }

    state.habilidades.push(habilidad);
    mostrarHabilidades();
    input.value = '';

    if (typeof toastSuccess === 'function') {
        toastSuccess('Habilidad agregada');
    }
}

export function agregarHabilidadEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        agregarHabilidad();
    }
}

export function eliminarHabilidad(index) {
    state.habilidades.splice(index, 1);
    mostrarHabilidades();
}
