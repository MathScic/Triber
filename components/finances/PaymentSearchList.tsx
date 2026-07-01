'use client'

import { Search, X } from 'lucide-react'
import { PaymentMemberList } from '@/components/finances/PaymentMemberList'
import type { OrgMemberForPayment, ContributionPayment } from '@/lib/hooks/useContributionPayments'

interface Props {
  members: OrgMemberForPayment[]
  manualMembers: ContributionPayment[]
  search: string
  onSearch: (v: string) => void
  onClickMember: (m: OrgMemberForPayment) => void
  onClickManual: (m: ContributionPayment) => void
  onDeleteManual: (pid: string) => void
  onValidatePayment: (pid: string) => void
  getExpectedAmount: (cat: string | null) => number
}

export function PaymentSearchList({ members, manualMembers, search, onSearch, onClickMember, onClickManual, onDeleteManual, onValidatePayment, getExpectedAmount }: Props) {
  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Rechercher un membre…"
          className="w-full h-10 pl-9 pr-9 rounded-xl border border-[#D1D1D6] bg-white text-sm focus:outline-none focus:border-success font-[family-name:var(--font-nunito)]" />
        {search && <button onClick={() => onSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-[#9CA3AF] hover:text-brand-dark" /></button>}
      </div>
      <PaymentMemberList members={members} manualMembers={manualMembers}
        onClickMember={onClickMember} onClickManual={onClickManual}
        onDeleteManual={onDeleteManual} onValidatePayment={onValidatePayment}
        getExpectedAmount={getExpectedAmount} search={search} />
    </>
  )
}
