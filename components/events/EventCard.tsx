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

      {/* Séparateur + actions bas */}
      <div className="flex items-center justify-end gap-4 pt-2 border-t border-[#DDD8CE]">
        {event.type === 'match' && canDelete && (
          <Link
            href={`/events/${event.id}/live`}
            className="flex items-center gap-1 text-xs font-semibold text-[#2A9D4E] hover:underline font-[family-name:var(--font-nunito)]"
          >
            <Zap className="w-3 h-3" /> Direct
          </Link>
        )}
        {event.type === 'match' && canDelete && (
          <button onClick={() => setShowScore(v => !v)} className="text-xs text-[#7A8070] hover:text-primary transition-colors font-[family-name:var(--font-nunito)]">
            {showScore ? 'Score ▲' : 'Score ▼'}
          </button>
        )}
        <button onClick={() => setShowAttendees(v => !v)} className="text-xs text-[#7A8070] hover:text-primary transition-colors font-[family-name:var(--font-nunito)]">
          {showAttendees ? 'Présences ▲' : 'Présences ▼'}
        </button>
        {canDelete && (
          <button onClick={() => setShowDeleteModal(true)} className="text-xs text-secondary hover:text-secondary/80 transition-colors font-[family-name:var(--font-nunito)]">
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
