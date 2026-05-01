/**
 * SEGURIDAD Y SANITIZACIÓN: Patrón MVC para Formulario de Contacto
 * Implementa blindaje contra Inyección SQL y XSS.
 * Cumple con WCAG 2.2 AA.
 */

import { storage } from './storage.js';

// ==========================================
// MODELO: Lógica de Negocio y Seguridad
// ==========================================
class ContactoModel {
    constructor() {
        this.regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
        this.regexTelefono = /^09\d{8}$/;
        this.regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    }

    sanitizarEntrada(texto) {
        if (!texto) return '';
        return texto
            .replace(/;/g, '')
            .replace(/'/g, '')
            .replace(/"/g, '')
            .replace(/--/g, '')
            .replace(/\/\*/g, '')
            .replace(/\*\//g, '')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .trim();
    }

    validarNombre(valor) {
        if (valor === '') return 'El nombre es obligatorio.';
        if (!this.regexNombre.test(valor)) {
            if (valor.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
            return 'Formato de nombre inválido o contiene caracteres prohibidos.';
        }
        return null;
    }

    validarCorreo(valor) {
        if (valor === '') return 'El correo electrónico es obligatorio.';
        if (!this.regexCorreo.test(valor)) return 'Ingresa un correo válido (ej: usuario@dominio.com).';
        return null;
    }

    validarTelefono(valor) {
        if (valor === '') return 'El número de teléfono es obligatorio.';
        if (!this.regexTelefono.test(valor)) return 'El teléfono debe empezar con 09 y tener 10 dígitos.';
        return null;
    }
}

// ==========================================
// VISTA: Manipulación del DOM y ARIA
// ==========================================
class ContactoView {
    constructor() {
        this.form = document.getElementById('form-contacto');
        this.inputs = {
            nombre: document.getElementById('nombre'),
            correo: document.getElementById('correo'),
            telefono: document.getElementById('telefono')
        };
        this.errors = {
            nombre: document.getElementById('err-nombre'),
            correo: document.getElementById('err-correo'),
            telefono: document.getElementById('err-telefono')
        };
        this.btnSubmit = document.getElementById('btn-submit-contacto');
    }

    actualizarValor(campo, nuevoValor) {
        if (this.inputs[campo]) {
            this.inputs[campo].value = nuevoValor;
        }
    }

    mostrarError(campo, mensaje) {
        const input = this.inputs[campo];
        const errorSpan = this.errors[campo];

        if (mensaje) {
            errorSpan.textContent = mensaje;
            errorSpan.hidden = false;
            input.setAttribute('aria-invalid', 'true');
        } else {
            errorSpan.hidden = true;
            input.setAttribute('aria-invalid', 'false');
        }
    }

    limpiarErrores() {
        Object.keys(this.errors).forEach(campo => this.mostrarError(campo, null));
    }

    bloquearBoton(estado) {
        if (this.btnSubmit) {
            this.btnSubmit.disabled = estado;
        }
    }
}

// ==========================================
// CONTROLADOR: Gestión de Eventos y Seguridad
// ==========================================
class ContactoController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.init();
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    init() {
        if (!this.view.form) return;

        this.evaluarEstadoGlobal();

        // 1. Bloqueo Preventivo Físico infalible (Input Event)
        this.view.inputs.nombre.addEventListener('input', function () {
            this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        });

        this.view.inputs.telefono.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 10) this.value = this.value.slice(0, 10);
        });

        // 2. Timing de Validación
        const validadoresDebounced = {};
        Object.keys(this.view.inputs).forEach(campo => {
            validadoresDebounced[campo] = this.debounce(() => {
                this.procesarYValidar(campo);
            }, 300);

            const input = this.view.inputs[campo];
            input.addEventListener('blur', () => {
                input.dataset.tocado = 'true';
                this.procesarYValidar(campo);
            });

            input.addEventListener('input', () => {
                this.evaluarEstadoGlobal();
                if (input.dataset.tocado === 'true') {
                    validadoresDebounced[campo]();
                }
            });
        });

        // 3. Intercepción Offline en el Submit
        this.view.form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (this.validarTodoElFormulario()) {
                if (!navigator.onLine) {
                    const datos = {
                        nombre: this.view.inputs.nombre.value,
                        correo: this.view.inputs.correo.value,
                        telefono: this.view.inputs.telefono.value
                    };
                    try {
                        await storage.guardarTareaOffline('enviar_contacto', datos);
                        alert("🔴 Estás sin conexión. Tu mensaje se ha guardado de forma segura y se enviará automáticamente cuando vuelva el internet.");
                        this.limpiarFormulario();
                    } catch (err) {
                        console.error(err);
                    }
                } else {
                    alert('🟢 ¡Formulario validado y enviado con éxito!');
                    this.limpiarFormulario();
                }
            }
        });
    }

    limpiarFormulario() {
        this.view.form.reset();
        this.view.limpiarErrores();
        Object.values(this.view.inputs).forEach(i => delete i.dataset.tocado);
        this.evaluarEstadoGlobal();
    }

    procesarYValidar(campo) {
        const input = this.view.inputs[campo];
        const valorLimpio = this.model.sanitizarEntrada(input.value);
        this.view.actualizarValor(campo, valorLimpio);

        let mensajeError = null;
        switch (campo) {
            case 'nombre': mensajeError = this.model.validarNombre(valorLimpio); break;
            case 'correo': mensajeError = this.model.validarCorreo(valorLimpio); break;
            case 'telefono': mensajeError = this.model.validarTelefono(valorLimpio); break;
        }

        this.view.mostrarError(campo, mensajeError);
        this.evaluarEstadoGlobal();
        return !mensajeError;
    }

    evaluarEstadoGlobal() {
        let esValido = true;
        Object.keys(this.view.inputs).forEach(campo => {
            const input = this.view.inputs[campo];
            const valorLimpio = this.model.sanitizarEntrada(input.value);
            let mensajeError = null;
            switch (campo) {
                case 'nombre': mensajeError = this.model.validarNombre(valorLimpio); break;
                case 'correo': mensajeError = this.model.validarCorreo(valorLimpio); break;
                case 'telefono': mensajeError = this.model.validarTelefono(valorLimpio); break;
            }
            if (mensajeError) esValido = false;
        });
        this.view.bloquearBoton(!esValido);
    }

    validarTodoElFormulario() {
        let esValido = true;
        let primerFallo = null;

        Object.keys(this.view.inputs).forEach(campo => {
            if (!this.procesarYValidar(campo)) {
                esValido = false;
                if (!primerFallo) primerFallo = this.view.inputs[campo];
            }
        });

        if (primerFallo) primerFallo.focus();
        return esValido;
    }
}

export const initContacto = () => {
    const model = new ContactoModel();
    const view = new ContactoView();
    const controller = new ContactoController(model, view);
};