import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await login(form.email, form.password)
    if (result.ok) {
      navigate(from, { replace: true })
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12"
      style={{ background: '#0B0D17', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              boxShadow: '0 0 40px rgba(249,115,22,0.3)',
            }}>
            <span className="text-white font-extrabold text-2xl">A</span>
          </div>
          <h1 className="text-[1.75rem] font-bold text-white">Espace gérant</h1>
          <p className="text-[0.875rem] mt-1" style={{ color: '#64748B' }}>Connectez-vous pour accéder à l'administration</p>
        </div>

        {/* Form */}
        <div className="admin-card p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="admin-section-label block mb-2">Email</label>
              <input
                type="email" required autoFocus
                placeholder="gerant@autoloc.fr"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-section-label block mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="admin-input"
                  style={{ paddingRight: '56px' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium hover:text-primary transition-colors"
                  style={{ color: '#475569' }}>
                  {showPw ? 'Masquer' : 'Voir'}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-[0.875rem] rounded-xl px-4 py-3"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="admin-btn-primary w-full"
              style={{ padding: '14px 20px', marginTop: '8px' }}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] mt-8" style={{ color: '#475569' }}>
          <Link to="/" className="hover:text-primary transition-colors">← Retour au site client</Link>
        </p>
      </div>
    </div>
  )
}
