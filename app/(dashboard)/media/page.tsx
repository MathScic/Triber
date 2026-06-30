'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useMedia } from '@/lib/hooks/useMedia'
import { MediaGallery } from '@/components/media/MediaGallery'
import { MediaUploadButton } from '@/components/media/MediaUploadButton'
import { PageHeader } from '@/components/shared/PageHeader'

export default function MediaPage() {
  const router = useRouter()
  const [orgId, setOrgId] = useState<string | null>(null)
  const [role, setRole] = useState<string>('member')
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    ;(async () => {
      const s = createClient()
      const { data: { user } } = await s.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await s.from('organization_members')
        .select('organization_id, role').eq('user_id', user.id).maybeSingle()
      if (data) {
        setOrgId(data.organization_id as string)
        setRole(data.role as string)
      }
    })()
  }, [router])

  const { items, loading, upload, remove } = useMedia(orgId ?? '')
  const canDelete = role === 'admin' || role === 'member_active'

  return (
    <main className="min-h-screen bg-brand-bg px-4 py-8">
      <div className="max-w-lg lg:max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <PageHeader
            title="Médias"
            subtitle={`${items.length} photo${items.length !== 1 ? 's' : ''}`}
          />
          <MediaUploadButton onUpload={upload} />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-[#E8E8EA] animate-pulse" />
            ))}
          </div>
        ) : (
          <MediaGallery
            items={items}
            canDelete={canDelete}
            onDelete={id => {
              const url = items.find(x => x.id === id)?.url ?? ''
              void remove(id, url)
            }}
          />
        )}
      </div>
    </main>
  )
}
