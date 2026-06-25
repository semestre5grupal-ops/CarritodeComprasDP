const { body } = require('express-validator')

// Reglas compartidas para los datos del CLIENTE que se solicitan al crear un usuario.
// Las longitudes corresponden a las columnas reales de la tabla CLIENTES.
const clienteRules = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre del cliente es obligatorio')
    .isLength({ max: 80 }).withMessage('El nombre no puede exceder 80 caracteres')
    .matches(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),

  body('ciruc')
    .trim()
    .notEmpty().withMessage('La cédula/RUC es obligatoria')
    .matches(/^\d+$/).withMessage('La cédula/RUC solo puede contener números')
    .isLength({ min: 10, max: 13 }).withMessage('La cédula/RUC debe tener entre 10 y 13 dígitos'),

  body('celular')
    .trim()
    .notEmpty().withMessage('El celular es obligatorio')
    .matches(/^\d+$/).withMessage('El celular solo puede contener números')
    .isLength({ min: 10, max: 10 }).withMessage('El celular debe tener 10 dígitos'),

  body('telefono')
    .trim()
    .notEmpty().withMessage('El teléfono es obligatorio')
    .matches(/^\d+$/).withMessage('El teléfono solo puede contener números')
    .isLength({ min: 7, max: 10 }).withMessage('El teléfono debe tener entre 7 y 10 dígitos'),

  body('id_ciudad')
    .notEmpty().withMessage('La ciudad es obligatoria')
    .isInt({ min: 1 }).withMessage('Ciudad inválida'),
]

// La categoría solo la asigna el admin; en el registro público no se pide.
const categoriaRule = body('categoria')
  .notEmpty().withMessage('La categoría es obligatoria')
  .isInt({ min: 1, max: 10 }).withMessage('La categoría debe ser un número del 1 al 10')

module.exports = { clienteRules, categoriaRule }
