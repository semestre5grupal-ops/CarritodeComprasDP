const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')
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

    const existingUser = await prisma.usuario.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    })

    if (existingUser) {
      const field = existingUser.username === username ? 'username' : 'email'
      return res.status(409).json({
        error: 'DUPLICATE_ENTRY',
        message: `El ${field} ya está registrado`,
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.usuario.create({
      data: { username, email, passwordHash, role: 'user' },
    })

    const token = generateToken(user)

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    })
  } catch (err) {
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'campo'
      return res.status(409).json({ error: 'DUPLICATE_ENTRY', message: `El ${field} ya está registrado` })
    }
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body

    const user = await prisma.usuario.findUnique({ where: { username } })
    if (!user) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' })
    }

    const token = generateToken(user)

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
}

async function profile(req, res, next) {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'Usuario no encontrado' })
    }

    res.json({ user })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, profile }
