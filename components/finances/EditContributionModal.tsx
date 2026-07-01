'use client'

import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { TarifsEditor } from './TarifsEditor'
import type { ContributionTemplate, ContributionTarif } from '@/lib/hooks/useContributions'

interface Props {
  template: ContributionTemplate
  onClose: () => void
  onSave: (payload: {
    title: string; description?: string; deadline?: string | null
    warning_message?: string | null; tarifs: ContributionTarif[]
  }) => Promise<void>
}

export function EditContributionModal({ template, onClose, onSave }: Props) {
  const singleTarif = !template.is_buvette && template.tarifs.length === 1 && template.tarifs[0].category === ''

  const [title, setTitle] = useState(template.title)
  const [description, setDescription] = useState(template.description ?? '')
  const [deadline, setDeadline] = useState(template.deadline?.slice(0, 10) ?? '')
  const [warning, setWarning] = useState(template.warning_message ?? '')
  const [defaultAmount, setDefaultAmount] = useState(singleTarif ? String(template.tarifs[0].amount_cents / 100) : '')
  const [tarifs, setTarifs] = useState<ContributionTarif[]>(singleTarif ? [] : template.tarifs)
  const [showCategories, setShowCategories] = useState(!singleTarif && template.tarifs.length > 0)
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!title.trim()) return
    setSaving(true)
    let finalTarifs = tarifs.filter(t => t.category.trim() && t.amount_cents > 0)
    if (!template.is_buvette && finalTarifs.length === 0 && parseFloat(defaultAmount) > 0) {
      finalTarifs = [{ category: '', amount_cents: Math.round(parseFloat(defaultAmount) * 100) }]
    }
    await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      deadline: deadline || null,
      warning_message: warning.trim() || null,
      tarifs: template.is_buvette ? [] : finalTarifs,
    })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F4F4F6]">
          <h2 className="text-base font-[800] text-brand-dark uppercase tracking-tight font-[family-name:var(--font-barlow)]">
            Modifier
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-brand-bg flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">Titre *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} maxLength={80}
              className="mt-1.5 w-full h-10 px-3 rounded-xl border border-[#D1D1D6] text-sm bg-brand-bg focus:outline-none focus:border-success font-[family-name:var(--font-nunito)]" />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} maxLength={600}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-[#D1D1D6] text-sm bg-brand-bg focus:outline-none focus:border-success resize-none font-[family-name:var(--font-nunito)]" />
          </div>

          {!template.is_buvette && (
            <>
              <div>
                <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">Montant (€)</label>
                <div className="mt-1.5 flex items-center border border-[#D1D1D6] rounded-xl overflow-hidden bg-brand-bg h-10">
                  <input type="number" min="0" step="0.01" value={defaultAmount}
                    onChange={e => { setDefaultAmount(e.target.value); if (e.target.value) setShowCategories(false) }}
                    placeholder="ex : 80"
                    className="flex-1 h-full px-3 text-sm bg-transparent focus:outline-none font-[family-name:var(--font-nunito)]" />
                  <span className="pr-3 text-sm text-[#6B7280] font-semibold">€</span>
                </div>
              </div>
              <div>
                <button type="button"
                  onClick={() => { setShowCategories(v => !v); if (!showCategories) setDefaultAmount('') }}
                  className="text-xs text-success font-semibold hover:opacity-80 font-[family-name:var(--font-nunito)]">
                  {showCategories ? '− Masquer les tarifs par catégorie' : '+ Tarifs différents par catégorie'}
                </button>
                {showCategories && <div className="mt-2"><TarifsEditor tarifs={tarifs} onChange={setTarifs} /></div>}
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">Date limite</label>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                  className="mt-1.5 w-full h-10 px-3 rounded-xl border border-[#D1D1D6] text-sm bg-brand-bg focus:outline-none focus:border-success font-[family-name:var(--font-nunito)]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">Message d&apos;avertissement</label>
                <input value={warning} onChange={e => setWarning(e.target.value)} maxLength={200}
                  className="mt-1.5 w-full h-10 px-3 rounded-xl border border-[#D1D1D6] text-sm bg-brand-bg focus:outline-none focus:border-success font-[family-name:var(--font-nunito)]" />
              </div>
            </>
          )}

          <button onClick={() => void submit()} disabled={!title.trim() || saving}
            className="w-full flex items-center justify-center gap-2 h-11 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-[#d4571f] transition-colors disabled:opacity-50 font-[family-name:var(--font-nunito)]">
            <Save className="w-4 h-4" />
            {saving ? 'Sauvegarde…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
