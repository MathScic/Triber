'use client'

import { useState } from 'react'
import { AlertTriangle, Calendar, Beer, Receipt, ChevronRight, MoreVertical, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import type { ContributionTemplate } from '@/lib/hooks/useContributions'

interface Props {
  template: ContributionTemplate
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
}

export function ContributionCard({ template, onClick, onEdit, onDelete, onToggleActive }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const pct = template.payments_count > 0 ? Math.round((template.paid_count / template.payments_count) * 100) : 0
  const deadlinePast = template.deadline && new Date(template.deadline) < new Date()
  const fmtDate = template.deadline
    ? new Date(template.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  const icon = template.is_buvette
    ? <Beer className="w-5 h-5 text-blue-500" />
    : <Receipt className="w-5 h-5 text-[#2A9D4E]" />
  const iconBg = template.is_buvette ? 'bg-blue-50' : 'bg-[#E8F5EE]'

  return (
    <div className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm">
      <div className="p-4 flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#1A1F16] font-[family-name:var(--font-nunito)] truncate">{template.title}</p>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0 ${
              template.is_buvette ? 'bg-blue-50 text-blue-600' :
              template.is_active ? 'bg-[#E8F5EE] text-[#2A9D4E]' : 'bg-[#F4F4F6] text-[#6B7280]'
            }`}>
              {template.is_buvette ? 'Cumulatif' : template.is_active ? 'Actif' : 'Terminé'}
            </span>
          </div>

          {fmtDate && (
            <div className={`flex items-center gap-1.5 text-xs font-[family-name:var(--font-nunito)] ${deadlinePast ? 'text-[#E8622A] font-semibold' : 'text-[#6B7280]'}`}>
              <Calendar className="w-3.5 h-3.5" />
              Date limite <span className={deadlinePast ? 'text-[#E8622A]' : 'text-[#1A1F16]'}>{fmtDate}</span>
            </div>
          )}

          {!template.is_buvette && template.payments_count > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-[family-name:var(--font-nunito)]">
                <span className="text-[#1A1F16] font-semibold">{template.paid_count}/{template.payments_count} payés</span>
                <span className="text-[#6B7280]">{pct}%</span>
              </div>
              <div className="h-2 bg-[#F4F4F6] rounded-full overflow-hidden">
                <div className="h-full bg-[#2A9D4E] rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          {template.is_buvette && (
            <p className="text-3xl font-[800] text-[#2A9D4E] tabular-nums leading-none font-[family-name:var(--font-barlow)]">
              {(template.total_paid_cents / 100).toFixed(0)} €
            </p>
          )}

          {!template.is_buvette && !template.payments_count && (
            <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">Aucun paiement enregistré</p>
          )}

          {template.warning_message && (
            <div className="flex items-center gap-1.5 text-xs text-[#E8622A] font-[family-name:var(--font-nunito)]">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{template.warning_message}</span>
            </div>
          )}
        </div>

        {/* Menu ⋮ */}
        <div className="relative flex-shrink-0">
          <button onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); setConfirmDelete(false) }}
            className="w-8 h-8 rounded-lg hover:bg-[#F4F4F6] flex items-center justify-center transition-colors">
            <MoreVertical className="w-4 h-4 text-[#9CA3AF]" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 bg-white border border-[#D1D1D6] rounded-xl shadow-lg py-1 min-w-[160px]">
              {!template.is_buvette && (
                <button onClick={() => { setMenuOpen(false); onEdit() }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1A1F16] hover:bg-[#F4F4F6] transition-colors font-[family-name:var(--font-nunito)]">
                  <Pencil className="w-3.5 h-3.5 text-[#6B7280]" /> Modifier
                </button>
              )}
              <button onClick={() => { setMenuOpen(false); onToggleActive() }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1A1F16] hover:bg-[#F4F4F6] transition-colors font-[family-name:var(--font-nunito)]">
                {template.is_active
                  ? <><ToggleRight className="w-3.5 h-3.5 text-[#6B7280]" /> Archiver</>
                  : <><ToggleLeft className="w-3.5 h-3.5 text-[#6B7280]" /> Réactiver</>
                }
              </button>
              {!confirmDelete
                ? <button onClick={() => setConfirmDelete(true)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#E8622A] hover:bg-[#FDF0EB] transition-colors font-[family-name:var(--font-nunito)]">
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                  </button>
                : <div className="px-4 py-2.5 space-y-2 border-t border-[#F4F4F6]">
                    <p className="text-xs font-semibold text-[#E8622A] font-[family-name:var(--font-nunito)]">Supprimer définitivement ?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmDelete(false)}
                        className="flex-1 text-xs py-1.5 rounded-lg border border-[#D1D1D6] text-[#6B7280] font-[family-name:var(--font-nunito)]">
                        Annuler
                      </button>
                      <button onClick={() => { setMenuOpen(false); onDelete() }}
                        className="flex-1 text-xs py-1.5 rounded-lg bg-[#E8622A] text-white font-semibold font-[family-name:var(--font-nunito)]">
                        Supprimer
                      </button>
                    </div>
                  </div>
              }
            </div>
          )}
        </div>
      </div>

      <button onClick={onClick}
        className="w-full flex items-center justify-center gap-1.5 py-3 border-t border-[#F4F4F6] text-sm font-semibold text-[#2A9D4E] hover:bg-[#E8F5EE] transition-colors font-[family-name:var(--font-nunito)]">
        {template.is_buvette ? 'Voir les entrées' : 'Voir la liste'} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
