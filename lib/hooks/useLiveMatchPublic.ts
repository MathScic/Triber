'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export type LiveScore = { home: number; away: number }
export type LiveAction = {
  id: string; type: string; minute: number; is_own_team: boolean
  user_id: string | null; player_name: string | null; player_in_name: string | null
}
export type LivePlayer = { user_id: string; name: string; jersey: number | null; is_starter: boolean }

type MemberRow = { id: string; user_id: string; jersey_number: number | null }
type ProfileRow = { id: string; full_name: string | null }

export function useLiveMatchPublic(eventId: string) {
  const [score, setScore] = useState<LiveScore>({ home: 0, away: 0 })
  const [actions, setActions] = useState<LiveAction[]>([])
  const [players, setPlayers] = useState<LivePlayer[]>([])
  const [client] = useState(() => createClient())
  const seqRef = useRef(0)

  useEffect(() => {
    const s = client

    const refetchActions = async () => {
      const seq = ++seqRef.current
      const { data } = await s.from('match_actions')
        .select('id, type, minute, is_own_team, user_id, player_name, player_in_name')
        .eq('event_id', eventId).order('minute')
      if (seq === seqRef.current) {
        setActions((data ?? []) as LiveAction[])
      }
    }

    void s.from('match_results').select('score_home, score_away').eq('event_id', eventId).maybeSingle()
      .then(({ data }) => { if (data) setScore({ home: data.score_home as number, away: data.score_away as number }) })

    void refetchActions()

    void s.from('match_lineups').select('organization_member_id, is_starter').eq('event_id', eventId)
      .then(async ({ data: lData }) => {
        if (!lData?.length) return
        const orgIds = lData.map(r => r.organization_member_id as string)
        const { data: mData } = await s.from('organization_members').select('id, user_id, jersey_number').in('id', orgIds)
        if (!mData?.length) return
        const userIds = (mData as MemberRow[]).map(m => m.user_id)
        const { data: pData } = await s.from('profiles').select('id, full_name').in('id', userIds)
        const profileMap = new Map((pData as ProfileRow[] ?? []).map(p => [p.id, p.full_name]))
        const memberMap = new Map((mData as MemberRow[]).map(m => [m.id, m]))
        setPlayers(lData.map(lr => {
          const m = memberMap.get(lr.organization_member_id as string)
          const uid = m?.user_id ?? ''
          return { user_id: uid, jersey: m?.jersey_number ?? null, name: profileMap.get(uid) ?? 'Inconnu', is_starter: lr.is_starter as boolean }
        }).sort((a, b) => (a.jersey ?? 99) - (b.jersey ?? 99)))
      })

    const ch = s.channel(`live-pub-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_results', filter: `event_id=eq.${eventId}` },
        p => { const r = p.new as { score_home: number; score_away: number }; setScore({ home: r.score_home, away: r.score_away }) })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_actions', filter: `event_id=eq.${eventId}` },
        () => void refetchActions())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'match_actions', filter: `event_id=eq.${eventId}` },
        () => void refetchActions())
      .subscribe()

    return () => { void s.removeChannel(ch) }
  }, [client, eventId])

  const ownGoals = actions.filter(a => a.type === 'goal' && a.is_own_team).length
  const oppGoals = actions.filter(a => a.type === 'goal' && !a.is_own_team).length

  return { score, ownGoals, oppGoals, actions, players }
}
