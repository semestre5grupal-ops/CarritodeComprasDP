/**
 * setup.js — Configuración global para los tests de Jest
 *
 * Este archivo se ejecuta ANTES de todos los tests.
 * Carga las variables de entorno del archivo .env.test para que
 * el módulo config/env.js no falle al iniciarse.
 */
const path = require('path')
const dotenv = require('dotenv')

// Cargar variables de entorno de prueba
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') })
