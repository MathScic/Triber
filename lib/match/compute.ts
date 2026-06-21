import type { SupabaseClient } from '@supabase/supabase-js'

// Recalcule le score depuis les match_events et met à jour match_results
export async function recomputeScore(
  admin: SupabaseClient,
  eventId: string,
  isHome: boolean | null,
): Promise<void> {
  const { count: ourGoals } = await admin.from('match_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId).eq('type', 'goal')

  const { count: oppGoals } = await admin.from('match_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId).in('type', ['own_goal', 'opponent_goal'])

  const us = ourGoals ?? 0
  const them = oppGoals ?? 0
  const home = isHome !== false

  await admin.from('match_results').upsert(
    { event_id: eventId, score_home: home ? us : them, score_away: home ? them : us },
    { onConflict: 'event_id' },
  )
}

// Recalcule les stats d'un joueur pour ce match depuis les match_events
export async function recomputePlayerStats(
  admin: SupabaseClient,
  eventId: string,
  userId: string,
): Promise<void> {
  const { data } = await admin.from('match_events')
    .select('type, player_id, assist_player_id')
    .eq('event_id', eventId)

  const evs = data ?? []
  const goals = evs.filter(e => e.type === 'goal' && e.player_id === userId).length
  const assists = evs.filter(e => e.type === 'goal' && e.assist_player_id === userId).length
  const yellow = evs.filter(e => e.type === 'yellow_card' && e.player_id === userId).length
  const red = evs.filter(e => e.type === 'red_card' && e.player_id === userId).length

  await admin.from('player_stats').upsert(
    { event_id: eventId, user_id: userId, goals, assists, yellow_cards: yellow, red_cards: red, minutes_played: 0 },
    { onConflict: 'event_id,user_id' },
  )
}
