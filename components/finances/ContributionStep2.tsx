'use client'

import { useState, useMemo } from 'react'
import { Search, Check, ChevronLeft } from 'lucide-react'
import { avatarColor, initials } from '@/lib/utils/avatar'

export type SelectedMember = { user_id: string; category: string | null }
export type OrgMemberForSelection = { user_id: string; category: string | null; full_name: string | null }

interface Props {
  members: OrgMemberForSelection[]
  loading: boolean
  onBack: () => void
  onConfirm: (members: SelectedMember[]) => void
  saving: boolean
}

export function ContributionStep2({ members, loading, onBack, onConfirm, saving }: Props) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return members.filter(m => !q || (m.full_name ?? '').toLowerCase().includes(q))
  }, [members, search])

  const grouped = useMemo(() => {
    const map = new Map<string, OrgMemberForSelection[]>()
    for (const m of filtered) {
      const cat = m.category ?? 'Sans catégorie'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(m)
    }
    return map
  }, [filtered])

  const allSelected = filtered.length > 0 && selected.size === filtered.length
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map(m => m.user_id)))
  const toggle = (uid: string) => setSelected(prev => { const n = new Set(prev); if (n.has(uid)) n.delete(uid); else n.add(uid); return n })

  const confirm = () => onConfirm([...selected].map(uid => ({ user_id: uid, category: members.find(m => m.user_id === uid)?.category ?? null })))

  if (loading) return <div className="h-40 animate-pulse bg-brand-bg rounded-xl" />

  const F = 'font-[family-name:var(--font-nunito)]'

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un membre..."
            className={`w-full h-10 pl-9 pr-3 rounded-xl border border-brand-border text-sm bg-brand-bg focus:outline-none focus:border-success ${F}`} />
        </div>
        <button onClick={toggleAll} className={`h-10 px-3 rounded-xl border border-brand-border text-xs font-semibold text-brand-muted hover:bg-brand-bg transition-colors whitespace-nowrap ${F}`}>
          {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
        {[...grouped.entries()].map(([cat, mems]) => (
          <div key={cat}>
            <p className={`text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-2 ${F}`}>{cat} ({mems.length})</p>
            <div className="space-y-1">
              {mems.map(m => {
                const isOn = selected.has(m.user_id)
                const color = avatarColor(m.full_name ?? '?')
                const ini = initials(m.full_name ?? '?')
                return (
                  <button key={m.user_id} onClick={() => toggle(m.user_id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${isOn ? 'border-success bg-primary-light' : 'border-brand-border hover:bg-brand-bg'}`}>
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: color.bg }}>
                      <span className="text-[10px] font-bold" style={{ color: color.text }}>{ini}</span>
                    </div>
                    <span className={`flex-1 text-left text-sm font-semibold text-brand-dark truncate ${F}`}>{m.full_name ?? '—'}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isOn ? 'bg-success border-success' : 'border-brand-border'}`}>
                      {isOn && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className={`text-sm text-brand-muted text-center py-6 ${F}`}>Aucun membre trouvé</p>}
      </div>

      <div className="flex gap-3 pt-1">
        <button onClick={onBack} className={`flex items-center gap-1.5 h-11 px-4 border border-brand-border text-sm font-semibold text-brand-muted rounded-xl hover:bg-brand-bg transition-colors ${F}`}>
          <ChevronLeft className="w-4 h-4" /> Retour
        </button>
        <button onClick={confirm} disabled={selected.size === 0 || saving}
          className={`flex-1 h-11 bg-success text-white text-sm font-semibold rounded-xl hover:bg-success/90 disabled:opacity-50 transition-colors ${F}`}>
          {saving ? 'Création…' : `✓ Créer (${selected.size} membre${selected.size !== 1 ? 's' : ''})`}
        </button>
      </div>
    </div>
  )
}
