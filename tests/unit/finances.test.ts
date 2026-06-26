import { describe, it, expect } from 'vitest'
import {
  isPartialPayment,
  isFullyPaid,
  getPaymentStatus,
  getPendingNames,
  countFullyPaid,
  countPartial,
} from '@/lib/utils/finances'

describe('isPartialPayment', () => {
  it('60€ sur 80€ → partiel', () => {
    expect(isPartialPayment('paid', 6000, 8000)).toBe(true)
  })
  it('80€ sur 80€ → pas partiel', () => {
    expect(isPartialPayment('paid', 8000, 8000)).toBe(false)
  })
  it('100€ sur 80€ (trop payé) → pas partiel', () => {
    expect(isPartialPayment('paid', 10000, 8000)).toBe(false)
  })
  it('tarif libre (expected=0) → pas partiel même si faible montant', () => {
    expect(isPartialPayment('paid', 5000, 0)).toBe(false)
  })
  it('statut pending → jamais partiel', () => {
    expect(isPartialPayment('pending', 0, 8000)).toBe(false)
  })
  it('statut failed → jamais partiel', () => {
    expect(isPartialPayment('failed', 0, 8000)).toBe(false)
  })
})

describe('isFullyPaid', () => {
  it('montant exact → payé', () => {
    expect(isFullyPaid('paid', 8000, 8000)).toBe(true)
  })
  it('montant supérieur → payé', () => {
    expect(isFullyPaid('paid', 9000, 8000)).toBe(true)
  })
  it('montant inférieur → pas payé', () => {
    expect(isFullyPaid('paid', 6000, 8000)).toBe(false)
  })
  it('tarif libre → payé même avec petit montant', () => {
    expect(isFullyPaid('paid', 1000, 0)).toBe(true)
  })
  it('statut pending → jamais payé', () => {
    expect(isFullyPaid('pending', 8000, 8000)).toBe(false)
  })
})

describe('getPaymentStatus', () => {
  it('paiement complet → full', () => {
    expect(getPaymentStatus('paid', 8000, 8000)).toBe('full')
  })
  it('paiement partiel → partial', () => {
    expect(getPaymentStatus('paid', 6000, 8000)).toBe('partial')
  })
  it('en attente → pending', () => {
    expect(getPaymentStatus('pending', 0, 8000)).toBe('pending')
  })
  it('refusé → failed', () => {
    expect(getPaymentStatus('failed', 0, 8000)).toBe('failed')
  })
})

describe('getPendingNames — liste de relance', () => {
  it('inclut les membres en attente', () => {
    const members = [{ name: 'Alice', status: 'pending', amount_cents: 0, expected_cents: 8000 }]
    expect(getPendingNames(members)).toContain('Alice')
  })
  it('inclut Jean Dupont qui a payé 60€ sur 80€', () => {
    const members = [{ name: 'Jean Dupont', status: 'paid', amount_cents: 6000, expected_cents: 8000 }]
    expect(getPendingNames(members)).toContain('Jean Dupont')
  })
  it('exclut les membres ayant payé intégralement', () => {
    const members = [{ name: 'Bob', status: 'paid', amount_cents: 8000, expected_cents: 8000 }]
    expect(getPendingNames(members)).not.toContain('Bob')
  })
  it('liste vide si tout le monde a payé intégralement', () => {
    const members = [
      { name: 'Alice', status: 'paid', amount_cents: 8000, expected_cents: 8000 },
      { name: 'Bob', status: 'paid', amount_cents: 8000, expected_cents: 8000 },
    ]
    expect(getPendingNames(members)).toHaveLength(0)
  })
  it('tarif libre : ne bloque pas si pas expected', () => {
    const members = [{ name: 'Charlie', status: 'paid', amount_cents: 5000, expected_cents: 0 }]
    expect(getPendingNames(members)).not.toContain('Charlie')
  })
})

describe('countFullyPaid / countPartial', () => {
  const members = [
    { name: 'A', status: 'paid', amount_cents: 8000, expected_cents: 8000 },   // full
    { name: 'B', status: 'paid', amount_cents: 6000, expected_cents: 8000 },   // partial
    { name: 'C', status: 'pending', amount_cents: 0, expected_cents: 8000 },    // pending
  ]
  it('compte 1 payé intégralement', () => {
    expect(countFullyPaid(members)).toBe(1)
  })
  it('compte 1 partiel', () => {
    expect(countPartial(members)).toBe(1)
  })
})
