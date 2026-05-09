import { useEffect, useState } from 'react'
import api from '../../api/axios'

const STATUTS = ['tous', 'declare', 'en_cours', 'resolu', 'classe']

const STATUT_STYLE = {
  declare:  { label: 'Déclaré',   bg: 'rgba(239,68,68,0.12)',  text: '#F87171', dot: '#EF4444' },
  en_cours: { label: 'En cours',  bg: 'rgba(245,158,11,0.12)', text: '#FBBF24', dot: '#F59E0B' },
  resolu:   { label: 'Résolu',    bg: 'rgba(34,197,94,0.12)',  text: '#4ADE80', dot: '#22C55E' },
  classe:   { label: 'Classé',    bg: 'rgba(100,116,139,0.12)',text: '#94A3B8', dot: '#64748B' },
}

const TYPE_LABEL = {
  rayure: 'Rayure', bosse: 'Bosse', bris_glace: 'Bris de glace', autre: 'Autre',
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api\/?$/, '')
const photoUrl = (p) => (p ? (p.startsWith('http') ? p : `${API_ORIGIN}${p}`) : null)

export default function AdminSinistresPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('tous')
  const [selected, setSelected] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [savingAmount, setSavingAmount] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [sendingQuote, setSendingQuote] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (kind, message) => {
    setToast({ kind, message })
    setTimeout(() => setToast(t => (t?.message === message ? null : t)), 4000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/sinistres', {
        params: filter !== 'tous' ? { statut: filter } : {},
      })
      setList(Array.isArray(data) ? data : [])
    } catch {
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  useEffect(() => {
    if (selected) setEditAmount(selected.montant_estime ?? '')
  }, [selected?.id])

  const updateStatus = async (statut) => {
    if (!selected) return
    setSavingStatus(true)
    try {
      const { data } = await api.patch(`/admin/sinistres/${selected.id}`, { statut })
      setList(xs => xs.map(s => s.id === selected.id ? { ...s, ...data } : s))
      setSelected(s => ({ ...s, ...data }))
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Erreur lors de la mise à jour.')
    } finally {
      setSavingStatus(false)
    }
  }

  const saveAmount = async () => {
    if (!selected) return
    const value = editAmount === '' ? null : Number(editAmount)
    if (value !== null && (isNaN(value) || value < 0)) {
      showToast('error', 'Montant invalide.')
      return
    }
    setSavingAmount(true)
    try {
      const { data } = await api.patch(`/admin/sinistres/${selected.id}`, { montant_estime: value })
      setList(xs => xs.map(s => s.id === selected.id ? { ...s, ...data } : s))
      setSelected(s => ({ ...s, ...data }))
      showToast('success', 'Montant enregistré.')
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Erreur lors de la sauvegarde.')
    } finally {
      setSavingAmount(false)
    }
  }

  const sendQuote = async () => {
    if (!selected) return
    setSendingQuote(true)
    try {
      const { data } = await api.post(`/admin/sinistres/${selected.id}/send-quote`)
      showToast('success', data?.message || `Devis envoyé à ${selected.email}`)
    } catch (err) {
      showToast('error', err.response?.data?.message || "Erreur d'envoi du devis.")
    } finally {
      setSendingQuote(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[1.75rem] font-bold text-white leading-tight">Sinistres</h1>
        <p className="text-[0.875rem] mt-1" style={{ color: '#64748B' }}>
          Suivi des sinistres déclarés sur les véhicules
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUTS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-[12px] font-semibold rounded-lg capitalize transition-all ${
              filter === s ? 'admin-btn-primary' : 'admin-btn-ghost'
            }`}
            style={{ padding: '8px 14px' }}>
            {s === 'tous' ? 'Tous' : (STATUT_STYLE[s]?.label || s.replace('_', ' '))}
          </button>
        ))}
      </div>

      <div className="flex gap-5">
        {/* Table */}
        <div className="flex-1 min-w-0 admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table min-w-[680px]">
              <thead>
                <tr>
                  <th>Réf.</th>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Véhicule</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th className="text-right">Montant estimé</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center text-sm py-12" style={{ color: '#475569' }}>Chargement…</td></tr>
                ) : list.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-sm py-12" style={{ color: '#475569' }}>Aucun sinistre</td></tr>
                ) : list.map(s => (
                  <tr key={s.id}
                    onClick={() => setSelected(s)}
                    className="cursor-pointer"
                    style={selected?.id === s.id ? { background: 'rgba(249,115,22,0.06)' } : {}}>
                    <td className="font-mono" style={{ color: '#475569' }}>#{s.id}</td>
                    <td className="text-xs" style={{ color: '#94A3B8' }}>
                      {new Date(s.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="font-medium text-white">{s.prenom} {s.nom}</td>
                    <td style={{ color: '#CBD5E1' }}>{s.marque} {s.modele}</td>
                    <td style={{ color: '#CBD5E1' }}>{TYPE_LABEL[s.type] || s.type}</td>
                    <td><SinistreBadge statut={s.statut} /></td>
                    <td className="font-bold text-right text-primary">
                      {s.montant_estime != null ? `${Number(s.montant_estime).toFixed(2)}€` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-[400px] shrink-0 hidden xl:block">
            <div className="admin-card p-5 sticky top-24 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-white">Sinistre #{selected.id}</h2>
                  <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                    Réservation #{selected.booking_id}
                  </p>
                </div>
                <button onClick={() => setSelected(null)}
                  className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                  style={{ color: '#64748B', background: 'rgba(255,255,255,0.04)' }}>×</button>
              </div>

              <SinistreBadge statut={selected.statut} size="md" />

              {/* Photo comparison */}
              <div>
                <p className="admin-section-label mb-2">Photos avant / après</p>
                <div className="grid grid-cols-2 gap-2">
                  <PhotoSlot label="Avant (départ)" url={photoUrl(selected.photo_avant)} />
                  <PhotoSlot label="Après (retour)" url={photoUrl(selected.photo_apres)} />
                </div>
              </div>

              <div className="space-y-2.5 text-[13px]">
                <Detail label="Client" value={`${selected.prenom || ''} ${selected.nom || ''}`.trim()} />
                <Detail label="Email" value={selected.email} />
                <Detail label="Tél." value={selected.telephone} />
                <div style={{ height: 1, background: '#1F2937' }} />
                <Detail label="Véhicule" value={`${selected.marque} ${selected.modele}`} />
                <Detail label="Plaque" value={selected.immatriculation} />
                <Detail label="Type" value={TYPE_LABEL[selected.type] || selected.type} />
                {selected.localisation && <Detail label="Localisation" value={selected.localisation} />}
                {selected.description && <Detail label="Description" value={selected.description} />}
              </div>

              {/* Amount input */}
              <div>
                <label className="admin-section-label block mb-2">Montant estimé (€)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    placeholder="0.00"
                    className="admin-input flex-1"
                  />
                  <button
                    type="button"
                    disabled={savingAmount}
                    onClick={saveAmount}
                    className="admin-btn-primary disabled:opacity-60"
                    style={{ padding: '0 16px' }}>
                    {savingAmount ? '…' : 'OK'}
                  </button>
                </div>
              </div>

              {/* Status select */}
              <div className="space-y-1.5 pt-2">
                <p className="admin-section-label mb-2">Changer le statut</p>
                {['declare', 'en_cours', 'resolu', 'classe'].map(s => (
                  <button key={s} disabled={savingStatus || selected.statut === s}
                    onClick={() => updateStatus(s)}
                    className={`w-full text-[12px] font-semibold py-2 rounded-lg text-left px-3 transition-all ${
                      selected.statut === s ? 'admin-btn-primary' : 'admin-btn-ghost'
                    }`}
                    style={{ padding: '8px 12px' }}>
                    {STATUT_STYLE[s]?.label || s}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={sendingQuote || !selected.email}
                onClick={sendQuote}
                className="admin-btn-primary flex items-center justify-center gap-2 w-full text-[13px] disabled:opacity-60 disabled:cursor-not-allowed">
                {sendingQuote ? 'Envoi…' : 'Envoyer le devis au client'}
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg anim-fade-up"
          style={{
            background: toast.kind === 'success' ? '#16A34A' : '#DC2626',
            color: '#FFFFFF', maxWidth: 380,
            boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
          }}>
          <span style={{ fontSize: 16 }}>{toast.kind === 'success' ? '✅' : '❌'}</span>
          <span className="text-sm font-semibold leading-snug">{toast.message}</span>
        </div>
      )}
    </div>
  )
}

function SinistreBadge({ statut, size = 'sm' }) {
  const s = STATUT_STYLE[statut] || { label: statut, bg: 'rgba(100,116,139,0.12)', text: '#94A3B8', dot: '#64748B' }
  const sz = size === 'sm' ? 'text-[11px] px-2.5 py-1' : 'text-[13px] px-3.5 py-1.5'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sz}`}
      style={{ background: s.bg, color: s.text }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  )
}

function PhotoSlot({ label, url }) {
  return (
    <div>
      <p className="text-[10px] font-semibold mb-1.5" style={{ color: '#64748B' }}>{label}</p>
      <div className="rounded-lg overflow-hidden border"
        style={{ borderColor: '#1F2937', aspectRatio: '4/3', background: '#0B0D17' }}>
        {url ? (
          <a href={url} target="_blank" rel="noreferrer">
            <img src={url} alt={label} className="w-full h-full object-cover" />
          </a>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs"
            style={{ color: '#475569' }}>
            Pas de photo
          </div>
        )}
      </div>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="shrink-0" style={{ color: '#64748B' }}>{label}</span>
      <span className="text-right" style={{ color: '#CBD5E1' }}>{value || '—'}</span>
    </div>
  )
}
