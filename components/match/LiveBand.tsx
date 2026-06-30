'use client'

import { useEffect, useState } from 'react'

interface Props {
  startedAt: string | null
  pausedAt: string | null
  totalPausedSeconds: number | null
  status: string | null
}

function calcSecs(startedAt: string | null, pausedAt: string | null, totalPaused: number, status: string | null): number {
  if (!startedAt) return 0
  const refMs = (status === 'half_time' || status === 'finished') && pausedAt
    ? new Date(pausedAt).getTime() : Date.now()
  return Math.min(90 * 60, Math.max(0, Math.floor((refMs - new Date(startedAt).getTime()) / 1000) - totalPaused))
}

export function LiveBand({ startedAt, pausedAt, totalPausedSeconds, status }: Props) {
  const [secs, setSecs] = useState(() => calcSecs(startedAt, pausedAt, totalPausedSeconds ?? 0, status))

  useEffect(() => {
    setSecs(calcSecs(startedAt, pausedAt, totalPausedSeconds ?? 0, status))
    if (status !== 'ongoing') return
    const id = setInterval(() => setSecs(calcSecs(startedAt, pausedAt, totalPausedSeconds ?? 0, status)), 1000)
    return () => clearInterval(id)
  }, [startedAt, pausedAt, totalPausedSeconds, status])

  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')
  const isHalf = status === 'half_time'
  const isFinished = status === 'finished'

  if (isFinished) {
    return (
      <div className="bg-brand-dark flex items-center justify-center gap-2 pb-4">
        <span className="text-[#6B7280] font-bold text-[11px] tracking-widest">TERMINÉ</span>
      </div>
    )
  }

  return (
    <div className="bg-brand-dark flex items-center justify-center gap-2 pb-4">
      {!isHalf && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />}
      <span className="text-red-500 font-bold text-[11px] tracking-widest font-[family-name:var(--font-nunito)]">
        {isHalf ? 'MI-TEMPS' : 'EN DIRECT'}
      </span>
      <span className="text-white font-bold text-base tracking-wide font-[family-name:var(--font-barlow)] tabular-nums">
        {isHalf ? 'MT' : `${mm}:${ss}`}
      </span>
    </div>
  )
}
