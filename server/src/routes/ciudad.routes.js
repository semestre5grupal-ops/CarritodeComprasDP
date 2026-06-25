const { Router } = require('express')
const { getAll } = require('../controllers/ciudad.controller')

const router = Router()

// Endpoint público: necesario para llenar el dropdown de ciudades
// tanto en el registro público como en el panel admin.
router.get('/', getAll)

module.exports = router
