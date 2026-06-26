'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Trophy } from 'lucide-react'

type Result = {
  score_home: number; score_away: number; is_home: boolean | null
  opponent: string | null; title: string; eventId: string
}

export function LastMatchCard({ organizationId }: { organizationId: string }) {
  const [result, setResult] = useState<Result | null | undefined>(undefined)

  useEffect(() => {
    ;(async () => {
      const s = createClient()
      const { data: events } = await s.from('events')
        .select('id').eq('organization_id', organizationId).eq('type', 'match')
      const ids = (events ?? []).map(e => e.id as string)
      if (!ids.length) { setResult(null); return }

      const { data } = await s.from('match_results')
        .select('event_id, score_home, score_away, events(title, opponent, is_home)')
        .in('event_id', ids).order('entered_at', { ascending: false }).limit(1).maybeSingle()

      if (!data) { setResult(null); return }
      const rawEv = data.events
      const ev = (Array.isArray(rawEv) ? rawEv[0] : rawEv) as { title: string; opponent: string | null; is_home: boolean | null } | null
      setResult({
        score_home: data.score_home as number,
        score_away: data.score_away as number,
        is_home: ev?.is_home ?? null,
        opponent: ev?.opponent ?? null,
        title: ev?.title ?? 'Match',
        eventId: data.event_id as string,
      })
    })()
  }, [organizationId])

  if (result === undefined) return <div className="bg-white rounded-xl border border-[#D1D1D6] h-20 animate-pulse" />
  if (!result) return null

  const isHome = result.is_home !== false
  const our = isHome ? result.score_home : result.score_away
  const their = isHome ? result.score_away : result.score_home
  const won = our > their
  const draw = our === their
  const label = draw ? 'Nul' : won ? 'Victoire' : 'Défaite'
  const color = draw ? '#6B7280' : won ? '#2A9D4E' : '#E8622A'

  return (
    <div
      className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-4 flex items-center justify-between"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Trophy className="w-4 h-4" style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">Dernier match</p>
          <p className="text-sm font-semibold text-[#1A1F16] font-[family-name:var(--font-nunito)] leading-tight">
            {result.opponent ? `vs ${result.opponent}` : result.title}
          </p>
          <span className="text-xs font-semibold" style={{ color }}>{label}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-[800] text-[#1A1F16] font-[family-name:var(--font-barlow)] tabular-nums leading-none">
          {our} – {their}
        </p>
        <Link
          href={`/match/${result.eventId}`}
          className="text-[10px] text-[#2A9D4E] hover:underline font-[family-name:var(--font-nunito)]"
        >
          Voir le direct →
        </Link>
      </div>
    </div>
  )
}
