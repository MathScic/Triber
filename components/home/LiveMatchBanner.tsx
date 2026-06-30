'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type LiveMatch = {
  id: string; title: string; opponent: string | null; is_home: boolean | null; status: string
  started_at: string | null; paused_at: string | null; total_paused_seconds: number | null
}

function calcElapsed(m: LiveMatch): string {
  if (!m.started_at) return '0:00'
  const startMs = new Date(m.started_at).getTime()
  const refMs = m.status === 'ongoing' ? Date.now() : (m.paused_at ? new Date(m.paused_at).getTime() : Date.now())
  const secs = Math.min(90 * 60, Math.max(0, Math.floor((refMs - startMs) / 1000) - (m.total_paused_seconds ?? 0)))
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
}

export function LiveMatchBanner({ organizationId }: { organizationId: string }) {
  const [match, setMatch] = useState<LiveMatch | null | undefined>(undefined)
  const [score, setScore] = useState<{ home: number; away: number } | null>(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    const s = createClient()
    s.from('events')
      .select('id, title, opponent, is_home, status, started_at, paused_at, total_paused_seconds')
      .eq('organization_id', organizationId).in('status', ['ongoing', 'half_time'])
      .limit(1).maybeSingle()
      .then(async ({ data }) => {
        if (!data) { setMatch(null); return }
        const m = data as LiveMatch
        setMatch(m)
        const { data: r } = await s.from('match_results').select('score_home, score_away').eq('event_id', m.id).maybeSingle()
        if (r) setScore({ home: r.score_home as number, away: r.score_away as number })
      })
  }, [organizationId])

  useEffect(() => {
    if (match?.status !== 'ongoing') return
    const interval = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [match?.status])

  if (!match) return null
  const isHalf = match.status === 'half_time'
  const isHome = match.is_home !== false
  const us = isHome ? (score?.home ?? 0) : (score?.away ?? 0)
  const them = isHome ? (score?.away ?? 0) : (score?.home ?? 0)

  return (
    <Link href={`/events/${match.id}/live?from=home`}
      className="block bg-brand-dark rounded-2xl p-4 shadow-sm hover:bg-[#252b1e] transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          {isHalf ? 'Mi-temps' : 'En direct'}
        </span>
        <span className="text-white text-sm font-semibold truncate font-[family-name:var(--font-nunito)] flex-1 min-w-0">
          {match.title}{match.opponent ? ` · vs ${match.opponent}` : ''}
        </span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-white/60 text-xs font-[family-name:var(--font-nunito)]">
          {isHalf ? 'Mi-temps' : calcElapsed(match)}
        </span>
        <span className="text-white font-[800] font-[family-name:var(--font-barlow)] tabular-nums text-2xl tracking-wider">
          {us} – {them}
        </span>
      </div>
    </Link>
  )
}
