'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { MyContributions } from '@/components/profile/MyContributions'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justPaid = searchParams.get('paid') === '1'
  const [userId, setUserId] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)

  useEffect(() => {
    const s = createClient()
    s.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      s.from('organization_members').select('organization_id').eq('user_id', user.id).maybeSingle()
        .then(({ data }) => { if (data) setOrgId(data.organization_id as string) })
    })
  }, [router])

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-[#F4F4F6] px-6 py-8`}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-[800] text-[#1A1F16] uppercase tracking-tight font-[family-name:var(--font-barlow)]">
            Mon profil
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5 font-[family-name:var(--font-nunito)]">
            Informations personnelles et cotisations
          </p>
        </div>

        {userId && <ProfileForm userId={userId} />}
        {userId && orgId && <MyContributions userId={userId} orgId={orgId} justPaid={justPaid} />}
      </div>
    </main>
  )
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileContent />
    </Suspense>
  )
}
