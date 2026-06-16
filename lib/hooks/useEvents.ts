'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type EventType = 'match' | 'training' | 'meeting' | 'other'
export type AttendanceStatus = 'confirmed' | 'declined' | 'pending'

export type TriberEvent = {
  id: string; organization_id: string; title: string; type: EventType
  start_at: string; location: string | null; opponent: string | null
  is_home: boolean | null; created_by: string | null; created_at: string
}

export type CreateEventData = {
  title: string; type: EventType; start_at: string
  location?: string; opponent?: string; is_home?: boolean
}

export function useEvents() {
  const [events, setEvents] = useState<TriberEvent[]>([])
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({})
  const [pendingEventId, setPendingEventId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('member')
  const [orgId, setOrgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getEvents = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: membership } = await supabase.from('organization_members')
      .select('organization_id, role').eq('user_id', user.id).single()
    if (!membership) { setLoading(false); return }

    setOrgId(membership.organization_id as string)
    setUserRole(membership.role as string)

    const [{ data }, { data: att }] = await Promise.all([
      supabase.from('events').select('*')
        .eq('organization_id', membership.organization_id).order('start_at', { ascending: true }),
      supabase.from('event_attendees').select('event_id, status').eq('user_id', user.id),
    ])

    setEvents((data ?? []) as TriberEvent[])
    setAttendanceMap(Object.fromEntries(
      (att ?? []).map(a => [a.event_id as string, a.status as AttendanceStatus])
    ))
    setLoading(false)
  }

  const createEvent = async (formData: CreateEventData): Promise<boolean> => {
    if (!orgId) return false
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('events')
      .insert({ ...formData, organization_id: orgId, created_by: user?.id })
    if (err) { setError("Impossible de créer l'événement."); return false }
    await getEvents(); return true
  }

  const updateAttendance = async (eventId: string, status: AttendanceStatus): Promise<boolean> => {
    // Sauvegarde du statut précédent pour rollback éventuel
    const prevStatus = attendanceMap[eventId]

    // 1. Mise à jour optimiste immédiate — avant la requête
    setAttendanceMap(prev => ({ ...prev, [eventId]: status }))
    setPendingEventId(eventId)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('event_attendees')
      .upsert({ event_id: eventId, user_id: user?.id, status }, { onConflict: 'event_id,user_id' })

    setPendingEventId(null)
    if (err) {
      // 3. Rollback si échec de la requête
      setError('Impossible de mettre à jour la présence.')
      setAttendanceMap(prev => {
        const next = { ...prev }
        if (prevStatus !== undefined) next[eventId] = prevStatus
        else delete next[eventId]
        return next
      })
      return false
    }
    return true
  }

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    const supabase = createClient()
    const { error: err } = await supabase.from('events').delete().eq('id', eventId)
    if (err) { setError("Impossible de supprimer l'événement."); return false }
    await getEvents(); return true
  }

  return { events, attendanceMap, pendingEventId, userRole, orgId, getEvents, createEvent, updateAttendance, deleteEvent, loading, error }
}
