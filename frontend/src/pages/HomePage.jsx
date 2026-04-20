import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const PHOTOS = {
  hero:      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85',
  voiture:   'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
  electrique:'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
  premium:   'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
}

export default function HomePage() {
  const navigate  = useNavigate()
  const [type, setType] = useState('voiture')
  const [form, setForm] = useState({ lieu:'', date_depart:'', heure_depart:'', date_retour:'', heure_retour:'' })
  const today = new Date().toISOString().split('T')[0]
  const f     = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const onSearch = (e) => {
    e.preventDefault()
    navigate(`/vehicules?${new URLSearchParams({ type, ...form })}`)
  }

  return (
    <main className="flex-1 bg-white">

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative h-[55vh] min-h-[360px] max-h-[520px] overflow-hidden">
        <img src={PHOTOS.hero} alt="BMW" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
        <div className="relative h-full flex items-center">
          <div className="container">
            <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">Location de véhicules</p>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              Le confort,<br/><span className="text-primary">notre atout.</span>
            </h1>
            <p className="text-white/60 text-sm mt-3 max-w-xs">
              Voitures et utilitaires disponibles immédiatement.
            </p>
          </div>
        </div>
      </section>

      {/* ── RECHERCHE ────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-14 z-30">
        <div className="container py-4">

          <div className="flex gap-2 mb-4">
            {[['voiture','Voitures'],['utilitaire','Utilitaires']].map(([v,l]) => (
              <button key={v} onClick={() => setType(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  type === v ? 'bg-primary border-primary text-white' : 'border-gray-200 text-gray-500'
                }`}>{l}
              </button>
            ))}
          </div>

          <form onSubmit={onSearch}>
            {/* Mobile */}
            <div className="md:hidden space-y-2">
              <input className="input" type="text" placeholder="Ville, adresse, point d'intérêt"
                value={form.lieu} onChange={f('lieu')} />
              <div className="grid grid-cols-2 gap-2">
                <input className="input" type="date" min={today} value={form.date_depart} onChange={f('date_depart')} />
                <input className="input" type="time" value={form.heure_depart} onChange={f('heure_depart')} />
                <input className="input" type="date" min={form.date_depart||today} value={form.date_retour} onChange={f('date_retour')} />
                <input className="input" type="time" value={form.heure_retour} onChange={f('heure_retour')} />
              </div>
              <button type="submit" className="btn btn-primary w-full">Rechercher</button>
            </div>

            {/* Desktop */}
            <div className="hidden md:flex items-end gap-3">
              <div className="flex-[3]">
                <label className="label">Départ et lieu de retour</label>
                <input className="input" type="text" placeholder="Ville, adresse, point d'intérêt"
                  value={form.lieu} onChange={f('lieu')} />
              </div>
              <div className="flex-[2]">
                <label className="label">Date et heure de départ</label>
                <div className="flex gap-2">
                  <input className="input flex-1" type="date" min={today} value={form.date_depart} onChange={f('date_depart')} />
                  <input className="input w-24" type="time" value={form.heure_depart} onChange={f('heure_depart')} />
                </div>
              </div>
              <div className="flex-[2]">
                <label className="label">Date et heure de retour</label>
                <div className="flex gap-2">
                  <input className="input flex-1" type="date" min={form.date_depart||today} value={form.date_retour} onChange={f('date_retour')} />
                  <input className="input w-24" type="time" value={form.heure_retour} onChange={f('heure_retour')} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary shrink-0">Rechercher</button>
            </div>
          </form>
        </div>
      </div>

      {/* ── LIENS RAPIDES ────────────────────────── */}
      <nav className=" bg-gray-900 border-t border-gray-800 shadow-md">
        <div className=" container flex gap-2 md:gap-4 px-3 py-2 md:py-3 overflow-x-auto ">
          {[
            ['Gérer ma réservation', '/ma-reservation'],
            ['Voitures', '/vehicules?type=voiture'],
            ['Utilitaires', '/vehicules?type=utilitaire'],
            ['Électriques', '/vehicules?categorie=electrique'],
            ['Premium', '/vehicules?categorie=premium'],
          ].map(([l, t]) => (
            <Link
              key={l}
              to={t}
              className="
                shrink-0
                text-xs md:text-sm
                font-medium
                text-gray-300
                
                px-3 py-2
                md:px-5 md:py-2.5
                
                rounded-lg md:rounded-full
                border border-gray-700
                
                bg-gray-800/60
                backdrop-blur
                
                transition-all duration-200
                
                hover:bg-white hover:text-gray-900 hover:border-white
                hover:shadow-md
                
                whitespace-nowrap
              "
            >
              {l}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── CATÉGORIES ───────────────────────────── */}
      <section className="section">
        <div className="container">
          <h2 className="text-xl sm:text-2xl font-black text-dark mb-1">Nos véhicules</h2>
          <p className="text-muted text-sm mb-8">Choisissez parmi nos nouveaux modèles</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { slug:'voiture',    photo: PHOTOS.voiture,    label:'Voiture',    desc:'Compactes et économiques pour tous vos trajets.' },
              { slug:'electrique', photo: PHOTOS.electrique, label:'Électrique', desc:'Découvrez notre gamme de voitures électriques.' },
              { slug:'premium',    photo: PHOTOS.premium,    label:'Premium',    desc:'Les véhicules les plus prestigieux de notre flotte.' },
            ].map(c => (
              <Link key={c.slug} to={`/vehicules?categorie=${c.slug}`}
                className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all bg-white">
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img src={c.photo} alt={c.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-3 left-4 text-white font-black text-lg">{c.label}</span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <p className="text-muted text-sm">{c.desc}</p>
                  <span className="text-primary font-bold text-sm shrink-0 ml-3 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── POURQUOI AUTOLOC ──────────────────────── */}
      <section style={{ background: '#FFFFFF', padding: '100px 0' }}>
        <div className="container">
          {/* Header */}
          <div className="text-center" style={{ marginBottom: 64 }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}>
              Pourquoi AUTOLOC&apos;&nbsp;?
            </h2>
            <p style={{
              color: '#94A3B8',
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

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 'clamp(32px, 4vw, 48px)' }}>
            {[
              {
                t: 'Disponible',
                d: 'Véhicule similaire proposé automatiquement si le vôtre est déjà pris.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />,
              },
              {
                t: 'Localisé',
                d: 'Retrouvez l\'emplacement exact de votre véhicule dans la concession.',
                icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></>,
              },
              {
                t: 'Prix clairs',
                d: 'Tarif au jour affiché, sans frais cachés ni mauvaises surprises.',
                icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></>,
              },
              {
                t: 'En ligne',
                d: 'Réservez, modifiez ou annulez directement depuis votre téléphone.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />,
              },
            ].map(a => (
              <div key={a.t} className="group text-center" style={{ cursor: 'default' }}>
                <div
                  className="inline-flex items-center justify-center transition-all duration-250"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: '#F97316',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.08)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(249,115,22,0.3)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <svg className="w-[22px] h-[22px]" fill="none" stroke="white" strokeWidth={1.8} viewBox="0 0 24 24">
                    {a.icon}
                  </svg>
                </div>
                <h3
                  className="transition-colors duration-250"
                  style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#0F172A',
                    marginTop: 20,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#F97316'}
                  onMouseLeave={e => e.currentTarget.style.color = '#0F172A'}
                >
                  {a.t}
                </h3>
                <p style={{
                  color: '#64748B',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  maxWidth: 220,
                  margin: '10px auto 0',
                }}>
                  {a.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────── */}
      <section style={{ background: '#0A0C15' }}>
        <div className="container flex flex-col md:flex-row md:items-center justify-between gap-8"
          style={{ padding: 'clamp(40px, 6vw, 64px) clamp(24px, 4vw, 80px)' }}>
          <div>
            <p style={{
              color: '#F97316',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              letterSpacing: '0.18em',
              fontWeight: 600,
            }}>
              Votre réservation
            </p>
            <h2 style={{
              color: '#FFFFFF',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 800,
              marginTop: 8,
              letterSpacing: '-0.02em',
            }}>
              Gérer ma réservation
            </h2>
            <p style={{ color: '#64748B', marginTop: 8, fontSize: '0.95rem' }}>
              Voir · Modifier · Annuler · Imprimer la facture
            </p>
          </div>
          <Link to="/ma-reservation"
            className="inline-flex items-center justify-center gap-2.5 shrink-0 w-full md:w-auto text-white transition-all duration-200"
            style={{
              background: '#F97316',
              borderRadius: 100,
              padding: '16px 32px',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#EA6A05'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(249,115,22,0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#F97316'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
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
