import api from '../services/api'

class OrderController {
  async getAll() {
    try {
      const response = await api.get('/pedidos')
      return response.data || []
    } catch (error) {
      throw new Error(error.message || 'Error al cargar pedidos', { cause: error })
    }
  }

  async getMyOrders() {
    try {
      const response = await api.get('/pedidos/mis-pedidos')
      return response.data || []
    } catch (error) {
      throw new Error(error.message || 'Error al cargar mis pedidos', { cause: error })
    }
  }

  async create(data) {
    try {
      const response = await api.post('/pedidos', data)
      return response.data
    } catch (error) {
      throw new Error(error.message || 'Error al crear pedido', { cause: error })
    }
  }
}

export default new OrderController()
