'use client'
import { useEffect, useState } from 'react'

interface Stats {
  services: { total: number; live: number; coming_soon: number; planned: number; down: number }
  users: { total: number; verified: number; unverified: number; today: number }
  categories: { total: number }
  monitor: { total_checks: number; up: number; down: number; avg_response_ms: number }
}

interface Service {
  id: string; name: string; status: string; category: string; url: string; icon: string
}

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  live: { bg: 'rgba(52,211,153,0.1)', text: '#34d399' },
  coming_soon: { bg: 'rgba(251,191,36,0.1)', text: '#fbbf24' },
  planned: { bg: 'rgba(100,116,139,0.1)', text: '#94a3b8' },
  down: { bg: 'rgba(239,68,68,0.1)', text: '#f87171' },
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'overview'|'services'|'users'>('overview')

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => { setStats(d); setLoading(false) })
  }, [])

  useEffect(() => {
    const params = new URLSearchParams({ page: page.toString(), limit: '50', search, status: filterStatus })
    fetch(`/api/services?${params}`).then(r => r.json()).then(d => { setServices(d.data || []); setTotal(d.count || 0) })
  }, [page, search, filterStatus])

  const handleSave = async (id: string, status: string) => {
    setSaving(true)
    await fetch('/api/services', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    setServices(s => s.map(sv => sv.id === id ? { ...sv, status } : sv))
    setEditId('')
    setSaving(false)
  }

  const statCards = stats ? [
    { label: 'Total Services', value: stats.services.total.toLocaleString(), color: '#d4af37', icon: '🔷' },
    { label: 'Live', value: stats.services.live, color: '#34d399', icon: '✅' },
    { label: 'Total Users', value: stats.users.total, color: '#60a5fa', icon: '👥' },
    { label: 'Categories', value: stats.categories.total, color: '#a78bfa', icon: '📁' },
    { label: 'Coming Soon', value: stats.services.coming_soon, color: '#fbbf24', icon: '⏳' },
    { label: 'Planned', value: stats.services.planned, color: '#94a3b8', icon: '📋' },
    { label: 'Users Today', value: stats.users.today, color: '#34d399', icon: '🆕' },
    { label: 'Avg Response', value: `${stats.monitor.avg_response_ms}ms`, color: '#f59e0b', icon: '⚡' },
  ] : []

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1e293b', background: '#0d1117', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>📊</span>
            <span style={{ color: '#d4af37', fontWeight: 800, fontSize: 18 }}>ITS-R Dashboard</span>
            <span style={{ color: '#475569', fontSize: 14 }}>Control Room</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="https://its-r-portal.vercel.app" style={{ color: '#94a3b8', fontSize: 13, textDecoration: 'none' }}>Portal</a>
            <a href="https://its-r-monitor.vercel.app" style={{ color: '#94a3b8', fontSize: 13, textDecoration: 'none' }}>Monitor</a>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1400, margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: '#0d1117', border: '1px solid #1e293b', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {(['overview', 'services', 'users'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 20px', borderRadius: 8, border: 'none', background: tab === t ? '#1e293b' : 'transparent', color: tab === t ? '#e2e8f0' : '#64748b', fontWeight: tab === t ? 600 : 400, cursor: 'pointer', fontSize: 14, textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 12, height: 100, animation: 'pulse 1.5s ease-in-out infinite' }} />)}
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                  {statCards.map(s => (
                    <div key={s.label} style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 14, padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ color: '#64748b', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>{s.label.toUpperCase()}</div>
                          <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
                        </div>
                        <span style={{ fontSize: 24 }}>{s.icon}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status Distribution */}
                <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 14, padding: 28, marginBottom: 24 }}>
                  <h2 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Services by Status</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {stats && [
                      { label: 'Live', count: stats.services.live, color: '#34d399', total: stats.services.total },
                      { label: 'Coming Soon', count: stats.services.coming_soon, color: '#fbbf24', total: stats.services.total },
                      { label: 'Planned', count: stats.services.planned, color: '#94a3b8', total: stats.services.total },
                      { label: 'Down', count: stats.services.down, color: '#f87171', total: stats.services.total },
                    ].map(s => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 90, color: '#94a3b8', fontSize: 14 }}>{s.label}</div>
                        <div style={{ flex: 1, background: '#1e293b', borderRadius: 100, height: 8, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: s.color, width: `${Math.round((s.count / s.total) * 100)}%`, borderRadius: 100, transition: 'width 1s ease' }} />
                        </div>
                        <div style={{ width: 60, textAlign: 'right', color: s.color, fontWeight: 700, fontSize: 15 }}>{s.count.toLocaleString()}</div>
                        <div style={{ width: 40, color: '#475569', fontSize: 13 }}>{Math.round((s.count / s.total) * 100)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {tab === 'services' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} placeholder="Search services..."
                style={{ padding: '9px 16px', background: '#0d1117', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0', fontSize: 14, outline: 'none', flex: 1, minWidth: 200 }} />
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(0) }}
                style={{ padding: '9px 14px', background: '#0d1117', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0', fontSize: 14, outline: 'none' }}>
                <option value="">All Status</option>
                <option value="live">Live</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="planned">Planned</option>
                <option value="down">Down</option>
              </select>
              <span style={{ color: '#64748b', fontSize: 14, alignSelf: 'center' }}>{total.toLocaleString()} services</span>
            </div>

            <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}>
                    {['Icon', 'Name', 'Category', 'Status', 'URL', 'Action'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', color: '#64748b', fontWeight: 600, textAlign: 'left', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {services.map(svc => (
                    <tr key={svc.id} style={{ borderBottom: '1px solid rgba(30,41,59,0.5)' }}>
                      <td style={{ padding: '12px 16px', fontSize: 20 }}>{svc.icon || '🔷'}</td>
                      <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 500 }}>{svc.name}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{svc.category || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {editId === svc.id ? (
                          <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                            style={{ padding: '4px 8px', background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: 6, color: '#e2e8f0', fontSize: 13 }}>
                            <option value="live">Live</option>
                            <option value="coming_soon">Coming Soon</option>
                            <option value="planned">Planned</option>
                            <option value="down">Down</option>
                          </select>
                        ) : (
                          <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: STATUS_COLOR[svc.status]?.bg, color: STATUS_COLOR[svc.status]?.text }}>
                            {svc.status === 'coming_soon' ? 'Coming Soon' : svc.status?.charAt(0).toUpperCase() + svc.status?.slice(1)}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569', fontSize: 12, maxWidth: 200 }}>
                        {svc.url ? <a href={svc.url} target="_blank" rel="noopener" style={{ color: '#d4af37', textDecoration: 'none' }}>Link ↗</a> : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {editId === svc.id ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleSave(svc.id, editStatus)} disabled={saving}
                              style={{ padding: '4px 12px', background: '#d4af37', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                              {saving ? '...' : 'Save'}
                            </button>
                            <button onClick={() => setEditId('')}
                              style={{ padding: '4px 12px', background: 'transparent', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditId(svc.id); setEditStatus(svc.status) }}
                            style={{ padding: '4px 12px', background: 'transparent', color: '#64748b', border: '1px solid #1e293b', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {Math.ceil(total / 50) > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #1e293b' }}>
                  <span style={{ color: '#64748b', fontSize: 14 }}>Page {page + 1} of {Math.ceil(total / 50)}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                      style={{ padding: '6px 14px', background: '#0a0a0f', border: '1px solid #1e293b', color: '#e2e8f0', borderRadius: 6, cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1, fontSize: 13 }}>← Prev</button>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 50) - 1}
                      style={{ padding: '6px 14px', background: '#0a0a0f', border: '1px solid #1e293b', color: '#e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Next →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 14, padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>👥</div>
            <p style={{ color: '#94a3b8' }}>Users tab — connect to Passport service for user management</p>
            <a href="https://its-r-passport.vercel.app" style={{ display: 'inline-block', marginTop: 16, padding: '10px 24px', background: '#d4af37', color: '#000', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Go to Passport →</a>
          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid #1e293b', padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: '#475569', fontSize: 14 }}>ITS-R Universe</p>
        <p style={{ color: '#334155', fontSize: 12, marginTop: 4 }}>In loving memory of Roshan Ali Sahab</p>
      </footer>
    </div>
  )
}
