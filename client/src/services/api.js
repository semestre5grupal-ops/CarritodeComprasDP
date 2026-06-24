const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const TOKEN_KEY = 'shopsport_token'
const USER_KEY = 'shopsport_user'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function createHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function request(method, path, body = null) {
  const url = `${API_BASE}${path}`
  const options = { method, headers: createHeaders() }
  if (body !== null) {
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(url, options)
  } catch {
    throw { error: 'NETWORK_ERROR', message: 'Error de conexión. Verifique su conexión a internet.', status: 0 }
  }

  if (response.status === 401) {
    if (path !== '/auth/login') {
      clearAuth()
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }
    const data = await response.json().catch(() => ({}))
    throw { ...data, status: 401 }
  }

  if (response.status === 403) {
    const data = await response.json().catch(() => ({}))
    throw { ...data, status: 403 }
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw { ...data, status: response.status }
  }

  return data
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
}

export { api, setToken, getToken, setUser, getUser, clearAuth }
export default api
