'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type MediaItem = {
  id: string
  url: string
  caption: string | null
  created_at: string
  event_id: string | null
}

const BUCKET = 'triber-media'

export function useMedia(organizationId: string) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!organizationId) return
    const { data } = await createClient()
      .from('media')
      .select('id, url, caption, created_at, event_id')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
    setItems((data ?? []) as MediaItem[])
    setLoading(false)
  }, [organizationId])

  useEffect(() => { void refresh() }, [refresh])

  const upload = async (file: File, caption?: string) => {
    const s = createClient()
    const { data: { user } } = await s.auth.getUser()
    if (!user) return

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${organizationId}/${Date.now()}.${ext}`

    const { error } = await s.storage.from(BUCKET).upload(path, file, { upsert: false })
    if (error) { console.error('Upload error:', error); return }

    const { data: { publicUrl } } = s.storage.from(BUCKET).getPublicUrl(path)

    await s.from('media').insert({
      organization_id: organizationId,
      uploader_id: user.id,
      url: publicUrl,
      caption: caption ?? null,
    })

    await refresh()
  }

  const remove = async (id: string, url: string) => {
    const s = createClient()
    const path = url.split(`/${BUCKET}/`)[1]
    if (path) await s.storage.from(BUCKET).remove([decodeURIComponent(path)])
    await s.from('media').delete().eq('id', id)
    setItems(i => i.filter(x => x.id !== id))
  }

  return { items, loading, upload, remove, refresh }
}
