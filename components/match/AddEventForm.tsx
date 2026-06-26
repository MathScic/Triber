'use client'

import { useState } from 'react'
import { X, ArrowUpRight, ArrowLeftRight, Plus } from 'lucide-react'
import type { MatchActionType, OrgMember } from '@/lib/match/types'
import { Button } from '@/components/ui/button'
import { BallIcon, CardRect } from '@/components/match/MatchIcons'

interface Props {
  members: OrgMember[]
  defaultMinute: number
  onAdd: (type: MatchActionType, minute: number, isOwnTeam: boolean, userId?: string, assistUserId?: string) => Promise<void>
  onClose?: () => void
}

type TileType = 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution'

const TILES: { type: TileType; label: string }[] = [
  { type: 'goal', label: 'But' },
  { type: 'assist', label: 'Passe' },
  { type: 'yellow_card', label: 'J. jaune' },
  { type: 'red_card', label: 'J. rouge' },
  { type: 'substitution', label: 'Remplac.' },
]

function TileIcon({ type, active }: { type: TileType; active: boolean }) {
  if (type === 'goal') return <BallIcon active={active} />
  if (type === 'yellow_card') return <CardRect color="yellow" active={active} />
  if (type === 'red_card') return <CardRect color="red" active={active} />
  if (type === 'assist') return <ArrowUpRight className={`w-5 h-5 ${active ? 'text-white' : 'text-[#6B7280]'}`} />
  return <ArrowLeftRight className={`w-5 h-5 ${active ? 'text-white' : 'text-[#6B7280]'}`} />
}

export function AddEventForm({ members, defaultMinute, onAdd, onClose }: Props) {
  const [tileType, setTileType] = useState<TileType>('goal')
  const [isOwnTeam, setIsOwnTeam] = useState(true)
  const [userId, setUserId] = useState('')
  const [assistUserId, setAssistUserId] = useState('')
  const [addAssist, setAddAssist] = useState(false)
  const [minute, setMinute] = useState(defaultMinute)
  const [loading, setLoading] = useState(false)

  const isGoal = tileType === 'goal'
  const isSubst = tileType === 'substitution'
  const needsPlayer = isOwnTeam && tileType !== 'substitution'
  const available = members
  const canSubmit = !needsPlayer || !!userId

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    await onAdd(
      tileType as MatchActionType,
      minute,
      isOwnTeam,
      isOwnTeam && userId ? userId : undefined,
      isGoal && isOwnTeam && assistUserId ? assistUserId : undefined,
    )
    setLoading(false)
    setUserId(''); setAssistUserId('')
  }

  const opts = available.map(m => (
    <option key={m.user_id} value={m.user_id}>
      {m.jersey != null ? `${m.jersey} - ` : ''}{m.name}
    </option>
  ))

  return (
    <div className="space-y-4 p-4 pb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-[800] text-[#1A1F16] font-[family-name:var(--font-barlow)] uppercase tracking-wide">
          Action
        </h3>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#F4F4F6] transition-colors text-[#6B7280]">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 5 tuiles action */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {TILES.map(({ type, label }) => {
          const active = tileType === type
          return (
            <button key={type} onClick={() => { setTileType(type); setUserId(''); setAssistUserId(''); setAddAssist(false) }}
              className={`flex-shrink-0 w-[68px] flex flex-col items-center justify-center gap-2 py-3 rounded-2xl transition-colors border ${
                active ? 'bg-[#2A9D4E] border-[#2A9D4E]' : 'bg-white border-[#E8E8EA] hover:border-[#D1D1D6]'
              }`}>
              <TileIcon type={type} active={active} />
              <span className={`text-[10px] font-bold leading-tight text-center font-[family-name:var(--font-nunito)] ${active ? 'text-white' : 'text-[#6B7280]'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Notre équipe / Adversaire */}
      {!isSubst && (
        <div className="grid grid-cols-2 gap-2">
          {([true, false] as const).map(own => (
            <button key={String(own)} onClick={() => { setIsOwnTeam(own); setUserId(''); setAssistUserId(''); setAddAssist(false) }}
              className={`h-10 rounded-xl text-sm font-semibold transition-colors font-[family-name:var(--font-nunito)] border ${
                isOwnTeam === own
                  ? own ? 'bg-[#2A9D4E] text-white border-[#2A9D4E]' : 'bg-[#1A1F16] text-white border-[#1A1F16]'
                  : 'bg-white text-[#6B7280] border-[#D1D1D6] hover:border-[#9CA3AF]'
              }`}>
              {own ? 'Notre équipe' : 'Adversaire'}
            </button>
          ))}
        </div>
      )}

      {/* Minute + Joueur */}
      <div className="flex gap-2 items-end">
        <div className="w-20 flex-shrink-0">
          <p className="text-[11px] text-[#6B7280] mb-1 uppercase font-[family-name:var(--font-nunito)] tracking-wide font-bold">Minute</p>
          <input type="number" min={0} max={200} value={minute} onChange={e => setMinute(Number(e.target.value))}
            className="w-full h-10 px-2 rounded-xl border border-[#D1D1D6] text-sm text-center font-[800] bg-[#F4F4F6] focus:outline-none focus:border-[#2A9D4E] font-[family-name:var(--font-barlow)]" />
        </div>
        {needsPlayer && available.length > 0 && (
          <div className="flex-1">
            <p className="text-[11px] text-[#6B7280] mb-1 uppercase font-[family-name:var(--font-nunito)] tracking-wide font-bold">Joueur</p>
            <select value={userId} onChange={e => setUserId(e.target.value)}
              className="w-full h-10 px-2 rounded-xl border border-[#D1D1D6] text-sm bg-[#F4F4F6] focus:outline-none focus:border-[#2A9D4E] font-[family-name:var(--font-nunito)]">
              <option value="">— Choisir —</option>
              {opts}
            </select>
          </div>
        )}
      </div>

      {/* Passeur — but + notre équipe — opt-in */}
      {isGoal && isOwnTeam && available.length > 0 && (
        !addAssist ? (
          <button onClick={() => setAddAssist(true)}
            className="flex items-center gap-1.5 text-xs text-[#2A9D4E] font-semibold font-[family-name:var(--font-nunito)] hover:text-[#238742] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Ajouter une passe décisive
          </button>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] text-[#6B7280] uppercase font-bold font-[family-name:var(--font-nunito)] tracking-wide">Passeur</p>
              <button onClick={() => { setAddAssist(false); setAssistUserId('') }}
                className="text-[11px] text-[#9CA3AF] hover:text-[#6B7280] font-[family-name:var(--font-nunito)]">
                Annuler
              </button>
            </div>
            <select value={assistUserId} onChange={e => setAssistUserId(e.target.value)}
              className="w-full h-10 px-2 rounded-xl border border-[#D1D1D6] text-sm bg-[#F4F4F6] focus:outline-none focus:border-[#2A9D4E] font-[family-name:var(--font-nunito)]">
              <option value="">— Choisir le passeur —</option>
              {opts}
            </select>
          </div>
        )
      )}

      <Button className="w-full h-12 text-sm font-bold" onClick={() => void handleSubmit()} disabled={loading || !canSubmit}>
        {loading ? 'Enregistrement…' : 'Valider'}
      </Button>
    </div>
  )
}
