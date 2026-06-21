'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Flame } from 'lucide-react'

type Scorer = { name: string | null; goals: number; assists: number }

export function TopScorerCard({ organizationId }: { organizationId: string }) {
  const [scorer, setScorer] = useState<Scorer | null | undefined>(undefined)

  useEffect(() => {
    ;(async () => {
      const s = createClient()
      const { data: events } = await s.from('events')
        .select('id').eq('organization_id', organizationId).eq('type', 'match')
      const ids = (events ?? []).map(e => e.id as string)
      if (!ids.length) { setScorer(null); return }

      const { data } = await s.from('player_stats')
        .select('user_id, goals, assists, profiles(full_name)')
        .in('event_id', ids)
        .gt('goals', 0)

      if (!data?.length) { setScorer(null); return }

      // Agrège les totaux par joueur
      const map = new Map<string, Scorer & { user_id: string }>()
      for (const row of data) {
        const uid = row.user_id as string
        const prev = map.get(uid)
        const rawProfiles = row.profiles
        const profObj = (Array.isArray(rawProfiles) ? rawProfiles[0] : rawProfiles) as { full_name: string | null } | null
        const name = profObj?.full_name ?? null
        map.set(uid, {
          user_id: uid,
          name: prev?.name ?? name,
          goals: (prev?.goals ?? 0) + (row.goals as number),
          assists: (prev?.assists ?? 0) + (row.assists as number),
        })
      }

      const sorted = [...map.values()].sort((a, b) => b.goals - a.goals || b.assists - a.assists)
      if (!sorted[0]) { setScorer(null); return }
      setScorer(sorted[0])
    })()
  }, [organizationId])

  if (scorer === undefined) return <div className="bg-white rounded-2xl border border-[#DDD8CE] h-20 animate-pulse" />
  if (!scorer) return null

  return (
    <div className="bg-white rounded-2xl border border-[#DDD8CE] shadow-sm p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#FDF0EB] flex items-center justify-center flex-shrink-0">
        <Flame className="w-4 h-4 text-[#E8622A]" />
      </div>
      <div>
        <p className="text-xs text-[#7A8070] font-[family-name:var(--font-nunito)]">Top buteur</p>
        <p className="text-sm font-semibold text-[#1A1F16] font-[family-name:var(--font-nunito)]">
          {scorer.name ?? 'Inconnu'}
        </p>
        <p className="text-xs text-[#7A8070] font-[family-name:var(--font-nunito)]">
          {scorer.goals} but{scorer.goals !== 1 ? 's' : ''} · {scorer.assists} passe{scorer.assists !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
