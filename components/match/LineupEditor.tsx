'use client'

import type { OrgMember } from '@/lib/match/types'

export type FullMember = OrgMember & { org_member_id: string }
export type LineupEntry = { org_member_id: string; is_starter: boolean }

interface Props {
  allMembers: FullMember[]
  lineup: LineupEntry[]
  onAdd: (orgMemberId: string, isStarter: boolean) => void
  onRemove: (orgMemberId: string) => void
}

export function LineupEditor({ allMembers, lineup, onAdd, onRemove }: Props) {
  const lineupMap = new Map(lineup.map(l => [l.org_member_id, l.is_starter]))
  const starters = lineup.filter(l => l.is_starter).length
  const subs = lineup.filter(l => !l.is_starter).length

  const handleTap = (orgMemberId: string) => {
    const state = lineupMap.get(orgMemberId)
    if (state === undefined) {
      if (starters < 11) onAdd(orgMemberId, true)
      else if (subs < 8) onAdd(orgMemberId, false)
    } else if (state === true) {
      onAdd(orgMemberId, false)
    } else {
      onRemove(orgMemberId)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#DDD8CE] shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#7A8070] uppercase tracking-wide font-[family-name:var(--font-nunito)]">
          Composition
        </p>
        <span className="text-xs text-[#7A8070] font-[family-name:var(--font-nunito)]">
          {starters}/11 tit · {subs}/8 rempl
        </span>
      </div>
      <p className="text-xs text-[#7A8070] italic font-[family-name:var(--font-nunito)]">
        Appuyer : ajouter → <span className="text-[#2A9D4E] font-semibold not-italic">T</span>itulaire →{' '}
        <span className="text-[#E8622A] font-semibold not-italic">R</span>emplaçant → retirer
      </p>
      <div className="space-y-1 max-h-72 overflow-y-auto">
        {allMembers.map(m => {
          const state = lineupMap.get(m.org_member_id)
          return (
            <button
              key={m.org_member_id}
              onClick={() => handleTap(m.org_member_id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                state === true ? 'bg-[#E8F5EE]' : state === false ? 'bg-[#FDF0EB]' : 'hover:bg-[#F0EBE1]'
              }`}
            >
              <span className="w-6 text-sm font-[800] text-[#7A8070] tabular-nums text-center flex-shrink-0 font-[family-name:var(--font-barlow)]">
                {m.jersey ?? '·'}
              </span>
              <span className="flex-1 text-sm font-medium text-[#1A1F16] font-[family-name:var(--font-nunito)]">
                {m.name}
              </span>
              {state !== undefined && (
                <span className={`text-xs font-[800] px-2 py-0.5 rounded-full flex-shrink-0 font-[family-name:var(--font-barlow)] ${
                  state === true ? 'bg-[#2A9D4E] text-white' : 'bg-[#E8622A] text-white'
                }`}>
                  {state === true ? 'T' : 'R'}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
