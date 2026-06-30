'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { ArrowLeft, Plus, AlertTriangle, Download, BellRing, Search, X, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useContributionPayments } from '@/lib/hooks/useContributionPayments'
import { useTreasury } from '@/lib/hooks/useTreasury'
import { PaymentMemberList } from '@/components/finances/PaymentMemberList'
import { MarkPaidModal } from '@/components/finances/MarkPaidModal'
import { AddManualMemberModal } from '@/components/finances/AddManualMemberModal'
import { BuvetteList } from '@/components/finances/BuvetteList'
import { BuvetteEntryForm } from '@/components/finances/BuvetteEntryForm'
import type { OrgMemberForPayment, ContributionPayment } from '@/lib/hooks/useContributionPayments'
import type { ContributionTemplate } from '@/lib/hooks/useContributions'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

type Selected = { member?: OrgMemberForPayment; manual?: ContributionPayment }

function RelanceModal({ members, manualMembers, templateTitle, onClose, getExpectedAmount }: {
  members: OrgMemberForPayment[]; manualMembers: ContributionPayment[]
  templateTitle: string; onClose: () => void
  getExpectedAmount: (category: string | null) => number
}) {
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
  const copy = () => { void navigator.clipboard.writeText(msg); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F4F4F6]">
          <div>
            <p className="text-sm font-bold text-brand-dark font-[family-name:var(--font-nunito)]">Relancer les impayés</p>
            <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">{pending.length} membre{pending.length !== 1 ? 's' : ''} en attente</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-brand-bg flex items-center justify-center"><X className="w-4 h-4 text-[#6B7280]" /></button>
        </div>
        <div className="p-5 space-y-4">
          {pending.length === 0
            ? <p className="text-sm text-center text-success font-semibold py-4 font-[family-name:var(--font-nunito)]">✓ Tout le monde a payé !</p>
            : <>
                <div className="bg-brand-bg rounded-xl p-3 max-h-48 overflow-y-auto">
                  <p className="text-xs text-brand-dark whitespace-pre-wrap font-[family-name:var(--font-nunito)]">{msg}</p>
                </div>
                <button onClick={copy}
                  className={`w-full flex items-center justify-center gap-2 h-11 text-sm font-semibold rounded-xl transition-colors font-[family-name:var(--font-nunito)] ${copied ? 'bg-success text-white' : 'bg-brand-dark text-white hover:bg-[#2a2f25]'}`}>
                  {copied ? <><Check className="w-4 h-4" /> Copié !</> : <><Copy className="w-4 h-4" /> Copier le message</>}
                </button>
                <p className="text-center text-xs text-[#9CA3AF] font-[family-name:var(--font-nunito)]">Collez ce message dans WhatsApp ou par email</p>
              </>
          }
        </div>
      </div>
    </div>
  )
}

function methodLabel(m: string | null | undefined) {
  if (m === 'cash') return 'Espèces'; if (m === 'tpe') return 'Carte'; if (m === 'transfer') return 'Virement'; if (m === 'stripe') return 'En ligne'; return m ?? ''
}
function rowBg(status: string, paid: number, exp: number) {
  if (status === 'paid') return (exp > 0 && paid < exp) ? '#FEF3C7' : '#DCFCE7'
  if (status === 'failed') return '#FEE2E2'; return '#FFF7ED'
}
function statusLabel(status: string, paid: number, exp: number) {
  if (status === 'paid') return (exp > 0 && paid < exp) ? 'Paiement partiel' : 'Payé intégralement'
  if (status === 'failed') return 'Paiement refusé'; return 'En attente'
}

function exportXLS(members: OrgMemberForPayment[], manualMembers: ContributionPayment[], title: string, getExpectedAmount: (c: string | null) => number) {
  const HEADERS = ['Nom', 'Catégorie', 'Statut', 'Montant versé (€)', 'Montant attendu (€)', 'Différence (€)', 'Date paiement', 'Mode']
  const all = [
    ...members.map(m => ({ name: m.full_name ?? '—', cat: m.category, status: m.payment?.status ?? 'pending', paid: m.payment?.amount_cents ?? 0, paidAt: m.payment?.paid_at ?? null, method: m.payment?.payment_method })),
    ...manualMembers.map(m => ({ name: m.manual_name ?? '—', cat: m.category, status: m.status, paid: m.amount_cents, paidAt: m.paid_at, method: m.payment_method })),
  ]
  let totalPaid = 0, totalExp = 0
  const bodyHtml = all.map(r => {
    const exp = getExpectedAmount(r.cat ?? null)
    const diff = r.paid - exp
    const bg = rowBg(r.status, r.paid, exp)
    totalPaid += r.paid; totalExp += exp
    const diffStyle = diff < 0 ? 'color:#B91C1C;font-weight:bold;' : diff > 0 ? 'color:#065F46;' : ''
    return `<tr style="background:${bg}"><td>${r.name}</td><td>${r.cat ?? '—'}</td><td>${statusLabel(r.status, r.paid, exp)}</td><td>${(r.paid / 100).toFixed(2)}</td><td>${exp > 0 ? (exp / 100).toFixed(2) : '—'}</td><td style="${diffStyle}">${exp > 0 ? (diff / 100).toFixed(2) : '—'}</td><td>${r.paidAt ? new Date(r.paidAt).toLocaleDateString('fr-FR') : '—'}</td><td>${methodLabel(r.method)}</td></tr>`
  }).join('')
  const diffTotal = totalPaid - totalExp
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>
<h2 style="font-family:Arial;color:#1A1F16">${title}</h2>
<p style="font-family:Arial;font-size:10pt;color:#6B7280">Exporté le ${new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}</p>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:10pt">
<thead><tr style="background:#1A1F16;color:#fff;font-weight:bold">${HEADERS.map(h => `<th>${h}</th>`).join('')}</tr></thead>
<tbody>${bodyHtml}</tbody>
<tfoot><tr style="background:#F4F4F6;font-weight:bold;border-top:2px solid #1A1F16"><td colspan="3">TOTAL — ${all.length} personne${all.length > 1 ? 's' : ''}</td><td>${(totalPaid / 100).toFixed(2)}</td><td>${totalExp > 0 ? (totalExp / 100).toFixed(2) : '—'}</td><td style="${diffTotal < 0 ? 'color:#B91C1C;font-weight:bold' : ''}">${totalExp > 0 ? (diffTotal / 100).toFixed(2) : '—'}</td><td colspan="2"></td></tr></tfoot>
</table><br/><p style="font-family:Arial;font-size:9pt;color:#9CA3AF">Légende : <span style="background:#DCFCE7;padding:2px 6px">■</span> Payé &nbsp;<span style="background:#FEF3C7;padding:2px 6px">■</span> Partiel &nbsp;<span style="background:#FFF7ED;padding:2px 6px">■</span> En attente &nbsp;<span style="background:#FEE2E2;padding:2px 6px">■</span> Refusé</p>
</body></html>`
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' })), download: `${title}.xls` })
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href)
}

export default function FinanceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [template, setTemplate] = useState<ContributionTemplate | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Selected | null>(null)
  const [showAddManual, setShowAddManual] = useState(false)
  const [showBuvetteForm, setShowBuvetteForm] = useState(false)
  const [showRelance, setShowRelance] = useState(false)
  const [search, setSearch] = useState('')

  const payments = useContributionPayments()
  const treasury = useTreasury()

  useEffect(() => {
    const s = createClient()
    s.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      s.from('organization_members').select('organization_id, role').eq('user_id', user.id).maybeSingle()
        .then(({ data: mem }) => {
          if (!mem) { router.push('/home'); return }
          const oid = mem.organization_id as string
          setOrgId(oid)
          s.from('contribution_templates')
            .select('*, contribution_tarifs(id,category,amount_cents), contribution_payments(id,status,amount_cents)')
            .eq('id', id).single()
            .then(({ data }) => {
              if (!data) { router.push('/finances'); return }
              const pmts = (data.contribution_payments as { status: string; amount_cents: number }[] | null) ?? []
              setTemplate({ ...data, tarifs: data.contribution_tarifs ?? [], payments_count: pmts.length, paid_count: pmts.filter((p: { status: string }) => p.status === 'paid').length, total_expected_cents: pmts.reduce((s: number, p: { amount_cents: number }) => s + p.amount_cents, 0), total_paid_cents: pmts.filter((p: { status: string }) => p.status === 'paid').reduce((s: number, p: { amount_cents: number }) => s + p.amount_cents, 0) } as ContributionTemplate)
              if (data.is_buvette) treasury.fetch(id)
              else payments.fetch(id, oid)
            })
        })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!template || !orgId) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-success border-t-transparent animate-spin" />
    </div>
  )

  const getAmount = (category: string | null) =>
    template.tarifs.find(t => t.category === category)?.amount_cents
    ?? template.tarifs.find(t => t.category === '')?.amount_cents
    ?? 0

  const selectedName = selected?.member?.full_name ?? selected?.manual?.manual_name ?? '—'
  const selectedPaymentId = selected?.member?.payment?.id ?? selected?.manual?.id ?? null
  // Montant ATTENDU (tarif), identique pour membres app et membres manuels
  const selectedExpected = selected?.member
    ? getAmount(selected.member.category)
    : getAmount(selected?.manual?.category ?? null)
  // Montant PAYÉ jusqu'ici
  const selectedPaidCents = selected?.member?.payment?.amount_cents ?? selected?.manual?.amount_cents ?? 0
  // suggestedAmount = montant attendu (pré-remplit le formulaire avec le montant total)
  const selectedAmount = selectedExpected || selectedPaidCents || 0
  const selectedStatus = selected?.member?.payment?.status ?? selected?.manual?.status
  // Partiel = status paid mais montant inférieur à l'attendu → admin peut encore modifier
  const selectedPaid = selectedStatus === 'paid' && (selectedExpected === 0 || selectedPaidCents >= selectedExpected)

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-brand-bg`}>
      <div className="bg-white border-b border-[#D1D1D6] px-4 py-4 relative flex items-center justify-center">
        <Link href="/finances" className="absolute left-4 w-9 h-9 rounded-xl border border-[#D1D1D6] flex items-center justify-center hover:bg-brand-bg transition-colors">
          <ArrowLeft className="w-4 h-4 text-[#6B7280]" />
        </Link>
        <div className="text-center">
          <h1 className="text-base font-[800] text-brand-dark font-[family-name:var(--font-barlow)] uppercase tracking-tight leading-tight">{template.title}</h1>
          <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)] mt-0.5">{template.is_buvette ? 'Buvette cumulatif' : 'Liste des membres'}</p>
        </div>
        {!template.is_buvette && (
          <div className="absolute right-4 flex items-center gap-1.5">
            <button onClick={() => exportXLS(payments.members, payments.manualMembers, template.title, getAmount)}
              title="Exporter CSV"
              className="w-9 h-9 rounded-xl border border-[#D1D1D6] flex items-center justify-center hover:bg-brand-bg transition-colors">
              <Download className="w-4 h-4 text-[#6B7280]" />
            </button>
            <button onClick={() => setShowRelance(true)}
              title="Relancer les impayés"
              className="w-9 h-9 rounded-xl border border-[#D1D1D6] flex items-center justify-center hover:bg-secondary-light transition-colors">
              <BellRing className="w-4 h-4 text-secondary" />
            </button>
            <button onClick={() => setShowAddManual(true)}
              className="w-9 h-9 rounded-xl border border-[#D1D1D6] flex items-center justify-center hover:bg-brand-bg transition-colors">
              <Plus className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>
        )}
        {template.is_buvette && (
          <button onClick={() => setShowBuvetteForm(true)}
            className="absolute right-4 w-9 h-9 rounded-xl border border-[#D1D1D6] flex items-center justify-center hover:bg-brand-bg transition-colors">
            <Plus className="w-4 h-4 text-[#6B7280]" />
          </button>
        )}
      </div>

      <div className="px-4 py-5 max-w-lg lg:max-w-4xl mx-auto space-y-4">
        {template.warning_message && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5">
            <AlertTriangle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-secondary font-[family-name:var(--font-nunito)]">{template.warning_message}</p>
          </div>
        )}

        {template.is_buvette && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm p-4">
                <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">Total encaissé</p>
                <p className="text-2xl font-[800] text-success tabular-nums font-[family-name:var(--font-barlow)]">{(treasury.total / 100).toFixed(2)} €</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm p-4">
                <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">Écarts signalés</p>
                <p className={`text-2xl font-[800] tabular-nums font-[family-name:var(--font-barlow)] ${treasury.flaggedCount > 0 ? 'text-secondary' : 'text-success'}`}>{treasury.flaggedCount}</p>
              </div>
            </div>
            <BuvetteList entries={treasury.entries} isFlagged={treasury.isFlagged} />
          </>
        )}

        {!template.is_buvette && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un membre…"
                className="w-full h-10 pl-9 pr-9 rounded-xl border border-[#D1D1D6] bg-white text-sm focus:outline-none focus:border-success font-[family-name:var(--font-nunito)]" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-[#9CA3AF] hover:text-brand-dark" />
                </button>
              )}
            </div>
            <PaymentMemberList
              members={payments.members} manualMembers={payments.manualMembers}
              onClickMember={m => setSelected({ member: m })}
              onClickManual={m => setSelected({ manual: m as ContributionPayment })}
              onDeleteManual={paymentId => void payments.removePayment(paymentId, id, orgId)}
              onValidatePayment={paymentId => void payments.validatePayment(paymentId, id, orgId)}
              getExpectedAmount={getAmount}
              search={search}
            />
          </>
        )}
      </div>

      <div className="fixed bottom-6 left-0 right-0 lg:left-56 flex justify-center z-10 pointer-events-none">
        <button onClick={() => template.is_buvette ? setShowBuvetteForm(true) : setShowAddManual(true)}
          className="pointer-events-auto flex items-center gap-2.5 px-7 py-4 bg-secondary text-white text-sm font-semibold rounded-full shadow-xl hover:bg-[#d4571f] active:scale-95 transition-all font-[family-name:var(--font-nunito)]">
          <Plus className="w-5 h-5" />
          {template.is_buvette ? 'Nouvelle entrée' : 'Ajouter un paiement'}
        </button>
      </div>

      {selected && (
        <MarkPaidModal
          memberName={selectedName}
          isPaid={selectedPaid}
          suggestedAmount={selectedAmount || undefined}
          paidCents={selectedPaidCents}
          targetUserId={selected?.member?.user_id ?? null}
          templateTitle={template?.title}
          onMarkPaid={async (method, amountCents, notes) => {
            const cat = selected.member?.category ?? selected.manual?.category ?? null
            await payments.markPaid(selectedPaymentId, id, orgId, selected.member?.user_id ?? null, selected.manual?.manual_name ?? null, cat, amountCents, method, notes)
          }}
          onMarkPending={async () => { if (selectedPaymentId) await payments.markPending(selectedPaymentId, id, orgId) }}
          onPayOnline={async (amountCents) => {
            const res = await fetch('/api/contributions/pay', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId: selectedPaymentId, templateId: id, amountCents, memberName: selectedName, templateTitle: template?.title }),
            })
            const data = await res.json() as { url?: string; error?: string }
            if (data.url) window.location.href = data.url
          }}
          onClose={() => setSelected(null)} />
      )}
      {showAddManual && (
        <AddManualMemberModal categories={[...new Set(template.tarifs.map(t => t.category))]}
          getDefaultAmount={getAmount}
          onAdd={(name, cat, cents) => payments.addManual(id, orgId, name, cat, cents)}
          onClose={() => setShowAddManual(false)} />
      )}
      {showBuvetteForm && (
        <BuvetteEntryForm orgId={orgId} templateId={id} onClose={() => setShowBuvetteForm(false)} onSaved={() => treasury.fetch(id)} />
      )}
      {showRelance && (
        <RelanceModal members={payments.members} manualMembers={payments.manualMembers}
          templateTitle={template.title} onClose={() => setShowRelance(false)}
          getExpectedAmount={getAmount} />
      )}
    </main>
  )
}
