const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config/env')

function authenticate(req, res, next) {
  const header = req.headers.authorization

  if (!header) {
    return res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Token de autenticación requerido' })
  }

  const parts = header.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'INVALID_TOKEN_FORMAT', message: 'Formato de token inválido. Use: Bearer <token>' })
  }

  const token = parts[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    }
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'TOKEN_EXPIRED', message: 'El token ha expirado. Inicie sesión nuevamente' })
    }
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Token inválido o alterado' })
  }
}

module.exports = { authenticate }
