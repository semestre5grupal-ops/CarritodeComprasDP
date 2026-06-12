const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const { PORT, NODE_ENV, CORS_ORIGIN, LOG_LEVEL } = require('./config/env')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')

const authRoutes = require('./routes/auth.routes')
const productoRoutes = require('./routes/producto.routes')
const pedidoRoutes = require('./routes/pedido.routes')
const usuarioRoutes = require('./routes/usuario.routes')

const app = express()

app.use(helmet())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMIT', message: 'Demasiadas solicitudes. Intente de nuevo en 15 minutos.' },
})
app.use(limiter)

app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

if (NODE_ENV !== 'test') {
  app.use(morgan(LOG_LEVEL))
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: NODE_ENV })
})

app.use('/api/auth', authRoutes)
app.use('/api/productos', productoRoutes)
app.use('/api/pedidos', pedidoRoutes)
app.use('/api/usuarios', usuarioRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

const server = app.listen(PORT, () => {
  console.log(`[SERVER] Shop Sport API corriendo en puerto ${PORT} (${NODE_ENV})`)
  console.log(`[SERVER] CORS permitido para: ${CORS_ORIGIN.join(', ')}`)
})

process.on('unhandledRejection', (reason) => {
  console.error('[SERVER] Unhandled Rejection:', reason)
})

module.exports = { app, server }
