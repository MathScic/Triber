'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ContributionTemplate } from '@/lib/hooks/useContributions'

interface Options {
  router: AppRouterInstance
  searchParams: ReadonlyURLSearchParams
  setPaidToast: (v: boolean) => void
  fetchPayments: (templateId: string, orgId: string) => Promise<void>
  fetchTreasury: (templateId: string) => void
}

export function useFinanceDetail(id: string, opts: Options) {
  const [template, setTemplate] = useState<ContributionTemplate | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const s = createClient()
    s.auth.getUser().then(({ data: { user } }) => {
      if (!user) { opts.router.push('/login'); return }
      s.from('organization_members').select('organization_id, role').eq('user_id', user.id).maybeSingle()
        .then(({ data: mem }) => {
          if (!mem) { opts.router.push('/home'); return }
          const oid = mem.organization_id as string
          setOrgId(oid)
          s.from('contribution_templates')
            .select('*, contribution_tarifs(id,category,amount_cents), contribution_payments(id,status,amount_cents)')
            .eq('id', id).single()
            .then(({ data }) => {
              if (!data) { opts.router.push('/finances'); return }
              const pmts = (data.contribution_payments as { status: string; amount_cents: number }[] | null) ?? []
              setTemplate({
                ...data,
                tarifs: data.contribution_tarifs ?? [],
                payments_count: pmts.length,
                paid_count: pmts.filter((p: { status: string }) => p.status === 'paid').length,
                total_expected_cents: pmts.reduce((s: number, p: { amount_cents: number }) => s + p.amount_cents, 0),
                total_paid_cents: pmts.filter((p: { status: string }) => p.status === 'paid').reduce((s: number, p: { amount_cents: number }) => s + p.amount_cents, 0),
              } as ContributionTemplate)
              if (data.is_buvette) opts.fetchTreasury(id)
              else void opts.fetchPayments(id, oid)
            })
        })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Retour depuis Stripe : vérifie directement la session (ne dépend pas du webhook)
  useEffect(() => {
    const sessionId = opts.searchParams.get('session_id')
    if (opts.searchParams.get('paid') !== '1' || !orgId || !sessionId) return
    opts.setPaidToast(true)
    void (async () => {
      await fetch('/api/contributions/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      await opts.fetchPayments(id, orgId)
      opts.setPaidToast(false)
      opts.router.replace(`/finances/${id}`)
    })()
    return () => { if (retryRef.current) clearTimeout(retryRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.searchParams, orgId])

  const getAmount = useCallback((category: string | null): number => {
    if (!template) return 0
    return template.tarifs.find(t => t.category === category)?.amount_cents
      ?? template.tarifs.find(t => t.category === '')?.amount_cents
      ?? 0
  }, [template])

  return { template, orgId, getAmount }
}
