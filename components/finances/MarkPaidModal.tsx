'use client'

import { useState } from 'react'
import { X, Check, RotateCcw, AlertTriangle, Mail } from 'lucide-react'

const METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'tpe', label: 'TPE' },
  { value: 'transfer', label: 'Virement' },
  { value: 'autre', label: 'Autre' },
  { value: 'stripe', label: 'En ligne' },
]

interface Props {
  memberName: string
  isPaid: boolean
  suggestedAmount?: number
  paidCents?: number
  targetUserId?: string | null
  templateTitle?: string
  onMarkPaid: (method: string, amountCents: number, notes?: string) => Promise<void>
  onMarkPending: () => Promise<void>
  onPayOnline?: (amountCents: number) => Promise<void>
  onClose: () => void
}

export function MarkPaidModal({ memberName, isPaid, suggestedAmount, paidCents = 0, targetUserId, templateTitle, onMarkPaid, onMarkPending, onPayOnline, onClose }: Props) {
  const [method, setMethod] = useState('cash')
  const [notes, setNotes] = useState('')
  const remainingCents = suggestedAmount ? Math.max(0, suggestedAmount - paidCents) : 0
  const [amountStr, setAmountStr] = useState(
    remainingCents > 0 ? String(remainingCents / 100) : suggestedAmount ? String(suggestedAmount / 100) : ''
  )
  const [saving, setSaving] = useState(false)
  const [reminding, setReminding] = useState(false)
  const [remindOk, setRemindOk] = useState(false)

  const amountCents = Math.round(parseFloat(amountStr || '0') * 100)
  const isPartial = suggestedAmount && amountCents > 0 && amountCents < suggestedAmount
  const isOver = suggestedAmount && amountCents > suggestedAmount
  const isOnline = method === 'stripe'

  const handlePaid = async () => {
    if (amountCents <= 0) return
    setSaving(true)
    if (isOnline && onPayOnline) {
      await onPayOnline(amountCents)
    } else {
      await onMarkPaid(method, amountCents, notes.trim() || undefined)
    }
    setSaving(false)
    onClose()
  }

  const handlePending = async () => {
    setSaving(true)
    await onMarkPending()
    setSaving(false)
    onClose()
  }

  const handleRemind = async () => {
    if (!targetUserId || !templateTitle) return
    setReminding(true)
    await fetch('/api/contributions/remind', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId, templateTitle, paidCents, expectedCents: suggestedAmount ?? 0 }),
    })
    setReminding(false)
    setRemindOk(true)
    setTimeout(() => setRemindOk(false), 3000)
  }

  const canRemind = !!targetUserId && !!templateTitle && !isPaid

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F4F4F6]">
          <div>
            <p className="text-sm font-bold text-brand-dark font-[family-name:var(--font-nunito)]">{memberName}</p>
            {canRemind && (
              <button onClick={() => void handleRemind()} disabled={reminding}
                className="flex items-center gap-1 mt-0.5 text-[11px] font-semibold text-[#6B7280] hover:text-secondary transition-colors font-[family-name:var(--font-nunito)] disabled:opacity-50">
                <Mail className="w-3 h-3" />
                {remindOk ? '✓ Email envoyé !' : reminding ? 'Envoi…' : 'Relancer par email'}
              </button>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-brand-bg flex items-center justify-center">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {isPaid ? (
            <>
              <div className="flex items-center gap-2 text-sm text-success bg-primary-light rounded-xl px-4 py-3 font-[family-name:var(--font-nunito)]">
                <Check className="w-4 h-4" /> Déjà marqué comme payé
              </div>
              <button onClick={() => void handlePending()} disabled={saving}
                className="w-full flex items-center justify-center gap-2 h-10 border border-secondary text-secondary text-sm font-semibold rounded-xl hover:bg-secondary-light transition-colors disabled:opacity-50 font-[family-name:var(--font-nunito)]">
                <RotateCcw className="w-4 h-4" />
                {saving ? '…' : 'Annuler le paiement'}
              </button>
            </>
          ) : (
            <>
              {/* Montant */}
              <div>
                <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">
                  {paidCents > 0 ? 'Complément encaissé' : 'Montant encaissé'}
                  {suggestedAmount ? <span className="font-normal text-[#9CA3AF]"> — cotisation : {(suggestedAmount / 100).toFixed(0)} €{paidCents > 0 ? ` · déjà versé : ${(paidCents / 100).toFixed(0)} €` : ''}</span> : ''}
                </label>
                <div className="mt-1.5 flex items-center border border-[#D1D1D6] rounded-xl overflow-hidden bg-brand-bg h-11">
                  <input
                    type="number" min="0" step="0.01" value={amountStr}
                    onChange={e => setAmountStr(e.target.value)}
                    placeholder="0"
                    className="flex-1 h-full px-3 text-base font-bold bg-transparent focus:outline-none font-[family-name:var(--font-nunito)] text-brand-dark"
                  />
                  <span className="pr-3 text-sm text-[#6B7280] font-semibold">€</span>
                </div>

                {isPartial && (
                  <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <p className="text-xs font-semibold text-amber-700 font-[family-name:var(--font-nunito)]">
                      Paiement partiel — {amountCents / 100} € / {(suggestedAmount! / 100).toFixed(0)} € attendu
                    </p>
                  </div>
                )}
                {isOver && (
                  <div className="mt-2 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <p className="text-xs font-semibold text-red-600 font-[family-name:var(--font-nunito)]">
                      Montant supérieur à l&apos;attendu
                    </p>
                  </div>
                )}
              </div>

              {/* Moyen de paiement */}
              <div>
                <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">Moyen de paiement</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {METHODS.map(m => (
                    <button key={m.value} type="button" onClick={() => setMethod(m.value)}
                      className={`h-10 rounded-xl border text-sm font-semibold transition-colors font-[family-name:var(--font-nunito)] ${method === m.value ? 'border-success bg-primary-light text-success' : 'border-[#D1D1D6] text-[#6B7280]'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note — masquée en mode Stripe */}
              {!isOnline && (
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">Note (optionnelle)</label>
                  <input value={notes} onChange={e => setNotes(e.target.value)} maxLength={200}
                    autoComplete="off" name="payment-note"
                    placeholder={isPartial ? 'ex : reste à payer en janvier' : 'ex : payé en 2 fois'}
                    className="mt-1.5 w-full h-10 px-3 rounded-xl border border-[#D1D1D6] text-sm bg-brand-bg focus:outline-none focus:border-success font-[family-name:var(--font-nunito)]" />
                </div>
              )}

              {/* Info mode Stripe */}
              {isOnline && (
                <div className="bg-primary-light border border-success/20 rounded-xl px-3 py-2.5 text-xs text-success font-semibold font-[family-name:var(--font-nunito)]">
                  Le membre sera redirigé vers Stripe Checkout pour payer en ligne par carte. Le statut se met à jour automatiquement.
                </div>
              )}

              <button onClick={() => void handlePaid()} disabled={saving || amountCents <= 0}
                className={`w-full flex items-center justify-center gap-2 h-11 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 font-[family-name:var(--font-nunito)] ${isOnline ? 'bg-success hover:bg-[#238f44]' : isPartial ? 'bg-amber-500 hover:bg-amber-600' : 'bg-secondary hover:bg-[#d4571f]'}`}>
                <Check className="w-4 h-4" />
                {saving ? '…' : isOnline ? `Payer en ligne — ${amountCents / 100} €` : isPartial ? `Enregistrer paiement partiel (${amountCents / 100} €)` : 'Marquer comme payé'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
