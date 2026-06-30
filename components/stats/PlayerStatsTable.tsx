import type { PlayerStatRow } from '@/lib/hooks/useStats'

interface Props { rows: PlayerStatRow[] }

const RANK_RING = [
  'bg-[#FEF3C7] text-[#92400E]',
  'bg-[#F3F4F6] text-[#4B5563]',
  'bg-[#FEF0E6] text-[#9A3412]',
]

function GoalBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <span className={`text-sm font-[800] tabular-nums w-5 text-right font-[family-name:var(--font-barlow)] flex-shrink-0 ${value > 0 ? 'text-success' : 'text-[#D1D1D6]'}`}>{value}</span>
      <div className="flex-1 h-1.5 bg-brand-bg rounded-full overflow-hidden">
        <div className="h-full bg-success rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function PlayerStatsTable({ rows }: Props) {
  if (!rows.length) {
    return (
      <div className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm px-5 py-10 text-center space-y-2">
        <p className="text-3xl">📊</p>
        <p className="text-sm font-semibold text-brand-dark font-[family-name:var(--font-nunito)]">Pas encore de statistiques</p>
        <p className="text-xs text-[#9CA3AF] font-[family-name:var(--font-nunito)]">
          Les stats se mettent à jour automatiquement pendant les matchs en direct.
        </p>
      </div>
    )
  }

  const maxGoals = Math.max(...rows.map(r => r.goals), 1)
  const topAssister = [...rows].sort((a, b) => b.assists - a.assists)[0]

  return (
    <div className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F4F4F6] flex items-center justify-between">
        <h2 className="text-base font-[800] text-brand-dark uppercase tracking-tight font-[family-name:var(--font-barlow)]">
          Statistiques joueurs
        </h2>
        {topAssister.assists > 0 && (
          <div className="text-right">
            <p className="text-[10px] text-[#9CA3AF] font-[family-name:var(--font-nunito)]">Top passeur</p>
            <p className="text-xs font-bold text-brand-dark font-[family-name:var(--font-nunito)]">
              {topAssister.profiles?.full_name?.split(' ')[0] ?? '—'} · {topAssister.assists} passe{topAssister.assists > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm font-[family-name:var(--font-nunito)] min-w-[340px]">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-[#F4F4F6]">
              <th className="text-left text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest px-4 py-2.5 w-10">#</th>
              <th className="text-left text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest px-2 py-2.5">Joueur</th>
              <th className="text-left text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest px-2 py-2.5 min-w-[100px]">Buts</th>
              <th className="text-center text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest px-2 py-2.5">Passes</th>
              <th className="text-center text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest px-2 py-2.5">
                <span className="inline-block w-3.5 h-4 rounded-[2px] bg-yellow-400 align-middle" />
              </th>
              <th className="text-center text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest px-2 py-2.5">
                <span className="inline-block w-3.5 h-4 rounded-[2px] bg-red-500 align-middle" />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.user_id} className={`border-b border-[#F4F4F6] last:border-0 ${i === 0 && r.goals > 0 ? 'bg-[#F6FFF8]' : ''}`}>
                <td className="px-4 py-3.5 text-center">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${i < RANK_RING.length && r.goals > 0 ? RANK_RING[i] : 'text-[#9CA3AF]'}`}>
                    {i + 1}
                  </span>
                </td>
                <td className="px-2 py-3.5 font-semibold text-brand-dark max-w-[120px] truncate">
                  {r.profiles?.full_name ?? '—'}
                </td>
                <td className="px-2 py-3.5"><GoalBar value={r.goals} max={maxGoals} /></td>
                <td className="px-2 py-3.5 text-center">
                  <span className={`text-sm font-bold tabular-nums font-[family-name:var(--font-barlow)] ${r.assists > 0 ? 'text-brand-dark' : 'text-[#D1D1D6]'}`}>
                    {r.assists > 0 ? r.assists : '—'}
                  </span>
                </td>
                <td className="px-2 py-3.5 text-center">
                  {r.yellow_cards > 0
                    ? <span className="inline-flex items-center justify-center w-6 h-7 rounded-[3px] bg-yellow-400 text-[10px] font-bold text-yellow-900">{r.yellow_cards}</span>
                    : <span className="text-[#D1D1D6] text-xs">—</span>}
                </td>
                <td className="px-2 py-3.5 text-center">
                  {r.red_cards > 0
                    ? <span className="inline-flex items-center justify-center w-6 h-7 rounded-[3px] bg-red-500 text-[10px] font-bold text-white">{r.red_cards}</span>
                    : <span className="text-[#D1D1D6] text-xs">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 bg-[#FAFAFA] border-t border-[#F4F4F6]">
        <p className="text-[10px] text-[#9CA3AF] font-[family-name:var(--font-nunito)]">
          Classé par nombre de buts · Carton jaune / rouge par saison
        </p>
      </div>
    </div>
  )
}
