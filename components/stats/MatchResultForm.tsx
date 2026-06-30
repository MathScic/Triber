'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  eventId: string
  initialHome?: number
  initialAway?: number
  onSaved?: (home: number, away: number) => void
}

function ScoreCounter({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
        className="w-10 h-10 rounded-full bg-[#E8E8EA] text-brand-dark text-lg font-bold hover:bg-[#D1D1D6] transition-colors">
        −
      </button>
      <span className="text-5xl font-extrabold text-brand-dark w-12 text-center tabular-nums">
        {value}
      </span>
      <button type="button" onClick={() => onChange(value + 1)}
        className="w-10 h-10 rounded-full bg-success text-white text-lg font-bold hover:bg-[#238742] transition-colors">
        +
      </button>
    </div>
  )
}

export function MatchResultForm({ eventId, initialHome = 0, initialAway = 0, onSaved }: Props) {
  const [home, setHome] = useState(initialHome)
  const [away, setAway] = useState(initialAway)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/stats/match-result', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, scoreHome: home, scoreAway: away }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { setError(data.error ?? 'Erreur'); setSaving(false); return }
      onSaved?.(home, away)
    } catch { setError('Impossible de contacter le serveur.') }
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-xl border border-[#D1D1D6] p-5 space-y-5">
      <h3 className="text-sm font-bold text-brand-dark text-center">Score du match</h3>
      {error && <p className="text-xs text-secondary text-center">{error}</p>}

      <div className="flex items-center justify-center gap-6">
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Nous</p>
          <ScoreCounter value={home} onChange={setHome} />
        </div>
        <span className="text-3xl font-bold text-[#D1D1D6] pb-6">—</span>
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Eux</p>
          <ScoreCounter value={away} onChange={setAway} />
        </div>
      </div>

      <Button onClick={handleSave} className="w-full" disabled={saving}>
        {saving ? 'Sauvegarde...' : 'Enregistrer le score'}
      </Button>
    </div>
  )
}
