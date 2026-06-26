'use client'

import type { Contribution } from '@/lib/hooks/useFinances'

const STATUS: Record<string, { label: string; cls: string }> = {
  paid:    { label: 'Payé',       cls: 'bg-[#E8F5EE] text-[#2A9D4E]' },
  pending: { label: 'En attente', cls: 'bg-[#FDF0EB] text-[#E8622A]' },
  failed:  { label: 'Échoué',     cls: 'bg-red-50 text-red-600' },
}

function Row({ c }: { c: Contribution }) {
  const s = STATUS[c.status] ?? STATUS.pending
  const euros = (c.amount / 100).toFixed(2)
  const name = c.profiles?.full_name ?? '—'
  const date = new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#D1D1D6] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1A1F16] truncate">{c.label}</p>
        <p className="text-xs text-[#6B7280]">{name} · {date}</p>
      </div>
      <p className="text-sm font-bold text-[#1A1F16] tabular-nums flex-shrink-0">{euros} €</p>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${s.cls}`}>{s.label}</span>
    </div>
  )
}

interface Props {
  contributions: Contribution[]
  loading?: boolean
}

export function ContributionList({ contributions, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-[#E8E8EA] rounded-xl animate-pulse" />)}
      </div>
    )
  }

  if (!contributions.length) {
    return <p className="text-sm text-[#6B7280] text-center py-6">Aucune cotisation pour l'instant.</p>
  }

  return (
    <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm px-4">
      {contributions.map(c => <Row key={c.id} c={c} />)}
    </div>
  )
}
