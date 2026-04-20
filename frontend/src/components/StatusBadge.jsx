const STATUS = {
  disponible:     { label: 'Disponible',    bg: 'rgba(34,197,94,0.12)',  text: '#4ADE80',  dot: '#22C55E' },
  loue:           { label: 'En location',   bg: 'rgba(59,130,246,0.12)', text: '#60A5FA',  dot: '#3B82F6' },
  maintenance:    { label: 'Maintenance',   bg: 'rgba(245,158,11,0.12)', text: '#FBBF24',  dot: '#F59E0B' },
  en_maintenance: { label: 'Maintenance',   bg: 'rgba(245,158,11,0.12)', text: '#FBBF24',  dot: '#F59E0B' },
  retard:         { label: 'Retard',        bg: 'rgba(239,68,68,0.12)',  text: '#F87171',  dot: '#EF4444' },
  reserve:        { label: 'Réservé',       bg: 'rgba(168,85,247,0.12)', text: '#C084FC',  dot: '#A855F7' },
  confirme:       { label: 'Confirmée',     bg: 'rgba(34,197,94,0.12)',  text: '#4ADE80',  dot: '#22C55E' },
  confirmee:      { label: 'Confirmée',     bg: 'rgba(34,197,94,0.12)',  text: '#4ADE80',  dot: '#22C55E' },
  en_cours:       { label: 'En cours',      bg: 'rgba(59,130,246,0.12)', text: '#60A5FA',  dot: '#3B82F6' },
  annule:         { label: 'Annulée',       bg: 'rgba(239,68,68,0.12)',  text: '#F87171',  dot: '#EF4444' },
  annulee:        { label: 'Annulée',       bg: 'rgba(239,68,68,0.12)',  text: '#F87171',  dot: '#EF4444' },
  termine:        { label: 'Terminée',      bg: 'rgba(100,116,139,0.12)',text: '#94A3B8',  dot: '#64748B' },
  terminee:       { label: 'Terminée',      bg: 'rgba(100,116,139,0.12)',text: '#94A3B8',  dot: '#64748B' },
}

export default function StatusBadge({ status, size = 'sm' }) {
  const s = STATUS[status] || { label: status, bg: 'rgba(100,116,139,0.12)', text: '#94A3B8', dot: '#64748B' }
  const sz = size === 'sm' ? 'text-[11px] px-2.5 py-1' : 'text-[13px] px-3.5 py-1.5'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sz}`}
      style={{ background: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  )
}
