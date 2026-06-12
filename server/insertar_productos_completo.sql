/*=================================================================
    LIMPIEZA DE TABLAS
=================================================================*/
TRUNCATE TABLE "productos" RESTART IDENTITY CASCADE;

/*=================================================================
    INSERT CATEGORIAS
=================================================================*/
INSERT INTO "categoria" ("id_categoria", "cat_nombre", "cat_estado") VALUES 
(1, 'Hombre', 'ACT'),
(2, 'Mujer', 'ACT'),
(3, 'Unisex', 'ACT')
ON CONFLICT ("id_categoria") DO UPDATE SET "cat_nombre" = EXCLUDED."cat_nombre";

/*=================================================================
    INSERT COLORES
=================================================================*/
INSERT INTO "colores" ("id_color", "col_nombre", "col_familia", "col_estado") VALUES 
(1, 'Negro', 'Oscuros', 'ACT'),
(2, 'Blanco', 'Claros', 'ACT'),
(3, 'Azul', 'Frios', 'ACT'),
(4, 'Gris', 'Neutros', 'ACT'),
(5, 'Rojo', 'Calidos', 'ACT')
ON CONFLICT ("id_color") DO UPDATE SET "col_nombre" = EXCLUDED."col_nombre";

/*=================================================================
    INSERT TALLAS
=================================================================*/
INSERT INTO "tallas" ("id_talla", "tal_codigo", "tal_descripcion", "tal_sistema", "tal_orden", "tal_estado") VALUES 
(1, 'S', 'S', 'US', 1, 'ACT'),
(2, 'M', 'M', 'US', 2, 'ACT'),
(3, 'L', 'L', 'US', 3, 'ACT'),
(4, 'XL', 'XL', 'US', 4, 'ACT'),
(5, '40', '40', 'EU', 5, 'ACT')
ON CONFLICT ("id_talla") DO UPDATE SET "tal_descripcion" = EXCLUDED."tal_descripcion";

/*=================================================================
    INSERT PRODUCTOS 
    (Asumiendo id_marca=1, id_temporada=1, id_unidadmedida=1, id_material=1)
=================================================================*/
INSERT INTO "productos" ("id_producto", "id_marca", "id_temporada", "id_unidadmedida", "id_categoria", "uni_id_unidadmedida", "id_material", "pro_descripcion", "pro_factor_conversion_", "pro_valor_compra", "pro_genero_", "pro_estado", "pro_imagen") VALUES 
(1, 1, 1, 1, 1, 1, 1, 'Pro Fit Tank', 1, 25.00, 'U', 'ACT', '/images/2011c388_401_gm_ft_glb.jpg'),
(3, 1, 1, 1, 3, 1, 1, 'Short Deportivo 1', 1, 20.00, 'U', 'ACT', '/images/gf89h-58637b.1.jpg'),
(4, 1, 1, 1, 3, 1, 1, 'Camiseta Athletic', 1, 22.00, 'U', 'ACT', '/images/gp08h-g61_p1.jpg'),
(5, 1, 1, 1, 3, 1, 1, 'Short Deportivo 2', 1, 20.00, 'U', 'ACT', '/images/gt18h-586plb.5.jpg'),
(7, 1, 1, 1, 3, 1, 1, 'Pantalón Deportivo 1', 1, 30.00, 'U', 'ACT', '/images/m4802-586644.2.jpg'),
(8, 1, 1, 1, 3, 1, 1, 'Pantalón Deportivo 2', 1, 30.00, 'U', 'ACT', '/images/m7129-ch-001.1.jpg'),
(9, 1, 1, 1, 2, 1, 1, 'Camiseta Blanca 1', 1, 25.00, 'U', 'ACT', '/images/ma6399a_wht-nlo_4_1.jpg'),
(10, 1, 1, 1, 2, 1, 1, 'Camiseta Negra 1', 1, 25.00, 'U', 'ACT', '/images/ma6400a_blk-sil_3.jpg'),
(11, 1, 1, 1, 2, 1, 1, 'Camiseta Negra 2', 1, 25.00, 'U', 'ACT', '/images/mr7427a_blk-blk_2.jpg'),
(12, 1, 1, 1, 2, 1, 1, 'Camiseta Azul', 1, 25.00, 'U', 'ACT', '/images/mr7427a_ind-ind_5.jpg'),
(19, 1, 1, 1, 2, 1, 1, 'Conjunto Negro Mujer', 1, 60.00, 'U', 'ACT', '/images/sport-conjunto-negro-mujer.jpg'),
(20, 1, 1, 1, 2, 1, 1, 'Leggins Azul Deslavado', 1, 35.00, 'U', 'ACT', '/images/sport-leggins-azul-deslavado-mujer.jpg'),
(21, 1, 1, 1, 2, 1, 1, 'Short Blanco', 1, 20.00, 'U', 'ACT', '/images/sport-short-blanco.jpg'),
(22, 1, 1, 1, 2, 1, 1, 'Short Negro Mujer', 1, 20.00, 'U', 'ACT', '/images/sport-short-negro-mujer.jpg'),
(23, 1, 1, 1, 2, 1, 1, 'Top Azul Deslavado', 1, 15.00, 'U', 'ACT', '/images/sport-top-azul-deslavado-mujer.jpg'),
(24, 1, 1, 1, 2, 1, 1, 'Top Azul', 1, 15.00, 'U', 'ACT', '/images/sport-top-azul-mujer.jpg'),
(25, 1, 1, 1, 2, 1, 1, 'Top Azul Oscuro', 1, 15.00, 'U', 'ACT', '/images/sport-top-azul-oscuro-mujer.jpg'),
(26, 1, 1, 1, 2, 1, 1, 'Top Blanco', 1, 25.00, 'U', 'ACT', '/images/sport-top-blanco-mujer.jpg'),
(27, 1, 1, 1, 2, 1, 1, 'Top Negro', 1, 15.00, 'U', 'ACT', '/images/sport-top-negro-mujer.jpg'),
(28, 1, 1, 1, 2, 1, 1, 'Top Vino', 1, 15.00, 'U', 'ACT', '/images/top-mujer-vino.webp'),
(29, 1, 1, 1, 3, 1, 1, 'Zapatos Deportivos', 1, 80.00, 'U', 'ACT', '/images/w6693-ch-100.1.jpg'),
(30, 1, 1, 1, 1, 1, 1, 'Camiseta Gris', 1, 25.00, 'U', 'ACT', '/images/wa6401a_blk-sil_1.jpg'),
(31, 1, 1, 1, 1, 1, 1, 'Camiseta Azul Oscuro', 1, 25.00, 'U', 'ACT', '/images/wa6907b_mdn-mdn_4.jpg');

/*=================================================================
    INSERT VARIANTES
=================================================================*/
INSERT INTO "variantes_producto" ("id_variante", "id_producto", "id_color", "id_talla", "var_cod_barras", "var_precio_venta", "var_estado") VALUES 
(1, 1, 3, 2, '0000', 25.00, 'ACT'),
(3, 3, 1, 2, '0000', 20.00, 'ACT'),
(4, 4, 4, 3, '0000', 22.00, 'ACT'),
(5, 5, 1, 1, '0000', 20.00, 'ACT'),
(7, 7, 1, 2, '0000', 30.00, 'ACT'),
(8, 8, 4, 3, '0000', 30.00, 'ACT'),
(9, 9, 2, 1, '0000', 25.00, 'ACT'),
(10, 10, 1, 2, '0000', 25.00, 'ACT'),
(11, 11, 1, 3, '0000', 25.00, 'ACT'),
(12, 12, 3, 2, '0000', 25.00, 'ACT'),
(19, 19, 1, 2, '0000', 60.00, 'ACT'),
(20, 20, 3, 2, '0000', 35.00, 'ACT'),
(21, 21, 2, 1, '0000', 20.00, 'ACT'),
(22, 22, 1, 2, '0000', 20.00, 'ACT'),
(23, 23, 3, 1, '0000', 15.00, 'ACT'),
(24, 24, 3, 2, '0000', 15.00, 'ACT'),
(25, 25, 3, 3, '0000', 15.00, 'ACT'),
(26, 26, 2, 1, '0000', 25.00, 'ACT'),
(27, 27, 1, 2, '0000', 15.00, 'ACT'),
(28, 28, 5, 2, '0000', 15.00, 'ACT'),
(29, 29, 2, 5, '0000', 80.00, 'ACT'),
(30, 30, 4, 3, '0000', 25.00, 'ACT'),
(31, 31, 3, 4, '0000', 25.00, 'ACT');

/*=================================================================
    INSERT INVENTARIO
=================================================================*/
INSERT INTO "inventario_bodegas" ("id_bodega", "id_variante", "inv_periodo", "inv_saldo_inicial", "inv_qty_ingresos", "inv_qty_egresos", "inv_qty_ajustes", "inv_saldo_final") VALUES 
(1, 1, '2026-06', 50, 50, 0, 0, 50),
(1, 3, '2026-06', 50, 50, 0, 0, 50),
(1, 4, '2026-06', 50, 50, 0, 0, 50),
(1, 5, '2026-06', 50, 50, 0, 0, 50),
(1, 7, '2026-06', 50, 50, 0, 0, 50),
(1, 8, '2026-06', 50, 50, 0, 0, 50),
(1, 9, '2026-06', 50, 50, 0, 0, 50),
(1, 10, '2026-06', 50, 50, 0, 0, 50),
(1, 11, '2026-06', 50, 50, 0, 0, 50),
(1, 12, '2026-06', 50, 50, 0, 0, 50),
(1, 19, '2026-06', 50, 50, 0, 0, 50),
(1, 20, '2026-06', 50, 50, 0, 0, 50),
(1, 21, '2026-06', 50, 50, 0, 0, 50),
(1, 22, '2026-06', 50, 50, 0, 0, 50),
(1, 23, '2026-06', 50, 50, 0, 0, 50),
(1, 24, '2026-06', 50, 50, 0, 0, 50),
(1, 25, '2026-06', 50, 50, 0, 0, 50),
(1, 26, '2026-06', 50, 50, 0, 0, 50),
(1, 27, '2026-06', 50, 50, 0, 0, 50),
(1, 28, '2026-06', 50, 50, 0, 0, 50),
(1, 29, '2026-06', 50, 50, 0, 0, 50),
(1, 30, '2026-06', 50, 50, 0, 0, 50),
(1, 31, '2026-06', 50, 50, 0, 0, 50);

/* Actualizar las secuencias de IDs para que nuevos inserts desde la web no fallen */
SELECT setval('productos_id_producto_seq', (SELECT MAX(id_producto) FROM productos));
SELECT setval('variantes_producto_id_variante_seq', (SELECT MAX(id_variante) FROM variantes_producto));
