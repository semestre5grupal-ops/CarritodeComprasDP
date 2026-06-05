const { validationResult } = require('express-validator')

function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
      value: e.value,
    }))
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Datos de entrada inválidos',
      details: formatted,
    })
  }
  next()
}

module.exports = { validate }
