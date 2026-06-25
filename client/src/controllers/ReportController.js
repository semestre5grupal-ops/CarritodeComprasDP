import api from '../services/api'

class ReportController {
  // from / to: cadenas 'YYYY-MM-DD' (opcionales)
  async getVentas(from, to) {
    try {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const qs = params.toString()
      const response = await api.get(`/reportes/ventas${qs ? `?${qs}` : ''}`)
      return response.data
    } catch (error) {
      throw new Error(error.message || 'Error al cargar el reporte de ventas', { cause: error })
    }
  }
}

export default new ReportController()
