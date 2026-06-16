'use client'

import { useState } from 'react'
import { useStats, type PlayerStatsInput } from '@/lib/hooks/useStats'
import { Button } from '@/components/ui/button'

export type MemberForStats = { user_id: string; name: string | null }
type StatsMap = Record<string, PlayerStatsInput>

const EMPTY: PlayerStatsInput = { goals: 0, assists: 0, minutes_played: 0, yellow_cards: 0, red_cards: 0 }

const FIELDS: { key: keyof PlayerStatsInput; short: string; label: string }[] = [
  { key: 'goals', short: '⚽', label: 'Buts' },
  { key: 'assists', short: '🅰️', label: 'Passes décisives' },
  { key: 'minutes_played', short: '⏱', label: 'Minutes jouées' },
  { key: 'yellow_cards', short: '🟡', label: 'Cartons jaunes' },
  { key: 'red_cards', short: '🔴', label: 'Cartons rouges' },
]

interface Props { eventId: string; members: MemberForStats[]; onSaved?: () => void }

export function PlayerStatsForm({ eventId, members, onSaved }: Props) {
  const { savePlayerStats, loading, error } = useStats()
  const [statsMap, setStatsMap] = useState<StatsMap>({})

  const update = (userId: string, key: keyof PlayerStatsInput, raw: string) => {
    const value = Math.max(0, parseInt(raw) || 0)
    setStatsMap(prev => ({ ...prev, [userId]: { ...EMPTY, ...prev[userId], [key]: value } }))
  }

  const handleSave = async () => {
    const entries = Object.entries(statsMap)
    if (!entries.length) return
    for (const [userId, stats] of entries) {
      await savePlayerStats(eventId, userId, stats)
    }
    onSaved?.()
  }

  return (
    <div className="bg-white rounded-2xl border border-[#DDD8CE] p-4 space-y-3">
      <h3 className="text-sm font-bold text-[#1A1F16]">Stats des joueurs</h3>
      {error && <p className="text-xs text-[#E8622A]">{error}</p>}

      {/* En-tête colonnes */}
      <div className="grid gap-1 items-center" style={{ gridTemplateColumns: '1fr repeat(5, 40px)' }}>
        <span className="text-xs text-[#7A8070]">Joueur</span>
        {FIELDS.map(f => (
          <span key={f.key} className="text-center text-sm" title={f.label}>{f.short}</span>
        ))}
      </div>

      {/* Ligne par joueur */}
      {members.map(m => {
        const s = statsMap[m.user_id] ?? EMPTY
        const initials = (m.name ?? '?').split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '?'
        return (
          <div key={m.user_id} className="grid gap-1 items-center" style={{ gridTemplateColumns: '1fr repeat(5, 40px)' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#2A9D4E] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <span className="text-xs text-[#1A1F16] truncate">{m.name ?? '—'}</span>
            </div>
            {FIELDS.map(f => (
              <input key={f.key} type="number" min="0" max="999"
                value={s[f.key] === 0 ? '' : s[f.key]}
                placeholder="0"
                onChange={e => update(m.user_id, f.key, e.target.value)}
                className="h-8 w-full text-center text-sm border border-[#DDD8CE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2A9D4E]"
              />
            ))}
          </div>
        )
      })}

      {!members.length && (
        <p className="text-xs text-[#7A8070] text-center py-2">Aucun membre dans cette organisation.</p>
      )}

      <Button onClick={handleSave} className="w-full" disabled={loading || !Object.keys(statsMap).length}>
        {loading ? 'Sauvegarde...' : 'Sauvegarder les stats'}
      </Button>
    </div>
  )
}
