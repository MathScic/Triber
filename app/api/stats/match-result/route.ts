import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await request.json() as { eventId?: string; scoreHome?: number; scoreAway?: number }
  const { eventId, scoreHome, scoreAway } = body
  if (!eventId || scoreHome === undefined || scoreAway === undefined) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const admin = getAdminClient()

  // Vérifie que l'événement existe et est de type match
  const { data: event } = await admin.from('events')
    .select('organization_id, type').eq('id', eventId).single()
  if (!event) return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 })
  if (event.type !== 'match') {
    return NextResponse.json({ error: "L'événement n'est pas un match" }, { status: 400 })
  }

  // Vérifie que l'appelant est admin ou member_active
  const { data: membership } = await admin.from('organization_members')
    .select('role').eq('user_id', user.id).eq('organization_id', event.organization_id).single()
  if (!membership || !['admin', 'member_active'].includes(membership.role as string)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  // Upsert du résultat (un seul résultat par match)
  const { error: upsertError } = await admin.from('match_results').upsert(
    { event_id: eventId, score_home: scoreHome, score_away: scoreAway, entered_by: user.id },
    { onConflict: 'event_id' },
  )
  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 })

  return NextResponse.json({ success: true }, { status: 200 })
}
