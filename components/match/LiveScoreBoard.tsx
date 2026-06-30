'use client'

import { Pause, Play } from 'lucide-react'
import { LiveTimer } from './LiveTimer'

interface Props {
  orgName: string; opponent: string; us: number; them: number
  status: string | null; startedAt: string | null; pausedAt: string | null
  totalPausedSeconds: number; loading: boolean; isHome?: boolean | null
  orgLogoUrl?: string | null; onHalfTime: () => void; onResume: () => void
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
      <p className={`text-[11px] font-[800] text-white/80 uppercase tracking-tight leading-tight font-[family-name:var(--font-barlow)] max-w-[80px] line-clamp-2 ${align === 'left' ? 'text-left' : 'text-right'}`}>{name}</p>
    </div>
  )
}

export function LiveScoreBoard({ orgName, opponent, us, them, status, startedAt, pausedAt, totalPausedSeconds, loading, isHome, orgLogoUrl, onHalfTime, onResume }: Props) {
  const isLive = status === 'ongoing'
  const isHalf = status === 'half_time'
  const isDone = status === 'finished'
  const leftName = isHome !== false ? orgName : opponent
  const rightName = isHome !== false ? opponent : orgName
  const leftScore = isHome !== false ? us : them
  const rightScore = isHome !== false ? them : us
  const leftLogo = isHome !== false ? orgLogoUrl : null
  const rightLogo = isHome !== false ? null : orgLogoUrl

  const halfLabel = (() => {
    if (!startedAt || !isLive) return null
    const minElapsed = (Date.now() - new Date(startedAt).getTime()) / 60000 - totalPausedSeconds / 60
    return minElapsed <= 45 ? '1ère MT' : '2ème MT'
  })()

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg" style={{ background: 'linear-gradient(160deg, #1C2117 0%, #252b1d 55%, #2A3020 100%)' }}>
      <div className="px-5 pt-4 pb-1">
        {isLive && (
          <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest font-[family-name:var(--font-nunito)]">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> En direct
          </span>
        )}
        {isHalf && <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-[family-name:var(--font-nunito)]">Mi-temps</span>}
        {isDone && <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-[family-name:var(--font-nunito)]">Terminé</span>}
        {(!status || status === 'upcoming') && <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-[family-name:var(--font-nunito)]">À venir</span>}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 pb-2">
        <TeamBadge name={leftName} logoUrl={leftLogo} align="left" />
        <div className="text-[72px] font-[800] font-[family-name:var(--font-barlow)] tabular-nums leading-none text-white tracking-tighter px-2 text-center">
          {leftScore} – {rightScore}
        </div>
        <TeamBadge name={rightName} logoUrl={rightLogo} align="right" />
      </div>

      <div className="flex items-center justify-center gap-3 pb-5 pt-2">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
          {isLive && <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse flex-shrink-0" />}
          <LiveTimer startedAt={startedAt} pausedAt={pausedAt} totalPausedSeconds={totalPausedSeconds} status={status} compact />
          {(isLive || isHalf) && (
            <>
              <span className="text-white/30 select-none">·</span>
              <span className="text-white/60 text-xs font-[family-name:var(--font-nunito)]">
                {isHalf ? 'Mi-temps' : (halfLabel ?? '1ère MT')}
              </span>
            </>
          )}
        </div>
        {isLive && (
          <button onClick={onHalfTime} disabled={loading}
            className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors disabled:opacity-50 font-[family-name:var(--font-nunito)]">
            <Pause className="w-3 h-3 fill-current" /> Pause
          </button>
        )}
        {isHalf && (
          <button onClick={onResume} disabled={loading}
            className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors disabled:opacity-50 font-[family-name:var(--font-nunito)]">
            <Play className="w-3 h-3 fill-current" /> Reprendre
          </button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}
