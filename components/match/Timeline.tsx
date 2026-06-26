import type { LiveAction, LivePlayer } from '@/lib/hooks/useLiveMatchPublic'
import { ActionRow } from './ActionRow'

interface Props {
  actions: LiveAction[]
  players: LivePlayer[]
  opponent: string
}

type Pair = { main: LiveAction; assist: LiveAction | null }

function buildPairs(actions: LiveAction[]): Pair[] {
  const visible = actions.filter(a =>
    a.type === 'goal' || a.type === 'yellow_card' || a.type === 'red_card' || a.type === 'substitution'
  )
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

export function Timeline({ actions, players, opponent }: Props) {
  const pairs = buildPairs(actions)

  if (!pairs.length) {
    return (
      <p className="text-sm text-[#6B7280] text-center mt-5 font-[family-name:var(--font-nunito)]">
        Aucune action enregistrée.
      </p>
    )
  }

  return (
    <div className="flex flex-col pb-5">
      {pairs.map(({ main, assist }) => (
        <ActionRow key={main.id} action={main} assistAction={assist} players={players} opponent={opponent} />
      ))}
    </div>
  )
}
