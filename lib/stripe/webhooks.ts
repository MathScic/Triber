import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const STRIPE_API_VERSION = '2026-02-25.clover' as const

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: STRIPE_API_VERSION })
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function safeUpdate(label: string, op: PromiseLike<{ error: { message: string } | null }>) {
  const { error } = await op
  if (error) console.error(`[webhook] ${label}:`, error.message)
}

export function verifyWebhookSignature(body: string, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
}

export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const { paymentId, templateId, orgId, userId } = session.metadata ?? {}
      if (!templateId || !orgId) break

      const now = new Date().toISOString()
      const amountCents = session.amount_total ?? 0

      if (paymentId) {
        await safeUpdate('checkout.update_payment',
          admin.from('contribution_payments')
            .update({ status: 'paid', amount_cents: amountCents, payment_method: 'stripe', paid_at: now, paid_by: null })
            .eq('id', paymentId)
        )
      } else {
        await safeUpdate('checkout.insert_payment',
          admin.from('contribution_payments').insert({
            template_id: templateId,
            organization_id: orgId,
            user_id: userId ?? null,
            amount_cents: amountCents,
            status: 'paid',
            payment_method: 'stripe',
            paid_at: now,
            paid_by: null,
          })
        )
      }

      if (session.mode === 'subscription') {
        await safeUpdate('checkout.upgrade_plan',
          admin.from('organizations').update({ plan: 'club' }).eq('id', orgId)
        )
      }
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const orgId = sub.metadata?.orgId
      if (orgId && sub.status === 'active') {
        await safeUpdate('subscription.activate',
          admin.from('organizations').update({ plan: 'club' }).eq('id', orgId)
        )
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const orgId = sub.metadata?.orgId
      if (orgId) {
        await safeUpdate('subscription.cancel',
          admin.from('organizations').update({ plan: 'free' }).eq('id', orgId)
        )
      }
      break
    }

    default:
      break
  }
}
