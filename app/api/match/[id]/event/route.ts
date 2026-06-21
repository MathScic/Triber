import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { recomputeScore, recomputePlayerStats } from '@/lib/match/compute'

function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

type EventRow = { organization_id: string; is_home: boolean | null }

async function verifyCoach(userId: string, eventId: string): Promise<EventRow | null> {
  const admin = getAdmin()
  const { data: ev } = await admin.from('events').select('organization_id, is_home').eq('id', eventId).maybeSingle()
  if (!ev) return null
  const { data: mem } = await admin.from('organization_members')
    .select('role').eq('user_id', userId).eq('organization_id', ev.organization_id as string).maybeSingle()
  if (!mem || !['admin', 'member_active'].includes(mem.role as string)) return null
  return ev as EventRow
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const ev = await verifyCoach(user.id, id)
  if (!ev) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { type, minute, playerId, assistPlayerId, playerNameFree } = await req.json() as {
    type: string; minute: number; playerId?: string; assistPlayerId?: string; playerNameFree?: string
  }

  const admin = getAdmin()
  const { error } = await admin.from('match_events').insert({
    event_id: id, type, minute,
    player_id: playerId ?? null,
    assist_player_id: assistPlayerId ?? null,
    player_name_free: playerNameFree ?? null,
  })
  if (error) return NextResponse.json({ error: 'Erreur insertion' }, { status: 500 })

  await recomputeScore(admin, id, ev.is_home)
  if (playerId) await recomputePlayerStats(admin, id, playerId)
  if (assistPlayerId && assistPlayerId !== playerId) await recomputePlayerStats(admin, id, assistPlayerId)

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const ev = await verifyCoach(user.id, id)
  if (!ev) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { matchEventId } = await req.json() as { matchEventId: string }
  const admin = getAdmin()

  const { data: me } = await admin.from('match_events').select('player_id, assist_player_id').eq('id', matchEventId).maybeSingle()
  await admin.from('match_events').delete().eq('id', matchEventId)

  await recomputeScore(admin, id, ev.is_home)
  const pid = me?.player_id as string | null
  const aid = me?.assist_player_id as string | null
  if (pid) await recomputePlayerStats(admin, id, pid)
  if (aid && aid !== pid) await recomputePlayerStats(admin, id, aid)

  return NextResponse.json({ success: true })
}
