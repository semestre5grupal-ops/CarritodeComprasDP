const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'CORS_ORIGIN']
const missing = requiredVars.filter(v => !process.env[v])

if (missing.length > 0) {
  console.error(`[ENV] Faltan variables obligatorias: ${missing.join(', ')}`)
  process.exit(1)
}

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  CORS_ORIGIN: process.env.CORS_ORIGIN.split(',').map(s => s.trim()),
  LOG_LEVEL: process.env.LOG_LEVEL || 'dev',
}
