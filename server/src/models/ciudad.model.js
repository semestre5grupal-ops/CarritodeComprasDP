const prisma = require('../lib/prisma')

class CiudadModel {
  async findAllActive() {
    return prisma.ciudad.findMany({
      where: { ciu_estado: true },
      select: {
        id_ciudad: true,
        ciu_nombre: true,
      },
      orderBy: {
        ciu_nombre: 'asc',
      },
    })
  }
}

module.exports = new CiudadModel()
