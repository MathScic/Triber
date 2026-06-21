'use client'

import { useState } from 'react'
import type { MatchEventType, OrgMember } from '@/lib/match/types'
import { EVENT_LABELS } from '@/lib/match/types'
import { Button } from '@/components/ui/button'

interface Props {
  members: OrgMember[]
  defaultMinute: number
  onAdd: (type: MatchEventType, minute: number, playerId?: string, assistId?: string, playerNameFree?: string) => Promise<void>
}

const TYPES: MatchEventType[] = ['goal', 'own_goal', 'opponent_goal', 'yellow_card', 'red_card']
const NEEDS_PLAYER: MatchEventType[] = ['goal', 'own_goal', 'yellow_card', 'red_card']

function TypeIcon({ type }: { type: MatchEventType }) {
  if (type === 'yellow_card') return <span className="inline-block w-3 h-4 bg-yellow-400 rounded-[2px]" />
  if (type === 'red_card') return <span className="inline-block w-3 h-4 bg-red-600 rounded-[2px]" />
  const color = type === 'goal' ? '#2A9D4E' : type === 'own_goal' ? '#E8622A' : '#dc2626'
  return <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
}

export function AddEventForm({ members, defaultMinute, onAdd }: Props) {
  const [type, setType] = useState<MatchEventType>('goal')
  const [playerId, setPlayerId] = useState('')
  const [assistId, setAssistId] = useState('')
  const [playerNameFree, setPlayerNameFree] = useState('')
  const [minute, setMinute] = useState(defaultMinute)
  const [loading, setLoading] = useState(false)

  const needsPlayer = NEEDS_PLAYER.includes(type)
  const isGoal = type === 'goal'
  const isOppGoal = type === 'opponent_goal'

  const canSubmit = isOppGoal || (needsPlayer ? !!playerId : true)

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    await onAdd(
      type, minute,
      needsPlayer ? playerId : undefined,
      isGoal && assistId ? assistId : undefined,
      isOppGoal && playerNameFree ? playerNameFree : undefined,
    )
    setLoading(false)
    setPlayerId(''); setAssistId(''); setPlayerNameFree('')
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
      <div className="grid grid-cols-5 gap-1.5">
        {TYPES.map(t => (
          <button key={t} onClick={() => { setType(t); setPlayerId(''); setAssistId(''); setPlayerNameFree('') }}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl text-center transition-colors ${
              type === t ? 'bg-[#1A1F16] text-white' : 'bg-[#F0EBE1] text-[#7A8070] hover:bg-[#DDD8CE]'
            }`}
            title={EVENT_LABELS[t]}
          >
            <TypeIcon type={t} />
            <span className="text-[10px] font-semibold leading-tight font-[family-name:var(--font-nunito)]">
              {EVENT_LABELS[t]}
            </span>
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-end">
        <div className="w-20 flex-shrink-0">
          <p className="text-xs text-[#7A8070] mb-1 font-[family-name:var(--font-nunito)]">Minute</p>
          <input type="number" min={0} max={200} value={minute} onChange={e => setMinute(Number(e.target.value))}
            className="w-full h-10 px-2 rounded-xl border border-[#DDD8CE] text-sm text-center font-[800] text-[#1A1F16] bg-[#FAF7F2] focus:outline-none focus:border-[#2A9D4E] font-[family-name:var(--font-barlow)]"
          />
        </div>
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
        {isOppGoal && (
          <div className="flex-1">
            <p className="text-xs text-[#7A8070] mb-1 font-[family-name:var(--font-nunito)]">Buteur (facultatif)</p>
            <input type="text" placeholder="Nom libre…" value={playerNameFree} onChange={e => setPlayerNameFree(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#DDD8CE] text-sm text-[#1A1F16] bg-[#FAF7F2] focus:outline-none focus:border-[#dc2626] font-[family-name:var(--font-nunito)]"
            />
          </div>
        )}
      </div>
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
      <Button className="w-full" onClick={() => void handleSubmit()} disabled={loading || !canSubmit}>
        {loading ? 'Ajout…' : `+ ${EVENT_LABELS[type]}`}
      </Button>
    </div>
  )
}
