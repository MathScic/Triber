'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MatchEvent, OrgMember } from '@/lib/match/types'
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

function elapsed(startedAt: string | null, status: string | null): string {
  if (status !== 'ongoing' || !startedAt) return ''
  return `${Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000)}'`
}

export function MatchLiveCard({ eventId, initialEvent, initialScore }: { eventId: string; initialEvent: EventInfo; initialScore: Score }) {
  const [score, setScore] = useState<Score>(initialScore)
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [, setTick] = useState(0)

  useEffect(() => {
    const s = createClient()
    // Charge composition + events initiaux
    s.from('match_lineups').select('is_starter, organization_members(user_id, jersey_number, profiles(full_name))').eq('event_id', eventId)
      .then(({ data }) => setPlayers((data ?? []).map(row => {
        type M = { user_id: string; jersey_number: number | null; profiles: { full_name: string | null } | null }
        const rawM = row.organization_members
        const m = (Array.isArray(rawM) ? rawM[0] : rawM) as unknown as M | null
        const rawP = m?.profiles
        const p = (Array.isArray(rawP) ? rawP[0] : rawP) as { full_name: string | null } | null
        return { user_id: m?.user_id ?? '', jersey: m?.jersey_number ?? null, name: p?.full_name ?? 'Inconnu', is_starter: row.is_starter as boolean }
      }).sort((a, b) => (a.jersey ?? 99) - (b.jersey ?? 99))))

    s.from('match_events').select('id, type, minute, player_id, assist_player_id').eq('event_id', eventId)
      .then(({ data }) => setMatchEvents((data ?? []) as MatchEvent[]))

    const ch = s.channel(`live-public-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_results', filter: `event_id=eq.${eventId}` },
        p => { const r = p.new as { score_home: number; score_away: number }; setScore({ home: r.score_home, away: r.score_away }) })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_events', filter: `event_id=eq.${eventId}` },
        p => setMatchEvents(prev => [...prev, p.new as MatchEvent]))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'match_events', filter: `event_id=eq.${eventId}` },
        p => setMatchEvents(prev => prev.filter(e => e.id !== (p.old as { id: string }).id)))
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
        primaryColor={org?.primary_color ?? '#2A9D4E'}
      />
      {matchEvents.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#DDD8CE] shadow-sm p-4 space-y-2">
          <p className="text-xs font-semibold text-[#7A8070] uppercase tracking-wide font-[family-name:var(--font-nunito)]">Chronologie</p>
          <EventTimeline events={matchEvents} members={members} opponentName={initialEvent.opponent ?? 'Adversaire'} />
        </div>
      )}
      <LineupDisplay starters={players.filter(p => p.is_starter)} subs={players.filter(p => !p.is_starter)} />
    </div>
  )
}
