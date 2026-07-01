import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { canAddMember, planLimitMessage } from '@/lib/utils/plan-limits'

function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(request: Request) {
  // Authentification par token Bearer — compatible app mobile et dashboard web
  const token = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const admin = getAdmin()
  const { data: { user } } = await admin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await request.json() as { invite_code?: string; role?: string }
  const { invite_code, role = 'member' } = body

  if (!invite_code?.trim() || !['admin', 'member_active', 'member'].includes(role)) {
    return NextResponse.json({ error: 'Code invalide' }, { status: 400 })
  }

  // Vérifie que l'appelant est admin de son organisation
  const { data: membership } = await admin
    .from('organization_members').select('organization_id')
    .eq('user_id', user.id).eq('role', 'admin').maybeSingle()
  if (!membership) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const orgId = membership.organization_id as string

  // Vérifie les limites de plan
  const { data: org } = await admin.from('organizations').select('plan').eq('id', orgId).single()
  const { count } = await admin.from('organization_members').select('*', { count: 'exact', head: true }).eq('organization_id', orgId)
  const plan = (org?.plan as string) ?? 'free'
  if (!canAddMember(plan, count ?? 0)) {
    return NextResponse.json({ error: planLimitMessage(plan) }, { status: 403 })
  }

  // Cherche le profil par invite_code
  const { data: profile } = await admin
    .from('profiles').select('id').eq('invite_code', invite_code.trim().toUpperCase()).maybeSingle()
  if (!profile) return NextResponse.json({ error: 'Code introuvable — vérifiez le code saisi' }, { status: 404 })

  // Vérifie que l'utilisateur n'est pas déjà membre
  const { data: existing } = await admin
    .from('organization_members').select('id')
    .eq('organization_id', orgId).eq('user_id', profile.id).maybeSingle()
  if (existing) return NextResponse.json({ error: 'Cet utilisateur est déjà membre' }, { status: 409 })

  // Ajoute le membre
  const { error: insertErr } = await admin
    .from('organization_members').insert({ organization_id: orgId, user_id: profile.id, role })
  if (insertErr) return NextResponse.json({ error: 'Erreur ajout membre' }, { status: 500 })

  return NextResponse.json({ success: true })
}
