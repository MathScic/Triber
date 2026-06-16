'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AttendanceStatus } from '@/lib/hooks/useEvents'

type Attendee = { user_id: string; status: AttendanceStatus; name: string | null; role: string }
export type AttendanceCounts = { confirmed: number; declined: number; pending: number }

const COLORS: Record<AttendanceStatus, string> = { confirmed: '#2A9D4E', declined: '#E8622A', pending: '#7A8070' }
const LABELS: Record<AttendanceStatus, string> = { confirmed: 'Présents', declined: 'Absents', pending: 'En attente' }
const ROLES: Record<string, string> = { admin: 'Admin', member_active: 'Actif', member: 'Membre' }

interface Props {
  eventId: string
  organizationId: string
  isExpanded: boolean
  onCounts?: (c: AttendanceCounts) => void
  currentUserId?: string
  currentStatus?: AttendanceStatus | null
}

export function AttendeesList({ eventId, organizationId, isExpanded, onCounts, currentUserId, currentStatus }: Props) {
  const [attendees, setAttendees] = useState<Attendee[]>([])

  useEffect(() => {
    ;(async () => {
      const s = createClient()
      const { data: att } = await s.from('event_attendees').select('user_id, status').eq('event_id', eventId)
      if (!att?.length) return
      const ids = att.map(a => a.user_id as string)
      const [{ data: prof }, { data: mem }] = await Promise.all([
        s.from('profiles').select('id, full_name').in('id', ids),
        s.from('organization_members').select('user_id, role').eq('organization_id', organizationId).in('user_id', ids),
      ])
      setAttendees(att.map(a => ({
        user_id: a.user_id as string, status: a.status as AttendanceStatus,
        name: prof?.find(p => p.id === a.user_id)?.full_name ?? null,
        role: mem?.find(r => r.user_id === a.user_id)?.role as string ?? 'member',
      })))
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, organizationId])

  // Fusionne avec le statut live de l'utilisateur courant (mise à jour optimiste)
  const merged = useMemo(() => {
    if (!currentUserId || !currentStatus) return attendees
    const exists = attendees.some(a => a.user_id === currentUserId)
    if (!exists) return [...attendees, { user_id: currentUserId, status: currentStatus, name: null, role: 'member' }]
    return attendees.map(a => a.user_id === currentUserId ? { ...a, status: currentStatus } : a)
  }, [attendees, currentUserId, currentStatus])

  // Met à jour les compteurs à chaque changement (status live inclus)
  useEffect(() => {
    onCounts?.({
      confirmed: merged.filter(a => a.status === 'confirmed').length,
      declined: merged.filter(a => a.status === 'declined').length,
      pending: merged.filter(a => a.status === 'pending').length,
    })
  }, [merged, onCounts])

  if (!isExpanded) return null

  return (
    <div className="space-y-3 pt-2 border-t border-[#DDD8CE]">
      {(['confirmed', 'declined', 'pending'] as AttendanceStatus[]).map(status => {
        const group = merged.filter(a => a.status === status)
        if (!group.length) return null
        return (
          <div key={status}>
            <p className="text-xs font-semibold mb-1.5" style={{ color: COLORS[status] }}>{LABELS[status]}</p>
            {group.map(a => {
              const init = (a.name ?? '?').split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '?'
              return (
                <div key={a.user_id} className="flex items-center gap-2 py-0.5">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: COLORS[status] }}>{init}</div>
                  <span className="text-sm text-[#1A1F16] flex-1 truncate">{a.name ?? '—'}</span>
                  <span className="text-xs text-[#7A8070]">{ROLES[a.role] ?? a.role}</span>
                </div>
              )
            })}
          </div>
        )
      })}
      {merged.length === 0 && <p className="text-xs text-[#7A8070]">Aucune réponse pour l'instant.</p>}
    </div>
  )
}
