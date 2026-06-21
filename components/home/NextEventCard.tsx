'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar } from 'lucide-react'

type Event = { title: string; type: string; start_at: string; location: string | null; opponent: string | null }

const TYPE_ICONS: Record<string, string> = { match: '⚽', training: '🏃', meeting: '📋', other: '📌' }

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

  if (event === undefined) return <div className="bg-white rounded-2xl border border-[#DDD8CE] h-20 animate-pulse" />
  if (!event) return null

  const date = new Date(event.start_at)
  const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-white rounded-2xl border border-[#DDD8CE] shadow-sm p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#E8F5EE] flex items-center justify-center flex-shrink-0">
        <Calendar className="w-4 h-4 text-[#2A9D4E]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#7A8070] font-[family-name:var(--font-nunito)]">Prochain événement</p>
        <p className="text-sm font-semibold text-[#1A1F16] font-[family-name:var(--font-nunito)] truncate">
          {TYPE_ICONS[event.type] ?? '📌'} {event.title}
          {event.opponent ? ` · vs ${event.opponent}` : ''}
        </p>
        <p className="text-xs text-[#7A8070] font-[family-name:var(--font-nunito)]">
          {dateStr} à {timeStr}{event.location ? ` · ${event.location}` : ''}
        </p>
      </div>
    </div>
  )
}
