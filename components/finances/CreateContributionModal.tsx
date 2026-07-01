'use client'

import { useState } from 'react'
import { X, Save, Beer, Receipt } from 'lucide-react'
import { TarifsEditor } from './TarifsEditor'
import type { ContributionTarif } from '@/lib/hooks/useContributions'

interface Props {
  onClose: () => void
  onCreate: (payload: {
    title: string; description?: string; deadline?: string | null
    warning_message?: string | null; is_buvette: boolean
    tarifs: ContributionTarif[]
  }) => Promise<void>
}

export function CreateContributionModal({ onClose, onCreate }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [warning, setWarning] = useState('')
  const [isBuvette, setIsBuvette] = useState(false)
  const [defaultAmount, setDefaultAmount] = useState('')
  const [tarifs, setTarifs] = useState<ContributionTarif[]>([])
  const [showCategories, setShowCategories] = useState(false)
  const [saving, setSaving] = useState(false)

  const valid = title.trim().length > 0

  const submit = async () => {
    if (!valid) return
    setSaving(true)
    let finalTarifs = tarifs.filter(t => t.category.trim() && t.amount_cents > 0)
    if (!isBuvette && finalTarifs.length === 0 && parseFloat(defaultAmount) > 0) {
      finalTarifs = [{ category: '', amount_cents: Math.round(parseFloat(defaultAmount) * 100) }]
    }
    await onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      deadline: deadline || null,
      warning_message: warning.trim() || null,
      is_buvette: isBuvette,
      tarifs: isBuvette ? [] : finalTarifs,
    })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-sand">
          <h2 className="text-base font-[800] text-brand-dark uppercase tracking-tight font-[family-name:var(--font-barlow)]">
            Nouvelle cotisation
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-brand-bg flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-brand-muted" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Cotisation', icon: Receipt, value: false },
              { label: 'Buvette', icon: Beer, value: true },
            ].map(({ label, icon: Icon, value }) => (
              <button key={label} type="button" onClick={() => setIsBuvette(value)}
                className={`flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-semibold transition-colors font-[family-name:var(--font-nunito)] ${isBuvette === value ? 'border-success bg-primary-light text-success' : 'border-brand-border text-brand-muted hover:border-success'}`}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Titre */}
          <div>
            <label className="text-xs font-semibold text-brand-muted font-[family-name:var(--font-nunito)]">Titre *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} maxLength={80}
              placeholder={isBuvette ? 'ex : Buvette Saison 2026/27' : 'ex : Licence 2026/27'}
              className="mt-1.5 w-full h-10 px-3 rounded-xl border border-brand-border text-sm bg-brand-bg focus:outline-none focus:border-success font-[family-name:var(--font-nunito)]" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-brand-muted font-[family-name:var(--font-nunito)]">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} maxLength={600}
              placeholder={isBuvette ? 'Recettes de la buvette du club...' : 'Ce qui est inclus : licence joueur, maillot, chaussettes...'}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-brand-border text-sm bg-brand-bg focus:outline-none focus:border-success resize-none font-[family-name:var(--font-nunito)]" />
          </div>

          {!isBuvette && (
            <>
              {/* Montant unique — cas le plus courant */}
              <div>
                <label className="text-xs font-semibold text-brand-muted font-[family-name:var(--font-nunito)]">Montant (€)</label>
                <div className="mt-1.5 flex items-center border border-brand-border rounded-xl overflow-hidden bg-brand-bg h-10">
                  <input
                    type="number" min="0" step="0.01" value={defaultAmount}
                    onChange={e => { setDefaultAmount(e.target.value); if (e.target.value) setShowCategories(false) }}
                    placeholder="ex : 80"
                    className="flex-1 h-full px-3 text-sm bg-transparent focus:outline-none font-[family-name:var(--font-nunito)]"
                  />
                  <span className="pr-3 text-sm text-brand-muted font-semibold">€</span>
                </div>
              </div>

              {/* Tarifs par catégorie — optionnel */}
              <div>
                <button type="button"
                  onClick={() => { setShowCategories(v => !v); if (!showCategories) setDefaultAmount('') }}
                  className="text-xs text-success font-semibold hover:opacity-80 transition-opacity font-[family-name:var(--font-nunito)]">
                  {showCategories ? '− Masquer les tarifs par catégorie' : '+ Tarifs différents par catégorie (Seniors, Juniors…)'}
                </button>
                {showCategories && <div className="mt-2"><TarifsEditor tarifs={tarifs} onChange={setTarifs} /></div>}
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-muted font-[family-name:var(--font-nunito)]">Date limite de règlement</label>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                  className="mt-1.5 w-full h-10 px-3 rounded-xl border border-brand-border text-sm bg-brand-bg focus:outline-none focus:border-success font-[family-name:var(--font-nunito)]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-muted font-[family-name:var(--font-nunito)]">Message d&apos;avertissement</label>
                <input value={warning} onChange={e => setWarning(e.target.value)} maxLength={200}
                  placeholder="ex : Licence non payée = pas de match ni entraînement"
                  className="mt-1.5 w-full h-10 px-3 rounded-xl border border-brand-border text-sm bg-brand-bg focus:outline-none focus:border-success font-[family-name:var(--font-nunito)]" />
              </div>
            </>
          )}

          <button onClick={() => void submit()} disabled={!valid || saving}
            className="w-full flex items-center justify-center gap-2 h-11 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50 font-[family-name:var(--font-nunito)]">
            <Save className="w-4 h-4" />
            {saving ? 'Création…' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  )
}
