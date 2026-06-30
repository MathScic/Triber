'use client'

import { useState, useMemo } from 'react'
import { ChevronRight, Trash2, ArrowUpDown, CheckCircle } from 'lucide-react'
import type { OrgMemberForPayment, ContributionPayment } from '@/lib/hooks/useContributionPayments'
import { isAwaitingValidation } from '@/lib/hooks/useContributionPayments'
import { avatarColor, initials } from '@/lib/utils/avatar'

type SortKey = 'name' | 'date' | 'status'
function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

function StatusBadge({ status, method, paidAt, isManual, paidCents, expectedCents, awaitingValidation }: {
  status: string; method?: string | null; paidAt?: string | null; isManual?: boolean
  paidCents?: number; expectedCents?: number; awaitingValidation?: boolean
}) {
  const isPartial = status === 'paid' && expectedCents && paidCents !== undefined && paidCents < expectedCents
  if (awaitingValidation) return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-[family-name:var(--font-nunito)] whitespace-nowrap">À valider — Stripe</span>
  if (isManual && status !== 'paid') return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-brand-bg text-[#6B7280] font-[family-name:var(--font-nunito)] whitespace-nowrap">Hors app</span>
  if (status === 'paid') {
    if (isPartial) return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-[family-name:var(--font-nunito)] whitespace-nowrap">Partiel — {paidCents! / 100}/{expectedCents! / 100} €</span>
    const parts = ['Payé', method === 'cash' ? 'Cash' : method === 'tpe' ? 'TPE' : method === 'transfer' ? 'Virement' : method === 'stripe' ? 'Stripe' : method, paidAt ? fmtDate(paidAt) : null].filter(Boolean)
    return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary-light text-success font-[family-name:var(--font-nunito)] whitespace-nowrap">{parts.join(' — ')}</span>
  }
  return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-secondary-light text-secondary font-[family-name:var(--font-nunito)] whitespace-nowrap">En attente</span>
}

function MemberRow({ name, status, method, paidAt, onClick, isManual, onDelete, paidCents, expectedCents, onValidate, awaitingValidation }: {
  name: string; status: string; method?: string | null; paidAt?: string | null
  onClick: () => void; isManual?: boolean; onDelete?: () => void
  paidCents?: number; expectedCents?: number
  onValidate?: () => void; awaitingValidation?: boolean
}) {
  const [confirmDel, setConfirmDel] = useState(false)
  const color = avatarColor(name)
  return (
    <div className="border-b border-[#F4F4F6] last:border-0">
      <div className="flex items-center gap-3 py-3.5 px-4">
        <button onClick={onClick} className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ backgroundColor: color.bg, color: color.text }}>{initials(name)}</div>
          <p className="flex-1 text-sm font-semibold text-brand-dark truncate font-[family-name:var(--font-nunito)]">{name}</p>
          <StatusBadge status={status} method={method} paidAt={paidAt} isManual={isManual} paidCents={paidCents} expectedCents={expectedCents} awaitingValidation={awaitingValidation} />
          <ChevronRight className="w-4 h-4 text-[#D1D1D6] flex-shrink-0" />
        </button>
        {awaitingValidation && onValidate && (
          <button onClick={e => { e.stopPropagation(); onValidate() }}
            title="Valider le paiement"
            className="flex items-center gap-1 text-[10px] font-semibold text-success bg-primary-light hover:bg-[#D1FAE5] px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0 font-[family-name:var(--font-nunito)]">
            <CheckCircle className="w-3.5 h-3.5" />
            Valider
          </button>
        )}
        {onDelete && (
          <button onClick={() => setConfirmDel(v => !v)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 flex-shrink-0 transition-colors">
            <Trash2 className={`w-3.5 h-3.5 ${confirmDel ? 'text-red-500' : 'text-[#D1D1D6]'}`} />
          </button>
        )}
      </div>
      {confirmDel && (
        <div className="flex items-center justify-between bg-red-50 border-t border-red-100 px-4 py-2">
          <p className="text-xs font-semibold text-red-600 font-[family-name:var(--font-nunito)]">Retirer de la liste ?</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDel(false)} className="text-xs font-semibold text-[#6B7280] px-3 py-1 font-[family-name:var(--font-nunito)]">Annuler</button>
            <button onClick={onDelete} className="text-xs font-semibold text-white bg-red-500 rounded-lg px-3 py-1.5 font-[family-name:var(--font-nunito)]">Supprimer</button>
          </div>
        </div>
      )}
    </div>
  )
}

interface Props {
  members: OrgMemberForPayment[]
  manualMembers: ContributionPayment[]
  onClickMember: (member: OrgMemberForPayment) => void
  onClickManual: (entry: ContributionPayment) => void
  onDeleteManual?: (id: string) => void
  onValidatePayment?: (paymentId: string) => void
  getExpectedAmount?: (category: string | null) => number
  search?: string
}

const SORT_LABELS: Record<SortKey, string> = { name: 'A–Z', date: 'Date payé', status: 'En attente d\'abord' }

export function PaymentMemberList({ members, manualMembers, onClickMember, onClickManual, onDeleteManual, onValidatePayment, getExpectedAmount, search }: Props) {
  const [sort, setSort] = useState<SortKey>('name')
  const q = (search ?? '').trim().toLowerCase()

  const filteredMembers = q ? members.filter(m => (m.full_name ?? '').toLowerCase().includes(q)) : members
  const filteredManual = q ? manualMembers.filter(m => (m.manual_name ?? '').toLowerCase().includes(q)) : manualMembers

  const totalCount = members.length + manualMembers.length
  const { paidCount, partialCount, paidCents } = useMemo(() => {
    let paid = 0, partial = 0, cents = 0
    for (const m of members) {
      if (m.payment?.status !== 'paid') continue
      const exp = getExpectedAmount?.(m.category) ?? 0
      const got = m.payment.amount_cents ?? 0
      cents += got
      if (exp > 0 && got < exp) partial++; else paid++
    }
    for (const m of manualMembers) {
      if (m.status !== 'paid') continue
      const exp = getExpectedAmount?.(m.category) ?? 0
      cents += m.amount_cents
      if (exp > 0 && m.amount_cents < exp) partial++; else paid++
    }
    return { paidCount: paid, partialCount: partial, paidCents: cents }
  }, [members, manualMembers, getExpectedAmount])

  const sortFn = (statusA: string, statusB: string, nameA: string, nameB: string, dateA?: string | null, dateB?: string | null) => {
    if (sort === 'name') return nameA.localeCompare(nameB, 'fr')
    if (sort === 'date') return (dateB ?? '').localeCompare(dateA ?? '')
    if (sort === 'status') { const o = { pending: 0, failed: 1, paid: 2 }; return (o[statusA as keyof typeof o] ?? 0) - (o[statusB as keyof typeof o] ?? 0) }
    return 0
  }

  const byCategory = useMemo(() => {
    const acc: Record<string, { app: OrgMemberForPayment[]; manual: ContributionPayment[] }> = {}
    for (const m of filteredMembers) { const c = m.category ?? 'Sans catégorie'; if (!acc[c]) acc[c] = { app: [], manual: [] }; acc[c].app.push(m) }
    for (const m of filteredManual) { const c = m.category ?? 'Sans catégorie'; if (!acc[c]) acc[c] = { app: [], manual: [] }; acc[c].manual.push(m) }
    return acc
  }, [filteredMembers, filteredManual])

  const categories = Object.keys(byCategory).sort()

  if (categories.length === 0 && !q) {
    return (
      <div className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm p-10 text-center">
        <p className="text-sm text-[#6B7280] font-[family-name:var(--font-nunito)]">Aucun membre. Utilisez le bouton "+" pour ajouter des personnes.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Stats — toujours sur le total, pas sur la recherche */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl border border-[#D1D1D6] p-3 text-center">
          <p className="text-xl font-[800] text-brand-dark font-[family-name:var(--font-barlow)]">{totalCount}</p>
          <p className="text-[10px] text-[#6B7280] font-[family-name:var(--font-nunito)]">Membres</p>
        </div>
        <div className="bg-white rounded-xl border border-[#D1D1D6] p-3 text-center">
          <p className="text-xl font-[800] text-success font-[family-name:var(--font-barlow)]">{paidCount}</p>
          <p className="text-[10px] text-[#6B7280] font-[family-name:var(--font-nunito)]">Payés</p>
          {partialCount > 0 && <p className="text-[10px] text-amber-600 font-semibold font-[family-name:var(--font-nunito)]">{partialCount} partiel{partialCount > 1 ? 's' : ''}</p>}
        </div>
        <div className="bg-white rounded-xl border border-[#D1D1D6] p-3 text-center">
          <p className="text-xl font-[800] text-success font-[family-name:var(--font-barlow)]">{(paidCents / 100).toFixed(0)} €</p>
          <p className="text-[10px] text-[#6B7280] font-[family-name:var(--font-nunito)]">Encaissé</p>
        </div>
      </div>

      {/* Tri */}
      <div className="flex items-center gap-2 flex-wrap">
        <ArrowUpDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
        {(Object.keys(SORT_LABELS) as SortKey[]).map(k => (
          <button key={k} onClick={() => setSort(k)}
            className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors font-[family-name:var(--font-nunito)] ${sort === k ? 'bg-brand-dark text-white' : 'bg-white border border-[#D1D1D6] text-[#6B7280]'}`}>
            {SORT_LABELS[k]}
          </button>
        ))}
      </div>

      {q && categories.length === 0 && (
        <p className="text-sm text-center text-[#9CA3AF] py-4 font-[family-name:var(--font-nunito)]">Aucun résultat pour "{search}"</p>
      )}

      {categories.map(cat => {
        const { app, manual } = byCategory[cat]
        const sortedApp = [...app].sort((a, b) => sortFn(a.payment?.status ?? 'pending', b.payment?.status ?? 'pending', a.full_name ?? '', b.full_name ?? '', a.payment?.paid_at, b.payment?.paid_at))
        const sortedManual = [...manual].sort((a, b) => sortFn(a.status, b.status, a.manual_name ?? '', b.manual_name ?? '', a.paid_at, b.paid_at))
        return (
          <div key={cat} className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#F4F4F6]">
              <p className="text-sm font-[800] text-brand-dark font-[family-name:var(--font-barlow)] uppercase tracking-wide">{cat}</p>
              <span className="text-xs font-semibold text-[#6B7280] bg-brand-bg px-2.5 py-1 rounded-full font-[family-name:var(--font-nunito)]">{app.length + manual.length}</span>
            </div>
            {sortedApp.map(m => { const exp = getExpectedAmount?.(m.category) ?? 0; const awaiting = isAwaitingValidation(m.payment); return <MemberRow key={m.id} name={m.full_name ?? '—'} status={m.payment?.status ?? 'pending'} method={m.payment?.payment_method} paidAt={m.payment?.paid_at} onClick={() => onClickMember(m)} paidCents={m.payment?.amount_cents} expectedCents={exp || undefined} awaitingValidation={awaiting} onValidate={awaiting && m.payment && onValidatePayment ? () => onValidatePayment(m.payment!.id) : undefined} /> })}
            {sortedManual.map(m => { const exp = getExpectedAmount?.(m.category) ?? 0; return <MemberRow key={m.id} name={m.manual_name ?? '—'} status={m.status} method={m.payment_method} paidAt={m.paid_at} onClick={() => onClickManual(m)} isManual onDelete={onDeleteManual ? () => onDeleteManual(m.id) : undefined} paidCents={m.amount_cents} expectedCents={exp || undefined} /> })}
          </div>
        )
      })}
    </div>
  )
}
