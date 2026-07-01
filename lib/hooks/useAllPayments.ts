'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type FlatPayment = {
  id: string
  template_id: string
  template_title: string
  is_active: boolean
  is_buvette: boolean
  amount_cents: number
  status: 'pending' | 'paid' | 'failed'
  payment_method: string | null
  member_name: string | null
  created_at: string
}

export function useAllPayments() {
  const [payments, setPayments] = useState<FlatPayment[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAll = useCallback(async (orgId: string) => {
    setLoading(true)
    const s = createClient()
    const { data: templates } = await s
      .from('contribution_templates')
      .select('id, title, is_active, is_buvette')
      .eq('organization_id', orgId)
    if (!templates?.length) { setPayments([]); setLoading(false); return }

    const tMap = new Map(templates.map(t => [t.id as string, t as { title: string; is_active: boolean; is_buvette: boolean }]))
    const tIds = templates.map(t => t.id as string)

    const { data: pmts } = await s
      .from('contribution_payments')
      .select('id, template_id, user_id, manual_name, amount_cents, status, payment_method, created_at')
      .in('template_id', tIds)
      .order('created_at', { ascending: false })
    if (!pmts?.length) { setPayments([]); setLoading(false); return }

    const uids = [...new Set(pmts.filter(p => p.user_id).map(p => p.user_id as string))]
    const { data: profiles } = uids.length > 0
      ? await s.from('profiles').select('id, full_name').in('id', uids)
      : { data: [] }
    const pMap = new Map((profiles ?? []).map(p => [p.id as string, p.full_name as string | null]))

    setPayments(pmts.map(p => {
      const t = tMap.get(p.template_id as string)
      const name = (p.user_id ? pMap.get(p.user_id as string) : p.manual_name as string | null) ?? null
      return {
        id: p.id as string, template_id: p.template_id as string,
        template_title: t?.title ?? '—', is_active: t?.is_active ?? false, is_buvette: t?.is_buvette ?? false,
        amount_cents: p.amount_cents as number, status: p.status as 'pending' | 'paid' | 'failed',
        payment_method: p.payment_method as string | null, member_name: name,
        created_at: p.created_at as string,
      }
    }))
    setLoading(false)
  }, [])

  const markPaid = useCallback(async (paymentId: string) => {
    const s = createClient()
    const { data: { user } } = await s.auth.getUser()
    await s.from('contribution_payments').update({
      status: 'paid', payment_method: 'cash', paid_at: new Date().toISOString(), paid_by: user?.id ?? null,
    }).eq('id', paymentId)
  }, [])

  const markPending = useCallback(async (paymentId: string) => {
    await createClient().from('contribution_payments').update({
      status: 'pending', payment_method: null, paid_at: null, paid_by: null,
    }).eq('id', paymentId)
  }, [])

  const deletePayment = useCallback(async (paymentId: string) => {
    await createClient().from('contribution_payments').delete().eq('id', paymentId)
  }, [])

  return { payments, loading, fetchAll, markPaid, markPending, deletePayment }
}
