const { body } = require('express-validator')
const { clienteRules, categoriaRule } = require('./cliente.validator')

// Validación para la creación de usuarios desde el panel admin (POST /api/usuarios).
// Incluye los datos del CLIENTE que se crea junto con el usuario.
const createUsuarioRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('El nombre de usuario es obligatorio')
    .isLength({ min: 3, max: 30 }).withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres'),

  body('email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es obligatorio')
    .isEmail().withMessage('Formato de correo inválido')
    .normalizeEmail()
    .isLength({ max: 100 }).withMessage('El correo no puede exceder 100 caracteres'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6, max: 50 }).withMessage('La contraseña debe tener entre 6 y 50 caracteres'),

  body('role')
    .trim()
    .notEmpty().withMessage('El rol es obligatorio')
    .isIn(['user', 'admin']).withMessage('Rol inválido'),

  // Datos del CLIENTE asociado (el admin sí asigna la categoría)
  ...clienteRules,
  categoriaRule,
]

module.exports = { createUsuarioRules }
