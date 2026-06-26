'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type TreasuryEntry = {
  id: string
  template_id: string | null
  amount_declared_cents: number
  amount_ticket_cents: number | null
  photo_url: string | null
  entry_date: string
  notes: string | null
  entered_by: string | null
  created_at: string
  profiles?: { full_name: string | null } | null
}

export function useTreasury() {
  const [entries, setEntries] = useState<TreasuryEntry[]>([])
  const [loading, setLoading] = useState(false)

  const isFlagged = (e: TreasuryEntry) =>
    e.amount_ticket_cents !== null && e.amount_ticket_cents !== e.amount_declared_cents

  const total = entries.reduce((s, e) => s + e.amount_declared_cents, 0)
  const flaggedCount = entries.filter(isFlagged).length

  const fetch = useCallback(async (templateId: string) => {
    setLoading(true)
    const { data } = await createClient()
      .from('treasury_entries')
      .select('*, profiles(full_name)')
      .eq('template_id', templateId)
      .order('entry_date', { ascending: false })
    if (data) setEntries(data as TreasuryEntry[])
    setLoading(false)
  }, [])

  const uploadPhoto = useCallback(async (file: File, orgId: string): Promise<string | null> => {
    const s = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `treasury/${orgId}/${Date.now()}.${ext}`
    const { error } = await s.storage.from('media').upload(path, file)
    if (error) return null
    return s.storage.from('media').getPublicUrl(path).data.publicUrl
  }, [])

  const add = useCallback(async (
    orgId: string, templateId: string,
    payload: {
      amount_declared_cents: number
      amount_ticket_cents?: number | null
      photo_url?: string | null
      entry_date: string
      notes?: string | null
    }
  ) => {
    const s = createClient()
    const { data: { user } } = await s.auth.getUser()
    const { error } = await s.from('treasury_entries').insert({
      organization_id: orgId, template_id: templateId,
      entered_by: user?.id ?? null, ...payload,
    })
    if (!error) await fetch(templateId)
    return !error
  }, [fetch])

  return { entries, total, flaggedCount, loading, isFlagged, fetch, add, uploadPhoto }
}
