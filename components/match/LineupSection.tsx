'use client'

import { useState } from 'react'
import type { LivePlayer } from '@/lib/hooks/useLiveMatchPublic'

function abbrev(name: string): string {
  const p = name.trim().split(' ')
  return p.length < 2 ? name : `${p[0][0]}.${p.slice(1).join(' ')}`
}

interface Props {
  players: LivePlayer[]
  initialOpen?: boolean
}

export function LineupSection({ players, initialOpen = false }: Props) {
  const [open, setOpen] = useState(initialOpen)
  const starters = players.filter(p => p.is_starter)
  const subs = players.filter(p => !p.is_starter)

  if (!players.length) return null

  return (
    <div className="mb-5">
      {!initialOpen && (
        <button onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 py-2 px-1 w-full text-left cursor-pointer">
          <span className="text-xs font-bold text-brand-muted tracking-widest uppercase font-[family-name:var(--font-nunito)]">
            Composition · {starters.length} tit. · {subs.length} rem.
          </span>
          <span className="text-brand-muted text-xs ml-auto">{open ? '▲' : '▼'}</span>
        </button>
      )}

      {(open || initialOpen) && (
        <div className="bg-white rounded-xl border border-brand-border p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold text-brand-muted tracking-widest uppercase mb-2 font-[family-name:var(--font-nunito)]">
                Titulaires
              </p>
              {starters.map(p => (
                <div key={p.user_id} className="flex items-center gap-2 py-0.5">
                  {p.jersey != null && (
                    <span className="w-5 h-5 rounded-full bg-success flex items-center justify-center text-[10px] font-[800] text-white leading-none flex-shrink-0 font-[family-name:var(--font-barlow)]">
                      {p.jersey}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-brand-dark truncate font-[family-name:var(--font-nunito)]">{abbrev(p.name)}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-bold text-brand-muted tracking-widest uppercase mb-2 font-[family-name:var(--font-nunito)]">
                Remplaçants
              </p>
              {subs.map(p => (
                <div key={p.user_id} className="flex items-center gap-2 py-0.5">
                  {p.jersey != null && (
                    <span className="w-5 h-5 rounded-full bg-brand-sand flex items-center justify-center text-[10px] font-[800] text-brand-muted leading-none flex-shrink-0 font-[family-name:var(--font-barlow)]">
                      {p.jersey}
                    </span>
                  )}
                  <span className="text-sm text-brand-muted truncate font-[family-name:var(--font-nunito)]">{abbrev(p.name)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
