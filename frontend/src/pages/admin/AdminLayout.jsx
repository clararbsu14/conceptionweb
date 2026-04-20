import { useState } from 'react'
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/admin/dashboard',    label: 'Tableau de bord', icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" /></svg> },
  { to: '/admin/flotte',       label: 'Flotte',          icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg> },
  { to: '/admin/vehicules',    label: 'Véhicules',       icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0H21M3.375 14.25h-.375a3 3 0 0 1-3-3V8.25m19.5 9.75V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v11.25" /></svg> },
  { to: '/admin/reservations', label: 'Réservations',    icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg> },
  { to: '/admin/alertes',      label: 'Alertes',         icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg> },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sideOpen, setSideOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-shell flex-1 flex min-h-0" style={{ background: '#080A12' }}>
      {/* Sidebar overlay (mobile) */}
      {sideOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSideOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        admin-sidebar fixed top-0 left-0 h-full z-40 flex flex-col overflow-hidden
        transform transition-transform duration-300
        ${sideOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:static lg:translate-x-0 lg:flex
      `} style={{
        width: 220,
        background: 'linear-gradient(180deg, #0C0E18 0%, #080A12 100%)',
      }}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                boxShadow: '0 0 20px rgba(249,115,22,0.3)',
              }}>
              <span className="text-white font-extrabold text-base">A</span>
            </div>
            <div>
              <div className="text-white font-extrabold text-[15px] tracking-tight leading-none">AUTOLOC</div>
              <div className="text-[10px] font-semibold leading-none mt-1 tracking-widest uppercase" style={{ color: '#F97316' }}>Admin</div>
            </div>
          </Link>
        </div>

        {/* Divider */}
        <div className="mx-4 mb-2" style={{ height: 1, background: 'linear-gradient(90deg, transparent, #1F2937, transparent)' }} />

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto py-2">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSideOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-[#64748B] hover:text-[#CBD5E1]'
                }`
              }
              style={({ isActive }) => ({
                padding: '10px 16px',
                background: isActive ? 'rgba(249,115,22,0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid #F97316' : '3px solid transparent',
              })}
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-4 mt-2" style={{ height: 1, background: 'linear-gradient(90deg, transparent, #1F2937, transparent)' }} />

        {/* User */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>
              <span className="text-white text-[11px] font-bold">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-semibold truncate leading-tight">{user?.prenom} {user?.nom}</p>
              <p className="text-[10px] capitalize leading-tight mt-0.5" style={{ color: '#64748B' }}>{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-[12px] font-medium py-1.5 transition-colors"
            style={{ color: '#64748B' }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#64748B'}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: '#0B0D17' }}>
        {/* Top bar mobile */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-20"
          style={{ background: 'rgba(11,13,23,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1F2937' }}>
          <button onClick={() => setSideOpen(true)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#94A3B8' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-white text-sm tracking-tight">AUTOLOC</span>
          <span className="text-primary text-[10px] font-semibold tracking-widest uppercase">Admin</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-5 sm:p-6 lg:p-8 admin-page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
