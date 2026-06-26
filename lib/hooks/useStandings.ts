'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type StandingRow = {
  id: string
  rank: number
  team_name: string
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  points: number
  is_own_team: boolean
  season: string
}

export function useStandings(organizationId: string) {
  const [rows, setRows] = useState<StandingRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await createClient()
      .from('standings')
      .select('*')
      .eq('organization_id', organizationId)
      .order('rank', { ascending: true })
    setRows((data ?? []) as StandingRow[])
    setLoading(false)
  }, [organizationId])

  useEffect(() => { void fetch() }, [fetch])

  const upsert = async (row: Omit<StandingRow, 'id'> & { id?: string }) => {
    const s = createClient()
    if (row.id) {
      await s.from('standings').update({ ...row, updated_at: new Date().toISOString() }).eq('id', row.id)
    } else {
      await s.from('standings').insert({ ...row, organization_id: organizationId })
    }
    await fetch()
  }

  const remove = async (id: string) => {
    await createClient().from('standings').delete().eq('id', id)
    setRows(r => r.filter(x => x.id !== id))
  }

  return { rows, loading, upsert, remove, refresh: fetch }
}
