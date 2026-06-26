import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await request.json() as {
    paymentId?: string
    templateId?: string
    amountCents?: number
    memberName?: string
    templateTitle?: string
    returnUrl?: string
  }
  const { paymentId, templateId, amountCents, memberName, templateTitle, returnUrl } = body

  if (!templateId || !amountCents || amountCents < 100) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const { data: mem } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!mem) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: amountCents,
        product_data: { name: templateTitle ?? 'Cotisation', description: memberName ?? undefined },
      },
      quantity: 1,
    }],
    success_url: `${appUrl}${returnUrl ?? `/finances/${templateId}`}?paid=1`,
    cancel_url: `${appUrl}${returnUrl ?? `/finances/${templateId}`}`,
    customer_email: user.email,
    metadata: {
      paymentId: paymentId ?? '',
      templateId,
      orgId: mem.organization_id as string,
      userId: user.id,
    },
  })

  return NextResponse.json({ url: session.url })
}
