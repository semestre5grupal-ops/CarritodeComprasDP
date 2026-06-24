import api from '../services/api'

class ProductController {
  async getAll() {
    try {
      const response = await api.get('/productos')
      return response.data || []
    } catch (error) {
      throw new Error(error.message || 'Error al cargar productos', { cause: error })
    }
  }

  async create(data) {
    try {
      const response = await api.post('/productos', data)
      return response.data
    } catch (error) {
      throw new Error(error.message || 'Error al crear producto', { cause: error })
    }
  }

  async update(id, data) {
    try {
      const response = await api.put(`/productos/${id}`, data)
      return response.data
    } catch (error) {
      throw new Error(error.message || 'Error al actualizar producto', { cause: error })
    }
  }

  async remove(id) {
    try {
      await api.delete(`/productos/${id}`)
      return true
    } catch (error) {
      throw new Error(error.message || 'Error al eliminar producto', { cause: error })
    }
  }
}

export default new ProductController()
