import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

export default function InvoicePage() {
  const { id } = useParams()
  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const printRef = useRef()

  useEffect(() => {
    api.get(`/bookings/${id}`)
      .then(({ data }) => setReservation(data))
      .catch(() => setError('Facture introuvable.'))
      .finally(() => setLoading(false))
  }, [id])

  const handlePrint = () => window.print()

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="flex-1 flex items-center justify-center text-center px-4">
      <div>
        <p className="text-red-500 font-semibold mb-3">{error}</p>
        <Link to="/ma-reservation" className="text-primary hover:underline text-sm">
          Retour à mes réservations
        </Link>
      </div>
    </div>
  )

  const jours = reservation
    ? Math.ceil((new Date(reservation.date_retour) - new Date(reservation.date_depart)) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Print button */}
      <div className="flex justify-between items-center mb-6 no-print">
        <Link to="/ma-reservation" className="text-sm text-gray-500 hover:text-primary flex items-center gap-1">
          ← Retour
        </Link>
        <button onClick={handlePrint}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-lg text-sm">
          🖨️ Imprimer / PDF
        </button>
      </div>

      {/* Invoice */}
      <div ref={printRef} className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">A</span>
              </div>
              <span className="text-xl font-black text-dark tracking-tight">AUTOLOC</span>
            </div>
            <p className="text-primary text-xs font-medium">Le confort notre atout</p>
            <p className="text-gray-400 text-xs mt-1">12 Rue des Voitures, 75001 Paris</p>
            <p className="text-gray-400 text-xs">SIRET : 123 456 789 00010</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black text-dark">FACTURE</h1>
            <p className="text-gray-500 text-sm mt-1">N° {reservation.id}</p>
            <p className="text-gray-500 text-xs">
              Date : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Client info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Facturé à</h3>
            <p className="font-bold text-dark">{reservation.prenom} {reservation.nom}</p>
            <p className="text-gray-500 text-sm">{reservation.email}</p>
            <p className="text-gray-500 text-sm">{reservation.telephone}</p>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Période de location</h3>
            <p className="text-sm text-dark">
              Du <span className="font-semibold">{new Date(reservation.date_depart).toLocaleDateString('fr-FR')}</span>
            </p>
            <p className="text-sm text-dark">
              Au <span className="font-semibold">{new Date(reservation.date_retour).toLocaleDateString('fr-FR')}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">{jours} jour{jours > 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left px-3 py-2 rounded-l-lg">Description</th>
              <th className="text-right px-3 py-2">Qté</th>
              <th className="text-right px-3 py-2">PU HT</th>
              <th className="text-right px-3 py-2 rounded-r-lg">Total HT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <tr>
              <td className="px-3 py-3 font-medium text-dark">
                Location {reservation.marque} {reservation.modele}
                <span className="block text-xs text-gray-400 font-normal capitalize">{reservation.categorie}</span>
              </td>
              <td className="px-3 py-3 text-right text-gray-600">{jours} j.</td>
              <td className="px-3 py-3 text-right text-gray-600">
                {(reservation.prix_jour / 1.2).toFixed(2)}€
              </td>
              <td className="px-3 py-3 text-right font-semibold">
                {((reservation.prix_jour / 1.2) * jours).toFixed(2)}€
              </td>
            </tr>
            {reservation.options && JSON.parse(reservation.options || '[]').map((opt) => (
              <tr key={opt}>
                <td className="px-3 py-3 text-dark capitalize">{opt.replace('_', ' ')}</td>
                <td className="px-3 py-3 text-right text-gray-600">{jours} j.</td>
                <td className="px-3 py-3 text-right text-gray-600">—</td>
                <td className="px-3 py-3 text-right font-semibold">—</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="ml-auto max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Sous-total HT</span>
            <span>{(reservation.montant_total / 1.2).toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>TVA 20%</span>
            <span>{(reservation.montant_total - reservation.montant_total / 1.2).toFixed(2)}€</span>
          </div>
          <div className="flex justify-between font-black text-dark text-base border-t border-gray-200 pt-2 mt-2">
            <span>Total TTC</span>
            <span className="text-primary">{Number(reservation.montant_total).toFixed(2)}€</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-100 text-xs text-gray-400 text-center space-y-1">
          <p>AUTOLOC — 12 Rue des Voitures, 75001 Paris — SIRET 123 456 789 00010 — TVA FR12345678900</p>
          <p>Merci pour votre confiance. Le confort notre atout.</p>
        </div>
      </div>
    </div>
  )
}
