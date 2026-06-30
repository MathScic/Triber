'use client'

import { LiveTimer } from './LiveTimer'

interface Props {
  homeTeam: string
  awayTeam: string
  scoreHome: number
  scoreAway: number
  homeLogoUrl?: string | null
  awayLogoUrl?: string | null
  startedAt?: string | null
  pausedAt?: string | null
  totalPausedSeconds?: number
  status?: string | null
}

function TeamBadge({ name, logoUrl, align }: { name: string; logoUrl?: string | null; align: 'left' | 'right' }) {
  const initials = name.split(/\s+/).filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 3) || '?'
  return (
    <div className={`flex flex-col ${align === 'left' ? 'items-start' : 'items-end'} gap-2`}>
      <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white/20 bg-white/10 flex-shrink-0 flex items-center justify-center">
        {logoUrl
          ? <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
          : <span className="text-white/80 font-[800] text-sm font-[family-name:var(--font-barlow)]">{initials}</span>
        }
      </div>
      <p className={`text-[11px] font-[800] text-white/80 uppercase tracking-tight leading-tight font-[family-name:var(--font-barlow)] max-w-[90px] line-clamp-2 ${align === 'left' ? 'text-left' : 'text-right'}`}>{name}</p>
    </div>
  )
}

export function ScoreHeader({ homeTeam, awayTeam, scoreHome, scoreAway, homeLogoUrl, awayLogoUrl, startedAt, pausedAt, totalPausedSeconds = 0, status }: Props) {
  const isLive = status === 'ongoing'
  const isHalf = status === 'half_time'
  const isDone = status === 'finished'

  const halfLabel = (() => {
    if (!startedAt || !isLive) return null
    const minElapsed = (Date.now() - new Date(startedAt).getTime()) / 60000 - totalPausedSeconds / 60
    return minElapsed <= 45 ? '1ère MT' : '2ème MT'
  })()

  return (
    <div style={{ background: 'linear-gradient(160deg, #1C2117 0%, #252b1d 55%, #2A3020 100%)' }} className="px-5 pt-6 pb-5">
      <div className="max-w-lg mx-auto">
        {/* Badge statut */}
        <div className="mb-3">
          {isLive && (
            <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest font-[family-name:var(--font-nunito)]">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> En direct
            </span>
          )}
          {isHalf && <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-[family-name:var(--font-nunito)]">Mi-temps</span>}
          {isDone && <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-[family-name:var(--font-nunito)]">Terminé</span>}
          {!status && <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-[family-name:var(--font-nunito)]">À venir</span>}
        </div>

        {/* Score hero */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-4">
          <TeamBadge name={homeTeam} logoUrl={homeLogoUrl} align="left" />
          <p className="text-[72px] font-[800] text-white tracking-tighter text-center font-[family-name:var(--font-barlow)] tabular-nums leading-none px-2">
            {scoreHome} — {scoreAway}
          </p>
          <TeamBadge name={awayTeam} logoUrl={awayLogoUrl} align="right" />
        </div>

        {/* Chip chrono */}
        {startedAt !== undefined && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
              {isLive && <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse flex-shrink-0" />}
              <LiveTimer startedAt={startedAt ?? null} pausedAt={pausedAt ?? null} totalPausedSeconds={totalPausedSeconds} status={status ?? null} compact />
              {(isLive || isHalf) && (
                <>
                  <span className="text-white/30 select-none">·</span>
                  <span className="text-white/60 text-xs font-[family-name:var(--font-nunito)]">
                    {isHalf ? 'Mi-temps' : (halfLabel ?? '1ère MT')}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
