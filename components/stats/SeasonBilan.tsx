import type { MatchResult } from '@/lib/hooks/useStats'

interface Props { matchResults: MatchResult[] }

function ourScore(r: MatchResult): number {
  const isHome = (r.events as { is_home?: boolean | null } | null)?.is_home !== false
  return isHome ? r.score_home : r.score_away
}
function theirScore(r: MatchResult): number {
  const isHome = (r.events as { is_home?: boolean | null } | null)?.is_home !== false
  return isHome ? r.score_away : r.score_home
}

export function SeasonBilan({ matchResults }: Props) {
  if (!matchResults.length) return null

  const wins = matchResults.filter(r => ourScore(r) > theirScore(r)).length
  const draws = matchResults.filter(r => ourScore(r) === theirScore(r)).length
  const losses = matchResults.filter(r => ourScore(r) < theirScore(r)).length
  const goalsFor = matchResults.reduce((s, r) => s + ourScore(r), 0)
  const goalsAgainst = matchResults.reduce((s, r) => s + theirScore(r), 0)
  const total = matchResults.length
  const points = wins * 3 + draws
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0
  const goalDiff = goalsFor - goalsAgainst

  return (
    <div className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-[#F4F4F6]">
        <div>
          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest font-[family-name:var(--font-nunito)]">Bilan saison</p>
          <p className="text-sm text-[#6B7280] font-[family-name:var(--font-nunito)]">{total} match{total > 1 ? 's' : ''} joué{total > 1 ? 's' : ''}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-[800] text-[#1A1F16] font-[family-name:var(--font-barlow)] leading-none">{points}</p>
          <p className="text-[10px] text-[#9CA3AF] font-[family-name:var(--font-nunito)] uppercase tracking-widest">points</p>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-[#F4F4F6]">
        <div className="py-5 text-center">
          <p className="text-4xl font-[800] text-[#2A9D4E] font-[family-name:var(--font-barlow)] leading-none">{wins}</p>
          <p className="text-[11px] text-[#6B7280] mt-1.5 font-[family-name:var(--font-nunito)] uppercase tracking-widest font-bold">V</p>
        </div>
        <div className="py-5 text-center">
          <p className="text-4xl font-[800] text-[#6B7280] font-[family-name:var(--font-barlow)] leading-none">{draws}</p>
          <p className="text-[11px] text-[#6B7280] mt-1.5 font-[family-name:var(--font-nunito)] uppercase tracking-widest font-bold">N</p>
        </div>
        <div className="py-5 text-center">
          <p className="text-4xl font-[800] text-[#E8622A] font-[family-name:var(--font-barlow)] leading-none">{losses}</p>
          <p className="text-[11px] text-[#6B7280] mt-1.5 font-[family-name:var(--font-nunito)] uppercase tracking-widest font-bold">D</p>
        </div>
      </div>

      <div className="px-5 pb-4 space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wide font-[family-name:var(--font-nunito)]">Taux de victoire</p>
          <p className="text-[11px] font-[800] text-[#1A1F16] font-[family-name:var(--font-barlow)]">{winRate} %</p>
        </div>
        <div className="h-2 bg-[#F4F4F6] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${winRate}%`, backgroundColor: winRate >= 60 ? '#2A9D4E' : winRate >= 40 ? '#E8622A' : '#EF4444' }} />
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-[#F4F4F6] border-t border-[#F4F4F6] bg-[#FAFAFA]">
        <div className="py-3 text-center">
          <p className="text-xl font-[800] text-[#2A9D4E] font-[family-name:var(--font-barlow)]">{goalsFor}</p>
          <p className="text-[10px] text-[#9CA3AF] font-[family-name:var(--font-nunito)]">Buts pour</p>
        </div>
        <div className="py-3 text-center">
          <p className={`text-xl font-[800] font-[family-name:var(--font-barlow)] ${goalDiff >= 0 ? 'text-[#2A9D4E]' : 'text-[#E8622A]'}`}>
            {goalDiff > 0 ? '+' : ''}{goalDiff}
          </p>
          <p className="text-[10px] text-[#9CA3AF] font-[family-name:var(--font-nunito)]">Diff.</p>
        </div>
        <div className="py-3 text-center">
          <p className="text-xl font-[800] text-[#E8622A] font-[family-name:var(--font-barlow)]">{goalsAgainst}</p>
          <p className="text-[10px] text-[#9CA3AF] font-[family-name:var(--font-nunito)]">Buts contre</p>
        </div>
      </div>
    </div>
  )
}
