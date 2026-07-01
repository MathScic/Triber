'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useContributions } from '@/lib/hooks/useContributions'
import { useAllPayments } from '@/lib/hooks/useAllPayments'
import { getAmountForMember } from '@/lib/utils/finances'
import { PaymentsTable } from '@/components/finances/PaymentsTable'
import { CreateContributionInline } from '@/components/finances/CreateContributionInline'
import { PageHeader } from '@/components/shared/PageHeader'
import type { Step1Data } from '@/components/finances/ContributionStep1'
import type { SelectedMember } from '@/components/finances/ContributionStep2'

export default function FinancesPage() {
  const router = useRouter()
  const { init, orgId, role, createTemplate } = useContributions()
  const { payments, loading, fetchAll, markPaid, markPending, deletePayment } = useAllPayments()
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    init().then(mem => {
      if (!mem) { router.push('/login'); return }
      if (mem.role === 'member') { router.push('/home'); return }
      void fetchAll(mem.organization_id)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canManage = role === 'admin' || role === 'member_active'
  const active = payments.filter(p => p.is_active && !p.is_buvette)
  const paid = active.filter(p => p.status === 'paid')
  const pending = active.filter(p => p.status === 'pending')
  const totalPaid = paid.reduce((s, p) => s + p.amount_cents, 0)
  const totalPending = pending.reduce((s, p) => s + p.amount_cents, 0)
  const rate = totalPaid + totalPending > 0 ? Math.round(totalPaid / (totalPaid + totalPending) * 100) : 0
  const refresh = () => { if (orgId) void fetchAll(orgId) }

  const handleCreate = async (data: Step1Data, selected: SelectedMember[]) => {
    const id = await createTemplate(orgId!, { title: data.title, description: data.description, deadline: data.deadline, warning_message: data.warning_message, is_buvette: data.is_buvette, tarifs: data.tarifs })
    if (!id) return
    if (selected.length) {
      await createClient().from('contribution_payments').insert(
        selected.map(m => ({ template_id: id, organization_id: orgId!, user_id: m.user_id, amount_cents: getAmountForMember(m.category, data.tarifs, data.default_amount_cents), status: 'pending' }))
      )
    }
    setShowCreate(false)
    if (data.is_buvette) router.push(`/finances/${id}`)
    else void fetchAll(orgId!)
  }

  const KPI = [
    { label: 'Encaissé', value: `${(totalPaid / 100).toFixed(0)} €`, sub: `${paid.length} paiement${paid.length !== 1 ? 's' : ''}`, cls: 'text-success' },
    { label: 'En attente', value: `${(totalPending / 100).toFixed(0)} €`, sub: `${pending.length} paiement${pending.length !== 1 ? 's' : ''}`, cls: 'text-secondary' },
    { label: 'Recouvrement', value: `${rate} %`, sub: 'Taux de collecte', cls: rate >= 80 ? 'text-success' : rate >= 50 ? 'text-amber-500' : 'text-secondary' },
  ]

  return (
    <main className="min-h-screen bg-brand-bg px-4 py-8">
      <div className="max-w-lg lg:max-w-[90%] mx-auto space-y-6">
        <PageHeader title="Finances" subtitle="Réservé aux administrateurs · Saison 2025–2026"
          action={canManage ? (
            <button onClick={() => setShowCreate(v => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-secondary/90 transition-colors font-[family-name:var(--font-nunito)]">
              <Plus className="w-4 h-4" /> Créer une cotisation
            </button>
          ) : undefined}
        />

        <div className="grid grid-cols-3 gap-3">
          {KPI.map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-brand-border shadow-sm p-4">
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest font-[family-name:var(--font-nunito)]">{k.label}</p>
              <p className={`text-2xl font-[800] tabular-nums mt-1 font-[family-name:var(--font-barlow)] ${k.cls}`}>{k.value}</p>
              <p className="text-xs text-brand-muted mt-0.5 font-[family-name:var(--font-nunito)]">{k.sub}</p>
            </div>
          ))}
        </div>

        {showCreate && orgId && <CreateContributionInline orgId={orgId} onClose={() => setShowCreate(false)} onCreate={handleCreate} />}

        <PaymentsTable payments={active} loading={loading}
          onMarkPaid={async id => { await markPaid(id); refresh() }}
          onMarkPending={async id => { await markPending(id); refresh() }}
          onDelete={async id => { await deletePayment(id); refresh() }}
        />
      </div>
    </main>
  )
}
