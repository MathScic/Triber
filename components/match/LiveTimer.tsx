'use client'

import { useEffect, useState } from 'react'

interface Props {
  startedAt: string | null
  status: string | null
  elapsedMinutes: number
}

function calcSec(startedAt: string | null, status: string | null, base: number): number {
  if (status === 'ongoing' && startedAt) {
    const from = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
    return Math.min(90 * 60, base * 60 + from)
  }
  return base * 60
}

export function LiveTimer({ startedAt, status, elapsedMinutes }: Props) {
  const [totalSec, setTotalSec] = useState(() => calcSec(startedAt, status, elapsedMinutes))

  useEffect(() => {
    setTotalSec(calcSec(startedAt, status, elapsedMinutes))
    if (status !== 'ongoing') return
    const id = setInterval(() => setTotalSec(calcSec(startedAt, status, elapsedMinutes)), 1000)
    return () => clearInterval(id)
  }, [startedAt, status, elapsedMinutes])

  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  const label =
    status === 'half_time' ? 'Mi-temps' :
    status === 'finished' ? 'Terminé' :
    status === 'ongoing' ? null : 'À venir'

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2">
        {status === 'ongoing' && (
          <span className="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0" />
        )}
        <span className="font-[800] font-[family-name:var(--font-barlow)] tabular-nums text-3xl leading-none text-white">
          {min.toString().padStart(2, '0')}:{sec.toString().padStart(2, '0')}
        </span>
      </div>
      {label && (
        <p className="text-xs text-white/70 mt-1 font-[family-name:var(--font-nunito)] uppercase tracking-wide">
          {label}
        </p>
      )}
    </div>
  )
}
