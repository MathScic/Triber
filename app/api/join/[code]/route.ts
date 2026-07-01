import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { canAddMember } from '@/lib/utils/plan-limits'

function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

type AdminClient = ReturnType<typeof getAdmin>
type OrgRow = { id: string; name: string; type: string; plan: string }

async function findOrgByCode(admin: AdminClient, code: string): Promise<OrgRow | null> {
  const { data: pData } = await admin.from('profiles').select('id').eq('invite_code', code).maybeSingle()
  const p = pData as { id: string } | null
  if (!p) return null

  const { data: mData } = await admin
    .from('organization_members').select('organization_id')
    .eq('user_id', p.id).eq('role', 'admin').maybeSingle()
  const m = mData as { organization_id: string } | null
  if (!m) return null

  const { data: orgData } = await admin
    .from('organizations').select('id, name, type, plan').eq('id', m.organization_id).single()
  return (orgData as OrgRow) ?? null
}

async function resolveOrg(admin: AdminClient, code: string, orgId: string | null): Promise<OrgRow | null> {
  if (orgId) {
    // orgId fourni directement dans l'URL → on l'utilise (plus précis, évite l'ambiguïté multi-org)
    const { data } = await admin.from('organizations').select('id, name, type, plan').eq('id', orgId).single()
    return (data as OrgRow) ?? null
  }
  return findOrgByCode(admin, code.toUpperCase())
}

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const orgId = new URL(req.url).searchParams.get('org')
  const admin = getAdmin()
  const org = await resolveOrg(admin, code, orgId)
  if (!org) return NextResponse.json({ error: 'Lien invalide ou organisation introuvable' }, { status: 404 })
  return NextResponse.json({ org: { id: org.id, name: org.name, type: org.type } })
}

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const orgId = new URL(req.url).searchParams.get('org')
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const admin = getAdmin()
  const { data: { user } } = await admin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const org = await resolveOrg(admin, code, orgId)
  if (!org) return NextResponse.json({ error: 'Code invalide' }, { status: 404 })

  // Vérifie les limites de plan en comptant les membres actuels
  const { count } = await admin
    .from('organization_members').select('*', { count: 'exact', head: true }).eq('organization_id', org.id)
  if (!canAddMember(org.plan, count ?? 0)) {
    return NextResponse.json({ error: "Limite de membres atteinte. Contactez l'administrateur." }, { status: 403 })
  }

  // Vérifie que l'utilisateur n'est pas déjà membre
  const { data: exData } = await admin
    .from('organization_members').select('id').eq('organization_id', org.id).eq('user_id', user.id).maybeSingle()
  if (exData) return NextResponse.json({ error: 'Vous êtes déjà membre de cette organisation.' }, { status: 409 })

  const { error } = await admin
    .from('organization_members').insert({ organization_id: org.id, user_id: user.id, role: 'member' })
  if (error) return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })

  return NextResponse.json({ success: true })
}
