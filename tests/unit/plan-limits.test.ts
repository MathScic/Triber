import { describe, it, expect } from 'vitest'
import { canAddMember, planLimitMessage, PLAN_LIMITS } from '@/lib/utils/plan-limits'

describe('Limites de plan', () => {
  it('plan free : limite à 20 membres', () => {
    expect(PLAN_LIMITS.free).toBe(20)
  })

  it('plan club : illimité', () => {
    expect(PLAN_LIMITS.club).toBe(Infinity)
  })

  it('autorise le 20ème membre en free', () => {
    expect(canAddMember('free', 19)).toBe(true)
  })

  it('refuse le 21ème membre en free', () => {
    expect(canAddMember('free', 20)).toBe(false)
  })

  it('autorise n\'importe quel membre en club', () => {
    expect(canAddMember('club', 150)).toBe(true)
    expect(canAddMember('club', 999)).toBe(true)
  })

  it('retourne un message d\'upgrade pour le plan free', () => {
    const msg = planLimitMessage('free')
    expect(msg).toContain('20 membres')
    expect(msg).toContain('Club')
  })

  it('plan inconnu : limite à 20 par défaut', () => {
    expect(canAddMember('unknown', 20)).toBe(false)
    expect(canAddMember('unknown', 19)).toBe(true)
  })
})
