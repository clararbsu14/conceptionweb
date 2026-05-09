import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'

const MOCK = [
  { id: 1042, prenom: 'Jean', nom: 'Dupont', email: 'jean@test.fr', telephone: '0612345678', marque: 'Renault', modele: 'Clio', date_depart: '2026-04-13', date_retour: '2026-04-15', statut: 'en_cours', montant_total: 90, heure_depart: '09:00', heure_retour: '09:00' },
  { id: 1041, prenom: 'Marie', nom: 'Martin', email: 'marie@test.fr', telephone: '0698765432', marque: 'Tesla', modele: 'Model 3', date_depart: '2026-04-12', date_retour: '2026-04-14', statut: 'retard', montant_total: 170, heure_depart: '10:00', heure_retour: '10:00' },
  { id: 1040, prenom: 'Paul', nom: 'Bernard', email: 'paul@test.fr', telephone: '0677889900', marque: 'BMW', modele: 'Série 5', date_depart: '2026-04-10', date_retour: '2026-04-13', statut: 'terminee', montant_total: 360, heure_depart: '08:00', heure_retour: '08:00' },
  { id: 1039, prenom: 'Sophie', nom: 'Leroy', email: 'sophie@test.fr', telephone: '0655443322', marque: 'Citroën', modele: 'C3', date_depart: '2026-04-20', date_retour: '2026-04-22', statut: 'confirmee', montant_total: 80, heure_depart: '09:00', heure_retour: '09:00' },
]

const STATUTS = ['tous', 'confirmee', 'en_cours', 'retard', 'terminee', 'annulee']

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState(MOCK)
  const [filter, setFilter] = useState('tous')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [sendingInvoice, setSendingInvoice] = useState(null)
  const [refunding, setRefunding] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (kind, message) => {
    setToast({ kind, message })
    setTimeout(() => setToast(t => (t?.message === message ? null : t)), 4000)
  }

  const sendInvoice = async (id, email) => {
    setSendingInvoice(id)
    try {
      const { data } = await api.post(`/admin/bookings/${id}/send-invoice`)
      showToast('success', data?.message || `Facture envoyée à ${email}`)
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur d'envoi de la facture."
      showToast('error', msg)
    } finally {
      setSendingInvoice(null)
    }
  }

  const refundBooking = async (id) => {
    if (!window.confirm(`Rembourser intégralement la réservation #${id} ?`)) return
    setRefunding(id)
    try {
      await api.post('/payment/refund', { booking_id: id })
      setBookings(bs => bs.map(b => b.id === id ? { ...b, paiement_statut: 'rembourse' } : b))
      if (selected?.id === id) setSelected(s => ({ ...s, paiement_statut: 'rembourse' }))
      showToast('success', `Remboursement effectué pour la réservation #${id}`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors du remboursement.'
      showToast('error', msg)
    } finally {
      setRefunding(null)
    }
  }

  useEffect(() => {
    api.get('/bookings?admin=1')
      .then(({ data }) => setBookings(data))
      .catch(() => {})
  }, [])

  const displayed = bookings.filter(b => {
    if (filter !== 'tous' && b.statut !== filter) return false
    if (search && !`${b.prenom} ${b.nom} ${b.email} ${b.marque} ${b.modele} ${b.id}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const updateStatus = async (id, statut) => {
    setSaving(true)
    try {
      await api.patch(`/bookings/${id}`, { statut })
    } catch {}
    setBookings(bs => bs.map(b => b.id === id ? { ...b, statut } : b))
    if (selected?.id === id) setSelected(s => ({ ...s, statut }))
    setSaving(false)
  }

  const totaux = {
    all: bookings.length,
    revenus: bookings.filter(b => b.statut === 'terminee').reduce((s, b) => s + Number(b.montant_total), 0),
    retards: bookings.filter(b => b.statut === 'retard').length,
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[1.75rem] font-bold text-white leading-tight">Réservations</h1>
        <p className="text-[0.875rem] mt-1" style={{ color: '#64748B' }}>Gestion de toutes les réservations clients</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-5">
        <div className="admin-card p-5 text-center">
          <p className="font-extrabold text-white leading-none" style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>{totaux.all}</p>
          <p className="admin-section-label mt-2">Total réservations</p>
        </div>
        <div className="admin-card admin-card-orange p-5 text-center">
          <p className="font-extrabold text-primary leading-none" style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>{totaux.revenus}€</p>
          <p className="admin-section-label mt-2">Revenus encaissés</p>
        </div>
        <div className={`admin-card p-5 text-center ${totaux.retards > 0 ? 'admin-card-red' : ''}`}
          style={totaux.retards > 0 ? { borderColor: 'rgba(239,68,68,0.4)' } : {}}>
          <p className="font-extrabold leading-none" style={{ fontSize: '2rem', letterSpacing: '-0.02em', color: totaux.retards > 0 ? '#EF4444' : 'white' }}>{totaux.retards}</p>
          <p className="admin-section-label mt-2">Retards en cours</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input type="text" placeholder="Rechercher client, véhicule, n° résa..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="admin-input flex-1 min-w-48" />
        <div className="flex gap-1.5 flex-wrap">
          {STATUTS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-[12px] font-semibold px-3.5 py-2 rounded-lg capitalize transition-all ${
                filter === s ? 'admin-btn-primary' : 'admin-btn-ghost'
              }`}
              style={{ padding: '8px 14px' }}>
              {s === 'tous' ? 'Tous' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-5">
        {/* Table */}
        <div className="flex-1 min-w-0 admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table min-w-[600px]">
              <thead>
                <tr>
                  <th>Réf.</th>
                  <th>Client</th>
                  <th>Véhicule</th>
                  <th>Dates</th>
                  <th>Statut</th>
                  <th className="text-right">Montant</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {displayed.map(b => (
                  <tr key={b.id}
                    onClick={() => setSelected(b)}
                    className="cursor-pointer"
                    style={selected?.id === b.id ? { background: 'rgba(249,115,22,0.06)' } : {}}>
                    <td className="font-mono" style={{ color: '#475569' }}>#{b.id}</td>
                    <td className="font-medium text-white">{b.prenom} {b.nom}</td>
                    <td style={{ color: '#CBD5E1' }}>{b.marque} {b.modele}</td>
                    <td className="text-xs" style={{ color: '#64748B' }}>
                      {new Date(b.date_depart).toLocaleDateString('fr-FR')} → {new Date(b.date_retour).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={b.statut} />
                        <PaymentBadge status={b.paiement_statut} />
                      </div>
                    </td>
                    <td className="font-bold text-right text-primary">{b.montant_total}€</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          title={`Envoyer la facture par email${b.email ? ' à ' + b.email : ''}`}
                          disabled={sendingInvoice === b.id || !b.email}
                          onClick={() => sendInvoice(b.id, b.email)}
                          className="text-xs transition-colors hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ color: '#475569' }}>
                          {sendingInvoice === b.id ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"/></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                          )}
                        </button>
                        <Link to={`/facture/${b.id}`} target="_blank"
                          title="Voir la facture"
                          className="text-xs transition-colors hover:text-primary"
                          style={{ color: '#475569' }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 3.375V7.5" /></svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayed.length === 0 && (
              <p className="text-center text-sm py-12" style={{ color: '#475569' }}>Aucune réservation</p>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-72 shrink-0 hidden lg:block">
            <div className="admin-card p-5 sticky top-24 space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="font-bold text-white">Réservation #{selected.id}</h2>
                <button onClick={() => setSelected(null)}
                  className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                  style={{ color: '#64748B', background: 'rgba(255,255,255,0.04)' }}>×</button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={selected.statut} size="md" />
                <PaymentBadge status={selected.paiement_statut} size="md" />
              </div>

              <div className="space-y-2.5 text-[13px]">
                <Detail label="Client" value={`${selected.prenom} ${selected.nom}`} />
                <Detail label="Email" value={selected.email} />
                <Detail label="Tél." value={selected.telephone} />
                <div style={{ height: 1, background: '#1F2937' }} />
                <Detail label="Véhicule" value={`${selected.marque} ${selected.modele}`} />
                <Detail label="Départ" value={`${new Date(selected.date_depart).toLocaleDateString('fr-FR')} ${selected.heure_depart}`} />
                <Detail label="Retour" value={`${new Date(selected.date_retour).toLocaleDateString('fr-FR')} ${selected.heure_retour}`} />
                <div style={{ height: 1, background: '#1F2937' }} />
                <Detail label="Montant" value={`${selected.montant_total}€ TTC`} bold />
              </div>

              <div className="space-y-1.5 pt-2">
                <p className="admin-section-label mb-2">Changer le statut</p>
                {['confirmee', 'en_cours', 'retard', 'terminee', 'annulee'].map(s => (
                  <button key={s} disabled={saving || selected.statut === s}
                    onClick={() => updateStatus(selected.id, s)}
                    className={`w-full text-[12px] font-semibold py-2 rounded-lg text-left px-3 transition-all capitalize ${
                      selected.statut === s ? 'admin-btn-primary' : 'admin-btn-ghost'
                    }`}
                    style={{ padding: '8px 12px' }}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {selected.paiement_statut === 'paye' && (
                <button
                  type="button"
                  disabled={refunding === selected.id}
                  onClick={() => refundBooking(selected.id)}
                  className="admin-btn-ghost flex items-center justify-center gap-2 w-full text-[13px] disabled:opacity-60"
                  style={{ color: '#60A5FA', borderColor: 'rgba(59,130,246,0.3)' }}>
                  {refunding === selected.id ? 'Remboursement…' : 'Rembourser le paiement'}
                </button>
              )}

              <button
                type="button"
                disabled={sendingInvoice === selected.id || !selected.email}
                onClick={() => sendInvoice(selected.id, selected.email)}
                className="admin-btn-primary flex items-center justify-center gap-2 w-full text-[13px] disabled:opacity-60 disabled:cursor-not-allowed">
                {sendingInvoice === selected.id ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"/></svg>
                    Envoi…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                    Envoyer la facture par email
                  </>
                )}
              </button>

              <Link to={`/facture/${selected.id}`} target="_blank"
                className="admin-btn-ghost flex items-center justify-center gap-2 w-full text-[13px]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 3.375V7.5" /></svg>
                Voir la facture
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg anim-fade-up"
          style={{
            background: toast.kind === 'success' ? '#16A34A' : '#DC2626',
            color: '#FFFFFF',
            maxWidth: 380,
            boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
          }}>
          <span style={{ fontSize: 16 }}>{toast.kind === 'success' ? '✅' : '❌'}</span>
          <span className="text-sm font-semibold leading-snug">{toast.message}</span>
        </div>
      )}
    </div>
  )
}

function Detail({ label, value, bold }) {
  return (
    <div className={`flex justify-between gap-2 ${bold ? 'font-bold' : ''}`}>
      <span className="shrink-0" style={{ color: '#64748B' }}>{label}</span>
      <span className="text-right" style={{ color: bold ? 'white' : '#CBD5E1' }}>{value || '—'}</span>
    </div>
  )
}

const PAYMENT_STATUS = {
  paye:       { label: 'Payé',       bg: 'rgba(34,197,94,0.12)',  text: '#4ADE80', dot: '#22C55E' },
  en_attente: { label: 'En attente', bg: 'rgba(245,158,11,0.12)', text: '#FBBF24', dot: '#F59E0B' },
  rembourse:  { label: 'Remboursé',  bg: 'rgba(59,130,246,0.12)', text: '#60A5FA', dot: '#3B82F6' },
}

function PaymentBadge({ status, size = 'sm' }) {
  if (!status) return null
  const s = PAYMENT_STATUS[status] || { label: status, bg: 'rgba(100,116,139,0.12)', text: '#94A3B8', dot: '#64748B' }
  const sz = size === 'sm' ? 'text-[11px] px-2.5 py-1' : 'text-[13px] px-3.5 py-1.5'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sz}`}
      style={{ background: s.bg, color: s.text }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  )
}
