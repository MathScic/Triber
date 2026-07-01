import type { OrgMemberForPayment, ContributionPayment } from '@/lib/hooks/useContributionPayments'

export function methodLabel(m: string | null | undefined): string {
  if (m === 'cash') return 'Espèces'
  if (m === 'tpe') return 'Carte'
  if (m === 'transfer') return 'Virement'
  if (m === 'stripe') return 'En ligne'
  return m ?? ''
}

function rowBg(status: string, paid: number, exp: number): string {
  if (status === 'paid') return (exp > 0 && paid < exp) ? '#FEF3C7' : '#DCFCE7'
  if (status === 'failed') return '#FEE2E2'
  return '#FFF7ED'
}

function statusLabel(status: string, paid: number, exp: number): string {
  if (status === 'paid') return (exp > 0 && paid < exp) ? 'Paiement partiel' : 'Payé intégralement'
  if (status === 'failed') return 'Paiement refusé'
  return 'En attente'
}

export function exportXLS(
  members: OrgMemberForPayment[],
  manualMembers: ContributionPayment[],
  title: string,
  getExpectedAmount: (c: string | null) => number
): void {
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
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' })),
    download: `${title}.xls`,
  })
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href)
}
