export function isPartialPayment(status: string, paidCents: number, expectedCents: number): boolean {
  return status === 'paid' && expectedCents > 0 && paidCents < expectedCents
}

export function isFullyPaid(status: string, paidCents: number, expectedCents: number): boolean {
  return status === 'paid' && (expectedCents === 0 || paidCents >= expectedCents)
}

export type PaymentStatus = 'full' | 'partial' | 'pending' | 'failed'

export function getPaymentStatus(status: string, paidCents: number, expectedCents: number): PaymentStatus {
  if (status === 'paid') return isPartialPayment(status, paidCents, expectedCents) ? 'partial' : 'full'
  if (status === 'failed') return 'failed'
  return 'pending'
}

export type NamedPayment = {
  name: string
  status: string
  amount_cents: number
  expected_cents: number
}

export function getPendingNames(members: NamedPayment[]): string[] {
  return members.filter(m => {
    if (m.status !== 'paid') return true
    return isPartialPayment(m.status, m.amount_cents, m.expected_cents)
  }).map(m => m.name)
}

export function countFullyPaid(members: NamedPayment[]): number {
  return members.filter(m => isFullyPaid(m.status, m.amount_cents, m.expected_cents)).length
}

export function countPartial(members: NamedPayment[]): number {
  return members.filter(m => isPartialPayment(m.status, m.amount_cents, m.expected_cents)).length
}
