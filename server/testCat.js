require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ProductoModel = require('./src/models/producto.model');

async function run() {
  try {
    const cat = await ProductoModel.getOrCreateCategoria("Mujer");
    console.log("Returned Cat for Mujer:", cat);
    
    const cat2 = await ProductoModel.getOrCreateCategoria("Hombre");
    console.log("Returned Cat for Hombre:", cat2);
  } catch(e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
