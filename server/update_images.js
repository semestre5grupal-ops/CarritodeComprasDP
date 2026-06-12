const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const productosData = [
  { nombre: 'Legging Seamless Fit', imagen: '/images/sport-leggins-azul-deslavado-mujer.jpg' },
  { nombre: 'Top Training Core', imagen: '/images/sport-top-azul-mujer.jpg' },
  { nombre: 'Pro Fit Tank', imagen: '/images/2011c388_401_gm_ft_glb.jpg' },
  { nombre: 'Athletic Performance Shirt', imagen: '/images/gp08h-g61_p1.jpg' },
  { nombre: 'Conjunto Negro Mujer', imagen: '/images/sport-conjunto-negro-mujer.jpg' },
  { nombre: 'Short Negro Mujer', imagen: '/images/sport-short-negro-mujer.jpg' },
  { nombre: 'Leggins Azul Deslavado', imagen: '/images/sport-leggins-azul-deslavado-mujer.jpg' },
  { nombre: 'Top Azul Deslavado', imagen: '/images/sport-top-azul-deslavado-mujer.jpg' },
  { nombre: 'Top Azul Oscuro', imagen: '/images/sport-top-azul-oscuro-mujer.jpg' },
  { nombre: 'Top Blanco', imagen: '/images/sport-top-blanco-mujer.jpg' },
  { nombre: 'Top Negro', imagen: '/images/sport-top-negro-mujer.jpg' },
  { nombre: 'Top Azul', imagen: '/images/sport-top-azul-mujer.jpg' },
  { nombre: 'Top Vino', imagen: '/images/top-mujer-vino.webp' },
  { nombre: 'Short Blanco', imagen: '/images/sport-short-blanco.jpg' },
  { nombre: 'Camiseta Athletic', imagen: '/images/gp08h-g61_p1.jpg' },
  { nombre: 'Short Deportivo 1', imagen: '/images/sport-short-negro-mujer.jpg' },
  { nombre: 'Short Deportivo 2', imagen: '/images/sport-short-negro-mujer.jpg' },
  { nombre: 'Pantalón Deportivo 1', imagen: '/images/w6693-ch-100.1.jpg' },
  { nombre: 'Pantalón Deportivo 2', imagen: '/images/w6693-ch-100.1.jpg' }
];

async function updateImages() {
  const prods = await prisma.productos.findMany();
  for (const p of prods) {
    const match = productosData.find(d => d.nombre === p.pro_descripcion);
    if (match) {
      await prisma.productos.update({
        where: { id_producto: p.id_producto },
        data: { pro_imagen: match.imagen }
      });
      console.log('Updated', p.pro_descripcion);
    } else {
      // Default image for others
      await prisma.productos.update({
        where: { id_producto: p.id_producto },
        data: { pro_imagen: '/images/gym-wear.jpg' }
      });
      console.log('Updated with default', p.pro_descripcion);
    }
  }
}
updateImages().catch(console.error).finally(() => prisma.$disconnect());
