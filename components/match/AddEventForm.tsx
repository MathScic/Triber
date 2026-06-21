'use client'

import { useState } from 'react'
import type { MatchEventType, OrgMember } from '@/lib/match/types'
import { EVENT_LABELS } from '@/lib/match/types'
import { Button } from '@/components/ui/button'

interface Props {
  members: OrgMember[]
  defaultMinute: number
  onAdd: (type: MatchEventType, minute: number, playerId?: string, assistId?: string) => Promise<void>
}

const TYPES: MatchEventType[] = ['goal', 'own_goal', 'opponent_goal', 'yellow_card', 'red_card']
const TYPE_ICONS: Record<MatchEventType, string> = { goal: '⚽', own_goal: '🔄', opponent_goal: '⚽🔴', yellow_card: '🟨', red_card: '🟥' }
const NEEDS_PLAYER: MatchEventType[] = ['goal', 'own_goal', 'yellow_card', 'red_card']

export function AddEventForm({ members, defaultMinute, onAdd }: Props) {
  const [type, setType] = useState<MatchEventType>('goal')
  const [playerId, setPlayerId] = useState('')
  const [assistId, setAssistId] = useState('')
  const [minute, setMinute] = useState(defaultMinute)
  const [loading, setLoading] = useState(false)

  const needsPlayer = NEEDS_PLAYER.includes(type)
  const isGoal = type === 'goal'

  const handleSubmit = async () => {
    if (needsPlayer && !playerId) return
    setLoading(true)
    await onAdd(type, minute, needsPlayer ? playerId : undefined, isGoal && assistId ? assistId : undefined)
    setLoading(false)
    setPlayerId(''); setAssistId('')
  }

  const memberOptions = members.map(m => (
    <option key={m.user_id} value={m.user_id}>
      {m.jersey != null ? `${m.jersey} - ` : ''}{m.name}
    </option>
  ))

  return (
    <div className="bg-white rounded-2xl border border-[#DDD8CE] shadow-sm p-4 space-y-3">
      <p className="text-xs font-semibold text-[#7A8070] uppercase tracking-wide font-[family-name:var(--font-nunito)]">
        Ajouter une action
      </p>

      {/* Sélecteur de type */}
      <div className="grid grid-cols-5 gap-1">
        {TYPES.map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`text-center py-2 rounded-xl text-xs font-semibold transition-colors font-[family-name:var(--font-nunito)] ${
              type === t ? 'bg-[#2A9D4E] text-white' : 'bg-[#F0EBE1] text-[#7A8070] hover:bg-[#E8F5EE]'
            }`}
            title={EVENT_LABELS[t]}
          >
            <span className="text-lg">{TYPE_ICONS[t]}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2 items-end">
        {/* Minute */}
        <div className="w-20 flex-shrink-0">
          <p className="text-xs text-[#7A8070] mb-1 font-[family-name:var(--font-nunito)]">Minute</p>
          <input type="number" min={0} max={200} value={minute}
            onChange={e => setMinute(Number(e.target.value))}
            className="w-full h-10 px-2 rounded-xl border border-[#DDD8CE] text-sm text-center font-[800] text-[#1A1F16] bg-[#FAF7F2] focus:outline-none focus:border-[#2A9D4E] font-[family-name:var(--font-barlow)]"
          />
        </div>

        {/* Joueur principal */}
        {needsPlayer && (
          <div className="flex-1">
            <p className="text-xs text-[#7A8070] mb-1 font-[family-name:var(--font-nunito)]">Joueur</p>
            <select value={playerId} onChange={e => setPlayerId(e.target.value)}
              className="w-full h-10 px-2 rounded-xl border border-[#DDD8CE] text-sm text-[#1A1F16] bg-[#FAF7F2] focus:outline-none focus:border-[#2A9D4E] font-[family-name:var(--font-nunito)]">
              <option value="">— Choisir —</option>
              {memberOptions}
            </select>
          </div>
        )}
      </div>

      {/* Passeur (si but) */}
      {isGoal && (
        <div>
          <p className="text-xs text-[#7A8070] mb-1 font-[family-name:var(--font-nunito)]">Passeur (facultatif)</p>
          <select value={assistId} onChange={e => setAssistId(e.target.value)}
            className="w-full h-10 px-2 rounded-xl border border-[#DDD8CE] text-sm text-[#1A1F16] bg-[#FAF7F2] focus:outline-none focus:border-[#2A9D4E] font-[family-name:var(--font-nunito)]">
            <option value="">— Aucun —</option>
            {memberOptions}
          </select>
        </div>
      )}

      <Button className="w-full" onClick={() => void handleSubmit()} disabled={loading || (needsPlayer && !playerId)}>
        {loading ? 'Ajout…' : `+ ${EVENT_LABELS[type]}`}
      </Button>
    </div>
  )
}
