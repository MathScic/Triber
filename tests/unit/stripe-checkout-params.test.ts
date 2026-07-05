import { describe, it, expect } from 'vitest'
import { buildSubscriptionCheckoutParams } from '@/lib/stripe/checkout-params'

const base = { orgId: 'org-1', userId: 'user-1', userEmail: 'admin@club.fr', appUrl: 'https://triber.app' }

describe('buildSubscriptionCheckoutParams', () => {
  it('renseigne subscription_data.metadata.orgId — sans ça, l\'annulation Stripe ne peut pas downgrader le plan', () => {
    // Régression : Stripe ne copie PAS le metadata de la Checkout Session sur
    // l'objet Subscription. Sans ce champ, le webhook customer.subscription.deleted
    // ne retrouve pas orgId et le club reste bloqué sur le plan payant après résiliation.
    const params = buildSubscriptionCheckoutParams(base)
    expect(params.subscription_data?.metadata?.orgId).toBe('org-1')
  })

  it('renseigne aussi le metadata de session pour checkout.session.completed', () => {
    const params = buildSubscriptionCheckoutParams(base)
    expect(params.metadata).toEqual({ userId: 'user-1', orgId: 'org-1' })
  })

  it('pointe success_url et cancel_url vers /settings avec le bon appUrl', () => {
    const params = buildSubscriptionCheckoutParams(base)
    expect(params.success_url).toBe('https://triber.app/settings?upgraded=true')
    expect(params.cancel_url).toBe('https://triber.app/settings')
  })

  it('exige l\'acceptation des CGU Stripe', () => {
    const params = buildSubscriptionCheckoutParams(base)
    expect(params.consent_collection).toEqual({ terms_of_service: 'required' })
  })

  it('mode abonnement, paiement par carte', () => {
    const params = buildSubscriptionCheckoutParams(base)
    expect(params.mode).toBe('subscription')
    expect(params.payment_method_types).toEqual(['card'])
  })
})
