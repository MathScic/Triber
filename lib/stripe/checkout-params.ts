import type Stripe from 'stripe'

// Construction pure des paramètres de la Checkout Session d'abonnement —
// isolée de lib/stripe/client.ts (qui exige STRIPE_SECRET_KEY au chargement)
// pour rester testable sans clé Stripe.
export function buildSubscriptionCheckoutParams(params: {
  orgId: string
  userId: string
  userEmail: string | undefined
  appUrl: string
}): Stripe.Checkout.SessionCreateParams {
  const { orgId, userId, userEmail, appUrl } = params

  return {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRICE_CLUB!, quantity: 1 }],
    success_url: `${appUrl}/settings?upgraded=true`,
    cancel_url: `${appUrl}/settings`,
    customer_email: userEmail,
    metadata: { userId, orgId },
    // Le metadata de la session n'est PAS copié automatiquement sur l'objet
    // Subscription créé par Stripe — sans subscription_data.metadata, le
    // webhook customer.subscription.deleted (annulation) ne peut pas
    // retrouver orgId et le club reste bloqué sur le plan payant
    subscription_data: { metadata: { orgId } },
    consent_collection: { terms_of_service: 'required' },
  }
}
