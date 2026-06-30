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
        <div className="bg-white rounded-xl border border-brand-border p-4 flex flex-col gap-1">
          {starters.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-brand-muted tracking-widest uppercase mt-1 mb-2 font-[family-name:var(--font-nunito)]">
                Titulaires
              </p>
              {starters.map(p => (
                <div key={p.user_id} className="flex items-center gap-2 py-0.5">
                  {p.jersey != null && (
                    <span className="text-xs font-[800] text-brand-muted w-5 text-right font-[family-name:var(--font-barlow)]">{p.jersey}</span>
                  )}
                  <span className="text-sm font-semibold text-brand-dark font-[family-name:var(--font-nunito)]">{abbrev(p.name)}</span>
                </div>
              ))}
            </>
          )}
          {subs.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-brand-muted tracking-widest uppercase mt-3 mb-2 font-[family-name:var(--font-nunito)]">
                Remplaçants
              </p>
              {subs.map(p => (
                <div key={p.user_id} className="flex items-center gap-2 py-0.5">
                  {p.jersey != null && (
                    <span className="text-xs font-[800] text-brand-muted w-5 text-right font-[family-name:var(--font-barlow)]">{p.jersey}</span>
                  )}
                  <span className="text-sm text-brand-muted font-[family-name:var(--font-nunito)]">{abbrev(p.name)}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
