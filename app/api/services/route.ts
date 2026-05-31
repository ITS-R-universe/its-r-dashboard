import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get('page') || '0')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50')
    const search = req.nextUrl.searchParams.get('search') || ''
    const status = req.nextUrl.searchParams.get('status') || ''
    const category = req.nextUrl.searchParams.get('category') || ''

    let query = supabaseAdmin.from('its_r_services').select('*', { count: 'exact' })
    if (search) query = query.ilike('name', `%${search}%`)
    if (status) query = query.eq('status', status)
    if (category) query = query.eq('category', category)
    query = query.order('sort_order', { ascending: true }).range(page * limit, (page + 1) * limit - 1)

    const { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data, count, page, limit })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const { data, error } = await supabaseAdmin.from('its_r_services').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
