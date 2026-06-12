const UsuarioModel = require('../models/usuario.model')

async function getAll(req, res, next) {
  try {
    const usuarios = await UsuarioModel.findAll()
    res.json({ data: usuarios })
  } catch (err) {
    next(err)
  }
}

module.exports = { getAll }
