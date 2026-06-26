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

  const { type, minute, userId, assistUserId, isOwnTeam } = await req.json() as {
    type: string; minute: number; userId?: string; assistUserId?: string; isOwnTeam: boolean
  }

  const admin = getAdmin()

  // Récupère les noms pour compatibilité mobile (player_name lu en priorité par le mobile)
  const profileIds = [userId, assistUserId].filter(Boolean) as string[]
  const profileMap = new Map<string, string>()
  if (profileIds.length > 0) {
    const { data: profiles } = await admin.from('profiles').select('id, full_name').in('id', profileIds)
    for (const p of profiles ?? []) profileMap.set(p.id as string, (p.full_name as string | null) ?? '')
  }

  const { error } = await admin.from('match_actions').insert({
    event_id: id, type, minute, is_own_team: isOwnTeam,
    user_id: userId ?? null,
    player_name: userId ? (profileMap.get(userId) ?? null) : null,
  })
  if (error) return NextResponse.json({ error: 'Erreur insertion' }, { status: 500 })

  // Passe décisive : action séparée
  if (assistUserId && type === 'goal' && isOwnTeam) {
    await admin.from('match_actions').insert({
      event_id: id, type: 'assist', minute, is_own_team: true,
      user_id: assistUserId,
      player_name: profileMap.get(assistUserId) ?? null,
    })
  }

  await recomputeScore(admin, id, ev.is_home)
  if (userId) await recomputePlayerStats(admin, id, userId)
  if (assistUserId && assistUserId !== userId) await recomputePlayerStats(admin, id, assistUserId)

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const ev = await verifyCoach(user.id, id)
  if (!ev) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { matchActionId } = await req.json() as { matchActionId: string }
  const admin = getAdmin()
  const { data: ma } = await admin.from('match_actions').select('user_id, type').eq('id', matchActionId).maybeSingle()
  await admin.from('match_actions').delete().eq('id', matchActionId)

  await recomputeScore(admin, id, ev.is_home)
  const uid = ma?.user_id as string | null
  if (uid) await recomputePlayerStats(admin, id, uid)

  return NextResponse.json({ success: true })
}
