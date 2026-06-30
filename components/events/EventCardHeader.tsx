'use client'

import Link from 'next/link'
import type { TriberEvent } from '@/lib/hooks/useEvents'

const TYPE_LABELS: Record<string, string> = { match: 'Match', training: 'Entraînement', meeting: 'Réunion', other: 'Autre' }
const TYPE_BADGE: Record<string, string> = {
  match: 'bg-success text-white',
  training: 'bg-secondary text-white',
  meeting: 'bg-[#3B82F6] text-white',
  other: 'bg-[#6B7280] text-white',
}

type Score = { home: number; away: number }

function ResultBadge({ home, away, isHome }: Score & { isHome: boolean | null | undefined }) {
  const our = isHome === false ? away : home
  const their = isHome === false ? home : away
  const draw = our === their
  const won = our > their
  const label = draw ? 'Nul' : won ? 'Victoire' : 'Défaite'
  const cls = draw ? 'bg-[#E8E8EA] text-[#6B7280]' : won ? 'bg-primary-light text-success' : 'bg-secondary-light text-secondary'
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}

interface Props { event: TriberEvent; score?: Score | null }

export function EventCardHeader({ event, score }: Props) {
  const date = new Date(event.start_at)
  const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const dateLine = event.location ? `${dateStr} à ${timeStr} · ${event.location}` : `${dateStr} à ${timeStr}`

  return (
    <div className="space-y-1.5">
      {/* Badges — solides */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full font-[family-name:var(--font-nunito)] ${TYPE_BADGE[event.type] ?? TYPE_BADGE.other}`}>
          {TYPE_LABELS[event.type] ?? 'Autre'}
        </span>
        {event.type === 'match' && event.is_home !== null && (
          <span className="text-[11px] font-bold text-white bg-brand-dark px-2.5 py-0.5 rounded-full font-[family-name:var(--font-nunito)]">
            {event.is_home ? 'Dom.' : 'Ext.'}
          </span>
        )}
        {event.category && (
          <span className="text-[11px] font-bold text-white bg-brand-dark px-2.5 py-0.5 rounded-full font-[family-name:var(--font-nunito)]">
            {event.category}
          </span>
        )}
        {event.team_label && (
          <span className="text-[11px] font-bold text-white bg-brand-dark px-2.5 py-0.5 rounded-full font-[family-name:var(--font-nunito)]">
            Éq. {event.team_label}
          </span>
        )}
      </div>

      {/* Titre */}
      <Link href={`/events/${event.id}`} className="block hover:text-success transition-colors">
        <h3 className="font-[800] text-brand-dark text-base uppercase tracking-tight leading-tight font-[family-name:var(--font-barlow)]">
          {event.title}
        </h3>
      </Link>

      {/* Adversaire */}
      {event.type === 'match' && event.opponent && (
        <p className="text-sm text-[#6B7280] font-[family-name:var(--font-nunito)]">vs {event.opponent}</p>
      )}

      {/* Score */}
      {event.type === 'match' && score && (
        <div className="flex items-center gap-2">
          <span className="text-2xl font-[800] text-brand-dark tabular-nums leading-none font-[family-name:var(--font-barlow)]">
            {score.home} — {score.away}
          </span>
          <ResultBadge home={score.home} away={score.away} isHome={event.is_home} />
        </div>
      )}

      {/* Date · Lieu */}
      <p className="text-xs text-[#9CA3AF] font-[family-name:var(--font-nunito)]">{dateLine}</p>
    </div>
  )
}
