/**
 * CITAS.JS — Gestión de Citas
 * =========================================================
 * Responsabilidades:
 * - Almacenar y recuperar citas desde localStorage
 * - Cambiar estado de cita: "Activa" → "Cancelada"
 * - Liberar el horario asociado al cancelar
 * - Exponer window.app.widgetInvitado.cancelarCita(id)
 * - Exponer window.app.salud.cancelarCita(id)
 * - Mostrar modal de confirmación con "Sí, cancelar" y "Salir"
 *
 * INTEGRACIÓN:
 *   Importar desde app.js con: import './citas.js';
 *   No modifica ningún módulo existente.
 */

// ── Claves de almacenamiento ──────────────────────────────────────────────────
const STORAGE_KEY_CITAS     = 'sportstore_citas';
const STORAGE_KEY_HORARIOS  = 'sportstore_horarios_ocupados';

// ── Repositorio de Citas (localStorage) ──────────────────────────────────────
const citasRepo = {
    /**
     * Obtiene todas las citas almacenadas.
     * @returns {Array}
     */
    obtenerTodas() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_CITAS);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    },

    /**
     * Persiste el array completo de citas.
     * @param {Array} citas
     */
    guardarTodas(citas) {
        try {
            localStorage.setItem(STORAGE_KEY_CITAS, JSON.stringify(citas));
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Busca una cita por su ID.
     * @param {string} id
     * @returns {Object|null}
     */
    obtenerPorId(id) {
        return this.obtenerTodas().find(c => c.id === id) || null;
    },

    /**
     * Registra una nueva cita y ocupa su horario.
     * @param {Object} cita - debe tener { id, horario, ...resto }
     * @returns {boolean}
     */
    registrar(cita) {
        const citas = this.obtenerTodas();
        if (citas.find(c => c.id === cita.id)) return false; // ya existe
        citas.push({ ...cita, estado: 'Activa', fechaRegistro: new Date().toISOString() });
        horariosRepo.ocupar(cita.horario);
        return this.guardarTodas(citas);
    },

    /**
     * Cancela una cita: cambia estado a "Cancelada" y libera su horario.
     * @param {string} id
     * @returns {boolean}
     */
    cancelar(id) {
        const citas = this.obtenerTodas();
        const idx = citas.findIndex(c => c.id === id);
        if (idx === -1) return false;

        const cita = citas[idx];
        if (cita.estado === 'Cancelada') return false; // ya estaba cancelada

        cita.estado             = 'Cancelada';
        cita.fechaCancelacion   = new Date().toISOString();

        this.guardarTodas(citas);

        // Liberar el horario para que vuelva a estar disponible
        horariosRepo.liberar(cita.horario);

        // Emitir evento global para que cualquier vista pueda reaccionar
        document.dispatchEvent(new CustomEvent('citaCancelada', {
            bubbles: true,
            detail: { id, cita }
        }));

        return true;
    }
};

// ── Repositorio de Horarios Ocupados (localStorage) ──────────────────────────
const horariosRepo = {
    obtenerOcupados() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_HORARIOS);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    },

    /** Marca un horario como libre al cancelar una cita. */
    liberar(horario) {
        if (!horario) return;
        const ocupados = this.obtenerOcupados().filter(h => h !== horario);
        localStorage.setItem(STORAGE_KEY_HORARIOS, JSON.stringify(ocupados));
    },

    /** Marca un horario como ocupado al agendar una cita. */
    ocupar(horario) {
        if (!horario) return;
        const ocupados = this.obtenerOcupados();
        if (!ocupados.includes(horario)) {
            ocupados.push(horario);
            localStorage.setItem(STORAGE_KEY_HORARIOS, JSON.stringify(ocupados));
        }
    },

    /** Verifica si un horario ya está tomado. */
    estaOcupado(horario) {
        return this.obtenerOcupados().includes(horario);
    }
};

// ── Modal de Confirmación de Cancelación ─────────────────────────────────────
let _citaPendienteId = null;
let _modalEl         = null;

/**
 * Inyecta el dialog HTML + estilos en el body (una sola vez).
 */
function _inyectarModal() {
    if (document.getElementById('cita-cancel-dialog')) return;

    const html = `
        <dialog
            id="cita-cancel-dialog"
            class="cita-cancel-dialog"
            aria-labelledby="cita-dialog-title"
            aria-describedby="cita-dialog-desc"
            aria-modal="true"
        >
            <div class="cita-dialog-inner">
                <div class="cita-dialog-icon" aria-hidden="true">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>

                <h3 id="cita-dialog-title">Cancelar cita</h3>
                <p id="cita-dialog-desc">
                    ¿Estás seguro de que deseas cancelar esta cita?<br>
                    El horario quedará disponible nuevamente.
                </p>

                <div class="cita-dialog-actions">
                    <button type="button" id="btn-cita-confirmar">
                        <i class="fa-solid fa-check" aria-hidden="true"></i>
                        Sí, cancelar
                    </button>
                    <button type="button" id="btn-cita-salir">
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                        Salir
                    </button>
                </div>
            </div>
        </dialog>

        <style>
            /* ── Cita Cancel Dialog ────────────────────────────────────── */
            .cita-cancel-dialog {
                border: none;
                border-radius: 1.25rem;
                padding: 0;
                box-shadow:
                    0 24px 64px rgba(0, 0, 0, 0.22),
                    0 4px 16px rgba(0, 0, 0, 0.10);
                max-width: 420px;
                width: 90%;
                background: #ffffff;
                animation: _citaDialogIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            @keyframes _citaDialogIn {
                from { opacity: 0; transform: scale(0.90) translateY(16px); }
                to   { opacity: 1; transform: scale(1)    translateY(0);    }
            }
            .cita-cancel-dialog::backdrop {
                background: rgba(10, 18, 28, 0.58);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
                animation: _citaBackdropIn 0.2s ease forwards;
            }
            @keyframes _citaBackdropIn {
                from { opacity: 0; }
                to   { opacity: 1; }
            }
            .cita-dialog-inner {
                padding: 2rem 1.75rem 1.75rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                gap: 0.65rem;
            }
            .cita-dialog-icon {
                width: 68px;
                height: 68px;
                border-radius: 50%;
                background: #fef9c3;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #b45309;
                margin-bottom: 0.35rem;
                flex-shrink: 0;
            }
            .cita-cancel-dialog h3 {
                font-size: 1.2rem;
                font-weight: 700;
                color: #111827;
                margin: 0;
                letter-spacing: -0.01em;
            }
            .cita-cancel-dialog p {
                font-size: 0.93rem;
                color: #4b5563;
                line-height: 1.65;
                margin: 0 0 0.4rem;
            }
            .cita-dialog-actions {
                display: flex;
                flex-direction: column;
                gap: 0.55rem;
                width: 100%;
                margin-top: 0.6rem;
            }
            /* Botón Sí, cancelar */
            #btn-cita-confirmar {
                width: 100%;
                padding: 0.82rem 1.25rem;
                border-radius: 0.65rem;
                font-size: 0.95rem;
                font-weight: 600;
                cursor: pointer;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                background: #0c4d63;
                color: #ffffff;
                transition:
                    background 0.18s ease,
                    transform  0.15s ease,
                    box-shadow 0.15s ease;
            }
            #btn-cita-confirmar:hover {
                background: #093b4e;
                transform: translateY(-1px);
                box-shadow: 0 5px 14px rgba(12, 77, 99, 0.38);
            }
            #btn-cita-confirmar:active {
                transform: translateY(0);
                box-shadow: none;
            }
            /* Botón Salir (rojo) */
            #btn-cita-salir {
                width: 100%;
                padding: 0.82rem 1.25rem;
                border-radius: 0.65rem;
                font-size: 0.95rem;
                font-weight: 600;
                cursor: pointer;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                background: #dc2626;
                color: #ffffff;
                transition:
                    background 0.18s ease,
                    transform  0.15s ease,
                    box-shadow 0.15s ease;
            }
            #btn-cita-salir:hover {
                background: #b91c1c;
                transform: translateY(-1px);
                box-shadow: 0 5px 14px rgba(220, 38, 38, 0.38);
            }
            #btn-cita-salir:active {
                transform: translateY(0);
                box-shadow: none;
            }
            /* Focus visible accesible */
            #btn-cita-confirmar:focus-visible,
            #btn-cita-salir:focus-visible {
                outline: 3px solid #0c4d63;
                outline-offset: 3px;
            }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    _modalEl = document.getElementById('cita-cancel-dialog');

    // ── Sí, cancelar ──────────────────────────────────────
    document.getElementById('btn-cita-confirmar').addEventListener('click', () => {
        const id = _citaPendienteId;
        if (!id) return;

        const exito = citasRepo.cancelar(id);

        _modalEl.close();
        _citaPendienteId = null;

        if (exito) {
            _mostrarToast('✅ Cita cancelada. El horario volvió a estar disponible.');
        } else {
            _mostrarToast('ℹ️ Esta cita ya había sido cancelada anteriormente.');
        }
    });

    // ── Salir (rojo) ──────────────────────────────────────
    document.getElementById('btn-cita-salir').addEventListener('click', _cerrarModal);

    // Escape nativo del <dialog>
    _modalEl.addEventListener('cancel', _cerrarModal);
}

/**
 * Abre el modal con el ID de cita pendiente de cancelación.
 * @param {string} id
 */
function _abrirModal(id) {
    if (!_modalEl) return;
    _citaPendienteId = id;
    _modalEl.showModal();
    // Foco al botón "Salir" como acción más conservadora por defecto (WCAG 3.2.2)
    document.getElementById('btn-cita-salir')?.focus();
}

function _cerrarModal() {
    _citaPendienteId = null;
    _modalEl?.close();
}

// ── Toast de estado ───────────────────────────────────────────────────────────
function _mostrarToast(mensaje) {
    const toast = document.createElement('div');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = mensaje;
    Object.assign(toast.style, {
        position:        'fixed',
        bottom:          '2rem',
        left:            '50%',
        transform:       'translateX(-50%) translateY(20px)',
        background:      '#1a2a38',
        color:           '#fff',
        padding:         '0.75rem 1.5rem',
        borderRadius:    '2rem',
        fontSize:        '0.9rem',
        fontWeight:      '500',
        boxShadow:       '0 4px 20px rgba(0,0,0,0.25)',
        opacity:         '0',
        transition:      'all 0.3s ease',
        zIndex:          '99999',
        whiteSpace:      'nowrap',
        pointerEvents:   'none',
        maxWidth:        '90vw',
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity   = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity   = '0';
        toast.style.transform = 'translateX(-50%) translateY(10px)';
        setTimeout(() => toast.remove(), 350);
    }, 3500);
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inyectar modal en el DOM
    _inyectarModal();

    // 2. Crear / ampliar namespace window.app sin sobreescribir nada existente
    if (!window.app) window.app = {};

    // ── widgetInvitado → sección "Consultar cita" ────────
    if (!window.app.widgetInvitado) window.app.widgetInvitado = {};

    /**
     * Abre el modal de confirmación para cancelar la cita con el ID dado.
     * Llamado desde: onclick="app.widgetInvitado.cancelarCita('...')"
     * @param {string} id - UUID de la cita
     */
    window.app.widgetInvitado.cancelarCita = (id) => {
        _abrirModal(id);
    };

    // ── salud → sección "Mi Salud" ───────────────────────
    if (!window.app.salud) window.app.salud = {};

    /**
     * Abre el modal de confirmación para cancelar la cita con el ID dado.
     * Llamado desde: onclick="app.salud.cancelarCita('...')"
     * @param {string} id - UUID de la cita
     */
    window.app.salud.cancelarCita = (id) => {
        _abrirModal(id);
    };
});

// ── Exportar para uso en otros módulos ───────────────────────────────────────
export { citasRepo, horariosRepo };
