'use client'

import { useState, useEffect, useCallback } from 'react'
import { Settings2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LineupModal } from './LineupModal'
import type { FullMember, LineupEntry } from './LineupEditor'

interface Props {
  allMembers: FullMember[]
  initialLineup: LineupEntry[]
  eventId: string
  organizationId: string
  eventTitle: string
  status?: string | null
}

export function MatchCompositionSection({ allMembers, initialLineup, eventId, organizationId, eventTitle, status }: Props) {
  const isLocked = status === 'ongoing' || status === 'half_time'
  const [lineup, setLineup] = useState<LineupEntry[]>(initialLineup)
  const [showModal, setShowModal] = useState(false)

  const starters = allMembers.filter(m => lineup.some(l => l.org_member_id === m.org_member_id && l.is_starter))
  const subs = allMembers.filter(m => lineup.some(l => l.org_member_id === m.org_member_id && !l.is_starter))

  const refetchLineup = useCallback(async () => {
    const { data } = await createClient()
      .from('match_lineups').select('organization_member_id, is_starter').eq('event_id', eventId)
    if (data) setLineup(data.map(l => ({ org_member_id: l.organization_member_id as string, is_starter: l.is_starter as boolean })))
  }, [eventId])

  // Composition mise à jour en temps réel sur tout changement dans match_lineups
  useEffect(() => {
    const supabase = createClient()
    const ch = supabase.channel(`lineup-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_lineups', filter: `event_id=eq.${eventId}` }, () => void refetchLineup())
      .subscribe()
    return () => { void supabase.removeChannel(ch) }
  }, [eventId, refetchLineup])

  const handleModalClose = () => { setShowModal(false); void refetchLineup() }

  return (
    <>
      <div className="bg-white rounded-xl border border-brand-border shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest font-[family-name:var(--font-nunito)]">Composition</p>
          {isLocked
            ? <span className="text-[10px] text-brand-muted italic font-[family-name:var(--font-nunito)]">Verrouillée</span>
            : <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-1 text-xs text-brand-muted hover:text-success transition-colors font-[family-name:var(--font-nunito)]"><Settings2 className="w-3 h-3" /> Modifier</button>
          }
        </div>

        {/* 2 colonnes fixes — toujours visibles même sans joueurs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-2 font-[family-name:var(--font-nunito)]">Titulaires</p>
            {starters.length === 0
              ? <p className="text-xs text-brand-muted italic font-[family-name:var(--font-nunito)]">—</p>
              : starters.map(m => (
                <div key={m.user_id} className="flex items-center gap-2 py-0.5">
                  {m.jersey != null && (
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-[800] text-white leading-none flex-shrink-0 font-[family-name:var(--font-barlow)]" style={{ background: 'var(--triber-primary)' }}>
                      {m.jersey}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-brand-dark truncate font-[family-name:var(--font-nunito)]">{m.name}</span>
                </div>
              ))
            }
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-2 font-[family-name:var(--font-nunito)]">Remplaçants</p>
            {subs.length === 0
              ? <p className="text-xs text-brand-muted italic font-[family-name:var(--font-nunito)]">—</p>
              : subs.map(m => (
                <div key={m.user_id} className="flex items-center gap-2 py-0.5">
                  {m.jersey != null && (
                    <span className="w-5 h-5 rounded-full bg-brand-sand flex items-center justify-center text-[10px] font-[800] text-brand-muted leading-none flex-shrink-0 font-[family-name:var(--font-barlow)]">
                      {m.jersey}
                    </span>
                  )}
                  <span className="text-xs text-brand-muted truncate font-[family-name:var(--font-nunito)]">{m.name}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {showModal && (
        <LineupModal eventId={eventId} organizationId={organizationId} eventTitle={eventTitle} onClose={handleModalClose} />
      )}
    </>
  )
}
