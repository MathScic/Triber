'use client'

import Link from 'next/link'
import { ArrowLeft, Download, BellRing, Plus } from 'lucide-react'
import { exportXLS } from '@/lib/utils/financeExport'
import type { OrgMemberForPayment, ContributionPayment } from '@/lib/hooks/useContributionPayments'
import type { ContributionTemplate } from '@/lib/hooks/useContributions'

interface Props {
  template: ContributionTemplate
  members: OrgMemberForPayment[]
  manualMembers: ContributionPayment[]
  getAmount: (category: string | null) => number
  onRelance: () => void
  onAddManual: () => void
  onAddBuvette: () => void
}

export function FinanceDetailHeader({ template, members, manualMembers, getAmount, onRelance, onAddManual, onAddBuvette }: Props) {
  return (
    <div className="bg-white border-b border-[#D1D1D6] px-4 py-4 relative flex items-center justify-center">
      <Link href="/finances" className="absolute left-4 w-9 h-9 rounded-xl border border-[#D1D1D6] flex items-center justify-center hover:bg-brand-bg transition-colors">
        <ArrowLeft className="w-4 h-4 text-[#6B7280]" />
      </Link>

      <div className="text-center">
        <h1 className="text-base font-[800] text-brand-dark font-[family-name:var(--font-barlow)] uppercase tracking-tight leading-tight">
          {template.title}
        </h1>
        <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)] mt-0.5">
          {template.is_buvette ? 'Buvette cumulatif' : 'Liste des membres'}
        </p>
      </div>

      {!template.is_buvette && (
        <div className="absolute right-4 flex items-center gap-1.5">
          <button onClick={() => exportXLS(members, manualMembers, template.title, getAmount)}
            title="Exporter XLS"
            className="w-9 h-9 rounded-xl border border-[#D1D1D6] flex items-center justify-center hover:bg-brand-bg transition-colors">
            <Download className="w-4 h-4 text-[#6B7280]" />
          </button>
          <button onClick={onRelance} title="Relancer les impayés"
            className="w-9 h-9 rounded-xl border border-[#D1D1D6] flex items-center justify-center hover:bg-secondary-light transition-colors">
            <BellRing className="w-4 h-4 text-secondary" />
          </button>
          <button onClick={onAddManual}
            className="w-9 h-9 rounded-xl border border-[#D1D1D6] flex items-center justify-center hover:bg-brand-bg transition-colors">
            <Plus className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>
      )}

      {template.is_buvette && (
        <button onClick={onAddBuvette}
          className="absolute right-4 w-9 h-9 rounded-xl border border-[#D1D1D6] flex items-center justify-center hover:bg-brand-bg transition-colors">
          <Plus className="w-4 h-4 text-[#6B7280]" />
        </button>
      )}
    </div>
  )
}
