import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { anonymizeUserData, findBlockingSoleAdminOrg } from '@/lib/utils/gdpr-delete'
import { rateLimitResponse } from '@/lib/utils/rate-limit'

function getAdminClient() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// RGPD — droit à l'oubli : supprime le compte de l'appelant (jamais un id fourni
// par le client). Action irréversible, confirmation explicite obligatoire.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  // Par compte, pas par IP — limite les tentatives répétées sur une action irréversible
  const limited = rateLimitResponse(`account-delete:${user.id}`, 5, 15 * 60_000)
  if (limited) return limited

  const body = await request.json().catch(() => null) as { confirm?: string } | null
  if (body?.confirm !== 'SUPPRIMER') {
    return NextResponse.json({ error: 'Confirmation requise' }, { status: 400 })
  }

  const admin = getAdminClient()

  const blockingOrg = await findBlockingSoleAdminOrg(admin, user.id)
  if (blockingOrg) {
    return NextResponse.json(
      { error: `Vous êtes le seul admin de ${blockingOrg} : transférez le rôle ou supprimez le club d'abord.` },
      { status: 409 },
    )
  }

  await anonymizeUserData(admin, user.id)

  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return NextResponse.json({ error: 'Erreur lors de la suppression du compte' }, { status: 500 })

  return NextResponse.json({ success: true })
}
