import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe/client'
import { NextResponse } from 'next/server'

function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await request.json() as { label?: string; amount?: number; userId?: string }
  const { label, amount, userId } = body

  if (!label?.trim() || !amount || amount < 100) {
    return NextResponse.json({ error: 'Données invalides — montant minimum 1 €' }, { status: 400 })
  }

  const { data: mem } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!mem || !['admin', 'member_active'].includes(mem.role as string)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  // Admin peut créer pour un autre membre ; sinon la cotisation est pour l'appelant
  const targetUserId = (mem.role === 'admin' && userId) ? userId : user.id

  let pi
  try {
    pi = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      metadata: { organization_id: mem.organization_id as string, user_id: targetUserId },
    })
  } catch {
    return NextResponse.json({ error: 'Erreur création PaymentIntent Stripe' }, { status: 500 })
  }

  const admin = getAdmin()
  const { error: dbErr } = await admin.from('contributions').insert({
    organization_id: mem.organization_id,
    user_id: targetUserId,
    amount,
    label: label.trim(),
    status: 'pending',
    stripe_payment_id: pi.id,
  })

  if (dbErr) {
    await stripe.paymentIntents.cancel(pi.id)
    return NextResponse.json({ error: 'Erreur enregistrement cotisation' }, { status: 500 })
  }

  return NextResponse.json({ clientSecret: pi.client_secret })
}
