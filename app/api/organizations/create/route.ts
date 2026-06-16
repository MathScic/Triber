import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Client service_role : bypass RLS pour les insertions critiques
function getAdminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: Request) {
  console.log('API create org appelée')

  // Récupère l'utilisateur connecté via session cookie
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.log('Erreur : utilisateur non authentifié')
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await request.json()
  const { name, type, slogan } = body as { name?: string; type?: string; slogan?: string }

  if (!name?.trim() || !['club', 'enterprise'].includes(type ?? '')) {
    console.log('Erreur : données invalides', { name, type })
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const admin = getAdminClient()

  // Vérifie la limite : 1 organisation créée (rôle admin) par compte
  const { data: existing, error: existingError } = await admin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  console.log('Org existante :', existing, '| Erreur check :', existingError?.message)

  if (existing) {
    return NextResponse.json(
      { error: 'Vous gérez déjà une organisation avec ce compte. Contactez-nous pour une configuration multi-organisations.' },
      { status: 409 },
    )
  }

  // Crée l'organisation
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({
      name: name.trim(),
      type,
      plan: 'free',
      member_count: 0,
      ...(slogan?.trim() ? { slogan: slogan.trim() } : {}),
    })
    .select()
    .single()

  console.log('Org créée :', org, '| Erreur création :', orgError?.message)

  if (orgError || !org) {
    return NextResponse.json({ error: orgError?.message ?? 'Erreur serveur' }, { status: 500 })
  }

  // Ajoute le créateur comme admin (service_role — pas de session requise)
  const { error: memberError } = await admin
    .from('organization_members')
    .insert({ organization_id: org.id, user_id: user.id, role: 'admin' })

  if (memberError) {
    console.log('Erreur ajout membre :', memberError.message)
    // Rollback : supprime l'org si l'ajout du membre échoue
    await admin.from('organizations').delete().eq('id', org.id)
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  return NextResponse.json({ organization: org }, { status: 201 })
}
