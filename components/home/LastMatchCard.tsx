'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Buteur = { name: string; minute: number }
type Result = { score_home: number; score_away: number; is_home: boolean | null; opponent: string | null; buteurs: Buteur[] }

export function LastMatchCard({ organizationId, orgLogoUrl }: { organizationId: string; orgLogoUrl?: string | null }) {
  const [result, setResult] = useState<Result | null | undefined>(undefined)

  useEffect(() => {
    ;(async () => {
      const s = createClient()
      const { data: events } = await s.from('events').select('id').eq('organization_id', organizationId).eq('type', 'match')
      const ids = (events ?? []).map(e => e.id as string)
      if (!ids.length) { setResult(null); return }

      const { data } = await s.from('match_results')
        .select('event_id, score_home, score_away, events(opponent, is_home)')
        .in('event_id', ids).order('entered_at', { ascending: false }).limit(1).maybeSingle()
      if (!data) { setResult(null); return }

      const ev = (Array.isArray(data.events) ? data.events[0] : data.events) as { opponent: string | null; is_home: boolean | null } | null
      const { data: actions } = await s.from('match_actions')
        .select('user_id, player_name, minute')
        .eq('event_id', data.event_id as string).eq('type', 'goal').eq('is_own_team', true).order('minute')

      const uids = (actions ?? []).filter(a => a.user_id).map(a => a.user_id as string)
      const { data: profiles } = uids.length ? await s.from('profiles').select('id, full_name').in('id', uids) : { data: [] }
      const pm = new Map((profiles ?? []).map(p => [p.id, p.full_name]))
      const buteurs: Buteur[] = (actions ?? []).map(a => ({
        minute: a.minute as number,
        name: ((a.player_name ?? pm.get(a.user_id as string) ?? '?') as string).split(' ')[0],
      }))
      setResult({ score_home: data.score_home as number, score_away: data.score_away as number, is_home: ev?.is_home ?? null, opponent: ev?.opponent ?? null, buteurs })
    })()
  }, [organizationId])

  if (result === undefined) return <div className="bg-white rounded-xl border border-brand-border h-28 animate-pulse" />

  if (!result) return (
    <div className="bg-white rounded-xl border border-brand-border shadow-sm p-4 h-full min-h-[260px] flex flex-col">
      <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 font-[family-name:var(--font-nunito)]">Dernier résultat</p>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-brand-muted font-[family-name:var(--font-nunito)]">Aucun résultat</p>
      </div>
    </div>
  )

  const isHome = result.is_home !== false
  const us = isHome ? result.score_home : result.score_away
  const them = isHome ? result.score_away : result.score_home
  const won = us > them; const draw = us === them
  const label = draw ? 'Nul' : won ? 'Victoire' : 'Défaite'
  const labelColor = draw ? 'text-brand-muted' : won ? 'text-success' : 'text-secondary'

  return (
    <div className="bg-white rounded-xl border border-brand-border shadow-sm p-4 h-full min-h-[260px]">
      <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3 font-[family-name:var(--font-nunito)]">Dernier résultat</p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center overflow-hidden flex-shrink-0">
            {orgLogoUrl ? <img src={orgLogoUrl} alt="club" className="w-full h-full object-contain p-1" /> : <span className="text-xs font-bold text-success font-[family-name:var(--font-barlow)]">FC</span>}
          </div>
          <p className="text-[10px] text-brand-muted font-[family-name:var(--font-nunito)]">{isHome ? 'Domicile' : 'Extérieur'}</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-[800] text-brand-dark font-[family-name:var(--font-barlow)] tabular-nums">{us} – {them}</p>
          <span className={`text-xs font-semibold ${labelColor} font-[family-name:var(--font-nunito)]`}>{label}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-xl bg-brand-sand flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-brand-muted font-[family-name:var(--font-barlow)]">ADV</span>
          </div>
          <p className="text-[10px] text-brand-muted font-[family-name:var(--font-nunito)]">{isHome ? 'Extérieur' : 'Domicile'}</p>
        </div>
      </div>
      {result.buteurs.length > 0 && (
        <p className="mt-3 pt-3 border-t border-brand-sand text-xs text-brand-muted font-[family-name:var(--font-nunito)]">
          {result.buteurs.map(b => `${b.name} ${b.minute}'`).join(' · ')}
        </p>
      )}
    </div>
  )
}
