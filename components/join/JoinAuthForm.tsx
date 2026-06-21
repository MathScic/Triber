'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type Mode = 'register' | 'login'

export default function JoinAuthForm({ code }: { code: string }) {
  const [mode, setMode] = useState<Mode>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handle = async () => {
    if (!email.trim() || !password.trim()) return
    setError(null); setLoading(true)
    const supabase = createClient()

    if (mode === 'register') {
      // Après confirmation, Supabase renvoie l'utilisateur sur /auth/callback?next=/join/[code]
      const redirectTo = `${window.location.origin}/auth/callback?next=/join/${code}`
      const { error: err } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: redirectTo },
      })
      if (err) {
        setError(err.message.includes('already registered') ? 'Un compte existe déjà avec cet email.' : err.message)
      } else {
        setEmailSent(true)
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) {
        setError(
          err.message.includes('Email not confirmed') ? 'Confirmez votre email avant de vous connecter.' :
          err.message.includes('Invalid login') ? 'Email ou mot de passe incorrect.' : err.message
        )
      }
      // Si succès : onAuthStateChange dans JoinOrgCard détecte la session → affiche "Rejoindre"
    }
    setLoading(false)
  }

  if (emailSent) {
    return (
      <div className="text-center space-y-3 py-2">
        <p className="text-4xl">📬</p>
        <p className="font-bold text-[#1A1F16]">Vérifiez votre email</p>
        <p className="text-sm text-[#7A8070] leading-relaxed">
          Un lien de confirmation vous a été envoyé.<br />
          Cliquez dessus — il vous ramènera automatiquement sur cette page pour finaliser votre adhésion.
        </p>
        <p className="text-xs text-[#7A8070]">Pensez à vérifier vos spams.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Onglets Créer / Se connecter */}
      <div className="flex rounded-xl overflow-hidden border border-[#DDD8CE]">
        {(['register', 'login'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(null) }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              mode === m ? 'bg-[#2A9D4E] text-white' : 'text-[#7A8070] hover:bg-[#F0EBE1]'
            }`}
          >
            {m === 'register' ? 'Créer un compte' : 'Se connecter'}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-[#E8622A] bg-[#FDF0EB] rounded-xl px-3 py-2">{error}</p>
      )}

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="join-email">Email</Label>
          <Input
            id="join-email" type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="vous@exemple.fr" autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="join-pwd">Mot de passe</Label>
          <Input
            id="join-pwd" type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            onKeyDown={e => e.key === 'Enter' && void handle()}
          />
        </div>
      </div>

      <Button className="w-full" onClick={() => void handle()} disabled={loading || !email.trim() || !password.trim()}>
        {loading ? '…' : mode === 'register' ? 'Créer mon compte' : 'Se connecter'}
      </Button>
    </div>
  )
}
