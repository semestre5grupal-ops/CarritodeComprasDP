const prisma = require('../lib/prisma')

class AuthModel {
  async findByUsername(username) {
    return prisma.usuarios.findFirst({
      where: { 
        usu_nombre: {
          equals: username,
          mode: 'insensitive'
        }
      },
    })
  }

  async findByEmail(email) {
    return prisma.usuarios.findFirst({
      where: { 
        usu_nombrereal: {
          equals: email,
          mode: 'insensitive'
        }
      },
    })
  }

  async findClienteByEmail(email) {
    return prisma.clientes.findFirst({
      where: { cli_correo: email }
    })
  }

  async findById(id) {
    return prisma.usuarios.findFirst({
      where: { id_usuario: id },
      select: { id_usuario: true, usu_nombre: true, usu_nombrereal: true, usu_rol: true },
    })
  }

  async create(data) {
    const newUser = await prisma.usuarios.create({ data })

    let ciudadDefault = await prisma.ciudad.findFirst()
    if (!ciudadDefault) {
      ciudadDefault = await prisma.ciudad.create({
        data: { ciu_nombre: 'Default', ciu_abreviado: 'DEF', ciu_estado: true }
      })
    }

    const existingClient = await prisma.clientes.findFirst({
      where: { cli_correo: data.usu_nombrereal }
    })

    if (!existingClient) {
      await prisma.clientes.create({
        data: {
          id_ciudad: ciudadDefault.id_ciudad,
          cli_nombre: data.usu_nombre,
          cli_ciruc: '9999999999',
          cli_celular: '0999999999',
          cli_telefono: '022222222',
          cli_correo: data.usu_nombrereal,
          cli_categoria: 1,
          cli_estado: true
        }
      })
    }

    return newUser
  }

  async updateProfile(id, data) {
    const { username, email, nombre, celular, telefono } = data

    // 1. Obtener datos actuales del usuario
    const currentUser = await prisma.usuarios.findFirst({
      where: { id_usuario: id }
    })
    if (!currentUser) throw new Error('Usuario no encontrado')

    const oldEmail = currentUser.usu_nombrereal

    // 2. Actualizar tabla usuarios (username y email)
    const updatedUser = await prisma.usuarios.update({
      where: { id_usuario: id },
      data: {
        usu_nombre: username || currentUser.usu_nombre,
        usu_nombrereal: email || oldEmail,
      }
    })

    // 3. Actualizar tabla clientes vinculada por email (para que las facturas lleguen al correo nuevo)
    const cliente = await prisma.clientes.findFirst({
      where: { cli_correo: oldEmail }
    })
    if (cliente) {
      await prisma.clientes.update({
        where: { id_cliente: cliente.id_cliente },
        data: {
          cli_nombre: nombre || username || cliente.cli_nombre,
          cli_correo: email || oldEmail,
          cli_celular: celular || cliente.cli_celular,
          cli_telefono: telefono || cliente.cli_telefono,
        }
      })
    }

    return updatedUser
  }
}

module.exports = new AuthModel()
