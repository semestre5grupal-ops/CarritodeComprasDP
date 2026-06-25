const CiudadModel = require('../models/ciudad.model')

async function getAll(req, res, next) {
  try {
    const rawCiudades = await CiudadModel.findAllActive()
    const ciudades = rawCiudades.map(c => ({
      id: c.id_ciudad,
      nombre: c.ciu_nombre,
    }))
    res.json({ data: ciudades })
  } catch (err) {
    next(err)
  }
}

module.exports = { getAll }
