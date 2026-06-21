import { Trash2 } from 'lucide-react'
import type { MatchEvent, MatchEventType, OrgMember } from '@/lib/match/types'

interface Props {
  events: MatchEvent[]
  members: OrgMember[]
  onRemove?: (id: string) => void
  opponentName?: string
}

function MatchIcon({ type }: { type: MatchEventType }) {
  if (type === 'yellow_card') return <span className="inline-block w-3 h-4 bg-yellow-400 rounded-[2px] flex-shrink-0" />
  if (type === 'red_card') return <span className="inline-block w-3 h-4 bg-red-600 rounded-[2px] flex-shrink-0" />
  const color = type === 'goal' ? '#2A9D4E' : type === 'own_goal' ? '#E8622A' : '#dc2626'
  return <span className="inline-block w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
}

function resolvePlayerName(ev: MatchEvent, members: OrgMember[], opponentName: string): string {
  if (ev.player_name_free) return ev.player_name_free
  if (!ev.player_id) return ev.type === 'opponent_goal' ? opponentName : '—'
  const m = members.find(m => m.user_id === ev.player_id)
  if (!m) return '—'
  const parts = m.name.split(' ')
  return parts.length > 1 ? `${parts[0][0]}.${parts.slice(1).join(' ')}` : m.name
}

function resolveAssistName(userId: string | null, members: OrgMember[]): string | null {
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
        const isOpp = ev.type === 'opponent_goal'
        const playerName = resolvePlayerName(ev, members, opponentName)
        const assistName = resolveAssistName(ev.assist_player_id, members)

        return (
          <div
            key={ev.id}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-[family-name:var(--font-nunito)] ${
              isOpp ? 'bg-[#FDF0EB]' : 'bg-[#E8F5EE]'
            }`}
          >
            <span className="w-8 text-right flex-shrink-0 font-[800] text-[#1A1F16] font-[family-name:var(--font-barlow)] tabular-nums text-xs">
              {ev.minute}&apos;
            </span>
            <MatchIcon type={ev.type} />
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
