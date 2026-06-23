const UsuarioModel = require('../models/usuario.model')
const bcrypt = require('bcrypt')

async function getAll(req, res, next) {
  try {
    const rawUsuarios = await UsuarioModel.findAll()
    const usuarios = rawUsuarios.map(u => ({
      id: u.id_usuario,
      username: u.usu_nombre,
      email: u.usu_nombrereal,
      role: u.usu_rol
    }))
    res.json({ data: usuarios })
  } catch (err) {
    next(err)
  }
}

async function create(req, res, next) {
  try {
    const { username, email, password, role } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const nuevoUsuario = await UsuarioModel.create({
      username,
      email,
      password: hashedPassword,
      role
    })

    res.status(201).json({ message: 'Usuario creado exitosamente', data: { id: nuevoUsuario.id_usuario } })
  } catch (err) {
    next(err)
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params
    const { username, email, password, role } = req.body
    
    const updateData = { username, email, role }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    await UsuarioModel.update(id, updateData)
    res.json({ message: 'Usuario actualizado exitosamente' })
  } catch (err) {
    next(err)
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params
    await UsuarioModel.remove(id)
    res.json({ message: 'Usuario eliminado exitosamente' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getAll, create, update, remove }
