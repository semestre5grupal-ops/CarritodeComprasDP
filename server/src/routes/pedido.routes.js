const { Router } = require('express')
const { create, getMyOrders, getAll } = require('../controllers/pedido.controller')
const { createRules } = require('../validators/pedido.validator')
const { validate } = require('../middleware/validate')
const { authenticate } = require('../middleware/auth')

const router = Router()

router.post('/', authenticate, createRules, validate, create)
router.get('/mis-pedidos', authenticate, getMyOrders)
router.get('/', authenticate, getAll)

module.exports = router
