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
}

module.exports = new UsuarioModel()
