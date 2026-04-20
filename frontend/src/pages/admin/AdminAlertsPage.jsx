import { useState, useEffect } from 'react'
import api from '../../api/axios'

const MOCK = [
  { id: 1, type: 'retard', message: 'Tesla Model 3 (IJ-789-KL) — retour prévu le 12/04, Marie Martin.', created_at: '2026-04-13T08:00:00', lu: false, severity: 'high' },
  { id: 2, type: 'maintenance', message: 'BMW Série 5 (MN-012-OP) — révision due à 90 000 km.', created_at: '2026-04-12T14:30:00', lu: false, severity: 'medium' },
  { id: 3, type: 'reservation', message: 'Nouvelle réservation #1039 — Sophie Leroy, Citroën C3, 20–22 avril.', created_at: '2026-04-11T10:15:00', lu: true, severity: 'low' },
  { id: 4, type: 'retard', message: 'Peugeot 308 (EF-456-GH) — retour en retard de 2h, Jean Dupont.', created_at: '2026-04-10T17:00:00', lu: true, severity: 'high' },
]

const ICONS = {
  retard:      <svg className="w-5 h-5" fill="none" stroke="#EF4444" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>,
  maintenance: <svg className="w-5 h-5" fill="none" stroke="#F59E0B" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.193-.14 1.743" /></svg>,
  reservation: <svg className="w-5 h-5" fill="none" stroke="#3B82F6" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>,
  systeme:     <svg className="w-5 h-5" fill="none" stroke="#94A3B8" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>,
}

const SEVERITY_STYLES = {
  high:   { border: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.06)', iconBg: 'rgba(239,68,68,0.12)' },
  medium: { border: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.06)', iconBg: 'rgba(245,158,11,0.12)' },
  low:    { border: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.06)', iconBg: 'rgba(59,130,246,0.12)' },
}

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState(MOCK)

  useEffect(() => {
    api.get('/alerts').then(({ data }) => setAlerts(data)).catch(() => {})
  }, [])

  const markRead = async (id) => {
    try { await api.patch(`/alerts/${id}/read`) } catch {}
    setAlerts(as => as.map(a => a.id === id ? { ...a, lu: true } : a))
  }

  const markAllRead = async () => {
    try { await api.post('/alerts/read-all') } catch {}
    setAlerts(as => as.map(a => ({ ...a, lu: true })))
  }

  const unread = alerts.filter(a => !a.lu).length

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-[1.75rem] font-bold text-white leading-tight">Alertes</h1>
          <p className="text-[0.875rem] mt-1" style={{ color: '#64748B' }}>
            {unread > 0 ? `${unread} alerte${unread > 1 ? 's' : ''} non lue${unread > 1 ? 's' : ''}` : 'Toutes les alertes sont lues'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-sm text-primary hover:underline font-semibold">
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="space-y-3">
        {alerts.length === 0 && (
          <div className="admin-card p-12 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)' }}>
              <svg className="w-7 h-7" fill="none" stroke="#22C55E" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            </div>
            <p className="font-semibold text-white">Aucune alerte</p>
            <p className="text-sm mt-1" style={{ color: '#64748B' }}>Tout est en ordre.</p>
          </div>
        )}
        {alerts.map(a => {
          const sev = !a.lu ? (SEVERITY_STYLES[a.severity] || SEVERITY_STYLES.low) : { border: '#1F2937', bg: '#111827', iconBg: 'rgba(255,255,255,0.04)' }
          return (
            <div key={a.id}
              className={`rounded-2xl p-4 flex gap-4 items-start transition-all ${a.lu ? 'opacity-50' : ''}`}
              style={{
                background: sev.bg,
                border: `1px solid ${sev.border}`,
                boxShadow: !a.lu ? '0 0 0 1px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.3)' : 'none',
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: sev.iconBg }}>
                {ICONS[a.type] || ICONS.systeme}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[0.875rem] leading-relaxed ${!a.lu ? 'font-semibold text-white' : ''}`}
                  style={{ color: a.lu ? '#94A3B8' : undefined }}>
                  {a.message}
                </p>
                <p className="text-[12px] mt-1.5" style={{ color: '#475569' }}>
                  {new Date(a.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
              {!a.lu && (
                <button onClick={() => markRead(a.id)}
                  className="admin-btn-ghost shrink-0 text-[12px] whitespace-nowrap"
                  style={{ padding: '6px 12px' }}>
                  Marquer lu
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
