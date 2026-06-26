import { describe, it, expect } from 'vitest'
import { pairActionsWithAssists } from '@/lib/utils/match'
import type { MatchAction } from '@/lib/match/types'

function mk(id: string, type: MatchAction['type'], minute: number, own = true): MatchAction {
  return { id, type, minute, is_own_team: own, user_id: null, player_name: null, player_in_id: null, player_in_name: null }
}

describe('pairActionsWithAssists', () => {
  it('associe un but avec son assist à la même minute', () => {
    const pairs = pairActionsWithAssists([mk('g1', 'goal', 30), mk('a1', 'assist', 30)])
    expect(pairs).toHaveLength(1)
    expect(pairs[0].main.id).toBe('g1')
    expect(pairs[0].assist?.id).toBe('a1')
  })

  it('but sans assist → assist null', () => {
    const pairs = pairActionsWithAssists([mk('g1', 'goal', 30)])
    expect(pairs[0].assist).toBeNull()
  })

  it('but adversaire → jamais d\'assist', () => {
    const pairs = pairActionsWithAssists([mk('g1', 'goal', 30, false), mk('a1', 'assist', 30)])
    expect(pairs[0].assist).toBeNull()
  })

  it('2 buts minute 30 + 1 assist : 1 associé, 1 sans', () => {
    const pairs = pairActionsWithAssists([mk('g1', 'goal', 30), mk('g2', 'goal', 30), mk('a1', 'assist', 30)])
    const withAssist = pairs.filter(p => p.assist !== null)
    expect(withAssist).toHaveLength(1)
    // le même assist n'est pas utilisé deux fois
    expect(withAssist[0].assist?.id).toBe('a1')
    expect(pairs.filter(p => p.assist === null)).toHaveLength(1)
  })

  it('assiste non réutilisée pour deux buts', () => {
    const pairs = pairActionsWithAssists([
      mk('g1', 'goal', 30), mk('g2', 'goal', 31),
      mk('a1', 'assist', 30), mk('a2', 'assist', 31),
    ])
    expect(pairs[0].assist?.id).toBe('a1')
    expect(pairs[1].assist?.id).toBe('a2')
  })

  it('trie les actions par minute croissante', () => {
    const pairs = pairActionsWithAssists([mk('g2', 'goal', 75), mk('g1', 'goal', 10)])
    expect(pairs[0].main.minute).toBe(10)
    expect(pairs[1].main.minute).toBe(75)
  })

  it('filtre : ne montre pas les substitutions ni les assists en ligne directe', () => {
    const pairs = pairActionsWithAssists([
      mk('g1', 'goal', 30), mk('yc1', 'yellow_card', 45),
      mk('rc1', 'red_card', 60), mk('s1', 'substitution', 50),
      mk('a1', 'assist', 30),
    ])
    expect(pairs).toHaveLength(3) // but + jaune + rouge (pas sub, pas assist)
    expect(pairs.map(p => p.main.type)).toEqual(['goal', 'yellow_card', 'red_card'])
  })
})
