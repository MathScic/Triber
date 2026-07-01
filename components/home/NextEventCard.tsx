'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, MapPin, Check } from 'lucide-react'

type Event = { id: string; title: string; type: string; start_at: string; location: string | null; opponent: string | null }

export function NextEventCard({ organizationId, userId }: { organizationId: string; userId: string }) {
  const [event, setEvent] = useState<Event | null | undefined>(undefined)
  const [attendance, setAttendance] = useState<string | null>(null)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    ;(async () => {
      const s = createClient()
      const { data } = await s.from('events')
        .select('id, title, type, start_at, location, opponent')
        .eq('organization_id', organizationId)
        .gt('start_at', new Date().toISOString())
        .order('start_at', { ascending: true })
        .limit(1).maybeSingle()
      if (!data) { setEvent(null); return }
      setEvent(data as Event)
      if (userId) {
        const { data: att } = await s.from('event_attendees')
          .select('status').eq('event_id', data.id as string).eq('user_id', userId).maybeSingle()
        setAttendance(att?.status as string | null ?? null)
      }
    })()
  }, [organizationId, userId])

  const toggle = async () => {
    if (!event || !userId) return
    setToggling(true)
    const newStatus = attendance === 'confirmed' ? 'declined' : 'confirmed'
    await createClient().from('event_attendees').upsert({ event_id: event.id, user_id: userId, status: newStatus })
    setAttendance(newStatus)
    setToggling(false)
  }

  if (event === undefined) return <div className="bg-white rounded-xl border border-brand-border h-32 animate-pulse" />

  if (!event) return (
    <div className="bg-white rounded-xl border border-brand-border shadow-sm p-4 h-full min-h-[260px] flex flex-col">
      <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 font-[family-name:var(--font-nunito)]">Prochain événement</p>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-brand-muted font-[family-name:var(--font-nunito)]">Aucun événement prévu</p>
      </div>
    </div>
  )

  const date = new Date(event.start_at)
  const day = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase().replace('.', '')
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const daysLeft = Math.ceil((date.getTime() - Date.now()) / 86400000)
  const daysLabel = daysLeft <= 0 ? "Aujourd'hui" : daysLeft === 1 ? 'Demain' : `Dans ${daysLeft} jours`
  const isConfirmed = attendance === 'confirmed'

  return (
    <div className="bg-white rounded-xl border border-brand-border shadow-sm p-4 h-full min-h-[260px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest font-[family-name:var(--font-nunito)]">Prochain événement</p>
        <span className="text-[10px] text-secondary font-semibold font-[family-name:var(--font-nunito)]">{daysLabel}</span>
      </div>
      <div className="flex items-start gap-3 mb-3 flex-1">
        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-primary-light rounded-xl w-14 h-16 px-1">
          <p className="text-[10px] font-bold text-success uppercase font-[family-name:var(--font-nunito)] leading-none">{month}</p>
          <p className="text-3xl font-[800] text-success leading-tight font-[family-name:var(--font-barlow)]">{day}</p>
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="font-[800] text-brand-dark text-sm font-[family-name:var(--font-barlow)] uppercase leading-tight mb-1.5">
            {event.opponent ? `Match vs ${event.opponent}` : event.title}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-brand-muted mb-0.5 font-[family-name:var(--font-nunito)]">
            <Clock className="w-3 h-3 flex-shrink-0" />{timeStr}
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5 text-xs text-brand-muted font-[family-name:var(--font-nunito)]">
              <MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      </div>
      {userId && (
        <button onClick={() => void toggle()} disabled={toggling}
          className={`w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors font-[family-name:var(--font-nunito)] disabled:opacity-50 ${isConfirmed ? 'bg-primary-light text-success border border-success/30' : 'bg-success text-white hover:bg-success/90'}`}>
          <Check className="w-4 h-4" /> {isConfirmed ? 'Présence confirmée' : 'Je serai présent'}
        </button>
      )}
    </div>
  )
}
