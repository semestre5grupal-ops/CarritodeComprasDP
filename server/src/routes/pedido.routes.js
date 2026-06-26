const { Router } = require('express')
const { create, getMyOrders, getAll, updateStatus, remove, getLocales, enviarFacturaCorreo } = require('../controllers/pedido.controller')
const { createRules } = require('../validators/pedido.validator')
const { validate } = require('../middleware/validate')
const { authenticate, requireAdmin } = require('../middleware/auth')

const router = Router()

router.get('/locales', authenticate, getLocales)
router.post('/', authenticate, createRules, validate, create)
router.get('/mis-pedidos', authenticate, getMyOrders)
router.get('/', authenticate, requireAdmin, getAll)
router.put('/:id/status', authenticate, requireAdmin, updateStatus)
router.post('/:id/enviar-factura', authenticate, requireAdmin, enviarFacturaCorreo)
router.delete('/:id', authenticate, requireAdmin, remove)

module.exports = router
