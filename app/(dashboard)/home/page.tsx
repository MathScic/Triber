'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'

type Org = { id: string; name: string; type: string; plan: string }

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

const MODULES = [
  { label: 'Membres', icon: '👥' },
  { label: 'Événements', icon: '📅' },
  { label: 'Stats', icon: '📊' },
  { label: 'Finances', icon: '💳' },
]

export default function HomePage() {
  const router = useRouter()
  const [org, setOrg] = useState<Org | null | undefined>(undefined)
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const fetched = useRef(false) // évite le double-fetch React Strict Mode

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }

      setFullName((user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'Utilisateur')

      // Charge l'organisation côté client pour éviter la race condition post-création
      supabase
        .from('organization_members')
        .select('organizations(id, name, type, plan)')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle()
        .then(({ data }) => {
          const raw = data?.organizations
          const resolved = Array.isArray(raw) ? (raw[0] ?? null) : (raw ?? null)
          setOrg(resolved as Org | null)
          setIsLoading(false)
        })
    })
  }, [router])

  // Redirige vers /onboarding UNIQUEMENT quand chargement terminé ET org null
  useEffect(() => {
    if (!isLoading && org === null) {
      router.push('/onboarding')
    }
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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-[800] text-[#1A1F16] font-[family-name:var(--font-barlow)] uppercase tracking-tight">
              {org?.name ?? 'Triber'}
            </h1>
            <p className="text-sm text-[#7A8070] font-[family-name:var(--font-nunito)]">
              Bonjour, {fullName} 👋
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2A9D4E] flex items-center justify-center">
            <span className="text-white text-sm font-[800] font-[family-name:var(--font-barlow)]">
              {fullName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Bouton fallback si org null malgré le chargement terminé */}
        {!org && (
          <div className="bg-white rounded-2xl border border-[#DDD8CE] p-6 mb-6 text-center">
            <p className="text-sm text-[#7A8070] mb-4 font-[family-name:var(--font-nunito)]">
              Vous n'avez pas encore d'organisation.
            </p>
            <Link href="/onboarding" className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-[#2A9D4E] text-white font-[800] font-[family-name:var(--font-barlow)] uppercase tracking-wide text-sm hover:bg-[#238742] transition-colors">
              Créer mon organisation
            </Link>
          </div>
        )}

        {org && (
          <div className="grid grid-cols-2 gap-3">
            {MODULES.map(({ label, icon }) => (
              <div key={label} className="bg-white rounded-2xl border border-[#DDD8CE] p-4 flex flex-col items-center gap-2 opacity-50">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm font-semibold text-[#1A1F16] font-[family-name:var(--font-nunito)]">{label}</span>
                <span className="text-xs text-[#7A8070] font-[family-name:var(--font-nunito)]">Bientôt</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
