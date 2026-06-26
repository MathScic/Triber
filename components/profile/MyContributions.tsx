'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Tarif = { category: string; amount_cents: number }
type Template = { id: string; title: string; description: string | null; tarifs: Tarif[] }
type Payment = {
  id: string; template_id: string; amount_cents: number
  status: string; paid_at: string | null
  payment_method: string | null; paid_by: string | null
}

interface Props { userId: string; orgId: string; justPaid?: boolean }

export function MyContributions({ userId, orgId, justPaid }: Props) {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [category, setCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState<string | null>(null)
  const justPaidHandled = useRef(false)

  const load = useCallback(async () => {
    const s = createClient()
    const [{ data: tpls }, { data: pmts }, { data: mem }] = await Promise.all([
      s.from('contribution_templates')
        .select('id,title,description,contribution_tarifs(category,amount_cents)')
        .eq('organization_id', orgId).eq('is_active', true).order('created_at'),
      s.from('contribution_payments')
        .select('id,template_id,amount_cents,status,paid_at,payment_method,paid_by')
        .eq('user_id', userId),
      s.from('organization_members').select('category').eq('user_id', userId).eq('organization_id', orgId).maybeSingle(),
    ])
    setCategory((mem?.category as string) ?? null)
    setTemplates((tpls ?? []).map((t: Record<string, unknown>) => ({
      id: t.id as string, title: t.title as string, description: t.description as string | null,
      tarifs: (t.contribution_tarifs as Tarif[] | null) ?? [],
    })))
    setPayments((pmts ?? []) as Payment[])
    setLoading(false)
  }, [userId, orgId])

  useEffect(() => { void load() }, [load])

  // Retour depuis Stripe avec ?paid=1 → marquer le paiement en attente de validation si webhook pas encore passé
  useEffect(() => {
    if (!justPaid || justPaidHandled.current || loading) return
    justPaidHandled.current = true
    const s = createClient()

    const markStripeAwaiting = async () => {
      for (const t of templates) {
        const existing = payments.find(p => p.template_id === t.id)
        // Pas encore marqué payé → le webhook n'a pas encore tourné → on met à jour nous-mêmes
        if (!existing || existing.status !== 'paid') {
          const expected = getAmount(t.tarifs)
          if (expected === 0) continue
          if (existing) {
            await s.from('contribution_payments').update({
              status: 'paid', payment_method: 'stripe', paid_by: null,
              amount_cents: expected, paid_at: new Date().toISOString(),
            }).eq('id', existing.id)
          } else {
            await s.from('contribution_payments').insert({
              template_id: t.id, organization_id: orgId, user_id: userId,
              amount_cents: expected, status: 'paid',
              payment_method: 'stripe', paid_by: null,
              paid_at: new Date().toISOString(),
            })
          }
        }
      }
      await load()
      // Nettoyer le ?paid=1 de l'URL
      router.replace('/profile')
    }
    void markStripeAwaiting()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justPaid, loading])

  const getAmount = (tarifs: Tarif[]): number => {
    if (tarifs.length === 0) return 0
    const match = tarifs.find(t => t.category === category)
    return match?.amount_cents ?? tarifs[0].amount_cents
  }

  const pay = async (template: Template) => {
    const amountCents = getAmount(template.tarifs)
    if (!amountCents) { alert('Montant non défini pour votre catégorie'); return }
    setPaying(template.id)
    const s = createClient()
    const { data: { session } } = await s.auth.getSession()
    const pmt = payments.find(p => p.template_id === template.id)
    const paidSoFar = pmt?.amount_cents ?? 0
    const remaining = Math.max(amountCents - paidSoFar, amountCents)
    const resp = await fetch('/api/contributions/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` },
      body: JSON.stringify({
        paymentId: pmt?.id ?? '',
        templateId: template.id,
        amountCents: remaining,
        templateTitle: template.title,
        returnUrl: '/profile',
      }),
    })
    const d = await resp.json() as { url?: string; error?: string }
    if (d.url) window.location.href = d.url
    else { alert(d.error ?? 'Erreur paiement'); setPaying(null) }
  }

  if (loading) return <div className="bg-white rounded-2xl border border-[#D1D1D6] h-32 animate-pulse" />
  if (templates.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-[#D1D1D6] p-6 space-y-4">
      <h2 className="text-base font-[700] text-[#1A1F16] font-[family-name:var(--font-barlow)] uppercase tracking-wide">
        Mes cotisations
      </h2>

      <div className="space-y-3">
        {templates.map(t => {
          const pmt = payments.find(p => p.template_id === t.id)
          const expected = getAmount(t.tarifs)
          const awaitingValidation = pmt?.status === 'paid' && pmt.payment_method === 'stripe' && pmt.paid_by === null
          const fullyPaid = pmt?.status === 'paid' && !awaitingValidation && (!expected || (pmt.amount_cents ?? 0) >= expected)
          const partial = pmt?.status === 'paid' && !awaitingValidation && expected > 0 && (pmt.amount_cents ?? 0) < expected
          const remaining = expected - (pmt?.amount_cents ?? 0)

          return (
            <div key={t.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[#E5E7EB]">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[#1A1F16] font-[family-name:var(--font-nunito)]">{t.title}</p>
                {expected > 0 && (
                  <p className="text-xs text-[#6B7280] mt-0.5 font-[family-name:var(--font-nunito)]">
                    {fullyPaid
                      ? `Payé le ${pmt?.paid_at ? new Date(pmt.paid_at).toLocaleDateString('fr-FR') : '—'}`
                      : awaitingValidation
                      ? `Paiement reçu (${((pmt?.amount_cents ?? 0) / 100).toFixed(2)} €) — en attente de validation`
                      : partial
                      ? `Versé : ${((pmt?.amount_cents ?? 0) / 100).toFixed(2)} € · Reste : ${(remaining / 100).toFixed(2)} €`
                      : `Montant : ${(expected / 100).toFixed(2)} €`
                    }
                  </p>
                )}
              </div>

              {fullyPaid ? (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#D1FAE5] text-[#065F46] whitespace-nowrap font-[family-name:var(--font-nunito)]">
                  ✓ Payé
                </span>
              ) : awaitingValidation ? (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap font-[family-name:var(--font-nunito)]">
                  En attente de validation
                </span>
              ) : (
                <button
                  onClick={() => void pay(t)}
                  disabled={paying === t.id}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#2A9D4E] text-white hover:bg-[#238742] transition-colors disabled:opacity-60 whitespace-nowrap font-[family-name:var(--font-nunito)]"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  {paying === t.id ? '…' : partial ? 'Payer le reste' : 'Payer en ligne'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
