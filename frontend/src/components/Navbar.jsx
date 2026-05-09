import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from "../img/Logo.png";


export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const close = () => setOpen(false)
  const handleLogout = () => { logout(); navigate('/'); close() }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_1px_0_0_#F1F5F9,0_2px_8px_rgba(0,0,0,0.03)]">
      <div className="container">
        <div className="flex items-center justify-between h-[60px]">

          {/* Logo */}
          <Link to="/" onClick={close} className="flex items-center gap-2.5 tap-scale">
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <div>
              <div className="font-black text-dark text-sm leading-none">AUTOLOC</div>
              <div className="text-primary text-[9px] font-bold leading-none mt-0.5 tracking-wider uppercase">Le confort notre atout</div>
            </div>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(({ to, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `btn btn-ghost text-sm font-semibold ${isActive ? 'text-primary bg-primary-light' : ''}`
                }>
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin/dashboard"
                className={({ isActive }) =>
                  `btn btn-ghost text-sm font-semibold ${isActive ? 'text-primary bg-primary-light' : ''}`
                }>
                Admin
              </NavLink>
            )}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border text-sm">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0">
                    {user.prenom?.[0]}{user.nom?.[0]}
                  </div>
                  <span className="font-semibold text-dark">{user.prenom}</span>
                </div>
                <button onClick={handleLogout} className="btn btn-ghost text-sm text-muted">Déconnexion</button>
              </div>
            ) : (
              <>
                <Link to="/admin/login" className="btn btn-ghost text-sm">Espace gérant</Link>
                <Link to="/vehicules" className="btn btn-primary text-sm">Réserver</Link>
              </>
            )}
          </div>

          {/* Burger (mobile only) */}
          <button onClick={() => setOpen(!open)}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-primary-light transition-colors tap-scale">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 7h16M4 12h16M4 17h16"/>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="container py-3 space-y-1">
            {[{ to:'/', label:'Accueil'}, ...NAV, ...(isAdmin ? [{to:'/admin/dashboard',label:'Admin'}]:[])].map(({ to, label }) => (
              <NavLink key={to} to={to} onClick={close}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-xl text-sm font-semibold ${isActive ? 'text-primary bg-primary-light' : 'text-dark'}`
                }>
                {label}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-border space-y-2">
              {user ? (
                <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm text-red-500 font-semibold rounded-xl hover:bg-red-50">
                  Déconnexion
                </button>
              ) : (
                <>
                  <Link to="/admin/login" onClick={close} className="block px-3 py-2.5 text-sm font-semibold text-muted rounded-xl hover:bg-surface">
                    Espace gérant
                  </Link>
                  <Link to="/vehicules" onClick={close} className="btn btn-primary w-full text-sm">
                    Réserver maintenant
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

const NAV = [
  { to: '/vehicules',      label: 'Véhicules' },
  { to: '/ma-reservation', label: 'Ma réservation' },
]
