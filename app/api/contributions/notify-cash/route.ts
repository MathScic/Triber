import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { sendCashReminderEmail } from '@/lib/email'

function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: mem } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!mem || !['admin', 'member_active'].includes(mem.role as string)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { memberName, templateTitle, amountCents } = await request.json() as {
    memberName: string
    templateTitle: string
    amountCents: number
  }

  if (!memberName || !templateTitle || !amountCents) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const admin = getAdmin()
  const [{ data: org }, { data: { user: caller } }] = await Promise.all([
    admin.from('organizations').select('name').eq('id', mem.organization_id as string).maybeSingle(),
    admin.auth.admin.getUserById(user.id),
  ])

  if (!caller?.email) return NextResponse.json({ error: 'Email introuvable' }, { status: 404 })

  await sendCashReminderEmail(caller.email, {
    memberName,
    templateTitle,
    amountCents,
    orgName: (org?.name as string) ?? 'Votre organisation',
  })

  return NextResponse.json({ success: true })
}
