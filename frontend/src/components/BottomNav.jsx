import { NavLink } from 'react-router-dom'

const ICON_PROPS = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const TABS = [
  {
    to: '/',
    label: 'Accueil',
    end: true,
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M3 12 12 3l9 9" />
        <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
      </svg>
    ),
  },
  {
    to: '/vehicules',
    label: 'Véhicules',
    icon: (
      // Lucide-style Car icon (single coherent shape)
      <svg {...ICON_PROPS}>
        <path d="M5 17h14" />
        <path d="M3 17v-5l2-5h14l2 5v5" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
        <path d="M7 12h10" />
      </svg>
    ),
  },
  {
    to: '/ma-reservation',
    label: 'Réservation',
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="4" y="5" width="16" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M4 11h16" />
        <path d="M8 15h4" />
      </svg>
    ),
  },
  {
    to: '/admin/login',
    label: 'Compte',
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#F1F5F9] safe-bottom"
      style={{ boxShadow: '0 -2px 16px rgba(15,23,42,0.04)' }}
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="flex items-stretch justify-around" style={{ height: 64 }}>
        {TABS.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex-1 flex flex-col items-center justify-center tap-scale"
            style={({ isActive }) => ({
              color: isActive ? '#F97316' : '#94A3B8',
              transition: 'color 0.2s ease',
            })}
          >
            {({ isActive }) => (
              <>
                <span
                  className="inline-flex items-center justify-center"
                  style={{
                    width: 24,
                    height: 24,
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  {icon}
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 500, letterSpacing: '-0.01em', marginTop: 4 }}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
