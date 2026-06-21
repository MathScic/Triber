'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import { OrgBanner } from '@/components/home/OrgBanner'
import { ModuleGrid } from '@/components/home/ModuleGrid'

type Org = { id: string; name: string; type: string; plan: string; logo_url?: string | null; cover_url?: string | null }

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

export default function HomePage() {
  const router = useRouter()
  const [org, setOrg] = useState<Org | null | undefined>(undefined)
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setFullName((user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'Utilisateur')

      supabase
        .from('organization_members')
        .select('organizations(id, name, type, plan, logo_url, cover_url)')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          const raw = data?.organizations
          const resolved = Array.isArray(raw) ? (raw[0] ?? null) : (raw ?? null)
          setOrg(resolved as Org | null)
          setIsLoading(false)
        })
    })
  }, [router])

  useEffect(() => {
    if (!isLoading && org === null) router.push('/onboarding')
  }, [isLoading, org, router])

  if (isLoading) {
    return (
      <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-[#FAF7F2] flex items-center justify-center`}>
        <p className="text-sm text-[#7A8070] font-[family-name:var(--font-nunito)]">Chargement…</p>
      </main>
    )
  }

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-[#FAF7F2] px-4 py-8`}>
      <div className="max-w-lg mx-auto">
        {org ? (
          <>
            <OrgBanner
              name={org.name}
              fullName={fullName}
              logoUrl={org.logo_url}
              coverUrl={org.cover_url}
              initial={fullName.charAt(0).toUpperCase() || '?'}
            />
            <ModuleGrid />
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DDD8CE] p-6 text-center">
            <p className="text-sm text-[#7A8070] mb-4 font-[family-name:var(--font-nunito)]">
              Vous n'avez pas encore d'organisation.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-[#2A9D4E] text-white font-[800] font-[family-name:var(--font-barlow)] uppercase tracking-wide text-sm hover:bg-[#238742] transition-colors"
            >
              Créer mon organisation
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
