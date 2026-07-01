import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Appelé au retour de Stripe si le webhook n'a pas encore mis à jour le statut.
// Vérifie directement la session Stripe et met à jour contribution_payments.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { sessionId } = await request.json() as { sessionId?: string }
  if (!sessionId) return NextResponse.json({ error: 'sessionId manquant' }, { status: 400 })

  let session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return NextResponse.json({ error: 'Session Stripe introuvable' }, { status: 404 })
  }

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ paid: false })
  }

  const { paymentId, templateId, orgId, userId } = session.metadata ?? {}
  if (!templateId || !orgId) return NextResponse.json({ paid: true, updated: false })

  const admin = getAdmin()
  const now = new Date().toISOString()
  const amountCents = session.amount_total ?? 0

  if (paymentId) {
    // Met à jour uniquement si encore en attente (évite d'écraser un webhook déjà traité)
    await admin.from('contribution_payments')
      .update({ status: 'paid', amount_cents: amountCents, payment_method: 'stripe', paid_at: now })
      .eq('id', paymentId)
      .eq('status', 'pending')
  } else {
    // Vérifie que le webhook n'a pas déjà créé une ligne pour cette session
    const { data: existing } = await admin.from('contribution_payments')
      .select('id').eq('stripe_payment_id', session.payment_intent as string).maybeSingle()
    if (!existing) {
      await admin.from('contribution_payments').insert({
        template_id: templateId,
        organization_id: orgId,
        user_id: userId ?? null,
        amount_cents: amountCents,
        status: 'paid',
        payment_method: 'stripe',
        stripe_payment_id: session.payment_intent as string,
        paid_at: now,
      })
    }
  }

  return NextResponse.json({ paid: true, updated: true })
}
