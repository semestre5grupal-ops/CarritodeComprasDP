const { body } = require('express-validator')

const createRules = [
  body('detalles')
    .isArray({ min: 1 }).withMessage('El pedido debe contener al menos un producto'),

  body('detalles.*.productoId')
    .isInt({ min: 1 }).withMessage('El ID del producto debe ser un entero positivo'),

  body('detalles.*.cantidad')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),

  body('detalles.*.precioUnitario')
    .isFloat({ min: 0.01 }).withMessage('El precio unitario debe ser un número positivo'),
]

module.exports = { createRules }
