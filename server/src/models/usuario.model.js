const prisma = require('../lib/prisma')

class UsuarioModel {
  async findAll() {
    return prisma.usuarios.findMany({
      select: {
        id_usuario: true,
        usu_nombre: true,
        usu_nombrereal: true,
        usu_rol: true,
        usu_estado_: true,
      },
      orderBy: {
        id_usuario: 'asc',
      },
    })
  }

  async create(data) {
    const newUser = await prisma.usuarios.create({
      data: {
        usu_nombre: data.username,
        usu_clave: data.password,
        usu_nombrereal: data.email,
        usu_rol: data.role,
        usu_estado_: 'A'
      }
    })

    let ciudadDefault = await prisma.ciudad.findFirst()
    if (!ciudadDefault) {
      ciudadDefault = await prisma.ciudad.create({
        data: { ciu_nombre: 'Default', ciu_abreviado: 'DEF', ciu_estado: true }
      })
    }

    const existingClient = await prisma.clientes.findFirst({
      where: { cli_correo: data.email }
    })

    if (!existingClient) {
      await prisma.clientes.create({
        data: {
          id_ciudad: ciudadDefault.id_ciudad,
          cli_nombre: data.username,
          cli_ciruc: '9999999999',
          cli_celular: '0999999999',
          cli_telefono: '022222222',
          cli_correo: data.email,
          cli_categoria: 1,
          cli_estado: true
        }
      })
    }

    return newUser
  }

  async update(id, data) {
    const updateData = {
      usu_nombre: data.username,
      usu_nombrereal: data.email,
      usu_rol: data.role,
    }
    if (data.password) {
      updateData.usu_clave = data.password
    }
    return prisma.usuarios.update({
      where: { id_usuario: parseInt(id) },
      data: updateData
    })
  }

  async remove(id) {
    return prisma.usuarios.delete({
      where: { id_usuario: parseInt(id) }
    })
  }
}

module.exports = new UsuarioModel()
