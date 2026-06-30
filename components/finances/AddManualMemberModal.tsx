'use client'

import { useState } from 'react'
import { X, UserPlus } from 'lucide-react'

interface Props {
  categories: string[]
  defaultAmount?: number
  getDefaultAmount?: (category: string | null) => number
  onAdd: (name: string, category: string | null, amountCents: number) => Promise<boolean>
  onClose: () => void
}

export function AddManualMemberModal({ categories, defaultAmount = 0, getDefaultAmount, onAdd, onClose }: Props) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(categories[0] ?? '')
  const [customCategory, setCustomCategory] = useState('')
  const initialAmount = () => {
    if (getDefaultAmount && categories[0]) {
      const c = getDefaultAmount(categories[0])
      if (c > 0) return (c / 100).toFixed(2)
    }
    return defaultAmount > 0 ? (defaultAmount / 100).toFixed(2) : ''
  }
  const [amount, setAmount] = useState(initialAmount)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const finalCategory = category === '__custom__' ? customCategory.trim() : category

  const submit = async () => {
    if (!name.trim()) { setError('Nom obligatoire'); return }
    const cents = Math.round(parseFloat(amount || '0') * 100)
    if (cents <= 0) { setError('Montant obligatoire'); return }
    setSaving(true)
    const ok = await onAdd(name.trim(), finalCategory || null, cents)
    setSaving(false)
    if (ok) onClose()
    else setError('Erreur lors de l\'ajout')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F4F4F6]">
          <h2 className="text-sm font-bold text-brand-dark font-[family-name:var(--font-nunito)]">Ajouter hors application</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-brand-bg flex items-center justify-center">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">Nom complet *</label>
            <input value={name} onChange={e => { setName(e.target.value); setError(null) }} maxLength={80}
              placeholder="ex : Dupont Pierre"
              className="mt-1.5 w-full h-10 px-3 rounded-xl border border-[#D1D1D6] text-sm bg-brand-bg focus:outline-none focus:border-success font-[family-name:var(--font-nunito)]" />
          </div>

          {categories.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">Catégorie</label>
              <select value={category} onChange={e => {
                const cat = e.target.value
                setCategory(cat)
                if (getDefaultAmount && cat !== '__custom__') {
                  const cents = getDefaultAmount(cat)
                  if (cents > 0) setAmount((cents / 100).toFixed(2))
                }
              }}
                className="mt-1.5 w-full h-10 px-3 rounded-xl border border-[#D1D1D6] text-sm bg-brand-bg focus:outline-none focus:border-success font-[family-name:var(--font-nunito)]">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__custom__">Autre…</option>
              </select>
              {category === '__custom__' && (
                <input value={customCategory} onChange={e => setCustomCategory(e.target.value)} maxLength={40}
                  placeholder="Nom de la catégorie"
                  className="mt-2 w-full h-10 px-3 rounded-xl border border-[#D1D1D6] text-sm bg-brand-bg focus:outline-none focus:border-success font-[family-name:var(--font-nunito)]" />
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">Montant *</label>
            <div className="mt-1.5 flex items-center border border-[#D1D1D6] rounded-xl bg-brand-bg h-10 overflow-hidden focus-within:border-success">
              <input type="number" min="0" step="0.01" value={amount} onChange={e => { setAmount(e.target.value); setError(null) }}
                placeholder="0.00"
                className="flex-1 h-full px-3 bg-transparent text-sm focus:outline-none font-[family-name:var(--font-nunito)]" />
              <span className="pr-3 text-sm text-[#6B7280]">€</span>
            </div>
          </div>

          {error && <p className="text-xs text-secondary font-[family-name:var(--font-nunito)]">{error}</p>}

          <button onClick={() => void submit()} disabled={saving}
            className="w-full flex items-center justify-center gap-2 h-11 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-[#d4571f] transition-colors disabled:opacity-50 font-[family-name:var(--font-nunito)]">
            <UserPlus className="w-4 h-4" />
            {saving ? 'Ajout…' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}
