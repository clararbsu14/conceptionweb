import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
})

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('autoloc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 → clear session
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('autoloc_token')
      localStorage.removeItem('autoloc_user')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

export default api
