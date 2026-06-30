'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar } from 'lucide-react'

type Event = { title: string; type: string; start_at: string; location: string | null; opponent: string | null }

export function NextEventCard({ organizationId }: { organizationId: string }) {
  const [event, setEvent] = useState<Event | null | undefined>(undefined)

  useEffect(() => {
    ;(async () => {
      const { data } = await createClient()
        .from('events')
        .select('title, type, start_at, location, opponent')
        .eq('organization_id', organizationId)
        .gt('start_at', new Date().toISOString())
        .order('start_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      setEvent(data as Event | null)
    })()
  }, [organizationId])

  if (event === undefined) return <div className="bg-white rounded-xl border border-[#D1D1D6] h-20 animate-pulse" />
  if (!event) return null

  const date = new Date(event.start_at)
  const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const TYPE_COLOR: Record<string, string> = { match: 'var(--color-success)', training: 'var(--color-secondary)', meeting: '#3B82F6', other: '#D1D1D6' }
  const accent = TYPE_COLOR[event.type] ?? '#D1D1D6'

  return (
    <div
      className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-4 flex items-center gap-3"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
        <Calendar className="w-4 h-4 text-success" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">Prochain événement</p>
        <p className="text-sm font-semibold text-brand-dark font-[family-name:var(--font-nunito)] truncate">
          {event.title}
          {event.opponent ? ` · vs ${event.opponent}` : ''}
        </p>
        <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">
          {dateStr} à {timeStr}{event.location ? ` · ${event.location}` : ''}
        </p>
      </div>
    </div>
  )
}
