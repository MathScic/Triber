'use client'

import { useState } from 'react'
import type { ElementType } from 'react'
import Link from 'next/link'
import { MoreVertical, Check, X, Clock, Radio, Play, Users, Pencil, Trash2, CheckCircle2, XCircle, MapPin } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TriberEvent, AttendanceStatus } from '@/lib/hooks/useEvents'
import { AttendeesList, type AttendanceCounts } from './AttendeesList'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { LineupModal } from '@/components/match/LineupModal'

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

const TYPE_COLOR: Record<string, string> = {
  match: 'bg-success text-white',
  training: 'bg-secondary text-white',
  meeting: 'bg-[#3B82F6] text-white',
  other: 'bg-[#6B7280] text-white',
}
const TYPE_LABEL: Record<string, string> = { match: 'Match', training: 'Entraînement', meeting: 'Réunion', other: 'Autre' }

function ResultChip({ home, away, isHome }: Score & { isHome: boolean | null | undefined }) {
  const our = isHome === false ? away : home
  const their = isHome === false ? home : away
  const won = our > their; const draw = our === their
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-[family-name:var(--font-nunito)] ${draw ? 'bg-[#E8E8EA] text-[#6B7280]' : won ? 'bg-primary-light text-success' : 'bg-secondary-light text-secondary'}`}>
      {draw ? 'Nul' : won ? 'Victoire' : 'Défaite'}
    </span>
  )
}

const BTNS: { s: AttendanceStatus; label: string; Icon: ElementType; active: string }[] = [
  { s: 'confirmed', label: 'Présent', Icon: Check, active: 'bg-success text-white border-transparent' },
  { s: 'declined', label: 'Absent', Icon: X, active: 'bg-secondary text-white border-transparent' },
  { s: 'pending', label: 'Attente', Icon: Clock, active: 'bg-[#6B7280] text-white border-transparent' },
]

export function EventCard({ event, currentStatus, onAttendance, canDelete, onDelete, score, isPendingAttendance, currentUserId, currentUserName }: Props) {
  const isLive = event.status === 'ongoing' || event.status === 'half_time'
  const isFinished = event.status === 'finished'
  const isMatch = event.type === 'match'
  const [showAttendees, setShowAttendees] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLineup, setShowLineup] = useState(false)
  const [counts, setCounts] = useState<AttendanceCounts | null>(null)

  const date = new Date(event.start_at)
  const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isLive ? 'border-red-300' : 'border-[#E8E8EA]'}`}>

      {/* Bande LIVE */}
      {isLive && (
        <div className="flex items-center gap-2 bg-red-500 px-4 py-1.5">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-bold text-white font-[family-name:var(--font-nunito)] uppercase tracking-wide">
            {event.status === 'half_time' ? 'Mi-temps' : 'En direct'}
          </span>
        </div>
      )}

      <div className="px-4 pt-4 pb-3 space-y-3">
        {/* Ligne 1 : badges + date + menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-[family-name:var(--font-nunito)] ${TYPE_COLOR[event.type] ?? TYPE_COLOR.other}`}>
              {TYPE_LABEL[event.type] ?? 'Autre'}
            </span>
            {isMatch && event.is_home !== null && (
              <span className="text-[10px] font-bold bg-brand-dark text-white px-2.5 py-0.5 rounded-full font-[family-name:var(--font-nunito)]">
                {event.is_home ? 'Domicile' : 'Extérieur'}
              </span>
            )}
            {event.category && (
              <span className="text-[10px] font-bold bg-brand-bg text-[#6B7280] px-2.5 py-0.5 rounded-full font-[family-name:var(--font-nunito)]">
                {event.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <p className="text-xs text-[#9CA3AF] font-[family-name:var(--font-nunito)] whitespace-nowrap">
              {dateStr} · {timeStr}
            </p>
            {canDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button aria-label="Options" className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-brand-bg transition-colors text-[#9CA3AF]">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isMatch && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={`/events/${event.id}/live`} className="flex items-center gap-2 cursor-pointer">
                          {isLive ? <Radio className="w-4 h-4 text-red-500" /> : <Play className="w-4 h-4" />}
                          {isLive ? 'Gérer le direct' : isFinished ? 'Récap du match' : 'Lancer le match'}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowLineup(true)} className="flex items-center gap-2 cursor-pointer">
                        <Users className="w-4 h-4" /> Composition
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href={`/events/${event.id}`} className="flex items-center gap-2 cursor-pointer">
                      <Pencil className="w-4 h-4" /> Modifier
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600">
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Ligne 2 : titre */}
        <div>
          <Link href={`/events/${event.id}`} className="block hover:text-success transition-colors">
            <h3 className="font-[800] text-brand-dark text-base uppercase tracking-tight leading-tight font-[family-name:var(--font-barlow)]">
              {event.title}
            </h3>
          </Link>
          {isMatch && event.opponent && (
            <p className="text-sm text-[#6B7280] mt-0.5 font-[family-name:var(--font-nunito)]">vs {event.opponent}</p>
          )}
        </div>

        {/* Score si disponible */}
        {isMatch && score && (
          <div className="flex items-center gap-2">
            <span className="text-3xl font-[800] text-brand-dark tabular-nums leading-none font-[family-name:var(--font-barlow)]">
              {score.home} — {score.away}
            </span>
            <ResultChip home={score.home} away={score.away} isHome={event.is_home} />
          </div>
        )}

        {/* Lieu */}
        {event.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#9CA3AF] flex-shrink-0" />
            <p className="text-xs text-[#9CA3AF] font-[family-name:var(--font-nunito)]">{event.location}</p>
          </div>
        )}
      </div>

      {/* Séparateur */}
      <div className="h-px bg-[#F0F0F2] mx-4" />

      {/* Présence */}
      <div className="px-4 py-3 space-y-2.5">
        {/* Boutons */}
        <div className={`grid grid-cols-3 gap-2 ${isPendingAttendance ? 'opacity-50 pointer-events-none' : ''}`}>
          {BTNS.map(b => (
            <button key={b.s} onClick={() => onAttendance(event.id, b.s)}
              className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors font-[family-name:var(--font-nunito)] ${
                currentStatus === b.s ? b.active : 'bg-white text-[#6B7280] border-[#D1D1D6] hover:border-[#9CA3AF]'
              }`}>
              <b.Icon className="w-3.5 h-3.5" /> {b.label}
            </button>
          ))}
        </div>

        {/* Compteurs inline */}
        {counts ? (
          <button onClick={() => setShowAttendees(v => !v)}
            className="flex items-center gap-3 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors font-[family-name:var(--font-nunito)]">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-success" />{counts.confirmed}</span>
            <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5 text-secondary" />{counts.declined}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />{counts.pending}</span>
            <span className="ml-auto underline underline-offset-2">{showAttendees ? 'Masquer' : 'Voir la liste'}</span>
          </button>
        ) : (
          <button onClick={() => setShowAttendees(v => !v)}
            className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors font-[family-name:var(--font-nunito)] underline underline-offset-2">
            Voir les présences
          </button>
        )}
      </div>

      {/* Liste présences */}
      <AttendeesList eventId={event.id} organizationId={event.organization_id} isExpanded={showAttendees}
        onCounts={setCounts} currentUserId={currentUserId} currentUserName={currentUserName} currentStatus={currentStatus} />

      {showLineup && (
        <LineupModal eventId={event.id} organizationId={event.organization_id}
          eventTitle={event.title} onClose={() => setShowLineup(false)} />
      )}

      <DeleteConfirmModal isOpen={showDeleteModal}
        onConfirm={() => { setShowDeleteModal(false); onDelete(event.id) }}
        onCancel={() => setShowDeleteModal(false)} eventTitle={event.title} />
    </div>
  )
}
