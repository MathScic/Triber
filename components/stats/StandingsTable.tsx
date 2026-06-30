import type { StandingRow } from '@/lib/hooks/useStandings'

interface Props {
  rows: StandingRow[]
  primaryColor?: string
  compact?: boolean
}

export function StandingsTable({ rows, primaryColor = '#1E5C38', compact = false }: Props) {
  if (!rows.length) return null

  const display = compact ? rows.slice(0, 5) : rows

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#D1D1D6]">
            <th className="py-2 px-2 text-left text-[10px] font-bold text-[#6B7280] uppercase tracking-widest font-[family-name:var(--font-nunito)] w-8">#</th>
            <th className="py-2 px-2 text-left text-[10px] font-bold text-[#6B7280] uppercase tracking-widest font-[family-name:var(--font-nunito)]">Équipe</th>
            <th className="py-2 px-2 text-center text-[10px] font-bold text-[#6B7280] uppercase tracking-widest font-[family-name:var(--font-nunito)] w-8">J</th>
            {!compact && <>
              <th className="py-2 px-2 text-center text-[10px] font-bold text-[#6B7280] uppercase tracking-widest font-[family-name:var(--font-nunito)] w-8">V</th>
              <th className="py-2 px-2 text-center text-[10px] font-bold text-[#6B7280] uppercase tracking-widest font-[family-name:var(--font-nunito)] w-8">N</th>
              <th className="py-2 px-2 text-center text-[10px] font-bold text-[#6B7280] uppercase tracking-widest font-[family-name:var(--font-nunito)] w-8">D</th>
              <th className="py-2 px-2 text-center text-[10px] font-bold text-[#6B7280] uppercase tracking-widest font-[family-name:var(--font-nunito)] w-14">Bp-Bc</th>
            </>}
            <th className="py-2 px-2 text-center text-[10px] font-bold text-[#6B7280] uppercase tracking-widest font-[family-name:var(--font-nunito)] w-10">Pts</th>
          </tr>
        </thead>
        <tbody>
          {display.map((row) => (
            <tr
              key={row.id}
              className={`border-b border-[#F4F4F6] ${row.is_own_team ? 'font-semibold' : ''}`}
              style={row.is_own_team ? { backgroundColor: `${primaryColor}12` } : undefined}
            >
              <td className="py-2.5 px-2">
                <span className={`text-xs font-[800] font-[family-name:var(--font-barlow)] tabular-nums ${row.is_own_team ? '' : 'text-[#6B7280]'}`}
                  style={row.is_own_team ? { color: primaryColor } : undefined}>
                  {row.rank}
                </span>
              </td>
              <td className="py-2.5 px-2">
                <div className="flex items-center gap-2">
                  {row.is_own_team && (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: primaryColor }} />
                  )}
                  <span className={`text-sm font-[family-name:var(--font-nunito)] ${row.is_own_team ? 'text-brand-dark' : 'text-brand-dark'}`}>
                    {row.team_name}
                  </span>
                </div>
              </td>
              <td className="py-2.5 px-2 text-center text-xs text-[#6B7280] tabular-nums font-[family-name:var(--font-nunito)]">{row.played}</td>
              {!compact && <>
                <td className="py-2.5 px-2 text-center text-xs text-success font-semibold tabular-nums font-[family-name:var(--font-nunito)]">{row.won}</td>
                <td className="py-2.5 px-2 text-center text-xs text-[#6B7280] tabular-nums font-[family-name:var(--font-nunito)]">{row.drawn}</td>
                <td className="py-2.5 px-2 text-center text-xs text-secondary tabular-nums font-[family-name:var(--font-nunito)]">{row.lost}</td>
                <td className="py-2.5 px-2 text-center text-xs text-[#6B7280] tabular-nums font-[family-name:var(--font-nunito)]">{row.goals_for}-{row.goals_against}</td>
              </>}
              <td className="py-2.5 px-2 text-center">
                <span className="text-sm font-[800] font-[family-name:var(--font-barlow)] tabular-nums"
                  style={row.is_own_team ? { color: primaryColor } : { color: 'var(--color-brand-dark)' }}>
                  {row.points}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
