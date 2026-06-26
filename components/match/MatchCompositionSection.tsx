'use client'

import { useState } from 'react'
import { Users, Settings2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LineupModal } from './LineupModal'
import type { FullMember, LineupEntry } from './LineupEditor'

interface Props {
  allMembers: FullMember[]
  initialLineup: LineupEntry[]
  eventId: string
  organizationId: string
  eventTitle: string
}

export function MatchCompositionSection({ allMembers, initialLineup, eventId, organizationId, eventTitle }: Props) {
  const [showCompo, setShowCompo] = useState(false)
  const [lineup, setLineup] = useState<LineupEntry[]>(initialLineup)
  const [showModal, setShowModal] = useState(false)

  const starters = allMembers.filter(m => lineup.some(l => l.org_member_id === m.org_member_id && l.is_starter))
  const subs = allMembers.filter(m => lineup.some(l => l.org_member_id === m.org_member_id && !l.is_starter))
  const isEmpty = starters.length === 0 && subs.length === 0

  const handleModalClose = async () => {
    setShowModal(false)
    const { data } = await createClient()
      .from('match_lineups').select('organization_member_id, is_starter').eq('event_id', eventId)
    if (data) setLineup(data.map(l => ({ org_member_id: l.organization_member_id as string, is_starter: l.is_starter as boolean })))
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm overflow-hidden">
        <button onClick={() => setShowCompo(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#E8E8EA] transition-colors">
          <span className="flex items-center gap-2 text-sm font-semibold text-[#1A1F16] font-[family-name:var(--font-nunito)]">
            <Users className="w-4 h-4 text-[#6B7280]" />
            Composition ({starters.length} tit. · {subs.length} rem.)
          </span>
          <span className="text-xs text-[#6B7280]">{showCompo ? '▲' : '▼'}</span>
        </button>

        {showCompo && (
          <div className="px-4 pb-3 space-y-2 border-t border-[#D1D1D6]">
            {isEmpty ? (
              <div className="py-3 text-center space-y-2">
                <p className="text-sm text-[#6B7280] font-[family-name:var(--font-nunito)]">Aucune composition définie</p>
                <button onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2A9D4E] hover:underline font-[family-name:var(--font-nunito)]">
                  <Settings2 className="w-3.5 h-3.5" /> Définir la composition
                </button>
              </div>
            ) : (
              <>
                {starters.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-1 font-[family-name:var(--font-nunito)]">Titulaires</p>
                    {starters.map(m => (
                      <p key={m.user_id} className="text-sm font-semibold text-[#1A1F16] font-[family-name:var(--font-nunito)]">
                        {m.jersey != null ? `${m.jersey} - ` : ''}{m.name}
                      </p>
                    ))}
                  </div>
                )}
                {subs.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-1 font-[family-name:var(--font-nunito)]">Remplaçants</p>
                    {subs.map(m => (
                      <p key={m.user_id} className="text-sm text-[#6B7280] font-[family-name:var(--font-nunito)]">
                        {m.jersey != null ? `${m.jersey} - ` : ''}{m.name}
                      </p>
                    ))}
                  </div>
                )}
                <button onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#2A9D4E] transition-colors pt-1 font-[family-name:var(--font-nunito)]">
                  <Settings2 className="w-3 h-3" /> Modifier
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <LineupModal eventId={eventId} organizationId={organizationId} eventTitle={eventTitle} onClose={() => void handleModalClose()} />
      )}
    </>
  )
}
