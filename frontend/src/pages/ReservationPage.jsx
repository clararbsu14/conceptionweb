import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import PaymentForm from '../components/PaymentForm'

const MOCK_VEHICLES = {
  1: { id: 1, marque: 'Renault', modele: 'Clio', categorie: 'voiture', prix_jour: 45, places: 5, transmission: 'Manuelle', carburant: 'Essence', statut: 'disponible' },
  2: { id: 2, marque: 'Peugeot', modele: '308', categorie: 'voiture', prix_jour: 55, places: 5, transmission: 'Automatique', carburant: 'Diesel', statut: 'disponible' },
}

export default function ReservationPage() {
  const { vehicleId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pendingBooking, setPendingBooking] = useState(null)

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    date_depart: searchParams.get('date_depart') || today,
    heure_depart: searchParams.get('heure_depart') || '09:00',
    date_retour: searchParams.get('date_retour') || '',
    heure_retour: searchParams.get('heure_retour') || '09:00',
    options: [],
    commentaire: '',
  })

  useEffect(() => {
    fetchVehicle()
  }, [vehicleId])

  const fetchVehicle = async () => {
    try {
      const { data } = await api.get(`/vehicles/${vehicleId}`)
      setVehicle(data)
    } catch {
      setVehicle(MOCK_VEHICLES[vehicleId] || MOCK_VEHICLES[1])
    } finally {
      setLoading(false)
    }
  }

  const nbJours = () => {
    if (!form.date_depart || !form.date_retour) return 0
    const d1 = new Date(form.date_depart)
    const d2 = new Date(form.date_retour)
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  const totalPrice = () => {
    if (!vehicle) return 0
    let price = vehicle.prix_jour * nbJours()
    if (form.options.includes('gps')) price += 5 * nbJours()
    if (form.options.includes('assurance_plus')) price += 15 * nbJours()
    if (form.options.includes('siege_enfant')) price += 8 * nbJours()
    return price
  }

  const toggleOption = (opt) => {
    setForm(f => ({
      ...f,
      options: f.options.includes(opt) ? f.options.filter(o => o !== opt) : [...f.options, opt]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.date_retour || nbJours() <= 0) {
      setError('La date de retour doit être après la date de départ.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/bookings', {
        vehicule_id: vehicleId,
        ...form,
        montant_total: totalPrice(),
      })
      setPendingBooking({
        id: data.id || data.reservation_id,
        amount: data.montant_total ?? totalPrice(),
        raw: data,
      })
    } catch (err) {
      const msg = err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentSuccess = () => {
    navigate(`/confirmation/${pendingBooking.id}`, {
      state: { reservation: pendingBooking.raw, vehicle, paid: true },
    })
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const jours = nbJours()

  return (
    <div className="flex-1 container py-8 pb-[140px] lg:pb-8">
      <h1 className="text-2xl font-black text-dark mb-2">Finaliser votre réservation</h1>
      <p className="text-gray-500 text-sm mb-6">Remplissez vos informations pour confirmer la réservation</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {pendingBooking ? (
          <section className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <h2 className="font-bold text-dark mb-1 flex items-center gap-2">
                <span className="bg-primary text-white rounded-full flex items-center justify-center" style={{ width: 28, height: 28, fontSize: '0.8rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}>✓</span>
                Réservation #{pendingBooking.id} créée
              </h2>
              <p className="text-sm text-gray-500">
                Finalisez le paiement pour confirmer votre réservation. Vous recevrez votre facture par email.
              </p>
            </div>
            <PaymentForm
              bookingId={pendingBooking.id}
              amount={pendingBooking.amount}
              onSuccess={handlePaymentSuccess}
            />
          </section>
        ) : (
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Dates */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-dark mb-4 flex items-center gap-2" style={{ fontSize: '1rem', fontWeight: 700 }}>
              <span className="bg-primary text-white rounded-full flex items-center justify-center" style={{ width: 28, height: 28, fontSize: '0.8rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}>1</span>
              Dates de location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Date & heure de départ *</label>
                <div className="flex gap-2">
                  <input type="date" required min={today}
                    value={form.date_depart}
                    onChange={e => setForm(f => ({ ...f, date_depart: e.target.value }))}
                    className="flex-1 text-sm focus:border-primary outline-none transition-colors"
                    style={{ border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '14px 16px' }} />
                  <input type="time"
                    value={form.heure_depart}
                    onChange={e => setForm(f => ({ ...f, heure_depart: e.target.value }))}
                    className="w-24 text-sm focus:border-primary outline-none transition-colors"
                    style={{ border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '14px 12px' }} />
                </div>
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Date & heure de retour *</label>
                <div className="flex gap-2">
                  <input type="date" required min={form.date_depart || today}
                    value={form.date_retour}
                    onChange={e => setForm(f => ({ ...f, date_retour: e.target.value }))}
                    className="flex-1 text-sm focus:border-primary outline-none transition-colors"
                    style={{ border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '14px 16px' }} />
                  <input type="time"
                    value={form.heure_retour}
                    onChange={e => setForm(f => ({ ...f, heure_retour: e.target.value }))}
                    className="w-24 text-sm focus:border-primary outline-none transition-colors"
                    style={{ border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '14px 12px' }} />
                </div>
              </div>
            </div>
            {jours > 0 && (
              <p className="mt-2 text-sm text-primary font-semibold">
                Durée : {jours} jour{jours > 1 ? 's' : ''}
              </p>
            )}
          </section>

          {/* Infos client */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-dark mb-4 flex items-center gap-2" style={{ fontSize: '1rem', fontWeight: 700 }}>
              <span className="bg-primary text-white rounded-full flex items-center justify-center" style={{ width: 28, height: 28, fontSize: '0.8rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}>2</span>
              Vos informations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Prénom *" type="text" value={form.prenom} required
                onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
              <Field label="Nom *" type="text" value={form.nom} required
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
              <Field label="Email *" type="email" value={form.email} required
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <Field label="Téléphone *" type="tel" value={form.telephone} required
                onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
            </div>
          </section>

          {/* Options */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-dark mb-4 flex items-center gap-2" style={{ fontSize: '1rem', fontWeight: 700 }}>
              <span className="bg-primary text-white rounded-full flex items-center justify-center" style={{ width: 28, height: 28, fontSize: '0.8rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}>3</span>
              Options supplémentaires
            </h2>
            <div className="space-y-3">
              {OPTIONS.map((opt) => {
                const checked = form.options.includes(opt.id)
                return (
                  <label
                    key={opt.id}
                    className="tap-scale flex items-center justify-between cursor-pointer transition-all"
                    style={{
                      padding: '14px 16px',
                      border: `1.5px solid ${checked ? '#F97316' : '#E2E8F0'}`,
                      borderRadius: 12,
                      background: checked ? '#FFF7ED' : '#FFF',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        aria-hidden="true"
                        className="shrink-0 inline-flex items-center justify-center"
                        style={{
                          width: 22, height: 22,
                          borderRadius: 6,
                          border: `1.5px solid ${checked ? '#F97316' : '#CBD5E1'}`,
                          background: checked ? '#F97316' : '#FFF',
                          transition: 'all .15s ease',
                        }}
                      >
                        {checked && (
                          <svg width="14" height="14" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOption(opt.id)}
                        className="sr-only"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-dark">{opt.label}</p>
                        <p className="text-xs" style={{ color: '#94A3B8' }}>{opt.desc}</p>
                      </div>
                    </div>
                    <span className="shrink-0 ml-3 text-sm font-bold text-primary">+{opt.prix}€/j</span>
                  </label>
                )
              })}
            </div>
          </section>

          {/* Commentaire */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-dark mb-3 flex items-center gap-2" style={{ fontSize: '1rem', fontWeight: 700 }}>
              <span className="bg-primary text-white rounded-full flex items-center justify-center" style={{ width: 28, height: 28, fontSize: '0.8rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}>4</span>
              Remarques (facultatif)
            </h2>
            <textarea rows={3} placeholder="Informations complémentaires pour votre réservation…"
              value={form.commentaire}
              onChange={e => setForm(f => ({ ...f, commentaire: e.target.value }))}
              className="w-full text-sm resize-none focus:border-primary outline-none transition-colors"
              style={{ border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '14px 16px' }} />
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Desktop inline CTA */}
          <button type="submit" disabled={submitting}
            className="hidden lg:block w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm shadow-sm transition-all">
            {submitting ? 'Création en cours…' : 'Continuer vers le paiement'}
          </button>

          {/* Mobile fixed CTA — sits above the 64px bottom nav */}
          <button type="submit" disabled={submitting}
            className="lg:hidden fixed left-0 right-0 z-30 bg-primary disabled:opacity-60 text-white font-bold text-[0.95rem] flex items-center justify-center transition-all"
            style={{ bottom: 64, height: 56, borderRadius: 0, boxShadow: '0 -4px 16px rgba(0,0,0,0.08)' }}>
            {submitting ? 'Création en cours…' : 'Continuer vers le paiement'}
          </button>
        </form>
        )}

        {/* Summary */}
        <aside className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <h2 className="font-bold text-dark mb-4">Récapitulatif</h2>
            {vehicle && (
              <>
                <div className="bg-primary-xlight rounded-lg p-4 mb-4">
                  <p className="font-black text-dark text-lg">{vehicle.marque} {vehicle.modele}</p>
                  <p className="text-gray-500 text-sm capitalize">{vehicle.categorie}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {vehicle.places && <Tag>{vehicle.places} places</Tag>}
                    {vehicle.transmission && <Tag>{vehicle.transmission}</Tag>}
                    {vehicle.carburant && <Tag>{vehicle.carburant}</Tag>}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <Row label="Prix / jour" value={`${vehicle.prix_jour}€`} />
                  <Row label="Durée" value={jours > 0 ? `${jours} jour${jours > 1 ? 's' : ''}` : '—'} />
                  {form.options.includes('gps') && <Row label="GPS" value={`+${5 * jours}€`} />}
                  {form.options.includes('assurance_plus') && <Row label="Assurance+" value={`+${15 * jours}€`} />}
                  {form.options.includes('siege_enfant') && <Row label="Siège enfant" value={`+${8 * jours}€`} />}
                  <hr className="border-gray-100" />
                  <Row label="Total" value={`${totalPrice()}€`} bold />
                </div>
              </>
            )}

            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              Annulation gratuite jusqu'à 24h avant le départ. Prix TTC, carburant non inclus.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block mb-1.5" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>{label}</label>
      <input
        {...props}
        className="w-full text-sm transition-colors"
        style={{
          border: '1.5px solid #E2E8F0',
          borderRadius: 12,
          padding: '14px 16px',
          outline: 'none',
        }}
        onFocus={e => { e.target.style.borderColor = '#F97316'; props.onFocus?.(e) }}
        onBlur={e => { e.target.style.borderColor = '#E2E8F0'; props.onBlur?.(e) }}
      />
    </div>
  )
}

function Tag({ children }) {
  return <span className="bg-white text-gray-600 text-xs px-2 py-0.5 rounded-full border border-gray-200">{children}</span>
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-black text-dark text-base' : 'text-gray-500'}`}>
      <span>{label}</span><span className={bold ? 'text-primary' : ''}>{value}</span>
    </div>
  )
}

const OPTIONS = [
  { id: 'gps', label: 'GPS', desc: 'Navigation incluse', prix: 5 },
  { id: 'assurance_plus', label: 'Assurance Plus', desc: 'Franchise réduite', prix: 15 },
  { id: 'siege_enfant', label: 'Siège enfant', desc: 'Siège homologué', prix: 8 },
]
