import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const PHOTOS = {
  hero:      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85',
  voiture:   'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
  electrique:'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
  premium:   'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
}

const QUICK_LINKS = [
  { label: 'Gérer ma réservation', to: '/ma-reservation' },
  { label: 'Voitures',             to: '/vehicules?type=voiture' },
  { label: 'Utilitaires',          to: '/vehicules?type=utilitaire' },
  { label: 'Électriques',          to: '/vehicules?categorie=electrique' },
  { label: 'Premium',              to: '/vehicules?categorie=premium' },
]

export default function HomePage() {
  const navigate  = useNavigate()
  const [type, setType] = useState('voiture')
  const [form, setForm] = useState({ q:'', date_depart:'', heure_depart:'', date_retour:'', heure_retour:'' })
  const today = new Date().toISOString().split('T')[0]
  const f     = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const onSearch = (e) => {
    e.preventDefault()
    const params = { type, ...form }
    Object.keys(params).forEach(k => { if (!params[k]) delete params[k] })
    navigate(`/vehicules?${new URLSearchParams(params)}`)
  }

  return (
    <main className="client-main flex-1 bg-white">

      {/* ── HERO ─────────────────────────────────── */}
      <section
        className="relative overflow-visible md:overflow-hidden h-[42vh] md:h-[50vh] lg:h-[65vh] max-h-[320px] md:max-h-none lg:max-h-[820px]"
      >
        {/* Image + dark gradient overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={PHOTOS.hero}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.75) 100%)',
            }}
          />
        </div>

        {/* Content — top-aligned with 60px top to clear the navbar */}
        <div
          className="relative h-full flex flex-col"
          style={{ paddingTop: 60, paddingBottom: 24 }}
        >
          <div className="container anim-fade-up">
            <span
              className="inline-block uppercase"
              style={{
                background: '#F97316',
                color: '#FFF',
                borderRadius: 100,
                padding: '5px 12px',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                marginBottom: 12,
              }}
            >
              Location de véhicules
            </span>
            <h1
              className="text-white"
              style={{
                fontSize: 'clamp(2rem, 8vw, 4rem)',
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              Le confort,<br /><span className="text-primary">notre atout.</span>
            </h1>
            <p
              className="max-w-sm"
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: '0.85rem',
                marginTop: 8,
                textShadow: '0 1px 4px rgba(0,0,0,0.4)',
              }}
            >
              Voitures et utilitaires — disponibles immédiatement.
            </p>
          </div>
        </div>
      </section>

      {/* ── SEARCH CARD ── */}
      {/* Overlaps hero bottom via negative margin-top (cleaner than absolute positioning) */}
      <div className="container relative -mt-6 md:-mt-40 z-10">
        <div className="ios-card anim-fade-up mx-auto md:max-w-4xl" style={{ animationDelay: '.15s', padding: 16 }}>

          {/* Tabs */}
          <div className="ios-tabs w-full mb-3 flex">
            {[['voiture','Voitures'],['utilitaire','Utilitaires']].map(([v,l]) => (
              <button key={v} onClick={() => setType(v)}
                className={`ios-tab ${type === v ? 'active' : ''}`}>
                {l}
              </button>
            ))}
          </div>

          <form onSubmit={onSearch} className="space-y-2">
            {/* Marque / modèle */}
            <div className="ios-input-wrap">
              <span className="ios-icon">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
                </svg>
              </span>
              <input className="ios-input" type="text" placeholder="Rechercher une marque ou un modèle…"
                value={form.q} onChange={f('q')} />
            </div>

            {/* Départ — date + heure on same row */}
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div className="ios-input-wrap">
                <span className="ios-icon">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
                  </svg>
                </span>
                <input className="ios-input" type="date" min={today}
                  value={form.date_depart} onChange={f('date_depart')} aria-label="Date de départ" />
              </div>
              <input className="ios-input w-[92px]" type="time"
                value={form.heure_depart} onChange={f('heure_depart')} aria-label="Heure de départ" />
            </div>

            {/* Retour — date + heure on same row */}
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div className="ios-input-wrap">
                <span className="ios-icon">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
                  </svg>
                </span>
                <input className="ios-input" type="date" min={form.date_depart||today}
                  value={form.date_retour} onChange={f('date_retour')} aria-label="Date de retour" />
              </div>
              <input className="ios-input w-[92px]" type="time"
                value={form.heure_retour} onChange={f('heure_retour')} aria-label="Heure de retour" />
            </div>

            <button type="submit" className="ios-pill ios-pill-compact w-full mt-1">
              Rechercher
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* ── QUICK LINKS (horizontal scroll pills) ─── */}
      <nav className="mt-4">
        <div className="container">
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {QUICK_LINKS.map(({ label, to }) => (
              <Link key={label} to={to} className="ios-pill-sm tap-scale shrink-0">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ── NOS VÉHICULES ─────────────────────────── */}
      <section className="section">
        <div className="container">
          <h2 className="text-2xl sm:text-3xl font-black text-dark tracking-tight mb-1">Nos véhicules</h2>
          <p className="text-muted text-sm mb-8">Choisissez parmi nos nouveaux modèles</p>

          <div className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              { slug:'voiture',    photo: PHOTOS.voiture,    label:'Voiture',    desc:'Compactes et économiques pour tous vos trajets.' },
              { slug:'electrique', photo: PHOTOS.electrique, label:'Électrique', desc:'Découvrez notre gamme de voitures électriques.' },
              { slug:'premium',    photo: PHOTOS.premium,    label:'Premium',    desc:'Les véhicules les plus prestigieux de notre flotte.' },
            ].map(c => (
              <Link key={c.slug} to={`/vehicules?categorie=${c.slug}`}
                className="ios-vcard anim-fade-up block group">
                <div className="relative h-44 overflow-hidden">
                  <img src={c.photo} alt={c.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-3 left-4 text-white font-black text-lg tracking-tight">{c.label}</span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <p className="text-muted text-sm">{c.desc}</p>
                  <span className="text-primary font-bold text-lg shrink-0 ml-3 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── POURQUOI AUTOLOC ──────────────────────── */}
      <section className="section" style={{ background: '#FFFFFF' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 56 }}>
            <h2 className="text-dark" style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}>
              Pourquoi AUTOLOC&apos;&nbsp;?
            </h2>
            <p className="text-muted" style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
              marginTop: 12,
              maxWidth: 480,
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.6,
            }}>
              Une expérience de location simple, rapide et transparente.
            </p>
          </div>

          <div className="stagger grid grid-cols-2 lg:grid-cols-4" style={{ gap: 12 }}>
            {[
              { t: 'Disponible', d: 'Véhicule similaire proposé si le vôtre est pris.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /> },
              { t: 'Localisé',   d: 'Emplacement exact de votre véhicule dans la concession.',
                icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></> },
              { t: 'Prix clairs', d: 'Tarif au jour affiché, sans frais cachés.',
                icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></> },
              { t: 'En ligne',   d: 'Réservez, modifiez ou annulez depuis votre téléphone.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /> },
            ].map(a => (
              <div
                key={a.t}
                className="anim-fade-up flex items-start gap-3 lg:flex-col lg:text-center lg:items-center"
                style={{
                  background: '#FFF',
                  border: '1px solid #F1F5F9',
                  borderRadius: 16,
                  padding: 16,
                  transition: 'transform .2s ease, border-color .2s ease, box-shadow .2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.borderColor = '#FFEDD5'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(249,115,22,0.08)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = '#F1F5F9'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div
                  className="shrink-0 inline-flex items-center justify-center lg:mx-auto"
                  style={{
                    width: 44, height: 44,
                    borderRadius: 12,
                    background: '#F97316',
                    boxShadow: '0 4px 12px rgba(249,115,22,.25)',
                  }}
                >
                  <svg className="w-[20px] h-[20px]" fill="none" stroke="white" strokeWidth={1.8} viewBox="0 0 24 24">
                    {a.icon}
                  </svg>
                </div>
                <div className="min-w-0 flex-1 lg:flex-none lg:mt-4">
                  <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', lineHeight: 1.3 }}>
                    {a.t}
                  </h3>
                  <p style={{ color: '#64748B', fontSize: '0.8rem', lineHeight: 1.5, marginTop: 4 }}>
                    {a.d}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────── */}
      <section style={{ background: '#0A0C15' }}>
        <div className="container flex flex-col md:flex-row md:items-center justify-between gap-8"
          style={{ paddingTop: 'clamp(40px, 6vw, 64px)', paddingBottom: 'clamp(40px, 6vw, 64px)' }}>
          <div>
            <p style={{ color: '#F97316', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.18em', fontWeight: 600 }}>
              Votre réservation
            </p>
            <h2 style={{ color: '#FFFFFF', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginTop: 8, letterSpacing: '-0.02em' }}>
              Gérer ma réservation
            </h2>
            <p style={{ color: '#64748B', marginTop: 8, fontSize: '0.95rem' }}>
              Voir · Modifier · Annuler · Imprimer la facture
            </p>
          </div>
          <Link to="/ma-reservation" className="ios-pill tap-scale shrink-0 w-full md:w-auto">
            Accéder à ma réservation
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

    </main>
  )
}
