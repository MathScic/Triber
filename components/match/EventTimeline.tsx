import { Trash2 } from 'lucide-react'
import type { MatchEvent, OrgMember } from '@/lib/match/types'
import { EVENT_ICONS } from '@/lib/match/types'

interface Props {
  events: MatchEvent[]
  members: OrgMember[]
  onRemove?: (id: string) => void
  opponentName?: string
}

function resolveName(userId: string | null, members: OrgMember[]): string | null {
  if (!userId) return null
  const m = members.find(m => m.user_id === userId)
  if (!m) return null
  const parts = m.name.split(' ')
  return parts.length > 1 ? `${parts[0][0]}.${parts.slice(1).join(' ')}` : m.name
}

export function EventTimeline({ events, members, onRemove, opponentName = 'Adversaire' }: Props) {
  const sorted = [...events].sort((a, b) => a.minute - b.minute)

  if (!sorted.length) {
    return (
      <p className="text-sm text-center text-[#7A8070] py-4 font-[family-name:var(--font-nunito)]">
        Aucune action pour l'instant.
      </p>
    )
  }

  return (
    <div className="space-y-1">
      {sorted.map(ev => {
        const icon = EVENT_ICONS[ev.type]
        const isOpp = ev.type === 'opponent_goal'
        const playerName = resolveName(ev.player_id, members) ?? (isOpp ? opponentName : '—')
        const assistName = resolveName(ev.assist_player_id, members)

        return (
          <div
            key={ev.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-[family-name:var(--font-nunito)] ${
              isOpp ? 'bg-[#FDF0EB]' : 'bg-[#E8F5EE]'
            }`}
          >
            <span className="w-10 text-right flex-shrink-0 font-[800] text-[#1A1F16] font-[family-name:var(--font-barlow)] tabular-nums">
              {ev.minute}'
            </span>
            <span className="text-base">{icon}</span>
            <span className={`flex-1 font-semibold ${isOpp ? 'text-[#E8622A]' : 'text-[#1A1F16]'}`}>
              {playerName}
              {assistName && (
                <span className="font-normal text-[#7A8070]"> (pass. {assistName})</span>
              )}
            </span>
            {onRemove && (
              <button onClick={() => onRemove(ev.id)} className="text-[#7A8070] hover:text-[#E8622A] transition-colors flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
