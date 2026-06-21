export type MatchEventType = 'goal' | 'own_goal' | 'opponent_goal' | 'yellow_card' | 'red_card'

export type MatchEvent = {
  id: string
  type: MatchEventType
  minute: number
  player_id: string | null
  assist_player_id: string | null
}

export type OrgMember = {
  user_id: string
  name: string
  jersey: number | null
}

export const EVENT_ICONS: Record<MatchEventType, string> = {
  goal: '⚽',
  own_goal: '🔄',
  opponent_goal: '⚽',
  yellow_card: '🟨',
  red_card: '🟥',
}

export const EVENT_LABELS: Record<MatchEventType, string> = {
  goal: 'But',
  own_goal: 'But CSC',
  opponent_goal: 'But adverse',
  yellow_card: 'Carton jaune',
  red_card: 'Carton rouge',
}
