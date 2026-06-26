import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

type EvRow = {
  organization_id: string; is_home: boolean | null
  started_at: string | null; paused_at: string | null; total_paused_seconds: number | null
}

async function verifyCoach(userId: string, eventId: string): Promise<EvRow | null> {
  const admin = getAdmin()
  const { data: ev } = await admin.from('events')
    .select('organization_id, is_home, started_at, paused_at, total_paused_seconds')
    .eq('id', eventId).maybeSingle()
  if (!ev) return null
  const { data: mem } = await admin.from('organization_members')
    .select('role').eq('user_id', userId).eq('organization_id', ev.organization_id as string).maybeSingle()
  if (!mem || !['admin', 'member_active'].includes(mem.role as string)) return null
  return ev as EvRow
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const ev = await verifyCoach(user.id, id)
  if (!ev) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { action } = await req.json() as { action: 'start' | 'half_time' | 'resume' | 'end' }
  const admin = getAdmin()
  const now = new Date().toISOString()

  if (action === 'start') {
    await admin.from('events').update({
      status: 'ongoing', started_at: now, paused_at: null, total_paused_seconds: 0,
    }).eq('id', id)
  } else if (action === 'half_time') {
    // Enregistre le moment de la pause — le chrono se fige côté client
    await admin.from('events').update({
      status: 'half_time', paused_at: now,
    }).eq('id', id)
  } else if (action === 'resume') {
    // Cumule les secondes de pause écoulées depuis paused_at
    const pausedAt = ev.paused_at ? new Date(ev.paused_at).getTime() : null
    const additional = pausedAt ? Math.floor((Date.now() - pausedAt) / 1000) : 0
    const newTotal = (ev.total_paused_seconds ?? 0) + additional
    await admin.from('events').update({
      status: 'ongoing', paused_at: null, total_paused_seconds: newTotal,
    }).eq('id', id)
  } else if (action === 'end') {
    // Si le match était en pause, cumule le dernier segment
    const pausedAt = ev.paused_at ? new Date(ev.paused_at).getTime() : null
    const additional = pausedAt ? Math.floor((Date.now() - pausedAt) / 1000) : 0
    const newTotal = (ev.total_paused_seconds ?? 0) + additional
    await admin.from('events').update({
      status: 'finished', paused_at: null, total_paused_seconds: newTotal,
    }).eq('id', id)
  } else {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
