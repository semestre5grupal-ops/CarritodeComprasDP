const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Marca
  let marca = await prisma.marcas.findFirst();
  if (!marca) {
    marca = await prisma.marcas.create({ data: { mar_nombre: 'Default Marca', mar_estado: 'ACT' }});
  }

  // 2. Temporada
  let temporada = await prisma.temporadas.findFirst();
  if (!temporada) {
    temporada = await prisma.temporadas.create({ data: { tem_nombre: 'Default Temporada', tem_fecha_inicio: new Date(), tem_fecha_fin: new Date(), tem_estado: 'ACT' }});
  }

  // 3. Unidad Medida
  let unidad = await prisma.unidad_medida.findFirst();
  if (!unidad) {
    unidad = await prisma.unidad_medida.create({ data: { umd_abreviado: 'U', umd_descripcion: 'Unidad', um_estado: 'ACT' }});
  }

  // 4. Categoria
  let categoria = await prisma.categoria.findFirst();
  if (!categoria) {
    categoria = await prisma.categoria.create({ data: { cat_nombre: 'Default Categoria', cat_estado: 'ACT' }});
  }

  // 5. Material
  let material = await prisma.materiales.findFirst();
  if (!material) {
    material = await prisma.materiales.create({ data: { mat_nombre: 'Default Material', mat_cuidados: 'Ninguno', mat_estado: 'ACT' }});
  }

  // 6. Vendedor
  let vendedor = await prisma.vendedores.findFirst();
  if (!vendedor) {
    // vendedor requires empleado
    let empleado = await prisma.empleados.findFirst();
    if (!empleado) {
      empleado = await prisma.empleados.create({
        data: {
          emp_cedula: '0000000000',
          emp_nom1: 'Default',
          emp_ap1: 'Vendedor',
          emp_sexo: 'M',
          emp_fechanacimiento: new Date(),
          emp_email: 'vendedor@test.com',
          emp_direccion: 'Local',
          emp_telefono: '0000000000'
        }
      });
    }
    vendedor = await prisma.vendedores.create({
      data: {
        id_empleado: empleado.id_empleado,
        ven_comision: 0.1,
        ven_meta: 100,
        ven_estado: 'ACT'
      }
    });
  }

  // 7. Cliente (for purchases)
  let cliente = await prisma.clientes.findFirst();
  if (!cliente) {
    let ciudad = await prisma.ciudad.findFirst();
    if (!ciudad) {
      ciudad = await prisma.ciudad.create({ data: { ciu_nombre: 'Default', ciu_abreviado: 'DEF', ciu_estado: true }});
    }
    cliente = await prisma.clientes.create({
      data: {
        id_ciudad: ciudad.id_ciudad,
        cli_nombre: 'Consumidor Final',
        cli_ciruc: '9999999999999',
        cli_celular: '0000000000',
        cli_telefono: '0000000000',
        cli_correo: 'cf@test.com',
        cli_categoria: 1,
        cli_estado: true
      }
    });
  }

  console.log('Dummy data seeded successfully');
}

main().catch(console.error).finally(() => prisma.$disconnect());
