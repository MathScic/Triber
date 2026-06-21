'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineupDisplay } from './LineupDisplay'

type Score = { home: number; away: number } | null
type EventInfo = {
  id: string; title: string; opponent: string | null; is_home: boolean | null
  start_at: string; location: string | null; status: string | null; started_at: string | null
  organizations: { name: string; logo_url: string | null; primary_color: string; secondary_color: string } | null
}
type Player = { jersey: number | null; name: string; is_starter: boolean }

interface Props { eventId: string; initialEvent: EventInfo; initialScore: Score }

function elapsed(startedAt: string | null, status: string | null): string {
  if (status !== 'ongoing' || !startedAt) return ''
  const mins = Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000)
  return `${mins}'`
}

export function MatchLiveCard({ eventId, initialEvent, initialScore }: Props) {
  const [score, setScore] = useState<Score>(initialScore)
  const [event] = useState<EventInfo>(initialEvent)
  const [starters, setStarters] = useState<Player[]>([])
  const [subs, setSubs] = useState<Player[]>([])
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    // Charge la composition du match
    ;(async () => {
      const { data } = await supabase
        .from('match_lineups')
        .select('is_starter, organization_members(jersey_number, profiles(full_name))')
        .eq('event_id', eventId)

      type MemberData = { jersey_number: number | null; profiles: { full_name: string | null } | null }
      const players: Player[] = (data ?? []).map(row => {
        const rawMem = row.organization_members
        const mem = (Array.isArray(rawMem) ? rawMem[0] : rawMem) as unknown as MemberData | null
        return {
          jersey: mem?.jersey_number ?? null,
          name: (Array.isArray(mem?.profiles) ? (mem?.profiles as { full_name: string | null }[])[0]?.full_name : mem?.profiles?.full_name) ?? 'Inconnu',
          is_starter: row.is_starter as boolean,
        }
      }).sort((a, b) => (a.jersey ?? 99) - (b.jersey ?? 99))

      setStarters(players.filter(p => p.is_starter))
      setSubs(players.filter(p => !p.is_starter))
    })()

    // Souscription temps réel sur le score
    const channel = supabase
      .channel(`match-${eventId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'match_results',
        filter: `event_id=eq.${eventId}`,
      }, payload => {
        const row = payload.new as { score_home: number; score_away: number }
        setScore({ home: row.score_home, away: row.score_away })
      })
      .subscribe()

    // Tick pour rafraîchir le chrono toutes les 30s
    const interval = setInterval(() => setTick(t => t + 1), 30_000)

    return () => { void supabase.removeChannel(channel); clearInterval(interval) }
  }, [eventId])

  const org = event.organizations
  const isHome = event.is_home !== false
  const homeName = isHome ? (org?.name ?? 'Nous') : (event.opponent ?? 'Adversaire')
  const awayName = isHome ? (event.opponent ?? 'Adversaire') : (org?.name ?? 'Nous')
  const scoreHome = isHome ? (score?.home ?? 0) : (score?.away ?? 0)
  const scoreAway = isHome ? (score?.away ?? 0) : (score?.home ?? 0)

  const primaryColor = org?.primary_color ?? '#2A9D4E'
  const statusLabel = event.status === 'ongoing' ? 'En cours' : event.status === 'finished' ? 'Terminé' : 'À venir'
  const chrono = elapsed(event.started_at, event.status)
  const dateStr = new Date(event.start_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-4">
      {/* Carte score principale */}
      <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryColor}ee, ${primaryColor}99)` }}>
        <div className="px-4 pt-4 pb-6 text-white">
          {/* Statut */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {org?.logo_url && <img src={org.logo_url} className="w-7 h-7 rounded-lg object-contain bg-white/20 p-0.5" alt={org.name} />}
              <span className="text-sm font-semibold opacity-90">{event.title}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {event.status === 'ongoing' && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
              <span className="text-xs font-semibold opacity-90 uppercase tracking-wide">
                {chrono || statusLabel}
              </span>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold truncate flex-1 text-center opacity-90">{homeName}</p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-5xl font-[800] font-[family-name:var(--font-barlow)] tabular-nums leading-none">{scoreHome}</span>
              <span className="text-2xl opacity-60">–</span>
              <span className="text-5xl font-[800] font-[family-name:var(--font-barlow)] tabular-nums leading-none">{scoreAway}</span>
            </div>
            <p className="text-sm font-bold truncate flex-1 text-center opacity-90">{awayName}</p>
          </div>

          {/* Lieu + date */}
          <p className="text-center text-xs opacity-70 mt-3 capitalize font-[family-name:var(--font-nunito)]">
            {dateStr}{event.location ? ` · ${event.location}` : ''}
          </p>
        </div>
      </div>

      {/* Composition */}
      <LineupDisplay starters={starters} subs={subs} />
    </div>
  )
}
