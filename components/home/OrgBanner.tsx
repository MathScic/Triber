'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  name: string; fullName: string; logoUrl?: string | null; coverUrl?: string | null
  primaryColor: string; organizationId: string
}

type Bilan = { wins: number; draws: number; losses: number; gf: number; mj: number }

const STATS = (b: Bilan) => [
  { val: b.wins, label: 'Victoires' }, { val: b.draws, label: 'Nuls' },
  { val: b.losses, label: 'Défaites' }, { val: b.mj, label: 'MJ' }, { val: b.gf, label: 'BM' },
]

export function OrgBanner({ name, fullName, logoUrl, coverUrl, primaryColor, organizationId }: Props) {
  const [bilan, setBilan] = useState<Bilan | null>(null)
  const year = new Date().getFullYear()
  const season = `${year}–${year + 1}`

  useEffect(() => {
    ;(async () => {
      const s = createClient()
      const { data: events } = await s.from('events').select('id, is_home').eq('organization_id', organizationId).eq('type', 'match')
      const eventMap = new Map((events ?? []).map(e => [e.id as string, e.is_home as boolean | null]))
      const ids = [...eventMap.keys()]
      if (!ids.length) { setBilan({ wins: 0, draws: 0, losses: 0, gf: 0, mj: 0 }); return }

      const { data: results } = await s.from('match_results').select('event_id, score_home, score_away').in('event_id', ids)
      let wins = 0, draws = 0, losses = 0, gf = 0
      for (const r of results ?? []) {
        const isHome = eventMap.get(r.event_id as string) !== false
        const our = isHome ? (r.score_home as number) : (r.score_away as number)
        const their = isHome ? (r.score_away as number) : (r.score_home as number)
        gf += our
        if (our > their) wins++; else if (our === their) draws++; else losses++
      }
      setBilan({ wins, draws, losses, gf, mj: wins + draws + losses })
    })()
  }, [organizationId])

  const color = primaryColor || '#1E5C38'

  return (
    <div className="rounded-xl overflow-hidden relative" style={{ backgroundColor: color }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.42) 100%)' }} />
      {coverUrl && <img src={coverUrl} className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay" alt="" />}

      <div className="relative p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} className="w-12 h-12 rounded-xl object-contain bg-white/15 p-1 flex-shrink-0" alt={name} />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-[800] font-[family-name:var(--font-barlow)]">{name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-[800] text-white font-[family-name:var(--font-barlow)] uppercase tracking-tight leading-none drop-shadow-sm">{name}</h1>
              <p className="text-sm text-white/70 font-[family-name:var(--font-nunito)] mt-0.5">Bonjour, {fullName} 👋</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex-shrink-0 border border-white/20">
            <span className="text-xs font-semibold text-white font-[family-name:var(--font-nunito)]">Saison {season}</span>
          </div>
        </div>

        <div className="flex items-center gap-5 pt-3 border-t border-white/20">
          {bilan ? (
            <>
              {STATS(bilan).map(({ val, label }, i) => (
                <div key={label} className="text-center">
                  <p className={`text-2xl font-[800] font-[family-name:var(--font-barlow)] leading-none tabular-nums ${i === 0 ? 'text-white' : 'text-white/70'}`}>{val}</p>
                  <p className="text-[10px] text-white/50 uppercase font-[family-name:var(--font-nunito)] tracking-widest mt-0.5">{label}</p>
                </div>
              ))}
            </>
          ) : <div className="h-8 w-40 rounded bg-white/10 animate-pulse" />}
        </div>
      </div>
    </div>
  )
}
