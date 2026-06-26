'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MatchAction } from '@/lib/match/types'

export function useMatchLive(eventId: string) {
  const [actions, setActions] = useState<MatchAction[]>([])
  const [score, setScore] = useState({ home: 0, away: 0 })
  const [client] = useState(() => createClient())
  const seqRef = useRef(0)

  const refetch = useCallback(async () => {
    const seq = ++seqRef.current
    const { data } = await client
      .from('match_actions')
      .select('id, type, minute, is_own_team, user_id, player_name, player_in_id, player_in_name')
      .eq('event_id', eventId)
    if (seq === seqRef.current) {
      setActions((data ?? []) as MatchAction[])
    }
  }, [client, eventId])

  useEffect(() => {
    void refetch()

    void client
      .from('match_results')
      .select('score_home, score_away')
      .eq('event_id', eventId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setScore({ home: data.score_home as number, away: data.score_away as number })
      })

    const ch = client
      .channel(`live-${eventId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'match_actions', filter: `event_id=eq.${eventId}` },
        () => void refetch())
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'match_actions', filter: `event_id=eq.${eventId}` },
        () => void refetch())
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'match_results', filter: `event_id=eq.${eventId}` },
        p => {
          const r = p.new as { score_home: number; score_away: number }
          setScore({ home: r.score_home, away: r.score_away })
        })
      .subscribe()

    return () => { void client.removeChannel(ch) }
  }, [client, eventId, refetch])

  return { actions, score, refetch }
}
