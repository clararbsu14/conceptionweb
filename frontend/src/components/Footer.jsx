import { Link } from 'react-router-dom'
import logo from '../img/Logo.png'

const SOCIAL = [
  {
    label: 'Instagram',
    d: 'M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm5.25-.88a.88.88 0 110 1.76.88.88 0 010-1.76z',
  },
  {
    label: 'Facebook',
    d: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z',
  },
  {
    label: 'LinkedIn',
    d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z',
  },
]

export default function Footer() {
  return (
    <footer style={{ background: '#060810', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="container" style={{ paddingTop: 80, paddingBottom: 40 }}>

        {/* ── Brand hero ─────────────────────────── */}
        <div className="text-center" style={{ marginBottom: 64 }}>
          <img
            src={logo}
            alt="AUTOLOC' — Location de véhicules"
            style={{ height: 56, display: 'block', margin: '0 auto' }}
          />
          <p style={{
            color: '#F97316',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            fontSize: '0.65rem',
            fontWeight: 600,
            marginTop: 10,
          }}>
            Le confort notre atout
          </p>
          <p style={{
            color: '#94A3B8',
            fontSize: '0.875rem',
            lineHeight: 1.7,
            maxWidth: 400,
            margin: '16px auto 0',
          }}>
            Location de voitures particulières et utilitaires — disponibles immédiatement à Lille.
          </p>
        </div>

        {/* ── Nav columns ────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{ gap: 'clamp(32px, 5vw, 56px)', marginBottom: 48 }}>

          {/* Véhicules */}
          <NavCol title="Véhicules" links={[
            ['Voitures', '/vehicules?type=voiture'],
            ['Utilitaires', '/vehicules?type=utilitaire'],
            ['Électriques', '/vehicules?categorie=electrique'],
            ['Premium', '/vehicules?categorie=premium'],
          ]} />

          {/* Services */}
          <NavCol title="Services" links={[
            ['Gérer ma réservation', '/ma-reservation'],
            ['Modifier / Annuler', '/ma-reservation'],
            ['Imprimer une facture', '/ma-reservation'],
            ['Espace gérant', '/admin/login'],
          ]} />

          {/* Contact */}
          <div className="text-center sm:text-left">
            <p style={{
              textTransform: 'uppercase',
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.3)',
              fontWeight: 600,
              marginBottom: 20,
            }}>
              Contact
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ContactRow
                icon={<><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></>}
              >
                41 Boulevard Vauban,<br />59800 Lille
              </ContactRow>
              <ContactRow
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />}
                href="tel:+33123456789"
              >
                01 23 45 67 89
              </ContactRow>
              <ContactRow
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />}
                href="mailto:contact@autoloc.fr"
              >
                contact@autoloc.fr
              </ContactRow>
              <ContactRow
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />}
              >
                Lun–Sam · 8h–19h
              </ContactRow>
            </div>
          </div>

          {/* Suivez-nous */}
          <div className="text-center sm:text-left">
            <p style={{
              textTransform: 'uppercase',
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.3)',
              fontWeight: 600,
              marginBottom: 20,
            }}>
              Suivez-nous
            </p>
            <div className="flex gap-3 justify-center sm:justify-start">
              {SOCIAL.map(s => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#F97316'
                    e.currentTarget.style.transform = 'scale(1.1)'
                    e.currentTarget.querySelector('svg').style.fill = '#F97316'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.querySelector('svg').style.fill = 'white'
                  }}
                >
                  <svg style={{ width: 16, height: 16, fill: 'white', transition: 'fill 0.2s ease' }} viewBox="0 0 24 24">
                    <path d={s.d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Divider ────────────────────────────── */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 0 32px' }} />

        {/* ── Bottom bar ─────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center gap-4"
          style={{ justifyContent: 'space-between' }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>
            &copy; {new Date().getFullYear()} AUTOLOC&apos; — Tous droits réservés
          </p>
          <img
            src={logo}
            alt=""
            className="hidden sm:block"
            style={{ height: 24, opacity: 0.4 }}
          />
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>
            Fait avec <span style={{ color: '#F97316' }}>&hearts;</span> pour votre confort
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ── Sub-components ──────────────────────────── */

function NavCol({ title, links }) {
  return (
    <div className="text-center sm:text-left">
      <p style={{
        textTransform: 'uppercase',
        fontSize: '0.65rem',
        letterSpacing: '0.15em',
        color: 'rgba(255,255,255,0.3)',
        fontWeight: 600,
        marginBottom: 20,
      }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {links.map(([label, to]) => (
          <Link
            key={label}
            to={to}
            className="transition-all duration-200"
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '0.875rem',
              lineHeight: 2.2,
              textDecoration: 'none',
              display: 'inline-block',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#F97316'
              e.currentTarget.style.transform = 'translateX(3px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function ContactRow({ icon, children, href }) {
  const content = (
    <>
      <svg
        className="shrink-0"
        style={{ width: 15, height: 15, marginTop: 2 }}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={1.6}
        viewBox="0 0 24 24"
      >
        {icon}
      </svg>
      <span>{children}</span>
    </>
  )

  const sharedStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    color: 'rgba(255,255,255,0.55)',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    justifyContent: undefined,
  }

  const sharedClass = 'justify-center sm:justify-start'

  if (href) {
    return (
      <a
        href={href}
        className={sharedClass}
        style={sharedStyle}
        onMouseEnter={e => e.currentTarget.style.color = '#F97316'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
      >
        {content}
      </a>
    )
  }

  return (
    <div className={sharedClass} style={{ ...sharedStyle, cursor: 'default' }}>
      {content}
    </div>
  )
}
