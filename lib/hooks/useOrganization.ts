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

      // Tente de parser le JSON — peut échouer si le serveur renvoie du HTML
      let data: { organization?: unknown; error?: string } = {}
      try {
        data = await response.json()
      } catch {
        console.log('Erreur : réponse non-JSON reçue (status', response.status, ')')
        setError('Erreur serveur inattendue. Vérifiez les logs.')
        setLoading(false)
        return null
      }

      console.log('Réponse API :', response.status, data)

      if (!response.ok) {
        console.log('Erreur API :', data.error)
        setError(data.error ?? "Erreur lors de la création de l'organisation.")
        setLoading(false)
        return null
      }

      setLoading(false)
      console.log('✅ Organisation créée, redirect /home')
      // Délai 800ms pour laisser Supabase indexer la nouvelle ligne
      await new Promise((resolve) => setTimeout(resolve, 800))
      router.push('/home')
      router.refresh()
      return data.organization
    } catch (err) {
      console.log('Erreur réseau :', err)
      setError('Impossible de contacter le serveur.')
      setLoading(false)
      return null
    }
  }

  const getMyOrganization = async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('organization_members')
      .select('organization_id, role, organizations(*)')
      .eq('user_id', user.id)
      .single()

    console.log('DATA:', JSON.stringify(data))
    console.log('ERROR:', JSON.stringify(error))

    return data?.organizations ?? null
  }

  const clearError = () => setError(null)

  return { createOrganization, getMyOrganization, loading, error, clearError }
}
