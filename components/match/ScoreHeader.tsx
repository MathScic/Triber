interface Props {
  homeTeam: string
  awayTeam: string
  scoreHome: number
  scoreAway: number
  homeLogoUrl?: string | null
  awayLogoUrl?: string | null
}

function TeamBadge({ name, logoUrl, align }: { name: string; logoUrl?: string | null; align: 'left' | 'right' }) {
  const initials = name.split(/\s+/).filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 3) || '?'
  return (
    <div className={`flex flex-col ${align === 'left' ? 'items-start' : 'items-end'} gap-1.5`}>
      <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/20 bg-white/10 flex-shrink-0 flex items-center justify-center">
        {logoUrl
          ? <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
          : <span className="text-white/80 font-[800] text-xs font-[family-name:var(--font-barlow)]">{initials}</span>
        }
      </div>
      <p className={`text-[10px] font-[800] text-white uppercase tracking-tight leading-tight font-[family-name:var(--font-barlow)] max-w-[80px] line-clamp-2 ${align === 'left' ? 'text-left' : 'text-right'}`}>{name}</p>
    </div>
  )
}

export function ScoreHeader({ homeTeam, awayTeam, scoreHome, scoreAway, homeLogoUrl, awayLogoUrl }: Props) {
  return (
    <div style={{ background: 'linear-gradient(160deg, #1C2117 0%, #252b1d 55%, #2A3020 100%)' }} className="px-5 pt-8 pb-5">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 max-w-lg mx-auto">
        <TeamBadge name={homeTeam} logoUrl={homeLogoUrl} align="left" />
        <p className="text-[64px] font-black text-white tracking-tighter text-center font-[family-name:var(--font-barlow)] tabular-nums leading-none px-2">
          {scoreHome} — {scoreAway}
        </p>
        <TeamBadge name={awayTeam} logoUrl={awayLogoUrl} align="right" />
      </div>
    </div>
  )
}
