const ClienteModel = require('../models/cliente.model')

async function getAll(req, res, next) {
  try {
    const rawClientes = await ClienteModel.findAll()
    const clientes = rawClientes.map(c => ({
      id: c.id_cliente,
      nombre: c.cli_nombre,
      ciruc: c.cli_ciruc,
      correo: c.cli_correo,
      celular: c.cli_celular,
      telefono: c.cli_telefono,
      ciudad: c.ciudad?.ciu_nombre || '',
      categoria: c.cli_categoria,
      estado: c.cli_estado,
    }))
    res.json({ data: clientes })
  } catch (err) {
    next(err)
  }
}

module.exports = { getAll }
