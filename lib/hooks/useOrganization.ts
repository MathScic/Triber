'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useOrganization() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrganization = async (name: string, type: string, slogan?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/organizations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, slogan }),
      })

      let data: { organization?: unknown; error?: string } = {}
      try {
        data = await response.json()
      } catch {
        setError('Erreur serveur inattendue.')
        setLoading(false)
        return null
      }

      if (!response.ok) {
        setError(data.error ?? "Erreur lors de la création de l'organisation.")
        setLoading(false)
        return null
      }

      setLoading(false)
      router.push('/home')
      router.refresh()
      return data.organization
    } catch {
      setError('Impossible de contacter le serveur.')
      setLoading(false)
      return null
    }
  }

  const getMyOrganization = async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
      .from('organization_members')
      .select('organization_id, role, organizations(*)')
      .eq('user_id', user.id)
      .single()

    return data?.organizations ?? null
  }

  const clearError = () => setError(null)

  return { createOrganization, getMyOrganization, loading, error, clearError }
}
