// ============================================
// PERFIL PUBLICO - ORQUESTADOR
// Modulo: perfil-publico/index.js
// Pagina read-only para que empleadores vean
// el perfil completo del trabajador
// ============================================

import { db } from '../config/firebase-init.js';
import {
    doc, getDoc, collection, query, where, getDocs, orderBy
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { escapeHtml } from '../utils/dom-helpers.js';
import { generarEstrellasHTML, capitalizarPalabras } from '../utils/formatting.js';
import {
    renderPortfolio, renderSkills, renderExperiencia,
    renderReviewsSummary, renderReviewsList, renderDisponibilidad
} from './templates.js';

// ============================================
// STATE
// ============================================
const state = {
    trabajadorId: null,
    perfilData: null,
    resenas: [],
    portfolioURLs: [],
    lightboxIndex: 0
};

// ============================================
// INICIALIZACION
// ============================================
init();

function init() {
    state.trabajadorId = new URLSearchParams(window.location.search).get('id');
    if (!state.trabajadorId) {
        mostrarError('ID no proporcionado', 'La URL no contiene un ID de trabajador valido.');
        return;
    }
    cargarPerfil();
}

// ============================================
// CARGAR DATOS
// ============================================
async function cargarPerfil() {
    try {
        const docSnap = await getDoc(doc(db, 'usuarios', state.trabajadorId));

        if (!docSnap.exists()) {
            mostrarError('Perfil no encontrado', 'Este trabajador no existe o fue eliminado.');
            return;
        }

        state.perfilData = docSnap.data();

        if (state.perfilData.tipo !== 'trabajador') {
            mostrarError('Perfil no disponible', 'Este usuario no es un trabajador.');
            return;
        }

        await cargarResenas();
        renderPerfil();
    } catch (error) {
        console.error('Error cargando perfil:', error);
        mostrarError('Error', 'Ocurrio un error al cargar el perfil. Intenta de nuevo.');
    }
}

async function cargarResenas() {
    try {
        const q = query(
            collection(db, 'calificaciones'),
            where('trabajadorId', '==', state.trabajadorId),
            orderBy('fechaCalificacion', 'desc')
        );
        const snapshot = await getDocs(q);
        state.resenas = [];
        snapshot.forEach(d => state.resenas.push({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error cargando resenas:', error);
        state.resenas = [];
    }
}

// ============================================
// RENDER PRINCIPAL
// ============================================
function renderPerfil() {
    const data = state.perfilData;
    document.title = `${data.nombre || 'Trabajador'} - ChambApp`;

    renderHeroSection(data);
    renderBioSection(data);
    renderPortfolioSection(data);
    renderSkillsSection(data);
    renderReviewsSection(data);
    renderDisponibilidadSection(data);

    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('perfil-content').style.display = 'block';
}

// ============================================
// HERO
// ============================================
function renderHeroSection(data) {
    const foto = document.getElementById('pp-foto');
    foto.src = data.fotoPerfilURL ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nombre || 'T')}&size=200&background=0066FF&color=fff`;

    document.getElementById('pp-nombre').textContent = data.nombre || 'Trabajador';
    renderRatingBadge(data);
    renderUbicacion(data);
    renderCategorias(data);
    renderDisponibleBadge(data);
}

function renderRatingBadge(data) {
    const el = document.getElementById('pp-rating-badge');
    const promedio = data.calificacionPromedio || 0;
    const total = data.totalCalificaciones || 0;

    if (total === 0) {
        el.innerHTML = '<span class="pp-rating-text">Sin calificaciones aun</span>';
        el.classList.add('pp-rating-none');
        return;
    }

    el.innerHTML = `
        <span class="pp-rating-star">★</span>
        <span class="pp-rating-number">${promedio.toFixed(1)}</span>
        <span class="pp-rating-count">(${total} reseña${total !== 1 ? 's' : ''})</span>`;
}

function renderUbicacion(data) {
    const el = document.getElementById('pp-ubicacion');
    const ubic = data.ubicacion;
    const texto = typeof ubic === 'object' && ubic
        ? (ubic.texto_completo || ubic.distrito || '') : (ubic || '');

    if (texto) {
        el.textContent = `📍 ${texto}`;
    } else {
        el.style.display = 'none';
    }
}

function renderCategorias(data) {
    const el = document.getElementById('pp-categorias');
    const cats = data.categorias || [];
    if (cats.length === 0) { el.style.display = 'none'; return; }

    el.innerHTML = cats.map(c =>
        `<span class="pp-categoria-chip">${escapeHtml(getCategoriaLabel(c))}</span>`
    ).join('');
}

function renderDisponibleBadge(data) {
    const disp = data.disponibilidad || {};
    if (disp.disponibilidadInmediata) {
        document.getElementById('pp-disponible-badge').style.display = 'flex';
    }
}

// ============================================
// SECCIONES
// ============================================
function renderBioSection(data) {
    if (!data.bio) return;
    document.getElementById('pp-bio').textContent = data.bio;
    document.getElementById('pp-bio-section').style.display = 'block';
}

function renderPortfolioSection(data) {
    state.portfolioURLs = data.portfolioURLs || [];
    if (state.portfolioURLs.length === 0) return;

    document.getElementById('pp-portfolio-grid').innerHTML = renderPortfolio(state.portfolioURLs);
    document.getElementById('pp-portfolio-section').style.display = 'block';
}

function renderSkillsSection(data) {
    const habilidades = data.habilidades || [];
    const experiencia = data.experiencia || [];
    const anos = data.añosExperiencia || '';

    if (!habilidades.length && !experiencia.length && !anos) return;

    if (anos) {
        const el = document.getElementById('pp-anos-exp');
        el.textContent = `💼 ${getAnosExpLabel(anos)}`;
        el.style.display = 'inline-flex';
    }

    if (habilidades.length > 0) {
        document.getElementById('pp-habilidades').innerHTML = renderSkills(habilidades);
    }

    if (experiencia.length > 0) {
        document.getElementById('pp-experiencia').innerHTML = renderExperiencia(experiencia);
    }

    document.getElementById('pp-skills-section').style.display = 'block';
}

function renderReviewsSection(data) {
    if (state.resenas.length === 0) return;

    const promedio = data.calificacionPromedio || 0;
    const total = state.resenas.length;
    const dist = data.distribucionCalificaciones || {};

    document.getElementById('pp-reviews-summary').innerHTML =
        renderReviewsSummary(promedio, total, dist);
    document.getElementById('pp-reviews-list').innerHTML =
        renderReviewsList(state.resenas);
    document.getElementById('pp-reviews-section').style.display = 'block';
}

function renderDisponibilidadSection(data) {
    const disp = data.disponibilidad;
    if (!disp) return;

    const hasDias = disp.diasDisponibles && disp.diasDisponibles.length > 0;
    const hasHorario = disp.horarioInicio || disp.horarioFin;
    const hasZonas = disp.zonasTrabajoPreferidas;
    if (!hasDias && !hasHorario && !hasZonas) return;

    document.getElementById('pp-disponibilidad').innerHTML = renderDisponibilidad(disp);
    document.getElementById('pp-disponibilidad-section').style.display = 'block';
}

// ============================================
// ERROR STATE
// ============================================
function mostrarError(titulo, mensaje) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-title').textContent = titulo;
    document.getElementById('error-message').textContent = mensaje;
    document.getElementById('error-state').style.display = 'block';
}

// ============================================
// LIGHTBOX
// ============================================
function abrirLightboxPublico(index) {
    state.lightboxIndex = index;
    const lightbox = document.getElementById('pp-lightbox');
    document.getElementById('pp-lightbox-img').src = state.portfolioURLs[index];
    actualizarContadorLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarLightboxPublico() {
    document.getElementById('pp-lightbox').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function navegarLightboxPublico(dir) {
    const total = state.portfolioURLs.length;
    if (dir === 'prev') {
        state.lightboxIndex = (state.lightboxIndex - 1 + total) % total;
    } else {
        state.lightboxIndex = (state.lightboxIndex + 1) % total;
    }
    document.getElementById('pp-lightbox-img').src = state.portfolioURLs[state.lightboxIndex];
    actualizarContadorLightbox();
}

function actualizarContadorLightbox() {
    document.getElementById('pp-lightbox-counter').textContent =
        `${state.lightboxIndex + 1} / ${state.portfolioURLs.length}`;
}

// ESC para cerrar lightbox
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarLightboxPublico();
});

// ============================================
// HELPERS
// ============================================
function getCategoriaLabel(cat) {
    const labels = {
        'construccion': 'Construcción', 'electricidad': 'Electricidad',
        'gasfiteria': 'Gasfitería', 'pintura': 'Pintura',
        'carpinteria': 'Carpintería', 'limpieza': 'Limpieza',
        'jardineria': 'Jardinería', 'mecanica': 'Mecánica', 'otros': 'Otros'
    };
    return labels[cat] || capitalizarPalabras(cat || '');
}

function getAnosExpLabel(anos) {
    const labels = {
        'menos-1': 'Menos de 1 año de experiencia',
        '1-2': '1-2 años de experiencia',
        '3-5': '3-5 años de experiencia',
        '6-10': '6-10 años de experiencia',
        'mas-10': 'Más de 10 años de experiencia'
    };
    return labels[anos] || `${anos} de experiencia`;
}

// ============================================
// GLOBAL FUNCTIONS (para onclick en HTML)
// ============================================
window.abrirLightboxPublico = abrirLightboxPublico;
window.cerrarLightboxPublico = cerrarLightboxPublico;
window.navegarLightboxPublico = navegarLightboxPublico;
