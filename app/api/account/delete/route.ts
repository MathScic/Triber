import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { anonymizeUserData } from '@/lib/utils/gdpr'

function getAdminClient() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// RGPD — droit à l'oubli : supprime le compte de l'appelant (jamais un id fourni
// par le client). Action irréversible, confirmation explicite obligatoire.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await request.json().catch(() => null) as { confirm?: string } | null
  if (body?.confirm !== 'SUPPRIMER') {
    return NextResponse.json({ error: 'Confirmation requise' }, { status: 400 })
  }

  const admin = getAdminClient()

  // Garde-fou : impossible de supprimer si seul admin d'une organisation
  const { data: adminOf } = await admin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('role', 'admin')

  for (const { organization_id } of (adminOf ?? []) as { organization_id: string }[]) {
    const { count } = await admin
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id)
      .eq('role', 'admin')

    if ((count ?? 0) <= 1) {
      const { data: org } = await admin.from('organizations').select('name').eq('id', organization_id).single()
      const orgName = (org as { name?: string } | null)?.name ?? 'votre club'
      return NextResponse.json(
        { error: `Vous êtes le seul admin de ${orgName} : transférez le rôle ou supprimez le club d'abord.` },
        { status: 409 },
      )
    }
  }

  await anonymizeUserData(admin, user.id)

  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return NextResponse.json({ error: 'Erreur lors de la suppression du compte' }, { status: 500 })

  return NextResponse.json({ success: true })
}
