import type { SupabaseClient } from '@supabase/supabase-js'

// Recalcule le score depuis match_actions et met à jour match_results
export async function recomputeScore(admin: SupabaseClient, eventId: string, isHome: boolean | null): Promise<void> {
  const { data } = await admin.from('match_actions')
    .select('type, is_own_team').eq('event_id', eventId).eq('type', 'goal')

  const actions = data ?? []
  const ours = actions.filter(a => a.is_own_team === true).length
  const theirs = actions.filter(a => a.is_own_team === false).length
  const home = isHome !== false

  await admin.from('match_results').upsert(
    { event_id: eventId, score_home: home ? ours : theirs, score_away: home ? theirs : ours },
    { onConflict: 'event_id' },
  )
}

// Recalcule les stats d'un joueur pour ce match depuis match_actions
export async function recomputePlayerStats(admin: SupabaseClient, eventId: string, userId: string): Promise<void> {
  const { data } = await admin.from('match_actions')
    .select('type, user_id').eq('event_id', eventId).eq('user_id', userId)

  const evs = data ?? []
  const goals = evs.filter(e => e.type === 'goal').length
  const assists = evs.filter(e => e.type === 'assist').length
  const yellow = evs.filter(e => e.type === 'yellow_card').length
  const red = evs.filter(e => e.type === 'red_card').length

  await admin.from('player_stats').upsert(
    { event_id: eventId, user_id: userId, goals, assists, yellow_cards: yellow, red_cards: red, minutes_played: 0 },
    { onConflict: 'event_id,user_id' },
  )
}
