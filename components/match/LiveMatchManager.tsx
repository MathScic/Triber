'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { MatchActionType, OrgMember } from '@/lib/match/types'
import { useMatchLive } from '@/lib/hooks/useMatchLive'
import { MatchControls } from './MatchControls'
import { AddEventForm } from './AddEventForm'
import { EventTimeline } from './EventTimeline'
import { MatchCompositionSection } from './MatchCompositionSection'
import { LiveScoreBoard } from './LiveScoreBoard'
import type { FullMember, LineupEntry } from './LineupEditor'

type MatchStatus = 'upcoming' | 'ongoing' | 'half_time' | 'finished' | null
type Tab = 'live' | 'compo'

interface Props {
  eventId: string; opponent: string | null; isHome: boolean | null
  initialStatus: MatchStatus; initialStartedAt: string | null
  initialPausedAt: string | null; initialTotalPausedSeconds: number
  orgName: string; orgLogoUrl?: string | null; organizationId: string; eventTitle: string
  allMembers: FullMember[]; initialLineup: LineupEntry[]; onStatusChange?: (s: string) => void
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'live', label: 'Actions du match' }, { key: 'compo', label: 'Composition' },
]

export function LiveMatchManager({ eventId, opponent, isHome, initialStatus, initialStartedAt, initialPausedAt, initialTotalPausedSeconds, orgName, orgLogoUrl, organizationId, eventTitle, allMembers, initialLineup, onStatusChange }: Props) {
  const [status, setStatus] = useState<MatchStatus>(initialStatus)
  const [startedAt, setStartedAt] = useState<string | null>(initialStartedAt)
  const [pausedAt, setPausedAt] = useState<string | null>(initialPausedAt)
  const [totalPausedSeconds, setTotalPausedSeconds] = useState(initialTotalPausedSeconds)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<Tab>('live')
  const { actions, refetch } = useMatchLive(eventId)

  const post = (path: string, body: object) =>
    fetch(`/api/match/${eventId}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const del = (path: string, body: object) =>
    fetch(`/api/match/${eventId}/${path}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

  const control = async (action: 'start' | 'half_time' | 'resume' | 'end') => {
    setLoading(true)
    const res = await post('control', { action })
    if (res.ok) {
      const now = new Date().toISOString()
      if (action === 'start') { setStartedAt(now); setStatus('ongoing'); setPausedAt(null); setTotalPausedSeconds(0); onStatusChange?.('ongoing') }
      else if (action === 'half_time') { setStatus('half_time'); setPausedAt(now); onStatusChange?.('half_time') }
      else if (action === 'resume') {
        const add = pausedAt ? Math.floor((Date.now() - new Date(pausedAt).getTime()) / 1000) : 0
        setTotalPausedSeconds(p => p + add); setPausedAt(null); setStatus('ongoing'); onStatusChange?.('ongoing')
      } else { setStatus('finished'); onStatusChange?.('finished') }
    }
    setLoading(false)
  }

  const addEvent = async (type: MatchActionType, minute: number, isOwnTeam: boolean, userId?: string, assistUserId?: string) => {
    await post('event', { type, minute, isOwnTeam, userId, assistUserId }); refetch(); setShowForm(false) }
  const removeEvent = (id: string) => { void del('event', { matchActionId: id }).then(() => refetch()) }
  const us = actions.filter(a => a.type === 'goal' && a.is_own_team).length
  const them = actions.filter(a => a.type === 'goal' && !a.is_own_team).length
  const timelineMembers: OrgMember[] = allMembers.map(m => ({ user_id: m.user_id, name: m.name, jersey: m.jersey }))
  const lineupMembers = allMembers.filter(m => initialLineup.some(l => l.org_member_id === m.org_member_id)).length > 0
    ? allMembers.filter(m => initialLineup.some(l => l.org_member_id === m.org_member_id)) : timelineMembers
  const currentMin = startedAt
    ? Math.min(90, Math.max(0, Math.floor((((status === 'ongoing' ? Date.now() : (pausedAt ? new Date(pausedAt).getTime() : Date.now())) - new Date(startedAt).getTime()) / 1000 - totalPausedSeconds) / 60)))
    : 0

  return (
    <div className="space-y-3">
      <LiveScoreBoard orgName={orgName} opponent={opponent ?? 'Adversaire'} us={us} them={them}
        status={status} startedAt={startedAt} pausedAt={pausedAt} totalPausedSeconds={totalPausedSeconds}
        loading={loading} isHome={isHome} orgLogoUrl={orgLogoUrl}
        onHalfTime={() => void control('half_time')} onResume={() => void control('resume')} />
      <MatchControls status={status} loading={loading} onControl={action => void control(action)} />
      <div className="flex bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 text-[10px] font-[800] uppercase tracking-wide transition-colors font-[family-name:var(--font-barlow)] ${tab === t.key ? 'bg-brand-dark text-white' : 'text-brand-muted hover:bg-brand-bg'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'live' && <EventTimeline actions={actions} members={timelineMembers} onRemove={status !== 'finished' ? removeEvent : undefined} opponentName={opponent ?? 'Adversaire'} isHome={isHome} orgName={orgName} />}
      {tab === 'compo' && <MatchCompositionSection allMembers={allMembers} initialLineup={initialLineup} eventId={eventId} organizationId={organizationId} eventTitle={eventTitle} status={status} />}
      {status === 'ongoing' && tab === 'live' && (
        <button onClick={() => setShowForm(true)}
          className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 w-14 h-14 rounded-full bg-success text-white shadow-lg flex items-center justify-center hover:bg-success/90 transition-colors z-40">
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      )}
      {showForm && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <AddEventForm members={lineupMembers} defaultMinute={Math.floor(currentMin)} onAdd={addEvent} onClose={() => setShowForm(false)} />
          </div></div>}
    </div>
  )
}
