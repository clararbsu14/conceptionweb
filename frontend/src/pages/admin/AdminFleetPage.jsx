import { useState, useEffect } from 'react'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'

const MOCK = [
  { id: 1, marque: 'Renault', modele: 'Clio', immatriculation: 'AB-123-CD', emplacement: 'A1', statut: 'disponible', client: null, retour_prevu: null, kilometrage: 42300 },
  { id: 2, marque: 'Peugeot', modele: '308', immatriculation: 'EF-456-GH', emplacement: 'A2', statut: 'loue', client: 'Jean Dupont', retour_prevu: '2026-04-15', kilometrage: 28100 },
  { id: 3, marque: 'Tesla', modele: 'Model 3', immatriculation: 'IJ-789-KL', emplacement: 'B1', statut: 'retard', client: 'Marie Martin', retour_prevu: '2026-04-12', kilometrage: 15600 },
  { id: 4, marque: 'BMW', modele: 'Série 5', immatriculation: 'MN-012-OP', emplacement: 'B3', statut: 'en_maintenance', client: null, retour_prevu: null, kilometrage: 88900 },
  { id: 5, marque: 'Renault', modele: 'Trafic', immatriculation: 'QR-345-ST', emplacement: 'C1', statut: 'disponible', client: null, retour_prevu: null, kilometrage: 63200 },
  { id: 6, marque: 'Citroën', modele: 'C3', immatriculation: 'UV-678-WX', emplacement: 'A3', statut: 'reserve', client: 'Paul Bernard', retour_prevu: '2026-04-16', kilometrage: 31500 },
]

const STATUTS = ['tous', 'disponible', 'loue', 'retard', 'en_maintenance', 'reserve']

const CARD_BORDER = {
  disponible:     '#22C55E', loue: '#3B82F6', retard: '#EF4444',
  en_maintenance: '#F59E0B', reserve: '#A855F7',
}

export default function AdminFleetPage() {
  const [vehicles, setVehicles] = useState(MOCK)
  const [filter, setFilter] = useState('tous')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [editData, setEditData] = useState({})

  useEffect(() => {
    api.get('/vehicles?admin=1')
      .then(({ data }) => setVehicles(data))
      .catch(() => {})
  }, [])

  const displayed = vehicles.filter(v => {
    if (filter !== 'tous' && v.statut !== filter) return false
    if (search && !`${v.marque} ${v.modele} ${v.immatriculation} ${v.emplacement}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const saveEdit = async () => {
    try {
      await api.patch(`/vehicles/${editing}`, editData)
      setVehicles(vs => vs.map(v => v.id === editing ? { ...v, ...editData } : v))
    } catch {
      setVehicles(vs => vs.map(v => v.id === editing ? { ...v, ...editData } : v))
    } finally {
      setEditing(null)
      setEditData({})
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[1.75rem] font-bold text-white leading-tight">Suivi de la flotte</h1>
        <p className="text-[0.875rem] mt-1" style={{ color: '#64748B' }}>Localisation, statut et suivi en temps réel</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input type="text" placeholder="Rechercher marque, immat, emplacement..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="admin-input flex-1 min-w-48" />
        <div className="flex gap-1.5 flex-wrap">
          {STATUTS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-[12px] font-semibold px-3.5 py-2 rounded-lg capitalize transition-all ${
                filter === s ? 'admin-btn-primary' : 'admin-btn-ghost'
              }`}
              style={filter === s ? { padding: '8px 14px' } : { padding: '8px 14px' }}>
              {s === 'tous' ? 'Tous' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Parking grid */}
      <div className="admin-card p-6">
        <p className="admin-section-label mb-5">
          Plan de la concession — {displayed.length} véhicule{displayed.length > 1 ? 's' : ''}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {displayed.map(v => {
            const bc = CARD_BORDER[v.statut] || '#A855F7'
            return (
              <div key={v.id}
                onClick={() => { setEditing(v.id); setEditData({ statut: v.statut, emplacement: v.emplacement }) }}
                className={`cursor-pointer rounded-xl p-3.5 transition-all hover:scale-[1.02] ${v.statut === 'retard' ? 'animate-pulse' : ''}`}
                style={{
                  background: '#0B0D17',
                  border: `1.5px solid ${bc}`,
                  boxShadow: `0 0 16px ${bc}15`,
                }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-bold" style={{ color: '#64748B' }}>{v.emplacement}</span>
                  <StatusBadge status={v.statut} />
                </div>
                <p className="font-bold text-[13px] text-white leading-tight">{v.marque}</p>
                <p className="text-[12px]" style={{ color: '#94A3B8' }}>{v.modele}</p>
                <p className="text-[10px] mt-1.5 font-mono" style={{ color: '#475569' }}>{v.immatriculation}</p>
                {v.client && <p className="text-[10px] mt-1 truncate" style={{ color: '#60A5FA' }}>👤 {v.client}</p>}
                {v.retour_prevu && (
                  <p className="text-[10px] mt-0.5 font-semibold" style={{ color: v.statut === 'retard' ? '#F87171' : '#64748B' }}>
                    {v.statut === 'retard' ? '⚠️ ' : '📅 '}
                    {new Date(v.retour_prevu).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Table view */}
      <div className="admin-card overflow-hidden">
        <div className="p-6 pb-0">
          <p className="admin-section-label">Liste détaillée</p>
        </div>
        <div className="overflow-x-auto p-6 pt-4">
          <table className="admin-table min-w-[640px]">
            <thead>
              <tr>
                <th>Emplacement</th>
                <th>Véhicule</th>
                <th>Immat.</th>
                <th>Statut</th>
                <th>Client</th>
                <th>Retour prévu</th>
                <th className="text-right">Km</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {displayed.map(v => (
                <tr key={v.id}>
                  <td className="font-bold text-primary">{v.emplacement}</td>
                  <td className="font-medium text-white">{v.marque} {v.modele}</td>
                  <td className="font-mono text-xs" style={{ color: '#64748B' }}>{v.immatriculation}</td>
                  <td><StatusBadge status={v.statut} /></td>
                  <td style={{ color: '#CBD5E1' }}>{v.client || '—'}</td>
                  <td className="text-xs font-medium" style={{ color: v.statut === 'retard' ? '#F87171' : '#64748B' }}>
                    {v.retour_prevu ? `${v.statut === 'retard' ? '⚠️ ' : ''}${new Date(v.retour_prevu).toLocaleDateString('fr-FR')}` : '—'}
                  </td>
                  <td className="text-right" style={{ color: '#94A3B8' }}>{v.kilometrage?.toLocaleString('fr-FR')} km</td>
                  <td className="text-right">
                    <button onClick={() => { setEditing(v.id); setEditData({ statut: v.statut, emplacement: v.emplacement }) }}
                      className="text-xs text-primary hover:underline font-semibold">
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="admin-card p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-white mb-5">Modifier le véhicule</h2>
            <div className="space-y-4">
              <div>
                <label className="admin-section-label block mb-2">Statut</label>
                <select value={editData.statut}
                  onChange={e => setEditData(d => ({ ...d, statut: e.target.value }))}
                  className="admin-select">
                  <option value="disponible">Disponible</option>
                  <option value="loue">En location</option>
                  <option value="en_maintenance">Maintenance</option>
                  <option value="retard">Retard retour</option>
                  <option value="reserve">Réservé</option>
                </select>
              </div>
              <div>
                <label className="admin-section-label block mb-2">Emplacement</label>
                <input type="text" value={editData.emplacement}
                  onChange={e => setEditData(d => ({ ...d, emplacement: e.target.value }))}
                  className="admin-input" placeholder="ex: A1, B2..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={saveEdit} className="admin-btn-primary flex-1">Enregistrer</button>
              <button onClick={() => { setEditing(null); setEditData({}) }}
                className="admin-btn-ghost flex-1">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
