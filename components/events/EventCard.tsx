'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import type { TriberEvent, AttendanceStatus } from '@/lib/hooks/useEvents'
import { AttendanceButton } from './AttendanceButton'
import { AttendeesList, type AttendanceCounts } from './AttendeesList'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { MatchResultForm } from '@/components/stats/MatchResultForm'
import { EventCardHeader } from './EventCardHeader'

type Score = { home: number; away: number }

interface Props {
  event: TriberEvent
  currentStatus: AttendanceStatus | null
  onAttendance: (eventId: string, status: AttendanceStatus) => void
  canDelete: boolean
  onDelete: (eventId: string) => void
  score?: Score | null
  onScoreSaved?: (eventId: string, home: number, away: number) => void
  isPendingAttendance?: boolean
  currentUserId?: string
  currentUserName?: string | null
}

export function EventCard({ event, currentStatus, onAttendance, canDelete, onDelete, score, onScoreSaved, isPendingAttendance, currentUserId, currentUserName }: Props) {
  const [showScore, setShowScore] = useState(false)
  const [showAttendees, setShowAttendees] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [counts, setCounts] = useState<AttendanceCounts | null>(null)

  return (
    <div className="bg-white rounded-2xl border border-[#DDD8CE] shadow-sm p-4 space-y-3">

      <EventCardHeader event={event} score={score} />

      {/* Présences + compteur discret */}
      <div className="flex items-center justify-between gap-2">
        <AttendanceButton status={currentStatus} onSelect={s => onAttendance(event.id, s)} isPending={isPendingAttendance} />
        {counts && (
          <span className="text-xs text-[#7A8070] flex-shrink-0 tabular-nums font-[family-name:var(--font-nunito)]">
            {counts.confirmed} · {counts.declined} · {counts.pending}
          </span>
        )}
      </div>

      {/* Actions bas : boutons visibles */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#DDD8CE] flex-wrap">
        {event.type === 'match' && canDelete && (
          <Link
            href={`/events/${event.id}/live`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A9D4E] text-white text-xs font-bold hover:bg-[#238742] transition-colors font-[family-name:var(--font-nunito)]"
          >
            <Zap className="w-3.5 h-3.5" /> Direct
          </Link>
        )}
        <button
          onClick={() => setShowAttendees(v => !v)}
          className="flex items-center px-3 py-1.5 rounded-lg bg-[#F0EBE1] text-[#1A1F16] text-xs font-semibold hover:bg-[#DDD8CE] transition-colors font-[family-name:var(--font-nunito)]"
        >
          Présences {showAttendees ? '▲' : '▼'}
        </button>
        {event.type === 'match' && canDelete && (
          <button
            onClick={() => setShowScore(v => !v)}
            className="flex items-center px-3 py-1.5 rounded-lg bg-[#F0EBE1] text-[#1A1F16] text-xs font-semibold hover:bg-[#DDD8CE] transition-colors font-[family-name:var(--font-nunito)]"
          >
            Score {showScore ? '▲' : '▼'}
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="ml-auto flex items-center px-3 py-1.5 rounded-lg text-[#E8622A] text-xs font-semibold hover:bg-[#FDF0EB] transition-colors font-[family-name:var(--font-nunito)]"
          >
            Supprimer
          </button>
        )}
      </div>

      {showScore && (
        <MatchResultForm
          eventId={event.id}
          initialHome={score?.home ?? 0}
          initialAway={score?.away ?? 0}
          onSaved={(h, a) => { onScoreSaved?.(event.id, h, a); setShowScore(false) }}
        />
      )}

      <AttendeesList
        eventId={event.id}
        organizationId={event.organization_id}
        isExpanded={showAttendees}
        onCounts={setCounts}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentStatus={currentStatus}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onConfirm={() => { setShowDeleteModal(false); onDelete(event.id) }}
        onCancel={() => setShowDeleteModal(false)}
        eventTitle={event.title}
      />
    </div>
  )
}
