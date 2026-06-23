const { body, param } = require('express-validator')

const createRules = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre del producto es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .escape(),

  body('precio')
    .notEmpty().withMessage('El precio es obligatorio')
    .isFloat({ min: 0.01, max: 9999.99 }).withMessage('El precio debe estar entre 0.01 y 9999.99'),

  body('stock')
    .optional()
    .isInt({ min: 0, max: 2147483647 }).withMessage('El stock debe ser entre 0 y 2147483647'),

  body('categoria')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('La categoría no puede exceder 50 caracteres')
    .escape(),

  body('imagen')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('La ruta de imagen no puede exceder 255 caracteres'),
]

const updateRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID del producto debe ser un entero positivo'),

  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .escape(),

  body('precio')
    .optional()
    .isFloat({ min: 0.01, max: 9999.99 }).withMessage('El precio debe estar entre 0.01 y 9999.99'),

  body('stock')
    .optional()
    .isInt({ min: 0, max: 2147483647 }).withMessage('El stock debe ser entre 0 y 2147483647'),

  body('categoria')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('La categoría no puede exceder 50 caracteres')
    .escape(),

  body('imagen')
    .optional()
    .trim(),
]

const idRule = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID del producto debe ser un entero positivo'),
]

module.exports = { createRules, updateRules, idRule }
