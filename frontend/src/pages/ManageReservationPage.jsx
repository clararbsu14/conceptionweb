import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import StatusBadge from '../components/StatusBadge'

export default function ManageReservationPage() {
  const [searchForm, setSearchForm] = useState({ email: '', reference: '' })
  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})

  const search = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setReservation(null)
    setActionMsg('')
    try {
      const { data } = await api.get('/bookings/lookup', { params: searchForm })
      setReservation(data)
      setEditForm({
        date_depart: data.date_depart?.split('T')[0] || '',
        heure_depart: data.heure_depart || '09:00',
        date_retour: data.date_retour?.split('T')[0] || '',
        heure_retour: data.heure_retour || '09:00',
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Aucune réservation trouvée avec ces informations.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return
    setCancelling(true)
    try {
      await api.patch(`/bookings/${reservation.id}/cancel`)
      setReservation(prev => ({ ...prev, statut: 'annule' }))
      setActionMsg('Votre réservation a été annulée avec succès.')
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible d\'annuler cette réservation.')
    } finally {
      setCancelling(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.patch(`/bookings/${reservation.id}`, editForm)
      setReservation(prev => ({ ...prev, ...editForm }))
      setEditMode(false)
      setActionMsg('Votre réservation a été modifiée avec succès.')
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de modifier cette réservation.')
    }
  }

  const canCancel = reservation && !['annule', 'termine'].includes(reservation.statut)
  const canEdit = reservation && ['confirme', 'reserve'].includes(reservation.statut)

  return (
    <div className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
      <h1 className="text-2xl font-black text-dark mb-1">Ma réservation</h1>
      <p className="text-gray-500 text-sm mb-8">Gérez votre réservation : voir, modifier, annuler, imprimer votre facture</p>

      {/* Search */}
      {!reservation && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-dark mb-4">Retrouver ma réservation</h2>
          <form onSubmit={search} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Adresse email</label>
              <input type="email" required placeholder="votremail@exemple.fr"
                value={searchForm.email}
                onChange={e => setSearchForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Numéro de réservation</label>
              <input type="text" required placeholder="ex: 1042"
                value={searchForm.reference}
                onChange={e => setSearchForm(f => ({ ...f, reference: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-bold py-3 rounded-lg text-sm">
              {loading ? 'Recherche...' : 'Rechercher ma réservation'}
            </button>
          </form>
        </div>
      )}

      {/* Reservation details */}
      {reservation && (
        <div className="space-y-4">
          {actionMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              {actionMsg}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div>
                <h2 className="font-black text-dark text-lg">
                  {reservation.marque} {reservation.modele}
                </h2>
                <p className="text-gray-500 text-sm capitalize">{reservation.categorie}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={reservation.statut} size="md" />
                <span className="text-xs text-gray-400">#{reservation.id}</span>
              </div>
            </div>

            {!editMode ? (
              <div className="space-y-2 text-sm">
                <InfoRow label="Client" value={`${reservation.prenom} ${reservation.nom}`} />
                <InfoRow label="Email" value={reservation.email} />
                <InfoRow label="Téléphone" value={reservation.telephone} />
                <InfoRow label="Départ" value={formatDateTime(reservation.date_depart, reservation.heure_depart)} />
                <InfoRow label="Retour" value={formatDateTime(reservation.date_retour, reservation.heure_retour)} />
                <InfoRow label="Durée" value={calcDuree(reservation.date_depart, reservation.date_retour)} />
                <InfoRow label="Montant total" value={`${reservation.montant_total}€ TTC`} bold />
              </div>
            ) : (
              <form onSubmit={handleEdit} className="space-y-4">
                <h3 className="font-semibold text-dark text-sm">Modifier les dates</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date départ</label>
                    <input type="date" value={editForm.date_depart}
                      onChange={e => setEditForm(f => ({ ...f, date_depart: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Heure départ</label>
                    <input type="time" value={editForm.heure_depart}
                      onChange={e => setEditForm(f => ({ ...f, heure_depart: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date retour</label>
                    <input type="date" value={editForm.date_retour}
                      onChange={e => setEditForm(f => ({ ...f, date_retour: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Heure retour</label>
                    <input type="time" value={editForm.heure_retour}
                      onChange={e => setEditForm(f => ({ ...f, heure_retour: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-primary text-white font-bold py-2.5 rounded-lg text-sm">
                    Enregistrer
                  </button>
                  <button type="button" onClick={() => setEditMode(false)}
                    className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg text-sm">
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Actions */}
          {!editMode && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {canEdit && (
                <button onClick={() => setEditMode(true)}
                  className="flex items-center justify-center gap-2 border border-gray-200 hover:border-primary text-gray-700 hover:text-primary font-semibold py-3 rounded-xl text-sm">
                  ✏️ Modifier
                </button>
              )}
              {canCancel && (
                <button onClick={handleCancel} disabled={cancelling}
                  className="flex items-center justify-center gap-2 border border-red-200 hover:bg-red-50 text-red-600 font-semibold py-3 rounded-xl text-sm disabled:opacity-60">
                  🚫 {cancelling ? 'Annulation...' : 'Annuler'}
                </button>
              )}
              <Link to={`/facture/${reservation.id}`}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-sm">
                🖨️ Imprimer la facture
              </Link>
            </div>
          )}

          <button onClick={() => { setReservation(null); setError(''); setActionMsg('') }}
            className="w-full text-sm text-gray-400 hover:text-gray-600 font-medium py-2">
            Rechercher une autre réservation
          </button>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value, bold }) {
  return (
    <div className={`flex justify-between gap-4 py-1 ${bold ? 'font-bold text-dark border-t border-gray-100 mt-2 pt-3' : 'text-gray-600'}`}>
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-right">{value || '—'}</span>
    </div>
  )
}

function formatDateTime(date, heure) {
  if (!date) return '—'
  const d = new Date(date)
  return `${d.toLocaleDateString('fr-FR')}${heure ? ' à ' + heure : ''}`
}

function calcDuree(d1, d2) {
  if (!d1 || !d2) return '—'
  const diff = Math.ceil((new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24))
  return diff > 0 ? `${diff} jour${diff > 1 ? 's' : ''}` : '—'
}
