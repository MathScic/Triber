import type { LiveAction, LivePlayer } from '@/lib/hooks/useLiveMatchPublic'

const TYPE_ICONS: Record<string, string> = {
  goal: 'But', yellow_card: 'J', red_card: 'R', substitution: '↔',
}

function fmtName(name: string): string {
  const p = name.trim().split(' ')
  return p.length === 1 ? p[0] : `${p[0]} ${(p[p.length - 1][0] ?? '').toUpperCase()}.`
}

function resolveName(action: LiveAction, players: LivePlayer[], opponent: string): string {
  if (!action.is_own_team) return opponent
  if (action.player_name) return fmtName(action.player_name)
  if (!action.user_id) return '—'
  const p = players.find(m => m.user_id === action.user_id)
  return p ? fmtName(p.name) : '—'
}

interface Props {
  action: LiveAction
  assistAction: LiveAction | null
  players: LivePlayer[]
  opponent: string
}

export function ActionRow({ action, assistAction, players, opponent }: Props) {
  const isOwn = action.is_own_team
  const name = resolveName(action, players, opponent)
  const icon = TYPE_ICONS[action.type] ?? '•'
  const assistName = assistAction
    ? (assistAction.player_name ? fmtName(assistAction.player_name) : (players.find(m => m.user_id === assistAction.user_id)?.name ? fmtName(players.find(m => m.user_id === assistAction.user_id)!.name) : null))
    : null

  return (
    <div className={`flex ${isOwn ? 'flex-row' : 'flex-row-reverse'} mb-3`}>
      <div className={`flex flex-col items-center ${isOwn ? 'mr-3' : 'ml-3'} flex-shrink-0`}>
        <div className={`w-2.5 h-2.5 rounded-full ${isOwn ? 'bg-[#2A9D4E]' : 'bg-[#DC2626]'}`} />
        <div className="w-0.5 flex-1 bg-[#D1D1D6] mt-1" />
      </div>
      <div className={isOwn ? '' : 'text-right'}>
        <p className="text-sm font-semibold text-[#1A1F16] font-[family-name:var(--font-nunito)]">
          {icon} {name} — {action.minute}&apos;
        </p>
        {assistName && (
          <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">
            {assistName} (passe déc.)
          </p>
        )}
      </div>
    </div>
  )
}
