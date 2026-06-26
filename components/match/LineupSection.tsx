'use client'

import { useState } from 'react'
import type { LivePlayer } from '@/lib/hooks/useLiveMatchPublic'

function abbrev(name: string): string {
  const p = name.trim().split(' ')
  return p.length < 2 ? name : `${p[0][0]}.${p.slice(1).join(' ')}`
}

export function LineupSection({ players }: { players: LivePlayer[] }) {
  const [open, setOpen] = useState(false)
  const starters = players.filter(p => p.is_starter)
  const subs = players.filter(p => !p.is_starter)

  if (!players.length) return null

  return (
    <div className="mb-5">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 py-2 px-1 w-full text-left cursor-pointer">
        <span className="text-xs font-bold text-[#6B7280] tracking-widest uppercase font-[family-name:var(--font-nunito)]">
          Composition · {starters.length} tit. · {subs.length} rem.
        </span>
        <span className="text-[#6B7280] text-xs ml-auto">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="bg-white rounded-xl border border-[#D1D1D6] p-3 flex flex-col gap-1">
          {starters.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-[#6B7280] tracking-widest uppercase mt-1 font-[family-name:var(--font-nunito)]">
                Titulaires
              </p>
              {starters.map(p => (
                <p key={p.user_id} className="text-sm font-semibold text-[#1A1F16] font-[family-name:var(--font-nunito)]">
                  {p.jersey != null ? `${p.jersey} - ` : ''}{abbrev(p.name)}
                </p>
              ))}
            </>
          )}
          {subs.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-[#6B7280] tracking-widest uppercase mt-2 font-[family-name:var(--font-nunito)]">
                Remplaçants
              </p>
              {subs.map(p => (
                <p key={p.user_id} className="text-sm text-[#6B7280] font-[family-name:var(--font-nunito)]">
                  {p.jersey != null ? `${p.jersey} - ` : ''}{abbrev(p.name)}
                </p>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
