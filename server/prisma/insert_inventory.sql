INSERT INTO inventario_bodegas (id_bodega, id_variante, inv_periodo, inv_saldo_inicial, inv_qty_ingresos, inv_qty_egresos, inv_qty_ajustes, inv_saldo_final)
SELECT 1, id_variante, '2026-06', 50, 50, 0, 0, 50
FROM variantes_producto;
