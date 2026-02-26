/**
 * Componente: Modal para reportar oferta o usuario
 * Usado por: mapa-ofertas, dashboard, mis-aplicaciones-trabajador, perfil-publico
 *
 * @module components/reportar-modal
 */

import { db, auth } from '../config/firebase-init.js';
import {
    collection, addDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const MOTIVOS = [
    { value: 'fraude',      label: 'Posible fraude o estafa' },
    { value: 'spam',        label: 'Spam o información falsa' },
    { value: 'inapropiado', label: 'Contenido inapropiado' },
    { value: 'otro',        label: 'Otro motivo' },
];

const _state = {
    tipo: null,
    objetoId: null,
    objetoTitulo: null,
};

// ─── Init ────────────────────────────────────────────────────────────────────

export function initReportarModal() {
    if (document.getElementById('reportar-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'reportar-modal-overlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = _renderModalHTML();
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cerrarReportarModal();
    });

    document.getElementById('form-reportar').addEventListener('submit', _enviarReporte);

    window.cerrarReportarModal = cerrarReportarModal;
    window.abrirReportarModal  = abrirReportarModal;
}

// ─── Abrir ────────────────────────────────────────────────────────────────────

export function abrirReportarModal(tipo, objetoId, objetoTitulo) {
    if (!auth.currentUser) {
        window.showToast('Debes iniciar sesión para reportar', 'warning');
        return;
    }

    _state.tipo         = tipo;
    _state.objetoId     = objetoId;
    _state.objetoTitulo = objetoTitulo;

    document.getElementById('form-reportar').reset();
    document.getElementById('reportar-error-motivo').style.display = 'none';

    const label = tipo === 'oferta' ? 'Oferta' : 'Usuario';
    document.getElementById('reportar-subtitulo').textContent = `${label}: "${objetoTitulo}"`;

    document.getElementById('reportar-modal-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ─── Cerrar ───────────────────────────────────────────────────────────────────

function cerrarReportarModal() {
    document.getElementById('reportar-modal-overlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ─── Enviar ───────────────────────────────────────────────────────────────────

async function _enviarReporte(e) {
    e.preventDefault();

    const motivo = document.querySelector('input[name="motivo-reporte"]:checked')?.value;
    if (!motivo) {
        document.getElementById('reportar-error-motivo').style.display = 'block';
        return;
    }
    document.getElementById('reportar-error-motivo').style.display = 'none';

    const descripcion = document.getElementById('reportar-descripcion').value.trim();
    const btn = document.getElementById('btn-enviar-reporte');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
        const user = auth.currentUser;
        await addDoc(collection(db, 'reportes'), {
            tipo:            _state.tipo,
            objetoId:        _state.objetoId,
            objetoTitulo:    _state.objetoTitulo,
            reportadoPor:    user.email || '',
            reportadoPorUid: user.uid,
            motivo,
            descripcion:     descripcion || '',
            estado:          'pendiente',
            timestamp:       serverTimestamp(),
        });

        cerrarReportarModal();
        window.showToast('Reporte enviado. Lo revisaremos pronto.', 'success');

    } catch (err) {
        console.error('Error al enviar reporte:', err);
        window.showToast('Error al enviar reporte. Intenta de nuevo.', 'error');
        btn.disabled = false;
        btn.textContent = 'Enviar reporte';
    }
}

// ─── Template ─────────────────────────────────────────────────────────────────

function _renderModalHTML() {
    const motivosHTML = MOTIVOS.map(m => `
        <label class="reportar-motivo-label">
            <input type="radio" name="motivo-reporte" value="${m.value}">
            <span>${m.label}</span>
        </label>`
    ).join('');

    return `
        <div class="modal-content modal-content--sm">
            <div class="modal-header">
                <h3>🚩 Reportar contenido</h3>
                <button class="modal-close" onclick="cerrarReportarModal()">✕</button>
            </div>
            <div class="modal-body">
                <p id="reportar-subtitulo" class="reportar-subtitulo"></p>
                <form id="form-reportar" novalidate>
                    <p class="reportar-label">¿Cuál es el motivo?</p>
                    <div class="reportar-motivos">
                        ${motivosHTML}
                    </div>
                    <div id="reportar-error-motivo" class="error-message" style="display:none">
                        Selecciona un motivo para continuar
                    </div>
                    <textarea
                        id="reportar-descripcion"
                        class="reportar-descripcion"
                        placeholder="Descripción adicional (opcional)"
                        maxlength="300"
                        rows="3"></textarea>
                    <div class="detalle-acciones" style="margin-top:1rem">
                        <button type="button" class="btn btn-secondary"
                                onclick="cerrarReportarModal()">Cancelar</button>
                        <button type="submit" id="btn-enviar-reporte"
                                class="btn btn-danger">Enviar reporte</button>
                    </div>
                </form>
            </div>
        </div>`;
}
