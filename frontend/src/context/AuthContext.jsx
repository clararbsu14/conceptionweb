import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('autoloc_user')) || null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('autoloc_token', data.token)
      localStorage.setItem('autoloc_user', JSON.stringify(data.user))
      setUser(data.user)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Erreur de connexion' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('autoloc_token')
    localStorage.removeItem('autoloc_user')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'gerant'

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
