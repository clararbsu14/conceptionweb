import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'

const MOIS_FR = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
  '05': 'Mai', '06': 'Juin', '07': 'Juil', '08': 'Août',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState(null)
  const [revenueChart, setRevenueChart] = useState(null)
  const [topVehicles, setTopVehicles] = useState(null)
  const [dashAlerts, setDashAlerts] = useState(null)
  const [error, setError] = useState({})

  useEffect(() => {
    // Fetch all dashboard data in parallel
    api.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(() => setError(e => ({ ...e, stats: true })))

    api.get('/bookings?limit=5&sort=recent')
      .then(r => setRecent(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError(e => ({ ...e, recent: true })))

    api.get('/dashboard/revenue-chart')
      .then(r => setRevenueChart(r.data))
      .catch(() => setError(e => ({ ...e, revenue: true })))

    api.get('/dashboard/top-vehicles')
      .then(r => setTopVehicles(r.data))
      .catch(() => setError(e => ({ ...e, topVehicles: true })))

    api.get('/dashboard/alerts')
      .then(r => setDashAlerts(r.data))
      .catch(() => setError(e => ({ ...e, alerts: true })))
  }, [])

  // Revenue chart % change
  let revChange = null
  if (revenueChart && revenueChart.length >= 2) {
    const curr = revenueChart[revenueChart.length - 1].total
    const prev = revenueChart[revenueChart.length - 2].total
    if (prev > 0) revChange = Math.round(((curr - prev) / prev) * 100)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[1.75rem] font-bold text-white leading-tight">Tableau de bord</h1>
        <p className="text-[0.875rem] mt-1" style={{ color: '#64748B' }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ── ROW 1: Primary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats ? (
          <>
            <KpiCard label="Disponibles" value={stats.disponibles} total={stats.total_vehicules} color="green"
              icon={<svg className="w-5 h-5" fill="none" stroke="#22C55E" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
              iconBg="rgba(34,197,94,0.12)" />
            <KpiCard label="En location" value={stats.en_location} total={stats.total_vehicules} color="blue"
              icon={<svg className="w-5 h-5" fill="none" stroke="#3B82F6" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" /></svg>}
              iconBg="rgba(59,130,246,0.12)" />
            <KpiCard label="Retards" value={stats.retards_actifs} color="red" alert={stats.retards_actifs > 0}
              icon={<svg className="w-5 h-5" fill="none" stroke="#EF4444" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>}
              iconBg="rgba(239,68,68,0.12)" />
            <KpiCard label="Réservations ce mois" value={stats.reservations_ce_mois} color="orange"
              icon={<svg className="w-5 h-5" fill="none" stroke="#F97316" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>}
              iconBg="rgba(249,115,22,0.12)" />
          </>
        ) : error.stats ? (
          <ErrorCard colSpan={4} />
        ) : (
          <>
            <SkeletonKpi /><SkeletonKpi /><SkeletonKpi /><SkeletonKpi />
          </>
        )}
      </div>

      {/* ── ROW 2: Secondary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats ? (
          <>
            <KpiCard label="Taux d'occupation" value={`${stats.taux_occupation}%`} color="blue"
              subtitle={`${(stats.total_vehicules || 0) - (stats.disponibles || 0)} véhicules sur ${stats.total_vehicules} en activité`}
              icon={<svg className="w-5 h-5" fill="none" stroke="#3B82F6" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>}
              iconBg="rgba(59,130,246,0.12)" />
            <KpiCard label="RevPAC" value={`${stats.revpac}€`} color="orange"
              subtitle="Revenu par véhicule actif par jour"
              icon={<svg className="w-5 h-5" fill="none" stroke="#F97316" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
              iconBg="rgba(249,115,22,0.12)" />
            <KpiCard label="Durée moyenne" value={`${stats.duree_moyenne}j`} color="green"
              subtitle="Durée moyenne des locations"
              icon={<svg className="w-5 h-5" fill="none" stroke="#22C55E" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
              iconBg="rgba(34,197,94,0.12)" />
            <Link to="/admin/flotte" className="block">
              <KpiCard label="Véhicules à réviser" value={stats.vehicules_a_reviser} color="red"
                subtitle="Cliquer pour voir le détail"
                alert={stats.vehicules_a_reviser > 0}
                icon={<svg className="w-5 h-5" fill="none" stroke="#EF4444" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.193-.14 1.743" /></svg>}
                iconBg="rgba(239,68,68,0.12)" />
            </Link>
          </>
        ) : error.stats ? (
          <ErrorCard colSpan={4} />
        ) : (
          <>
            <SkeletonKpi /><SkeletonKpi /><SkeletonKpi /><SkeletonKpi />
          </>
        )}
      </div>

      {/* ── ROW 3: Revenue Chart + Top Vehicles ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 admin-card p-6" style={{ minWidth: 0 }}>
          <div className="flex items-center justify-between mb-1">
            <p className="admin-section-label">Revenus — 6 derniers mois</p>
            {revChange !== null && (
              <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${
                revChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`} style={{ background: revChange >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}>
                {revChange >= 0 ? '+' : ''}{revChange}% vs mois préc.
              </span>
            )}
          </div>
          {stats && (
            <p className="text-[2rem] font-extrabold text-primary leading-none mb-5" style={{ letterSpacing: '-0.02em' }}>
              {stats.revenus_mois?.toLocaleString('fr-FR')}
              <span className="text-[1.25rem] ml-0.5">€</span>
              <span className="text-[13px] font-medium ml-2" style={{ color: '#475569' }}>ce mois</span>
            </p>
          )}
          {revenueChart ? (
            <div style={{ width: '100%', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
              <ResponsiveContainer width="100%" height={220} minWidth={0}>
                <AreaChart data={revenueChart.map(d => ({
                  ...d,
                  label: MOIS_FR[d.mois.split('-')[1]] || d.mois,
                }))}>
                  <defs>
                    <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F97316" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    axisLine={false} tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Inter' }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: '#1F2937', border: '1px solid #374151',
                      borderRadius: 10, color: '#F1F5F9', fontSize: 13,
                      fontFamily: 'Inter', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    }}
                    formatter={(val) => [`${Number(val).toLocaleString('fr-FR')}€`, 'Revenus']}
                    labelStyle={{ color: '#94A3B8' }}
                  />
                  <Area
                    type="monotone" dataKey="total"
                    stroke="#F97316" strokeWidth={2.5}
                    fill="url(#orangeGrad)"
                    dot={{ fill: '#F97316', strokeWidth: 0, r: 4 }}
                    activeDot={{ fill: '#F97316', strokeWidth: 2, stroke: '#fff', r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : error.revenue ? (
            <ErrorInline />
          ) : (
            <SkeletonChart />
          )}
        </div>

        {/* Top Vehicles */}
        <div className="admin-card p-6">
          <p className="admin-section-label mb-5">Top véhicules loués</p>
          {topVehicles ? (
            topVehicles.length > 0 ? (
              <div className="space-y-4">
                {(() => {
                  const maxLoc = Math.max(...topVehicles.map(v => v.nb_locations), 1)
                  return topVehicles.map((v, i) => (
                    <div key={v.id || i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] font-medium text-white">{v.marque} {v.modele}</span>
                        <span className="text-[13px] font-bold text-primary">{v.nb_locations} loc.</span>
                      </div>
                      <div className="admin-progress-bar">
                        <div className="admin-progress-fill" style={{ width: `${(v.nb_locations / maxLoc) * 100}%` }} />
                      </div>
                    </div>
                  ))
                })()}
              </div>
            ) : (
              <p className="text-[13px] py-8 text-center" style={{ color: '#475569' }}>Aucune location enregistrée</p>
            )
          ) : error.topVehicles ? (
            <ErrorInline />
          ) : (
            <SkeletonList count={5} />
          )}
        </div>
      </div>

      {/* ── ROW 4: Fleet Overview ── */}
      {stats && (
        <div className="admin-card p-6">
          <div className="flex justify-between items-center mb-5">
            <p className="admin-section-label">État de la flotte</p>
            <Link to="/admin/flotte" className="text-primary text-xs font-semibold hover:underline">
              Voir tout →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Disponibles', count: stats.disponibles, color: '#22C55E' },
              { label: 'En location', count: stats.en_location, color: '#3B82F6' },
              { label: 'Maintenance', count: stats.en_maintenance, color: '#F59E0B' },
              { label: 'Retards',     count: stats.retards_actifs, color: '#EF4444' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1F2937' }}>
                <p className="text-[1.75rem] font-extrabold leading-none" style={{ color: s.color, letterSpacing: '-0.02em' }}>{s.count || 0}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                  <p className="text-[11px] font-medium" style={{ color: '#64748B' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Occupation bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium" style={{ color: '#64748B' }}>Taux d'occupation</p>
              <p className="text-[13px] font-bold text-primary">{stats.taux_occupation}%</p>
            </div>
            <div className="flex rounded-full overflow-hidden h-2.5" style={{ background: '#1F2937' }}>
              {stats.total_vehicules > 0 && (
                <>
                  <div className="transition-all" style={{ width: `${((stats.disponibles || 0) / stats.total_vehicules) * 100}%`, background: '#22C55E' }} />
                  <div className="transition-all" style={{ width: `${((stats.en_location || 0) / stats.total_vehicules) * 100}%`, background: '#3B82F6' }} />
                  <div className="transition-all" style={{ width: `${((stats.en_maintenance || 0) / stats.total_vehicules) * 100}%`, background: '#F59E0B' }} />
                  <div className="transition-all" style={{ width: `${((stats.retards_actifs || 0) / stats.total_vehicules) * 100}%`, background: '#EF4444' }} />
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">
              {[
                { l: 'Disponibles', c: '#22C55E' }, { l: 'En location', c: '#3B82F6' },
                { l: 'Maintenance', c: '#F59E0B' }, { l: 'Retards', c: '#EF4444' },
              ].map(i => (
                <span key={i.l} className="flex items-center gap-1.5 text-[11px]" style={{ color: '#64748B' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: i.c }} />{i.l}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ROW 5: Alerts ── */}
      <div className="admin-card p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="admin-section-label">Alertes rapides</p>
          <Link to="/admin/alertes" className="text-primary text-xs font-semibold hover:underline">
            Voir tout →
          </Link>
        </div>
        {dashAlerts ? (
          dashAlerts.length > 0 ? (
            <div className="space-y-3">
              {dashAlerts.map(a => (
                <AlertRow key={a.id} alert={a} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-[2rem] mb-2">🎉</p>
              <p className="text-[13px] font-medium" style={{ color: '#64748B' }}>Aucune alerte aujourd'hui</p>
            </div>
          )
        ) : error.alerts ? (
          <ErrorInline />
        ) : (
          <SkeletonList count={3} />
        )}
      </div>

      {/* ── ROW 6: Recent Reservations ── */}
      <div className="admin-card overflow-hidden">
        <div className="flex justify-between items-center p-6 pb-0">
          <p className="admin-section-label">Réservations récentes</p>
          <Link to="/admin/reservations" className="text-primary text-xs font-semibold hover:underline">
            Voir tout →
          </Link>
        </div>
        {recent ? (
          recent.length > 0 ? (
            <div className="overflow-x-auto p-6 pt-4">
              <table className="admin-table min-w-[500px]">
                <thead>
                  <tr>
                    <th>Réf.</th>
                    <th>Client</th>
                    <th>Véhicule</th>
                    <th>Dates</th>
                    <th>Statut</th>
                    <th className="text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(r => (
                    <tr key={r.id}>
                      <td className="font-mono" style={{ color: '#475569' }}>#{r.id}</td>
                      <td className="font-medium text-white">{r.prenom} {r.nom}</td>
                      <td style={{ color: '#CBD5E1' }}>{r.marque} {r.modele}</td>
                      <td className="text-xs" style={{ color: '#64748B' }}>
                        {r.date_depart ? new Date(r.date_depart).toLocaleDateString('fr-FR') : '—'} → {r.date_retour ? new Date(r.date_retour).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td><StatusBadge status={r.statut} /></td>
                      <td className="font-bold text-right text-primary">{r.montant_total ? `${Number(r.montant_total).toLocaleString('fr-FR')}€` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-[13px] py-10" style={{ color: '#475569' }}>Aucune réservation</p>
          )
        ) : error.recent ? (
          <div className="p-6"><ErrorInline /></div>
        ) : (
          <div className="p-6"><SkeletonTable /></div>
        )}
      </div>
    </div>
  )
}

/* ─── Sub-components ─── */

function KpiCard({ label, value, total, color, icon, iconBg, alert, subtitle }) {
  const colors = { green: '#22C55E', blue: '#3B82F6', red: '#EF4444', orange: '#F97316' }
  return (
    <div className={`admin-card admin-card-${color} p-6`}
      style={alert ? { borderColor: 'rgba(239,68,68,0.4)', boxShadow: '0 0 0 1px rgba(239,68,68,0.15), 0 0 30px rgba(239,68,68,0.1)' } : {}}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          {icon}
        </div>
        {total != null && <span className="text-[11px] font-medium" style={{ color: '#475569' }}>/ {total}</span>}
      </div>
      <p className="font-extrabold leading-none" style={{ fontSize: '2.5rem', color: colors[color], letterSpacing: '-0.02em' }}>
        {value ?? '—'}
      </p>
      <p className="admin-section-label mt-3">{label}</p>
      {subtitle && <p className="text-[11px] mt-1" style={{ color: '#475569' }}>{subtitle}</p>}
    </div>
  )
}

const ALERT_STYLES = {
  retard:      { color: '#EF4444', bg: 'rgba(239,68,68,0.06)', icon: <svg className="w-4 h-4" fill="none" stroke="#EF4444" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg> },
  maintenance: { color: '#F59E0B', bg: 'rgba(245,158,11,0.06)', icon: <svg className="w-4 h-4" fill="none" stroke="#F59E0B" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.193-.14 1.743" /></svg> },
  retour:      { color: '#3B82F6', bg: 'rgba(59,130,246,0.06)', icon: <svg className="w-4 h-4" fill="none" stroke="#3B82F6" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg> },
  reservation: { color: '#F97316', bg: 'rgba(249,115,22,0.06)', icon: <svg className="w-4 h-4" fill="none" stroke="#F97316" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg> },
}

function AlertRow({ alert: a }) {
  const s = ALERT_STYLES[a.type] || ALERT_STYLES.reservation
  return (
    <div className="flex items-start gap-3 rounded-xl p-3 transition-colors"
      style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `${s.color}18` }}>
        {s.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white leading-tight">{a.title}</p>
        <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: '#94A3B8' }}>{a.message}</p>
      </div>
      {a.severity === 'high' && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-1"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171' }}>
          URGENT
        </span>
      )}
    </div>
  )
}

/* ─── Skeletons ─── */

function SkeletonKpi() {
  return (
    <div className="admin-card p-6 animate-pulse">
      <div className="w-10 h-10 rounded-xl mb-4" style={{ background: '#1F2937' }} />
      <div className="h-10 rounded-lg w-16 mb-3" style={{ background: '#1F2937' }} />
      <div className="h-3 rounded w-24" style={{ background: '#1F2937' }} />
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="animate-pulse space-y-3" style={{ height: 220 }}>
      <div className="flex items-end gap-2 h-full pt-4">
        {[40, 65, 50, 80, 60, 90].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%`, background: '#1F2937' }} />
        ))}
      </div>
    </div>
  )
}

function SkeletonList({ count }) {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i}>
          <div className="flex justify-between mb-2">
            <div className="h-3 rounded w-28" style={{ background: '#1F2937' }} />
            <div className="h-3 rounded w-12" style={{ background: '#1F2937' }} />
          </div>
          <div className="h-1.5 rounded-full" style={{ background: '#1F2937' }} />
        </div>
      ))}
    </div>
  )
}

function SkeletonTable() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 rounded w-full" style={{ background: '#1F2937' }} />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-10 rounded" style={{ background: '#1F2937' }} />
      ))}
    </div>
  )
}

function ErrorCard({ colSpan }) {
  return (
    <div className={`admin-card p-6 text-center ${colSpan ? `col-span-${colSpan}` : ''}`}
      style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
      <p className="text-[13px] font-medium" style={{ color: '#EF4444' }}>Données indisponibles</p>
      <p className="text-[11px] mt-1" style={{ color: '#475569' }}>Vérifiez la connexion au serveur</p>
    </div>
  )
}

function ErrorInline() {
  return (
    <div className="py-6 text-center">
      <p className="text-[13px] font-medium" style={{ color: '#EF4444' }}>Données indisponibles</p>
    </div>
  )
}
