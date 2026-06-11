const { Router } = require('express')
const { getAll, getById, create, update, remove } = require('../controllers/producto.controller')
const { createRules, updateRules, idRule } = require('../validators/producto.validator')
const { validate } = require('../middleware/validate')
const { authenticate } = require('../middleware/auth')
const { authorize } = require('../middleware/role')

const router = Router()

router.get('/', getAll)
router.get('/:id', idRule, validate, getById)
router.post('/', authenticate, authorize('admin'), createRules, validate, create)
router.put('/:id', authenticate, authorize('admin'), updateRules, validate, update)
router.delete('/:id', authenticate, authorize('admin'), idRule, validate, remove)

module.exports = router
