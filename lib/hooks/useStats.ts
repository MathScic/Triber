'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type MatchResult = {
  id: string; event_id: string; score_home: number; score_away: number; entered_at: string
  events: { title: string; start_at: string; opponent: string | null; is_home: boolean | null } | null
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState<string>('#2A9D4E')
  const [userRole, setUserRole] = useState<string>('member')
  const [client] = useState(() => createClient())

  const loadStats = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await client.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: membership } = await client.from('organization_members')
      .select('organization_id, role, organizations(primary_color)')
      .eq('user_id', user.id).single()
    if (!membership) { setLoading(false); return }

    const orgId = membership.organization_id as string
    setOrganizationId(orgId)
    setUserRole((membership.role as string | undefined) ?? 'member')
    const rawOrg = membership.organizations
    const org = (Array.isArray(rawOrg) ? rawOrg[0] : rawOrg) as { primary_color: string | null } | null
    setPrimaryColor(org?.primary_color ?? '#2A9D4E')

    const { data: matchEvents } = await client.from('events')
      .select('id').eq('organization_id', orgId).eq('type', 'match')
    const matchIds = (matchEvents ?? []).map(e => e.id as string)
    if (!matchIds.length) { setMatchResults([]); setPlayerStats([]); setLoading(false); return }

    const [{ data: results }, { data: actions }] = await Promise.all([
      client.from('match_results')
        .select('id, event_id, score_home, score_away, entered_at, events(title, start_at, opponent, is_home)')
        .in('event_id', matchIds).order('entered_at', { ascending: false }),
      client.from('match_actions')
        .select('type, user_id, player_name, is_own_team')
        .in('event_id', matchIds),
    ])

    setMatchResults((results ?? []) as unknown as MatchResult[])

    // Clé = user_id si présent, sinon player_name (actions insérées par le mobile)
    type Entry = { uid: string | null; playerName: string | null; goals: number; assists: number; yellow_cards: number; red_cards: number }
    const map = new Map<string, Entry>()
    for (const a of actions ?? []) {
      const uid = a.user_id as string | null
      const playerName = a.player_name as string | null
      const key = uid ?? playerName
      if (!key) continue
      if (!map.has(key)) map.set(key, { uid, playerName, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0 })
      const entry = map.get(key)!
      if (uid && !entry.uid) entry.uid = uid
      if (a.type === 'goal' && a.is_own_team) entry.goals++
      else if (a.type === 'assist' && a.is_own_team) entry.assists++
      else if (a.type === 'yellow_card') entry.yellow_cards++
      else if (a.type === 'red_card') entry.red_cards++
    }

    if (map.size > 0) {
      const uids = Array.from(map.values()).map(v => v.uid).filter(Boolean) as string[]
      const { data: profiles } = uids.length
        ? await client.from('profiles').select('id, full_name').in('id', uids)
        : { data: [] }
      const rows: PlayerStatRow[] = Array.from(map.values())
        .map(({ uid, playerName, ...stats }) => {
          const profile = uid ? (profiles ?? []).find(p => p.id === uid) ?? null : null
          const displayName = profile?.full_name ?? playerName ?? null
          return { user_id: uid ?? playerName ?? 'unknown', ...stats, minutes_played: 0, profiles: { full_name: displayName } }
        })
        .filter(r => r.goals > 0 || r.assists > 0 || r.yellow_cards > 0 || r.red_cards > 0)
        .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
      setPlayerStats(rows)
    } else {
      setPlayerStats([])
    }
    setLoading(false)
  }, [client])

  useEffect(() => {
    void loadStats()

    // Mise à jour en temps réel dès qu'un but/carton est ajouté ou retiré
    const ch = client.channel('stats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_actions' }, () => void loadStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_results' }, () => void loadStats())
      .subscribe()

    return () => { void client.removeChannel(ch) }
  }, [client, loadStats])

  const saveMatchResult = async (eventId: string, scoreHome: number, scoreAway: number): Promise<boolean> => {
    setError(null)
    try {
      const res = await fetch('/api/stats/match-result', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, scoreHome, scoreAway }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { setError(data.error ?? 'Erreur lors de la sauvegarde.'); return false }
      return true
    } catch { setError('Impossible de contacter le serveur.'); return false }
  }

  const savePlayerStats = async (eventId: string, userId: string, stats: PlayerStatsInput): Promise<boolean> => {
    setError(null)
    try {
      const res = await fetch('/api/stats/player-stats', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId, ...stats }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { setError(data.error ?? 'Erreur lors de la sauvegarde.'); return false }
      return true
    } catch { setError('Impossible de contacter le serveur.'); return false }
  }

  return { matchResults, playerStats, loading, error, organizationId, primaryColor, userRole, saveMatchResult, savePlayerStats }
}
