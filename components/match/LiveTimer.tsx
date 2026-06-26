'use client'

import { useEffect, useState } from 'react'

interface Props {
  startedAt: string | null
  pausedAt: string | null
  totalPausedSeconds: number
  status: string | null
}

// Aligné avec la formule mobile :
// elapsed = (ref - started_at) / 1000 - total_paused_seconds
// ref = paused_at si en pause, sinon now()
function calcSec(startedAt: string | null, pausedAt: string | null, totalPausedSec: number, status: string | null): number {
  if (!startedAt) return 0
  const startMs = new Date(startedAt).getTime()
  const refMs = (status === 'half_time' || status === 'finished') && pausedAt
    ? new Date(pausedAt).getTime()
    : Date.now()
  return Math.min(90 * 60, Math.max(0, Math.floor((refMs - startMs) / 1000) - totalPausedSec))
}

export function LiveTimer({ startedAt, pausedAt, totalPausedSeconds, status }: Props) {
  const [totalSec, setTotalSec] = useState(() => calcSec(startedAt, pausedAt, totalPausedSeconds, status))

  useEffect(() => {
    const update = () => setTotalSec(calcSec(startedAt, pausedAt, totalPausedSeconds, status))
    update()
    if (status !== 'ongoing') return
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [startedAt, pausedAt, totalPausedSeconds, status])

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
