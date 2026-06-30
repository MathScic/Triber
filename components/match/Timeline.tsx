import type { LiveAction, LivePlayer } from '@/lib/hooks/useLiveMatchPublic'
import { BallSvg, CardRect } from './MatchIcons'

interface Props {
  actions: LiveAction[]
  players: LivePlayer[]
  opponent: string
  homeLabel?: string
}

type Pair = { main: LiveAction; assist: LiveAction | null }

function buildPairs(actions: LiveAction[]): Pair[] {
  const visible = actions.filter(a => ['goal', 'yellow_card', 'red_card', 'substitution'].includes(a.type))
  const assists = actions.filter(a => a.type === 'assist')
  const usedAssistIds = new Set<string>()
  return visible.map(main => {
    const assist = main.type === 'goal' && main.is_own_team
      ? (assists.find(a => a.minute === main.minute && !usedAssistIds.has(a.id)) ?? null)
      : null
    if (assist) usedAssistIds.add(assist.id)
    return { main, assist }
  })
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

export function Timeline({ actions, players, opponent, homeLabel = 'Domicile' }: Props) {
  const pairs = buildPairs(actions)

  if (!pairs.length) {
    return (
      <div className="bg-white rounded-xl border border-brand-border p-6 text-center">
        <p className="text-sm text-brand-muted font-[family-name:var(--font-nunito)]">Aucune action enregistrée.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
      {/* En-têtes colonnes */}
      <div className="grid grid-cols-2 px-4 py-2.5 border-b border-brand-sand">
        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest font-[family-name:var(--font-nunito)]">{homeLabel}</p>
        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest text-right font-[family-name:var(--font-nunito)]">{opponent}</p>
      </div>

      <div className="divide-y divide-brand-sand">
        {pairs.map(({ main, assist }) => {
          const isOwn = main.is_own_team
          const name = resolveName(main, players, opponent)
          const assistName = assist
            ? resolveName(assist, players, opponent)
            : null
          const jersey = isOwn ? (players.find(p => p.user_id === main.user_id)?.jersey ?? null) : null
          const icon = main.type === 'goal'
            ? <BallSvg color={isOwn ? 'var(--color-success)' : '#ef4444'} />
            : <CardRect color={main.type === 'yellow_card' ? 'yellow' : 'red'} />

          return (
            <div key={main.id} className="grid grid-cols-2">
              <div className="px-3 py-2.5">
                {isOwn && (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-[800] text-brand-muted font-[family-name:var(--font-barlow)] tabular-nums flex-shrink-0">{main.minute}&apos;</span>
                      {icon}
                      <span className="text-xs font-semibold text-brand-dark font-[family-name:var(--font-nunito)] truncate">
                        {jersey != null ? `${jersey} – ` : ''}{name}
                      </span>
                    </div>
                    {assistName && (
                      <p className="text-[11px] text-brand-muted font-[family-name:var(--font-nunito)] pl-10 truncate">↳ {assistName}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="px-3 py-2.5">
                {!isOwn && (
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-xs font-semibold text-red-600 font-[family-name:var(--font-nunito)] truncate text-right">{name}</span>
                    {icon}
                    <span className="text-[11px] font-[800] text-brand-muted font-[family-name:var(--font-barlow)] tabular-nums flex-shrink-0">{main.minute}&apos;</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
