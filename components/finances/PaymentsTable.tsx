import { Receipt } from 'lucide-react'
import type { FlatPayment } from '@/lib/hooks/useAllPayments'
import { PaymentRow } from './PaymentRow'

const COL_HEADERS = ['Cotisation', 'Montant', 'Membre', 'Date', 'Statut', '']

interface Props {
  payments: FlatPayment[]
  loading: boolean
  onMarkPaid: (id: string) => void
  onMarkPending: (id: string) => void
  onDelete: (id: string) => void
}

export function PaymentsTable({ payments, loading, onMarkPaid, onMarkPending, onDelete }: Props) {
  if (loading) return (
    <div className="space-y-1">
      {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white rounded-xl border border-brand-border animate-pulse" />)}
    </div>
  )

  if (!payments.length) return (
    <div className="bg-white rounded-xl border border-brand-border shadow-sm p-10 text-center space-y-2">
      <Receipt className="w-8 h-8 text-brand-muted/30 mx-auto" />
      <p className="text-sm font-semibold text-brand-dark font-[family-name:var(--font-nunito)]">Aucun paiement</p>
      <p className="text-xs text-brand-muted font-[family-name:var(--font-nunito)]">Créez une cotisation et ajoutez des membres.</p>
    </div>
  )

  const total = payments.reduce((s, p) => s + p.amount_cents, 0)

  return (
    <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-sand">
        <div className="flex items-center gap-2">
          <Receipt className="w-3.5 h-3.5 text-brand-muted" />
          <p className="text-[11px] font-bold text-brand-muted uppercase tracking-widest font-[family-name:var(--font-nunito)]">
            Actives · {payments.length}
          </p>
        </div>
        <p className="text-xs font-semibold text-brand-muted font-[family-name:var(--font-nunito)]">
          Total : {(total / 100).toFixed(0)} €
        </p>
      </div>

      {/* Column headers + rows — scrollable on mobile, scrollbar masquée */}
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        <div className="min-w-[680px]">
          <div className="grid grid-cols-[32px_1fr_80px_160px_90px_110px_36px] items-center gap-3 px-4 py-2.5 border-b border-brand-sand bg-brand-bg/60">
            <div />
            {COL_HEADERS.map((h, i) => (
              <p key={i} className="text-[10px] font-bold text-brand-muted uppercase tracking-widest font-[family-name:var(--font-nunito)]">{h}</p>
            ))}
          </div>
          {payments.map(p => (
            <PaymentRow key={p.id} payment={p} onMarkPaid={onMarkPaid} onMarkPending={onMarkPending} onDelete={onDelete} />
          ))}
        </div>
      </div>
    </div>
  )
}
