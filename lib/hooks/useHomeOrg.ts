'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export type HomeOrg = {
  id: string; name: string; type: string; plan: string
  logo_url?: string | null; cover_url?: string | null; primary_color?: string | null
}

export function useHomeOrg() {
  const router = useRouter()
  const [org, setOrg] = useState<HomeOrg | null | undefined>(undefined)
  const [fullName, setFullName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [role, setRole] = useState<string>('member')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
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
        // Un membre ne devrait appartenir qu'à une seule organisation, mais rien en
        // base ne l'empêche strictement — .limit(1) évite un crash silencieux (et
        // donc une page blanche permanente) si un compte a plusieurs adhésions.
        .select('role, organizations(id, name, type, plan, logo_url, cover_url, primary_color)')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false })
        .limit(1)
        .then(({ data, error }) => {
          if (error) { console.error('home org fetch:', error); setLoadError(true); setIsLoading(false); return }
          const row = data?.[0]
          const raw = row?.organizations
          const resolved = Array.isArray(raw) ? (raw[0] ?? null) : (raw ?? null)
          setOrg(resolved as HomeOrg | null)
          setRole((row?.role as string | undefined) ?? 'member')
          setIsLoading(false)
        })
    })
  }, [router])

  useEffect(() => {
    if (!isLoading && !loadError && org === null) router.push('/onboarding')
  }, [isLoading, loadError, org, router])

  return { org, fullName, userId, role, isLoading, loadError }
}
