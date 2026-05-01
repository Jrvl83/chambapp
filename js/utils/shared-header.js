// ============================================
// SHARED HEADER — ChambaYa
// Inyecta el header unificado en #app-header
// y puebla datos del usuario autenticado.
// Uso: import { initSharedHeader } from '../utils/shared-header.js';
//      initSharedHeader(auth, db);
// ============================================

import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { escapeHtml } from './dom-helpers.js';

function renderHTML(container) {
    container.innerHTML = `
        <header class="app-header">
            <div class="header-content">
                <a href="dashboard.html" class="logo">
                    <span class="logo-text">Chamba<span class="logo-ya">Ya</span></span>
                </a>
                <div class="header-usuario" id="header-usuario">
                    <button class="btn-avatar" id="btn-avatar"
                            aria-label="Menú de usuario" aria-expanded="false">
                        <div class="avatar-circle" id="avatar-circle"></div>
                        <div class="header-usuario-info">
                            <span class="header-nombre" id="header-nombre"></span>
                            <span class="header-plan" id="header-plan">Plan Free</span>
                        </div>
                        <span class="avatar-chevron" aria-hidden="true">▾</span>
                    </button>
                    <div class="usuario-dropdown" id="usuario-dropdown" hidden>
                        <a href="#" class="dropdown-item" id="sh-link-perfil">Mi Perfil</a>
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item dropdown-item--danger" id="sh-btn-cerrar">
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>
        </header>`;
}

function populateUser(usuario) {
    const partes = (usuario.nombre || 'Usuario').trim().split(/\s+/);
    const nombre = partes.slice(0, 2).join(' ');

    const elNombre = document.getElementById('header-nombre');
    if (elNombre) elNombre.textContent = nombre;

    const elPlan = document.getElementById('header-plan');
    if (elPlan) elPlan.textContent = usuario.esPremium ? 'Plan Premium' : 'Plan Free';

    const circle = document.getElementById('avatar-circle');
    if (!circle) return;

    const foto = usuario.fotoPerfilURL || usuario.photoURL || usuario.foto;
    if (foto) {
        circle.innerHTML = `<img src="${foto}" alt="${escapeHtml(nombre)}" class="avatar-img">`;
    } else {
        const iniciales = partes.slice(0, 2).map(p => p[0].toUpperCase()).join('');
        circle.innerHTML = `<span class="avatar-iniciales">${iniciales}</span>`;
    }
}

function setupDropdown(auth, usuario) {
    const btn = document.getElementById('btn-avatar');
    const dropdown = document.getElementById('usuario-dropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', e => {
        e.stopPropagation();
        const open = !dropdown.hidden;
        dropdown.hidden = open;
        btn.setAttribute('aria-expanded', String(!open));
        btn.classList.toggle('btn-avatar--open', !open);
    });

    document.addEventListener('click', () => {
        if (!dropdown.hidden) {
            dropdown.hidden = true;
            btn.setAttribute('aria-expanded', 'false');
            btn.classList.remove('btn-avatar--open');
        }
    });

    const linkPerfil = document.getElementById('sh-link-perfil');
    if (linkPerfil) {
        linkPerfil.href = usuario.tipo === 'empleador'
            ? 'perfil-empleador.html'
            : 'perfil-trabajador.html';
    }

    const btnCerrar = document.getElementById('sh-btn-cerrar');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', async e => {
            e.stopPropagation();
            dropdown.hidden = true;
            try {
                await signOut(auth);
                window.location.href = 'login.html';
            } catch (err) {
                console.error('Error cerrando sesión:', err);
            }
        });
    }
}

export function initSharedHeader(auth, db) {
    const container = document.getElementById('app-header');
    if (container) renderHTML(container);

    onAuthStateChanged(auth, async user => {
        if (!user) return;
        try {
            const snap = await getDoc(doc(db, 'usuarios', user.uid));
            if (!snap.exists()) return;
            const usuario = snap.data();
            populateUser(usuario);
            setupDropdown(auth, usuario);
        } catch (err) {
            console.error('shared-header: error cargando datos:', err);
        }
    });
}
