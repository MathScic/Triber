import type { MatchResult } from '@/lib/hooks/useStats'

interface Props { results: MatchResult[] }

export function MatchResultsTable({ results }: Props) {
  if (!results.length) return null

  return (
    <div className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F4F4F6]">
        <h2 className="text-base font-[800] text-brand-dark uppercase tracking-tight font-[family-name:var(--font-barlow)]">
          Résultats
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-[family-name:var(--font-nunito)]">
          <thead>
            <tr className="border-b border-[#F4F4F6]">
              {['Date', 'Match', 'Adversaire', 'Score', 'Résultat'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-[#9CA3AF] px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map(r => {
              const ev = r.events
              const isHome = ev?.is_home !== false
              const our = isHome ? r.score_home : r.score_away
              const their = isHome ? r.score_away : r.score_home
              const won = our > their
              const draw = our === their
              const label = draw ? 'Nul' : won ? 'Victoire' : 'Défaite'
              const labelStyle = draw
                ? 'bg-brand-bg text-[#6B7280]'
                : won
                  ? 'bg-[#D1FAE5] text-[#065F46]'
                  : 'bg-[#FEE2E2] text-[#B91C1C]'
              const date = ev?.start_at
                ? new Date(ev.start_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                : '—'

              return (
                <tr key={r.id} className="border-b border-[#F4F4F6] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-5 py-3.5 text-[#6B7280] whitespace-nowrap">{date}</td>
                  <td className="px-5 py-3.5 font-semibold text-brand-dark truncate max-w-[140px]">{ev?.title ?? 'Match'}</td>
                  <td className="px-5 py-3.5 text-[#6B7280]">{ev?.opponent ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-lg font-[800] tabular-nums text-brand-dark font-[family-name:var(--font-barlow)]">
                      {our} – {their}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${labelStyle}`}>{label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
