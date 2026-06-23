const { Router } = require('express')
const { getAll, create, update, remove } = require('../controllers/usuario.controller')
const { authenticate, requireAdmin } = require('../middleware/auth')

const router = Router()

router.get('/', authenticate, requireAdmin, getAll)
router.post('/', authenticate, requireAdmin, create)
router.put('/:id', authenticate, requireAdmin, update)
router.delete('/:id', authenticate, requireAdmin, remove)

module.exports = router
