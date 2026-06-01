'use client'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [dark, setDark] = useState(true)
  const [stats, setStats] = useState({ total: 2213, live: 0, down: 0, coming_soon: 0 })

  useEffect(() => {
    const t = localStorage.getItem('its-r-theme')
    const isDark = t !== 'light'
    setDark(isDark)
    if (!isDark) document.documentElement.setAttribute('data-theme', 'light')

    const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
    const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    fetch(`${URL}/rest/v1/its_r_services?select=status`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } })
      .then(r => r.json()).then(data => {
        if (!Array.isArray(data)) return
        const counts: Record<string,number> = {}
        data.forEach((s: any) => { counts[s.status] = (counts[s.status]||0)+1 })
        setStats({ total: data.length, live: counts.live||0, down: counts.down||0, coming_soon: counts.coming_soon||0 })
      }).catch(() => {})
  }, [])

  const toggleTheme = () => {
    const next = !dark; setDark(next)
    if (next) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('its-r-theme','dark') }
    else { document.documentElement.setAttribute('data-theme','light'); localStorage.setItem('its-r-theme','light') }
  }

  const links = [
    { name: 'Portal', url: 'https://its-r-portal.vercel.app', icon: '🌐' },
    { name: 'Passport', url: 'https://its-r-passport.vercel.app', icon: '🛂' },
    { name: 'SSO', url: 'https://its-r-sso.vercel.app', icon: '🔐' },
    { name: 'Monitor', url: 'https://its-r-monitor.vercel.app', icon: '📡' },
  ]

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:'system-ui,sans-serif'}}>
      <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1rem 2rem',borderBottom:'1px solid var(--border)'}}>
        <span style={{fontWeight:800,fontSize:'1.1rem'}}><span style={{color:'var(--gold)'}}>ITS-R</span> Dashboard</span>
        <button onClick={toggleTheme} style={{background:'var(--card)',border:'1px solid var(--border)',color:'var(--text)',padding:'0.4rem 0.75rem',borderRadius:'0.5rem',cursor:'pointer',fontSize:'0.8rem'}}>
          {dark?'☀️ Day':'🌙 Night'}
        </button>
      </nav>
      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'2rem'}}>
        <h1 style={{fontSize:'1.75rem',fontWeight:700,marginBottom:'2rem'}}>Command Center</h1>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
          {[['Total',stats.total,'var(--gold)'],['Live',stats.live,'#22c55e'],['Down',stats.down,'#ef4444'],['Coming Soon',stats.coming_soon,'#f59e0b']].map(([k,v,c])=>(
            <div key={k as string} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'0.75rem',padding:'1.25rem',textAlign:'center'}}>
              <div style={{fontSize:'2rem',fontWeight:800,color:c as string}}>{v as number}</div>
              <div style={{color:'var(--sub)',fontSize:'0.8rem',marginTop:'0.25rem'}}>{k as string}</div>
            </div>
          ))}
        </div>
        <h2 style={{fontSize:'1.1rem',fontWeight:600,marginBottom:'1rem'}}>Core Services</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'0.75rem'}}>
          {links.map(l=>(
            <a key={l.name} href={l.url} target="_blank" rel="noopener" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'0.625rem',padding:'1.25rem',textDecoration:'none',color:'var(--text)',display:'flex',alignItems:'center',gap:'0.75rem'}}>
              <span style={{fontSize:'1.5rem'}}>{l.icon}</span>
              <div>
                <div style={{fontWeight:600,fontSize:'0.9rem'}}>{l.name}</div>
                <div style={{fontSize:'0.7rem',color:'var(--sub)'}}>Open →</div>
              </div>
            </a>
          ))}
        </div>
      </div>
      <footer style={{textAlign:'center',padding:'2rem',borderTop:'1px solid var(--border)',color:'var(--sub)',fontSize:'0.75rem',marginTop:'3rem'}}>
        ITS-R Universe • In loving memory of Roshan Ali Sahab 🤲
      </footer>
    </div>
  )
}
