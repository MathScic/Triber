'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MatchAction, OrgMember } from '@/lib/match/types'
import { ScoreCard } from './ScoreCard'
import { LineupDisplay } from './LineupDisplay'
import { EventTimeline } from './EventTimeline'

type Score = { home: number; away: number } | null
type EventInfo = {
  id: string; title: string; opponent: string | null; is_home: boolean | null
  start_at: string; location: string | null; status: string | null; started_at: string | null
  organizations: { name: string; logo_url: string | null; primary_color: string } | null
}
type Player = { user_id: string; jersey: number | null; name: string; is_starter: boolean }
type MemberRow = { user_id: string; jersey_number: number | null }
type ProfileRow = { id: string; full_name: string | null }

function elapsed(startedAt: string | null, status: string | null): string {
  if (status !== 'ongoing' || !startedAt) return ''
  return `${Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000)}'`
}

export function MatchLiveCard({ eventId, initialEvent, initialScore }: { eventId: string; initialEvent: EventInfo; initialScore: Score }) {
  const [score, setScore] = useState<Score>(initialScore)
  const [matchActions, setMatchActions] = useState<MatchAction[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [, setTick] = useState(0)

  useEffect(() => {
    const s = createClient()

    // Composition : fetch members et profiles séparément (RLS)
    s.from('match_lineups').select('is_starter, organization_member_id').eq('event_id', eventId)
      .then(async ({ data: lineupRows }) => {
        if (!lineupRows?.length) return
        const orgMemberIds = lineupRows.map(r => r.organization_member_id as string)
        const { data: mData } = await s.from('organization_members')
          .select('id, user_id, jersey_number').in('id', orgMemberIds)
        const rows = (mData ?? []) as MemberRow[]
        const userIds = rows.map(r => r.user_id as string)
        let profileMap = new Map<string, string | null>()
        if (userIds.length) {
          const { data: pData } = await s.from('profiles').select('id, full_name').in('id', userIds)
          profileMap = new Map((pData ?? []).map((p: ProfileRow) => [p.id, p.full_name]))
        }
        const memberMap = new Map((mData ?? []).map((m: MemberRow & { id?: string }) => [m.id ?? '', m]))
        setPlayers(lineupRows.map(lr => {
          const m = memberMap.get(lr.organization_member_id as string)
          return {
            user_id: (m as MemberRow & { user_id: string })?.user_id ?? '',
            jersey: (m as MemberRow)?.jersey_number ?? null,
            name: profileMap.get((m as MemberRow & { user_id: string })?.user_id ?? '') ?? 'Inconnu',
            is_starter: lr.is_starter as boolean,
          }
        }).sort((a, b) => (a.jersey ?? 99) - (b.jersey ?? 99)))
      })

    s.from('match_actions')
      .select('id, type, minute, is_own_team, user_id, player_name, player_in_id, player_in_name')
      .eq('event_id', eventId)
      .then(({ data }) => setMatchActions((data ?? []) as MatchAction[]))

    const ch = s.channel(`live-public-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_results', filter: `event_id=eq.${eventId}` },
        p => { const r = p.new as { score_home: number; score_away: number }; setScore({ home: r.score_home, away: r.score_away }) })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_actions', filter: `event_id=eq.${eventId}` },
        p => setMatchActions(prev => [...prev, p.new as MatchAction]))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'match_actions', filter: `event_id=eq.${eventId}` },
        p => setMatchActions(prev => prev.filter(a => a.id !== (p.old as { id: string }).id)))
      .subscribe()

    const interval = setInterval(() => setTick(t => t + 1), 30_000)
    return () => { void s.removeChannel(ch); clearInterval(interval) }
  }, [eventId])

  const org = initialEvent.organizations
  const isHome = initialEvent.is_home !== false
  const members: OrgMember[] = players.map(p => ({ user_id: p.user_id, name: p.name, jersey: p.jersey }))

  return (
    <div className="space-y-4">
      <ScoreCard
        homeName={isHome ? (org?.name ?? 'Nous') : (initialEvent.opponent ?? 'Adversaire')}
        awayName={isHome ? (initialEvent.opponent ?? 'Adversaire') : (org?.name ?? 'Nous')}
        scoreHome={isHome ? (score?.home ?? 0) : (score?.away ?? 0)}
        scoreAway={isHome ? (score?.away ?? 0) : (score?.home ?? 0)}
        status={initialEvent.status}
        chrono={elapsed(initialEvent.started_at, initialEvent.status)}
        orgLogoUrl={org?.logo_url}
        title={initialEvent.title}
        dateStr={new Date(initialEvent.start_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        location={initialEvent.location}
        primaryColor={org?.primary_color ?? '#1E5C38'}
      />
      {matchActions.filter(a => a.type === 'goal' || a.type === 'yellow_card' || a.type === 'red_card').length > 0 && (
        <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-4 space-y-2">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide font-[family-name:var(--font-nunito)]">Chronologie</p>
          <EventTimeline actions={matchActions} members={members} opponentName={initialEvent.opponent ?? 'Adversaire'} />
        </div>
      )}
      <LineupDisplay starters={players.filter(p => p.is_starter)} subs={players.filter(p => !p.is_starter)} />
    </div>
  )
}
