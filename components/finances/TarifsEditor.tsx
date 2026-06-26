'use client'

import { Plus, Trash2 } from 'lucide-react'
import type { ContributionTarif } from '@/lib/hooks/useContributions'

interface Props {
  tarifs: ContributionTarif[]
  onChange: (tarifs: ContributionTarif[]) => void
}

export function TarifsEditor({ tarifs, onChange }: Props) {
  const update = (i: number, field: keyof ContributionTarif, value: string) => {
    const next = tarifs.map((t, idx) =>
      idx === i ? { ...t, [field]: field === 'amount_cents' ? Math.round(parseFloat(value || '0') * 100) : value } : t
    )
    onChange(next)
  }

  const add = () => onChange([...tarifs, { category: '', amount_cents: 0 }])
  const remove = (i: number) => onChange(tarifs.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">
          Tarifs par catégorie
        </label>
        <button type="button" onClick={add}
          className="flex items-center gap-1 text-xs text-[#2A9D4E] font-semibold hover:opacity-80 transition-opacity font-[family-name:var(--font-nunito)]">
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>

      {tarifs.length === 0 && (
        <p className="text-xs text-[#6B7280] italic py-1 font-[family-name:var(--font-nunito)]">
          Pas de tarif → le montant sera saisi manuellement à chaque paiement.
        </p>
      )}

      {tarifs.map((t, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={t.category}
            onChange={e => update(i, 'category', e.target.value)}
            placeholder="ex : Seniors"
            className="flex-1 h-9 px-3 rounded-xl border border-[#D1D1D6] text-sm bg-[#F4F4F6] focus:outline-none focus:border-[#2A9D4E] font-[family-name:var(--font-nunito)]"
          />
          <div className="flex items-center border border-[#D1D1D6] rounded-xl overflow-hidden bg-[#F4F4F6] h-9">
            <input
              type="number" min="0" step="0.01"
              value={t.amount_cents > 0 ? (t.amount_cents / 100).toFixed(2) : ''}
              onChange={e => update(i, 'amount_cents', e.target.value)}
              placeholder="0"
              className="w-20 h-full px-2 text-sm text-right bg-transparent focus:outline-none font-[family-name:var(--font-nunito)]"
            />
            <span className="pr-2 text-sm text-[#6B7280]">€</span>
          </div>
          <button type="button" onClick={() => remove(i)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-red-50 text-[#E8622A] transition-colors flex-shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
