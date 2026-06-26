'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Scorer = { name: string | null; goals: number; assists: number }

const RANK = ['#1', '#2', '#3']

export function TopScorerCard({ organizationId }: { organizationId: string }) {
  const [scorers, setScorers] = useState<Scorer[] | undefined>(undefined)

  useEffect(() => {
    ;(async () => {
      const s = createClient()
      const { data: events } = await s.from('events')
        .select('id').eq('organization_id', organizationId).eq('type', 'match')
      const ids = (events ?? []).map(e => e.id as string)
      if (!ids.length) { setScorers([]); return }

      const { data: actions } = await s.from('match_actions')
        .select('type, user_id, is_own_team')
        .in('event_id', ids)
        .in('type', ['goal', 'assist'])
        .eq('is_own_team', true)

      if (!actions?.length) { setScorers([]); return }

      const map = new Map<string, { goals: number; assists: number }>()
      for (const a of actions) {
        if (!a.user_id) continue
        const uid = a.user_id as string
        if (!map.has(uid)) map.set(uid, { goals: 0, assists: 0 })
        const s = map.get(uid)!
        if (a.type === 'goal') s.goals++
        else s.assists++
      }

      const userIds = [...map.keys()]
      const { data: profiles } = await s.from('profiles').select('id, full_name').in('id', userIds)

      const top = userIds
        .filter(uid => (map.get(uid)?.goals ?? 0) > 0)
        .map(uid => ({ name: profiles?.find(p => p.id === uid)?.full_name ?? null, ...(map.get(uid)!) }))
        .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
        .slice(0, 3)

      setScorers(top)
    })()
  }, [organizationId])

  if (scorers === undefined) return <div className="bg-white rounded-xl border border-[#D1D1D6] h-20 animate-pulse" />
  if (!scorers.length) return null

  return (
    <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-4 space-y-3">
      <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest font-[family-name:var(--font-nunito)]">Top buteurs</p>
      {scorers.map((sc, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-[#6B7280] w-6 text-center leading-none flex-shrink-0">{RANK[i]}</span>
          <div className="w-8 h-8 rounded-full bg-[#2A9D4E] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {(sc.name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
          </div>
          <p className="text-sm font-semibold text-[#1A1F16] flex-1 truncate font-[family-name:var(--font-nunito)]">
            {sc.name ?? 'Inconnu'}
          </p>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-[800] text-[#2A9D4E] font-[family-name:var(--font-barlow)] tabular-nums">
              {sc.goals} <span className="text-[10px] font-normal text-[#6B7280]">but{sc.goals !== 1 ? 's' : ''}</span>
            </p>
            {sc.assists > 0 && (
              <p className="text-[10px] text-[#6B7280] font-[family-name:var(--font-nunito)]">{sc.assists} passe{sc.assists !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
