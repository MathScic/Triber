import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendInviteEmail } from '@/lib/email'

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

async function getOrCreateInviteCode(admin: ReturnType<typeof getAdmin>, userId: string): Promise<string> {
  const { data } = await admin.from('profiles').select('invite_code').eq('id', userId).maybeSingle()
  const existing = (data?.invite_code as string) ?? null
  if (existing) return existing
  // Génère et sauvegarde un code s'il n'existe pas
  const code = generateCode()
  await admin.from('profiles').upsert({ id: userId, invite_code: code }, { onConflict: 'id' })
  return code
}

async function getInviteCode(admin: ReturnType<typeof getAdmin>, token: string | null, orgId: string): Promise<string | null> {
  if (token) {
    const { data: { user } } = await admin.auth.getUser(token)
    if (user) return getOrCreateInviteCode(admin, user.id)
  }
  const { data: member } = await admin
    .from('organization_members').select('user_id')
    .eq('organization_id', orgId).eq('role', 'admin').limit(1).maybeSingle()
  if (!member) return null
  return getOrCreateInviteCode(admin, member.user_id as string)
}

async function getOrgBranding(admin: ReturnType<typeof getAdmin>, orgId: string) {
  const { data } = await admin
    .from('organizations').select('name, primary_color').eq('id', orgId).maybeSingle()
  return { name: (data?.name as string) ?? '', primaryColor: (data?.primary_color as string) ?? '#2A9D4E' }
}

export async function POST(request: Request) {
  const body = await request.json() as { contact?: string; email?: string; orgName?: string; orgId?: string }
  const email = ((body.email ?? body.contact) ?? '').trim()
  const { orgName, orgId } = body

  if (!email || !orgName || !orgId) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  if (!email.includes('@')) {
    return NextResponse.json({ success: true, contact: email, method: 'sms' })
  }

  const token = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim() || null
  const admin = getAdmin()
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

  const [inviteCode, branding] = await Promise.all([
    getInviteCode(admin, token, orgId),
    getOrgBranding(admin, orgId),
  ])

  if (!inviteCode) {
    return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 })
  }

  const joinUrl = `${appUrl}/join/${inviteCode}?org=${orgId}`
  const { error } = await sendInviteEmail(email, {
    orgName: branding.name || orgName,
    inviterName: 'L\'équipe Triber',
    inviteUrl: joinUrl,
    primaryColor: branding.primaryColor,
  })

  if (error) {
    console.error('RESEND ERROR:', error)
    const msg = (error as { message?: string })?.message ?? 'Erreur envoi email'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }

  return NextResponse.json({ success: true, contact: email, method: 'email' })
}
