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
  async create(data) {
    return prisma.usuarios.create({
      data: {
        usu_nombre: data.username,
        usu_clave: data.password,
        usu_nombrereal: data.email,
        usu_rol: data.role,
        usu_estado_: 'A'
      }
    })
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
