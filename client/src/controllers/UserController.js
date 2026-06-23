import api from '../services/api'

class UserController {
  async getAll() {
    try {
      const response = await api.get('/usuarios')
      return response.data || []
    } catch (error) {
      throw new Error(error.message || 'Error al cargar usuarios')
    }
  }
}

export default new UserController()
