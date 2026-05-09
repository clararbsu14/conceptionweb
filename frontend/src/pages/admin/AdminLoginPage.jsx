import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logo from '../../img/Logo.png'

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
    <div
      className="flex items-center justify-center px-4 py-12"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1A1F35 0%, #080A12 70%)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="w-full" style={{ maxWidth: 400 }}>
        {/* Logo + heading */}
        <div className="text-center" style={{ marginBottom: 32 }}>
          <img
            src={logo}
            alt="AUTOLOC'"
            style={{ height: 56, display: 'block', margin: '0 auto 24px' }}
          />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF', letterSpacing: '-0.02em' }}>
            Espace gérant
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: 6 }}>
            Connectez-vous pour accéder à l'administration
          </p>
        </div>

        {/* Form card */}
        <div
          style={{
            background: '#111827',
            border: '1px solid #1F2937',
            borderRadius: 24,
            padding: '40px 32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#94A3B8' }}>Email</label>
              <input
                type="email" required autoFocus
                placeholder="gerant@autoloc.fr"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full focus:border-primary outline-none transition-colors"
                style={{
                  background: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: 12,
                  padding: '14px 16px',
                  color: '#FFF',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label className="block mb-2" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#94A3B8' }}>Mot de passe</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full focus:border-primary outline-none transition-colors"
                  style={{
                    background: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: 12,
                    padding: '14px 16px',
                    paddingRight: 64,
                    color: '#FFF',
                    fontSize: '0.9rem',
                  }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748B' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#F97316'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                >
                  {showPw ? 'Masquer' : 'Voir'}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#F87171',
                  fontSize: '0.875rem',
                }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full tap-scale flex items-center justify-center transition-all disabled:opacity-60"
              style={{
                height: 52,
                background: '#F97316',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '0.95rem',
                borderRadius: 100,
                border: 'none',
                marginTop: 8,
                boxShadow: '0 6px 20px rgba(249,115,22,0.4)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#EA580C' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#F97316' }}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center" style={{ marginTop: 32 }}>
          <Link to="/" className="transition-colors" style={{ fontSize: '0.8rem', color: '#475569' }}
            onMouseEnter={e => e.currentTarget.style.color = '#F97316'}
            onMouseLeave={e => e.currentTarget.style.color = '#475569'}
          >
            ← Retour au site client
          </Link>
        </p>
      </div>
    </div>
  )
}
