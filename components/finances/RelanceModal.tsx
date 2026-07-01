'use client'

import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import type { OrgMemberForPayment, ContributionPayment } from '@/lib/hooks/useContributionPayments'

interface Props {
  members: OrgMemberForPayment[]
  manualMembers: ContributionPayment[]
  templateTitle: string
  onClose: () => void
  getExpectedAmount: (category: string | null) => number
}

export function RelanceModal({ members, manualMembers, templateTitle, onClose, getExpectedAmount }: Props) {
  const [copied, setCopied] = useState(false)

  const pending = [
    ...members.filter(m => {
      if (!m.payment || m.payment.status !== 'paid') return true
      const exp = getExpectedAmount(m.category)
      return exp > 0 && (m.payment.amount_cents ?? 0) < exp
    }).map(m => m.full_name ?? '—'),
    ...manualMembers.filter(m => {
      if (m.status !== 'paid') return true
      const exp = getExpectedAmount(m.category ?? null)
      return exp > 0 && m.amount_cents < exp
    }).map(m => m.manual_name ?? '—'),
  ]

  const msg = `Rappel — ${templateTitle}\n\nLes membres suivants n'ont pas encore réglé leur cotisation :\n${pending.map(n => `• ${n}`).join('\n')}\n\nMerci de régulariser votre situation rapidement. 🙏`

  const copy = () => {
    void navigator.clipboard.writeText(msg)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const F = 'font-[family-name:var(--font-nunito)]'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F4F4F6]">
          <div>
            <p className={`text-sm font-bold text-brand-dark ${F}`}>Relancer les impayés</p>
            <p className={`text-xs text-[#6B7280] ${F}`}>{pending.length} membre{pending.length !== 1 ? 's' : ''} en attente</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-brand-bg flex items-center justify-center">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {pending.length === 0
            ? <p className={`text-sm text-center text-success font-semibold py-4 ${F}`}>✓ Tout le monde a payé !</p>
            : <>
                <div className="bg-brand-bg rounded-xl p-3 max-h-48 overflow-y-auto">
                  <p className={`text-xs text-brand-dark whitespace-pre-wrap ${F}`}>{msg}</p>
                </div>
                <button onClick={copy}
                  className={`w-full flex items-center justify-center gap-2 h-11 text-sm font-semibold rounded-xl transition-colors ${F} ${copied ? 'bg-success text-white' : 'bg-brand-dark text-white hover:bg-[#2a2f25]'}`}>
                  {copied ? <><Check className="w-4 h-4" /> Copié !</> : <><Copy className="w-4 h-4" /> Copier le message</>}
                </button>
                <p className={`text-center text-xs text-[#9CA3AF] ${F}`}>Collez ce message dans WhatsApp ou par email</p>
              </>
          }
        </div>
      </div>
    </div>
  )
}
