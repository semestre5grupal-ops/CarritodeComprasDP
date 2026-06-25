const { query } = require('express-validator')

const ventasRules = [
  query('from')
    .optional()
    .isISO8601().withMessage('El parámetro "from" debe ser una fecha válida (ISO 8601)'),

  query('to')
    .optional()
    .isISO8601().withMessage('El parámetro "to" debe ser una fecha válida (ISO 8601)'),
]

module.exports = { ventasRules }
