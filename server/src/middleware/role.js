function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Debe estar autenticado para acceder a este recurso' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: `Acceso denegado. Se requiere rol: ${allowedRoles.join(' o ')}` })
    }

    next()
  }
}

module.exports = { authorize }
