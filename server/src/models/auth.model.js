const prisma = require('../lib/prisma')

class AuthModel {
  async findByUsername(username) {
    return prisma.usuarios.findFirst({
      where: { usu_nombre: username },
    })
  }

  async findById(id) {
    return prisma.usuarios.findFirst({
      where: { id_usuario: id },
      select: { id_usuario: true, usu_nombre: true, usu_nombrereal: true, usu_rol: true },
    })
  }

  async create(data) {
    return prisma.usuarios.create({ data })
  }
}

module.exports = new AuthModel()
