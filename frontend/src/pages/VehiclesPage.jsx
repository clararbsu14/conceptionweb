import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import VehicleCard from '../components/VehicleCard'

export default function VehiclesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [filters, setFilters] = useState({
    type:         searchParams.get('type') || '',
    categorie:    searchParams.get('categorie') || '',
    carburant:    '',
    transmission: '',
    prix_max:     '',
    places:       '',
  })

  useEffect(() => { fetchVehicles() }, [searchParams])

  const fetchVehicles = async () => {
    setLoading(true)
    try {
      const params = {}
      searchParams.forEach((v, k) => { params[k] = v })
      const { data } = await api.get('/vehicles', { params })
      setVehicles(Array.isArray(data) ? data : [])
    } catch {
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const displayed = vehicles.filter(v => {
    if (filters.type && v.type !== filters.type) return false
    if (filters.categorie && v.categorie !== filters.categorie) return false
    if (filters.carburant && v.carburant !== filters.carburant) return false
    if (filters.transmission && v.transmission !== filters.transmission) return false
    if (filters.prix_max && v.prix_jour > Number(filters.prix_max)) return false
    if (filters.places && v.places < Number(filters.places)) return false
    return true
  })

  const clearFilters = () => {
    setFilters({ type: '', categorie: '', carburant: '', transmission: '', prix_max: '', places: '' })
    setSearchParams({})
    setDrawerOpen(false)
  }

  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-dark">Nos véhicules</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {loading ? '…' : `${displayed.length} véhicule${displayed.length > 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Filtre bouton mobile */}
          <button onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 hover:border-primary px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 shadow-sm relative">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 10h10M11 16h2" />
            </svg>
            Filtres
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-6 items-start">

          {/* ── Sidebar desktop ── */}
          <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
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

          {/* ── Drawer mobile ── */}
          {drawerOpen && (
            <>
              <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setDrawerOpen(false)} />
              <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white rounded-t-2xl shadow-xl max-h-[85dvh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
                  <h2 className="font-black text-dark">Filtres</h2>
                  <button onClick={() => setDrawerOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    ✕
                  </button>
                </div>
                <div className="overflow-y-auto p-4 flex-1">
                  <FilterContent filters={filters} setFilters={setFilters} />
                </div>
                <div className="p-4 border-t border-gray-100 shrink-0 flex gap-3">
                  <button onClick={clearFilters}
                    className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm">
                    Effacer
                  </button>
                  <button onClick={() => setDrawerOpen(false)}
                    className="flex-1 bg-primary text-white font-black py-3 rounded-xl text-sm">
                    Voir {displayed.length} résultat{displayed.length > 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Results ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                <p className="font-black text-dark text-lg mb-1">Aucun véhicule trouvé</p>
                <p className="text-gray-400 text-sm mb-5">Modifiez vos filtres pour voir plus de résultats</p>
                <button onClick={clearFilters}
                  className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-sm">
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
        current === val ? 'border-primary bg-primary' : 'border-gray-300 group-hover:border-primary/50'
      }`}>
        {current === val && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className={`text-sm transition-colors ${current === val ? 'text-dark font-semibold' : 'text-gray-500'}`}>
        {label}
      </span>
    </label>
  )
}
