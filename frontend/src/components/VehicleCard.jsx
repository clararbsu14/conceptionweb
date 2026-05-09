import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function VehicleCard({ vehicle, showStatus = false }) {
  const { id, marque, modele, categorie, type, prix_jour,
          places, transmission, carburant, image_url, photo_url, statut } = vehicle
  const img = image_url || photo_url
  const available = !showStatus || statut === 'disponible'
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div className="ios-vcard flex flex-col">

      {/* Image — fixed 16/9 aspect ratio prevents layout shift on load */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '16 / 9', background: '#F1F5F9' }}
      >
        {img && !imgFailed
          ? <img src={img} alt={`${marque} ${modele}`}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={() => setImgFailed(true)} />
          : (
            <div
              className="w-full h-full flex flex-col items-center justify-center select-none"
              style={{ color: '#94A3B8', gap: 8 }}
            >
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M5 17h14" />
                <path d="M3 17v-5l2-5h14l2 5v5" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
                <path d="M7 12h10" />
              </svg>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>
                {marque} {modele}
              </span>
            </div>
          )
        }

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2">
          <span className="inline-flex items-center bg-primary text-white font-bold uppercase tracking-wide"
            style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: 100 }}>
            {categorie || type}
          </span>
          {showStatus && statut && (
            <span
              className="inline-flex items-center font-bold uppercase tracking-wide text-white"
              style={{
                fontSize: '0.7rem',
                padding: '4px 10px',
                borderRadius: 100,
                background: statut === 'disponible' ? '#16A34A' : '#DC2626',
              }}>
              {statut === 'disponible' ? 'Disponible' : 'Indisponible'}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="font-bold text-dark text-base leading-tight mb-2 tracking-tight">
          {marque} <span className="font-medium text-muted">{modele}</span>
        </div>

        {/* Specs — icons + text */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-4 text-muted" style={{ fontSize: '0.8rem' }}>
          {places && (
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
              </svg>
              {places}
            </span>
          )}
          {transmission && (
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"/>
              </svg>
              {transmission}
            </span>
          )}
          {carburant && (
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v1.5M3.75 4.5a1.5 1.5 0 011.5-1.5h10.5a1.5 1.5 0 011.5 1.5m-13.5 0V21a.75.75 0 00.75.75h12a.75.75 0 00.75-.75V4.5M16.5 7.5v3.75a.75.75 0 00.75.75h2.25a.75.75 0 00.75-.75V9.31a.75.75 0 00-.22-.53l-2.03-2.03"/>
              </svg>
              {carburant}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between mt-auto pt-3 gap-3">
          <div className="leading-none">
            <span className="text-3xl font-black text-primary tracking-tight">{prix_jour}€</span>
            <span className="text-xs text-muted ml-1">/jour</span>
          </div>
        </div>

        <Link to={available ? `/reservation/${id}` : '#'}
          className={`mt-3 w-full inline-flex items-center justify-center font-bold text-sm tap-scale transition-all ${
            available
              ? 'bg-primary text-white hover:bg-primary-dark shadow-[0_4px_12px_rgba(249,115,22,0.3)]'
              : 'bg-surface text-muted cursor-default'
          }`}
          style={{ height: 44, borderRadius: 100 }}>
          {available ? 'Réserver' : 'Indisponible'}
        </Link>
      </div>
    </div>
  )
}
