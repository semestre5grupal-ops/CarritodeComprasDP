const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const AuthModel = require('../models/auth.model')
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env')

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body

    const existingUser = await AuthModel.findByUsername(username)
    if (existingUser) {
      return res.status(409).json({
        error: 'DUPLICATE_ENTRY',
        message: 'El usuario ya existe',
      })
    }

    const existingEmail = await AuthModel.findByEmail(email)
    if (existingEmail) {
      return res.status(409).json({
        error: 'DUPLICATE_ENTRY',
        message: 'El correo ya está registrado',
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await AuthModel.create({
      usu_nombre: username, 
      usu_nombrereal: email, 
      usu_clave: passwordHash, 
      usu_rol: 'user',
      usu_estado_: 'Activo'
    })

    const tokenUser = { id: user.id_usuario, username: user.usu_nombre, email: user.usu_nombrereal, role: user.usu_rol }
    const token = generateToken(tokenUser)

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: tokenUser,
    })
  } catch (err) {
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body

    const user = await AuthModel.findByUsername(username)
    if (!user) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' })
    }

    const valid = await bcrypt.compare(password, user.usu_clave)
    if (!valid) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' })
    }

    const tokenUser = { id: user.id_usuario, username: user.usu_nombre, email: user.usu_nombrereal, role: user.usu_rol }
    const token = generateToken(tokenUser)

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: tokenUser,
    })
  } catch (err) {
    next(err)
  }
}

async function profile(req, res, next) {
  try {
    const user = await AuthModel.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'Usuario no encontrado' })
    }

    const cliente = await AuthModel.findClienteByEmail(user.usu_nombrereal)

    const profileUser = { 
      id: user.id_usuario, 
      username: user.usu_nombre, 
      email: user.usu_nombrereal, 
      role: user.usu_rol,
      cliente: cliente || null
    }
    res.json({ user: profileUser })
  } catch (err) {
    next(err)
  }
}

async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id
    const { username, email, nombre, celular, telefono } = req.body

    if (!username && !email && !nombre && !celular && !telefono) {
      return res.status(400).json({ error: 'NO_DATA', message: 'Debes enviar al menos un campo para actualizar.' })
    }

    await AuthModel.updateProfile(userId, { username, email, nombre, celular, telefono })

    // Re-obtener el usuario actualizado para devolver un token fresco
    const updatedUser = await AuthModel.findById(userId)
    const tokenUser = {
      id: updatedUser.id_usuario,
      username: updatedUser.usu_nombre,
      email: updatedUser.usu_nombrereal,
      role: updatedUser.usu_rol
    }
    const token = generateToken(tokenUser)

    res.json({
      message: 'Perfil actualizado correctamente',
      token,
      user: tokenUser
    })
  } catch (err) {
    if (err.message === 'Usuario no encontrado') {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Usuario no encontrado' })
    }
    next(err)
  }
}

module.exports = { register, login, profile, updateProfile }
