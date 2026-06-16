'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useAuth() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    if (authError) {
      // Message en français selon le code d'erreur Supabase
      if (authError.message.includes('Email not confirmed')) {
        setError('Confirmez votre email avant de vous connecter.')
      } else if (authError.message.includes('Invalid login')) {
        setError('Email ou mot de passe incorrect.')
      } else {
        setError(authError.message)
      }
      return
    }
    router.push('/home')
    router.refresh()
  }

  const register = async (
    email: string,
    password: string,
    fullName: string,
  ) => {
    setLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
    setLoading(false)
    if (authError) {
      if (authError.message.includes('already registered')) {
        setError('Un compte existe déjà avec cet email.')
      } else {
        setError(authError.message)
      }
      return
    }
    // Email de vérification envoyé — redirection vers écran d'attente
    router.push('/register/confirme')
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const clearError = () => setError(null)

  return { login, register, logout, loading, error, clearError }
}
