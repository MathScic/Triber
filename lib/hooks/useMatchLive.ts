'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MatchEvent } from '@/lib/match/types'

export function useMatchLive(eventId: string) {
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [score, setScore] = useState({ home: 0, away: 0 })

  useEffect(() => {
    const s = createClient()

    s.from('match_events')
      .select('id, type, minute, player_id, assist_player_id, player_name_free')
      .eq('event_id', eventId)
      .then(({ data }) => setEvents((data ?? []) as MatchEvent[]))

    s.from('match_results')
      .select('score_home, score_away')
      .eq('event_id', eventId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setScore({ home: data.score_home as number, away: data.score_away as number })
      })

    const ch = s.channel(`live-${eventId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'match_events', filter: `event_id=eq.${eventId}` },
        p => setEvents(prev => [...prev, p.new as MatchEvent]))
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'match_events', filter: `event_id=eq.${eventId}` },
        p => setEvents(prev => prev.filter(e => e.id !== (p.old as { id: string }).id)))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'match_results', filter: `event_id=eq.${eventId}` },
        p => {
          const r = p.new as { score_home: number; score_away: number }
          setScore({ home: r.score_home, away: r.score_away })
        })
      .subscribe()

    return () => { void s.removeChannel(ch) }
  }, [eventId])

  return { events, score }
}
