'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Announcement = {
  id: string
  title: string
  message: string
  category: string | null
  created_at: string
  author_id: string
  profiles: { full_name: string | null } | null
}

export function useAnnouncements(organizationId: string) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnnouncements = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('announcements')
      .select('id, title, message, category, created_at, author_id')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (err) { setError('Impossible de charger les annonces.'); setLoading(false); return }

    // Charge les profils des auteurs séparément (pas de FK directe)
    const authorIds = [...new Set((data ?? []).map(a => a.author_id as string))]
    const { data: profiles } = await supabase
      .from('profiles').select('id, full_name').in('id', authorIds)

    setAnnouncements((data ?? []).map(a => ({
      id: a.id as string, title: a.title as string, message: a.message as string,
      category: a.category as string | null, created_at: a.created_at as string,
      author_id: a.author_id as string,
      profiles: profiles?.find(p => p.id === a.author_id) ?? null,
    })))
    setLoading(false)
  }

  const createAnnouncement = async (title: string, message: string, category?: string): Promise<boolean> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { error: err } = await supabase.from('announcements')
      .insert({ organization_id: organizationId, author_id: user.id, title, message, category: category ?? null })
    if (err) { setError("Impossible de publier l'annonce."); return false }
    await fetchAnnouncements(); return true
  }

  const deleteAnnouncement = async (id: string): Promise<boolean> => {
    const supabase = createClient()
    const { error: err } = await supabase.from('announcements').delete().eq('id', id)
    if (err) return false
    setAnnouncements(prev => prev.filter(a => a.id !== id)); return true
  }

  return { announcements, loading, error, fetchAnnouncements, createAnnouncement, deleteAnnouncement }
}
