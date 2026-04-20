import { useLocation, Link } from 'react-router-dom'

export default function ConfirmationPage() {
  const { state } = useLocation()
  const reservation = state?.reservation
  const vehicle = state?.vehicle

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-dark mb-2">Réservation confirmée !</h1>
        <p className="text-gray-500 text-sm mb-6">
          Un email de confirmation vous a été envoyé avec tous les détails.
        </p>

        {reservation && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-left mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-dark">Détails de la réservation</h2>
              <span className="bg-primary-xlight text-primary text-xs font-bold px-3 py-1 rounded-full">
                #{reservation.id || reservation.reservation_id}
              </span>
            </div>
            {vehicle && (
              <p className="font-semibold text-dark mb-1">
                {vehicle.marque} {vehicle.modele}
              </p>
            )}
            {reservation.date_depart && (
              <p className="text-sm text-gray-500">
                Du {new Date(reservation.date_depart).toLocaleDateString('fr-FR')} au{' '}
                {new Date(reservation.date_retour).toLocaleDateString('fr-FR')}
              </p>
            )}
            {reservation.montant_total && (
              <p className="mt-2 text-primary font-black text-lg">
                {reservation.montant_total}€ TTC
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link to="/ma-reservation"
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-sm">
            Gérer ma réservation
          </Link>
          <Link to="/"
            className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl text-sm">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
