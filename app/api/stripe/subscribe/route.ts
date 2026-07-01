import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Consentement à la commission de 1,5% — obligatoire, vérifié côté serveur
  // (la case à cocher client ne suffit pas : sans ce contrôle, l'appel API
  // pourrait être fait directement en contournant l'UI)
  const body = await request.json().catch(() => null) as { consent?: boolean } | null
  if (body?.consent !== true) {
    return NextResponse.json({ error: 'Le consentement à la commission est obligatoire' }, { status: 400 })
  }

  const { data: mem } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  if (!mem) return NextResponse.json({ error: 'Organisation introuvable' }, { status: 403 })

  // Trace horodatée du consentement — obligation légale (CLAUDE.md §1)
  // Échec bloquant : impossible de garantir la conformité sans cette ligne
  const { error: consentError } = await supabase.from('commission_consents').insert({
    organization_id: mem.organization_id,
    user_id: user.id,
  })
  if (consentError) {
    return NextResponse.json({ error: 'Impossible d\'enregistrer le consentement' }, { status: 500 })
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRICE_CLUB!, quantity: 1 }],
    success_url: `${appUrl}/settings?upgraded=true`,
    cancel_url: `${appUrl}/settings`,
    customer_email: user.email,
    metadata: { userId: user.id, orgId: mem.organization_id },
    consent_collection: { terms_of_service: 'required' },
  })

  return NextResponse.json({ url: session.url })
}
