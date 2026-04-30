/**
 * SEGURIDAD Y SANITIZACIÓN: Patrón MVC para Formulario de Contacto
 * Implementa blindaje contra Inyección SQL y XSS.
 * Cumple con WCAG 2.2 AA.
 */

// ==========================================
// MODELO: Lógica de Negocio y Seguridad
// ==========================================
class ContactoModel {
    constructor() {
        // Listas blancas estrictas (Allowlist)
        this.regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
        this.regexTelefono = /^09\d{8}$/;
        this.regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    }

    /**
     * Blindaje contra SQLi y XSS
     */
    sanitizarEntrada(texto) {
        if (!texto) return '';
        
        return texto
            // 1. Eliminar caracteres peligrosos de SQLi (;, ', ", --, /*, */)
            .replace(/;/g, '')
            .replace(/'/g, '')
            .replace(/"/g, '')
            .replace(/--/g, '')
            .replace(/\/\*/g, '')
            .replace(/\*\//g, '')
            // 2. Escapar caracteres para prevenir XSS (<, >)
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

    init() {
        if (!this.view.form) return;

        // 1. Bloqueo Preventivo (Keydown) - Solo para restringir tipos de caracteres
        this.view.inputs.nombre.addEventListener('keydown', (e) => {
            if (e.key.length > 1) return;
            const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;
            if (!regexLetras.test(e.key)) e.preventDefault();
        });

        this.view.inputs.telefono.addEventListener('keydown', (e) => {
            if (e.key.length > 1) return;
            if (!/^\d$/.test(e.key)) e.preventDefault();
        });

        // 2. Timing de Validación: Exclusivamente en Blur
        Object.keys(this.view.inputs).forEach(campo => {
            this.view.inputs[campo].addEventListener('blur', () => this.procesarYValidar(campo));
        });

        // 3. Validación Final en Submit
        this.view.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validarTodoElFormulario()) {
                alert('¡Seguridad verificada! Formulario enviado correctamente.');
                this.view.form.reset();
                this.view.limpiarErrores();
            }
        });
    }

    /**
     * Sanitiza y valida un campo individual
     */
    procesarYValidar(campo) {
        const input = this.view.inputs[campo];
        
        // A. Sanitización (Blindaje Anti-Inyección)
        const valorLimpio = this.model.sanitizarEntrada(input.value);
        this.view.actualizarValor(campo, valorLimpio);

        // B. Validación por Lista Blanca (Allowlist)
        let mensajeError = null;
        switch (campo) {
            case 'nombre': mensajeError = this.model.validarNombre(valorLimpio); break;
            case 'correo': mensajeError = this.model.validarCorreo(valorLimpio); break;
            case 'telefono': mensajeError = this.model.validarTelefono(valorLimpio); break;
        }

        this.view.mostrarError(campo, mensajeError);
        return !mensajeError;
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

// Inicialización del módulo
export const initContacto = () => {
    const model = new ContactoModel();
    const view = new ContactoView();
    new ContactoController(model, view);
};
