'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type MatchResult = {
  id: string; event_id: string; score_home: number; score_away: number; entered_at: string
  events: { title: string; start_at: string; opponent: string | null } | null
}

export type PlayerStatRow = {
  user_id: string; goals: number; assists: number; minutes_played: number
  yellow_cards: number; red_cards: number
  profiles: { full_name: string | null } | null
}

export type PlayerStatsInput = {
  goals: number; assists: number; minutes_played: number
  yellow_cards: number; red_cards: number
}

export function useStats() {
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStatRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getSeasonStats = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: membership } = await supabase.from('organization_members')
      .select('organization_id').eq('user_id', user.id).single()
    if (!membership) { setLoading(false); return }

    // Récupère les IDs de tous les matchs de l'organisation
    const { data: matchEvents } = await supabase.from('events')
      .select('id').eq('organization_id', membership.organization_id as string).eq('type', 'match')
    const matchIds = (matchEvents ?? []).map(e => e.id as string)
    if (!matchIds.length) { setLoading(false); return }

    // Charge résultats et stats joueurs en parallèle
    const [{ data: results }, { data: stats }] = await Promise.all([
      supabase.from('match_results')
        .select('id, event_id, score_home, score_away, entered_at, events(title, start_at, opponent)')
        .in('event_id', matchIds).order('entered_at', { ascending: false }),
      supabase.from('player_stats')
        .select('user_id, goals, assists, minutes_played, yellow_cards, red_cards, profiles(full_name)')
        .in('event_id', matchIds),
    ])

    setMatchResults((results ?? []) as unknown as MatchResult[])
    setPlayerStats((stats ?? []) as unknown as PlayerStatRow[])
    setLoading(false)
  }

  const saveMatchResult = async (eventId: string, scoreHome: number, scoreAway: number): Promise<boolean> => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/stats/match-result', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, scoreHome, scoreAway }),
      })
      const data = await res.json() as { error?: string }
      setLoading(false)
      if (!res.ok) { setError(data.error ?? 'Erreur lors de la sauvegarde.'); return false }
      return true
    } catch { setError('Impossible de contacter le serveur.'); setLoading(false); return false }
  }

  const savePlayerStats = async (eventId: string, userId: string, stats: PlayerStatsInput): Promise<boolean> => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/stats/player-stats', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId, ...stats }),
      })
      const data = await res.json() as { error?: string }
      setLoading(false)
      if (!res.ok) { setError(data.error ?? 'Erreur lors de la sauvegarde.'); return false }
      return true
    } catch { setError('Impossible de contacter le serveur.'); setLoading(false); return false }
  }

  return { matchResults, playerStats, getSeasonStats, saveMatchResult, savePlayerStats, loading, error }
}
