'use client'

import { useState, useEffect } from 'react'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import { useEvents, type AttendanceStatus, type CreateEventData } from '@/lib/hooks/useEvents'
import { EventCard } from '@/components/events/EventCard'
import { EventForm } from '@/components/events/EventForm'
import { Button } from '@/components/ui/button'

type Score = { home: number; away: number }

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

export default function EventsPage() {
  const { events, attendanceMap, pendingEventId, userRole, getEvents, createEvent, updateAttendance, deleteEvent, loading, error } = useEvents()
  const [showForm, setShowForm] = useState(false)
  const [matchScores, setMatchScores] = useState<Record<string, Score>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    getEvents()
    createClient().auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id ?? null))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Charge les scores existants après chargement des événements
  useEffect(() => {
    const matchIds = events.filter(e => e.type === 'match').map(e => e.id)
    if (!matchIds.length) return
    createClient().from('match_results').select('event_id, score_home, score_away').in('event_id', matchIds)
      .then(({ data }) => {
        if (data) setMatchScores(Object.fromEntries(
          data.map(r => [r.event_id as string, { home: r.score_home as number, away: r.score_away as number }])
        ))
      })
  }, [events])

  const canCreate = userRole === 'admin' || userRole === 'member_active'

  const handleCreate = async (data: CreateEventData) => {
    const ok = await createEvent(data)
    if (ok) setShowForm(false)
    return ok
  }

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-[#FAF7F2] px-4 py-8`}>
      <div className="max-w-lg mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-[800] text-[#1A1F16] uppercase tracking-tight font-[family-name:var(--font-barlow)]">
              Événements
            </h1>
            <p className="text-sm text-[#7A8070] font-[family-name:var(--font-nunito)]">
              {events.length} événement{events.length !== 1 ? 's' : ''}
            </p>
          </div>
          {canCreate && !showForm && <Button onClick={() => setShowForm(true)} size="sm">+ Créer</Button>}
        </div>

        {error && <p className="text-sm text-[#E8622A] bg-[#FDF0EB] rounded-xl px-3 py-2">{error}</p>}
        {showForm && <EventForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={loading} />}

        {loading && !showForm && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-[#DDD8CE] h-28 animate-pulse" />)}
          </div>
        )}

        {!loading && (
          <div className="space-y-3">
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                currentStatus={(attendanceMap[event.id] as AttendanceStatus) ?? null}
                onAttendance={updateAttendance}
                canDelete={canCreate}
                onDelete={deleteEvent}
                score={matchScores[event.id] ?? null}
                onScoreSaved={(id, h, a) => setMatchScores(s => ({ ...s, [id]: { home: h, away: a } }))}
                isPendingAttendance={pendingEventId === event.id}
                currentUserId={currentUserId ?? undefined}
              />
            ))}
            {events.length === 0 && !showForm && (
              <p className="text-center text-sm text-[#7A8070] py-8 font-[family-name:var(--font-nunito)]">
                Aucun événement pour l'instant.
              </p>
            )}
          </div>
        )}

      </div>
    </main>
  )
}
