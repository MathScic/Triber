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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide font-[family-name:var(--font-nunito)]">Composition</p>
        <span className="text-xs text-brand-muted font-[family-name:var(--font-nunito)]">{starters}/11 tit · {subs}/8 rempl</span>
      </div>
      <p className="text-xs text-brand-muted italic font-[family-name:var(--font-nunito)]">
        Appuyer : ajouter → <span className="text-success font-semibold not-italic">TIT</span>ulaire →{' '}
        <span className="text-secondary font-semibold not-italic">REMP</span>laçant → retirer
      </p>
      <div className="space-y-1 max-h-72 overflow-y-auto">
        {allMembers.map(m => {
          const state = lineupMap.get(m.org_member_id)
          return (
            <button key={m.org_member_id} onClick={() => handleTap(m.org_member_id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                state === true ? 'bg-primary-light' : state === false ? 'bg-secondary-light' : 'hover:bg-brand-bg'
              }`}>
              {m.jersey != null
                ? <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-[800] text-white flex-shrink-0 font-[family-name:var(--font-barlow)]" style={{ background: 'var(--triber-primary)' }}>{m.jersey}</span>
                : <span className="w-6 flex-shrink-0" />
              }
              <span className="flex-1 text-sm font-medium text-brand-dark font-[family-name:var(--font-nunito)]">{m.name}</span>
              {state !== undefined && (
                <span className={`text-[10px] font-[800] px-2 py-0.5 rounded-full flex-shrink-0 font-[family-name:var(--font-barlow)] ${
                  state === true ? 'bg-success text-white' : 'border border-brand-border text-brand-muted'
                }`}>
                  {state === true ? 'TIT' : 'REMP'}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
