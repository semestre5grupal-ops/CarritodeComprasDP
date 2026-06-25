const { Router } = require('express')
const { getVentas } = require('../controllers/reporte.controller')
const { ventasRules } = require('../validators/reporte.validator')
const { validate } = require('../middleware/validate')
const { authenticate, requireAdmin } = require('../middleware/auth')

const router = Router()

// Reporte de ventas (solo administradores)
router.get('/ventas', authenticate, requireAdmin, ventasRules, validate, getVentas)

module.exports = router
