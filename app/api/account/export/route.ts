import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { collectUserData } from '@/lib/utils/gdpr-export'

// RGPD — droit à la portabilité : exporte toutes les données personnelles de
// l'utilisateur connecté. Le client Supabase server (session cookie) applique
// les RLS ; les filtres explicites dans collectUserData garantissent en plus
// qu'aucune donnée d'un autre membre n'est jamais incluse.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const donnees = await collectUserData(supabase, user.id)

  const payload = {
    exporte_le: new Date().toISOString(),
    utilisateur: { id: user.id, email: user.email },
    donnees,
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="mes-donnees-triber.json"',
    },
  })
}
