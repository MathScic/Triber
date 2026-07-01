'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Scorer = { name: string | null; goals: number; assists: number }

const AVATAR_COLORS = ['bg-secondary', 'bg-success', 'bg-brand-muted']

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
        .in('event_id', ids).in('type', ['goal', 'assist']).eq('is_own_team', true)

      if (!actions?.length) { setScorers([]); return }

      const map = new Map<string, { goals: number; assists: number }>()
      for (const a of actions) {
        if (!a.user_id) continue
        const uid = a.user_id as string
        if (!map.has(uid)) map.set(uid, { goals: 0, assists: 0 })
        const entry = map.get(uid)!
        if (a.type === 'goal') entry.goals++; else entry.assists++
      }

      const userIds = [...map.keys()]
      const { data: profiles } = await s.from('profiles').select('id, full_name').in('id', userIds)

      setScorers(
        userIds
          .filter(uid => (map.get(uid)?.goals ?? 0) > 0)
          .map(uid => ({ name: profiles?.find(p => p.id === uid)?.full_name ?? null, ...(map.get(uid)!) }))
          .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
          .slice(0, 3)
      )
    })()
  }, [organizationId])

  if (scorers === undefined) return <div className="bg-white rounded-xl border border-brand-border h-28 animate-pulse" />

  return (
    <div className="bg-white rounded-xl border border-brand-border shadow-sm p-4 h-full min-h-[260px] flex flex-col">
      <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 font-[family-name:var(--font-nunito)]">Top 3 buteurs</p>
      {scorers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-brand-muted font-[family-name:var(--font-nunito)]">Aucun buteur cette saison</p>
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {scorers.map((sc, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm font-[800] text-brand-muted w-4 text-center leading-none font-[family-name:var(--font-barlow)] flex-shrink-0">{i + 1}</span>
              <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[i]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {(sc.name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
              </div>
              <p className="text-sm font-semibold text-brand-dark flex-1 truncate font-[family-name:var(--font-nunito)]">
                {sc.name ? `${sc.name.split(' ')[0][0]}. ${sc.name.split(' ').slice(1).join(' ')}` : 'Inconnu'}
              </p>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-[800] text-success font-[family-name:var(--font-barlow)] tabular-nums">
                  {sc.goals} <span className="text-[10px] font-normal text-brand-muted">but{sc.goals !== 1 ? 's' : ''}</span>
                </p>
                {sc.assists > 0 && <p className="text-[10px] text-brand-muted font-[family-name:var(--font-nunito)]">{sc.assists} passe{sc.assists !== 1 ? 's' : ''}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
