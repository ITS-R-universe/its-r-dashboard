import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const [svcRes, usersRes, catRes, monRes] = await Promise.all([
      supabaseAdmin.from('its_r_services').select('status', { count: 'exact' }),
      supabaseAdmin.from('its_r_users').select('created_at, email_verified', { count: 'exact' }),
      supabaseAdmin.from('its_r_categories').select('slug, name', { count: 'exact' }),
      supabaseAdmin.from('its_r_monitor_checks').select('status, checked_at, response_time_ms').order('checked_at', { ascending: false }).limit(100),
    ])

    const services = svcRes.data || []
    const users = usersRes.data || []
    const monitors = monRes.data || []

    const stats = {
      services: {
        total: svcRes.count || 0,
        live: services.filter(s => s.status === 'live').length,
        coming_soon: services.filter(s => s.status === 'coming_soon').length,
        planned: services.filter(s => s.status === 'planned').length,
        down: services.filter(s => s.status === 'down').length,
      },
      users: {
        total: usersRes.count || 0,
        verified: users.filter(u => u.email_verified).length,
        unverified: users.filter(u => !u.email_verified).length,
        today: users.filter(u => new Date(u.created_at) > new Date(Date.now() - 86400000)).length,
      },
      categories: { total: catRes.count || 0 },
      monitor: {
        total_checks: monitors.length,
        up: monitors.filter(m => m.status === 'up').length,
        down: monitors.filter(m => m.status === 'down').length,
        avg_response_ms: monitors.length > 0 ? Math.round(monitors.reduce((sum, m) => sum + (m.response_time_ms || 0), 0) / monitors.length) : 0,
      }
    }
    return NextResponse.json(stats)
  } catch {
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
