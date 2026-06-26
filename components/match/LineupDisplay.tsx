type Player = { jersey: number | null; name: string; is_starter: boolean }

interface Props {
  starters: Player[]
  subs: Player[]
}

function PlayerRow({ player }: { player: Player }) {
  const display = player.name
    .split(' ')
    .map((p, i) => i === 0 ? p.charAt(0).toUpperCase() + '.' : p)
    .join(' ')

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-6 text-right text-xs font-[800] text-[#6B7280] font-[family-name:var(--font-barlow)] tabular-nums flex-shrink-0">
        {player.jersey ?? '—'}
      </span>
      <span className="text-sm font-semibold text-[#1A1F16] font-[family-name:var(--font-nunito)]">
        {display}
      </span>
    </div>
  )
}

export function LineupDisplay({ starters, subs }: Props) {
  if (!starters.length && !subs.length) return null

  return (
    <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-4 space-y-4">
      <h2 className="text-base font-[800] text-[#1A1F16] uppercase tracking-tight font-[family-name:var(--font-barlow)]">
        Composition
      </h2>
      {starters.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#2A9D4E] mb-1 font-[family-name:var(--font-nunito)] uppercase tracking-wide">
            Titulaires ({starters.length})
          </p>
          {starters.map((p, i) => <PlayerRow key={i} player={p} />)}
        </div>
      )}
      {subs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#6B7280] mb-1 font-[family-name:var(--font-nunito)] uppercase tracking-wide">
            Remplaçants ({subs.length})
          </p>
          {subs.map((p, i) => <PlayerRow key={i} player={p} />)}
        </div>
      )}
    </div>
  )
}
