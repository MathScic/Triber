'use client'

import Link from 'next/link'
import { Radio, Zap, Users, ChevronDown, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { TriberEvent } from '@/lib/hooks/useEvents'
import { LineupModal } from '@/components/match/LineupModal'

interface Props {
  event: TriberEvent
  canDelete: boolean
  showAttendees: boolean
  showScore: boolean
  onToggleAttendees: () => void
  onToggleScore: () => void
  onDelete: () => void
}

export function EventCardActions({ event, canDelete, showAttendees, showScore, onToggleAttendees, onToggleScore, onDelete }: Props) {
  const [showLineup, setShowLineup] = useState(false)
  const isMatch = event.type === 'match'
  const isLive = event.status === 'ongoing' || event.status === 'half_time'

  return (
    <>
      <div className="space-y-2">
        {/* CTA prioritaire : match en cours */}
        {isMatch && canDelete && isLive && (
          <Link href={`/events/${event.id}/live`}
            onClick={e => e.stopPropagation()}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#2A9D4E] text-white text-sm font-bold hover:bg-[#238742] transition-colors font-[family-name:var(--font-nunito)]">
            <Radio className="w-4 h-4" /> Gérer le match en direct
          </Link>
        )}

        {/* Boutons secondaires */}
        <div className="flex items-center gap-2 flex-wrap">
          {isMatch && canDelete && !isLive && (
            <Link href={`/events/${event.id}/live`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F5EE] text-[#2A9D4E] text-xs font-bold hover:bg-[#d0ede0] transition-colors font-[family-name:var(--font-nunito)]">
              <Zap className="w-3.5 h-3.5" />
              {event.status === 'finished' ? 'Récap' : 'Démarrer'}
            </Link>
          )}
          {isMatch && canDelete && (
            <button onClick={() => setShowLineup(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8E8EA] text-[#1A1F16] text-xs font-semibold hover:bg-[#D1D1D6] transition-colors font-[family-name:var(--font-nunito)]">
              <Users className="w-3.5 h-3.5" /> Compo
            </button>
          )}
          <button onClick={onToggleAttendees}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors font-[family-name:var(--font-nunito)] ${showAttendees ? 'bg-[#1A1F16] text-white' : 'bg-[#E8E8EA] text-[#1A1F16] hover:bg-[#D1D1D6]'}`}>
            Présences <ChevronDown className={`w-3 h-3 ml-0.5 transition-transform ${showAttendees ? 'rotate-180' : ''}`} />
          </button>
          {isMatch && canDelete && (
            <button onClick={onToggleScore}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors font-[family-name:var(--font-nunito)] ${showScore ? 'bg-[#1A1F16] text-white' : 'bg-[#E8E8EA] text-[#1A1F16] hover:bg-[#D1D1D6]'}`}>
              Score <ChevronDown className={`w-3 h-3 ml-0.5 transition-transform ${showScore ? 'rotate-180' : ''}`} />
            </button>
          )}
          {canDelete && (
            <button onClick={onDelete}
              className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg text-[#D1D1D6] hover:bg-red-50 hover:text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {showLineup && (
        <LineupModal eventId={event.id} organizationId={event.organization_id} eventTitle={event.title}
          onClose={() => setShowLineup(false)} />
      )}
    </>
  )
}
