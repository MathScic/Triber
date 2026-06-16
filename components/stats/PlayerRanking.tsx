import type { PlayerStatRow } from '@/lib/hooks/useStats'

const MEDALS = ['🥇', '🥈', '🥉', '4.', '5.']

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
      <p className="text-sm font-bold text-[#1A1F16] mb-3">{title}</p>
      {!data.length ? (
        <p className="text-xs text-[#7A8070]">Aucun résultat.</p>
      ) : (
        <div className="space-y-2">
          {data.map((p, i) => {
            const initials = (p.name ?? '?').split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '?'
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-base w-6 text-center leading-none">{MEDALS[i]}</span>
                <div className="w-7 h-7 rounded-full bg-[#2A9D4E] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <span className="text-sm text-[#1A1F16] flex-1 truncate">{p.name ?? '—'}</span>
                <span className="text-sm font-bold text-[#2A9D4E] tabular-nums">{p.total}</span>
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
    <div className="bg-white rounded-2xl border border-[#DDD8CE] p-5 grid grid-cols-2 gap-6">
      <RankList title="⚽ Buteurs" data={aggregate(playerStats, 'goals')} />
      <RankList title="🅰️ Passeurs" data={aggregate(playerStats, 'assists')} />
    </div>
  )
}
