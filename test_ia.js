require('dotenv').config()
const { chat } = require('./server/src/controllers/ia.controller')

const req = { body: { message: "Hola" } }
const res = { 
  json: (data) => console.log("RES:", data),
  status: (code) => ({ json: (data) => console.log("STATUS", code, "RES:", data) })
}
const next = (err) => console.error("NEXT ERR:", err)

chat(req, res, next)
