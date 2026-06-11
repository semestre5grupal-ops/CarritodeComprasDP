const { NODE_ENV } = require('../config/env')

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500
  const errorCode = err.error || 'INTERNAL_ERROR'

  const body = {
    error: errorCode,
    message: err.message || 'Error interno del servidor',
  }

  if (NODE_ENV === 'development') {
    body.stack = err.stack
  }

  if (NODE_ENV !== 'test') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message)
  }

  res.status(statusCode).json(body)
}

function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  })
}

module.exports = { errorHandler, notFoundHandler }
