'use client'

import { useState } from 'react'
import type { MatchEventType, OrgMember } from '@/lib/match/types'
import { useMatchLive } from '@/lib/hooks/useMatchLive'
import { LiveTimer } from './LiveTimer'
import { MatchControls } from './MatchControls'
import { LineupEditor, type FullMember, type LineupEntry } from './LineupEditor'
import { AddEventForm } from './AddEventForm'
import { EventTimeline } from './EventTimeline'

type MatchStatus = 'upcoming' | 'ongoing' | 'half_time' | 'finished' | null

interface Props {
  eventId: string
  opponent: string | null
  isHome: boolean | null
  initialStatus: MatchStatus
  initialStartedAt: string | null
  initialElapsedMinutes: number
  orgName: string
  allMembers: FullMember[]
  initialLineup: LineupEntry[]
}

export function LiveMatchManager({ eventId, opponent, isHome, initialStatus, initialStartedAt, initialElapsedMinutes, orgName, allMembers, initialLineup }: Props) {
  const [status, setStatus] = useState<MatchStatus>(initialStatus)
  const [startedAt, setStartedAt] = useState<string | null>(initialStartedAt)
  const [elapsedMinutes, setElapsedMinutes] = useState(initialElapsedMinutes)
  const [lineup, setLineup] = useState<LineupEntry[]>(initialLineup)
  const [loading, setLoading] = useState(false)
  const { events, score } = useMatchLive(eventId)

  const post = (path: string, body: object) =>
    fetch(`/api/match/${eventId}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const del = (path: string, body: object) =>
    fetch(`/api/match/${eventId}/${path}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

  const control = async (action: 'start' | 'half_time' | 'resume' | 'end') => {
    setLoading(true)
    const res = await post('control', { action })
    if (res.ok) {
      const now = new Date().toISOString()
      if (action === 'start') { setStatus('ongoing'); setStartedAt(now); setElapsedMinutes(0) }
      else if (action === 'half_time') {
        const curr = startedAt ? Math.min(90, elapsedMinutes + Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000)) : elapsedMinutes
        setStatus('half_time'); setElapsedMinutes(curr)
      }
      else if (action === 'resume') { setStatus('ongoing'); setStartedAt(now) }
      else { setStatus('finished') }
    }
    setLoading(false)
  }

  const addToLineup = async (orgMemberId: string, isStarter: boolean) => {
    setLineup(prev => [...prev.filter(l => l.org_member_id !== orgMemberId), { org_member_id: orgMemberId, is_starter: isStarter }])
    await post('lineup', { orgMemberId, isStarter })
  }

  const removeFromLineup = async (orgMemberId: string) => {
    setLineup(prev => prev.filter(l => l.org_member_id !== orgMemberId))
    await del('lineup', { orgMemberId })
  }

  const addEvent = async (type: MatchEventType, minute: number, playerId?: string, assistId?: string, playerNameFree?: string) => {
    await post('event', { type, minute, playerId, assistPlayerId: assistId, playerNameFree })
  }

  const removeEvent = async (id: string) => { await del('event', { matchEventId: id }) }

  const us = isHome !== false ? score.home : score.away
  const them = isHome !== false ? score.away : score.home
  const lineupMembers: OrgMember[] = allMembers.filter(m => lineup.some(l => l.org_member_id === m.org_member_id))
  const currentMin = status === 'ongoing' && startedAt
    ? Math.min(90, elapsedMinutes + Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000))
    : elapsedMinutes

  return (
    <div className="space-y-4">
      <div className="bg-[#2A9D4E] rounded-2xl p-5 text-white text-center space-y-2 shadow-sm">
        <p className="text-sm font-semibold opacity-80 font-[family-name:var(--font-nunito)]">
          {orgName} vs {opponent ?? 'Adversaire'}
        </p>
        <div className="text-7xl font-[800] font-[family-name:var(--font-barlow)] tabular-nums leading-none">
          {us} – {them}
        </div>
        <LiveTimer startedAt={startedAt} status={status} elapsedMinutes={elapsedMinutes} />
      </div>

      <MatchControls status={status} loading={loading} onControl={action => void control(action)} />
      <LineupEditor allMembers={allMembers} lineup={lineup} onAdd={addToLineup} onRemove={removeFromLineup} />

      {status === 'ongoing' && (
        <AddEventForm members={lineupMembers} defaultMinute={currentMin} onAdd={addEvent} />
      )}

      {events.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#DDD8CE] shadow-sm p-4 space-y-2">
          <p className="text-xs font-semibold text-[#7A8070] uppercase tracking-wide font-[family-name:var(--font-nunito)]">
            Chronologie
          </p>
          <EventTimeline events={events} members={lineupMembers} onRemove={removeEvent} opponentName={opponent ?? 'Adversaire'} />
        </div>
      )}
    </div>
  )
}
