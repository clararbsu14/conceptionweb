import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

export default function VehicleCard({ vehicle, showStatus = false }) {
  const { id, marque, modele, categorie, type, prix_jour,
          places, transmission, carburant, image_url, photo_url, statut } = vehicle
  const img = image_url || photo_url
  const available = !showStatus || statut === 'disponible'

  return (
    <div className="card flex flex-col hover:border-primary/30 hover:shadow-md transition-all group">

      {/* Image */}
      <div className="relative bg-surface h-40 sm:h-44 flex items-center justify-center overflow-hidden">
        {img
          ? <img src={img} alt={`${marque} ${modele}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=Photo+indisponible'; }} />
          : <div className="text-6xl opacity-15 select-none">🚗</div>
        }
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start">
          <span className="badge bg-dark/70 text-white capitalize text-[10px]">
            {categorie || type}
          </span>
          {showStatus && statut && <StatusBadge status={statut} />}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="font-black text-dark text-base leading-tight mb-2">
          {marque} <span className="font-semibold text-muted">{modele}</span>
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {[places && `${places} places`, transmission, carburant].filter(Boolean).map(s => (
            <span key={s} className="text-[11px] font-medium text-muted border border-border px-2 py-0.5 rounded-lg bg-surface">
              {s}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <div className="leading-none">
            <span className="text-2xl font-black text-dark">{prix_jour}</span>
            <span className="text-primary font-black">€</span>
            <span className="text-xs text-muted ml-1">/ jour</span>
          </div>
          <Link to={available ? `/reservation/${id}` : '#'}
            className={`btn text-sm px-4 py-2 ${available ? 'btn-primary' : 'bg-surface text-muted border border-border cursor-default'}`}>
            {available ? 'Réserver' : 'Indisponible'}
          </Link>
        </div>
      </div>
    </div>
  )
}
