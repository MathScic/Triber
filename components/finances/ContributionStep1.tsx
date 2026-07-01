'use client'

import { useState } from 'react'
import { Beer, Receipt, ChevronRight } from 'lucide-react'
import { TarifsEditor } from './TarifsEditor'
import type { ContributionTarif } from '@/lib/hooks/useContributions'

export type Step1Data = {
  title: string; description?: string; deadline?: string | null
  warning_message?: string | null; is_buvette: boolean
  tarifs: ContributionTarif[]; default_amount_cents: number
}

interface Props { onSubmit: (data: Step1Data) => void; onCancel: () => void; saving?: boolean }

export function ContributionStep1({ onSubmit, onCancel, saving }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [warning, setWarning] = useState('')
  const [isBuvette, setIsBuvette] = useState(false)
  const [defaultAmount, setDefaultAmount] = useState('')
  const [tarifs, setTarifs] = useState<ContributionTarif[]>([])
  const [showCategories, setShowCategories] = useState(false)

  const handleSubmit = () => {
    if (!title.trim()) return
    let finalTarifs = tarifs.filter(t => t.category.trim() && t.amount_cents > 0)
    const defaultCents = parseFloat(defaultAmount) > 0 ? Math.round(parseFloat(defaultAmount) * 100) : 0
    if (!isBuvette && !finalTarifs.length && defaultCents > 0) finalTarifs = [{ category: '', amount_cents: defaultCents }]
    onSubmit({ title: title.trim(), description: description.trim() || undefined, deadline: deadline || null, warning_message: warning.trim() || null, is_buvette: isBuvette, tarifs: finalTarifs, default_amount_cents: defaultCents })
  }

  const F = 'font-[family-name:var(--font-nunito)]'
  const input = `w-full h-10 px-3 rounded-xl border border-brand-border text-sm bg-brand-bg focus:outline-none focus:border-success ${F}`

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {([{ label: 'Cotisation', icon: Receipt, v: false }, { label: 'Buvette', icon: Beer, v: true }] as const).map(({ label, icon: Icon, v }) => (
          <button key={label} onClick={() => setIsBuvette(v)}
            className={`flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-semibold transition-colors ${F} ${isBuvette === v ? 'border-success bg-primary-light text-success' : 'border-brand-border text-brand-muted hover:border-success'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      <div>
        <label className={`text-xs font-semibold text-brand-muted ${F}`}>Titre *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} maxLength={80}
          placeholder={isBuvette ? 'ex : Buvette Saison 2026/27' : 'ex : Licence 2026/27'}
          className={`mt-1.5 ${input}`} />
      </div>

      <div>
        <label className={`text-xs font-semibold text-brand-muted ${F}`}>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} maxLength={600}
          placeholder={isBuvette ? 'Recettes de la buvette...' : 'Ce qui est inclus : licence joueur, maillot...'}
          className={`mt-1.5 w-full px-3 py-2.5 rounded-xl border border-brand-border text-sm bg-brand-bg focus:outline-none focus:border-success resize-none ${F}`} />
      </div>

      {!isBuvette && (
        <>
          <div>
            <label className={`text-xs font-semibold text-brand-muted ${F}`}>Montant (€)</label>
            <div className="mt-1.5 flex items-center border border-brand-border rounded-xl overflow-hidden bg-brand-bg h-10">
              <input type="number" min="0" step="0.01" value={defaultAmount} placeholder="ex : 80"
                onChange={e => { setDefaultAmount(e.target.value); if (e.target.value) setShowCategories(false) }}
                className={`flex-1 h-full px-3 text-sm bg-transparent focus:outline-none ${F}`} />
              <span className={`pr-3 text-sm text-brand-muted font-semibold`}>€</span>
            </div>
          </div>
          <div>
            <button onClick={() => { setShowCategories(v => !v); if (!showCategories) setDefaultAmount('') }}
              className={`text-xs text-success font-semibold hover:opacity-80 ${F}`}>
              {showCategories ? '− Masquer les tarifs par catégorie' : '+ Tarifs différents par catégorie (Seniors, Juniors…)'}
            </button>
            {showCategories && <div className="mt-2"><TarifsEditor tarifs={tarifs} onChange={setTarifs} /></div>}
          </div>
          <div>
            <label className={`text-xs font-semibold text-brand-muted ${F}`}>Date limite de règlement</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={`mt-1.5 ${input}`} />
          </div>
          <div>
            <label className={`text-xs font-semibold text-brand-muted ${F}`}>Message d&apos;avertissement</label>
            <input value={warning} onChange={e => setWarning(e.target.value)} maxLength={200}
              placeholder="ex : Licence non payée = pas de match ni entraînement" className={`mt-1.5 ${input}`} />
          </div>
        </>
      )}

      <div className="flex gap-3 pt-1">
        <button onClick={onCancel} className={`flex-1 h-11 border border-brand-border text-sm font-semibold text-brand-muted rounded-xl hover:bg-brand-bg transition-colors ${F}`}>Annuler</button>
        <button onClick={handleSubmit} disabled={!title.trim() || saving}
          className={`flex-1 h-11 bg-success text-white text-sm font-semibold rounded-xl hover:bg-success/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors ${F}`}>
          {saving ? 'Création…' : isBuvette ? 'Créer' : <><span>Suivant</span><ChevronRight className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  )
}
