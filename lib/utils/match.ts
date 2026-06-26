import type { MatchAction } from '@/lib/match/types'

export type ActionWithAssist = { main: MatchAction; assist: MatchAction | null }

export function pairActionsWithAssists(actions: MatchAction[]): ActionWithAssist[] {
  const visible = [...actions]
    .filter(a => a.type === 'goal' || a.type === 'yellow_card' || a.type === 'red_card')
    .sort((a, b) => a.minute - b.minute)

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
