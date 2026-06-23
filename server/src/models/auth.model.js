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
}

module.exports = new AuthModel()
