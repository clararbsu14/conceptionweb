import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements, PaymentElement, useStripe, useElements,
} from '@stripe/react-stripe-js'
import api from '../api/axios'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

const APPEARANCE = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#F97316',
    colorBackground: '#FFFFFF',
    colorText: '#0F172A',
    colorDanger: '#EF4444',
    colorTextPlaceholder: '#94A3B8',
    fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
    fontSizeBase: '16px',          // prevents iOS zoom on focus
    borderRadius: '12px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1.5px solid #E2E8F0',
      padding: '14px 16px',
      boxShadow: 'none',
    },
    '.Input:focus': {
      border: '1.5px solid #F97316',
      boxShadow: '0 0 0 3px rgba(249,115,22,0.10)',
    },
    '.Label': {
      fontWeight: '600',
      fontSize: '0.8rem',
      color: '#64748B',
      marginBottom: '6px',
    },
  },
}

const ELEMENT_OPTIONS = {
  layout: 'tabs',
  // Belt-and-suspenders: even with payment_method_types: ['card'] on the backend,
  // explicitly silence any wallet UI the Element might still try to render.
  wallets: { applePay: 'never', googlePay: 'never' },
  terms: { card: 'never' },
  // We provide email + name in confirmParams below — required when set to 'never'.
  fields: { billingDetails: { email: 'never', name: 'never' } },
}

export default function PaymentForm({ bookingId, amount, billingDetails, onSuccess }) {
  const [clientSecret, setClientSecret] = useState('')
  const [loadError, setLoadError] = useState('')

  // Hide any body-level Stripe-injected iframes (Link "auto-fill" prompt,
  // fraud-detection iframe). Scoped to body > iframe so the actual card input
  // iframe — which lives inside .StripeElement — is untouched.
  useEffect(() => {
    const style = document.createElement('style')
    style.setAttribute('data-payment-hide-stripe-overlays', '')
    style.textContent = `
      body > iframe[src*="stripe.com"],
      body > iframe[name*="stripe" i],
      body > iframe[name*="__privateStripeMetrics" i],
      body > div[class*="StripeLink" i] { display: none !important; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  useEffect(() => {
    if (!bookingId) return
    let cancelled = false
    api.post('/payment/create-intent', { booking_id: bookingId })
      .then(({ data }) => { if (!cancelled) setClientSecret(data.clientSecret) })
      .catch(err => {
        if (!cancelled) setLoadError(err.response?.data?.message || 'Erreur lors de la préparation du paiement.')
      })
    return () => { cancelled = true }
  }, [bookingId])

  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
        Configuration manquante : VITE_STRIPE_PUBLIC_KEY non défini.
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
        {loadError}
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: APPEARANCE }}>
      <CheckoutForm amount={amount} onSuccess={onSuccess} />
    </Elements>
  )
}

function CheckoutForm({ amount, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError('')

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message || 'Le paiement a échoué.')
      setSubmitting(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess?.(paymentIntent)
    } else {
      setError(`Statut inattendu : ${paymentIntent?.status}`)
      setSubmitting(false)
    }
  }

  const formattedAmount = Number(amount).toFixed(2).replace('.', ',')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={ELEMENT_OPTIONS} />

      {error && (
        <div
          className="text-sm rounded-xl px-4 py-3"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#B91C1C',
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="tap-scale w-full flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          height: 56,
          background: '#F97316',
          color: '#FFF',
          fontWeight: 700,
          fontSize: '1rem',
          borderRadius: 100,
          border: 'none',
          boxShadow: '0 8px 24px rgba(249,115,22,0.35)',
        }}
        onMouseEnter={e => { if (!submitting && stripe) e.currentTarget.style.background = '#EA580C' }}
        onMouseLeave={e => { if (!submitting && stripe) e.currentTarget.style.background = '#F97316' }}
      >
        {submitting ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z" />
            </svg>
            Traitement en cours…
          </>
        ) : (
          <>
            Payer {formattedAmount}€
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>

      {/* Security badge */}
      <div
        className="text-center"
        style={{ marginTop: 16, color: '#64748B', fontSize: '0.75rem', lineHeight: 1.5 }}
      >
        <div className="flex items-center justify-center gap-1.5">
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <span>Paiement 100&nbsp;% sécurisé par Stripe</span>
        </div>
        <p style={{ marginTop: 2, fontSize: '0.7rem', color: '#94A3B8' }}>
          Vos données bancaires ne sont jamais stockées sur nos serveurs.
        </p>
      </div>
    </form>
  )
}
