'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MatchEvent, MatchEventType, OrgMember } from '@/lib/match/types'
import { AddEventForm } from './AddEventForm'
import { EventTimeline } from './EventTimeline'

type MatchStatus = 'upcoming' | 'ongoing' | 'finished' | null

interface Props {
  eventId: string
  orgId: string
  opponent: string | null
  isHome: boolean | null
  initialStatus: MatchStatus
  initialStartedAt: string | null
  orgName: string
}

function elapsedMin(startedAt: string | null): number {
  if (!startedAt) return 1
  return Math.max(1, Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000))
}

export function LiveMatchManager({ eventId, orgId, opponent, isHome, initialStatus, initialStartedAt, orgName }: Props) {
  const [status, setStatus] = useState<MatchStatus>(initialStatus)
  const [startedAt, setStartedAt] = useState<string | null>(initialStartedAt)
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [members, setMembers] = useState<OrgMember[]>([])
  const [score, setScore] = useState({ home: 0, away: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const s = createClient()
    s.from('organization_members').select('user_id, jersey_number, profiles(full_name)')
      .eq('organization_id', orgId).then(({ data }) => {
        setMembers((data ?? []).map(row => {
          const raw = row.profiles
          const p = (Array.isArray(raw) ? raw[0] : raw) as { full_name: string | null } | null
          return { user_id: row.user_id as string, name: p?.full_name ?? 'Inconnu', jersey: row.jersey_number as number | null }
        }).sort((a, b) => (a.jersey ?? 99) - (b.jersey ?? 99)))
      })

    s.from('match_events').select('id, type, minute, player_id, assist_player_id')
      .eq('event_id', eventId).then(({ data }) => setEvents((data ?? []) as MatchEvent[]))

    s.from('match_results').select('score_home, score_away').eq('event_id', eventId).maybeSingle()
      .then(({ data }) => { if (data) setScore({ home: data.score_home as number, away: data.score_away as number }) })

    const ch = s.channel(`manager-${eventId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_events', filter: `event_id=eq.${eventId}` },
        p => setEvents(prev => [...prev, p.new as MatchEvent]))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'match_events', filter: `event_id=eq.${eventId}` },
        p => setEvents(prev => prev.filter(e => e.id !== (p.old as { id: string }).id)))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_results', filter: `event_id=eq.${eventId}` },
        p => { const r = p.new as { score_home: number; score_away: number }; setScore({ home: r.score_home, away: r.score_away }) })
      .subscribe()

    return () => { void s.removeChannel(ch) }
  }, [eventId, orgId])

  const control = async (action: 'start' | 'end') => {
    setLoading(true)
    const res = await fetch(`/api/match/${eventId}/control`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
    if (res.ok) { const now = new Date().toISOString(); setStatus(action === 'start' ? 'ongoing' : 'finished'); if (action === 'start') setStartedAt(now) }
    setLoading(false)
  }

  const addEvent = async (type: MatchEventType, minute: number, playerId?: string, assistId?: string) => {
    await fetch(`/api/match/${eventId}/event`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, minute, playerId, assistPlayerId: assistId }) })
  }

  const removeEvent = async (matchEventId: string) => {
    await fetch(`/api/match/${eventId}/event`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matchEventId }) })
  }

  const us = isHome !== false ? score.home : score.away
  const them = isHome !== false ? score.away : score.home

  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="bg-[#2A9D4E] rounded-2xl p-4 text-white text-center">
        <p className="text-xs opacity-80 mb-1 font-[family-name:var(--font-nunito)]">{orgName} vs {opponent ?? 'Adversaire'}</p>
        <div className="text-6xl font-[800] font-[family-name:var(--font-barlow)] tabular-nums">{us} – {them}</div>
        <p className="text-sm opacity-80 mt-1 font-[family-name:var(--font-nunito)]">
          {status === 'ongoing' ? `⚡ En cours — ${elapsedMin(startedAt)}'` : status === 'finished' ? '✅ Terminé' : '⏳ À venir'}
        </p>
      </div>

      {/* Contrôles */}
      <div className="flex gap-2">
        {status !== 'ongoing' && status !== 'finished' && (
          <button onClick={() => void control('start')} disabled={loading}
            className="flex-1 h-11 rounded-xl bg-[#2A9D4E] text-white font-[800] text-sm font-[family-name:var(--font-barlow)] uppercase tracking-wide hover:bg-[#238742] transition-colors disabled:opacity-50">
            ▶ Démarrer le match
          </button>
        )}
        {status === 'ongoing' && (
          <button onClick={() => void control('end')} disabled={loading}
            className="flex-1 h-11 rounded-xl bg-[#E8622A] text-white font-[800] text-sm font-[family-name:var(--font-barlow)] uppercase tracking-wide hover:bg-[#d4541e] transition-colors disabled:opacity-50">
            ⏸ Terminer le match
          </button>
        )}
      </div>

      {/* Formulaire d'ajout d'action */}
      {status === 'ongoing' && (
        <AddEventForm members={members} defaultMinute={elapsedMin(startedAt)} onAdd={addEvent} />
      )}

      {/* Chronologie */}
      {events.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#DDD8CE] shadow-sm p-4 space-y-2">
          <p className="text-xs font-semibold text-[#7A8070] uppercase tracking-wide font-[family-name:var(--font-nunito)]">Chronologie</p>
          <EventTimeline events={events} members={members} onRemove={removeEvent} opponentName={opponent ?? 'Adversaire'} />
        </div>
      )}
    </div>
  )
}
