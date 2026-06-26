'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type ContributionPayment = {
  id: string
  template_id: string
  user_id: string | null
  manual_name: string | null
  category: string | null
  amount_cents: number
  status: 'pending' | 'paid' | 'failed'
  payment_method: string | null
  paid_at: string | null
  paid_by: string | null
  notes: string | null
  profiles?: { full_name: string | null } | null
}

// Paiement Stripe non encore validé par l'admin
export function isAwaitingValidation(p: ContributionPayment | null | undefined): boolean {
  return p?.status === 'paid' && p.payment_method === 'stripe' && p.paid_by === null
}

export type OrgMemberForPayment = {
  id: string
  user_id: string
  category: string | null
  jersey_number: number | null
  full_name: string | null
  payment: ContributionPayment | null
}

export function useContributionPayments() {
  const [payments, setPayments] = useState<ContributionPayment[]>([])
  const [members, setMembers] = useState<OrgMemberForPayment[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async (templateId: string, orgId: string) => {
    setLoading(true)
    const s = createClient()
    const [{ data: pmts }, { data: mems }] = await Promise.all([
      s.from('contribution_payments').select('*').eq('template_id', templateId),
      s.from('organization_members').select('id,user_id,category,jersey_number').eq('organization_id', orgId),
    ])
    const pList = (pmts ?? []) as ContributionPayment[]
    setPayments(pList)

    const memList = (mems ?? []) as { id: string; user_id: string; category: string | null; jersey_number: number | null }[]
    const userIds = memList.map(m => m.user_id).filter(Boolean)
    const { data: profiles } = userIds.length > 0
      ? await s.from('profiles').select('id,full_name').in('id', userIds)
      : { data: [] }
    const profileMap = new Map((profiles ?? []).map(p => [p.id as string, p.full_name as string | null]))

    setMembers(memList.map(m => ({
      id: m.id,
      user_id: m.user_id,
      category: m.category,
      jersey_number: m.jersey_number,
      full_name: profileMap.get(m.user_id) ?? null,
      payment: pList.find(p => p.user_id === m.user_id) ?? null,
    })))
    setLoading(false)
  }, [])

  const markPaid = useCallback(async (
    paymentId: string | null, templateId: string, orgId: string,
    userId: string | null, manualName: string | null,
    category: string | null, amountCents: number,
    method: string, notes?: string
  ) => {
    const s = createClient()
    const { data: { user } } = await s.auth.getUser()
    const now = new Date().toISOString()
    if (paymentId) {
      // Récupère le montant déjà versé pour accumuler (pas écraser)
      const { data: existing } = await s.from('contribution_payments')
        .select('amount_cents').eq('id', paymentId).maybeSingle()
      const previousCents = (existing?.amount_cents as number) ?? 0
      const totalCents = previousCents + amountCents
      await s.from('contribution_payments').update({ status: 'paid', amount_cents: totalCents, payment_method: method, paid_at: now, paid_by: user?.id, notes: notes ?? null }).eq('id', paymentId)
    } else {
      await s.from('contribution_payments').insert({ template_id: templateId, organization_id: orgId, user_id: userId, manual_name: manualName, category, amount_cents: amountCents, status: 'paid', payment_method: method, paid_at: now, paid_by: user?.id, notes: notes ?? null })
    }
    await fetch(templateId, orgId)
  }, [fetch])

  const validatePayment = useCallback(async (paymentId: string, templateId: string, orgId: string) => {
    const s = createClient()
    const { data: { user } } = await s.auth.getUser()
    if (!user) return
    await s.from('contribution_payments').update({ paid_by: user.id }).eq('id', paymentId)
    await fetch(templateId, orgId)
  }, [fetch])

  const markPending = useCallback(async (paymentId: string, templateId: string, orgId: string) => {
    await createClient().from('contribution_payments').update({ status: 'pending', payment_method: null, paid_at: null, paid_by: null, notes: null }).eq('id', paymentId)
    await fetch(templateId, orgId)
  }, [fetch])

  const addManual = useCallback(async (templateId: string, orgId: string, name: string, category: string | null, amountCents: number) => {
    const { error } = await createClient().from('contribution_payments').insert({ template_id: templateId, organization_id: orgId, manual_name: name, category, amount_cents: amountCents, status: 'pending' })
    if (!error) await fetch(templateId, orgId)
    return !error
  }, [fetch])

  const removePayment = useCallback(async (paymentId: string, templateId: string, orgId: string) => {
    await createClient().from('contribution_payments').delete().eq('id', paymentId)
    await fetch(templateId, orgId)
  }, [fetch])

  const manualMembers = payments.filter(p => p.user_id === null)

  return { payments, members, manualMembers, loading, fetch, markPaid, markPending, validatePayment, addManual, removePayment }
}
