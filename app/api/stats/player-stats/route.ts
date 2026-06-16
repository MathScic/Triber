import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

type Body = {
  eventId?: string; userId?: string
  goals?: number; assists?: number; minutes_played?: number
  yellow_cards?: number; red_cards?: number
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { eventId, userId, ...stats } = await request.json() as Body
  if (!eventId || !userId) {
    return NextResponse.json({ error: 'eventId et userId requis' }, { status: 400 })
  }

  const admin = getAdminClient()

  // Vérifie que l'appelant est admin ou member_active
  const { data: event } = await admin.from('events')
    .select('organization_id').eq('id', eventId).single()
  if (!event) return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 })

  const { data: membership } = await admin.from('organization_members')
    .select('role').eq('user_id', user.id).eq('organization_id', event.organization_id).single()
  if (!membership || !['admin', 'member_active'].includes(membership.role as string)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  // Upsert des stats (une ligne par joueur par match)
  const { error: upsertError } = await admin.from('player_stats').upsert(
    {
      event_id: eventId, user_id: userId,
      goals: stats.goals ?? 0, assists: stats.assists ?? 0,
      minutes_played: stats.minutes_played ?? 0,
      yellow_cards: stats.yellow_cards ?? 0, red_cards: stats.red_cards ?? 0,
    },
    { onConflict: 'event_id,user_id' },
  )
  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 })

  return NextResponse.json({ success: true }, { status: 200 })
}
