import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

async function verifyCoach(userId: string, eventId: string) {
  const admin = getAdmin()
  const { data: ev } = await admin.from('events').select('organization_id, is_home').eq('id', eventId).maybeSingle()
  if (!ev) return null
  const { data: mem } = await admin.from('organization_members')
    .select('role').eq('user_id', userId).eq('organization_id', ev.organization_id as string).maybeSingle()
  if (!mem || !['admin', 'member_active'].includes(mem.role as string)) return null
  return ev as { organization_id: string; is_home: boolean | null }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const ev = await verifyCoach(user.id, id)
  if (!ev) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { action } = await req.json() as { action: 'start' | 'end' }
  const admin = getAdmin()

  if (action === 'start') {
    await admin.from('events').update({ status: 'ongoing', started_at: new Date().toISOString() }).eq('id', id)
  } else if (action === 'end') {
    await admin.from('events').update({ status: 'finished' }).eq('id', id)
  } else {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
