'use client'

import { useState, useEffect } from 'react'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import { useEvents, type AttendanceStatus, type TriberEvent } from '@/lib/hooks/useEvents'
import { EventCard } from '@/components/events/EventCard'
import { EventForm } from '@/components/events/EventForm'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

type Score = { home: number; away: number }

function groupByMonth(events: TriberEvent[]): [string, TriberEvent[]][] {
  const map = new Map<string, TriberEvent[]>()
  for (const e of events) {
    const key = new Date(e.start_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    const cap = key.charAt(0).toUpperCase() + key.slice(1)
    if (!map.has(cap)) map.set(cap, [])
    map.get(cap)!.push(e)
  }
  return Array.from(map.entries())
}

export default function EventsPage() {
  const { events, attendanceMap, pendingEventId, userRole, getEvents, createEvent, updateAttendance, deleteEvent, loading, error } = useEvents()
  const [showForm, setShowForm] = useState(false)
  const [showPast, setShowPast] = useState(false)
  const [matchScores, setMatchScores] = useState<Record<string, Score>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserName, setCurrentUserName] = useState<string | null>(null)

  useEffect(() => {
    getEvents()
    createClient().auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null)
      setCurrentUserName((user?.user_metadata?.full_name as string | undefined) ?? null)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const ids = events.filter(e => e.type === 'match').map(e => e.id)
    if (!ids.length) return
    createClient().from('match_results').select('event_id,score_home,score_away').in('event_id', ids)
      .then(({ data }) => {
        if (data) setMatchScores(Object.fromEntries(
          data.map(r => [r.event_id as string, { home: r.score_home as number, away: r.score_away as number }])
        ))
      })
  }, [events])

  const canCreate = userRole === 'admin' || userRole === 'member_active'
  const now = Date.now()

  const upcoming = events
    .filter(e => new Date(e.start_at).getTime() >= now || e.status === 'ongoing' || e.status === 'half_time')
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())

  const past = events
    .filter(e => new Date(e.start_at).getTime() < now && e.status !== 'ongoing' && e.status !== 'half_time')
    .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime())

  const upcomingByMonth = groupByMonth(upcoming)

  const cardProps = (event: TriberEvent) => ({
    event, currentStatus: (attendanceMap[event.id] as AttendanceStatus) ?? null,
    onAttendance: updateAttendance, canDelete: canCreate, onDelete: deleteEvent,
    score: matchScores[event.id] ?? null,
    onScoreSaved: (id: string, h: number, a: number) => setMatchScores(s => ({ ...s, [id]: { home: h, away: a } })),
    isPendingAttendance: pendingEventId === event.id,
    currentUserId: currentUserId ?? undefined, currentUserName,
  })

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-brand-bg px-4 py-8`}>
      <div className="max-w-lg lg:max-w-[90%] mx-auto space-y-5">
        <PageHeader title="Événements" subtitle={`${events.length} événement${events.length !== 1 ? 's' : ''}`}
          action={canCreate && !showForm ? <Button onClick={() => setShowForm(true)} size="sm">+ Créer</Button> : undefined} />

        {error && <p className="text-sm text-secondary bg-secondary-light rounded-xl px-3 py-2">{error}</p>}
        {showForm && <EventForm onSubmit={async d => { const ok = await createEvent(d); if (ok) setShowForm(false); return ok }} onCancel={() => setShowForm(false)} loading={loading} />}

        {loading && !showForm && (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-[#D1D1D6] h-32 animate-pulse" />)}</div>
        )}

        {!loading && (
          <div className="space-y-6">
            {/* À venir — groupés par mois */}
            {upcomingByMonth.length > 0 && upcomingByMonth.map(([month, monthEvents]) => (
              <div key={month} className="space-y-3">
                <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest px-1 font-[family-name:var(--font-nunito)]">
                  {month} · {monthEvents.length}
                </p>
                {monthEvents.map(e => <EventCard key={e.id} {...cardProps(e)} />)}
              </div>
            ))}

            {/* Passés */}
            {past.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest font-[family-name:var(--font-nunito)]">
                    Passés · {past.length}
                  </p>
                  {!showPast && (
                    <button onClick={() => setShowPast(true)}
                      className="text-xs text-success font-semibold font-[family-name:var(--font-nunito)]">
                      Voir tout
                    </button>
                  )}
                </div>
                {showPast && past.map(e => <EventCard key={e.id} {...cardProps(e)} />)}
              </div>
            )}

            {events.length === 0 && !showForm && (
              <div className="text-center py-12">
                <p className="text-sm text-[#6B7280] font-[family-name:var(--font-nunito)]">Aucun événement pour l&apos;instant.</p>
                {canCreate && (
                  <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-success font-semibold font-[family-name:var(--font-nunito)]">
                    + Créer le premier événement
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
