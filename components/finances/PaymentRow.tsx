'use client'

import { useState, useEffect, useRef } from 'react'
import { CreditCard, MoreVertical, CheckCircle, RotateCcw, ArrowRight, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { FlatPayment } from '@/lib/hooks/useAllPayments'
import { avatarColor, initials } from '@/lib/utils/avatar'

const STATUS_STYLES = {
  paid:    { label: '✓ Payé',       cls: 'bg-green-100 text-green-700' },
  pending: { label: '⏱ En attente', cls: 'bg-amber-100 text-amber-700' },
  failed:  { label: '✕ Échec',      cls: 'bg-red-100 text-red-700' },
}

interface Props {
  payment: FlatPayment
  onMarkPaid: (id: string) => void
  onMarkPending: (id: string) => void
  onDelete: (id: string) => void
}

export function PaymentRow({ payment, onMarkPaid, onMarkPending, onDelete }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const openMenu = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    setOpen(v => !v)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])
  const st = STATUS_STYLES[payment.status]
  const date = new Date(payment.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  const name = payment.member_name ?? '—'
  const color = avatarColor(name)
  const ini = initials(name)

  return (
    <div className="grid grid-cols-[32px_1fr_80px_160px_90px_110px_36px] items-center gap-3 px-4 py-3 border-b border-brand-sand last:border-0 hover:bg-brand-bg/40 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
        <CreditCard className="w-4 h-4 text-success" />
      </div>
      <p className="text-sm font-semibold text-brand-dark truncate font-[family-name:var(--font-nunito)]">{payment.template_title}</p>
      <p className="text-sm font-[800] text-brand-dark tabular-nums font-[family-name:var(--font-barlow)]">{(payment.amount_cents / 100).toFixed(0)} €</p>
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: color.bg }}>
          <span className="text-[10px] font-bold" style={{ color: color.text }}>{ini}</span>
        </div>
        <span className="text-sm text-brand-dark truncate font-[family-name:var(--font-nunito)]">{name}</span>
      </div>
      <p className="text-xs text-brand-muted font-[family-name:var(--font-nunito)]">{date}</p>
      <span className={`inline-flex items-center justify-center text-[11px] font-semibold px-2 py-1 rounded-full font-[family-name:var(--font-nunito)] ${st.cls}`}>
        {st.label}
      </span>
      <div className="relative">
        <button ref={btnRef} onClick={openMenu} className="w-8 h-8 rounded-lg hover:bg-brand-sand flex items-center justify-center">
          <MoreVertical className="w-4 h-4 text-brand-muted" />
        </button>
        {open && (
          <div ref={menuRef} style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 9999 }}
            className="bg-white border border-brand-border rounded-xl shadow-lg py-1 min-w-[200px]">
            {payment.status !== 'paid' && (
              <button onClick={() => { setOpen(false); onMarkPaid(payment.id) }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-success hover:bg-brand-bg font-[family-name:var(--font-nunito)]">
                <CheckCircle className="w-3.5 h-3.5" /> Marquer payé
              </button>
            )}
            {payment.status === 'paid' && (
              <button onClick={() => { setOpen(false); onMarkPending(payment.id) }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-muted hover:bg-brand-bg font-[family-name:var(--font-nunito)]">
                <RotateCcw className="w-3.5 h-3.5" /> Remettre en attente
              </button>
            )}
            <button onClick={() => { setOpen(false); router.push(`/finances/${payment.template_id}`) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-dark hover:bg-brand-bg font-[family-name:var(--font-nunito)] border-t border-brand-sand mt-1">
              <ArrowRight className="w-3.5 h-3.5 text-brand-muted" /> Voir la cotisation
            </button>
            <button onClick={() => { setOpen(false); onDelete(payment.id) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-[family-name:var(--font-nunito)] border-t border-brand-sand">
              <Trash2 className="w-3.5 h-3.5" /> Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
