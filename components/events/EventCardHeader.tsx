'use client'

import type { TriberEvent } from '@/lib/hooks/useEvents'

const TYPE_LABELS: Record<string, string> = { match: 'Match', training: 'Entraînement', meeting: 'Réunion', other: 'Autre' }
const TYPE_COLORS: Record<string, string> = {
  match: 'bg-[#E8F5EE] text-[#2A9D4E]', training: 'bg-[#FDF0EB] text-[#E8622A]',
  meeting: 'bg-[#EFF6FF] text-[#3B82F6]', other: 'bg-[#F0EBE1] text-[#7A8070]',
}

type Score = { home: number; away: number }

function ResultBadge({ home, away }: Score) {
  const draw = home === away; const won = home > away
  const label = draw ? 'Nul' : won ? 'Victoire' : 'Défaite'
  const cls = draw ? 'bg-[#F0EBE1] text-[#7A8070]' : won ? 'bg-[#E8F5EE] text-[#2A9D4E]' : 'bg-[#FDF0EB] text-[#E8622A]'
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}

interface Props { event: TriberEvent; score?: Score | null }

export function EventCardHeader({ event, score }: Props) {
  const date = new Date(event.start_at)
  const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-1.5">
      {/* Ligne 1 : badges + date/heure */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full font-[family-name:var(--font-nunito)] ${TYPE_COLORS[event.type]}`}>
            {TYPE_LABELS[event.type]}
          </span>
          {event.type === 'match' && event.is_home !== null && (
            <span className="text-xs text-[#7A8070] bg-[#F0EBE1] px-2 py-0.5 rounded-full font-[family-name:var(--font-nunito)]">
              {event.is_home ? 'Domicile' : 'Extérieur'}
            </span>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-bold text-[#1A1F16] font-[family-name:var(--font-nunito)]">{dateStr}</p>
          <p className="text-xs text-[#7A8070] font-[family-name:var(--font-nunito)]">{timeStr}</p>
        </div>
      </div>
      {/* Ligne 2 : titre */}
      <h3 className="font-[800] text-[#1A1F16] text-base uppercase tracking-tight leading-tight font-[family-name:var(--font-barlow)]">
        {event.title}
      </h3>
      {/* Ligne 3 : adversaire */}
      {event.type === 'match' && event.opponent && (
        <p className="text-xs text-[#7A8070] font-[family-name:var(--font-nunito)]">vs {event.opponent}</p>
      )}
      {/* Ligne 4 : score + badge résultat */}
      {event.type === 'match' && score && (
        <div className="flex items-center gap-2">
          <span className="text-2xl font-[800] text-[#1A1F16] tabular-nums leading-none font-[family-name:var(--font-barlow)]">
            {score.home} — {score.away}
          </span>
          <ResultBadge home={score.home} away={score.away} />
        </div>
      )}
      {/* Ligne 5 : lieu */}
      {event.location && (
        <p className="text-xs text-[#7A8070] font-[family-name:var(--font-nunito)]">📍 {event.location}</p>
      )}
    </div>
  )
}
