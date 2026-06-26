const { Router } = require('express')
const { register, login, profile, updateProfile } = require('../controllers/auth.controller')
const { registerRules, loginRules } = require('../validators/auth.validator')
const { validate } = require('../middleware/validate')
const { authenticate } = require('../middleware/auth')

const router = Router()

router.post('/register', registerRules, validate, register)
router.post('/login', loginRules, validate, login)
router.get('/profile', authenticate, profile)
router.put('/profile', authenticate, updateProfile)

module.exports = router
