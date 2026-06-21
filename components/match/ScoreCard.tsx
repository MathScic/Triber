interface Props {
  homeName: string
  awayName: string
  scoreHome: number
  scoreAway: number
  status: string | null
  chrono: string
  orgLogoUrl?: string | null
  orgName?: string
  title: string
  dateStr: string
  location?: string | null
  primaryColor: string
}

export function ScoreCard({ homeName, awayName, scoreHome, scoreAway, status, chrono, orgLogoUrl, title, dateStr, location, primaryColor }: Props) {
  const statusLabel = status === 'ongoing' ? 'En cours' : status === 'finished' ? 'Terminé' : 'À venir'

  return (
    <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryColor}ee, ${primaryColor}99)` }}>
      <div className="px-4 pt-4 pb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {orgLogoUrl && <img src={orgLogoUrl} className="w-7 h-7 rounded-lg object-contain bg-white/20 p-0.5" alt={title} />}
            <span className="text-sm font-semibold opacity-90">{title}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {status === 'ongoing' && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
            <span className="text-xs font-semibold opacity-90 uppercase tracking-wide">
              {chrono || statusLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-bold truncate flex-1 text-center opacity-90">{homeName}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-5xl font-[800] font-[family-name:var(--font-barlow)] tabular-nums leading-none">{scoreHome}</span>
            <span className="text-2xl opacity-60">–</span>
            <span className="text-5xl font-[800] font-[family-name:var(--font-barlow)] tabular-nums leading-none">{scoreAway}</span>
          </div>
          <p className="text-sm font-bold truncate flex-1 text-center opacity-90">{awayName}</p>
        </div>

        <p className="text-center text-xs opacity-70 mt-3 capitalize font-[family-name:var(--font-nunito)]">
          {dateStr}{location ? ` · ${location}` : ''}
        </p>
      </div>
    </div>
  )
}
