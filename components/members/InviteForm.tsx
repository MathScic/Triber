'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  organizationId: string
  orgName: string
  onClose?: () => void
}

export function InviteForm({ organizationId, orgName, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true); setError(null); setSuccess(null)

    const { data: { session } } = await createClient().auth.getSession()
    const res = await fetch('/api/members/send-invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify({ email: email.trim(), orgName, orgId: organizationId }),
    })

    const data = await res.json() as { error?: string }
    if (!res.ok) {
      setError(data.error ?? "Erreur lors de l'invitation.")
    } else {
      setSuccess(`Invitation envoyée à ${email} ✓`)
      setEmail('')
      setTimeout(() => onClose?.(), 1500)
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-[#D1D1D6] p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-brand-dark font-[family-name:var(--font-barlow)] uppercase tracking-wide">
            Inviter un membre
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5 font-[family-name:var(--font-nunito)]">
            Un email avec un lien d&apos;accès direct sera envoyé
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-brand-bg transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        )}
      </div>

      {error && <p className="text-xs text-secondary bg-secondary-light rounded-lg px-3 py-2">{error}</p>}
      {success && <p className="text-xs text-success bg-primary-light rounded-lg px-3 py-2">{success}</p>}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="joueur@exemple.fr"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !email.trim()}>
          {loading ? '…' : 'Inviter'}
        </Button>
      </form>
    </div>
  )
}
