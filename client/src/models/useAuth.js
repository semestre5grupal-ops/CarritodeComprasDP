import { ref, computed } from 'vue'
import { api, setToken, setUser, getUser, clearAuth } from '../services/api'

const user = ref(getUser())
const isAuthenticated = computed(() => user.value !== null)
const isAdmin = computed(() => user.value?.role === 'admin')
const loading = ref(false)

async function login(username, password) {
  loading.value = true
  try {
    const data = await api.post('/auth/login', { username, password })
    setToken(data.token)
    setUser(data.user)
    user.value = data.user
    return data
  } finally {
    loading.value = false
  }
}

async function register(username, email, password) {
  loading.value = true
  try {
    const data = await api.post('/auth/register', { username, email, password })
    setToken(data.token)
    setUser(data.user)
    user.value = data.user
    return data
  } finally {
    loading.value = false
  }
}

function logout() {
  clearAuth()
  user.value = null
}

async function fetchProfile() {
  try {
    const data = await api.get('/auth/profile')
    user.value = data.user
    setUser(data.user)
    return data.user
  } catch {
    logout()
    return null
  }
}

async function updateProfile(profileData) {
  const data = await api.put('/auth/profile', profileData)
  // El backend devuelve un nuevo token con los datos actualizados
  setToken(data.token)
  setUser(data.user)
  user.value = data.user
  return data
}

export function useAuth() {
  return {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
  }
}
