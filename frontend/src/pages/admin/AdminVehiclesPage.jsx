import { useState, useEffect } from 'react'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'

const EMPTY = {
  marque: '', modele: '', immatriculation: '', annee: '',
  categorie: 'voiture', type: 'voiture', carburant: 'Essence',
  transmission: 'Manuelle', places: 5, prix_jour: '',
  emplacement: '', statut: 'disponible', image_url: '', kilometrage: 0,
}

const MOCK = [
  { id: 1, marque: 'Renault', modele: 'Clio', immatriculation: 'AB-123-CD', annee: 2022, categorie: 'voiture', type: 'voiture', carburant: 'Essence', transmission: 'Manuelle', places: 5, prix_jour: 45, emplacement: 'A1', statut: 'disponible', kilometrage: 42300 },
  { id: 2, marque: 'Tesla', modele: 'Model 3', immatriculation: 'IJ-789-KL', annee: 2023, categorie: 'electrique', type: 'voiture', carburant: 'Électrique', transmission: 'Automatique', places: 5, prix_jour: 85, emplacement: 'B1', statut: 'loue', kilometrage: 15600 },
  { id: 3, marque: 'Renault', modele: 'Trafic', immatriculation: 'QR-345-ST', annee: 2021, categorie: 'utilitaire', type: 'utilitaire', carburant: 'Diesel', transmission: 'Manuelle', places: 3, prix_jour: 70, emplacement: 'C1', statut: 'disponible', kilometrage: 63200 },
]

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState(MOCK)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    api.get('/vehicles?admin=1')
      .then(({ data }) => setVehicles(data))
      .catch(() => {})
  }, [])

  const displayed = vehicles.filter(v =>
    !search || `${v.marque} ${v.modele} ${v.immatriculation}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) {
        await api.put(`/vehicles/${editId}`, form)
        setVehicles(vs => vs.map(v => v.id === editId ? { ...v, ...form, id: editId } : v))
      } else {
        const { data } = await api.post('/vehicles', form)
        setVehicles(vs => [...vs, data])
      }
      reset()
    } catch {
      if (editId) {
        setVehicles(vs => vs.map(v => v.id === editId ? { ...v, ...form, id: editId } : v))
      } else {
        setVehicles(vs => [...vs, { ...form, id: Date.now() }])
      }
      reset()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try { await api.delete(`/vehicles/${id}`) } catch {}
    setVehicles(vs => vs.filter(v => v.id !== id))
    setDeleteConfirm(null)
  }

  const startEdit = (v) => {
    setForm({ ...v })
    setEditId(v.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => {
    setForm(EMPTY)
    setEditId(null)
    setShowForm(false)
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-[1.75rem] font-bold text-white leading-tight">Gestion des véhicules</h1>
          <p className="text-[0.875rem] mt-1" style={{ color: '#64748B' }}>{vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''} dans la flotte</p>
        </div>
        <button onClick={() => { reset(); setShowForm(true) }} className="admin-btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Ajouter un véhicule
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="admin-card p-6" style={{ borderColor: '#F97316' }}>
          <p className="text-white font-bold text-lg mb-5">{editId ? 'Modifier le véhicule' : 'Nouveau véhicule'}</p>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <FField label="Marque *" value={form.marque} onChange={set('marque')} required />
              <FField label="Modèle *" value={form.modele} onChange={set('modele')} required />
              <FField label="Immatriculation *" value={form.immatriculation} onChange={set('immatriculation')} required />
              <FField label="Année" type="number" value={form.annee} onChange={set('annee')} min="2000" max="2030" />
              <FSelect label="Type" value={form.type} onChange={set('type')}>
                <option value="voiture">Voiture</option>
                <option value="utilitaire">Utilitaire</option>
              </FSelect>
              <FSelect label="Catégorie" value={form.categorie} onChange={set('categorie')}>
                <option value="voiture">Standard</option>
                <option value="electrique">Électrique</option>
                <option value="premium">Premium</option>
                <option value="utilitaire">Utilitaire</option>
              </FSelect>
              <FSelect label="Carburant" value={form.carburant} onChange={set('carburant')}>
                <option>Essence</option>
                <option>Diesel</option>
                <option>Électrique</option>
                <option>Hybride</option>
              </FSelect>
              <FSelect label="Transmission" value={form.transmission} onChange={set('transmission')}>
                <option>Manuelle</option>
                <option>Automatique</option>
              </FSelect>
              <FField label="Nb places" type="number" value={form.places} onChange={set('places')} min="1" max="9" />
              <FField label="Prix/jour (€) *" type="number" value={form.prix_jour} onChange={set('prix_jour')} required min="1" />
              <FField label="Emplacement" value={form.emplacement} onChange={set('emplacement')} placeholder="ex: A1" />
              <FField label="Kilométrage" type="number" value={form.kilometrage} onChange={set('kilometrage')} min="0" />
              <FSelect label="Statut" value={form.statut} onChange={set('statut')}>
                <option value="disponible">Disponible</option>
                <option value="loue">En location</option>
                <option value="maintenance">Maintenance</option>
                <option value="reserve">Réservé</option>
              </FSelect>
              <div className="col-span-2 sm:col-span-3">
                <FField label="URL de la photo" value={form.image_url} onChange={set('image_url')} placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-3 pt-3">
              <button type="submit" disabled={saving} className="admin-btn-primary">
                {saving ? 'Enregistrement...' : editId ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button type="button" onClick={reset} className="admin-btn-ghost">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <input type="text" placeholder="Rechercher marque, modèle, immatriculation..."
        value={search} onChange={e => setSearch(e.target.value)}
        className="admin-input max-w-md" />

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[700px]">
            <thead>
              <tr>
                <th>Véhicule</th>
                <th>Immat.</th>
                <th>Catégorie</th>
                <th>Prix/j</th>
                <th>Empl.</th>
                <th>Km</th>
                <th>Statut</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {displayed.map(v => (
                <tr key={v.id}>
                  <td className="font-medium text-white">{v.marque} {v.modele} <span style={{ color: '#475569' }}>({v.annee})</span></td>
                  <td className="font-mono text-xs" style={{ color: '#64748B' }}>{v.immatriculation}</td>
                  <td className="capitalize" style={{ color: '#CBD5E1' }}>{v.categorie}</td>
                  <td className="font-bold text-primary">{v.prix_jour}€</td>
                  <td className="font-bold" style={{ color: '#94A3B8' }}>{v.emplacement || '—'}</td>
                  <td style={{ color: '#64748B' }}>{v.kilometrage?.toLocaleString('fr-FR')}</td>
                  <td><StatusBadge status={v.statut} /></td>
                  <td>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => startEdit(v)} className="text-xs text-primary hover:underline font-semibold">Modifier</button>
                      <button onClick={() => setDeleteConfirm(v.id)} className="text-xs font-semibold hover:underline" style={{ color: '#F87171' }}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {displayed.length === 0 && (
            <p className="text-center text-sm py-12" style={{ color: '#475569' }}>Aucun véhicule trouvé</p>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="admin-card p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
              <svg className="w-7 h-7" fill="none" stroke="#EF4444" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
            <h2 className="font-bold text-white text-lg mb-2">Supprimer ce véhicule ?</h2>
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 font-bold py-2.5 rounded-xl text-sm text-white transition-all"
                style={{ background: '#EF4444', boxShadow: '0 2px 12px rgba(239,68,68,0.25)' }}>
                Supprimer
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="admin-btn-ghost flex-1">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FField({ label, ...props }) {
  return (
    <div>
      <label className="admin-section-label block mb-2">{label}</label>
      <input {...props} className="admin-input" />
    </div>
  )
}

function FSelect({ label, children, ...props }) {
  return (
    <div>
      <label className="admin-section-label block mb-2">{label}</label>
      <select {...props} className="admin-select">{children}</select>
    </div>
  )
}
