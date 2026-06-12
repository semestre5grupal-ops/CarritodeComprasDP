const API_URL = 'https://shopsport-api.onrender.com/api/productos';

  { nombre: 'Pro Fit Tank', precio: 25.00, stock: 50, categoria: 'Hombre', color: 'Azul', talla: 'M', imagen: '/images/2011c388_401_gm_ft_glb.jpg' },
  { nombre: 'Chompa Hombre', precio: 35.00, stock: 50, categoria: 'Hombre', color: 'Gris', talla: 'L', imagen: '/images/chompa-hombre.jpg' },
  { nombre: 'Short Deportivo 1', precio: 20.00, stock: 50, categoria: 'Unisex', color: 'Negro', talla: 'M', imagen: '/images/gf89h-58637b.1.jpg' },
  { nombre: 'Camiseta Athletic', precio: 22.00, stock: 50, categoria: 'Unisex', color: 'Gris', talla: 'L', imagen: '/images/gp08h-g61_p1.jpg' },
  { nombre: 'Short Deportivo 2', precio: 20.00, stock: 50, categoria: 'Unisex', color: 'Negro', talla: 'S', imagen: '/images/gt18h-586plb.5.jpg' },
  { nombre: 'Gym Wear', precio: 40.00, stock: 50, categoria: 'Mujer', color: 'Gris', talla: 'M', imagen: '/images/gym-wear.jpg' },
  { nombre: 'Pantalón Deportivo 1', precio: 30.00, stock: 50, categoria: 'Unisex', color: 'Negro', talla: 'M', imagen: '/images/m4802-586644.2.jpg' },
  { nombre: 'Pantalón Deportivo 2', precio: 30.00, stock: 50, categoria: 'Unisex', color: 'Gris', talla: 'L', imagen: '/images/m7129-ch-001.1.jpg' },
  { nombre: 'Camiseta Blanca 1', precio: 25.00, stock: 50, categoria: 'Mujer', color: 'Blanco', talla: 'S', imagen: '/images/ma6399a_wht-nlo_4_1.jpg' },
  { nombre: 'Camiseta Negra 1', precio: 25.00, stock: 50, categoria: 'Mujer', color: 'Negro', talla: 'M', imagen: '/images/ma6400a_blk-sil_3.jpg' },
  { nombre: 'Camiseta Negra 2', precio: 25.00, stock: 50, categoria: 'Mujer', color: 'Negro', talla: 'L', imagen: '/images/mr7427a_blk-blk_2.jpg' },
  { nombre: 'Camiseta Azul', precio: 25.00, stock: 50, categoria: 'Mujer', color: 'Azul', talla: 'M', imagen: '/images/mr7427a_ind-ind_5.jpg' },
  { nombre: 'Mujer Correr', precio: 45.00, stock: 50, categoria: 'Mujer', color: 'Negro', talla: 'S', imagen: '/images/mujer-correr.webp' },
  { nombre: 'Mujer Movimiento', precio: 45.00, stock: 50, categoria: 'Mujer', color: 'Azul', talla: 'M', imagen: '/images/mujer-movimiento.jpg' },
  { nombre: 'Persona Yoga', precio: 40.00, stock: 50, categoria: 'Mujer', color: 'Blanco', talla: 'S', imagen: '/images/persona-yoga.webp' },
  { nombre: 'Personas Corriendo 1', precio: 50.00, stock: 50, categoria: 'Unisex', color: 'Azul', talla: 'L', imagen: '/images/personas-corriendo.png' },
  { nombre: 'Personas Corriendo 2', precio: 50.00, stock: 50, categoria: 'Unisex', color: 'Negro', talla: 'M', imagen: '/images/personas-corriendo.webp' },
  { nombre: 'Running Color Negro', precio: 55.00, stock: 50, categoria: 'Unisex', color: 'Negro', talla: 'L', imagen: '/images/running-color-negro.webp' },
  { nombre: 'Conjunto Negro Mujer', precio: 60.00, stock: 50, categoria: 'Mujer', color: 'Negro', talla: 'M', imagen: '/images/sport-conjunto-negro-mujer.jpg' },
  { nombre: 'Leggins Azul Deslavado', precio: 35.00, stock: 50, categoria: 'Mujer', color: 'Azul', talla: 'M', imagen: '/images/sport-leggins-azul-deslavado-mujer.jpg' },
  { nombre: 'Short Blanco', precio: 20.00, stock: 50, categoria: 'Mujer', color: 'Blanco', talla: 'S', imagen: '/images/sport-short-blanco.jpg' },
  { nombre: 'Short Negro Mujer', precio: 20.00, stock: 50, categoria: 'Mujer', color: 'Negro', talla: 'M', imagen: '/images/sport-short-negro-mujer.jpg' },
  { nombre: 'Top Azul Deslavado', precio: 15.00, stock: 50, categoria: 'Mujer', color: 'Azul', talla: 'S', imagen: '/images/sport-top-azul-deslavado-mujer.jpg' },
  { nombre: 'Top Azul', precio: 15.00, stock: 50, categoria: 'Mujer', color: 'Azul', talla: 'M', imagen: '/images/sport-top-azul-mujer.jpg' },
  { nombre: 'Top Azul Oscuro', precio: 15.00, stock: 50, categoria: 'Mujer', color: 'Azul', talla: 'L', imagen: '/images/sport-top-azul-oscuro-mujer.jpg' },
  { nombre: 'Top Blanco', precio: 15.00, stock: 50, categoria: 'Mujer', color: 'Blanco', talla: 'S', imagen: '/images/sport-top-blanco-mujer.jpg' },
  { nombre: 'Top Negro', precio: 15.00, stock: 50, categoria: 'Mujer', color: 'Negro', talla: 'M', imagen: '/images/sport-top-negro-mujer.jpg' },
  { nombre: 'Top Vino', precio: 15.00, stock: 50, categoria: 'Mujer', color: 'Rojo', talla: 'M', imagen: '/images/top-mujer-vino.webp' },
  { nombre: 'Zapatos Deportivos', precio: 80.00, stock: 50, categoria: 'Unisex', color: 'Blanco', talla: '40', imagen: '/images/w6693-ch-100.1.jpg' },
  { nombre: 'Camiseta Gris', precio: 25.00, stock: 50, categoria: 'Hombre', color: 'Gris', talla: 'L', imagen: '/images/wa6401a_blk-sil_1.jpg' },
  { nombre: 'Camiseta Azul Oscuro', precio: 25.00, stock: 50, categoria: 'Hombre', color: 'Azul', talla: 'XL', imagen: '/images/wa6907b_mdn-mdn_4.jpg' },
  { nombre: 'Yoga Mujer', precio: 40.00, stock: 50, categoria: 'Mujer', color: 'Gris', talla: 'S', imagen: '/images/yoga-mujer.avif' }
];

async function subirProductos() {
  console.log('Iniciando sesión como Administrador...');
  let token = '';
  try {
    const loginRes = await fetch('https://shopsport-api.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin123!' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.error('❌ Error al iniciar sesión:', loginData);
      return;
    }
    token = loginData.data?.token || loginData.token;
    console.log('✅ Sesión iniciada correctamente. Token obtenido.\n');
  } catch (err) {
    console.error('❌ Error de red al intentar iniciar sesión:', err);
    return;
  }

  console.log('Iniciando la subida de 32 productos a Render...\n');
  
  for (let i = 0; i < productosNuevos.length; i++) {
    const p = productosNuevos[i];
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(p)
      });
      
      if (res.ok) {
        console.log(`✅ [${i + 1}/32] Producto creado: ${p.nombre}`);
      } else {
        const error = await res.json();
        console.error(`❌ [${i + 1}/32] Error en ${p.nombre}:`, error);
      }
    } catch (err) {
      console.error(`❌ [${i + 1}/32] Fallo de red en ${p.nombre}:`, err.message);
    }
  }
  
  console.log('\n¡Proceso finalizado!');
}

subirProductos();
