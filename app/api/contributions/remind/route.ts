import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { sendPaymentReminderEmail } from '@/lib/email'

function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: caller } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!caller || !['admin', 'member_active'].includes(caller.role as string)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const body = await request.json() as {
    targetUserId?: string
    templateTitle?: string
    paidCents?: number
    expectedCents?: number
  }
  const { targetUserId, templateTitle, paidCents = 0, expectedCents = 0 } = body

  if (!targetUserId || !templateTitle) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const admin = getAdmin()

  // Récupère l'email du membre via Supabase Auth (service role requis)
  const { data: { user: targetUser } } = await admin.auth.admin.getUserById(targetUserId)
  if (!targetUser?.email) {
    return NextResponse.json({ error: 'Email du membre introuvable' }, { status: 404 })
  }

  // Récupère le nom de l'org et sa couleur
  const { data: org } = await admin
    .from('organizations')
    .select('name, primary_color')
    .eq('id', caller.organization_id)
    .maybeSingle()

  // Récupère le nom du membre
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', targetUserId)
    .maybeSingle()

  const { error } = await sendPaymentReminderEmail(targetUser.email, {
    memberName: (profile?.full_name as string) ?? targetUser.email,
    orgName: (org?.name as string) ?? 'Votre organisation',
    templateTitle,
    paidCents,
    expectedCents,
    primaryColor: (org?.primary_color as string) ?? '#2A9D4E',
  })

  if (error) {
    console.error('Reminder email error:', error)
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
