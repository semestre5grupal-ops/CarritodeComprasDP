const prisma = require('../lib/prisma')

class ClienteModel {
  async findAll() {
    return prisma.clientes.findMany({
      include: {
        ciudad: true,
      },
      orderBy: {
        id_cliente: 'asc',
      },
    })
  }
}

module.exports = new ClienteModel()
