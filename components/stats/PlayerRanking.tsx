import type { PlayerStatRow } from '@/lib/hooks/useStats'

const RANK_LABELS = ['#1', '#2', '#3', '#4', '#5']

interface Props { playerStats: PlayerStatRow[] }

// Agrège les stats par joueur sur tous les matchs de la saison
function aggregate(stats: PlayerStatRow[], key: 'goals' | 'assists') {
  const map = new Map<string, { name: string | null; total: number }>()
  for (const s of stats) {
    const current = map.get(s.user_id) ?? { name: s.profiles?.full_name ?? null, total: 0 }
    map.set(s.user_id, { ...current, total: current.total + (s[key] ?? 0) })
  }
  return Array.from(map.values())
    .filter(p => p.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
}

function RankList({ title, data }: { title: string; data: { name: string | null; total: number }[] }) {
  return (
    <div>
      <p className="text-sm font-bold text-brand-dark mb-3">{title}</p>
      {!data.length ? (
        <p className="text-xs text-[#6B7280]">Aucun résultat.</p>
      ) : (
        <div className="space-y-2">
          {data.map((p, i) => {
            const initials = (p.name ?? '?').split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '?'
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#6B7280] w-6 text-center leading-none">{RANK_LABELS[i]}</span>
                <div className="w-7 h-7 rounded-full bg-success flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <span className="text-sm text-brand-dark flex-1 truncate">{p.name ?? '—'}</span>
                <span className="text-sm font-bold text-success tabular-nums">{p.total}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function PlayerRanking({ playerStats }: Props) {
  return (
    <div className="bg-white rounded-xl border border-[#D1D1D6] p-5 grid grid-cols-2 gap-6">
      <RankList title="Buteurs" data={aggregate(playerStats, 'goals')} />
      <RankList title="Passeurs" data={aggregate(playerStats, 'assists')} />
    </div>
  )
}
