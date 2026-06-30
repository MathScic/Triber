'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { EventCardHeader } from './EventCardHeader'
import { AttendanceButton } from './AttendanceButton'
import { AttendeesList } from './AttendeesList'
import { LineupModal } from '@/components/match/LineupModal'
import { MatchResultForm } from '@/components/stats/MatchResultForm'
import type { TriberEvent, AttendanceStatus } from '@/lib/hooks/useEvents'

type Score = { home: number; away: number }

interface Props {
  event: Record<string, unknown>
  role: string
  currentUserId: string
  currentUserName: string | null
  initialScore: Score | null
  initialAttendance: AttendanceStatus | null
}

export function EventDetailView({ event, role, currentUserId, currentUserName, initialScore, initialAttendance }: Props) {
  const ev = event as TriberEvent & { status?: string }
  const [myAttendance, setMyAttendance] = useState<AttendanceStatus | null>(initialAttendance)
  const [score, setScore] = useState<Score | null>(initialScore)
  const [showScore, setShowScore] = useState(false)
  const [showLineup, setShowLineup] = useState(false)

  const canManage = role === 'admin' || role === 'member_active'
  const isMatch = ev.type === 'match'
  const isOngoing = ev.status === 'ongoing' || ev.status === 'half_time'
  const isFinished = ev.status === 'finished'

  const updateAttendance = async (status: AttendanceStatus) => {
    setMyAttendance(status)
    const supabase = createClient()
    await supabase.from('event_attendees')
      .upsert({ event_id: ev.id, user_id: currentUserId, status }, { onConflict: 'event_id,user_id' })
  }

  return (
    <div className="space-y-4">
      {/* Carte principale */}
      <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-5 space-y-4">
        <EventCardHeader event={ev} score={score} />

        {/* Badge statut match en cours */}
        {isOngoing && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {ev.status === 'half_time' ? 'Mi-temps' : 'En direct'}
            </span>
            {canManage && (
              <Link href={`/events/${ev.id}/live`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success text-white text-[10px] font-bold hover:bg-[#238742] transition-colors uppercase tracking-wide">
                <Zap className="w-3 h-3" /> Gérer le direct
              </Link>
            )}
          </div>
        )}

        {/* Ma présence */}
        <div>
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest mb-2 font-[family-name:var(--font-nunito)]">Ma présence</p>
          <AttendanceButton status={myAttendance} onSelect={updateAttendance} />
        </div>

        {/* Actions admin/actif */}
        {canManage && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#D1D1D6]">
            {isMatch && (
              <button onClick={() => setShowLineup(true)}
                className="px-3 py-1.5 rounded-lg bg-[#E8E8EA] text-brand-dark text-xs font-semibold hover:bg-[#D1D1D6] transition-colors font-[family-name:var(--font-nunito)]">
                Composition
              </button>
            )}
            {isMatch && (isOngoing || isFinished) && (
              <button onClick={() => setShowScore(v => !v)}
                className="px-3 py-1.5 rounded-lg bg-[#E8E8EA] text-brand-dark text-xs font-semibold hover:bg-[#D1D1D6] transition-colors font-[family-name:var(--font-nunito)]">
                Score {showScore ? '▲' : '▼'}
              </button>
            )}
          </div>
        )}

        {showScore && (
          <MatchResultForm eventId={ev.id} initialHome={score?.home ?? 0} initialAway={score?.away ?? 0}
            onSaved={(h, a) => { setScore({ home: h, away: a }); setShowScore(false) }} />
        )}
      </div>

      {/* Liste des présences */}
      <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-5">
        <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest mb-3 font-[family-name:var(--font-nunito)]">Présences</p>
        <AttendeesList eventId={ev.id} organizationId={ev.organization_id} isExpanded={true}
          currentUserId={currentUserId} currentUserName={currentUserName} currentStatus={myAttendance} />
      </div>

      {showLineup && (
        <LineupModal eventId={ev.id} organizationId={ev.organization_id} eventTitle={ev.title} onClose={() => setShowLineup(false)} />
      )}
    </div>
  )
}
