import { describe, it, expect } from 'vitest'
import { isRateLimited, getClientIp, rateLimitResponse } from '@/lib/utils/rate-limit'

describe('Rate limiting', () => {
  it('autorise les requêtes sous la limite', () => {
    const key = `test-${Math.random()}`
    expect(isRateLimited(key, 3, 60_000)).toBe(false)
    expect(isRateLimited(key, 3, 60_000)).toBe(false)
    expect(isRateLimited(key, 3, 60_000)).toBe(false)
  })

  it('bloque au-delà de la limite', () => {
    const key = `test-${Math.random()}`
    isRateLimited(key, 2, 60_000)
    isRateLimited(key, 2, 60_000)
    expect(isRateLimited(key, 2, 60_000)).toBe(true)
  })

  it('une clé différente a son propre compteur', () => {
    const keyA = `test-a-${Math.random()}`
    const keyB = `test-b-${Math.random()}`
    isRateLimited(keyA, 1, 60_000)
    expect(isRateLimited(keyA, 1, 60_000)).toBe(true)
    expect(isRateLimited(keyB, 1, 60_000)).toBe(false)
  })

  it('réinitialise le compteur après expiration de la fenêtre', async () => {
    const key = `test-${Math.random()}`
    isRateLimited(key, 1, 10)
    expect(isRateLimited(key, 1, 10)).toBe(true)
    await new Promise(r => setTimeout(r, 20))
    expect(isRateLimited(key, 1, 10)).toBe(false)
  })

  it('extrait la première IP de x-forwarded-for', () => {
    const req = new Request('http://localhost', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  it('retourne "unknown" si aucun header IP', () => {
    const req = new Request('http://localhost')
    expect(getClientIp(req)).toBe('unknown')
  })

  it('rateLimitResponse renvoie null sous la limite, une 429 au-delà', async () => {
    const key = `test-${Math.random()}`
    expect(rateLimitResponse(key, 1, 60_000)).toBeNull()
    const res = rateLimitResponse(key, 1, 60_000)
    expect(res).not.toBeNull()
    expect(res?.status).toBe(429)
  })
})
