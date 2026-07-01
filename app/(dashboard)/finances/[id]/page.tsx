'use client'

import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { AlertTriangle, Plus, Check } from 'lucide-react'
import { useContributionPayments } from '@/lib/hooks/useContributionPayments'
import { useTreasury } from '@/lib/hooks/useTreasury'
import { useFinanceDetail } from '@/lib/hooks/useFinanceDetail'
import { MarkPaidModal } from '@/components/finances/MarkPaidModal'
import { AddManualMemberModal } from '@/components/finances/AddManualMemberModal'
import { BuvetteEntryForm } from '@/components/finances/BuvetteEntryForm'
import { RelanceModal } from '@/components/finances/RelanceModal'
import { FinanceDetailHeader } from '@/components/finances/FinanceDetailHeader'
import { BuvetteStatsGrid } from '@/components/finances/BuvetteStatsGrid'
import { PaymentSearchList } from '@/components/finances/PaymentSearchList'
import type { OrgMemberForPayment, ContributionPayment } from '@/lib/hooks/useContributionPayments'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

type Selected = { member?: OrgMemberForPayment; manual?: ContributionPayment }

export default function FinanceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<Selected | null>(null)
  const [showAddManual, setShowAddManual] = useState(false)
  const [showBuvetteForm, setShowBuvetteForm] = useState(false)
  const [showRelance, setShowRelance] = useState(false)
  const [search, setSearch] = useState('')
  const [paidToast, setPaidToast] = useState(false)

  const payments = useContributionPayments()
  const treasury = useTreasury()
  const { template, orgId, getAmount } = useFinanceDetail(id, { router, searchParams, setPaidToast, fetchPayments: payments.fetch, fetchTreasury: treasury.fetch })

  if (!template || !orgId) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-success border-t-transparent animate-spin" />
    </div>
  )

  const selName = selected?.member?.full_name ?? selected?.manual?.manual_name ?? '—'
  const selPayId = selected?.member?.payment?.id ?? selected?.manual?.id ?? null
  const selExp = selected?.member ? getAmount(selected.member.category) : getAmount(selected?.manual?.category ?? null)
  const selPaid = selected?.member?.payment?.amount_cents ?? selected?.manual?.amount_cents ?? 0
  const selStatus = selected?.member?.payment?.status ?? selected?.manual?.status
  const isPaid = selStatus === 'paid' && (selExp === 0 || selPaid >= selExp)

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-brand-bg`}>
      {paidToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-success text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold font-[family-name:var(--font-nunito)] flex items-center gap-2 whitespace-nowrap">
          <Check className="w-4 h-4" /> Paiement reçu — mise à jour en cours…
        </div>
      )}
      <FinanceDetailHeader template={template} members={payments.members} manualMembers={payments.manualMembers}
        getAmount={getAmount} onRelance={() => setShowRelance(true)} onAddManual={() => setShowAddManual(true)} onAddBuvette={() => setShowBuvetteForm(true)} />
      <div className="px-4 py-5 max-w-lg lg:max-w-[90%] mx-auto space-y-4">
        {template.warning_message && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5">
            <AlertTriangle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-secondary font-[family-name:var(--font-nunito)]">{template.warning_message}</p>
          </div>
        )}
        {template.is_buvette && <BuvetteStatsGrid total={treasury.total} flaggedCount={treasury.flaggedCount} entries={treasury.entries} isFlagged={treasury.isFlagged} />}
        {!template.is_buvette && <PaymentSearchList members={payments.members} manualMembers={payments.manualMembers} search={search} onSearch={setSearch} onClickMember={m => setSelected({ member: m })} onClickManual={m => setSelected({ manual: m })} onDeleteManual={pid => void payments.removePayment(pid, id, orgId)} onValidatePayment={pid => void payments.validatePayment(pid, id, orgId)} getExpectedAmount={getAmount} />}
      </div>
      <div className="fixed bottom-6 left-0 right-0 lg:left-56 flex justify-center z-10 pointer-events-none">
        <button onClick={() => template.is_buvette ? setShowBuvetteForm(true) : setShowAddManual(true)}
          className="pointer-events-auto flex items-center gap-2.5 px-7 py-4 bg-secondary text-white text-sm font-semibold rounded-full shadow-xl hover:bg-[#d4571f] active:scale-95 transition-all font-[family-name:var(--font-nunito)]">
          <Plus className="w-5 h-5" />{template.is_buvette ? 'Nouvelle entrée' : 'Ajouter un paiement'}
        </button>
      </div>
      {selected && (
        <MarkPaidModal memberName={selName} isPaid={isPaid} suggestedAmount={(selExp || selPaid) || undefined}
          paidCents={selPaid} targetUserId={selected?.member?.user_id ?? null} templateTitle={template?.title}
          onMarkPaid={async (method, amountCents, notes) => {
            const cat = selected.member?.category ?? selected.manual?.category ?? null
            await payments.markPaid(selPayId, id, orgId, selected.member?.user_id ?? null, selected.manual?.manual_name ?? null, cat, amountCents, method, notes)
            if (method === 'cash') void fetch('/api/contributions/notify-cash', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memberName: selName, templateTitle: template?.title ?? '', amountCents }) })
          }}
          onMarkPending={async () => { if (selPayId) await payments.markPending(selPayId, id, orgId) }}
          onPayOnline={async (amountCents) => {
            const res = await fetch('/api/contributions/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId: selPayId, templateId: id, amountCents, memberName: selName, templateTitle: template?.title }) })
            const data = await res.json() as { url?: string }
            if (data.url) window.location.href = data.url
          }}
          onClose={() => setSelected(null)} />
      )}
      {showAddManual && <AddManualMemberModal categories={[...new Set(template.tarifs.map(t => t.category))]} getDefaultAmount={getAmount} onAdd={(name, cat, cents) => payments.addManual(id, orgId, name, cat, cents)} onClose={() => setShowAddManual(false)} />}
      {showBuvetteForm && <BuvetteEntryForm orgId={orgId} templateId={id} onClose={() => setShowBuvetteForm(false)} onSaved={() => treasury.fetch(id)} />}
      {showRelance && <RelanceModal members={payments.members} manualMembers={payments.manualMembers} templateTitle={template.title} onClose={() => setShowRelance(false)} getExpectedAmount={getAmount} />}
    </main>
  )
}
