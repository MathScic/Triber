'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Contribution = {
  id: string
  user_id: string
  amount: number
  label: string
  status: 'pending' | 'paid' | 'failed'
  stripe_payment_id: string | null
  paid_at: string | null
  created_at: string
  profiles?: { full_name: string | null } | null
}

export function useFinances() {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getOrgId = async (): Promise<string | null> => {
    const s = createClient()
    const { data: { user } } = await s.auth.getUser()
    if (!user) return null
    const { data } = await s.from('organization_members').select('organization_id').eq('user_id', user.id).maybeSingle()
    return (data?.organization_id as string) ?? null
  }

  const getContributions = async () => {
    setLoading(true)
    const orgId = await getOrgId()
    if (!orgId) { setLoading(false); return }
    const { data, error: err } = await createClient()
      .from('contributions')
      .select('*, profiles(full_name)')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
    setLoading(false)
    if (err) { setError('Impossible de charger les cotisations.'); return }
    setContributions((data ?? []) as unknown as Contribution[])
  }

  const createContribution = async (label: string, amount: number): Promise<{ clientSecret: string } | null> => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/contributions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, amount }),
      })
      const data = await res.json() as { clientSecret?: string; error?: string }
      if (!res.ok) { setError(data.error ?? 'Erreur création cotisation.'); return null }
      return { clientSecret: data.clientSecret! }
    } catch {
      setError('Impossible de contacter le serveur.')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getPaymentStatus = async (id: string): Promise<'pending' | 'paid' | 'failed' | null> => {
    const { data } = await createClient().from('contributions').select('status').eq('id', id).maybeSingle()
    return (data?.status as 'pending' | 'paid' | 'failed') ?? null
  }

  return { contributions, getContributions, createContribution, getPaymentStatus, loading, error }
}
