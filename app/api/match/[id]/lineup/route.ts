import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

async function verifyCoach(userId: string, eventId: string): Promise<boolean> {
  const admin = getAdmin()
  const { data: ev } = await admin.from('events').select('organization_id').eq('id', eventId).maybeSingle()
  if (!ev) return false
  const { data: mem } = await admin.from('organization_members')
    .select('role').eq('user_id', userId).eq('organization_id', ev.organization_id as string).maybeSingle()
  return mem != null && ['admin', 'member_active'].includes(mem.role as string)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  if (!await verifyCoach(user.id, id)) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { orgMemberId, isStarter } = await req.json() as { orgMemberId: string; isStarter: boolean }
  const admin = getAdmin()
  const { error } = await admin.from('match_lineups').upsert(
    { event_id: id, organization_member_id: orgMemberId, is_starter: isStarter },
    { onConflict: 'event_id,organization_member_id' },
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  if (!await verifyCoach(user.id, id)) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { orgMemberId } = await req.json() as { orgMemberId: string }
  const admin = getAdmin()
  await admin.from('match_lineups').delete()
    .eq('event_id', id).eq('organization_member_id', orgMemberId)
  return NextResponse.json({ success: true })
}
