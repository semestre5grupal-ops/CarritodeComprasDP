const { Router } = require('express')
const { getAll } = require('../controllers/usuario.controller')
const { authenticate, requireAdmin } = require('../middleware/auth')

const router = Router()

router.get('/', authenticate, requireAdmin, getAll)

module.exports = router
