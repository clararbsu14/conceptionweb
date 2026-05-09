import { useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'

export default function ConfirmationPage() {
  const { state } = useLocation()
  const reservation = state?.reservation
  const vehicle = state?.vehicle

  // Hide any Stripe-injected floating elements (Link button, fraud-detection iframe)
  // while this page is mounted.
  useEffect(() => {
    const style = document.createElement('style')
    style.setAttribute('data-confirm-hide-stripe', '')
    style.textContent = `
      body > iframe[src*="stripe.com"],
      body > iframe[name*="stripe" i],
      body > iframe[name*="__privateStripe" i],
      body > div[class*="StripeLink" i],
      .StripeElement { display: none !important; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const reservationId = reservation?.id || reservation?.reservation_id

  return (
    <>
      <style>{`
        @keyframes confirmPopIn {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes confirmFadeUp {
          0%   { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div
        className="flex-1 flex flex-col items-center justify-center"
        style={{
          minHeight: 'calc(100dvh - 120px)',
          padding: '24px 16px 96px',
          width: '100%',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 480,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          {/* Success icon with green glow + spring pop-in */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 0 0 16px rgba(34,197,94,0.10)',
              animation: 'confirmPopIn 0.5s ease forwards',
            }}
          >
            <svg
              style={{ width: 40, height: 40, color: '#22C55E' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#0F172A',
              marginTop: 20,
              animation: 'confirmFadeUp 0.4s 0.15s ease forwards',
              opacity: 0,
            }}
          >
            Réservation confirmée !
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: '#64748B',
              fontSize: '0.9rem',
              maxWidth: 320,
              margin: '8px auto 0',
              lineHeight: 1.5,
              animation: 'confirmFadeUp 0.4s 0.25s ease forwards',
              opacity: 0,
            }}
          >
            Un email de confirmation vous a été envoyé avec tous les détails.
          </p>

          {/* Booking details card */}
          {reservation && (
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                padding: '4px 20px',
                marginTop: 24,
                width: '100%',
                animation: 'confirmFadeUp 0.4s 0.35s ease forwards',
                opacity: 0,
              }}
            >
              {reservationId && (
                <Row
                  label="Réservation"
                  value={
                    <span style={{ color: '#F97316', fontWeight: 700 }}>
                      #{reservationId}
                    </span>
                  }
                />
              )}

              {vehicle && (
                <Row
                  label="Véhicule"
                  value={
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>
                      {vehicle.marque} {vehicle.modele}
                    </span>
                  }
                />
              )}

              {reservation.date_depart && reservation.date_retour && (
                <Row
                  label="Dates"
                  value={
                    <span style={{ color: '#475569', fontSize: '0.85rem' }}>
                      {new Date(reservation.date_depart).toLocaleDateString('fr-FR')}
                      {' → '}
                      {new Date(reservation.date_retour).toLocaleDateString('fr-FR')}
                    </span>
                  }
                />
              )}

              {reservation.montant_total != null && (
                <Row
                  label="Total TTC"
                  last
                  value={
                    <span
                      style={{
                        fontWeight: 800,
                        color: '#F97316',
                        fontSize: '1.125rem',
                      }}
                    >
                      {reservation.montant_total}€
                    </span>
                  }
                />
              )}
            </div>
          )}

          {/* Primary CTA */}
          <Link
            to="/ma-reservation"
            className="tap-scale"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: 52,
              background: '#F97316',
              color: '#FFF',
              borderRadius: 100,
              fontWeight: 600,
              fontSize: '0.95rem',
              marginTop: 24,
              textDecoration: 'none',
              transition: 'background 0.15s ease',
              animation: 'confirmFadeUp 0.4s 0.45s ease forwards',
              opacity: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#EA580C' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F97316' }}
          >
            Gérer ma réservation
          </Link>

          {/* Secondary CTA */}
          <Link
            to="/"
            className="tap-scale"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: 48,
              background: 'transparent',
              border: '1px solid #E2E8F0',
              color: '#64748B',
              borderRadius: 100,
              fontWeight: 500,
              fontSize: '0.9rem',
              marginTop: 12,
              textDecoration: 'none',
              transition: 'border-color 0.15s ease, color 0.15s ease',
              animation: 'confirmFadeUp 0.4s 0.55s ease forwards',
              opacity: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#F97316'
              e.currentTarget.style.color = '#F97316'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E2E8F0'
              e.currentTarget.style.color = '#64748B'
            }}
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </>
  )
}

function Row({ label, value, last }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        padding: '12px 0',
        borderBottom: last ? 'none' : '1px solid #E2E8F0',
      }}
    >
      <span
        style={{
          fontSize: '0.7rem',
          color: '#94A3B8',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span style={{ textAlign: 'right', minWidth: 0 }}>{value}</span>
    </div>
  )
}
