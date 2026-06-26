// Aligné avec match_actions (table partagée mobile + web)
export type MatchActionType = 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution'

export type MatchAction = {
  id: string
  type: MatchActionType
  minute: number
  is_own_team: boolean
  user_id: string | null
  player_name: string | null
  player_in_id: string | null
  player_in_name: string | null
}

export type OrgMember = {
  user_id: string
  name: string
  jersey: number | null
}

export const ACTION_LABELS: Record<MatchActionType, string> = {
  goal: 'But',
  assist: 'Passe décisive',
  yellow_card: 'Carton jaune',
  red_card: 'Carton rouge',
  substitution: 'Remplacement',
}
