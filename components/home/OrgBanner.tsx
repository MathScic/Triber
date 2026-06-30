'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  name: string
  fullName: string
  logoUrl?: string | null
  coverUrl?: string | null
  initial: string
  primaryColor: string
  organizationId: string
}

type Bilan = { wins: number; draws: number; losses: number }

export function OrgBanner({ name, fullName, logoUrl, coverUrl, initial, primaryColor, organizationId }: Props) {
  const [bilan, setBilan] = useState<Bilan | null>(null)

  useEffect(() => {
    ;(async () => {
      const s = createClient()
      const { data: events } = await s
        .from('events')
        .select('id, is_home')
        .eq('organization_id', organizationId)
        .eq('type', 'match')

      const eventMap = new Map((events ?? []).map(e => [e.id as string, e.is_home as boolean | null]))
      const ids = [...eventMap.keys()]
      if (!ids.length) { setBilan({ wins: 0, draws: 0, losses: 0 }); return }

      const { data: results } = await s
        .from('match_results')
        .select('event_id, score_home, score_away')
        .in('event_id', ids)

      let wins = 0, draws = 0, losses = 0
      for (const r of results ?? []) {
        const isHome = eventMap.get(r.event_id as string) !== false
        const our = isHome ? (r.score_home as number) : (r.score_away as number)
        const their = isHome ? (r.score_away as number) : (r.score_home as number)
        if (our > their) wins++
        else if (our === their) draws++
        else losses++
      }
      setBilan({ wins, draws, losses })
    })()
  }, [organizationId])

  const color = primaryColor || '#1E5C38'

  return (
    <div className="rounded-xl overflow-hidden relative" style={{ backgroundColor: color }}>
      {/* Overlay dégradé sombre */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)' }} />

      {/* Photo de couverture en fond subtil */}
      {coverUrl && (
        <img src={coverUrl} className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay" alt="" />
      )}

      <div className="relative p-5">
        {/* Logo + nom + avatar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                className="w-12 h-12 rounded-xl object-contain bg-white/15 p-1 flex-shrink-0"
                alt={name}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-[800] font-[family-name:var(--font-barlow)]">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-[800] text-white font-[family-name:var(--font-barlow)] uppercase tracking-tight leading-none drop-shadow-sm">
                {name}
              </h1>
              <p className="text-sm text-white/70 font-[family-name:var(--font-nunito)] mt-0.5">
                Bonjour, {fullName}
              </p>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/30">
            <span className="text-white text-sm font-[800] font-[family-name:var(--font-barlow)]">{initial}</span>
          </div>
        </div>

        {/* Bilan saison */}
        <div className="flex items-center gap-6 pt-3 border-t border-white/20">
          {bilan ? (
            <>
              <div className="text-center">
                <p className="text-2xl font-[800] text-white font-[family-name:var(--font-barlow)] leading-none tabular-nums">
                  {bilan.wins}
                </p>
                <p className="text-[10px] text-white/60 uppercase font-[family-name:var(--font-nunito)] tracking-widest mt-0.5">
                  Victoires
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-[800] text-white/70 font-[family-name:var(--font-barlow)] leading-none tabular-nums">
                  {bilan.draws}
                </p>
                <p className="text-[10px] text-white/50 uppercase font-[family-name:var(--font-nunito)] tracking-widest mt-0.5">
                  Nuls
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-[800] text-white/70 font-[family-name:var(--font-barlow)] leading-none tabular-nums">
                  {bilan.losses}
                </p>
                <p className="text-[10px] text-white/50 uppercase font-[family-name:var(--font-nunito)] tracking-widest mt-0.5">
                  Défaites
                </p>
              </div>
            </>
          ) : (
            <div className="h-8 w-32 rounded bg-white/10 animate-pulse" />
          )}
          <p className="ml-auto text-[10px] text-white/40 font-[family-name:var(--font-nunito)] uppercase tracking-widest self-end pb-0.5">
            Saison en cours
          </p>
        </div>
      </div>
    </div>
  )
}
