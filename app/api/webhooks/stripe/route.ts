import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, handleWebhookEvent } from '@/lib/stripe/webhooks'

// Next.js App Router : le body brut est accessible via request.text() sans configuration
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  let event
  try {
    event = verifyWebhookSignature(body, signature)
  } catch {
    return NextResponse.json({ error: 'Signature webhook invalide' }, { status: 400 })
  }

  try {
    await handleWebhookEvent(event)
    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Erreur traitement webhook' }, { status: 500 })
  }
}
