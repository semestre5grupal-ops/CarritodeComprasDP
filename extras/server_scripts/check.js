const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$queryRawUnsafe('SELECT pro_imagen FROM productos LIMIT 1')
  .then(console.log)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
