'use client'

import { useState, useEffect, useRef } from 'react'
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js'
import { useFinances } from '@/lib/hooks/useFinances'
import { Button } from '@/components/ui/button'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Props { onCreated?: () => void }

export function PaymentForm({ onCreated }: Props) {
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const stripeRef = useRef<Stripe | null>(null)
  const elementsRef = useRef<StripeElements | null>(null)
  const { createContribution, loading, error } = useFinances()

  useEffect(() => {
    if (!clientSecret) return
    ;(async () => {
      const s = await stripePromise
      if (!s) return
      stripeRef.current = s
      const elements = s.elements({ clientSecret })
      elementsRef.current = elements
      elements.create('payment').mount('#stripe-payment-element')
    })()
  }, [clientSecret])

  const handleCreate = async () => {
    const euros = parseFloat(amount)
    if (!label.trim() || isNaN(euros) || euros <= 0) return
    const result = await createContribution(label.trim(), Math.round(euros * 100))
    if (result?.clientSecret) setClientSecret(result.clientSecret)
  }

  const handlePay = async () => {
    if (!stripeRef.current || !elementsRef.current) return
    setPaying(true); setPayError(null)
    const { error: err } = await stripeRef.current.confirmPayment({
      elements: elementsRef.current,
      confirmParams: { return_url: `${window.location.origin}/finances` },
    })
    if (err) { setPayError(err.message ?? 'Erreur paiement'); setPaying(false) }
    else { setClientSecret(null); onCreated?.() }
  }

  if (clientSecret) {
    return (
      <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-5 space-y-4">
        <p className="text-sm font-semibold text-brand-dark font-[family-name:var(--font-nunito)]">Payer — {label}</p>
        <div id="stripe-payment-element" />
        {payError && <p className="text-xs text-red-500">{payError}</p>}
        <Button onClick={handlePay} disabled={paying} className="w-full">
          {paying ? 'Traitement…' : 'Payer maintenant'}
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-5 space-y-4">
      <h2 className="font-[700] text-brand-dark text-base uppercase tracking-tight font-[family-name:var(--font-barlow)]">
        Nouvelle cotisation
      </h2>
      <input value={label} onChange={e => setLabel(e.target.value)}
        placeholder="ex : Cotisation 2026-2027"
        className="w-full h-10 px-3 rounded-xl border border-[#D1D1D6] text-sm bg-brand-bg focus:outline-none focus:border-primary font-[family-name:var(--font-nunito)]" />
      <div className="flex items-center gap-2">
        <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)}
          placeholder="80"
          className="w-28 h-10 px-3 rounded-xl border border-[#D1D1D6] text-sm bg-brand-bg focus:outline-none focus:border-primary" />
        <span className="text-sm text-[#6B7280]">€</span>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button type="button" onClick={handleCreate} disabled={loading} className="w-full">
        {loading ? 'Création…' : 'Créer la cotisation'}
      </Button>
    </div>
  )
}
