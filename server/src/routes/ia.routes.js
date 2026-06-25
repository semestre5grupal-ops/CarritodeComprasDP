const { Router } = require('express')
const { chat } = require('../controllers/ia.controller')

const router = Router()

router.post('/chat', chat)

module.exports = router
