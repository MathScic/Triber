'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { OrgBanner } from '@/components/home/OrgBanner'
import { LiveMatchBanner } from '@/components/home/LiveMatchBanner'
import { LastMatchCard } from '@/components/home/LastMatchCard'
import { NextEventCard } from '@/components/home/NextEventCard'
import { TopScorerCard } from '@/components/home/TopScorerCard'
import { AnnouncementSection } from '@/components/home/AnnouncementSection'
import { StandingsCard } from '@/components/home/StandingsCard'

type Org = {
  id: string; name: string; type: string; plan: string
  logo_url?: string | null; cover_url?: string | null; primary_color?: string | null
}

export default function HomePage() {
  const router = useRouter()
  const [org, setOrg] = useState<Org | null | undefined>(undefined)
  const [fullName, setFullName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [role, setRole] = useState<string>('member')
  const [isLoading, setIsLoading] = useState(true)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setFullName((user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'Utilisateur')
      setUserId(user.id)

      supabase
        .from('organization_members')
        .select('role, organizations(id, name, type, plan, logo_url, cover_url, primary_color)')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) { console.error('home org fetch:', error); setIsLoading(false); return }
          const raw = data?.organizations
          const resolved = Array.isArray(raw) ? (raw[0] ?? null) : (raw ?? null)
          setOrg(resolved as Org | null)
          setRole((data?.role as string | undefined) ?? 'member')
          setIsLoading(false)
        })
    })
  }, [router])

  useEffect(() => {
    if (!isLoading && org === null) router.push('/onboarding')
  }, [isLoading, org, router])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-brand-bg flex items-center justify-center">
        <p className="text-sm text-[#6B7280] font-[family-name:var(--font-nunito)]">Chargement…</p>
      </main>
    )
  }

  if (!org) return null

  return (
    <main className="min-h-screen bg-brand-bg px-4 py-8">
      <div className="max-w-lg lg:max-w-4xl mx-auto space-y-4">
        <OrgBanner
          name={org.name}
          fullName={fullName}
          logoUrl={org.logo_url}
          coverUrl={org.cover_url}
          initial={fullName.charAt(0).toUpperCase() || '?'}
          primaryColor={org.primary_color ?? '#1E5C38'}
          organizationId={org.id}
        />
        <LiveMatchBanner organizationId={org.id} />
        <LastMatchCard organizationId={org.id} />
        <NextEventCard organizationId={org.id} />
        <TopScorerCard organizationId={org.id} />
        <StandingsCard
          organizationId={org.id}
          primaryColor={org.primary_color ?? '#1E5C38'}
        />
        {userId && (
          <AnnouncementSection
            organizationId={org.id}
            canCreate={role === 'admin' || role === 'member_active'}
            currentUserId={userId}
          />
        )}
      </div>
    </main>
  )
}
