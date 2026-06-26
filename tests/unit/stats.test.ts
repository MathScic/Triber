import { describe, it, expect } from 'vitest'

// --- Logique aggregation stats (miroir de useStats) ---

type Action = { type: string; user_id: string | null; player_name: string | null; is_own_team: boolean }
type Entry = { uid: string | null; playerName: string | null; goals: number; assists: number; yellow_cards: number; red_cards: number }

function aggregateActions(actions: Action[]): Map<string, Entry> {
  const map = new Map<string, Entry>()
  for (const a of actions) {
    const uid = a.user_id
    const playerName = a.player_name
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
  return map
}

// --- Logique win/loss (miroir de SeasonBilan / stats page) ---

type MatchResult = { score_home: number; score_away: number; events: { is_home: boolean | null } | null }

function ourScore(r: MatchResult): number {
  const isHome = r.events?.is_home !== false
  return isHome ? r.score_home : r.score_away
}
function theirScore(r: MatchResult): number {
  const isHome = r.events?.is_home !== false
  return isHome ? r.score_away : r.score_home
}

describe('Aggregation des stats depuis match_actions', () => {
  it('compte un but avec user_id présent', () => {
    const map = aggregateActions([
      { type: 'goal', user_id: 'uid-1', player_name: 'Alice', is_own_team: true },
    ])
    expect(map.get('uid-1')?.goals).toBe(1)
  })

  it('compte un but avec user_id null mais player_name présent (mobile)', () => {
    const map = aggregateActions([
      { type: 'goal', user_id: null, player_name: 'Mathieu Scicluna', is_own_team: true },
    ])
    expect(map.get('Mathieu Scicluna')?.goals).toBe(1)
  })

  it('ne compte pas les buts adverses (is_own_team false)', () => {
    const map = aggregateActions([
      { type: 'goal', user_id: null, player_name: 'Adversaire', is_own_team: false },
    ])
    expect(map.get('Adversaire')?.goals).toBe(0)
  })

  it('ignore les actions sans user_id ni player_name', () => {
    const map = aggregateActions([
      { type: 'goal', user_id: null, player_name: null, is_own_team: true },
    ])
    expect(map.size).toBe(0)
  })

  it('cumule buts et passes du même joueur (par player_name)', () => {
    const map = aggregateActions([
      { type: 'goal', user_id: null, player_name: 'Bob', is_own_team: true },
      { type: 'goal', user_id: null, player_name: 'Bob', is_own_team: true },
      { type: 'assist', user_id: null, player_name: 'Bob', is_own_team: true },
    ])
    const entry = map.get('Bob')!
    expect(entry.goals).toBe(2)
    expect(entry.assists).toBe(1)
  })

  it('comptabilise les cartons jaunes correctement', () => {
    const map = aggregateActions([
      { type: 'yellow_card', user_id: 'uid-2', player_name: 'Carol', is_own_team: true },
    ])
    expect(map.get('uid-2')?.yellow_cards).toBe(1)
  })
})

describe('Calcul victoire / défaite / nul (is_home aware)', () => {
  it('victoire à domicile : score_home > score_away', () => {
    const r: MatchResult = { score_home: 3, score_away: 1, events: { is_home: true } }
    expect(ourScore(r)).toBe(3)
    expect(theirScore(r)).toBe(1)
    expect(ourScore(r) > theirScore(r)).toBe(true)
  })

  it('défaite à domicile : score_home < score_away', () => {
    const r: MatchResult = { score_home: 0, score_away: 2, events: { is_home: true } }
    expect(ourScore(r)).toBe(0)
    expect(theirScore(r)).toBe(2)
    expect(ourScore(r) < theirScore(r)).toBe(true)
  })

  it('victoire à l\'extérieur : score_away > score_home', () => {
    const r: MatchResult = { score_home: 1, score_away: 3, events: { is_home: false } }
    expect(ourScore(r)).toBe(3)
    expect(theirScore(r)).toBe(1)
    expect(ourScore(r) > theirScore(r)).toBe(true)
  })

  it('défaite à l\'extérieur : score_away < score_home', () => {
    const r: MatchResult = { score_home: 4, score_away: 0, events: { is_home: false } }
    expect(ourScore(r)).toBe(0)
    expect(theirScore(r)).toBe(4)
    expect(ourScore(r) < theirScore(r)).toBe(true)
  })

  it('nul : scores égaux', () => {
    const r: MatchResult = { score_home: 1, score_away: 1, events: { is_home: true } }
    expect(ourScore(r) === theirScore(r)).toBe(true)
  })

  it('events null → traité comme match à domicile par défaut', () => {
    const r: MatchResult = { score_home: 2, score_away: 0, events: null }
    expect(ourScore(r)).toBe(2)
  })
})
