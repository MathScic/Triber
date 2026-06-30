'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type Mode = 'register' | 'login'

export default function JoinAuthForm({ code, orgId }: { code: string; orgId?: string }) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('register')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const joinOrg = async (token: string) => {
    const qs = orgId ? `?org=${orgId}` : ''
    const resp = await fetch(`/api/join/${code}${qs}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (resp.ok || resp.status === 409) {
      router.push('/home')
    } else {
      const d = await resp.json() as { error?: string }
      setError(d.error ?? 'Erreur lors de l\'adhésion')
    }
  }

  const handle = async () => {
    if (!email.trim() || !password.trim()) return
    if (mode === 'register' && !fullName.trim()) return
    setError(null); setLoading(true)
    const supabase = createClient()

    if (mode === 'register') {
      const next = `/join/${code}?${orgId ? `org=${orgId}&` : ''}confirmed=1`
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      const { error: err } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: redirectTo,
          data: { full_name: fullName.trim() },
        },
      })
      if (err) {
        setError(err.message.includes('already registered') ? 'Un compte existe déjà avec cet email.' : err.message)
      } else {
        setEmailSent(true)
      }
    } else {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) {
        setError(
          err.message.includes('Email not confirmed') ? 'Confirmez votre email avant de vous connecter.' :
          err.message.includes('Invalid login') ? 'Email ou mot de passe incorrect.' : err.message
        )
      } else if (data.session) {
        // Login réussi → rejoindre directement sans passer par email
        await joinOrg(data.session.access_token)
      }
    }
    setLoading(false)
  }

  if (emailSent) {
    return (
      <div className="text-center space-y-3 py-2">
        <Mail className="w-10 h-10 text-success mx-auto mb-1" />
        <p className="font-bold text-brand-dark">Vérifiez votre email</p>
        <p className="text-sm text-[#6B7280] leading-relaxed">
          Un lien de confirmation vous a été envoyé à <strong>{email}</strong>.<br />
          Cliquez dessus pour finaliser votre inscription et rejoindre le club.
        </p>
        <p className="text-xs text-[#6B7280]">Pensez à vérifier vos spams.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl overflow-hidden border border-[#D1D1D6]">
        {(['register', 'login'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(null) }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              mode === m ? 'bg-success text-white' : 'text-[#6B7280] hover:bg-[#E8E8EA]'
            }`}
          >
            {m === 'register' ? 'Créer un compte' : 'Se connecter'}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-secondary bg-secondary-light rounded-xl px-3 py-2">{error}</p>
      )}

      <div className="space-y-3">
        {mode === 'register' && (
          <div className="space-y-1.5">
            <Label htmlFor="join-name">Prénom et nom</Label>
            <Input
              id="join-name" type="text" value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Jean Dupont" autoComplete="name"
            />
          </div>
        )}
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

      <Button
        className="w-full"
        onClick={() => void handle()}
        disabled={loading || !email.trim() || !password.trim() || (mode === 'register' && !fullName.trim())}
      >
        {loading ? '…' : mode === 'register' ? 'Créer mon compte' : 'Se connecter et rejoindre'}
      </Button>
    </div>
  )
}
