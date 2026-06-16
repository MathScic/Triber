import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Client service_role — bypass RLS pour les mises à jour déclenchées par Stripe
function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export function verifyWebhookSignature(body: string, signature: string): Stripe.Event {
  const s = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
  return s.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
}

export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  const admin = getAdmin()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      await admin
        .from('contributions')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('stripe_payment_id', pi.id)
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      await admin
        .from('contributions')
        .update({ status: 'failed' })
        .eq('stripe_payment_id', pi.id)
      break
    }

    default:
      break
  }
}
