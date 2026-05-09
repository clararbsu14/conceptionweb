import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import VehicleCard from '../components/VehicleCard'

export default function VehiclesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filters, setFilters] = useState({
    type:         searchParams.get('type') || '',
    categorie:    searchParams.get('categorie') || '',
    carburant:    '',
    transmission: '',
    prix_max:     '',
    places:       '',
    statut:       'disponible',
  })

  useEffect(() => { fetchVehicles(filters.statut) }, [filters.statut])

  const fetchVehicles = async (statut) => {
    setLoading(true)
    try {
      const { data } = await api.get('/vehicles', {
        params: statut && statut !== 'tous' ? { statut } : {},
      })
      setVehicles(Array.isArray(data) ? data : [])
    } catch {
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const q = searchQuery.trim().toLowerCase()
  const displayed = vehicles.filter(v => {
    // Match backend semantics: "voiture" means "anything except utilitaire"
    if (filters.type === 'voiture') {
      if (v.type === 'utilitaire') return false
    } else if (filters.type === 'utilitaire') {
      if (v.type !== 'utilitaire') return false
    } else if (filters.type) {
      if (v.type !== filters.type) return false
    }
    if (filters.categorie && v.categorie !== filters.categorie) return false
    if (filters.carburant && v.carburant !== filters.carburant) return false
    if (filters.transmission && v.transmission !== filters.transmission) return false
    if (filters.prix_max && v.prix_jour > Number(filters.prix_max)) return false
    if (filters.places && v.places < Number(filters.places)) return false
    if (filters.statut && filters.statut !== 'tous'
        && v.statut?.toLowerCase() !== filters.statut.toLowerCase()) return false
    if (q) {
      const matches =
        v.marque?.toLowerCase().includes(q) ||
        v.modele?.toLowerCase().includes(q) ||
        v.type?.toLowerCase().includes(q) ||
        v.categorie?.toLowerCase().includes(q)
      if (!matches) return false
    }
    return true
  })

  const suggestions = q
    ? Array.from(new Set(
        vehicles
          .filter(v =>
            v.marque?.toLowerCase().includes(q) ||
            v.modele?.toLowerCase().includes(q)
          )
          .map(v => `${v.marque} ${v.modele}`.trim())
      )).slice(0, 5)
    : []

  const clearFilters = () => {
    setFilters({ type: '', categorie: '', carburant: '', transmission: '', prix_max: '', places: '', statut: 'disponible' })
    setSearchQuery('')
    setSearchParams({})
    setDrawerOpen(false)
  }

  const showingAll = filters.statut === 'tous'
  const activeCount = ['type', 'categorie', 'carburant', 'transmission', 'prix_max', 'places']
    .filter(k => filters[k]).length + (showingAll ? 1 : 0) + (q ? 1 : 0)

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="container py-6 sm:py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-dark">Nos véhicules</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {loading
                ? '…'
                : q
                  ? `${displayed.length} résultat${displayed.length > 1 ? 's' : ''} pour « ${searchQuery.trim()} »`
                  : `${displayed.length} véhicule${displayed.length > 1 ? 's' : ''}${showingAll ? '' : ' disponible' + (displayed.length > 1 ? 's' : '')}`}
            </p>
          </div>

          {/* Filtre bouton mobile */}
          <button onClick={() => setDrawerOpen(true)}
            className="lg:hidden tap-scale relative inline-flex items-center gap-2"
            style={{
              background: '#FFF',
              border: '1px solid #E2E8F0',
              borderRadius: 100,
              padding: '8px 16px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#334155',
              transition: 'border-color .15s ease, color .15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.color = '#F97316' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#334155' }}
          >
            {/* Funnel icon */}
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            Filtres
            {activeCount > 0 && (
              <span
                style={{
                  position: 'absolute', top: -4, right: -4,
                  minWidth: 20, height: 20, padding: '0 6px',
                  background: '#F97316', color: '#FFF',
                  fontSize: '0.65rem', fontWeight: 700,
                  borderRadius: 100,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(249,115,22,0.4)',
                }}
              >
                {activeCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-6 items-start">

          {/* ── Sidebar desktop ── */}
          <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-dark text-sm">Filtres</h2>
                {activeCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-primary hover:underline font-semibold">
                    Effacer ({activeCount})
                  </button>
                )}
              </div>
              <FilterContent filters={filters} setFilters={setFilters} />
            </div>
          </aside>

          {/* ── Drawer mobile (iOS action sheet) ── */}
          {drawerOpen && (
            <>
              <div className="fixed inset-0 bg-black/40 z-40 lg:hidden anim-fade-in" onClick={() => setDrawerOpen(false)} />
              <div
                className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white max-h-[85dvh] flex flex-col anim-slide-up safe-bottom"
                style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>

                {/* Handle bar */}
                <div className="flex justify-center pt-2.5 pb-1 shrink-0" onClick={() => setDrawerOpen(false)}>
                  <div style={{ width: 40, height: 4, borderRadius: 99, background: '#CBD5E1' }} />
                </div>

                <div className="flex items-center justify-between px-5 pb-3 shrink-0">
                  <h2 className="font-black text-dark text-lg tracking-tight">Filtres</h2>
                  {activeCount > 0 && (
                    <button onClick={clearFilters} className="text-sm text-primary font-semibold">
                      Effacer ({activeCount})
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto px-5 pb-4 flex-1">
                  <FilterContent filters={filters} setFilters={setFilters} />
                </div>

                <div className="px-5 pt-3 pb-4 shrink-0 border-t border-gray-100">
                  <button onClick={() => setDrawerOpen(false)} className="ios-pill w-full">
                    Appliquer · {displayed.length} résultat{displayed.length > 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Results ── */}
          <div className="flex-1 min-w-0">
            {/* Search bar */}
            <div className="relative mb-4">
              <div className="ios-input-wrap">
                <span className="ios-icon">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="ios-input"
                  placeholder="Rechercher une marque ou un modèle…"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true) }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setShowSuggestions(false) }}
                    aria-label="Effacer la recherche"
                    className="shrink-0 px-3 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <ul
                  className="absolute left-0 right-0 top-full mt-2 z-20 bg-white overflow-hidden"
                  style={{
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    border: '1px solid #E2E8F0',
                  }}>
                  {suggestions.map(s => (
                    <li key={s}>
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); setSearchQuery(s); setShowSuggestions(false) }}
                        className="w-full text-left text-sm transition-colors"
                        style={{ padding: '12px 16px', color: '#0F172A' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#FFF7ED'; e.currentTarget.style.color = '#F97316' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0F172A' }}>
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.875rem',
              color: '#64748B',
              cursor: 'pointer',
              marginBottom: '16px',
            }}>
              <input
                type="checkbox"
                checked={showingAll}
                onChange={(e) =>
                  setFilters(f => ({ ...f, statut: e.target.checked ? 'tous' : 'disponible' }))
                }
                style={{ accentColor: '#F97316' }}
              />
              Afficher les véhicules indisponibles
            </label>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="bg-gray-100 h-44" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
                      <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
                      <div className="h-8 bg-gray-100 rounded-xl w-full mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayed.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20 px-6">
                <div className="text-5xl mb-4">🚗</div>
                <p className="font-black text-dark text-lg mb-1">
                  {q ? `Aucun véhicule trouvé pour « ${searchQuery.trim()} »` : 'Aucun véhicule trouvé'}
                </p>
                <p className="text-gray-400 text-sm mb-5">
                  {q ? 'Essayez une autre marque ou un autre modèle.' : 'Modifiez vos filtres pour voir plus de résultats'}
                </p>
                {q ? (
                  <button onClick={() => setSearchQuery('')}
                    className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-sm">
                    Réinitialiser la recherche
                  </button>
                ) : (
                  <button onClick={clearFilters}
                    className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-sm">
                    Effacer les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {displayed.map(v => <VehicleCard key={v.id} vehicle={v} showStatus />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterContent({ filters, setFilters }) {
  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-6">
      <Group label="Type">
        {[['', 'Tous'], ['voiture', 'Voiture'], ['utilitaire', 'Utilitaire']].map(([v, l]) => (
          <Radio key={v} name="type" val={v} label={l} current={filters.type} onChange={v => set('type', v)} />
        ))}
      </Group>

      <Group label="Catégorie">
        {[['', 'Toutes'], ['voiture', 'Standard'], ['electrique', 'Électrique'], ['premium', 'Premium']].map(([v, l]) => (
          <Radio key={v} name="cat" val={v} label={l} current={filters.categorie} onChange={v => set('categorie', v)} />
        ))}
      </Group>

      <Group label="Carburant">
        {[['', 'Tous'], ['Essence', 'Essence'], ['Diesel', 'Diesel'], ['Électrique', 'Électrique'], ['Hybride', 'Hybride']].map(([v, l]) => (
          <Radio key={v} name="carb" val={v} label={l} current={filters.carburant} onChange={v => set('carburant', v)} />
        ))}
      </Group>

      <Group label="Transmission">
        {[['', 'Toutes'], ['Manuelle', 'Manuelle'], ['Automatique', 'Automatique']].map(([v, l]) => (
          <Radio key={v} name="trans" val={v} label={l} current={filters.transmission} onChange={v => set('transmission', v)} />
        ))}
      </Group>

      <Group label="Prix max / jour">
        <div className="space-y-1.5">
          <input type="range" min="20" max="300" step="5"
            value={filters.prix_max || 300}
            onChange={e => set('prix_max', e.target.value === '300' ? '' : e.target.value)}
            className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-gray-400">
            <span>20€</span>
            <span className="font-bold text-primary">
              {filters.prix_max ? `≤ ${filters.prix_max}€` : 'Tous'}
            </span>
            <span>300€</span>
          </div>
        </div>
      </Group>

      <Group label="Places min.">
        {[['', 'Tous'], ['2', '2+'], ['5', '5+'], ['7', '7+']].map(([v, l]) => (
          <Radio key={v} name="places" val={v} label={l} current={filters.places} onChange={v => set('places', v)} />
        ))}
      </Group>
    </div>
  )
}

function Group({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Radio({ name, val, label, current, onChange }) {
  const checked = current === val
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="radio"
        name={name}
        value={val}
        checked={checked}
        onChange={() => onChange(val)}
        className="sr-only"
      />
      <span aria-hidden="true" className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
        checked ? 'border-primary bg-primary' : 'border-gray-300 group-hover:border-primary/50'
      }`}>
        {checked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </span>
      <span className={`text-sm transition-colors ${checked ? 'text-dark font-semibold' : 'text-gray-500'}`}>
        {label}
      </span>
    </label>
  )
}
