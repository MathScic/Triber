'use client'

import { useState } from 'react'
import { useMembers } from '@/lib/hooks/useMembers'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Props {
  organizationId: string
}

export function InviteForm({ organizationId }: Props) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const { inviteMember, loading, error, success } = useMembers(organizationId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    const ok = await inviteMember(email.trim(), role)
    if (ok) setEmail('')
  }

  return (
    <div className="bg-white rounded-2xl border border-[#DDD8CE] p-5 space-y-4">
      <h3 className="text-base font-bold text-[#1A1F16]">Inviter un membre</h3>

      {error && (
        <p className="text-xs text-[#E8622A] bg-[#FDF0EB] rounded-lg px-3 py-2">{error}</p>
      )}
      {success && (
        <p className="text-xs text-[#2A9D4E] bg-[#E8F5EE] rounded-lg px-3 py-2">{success}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="joueur@exemple.fr"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="invite-role">Rôle</Label>
          <select
            id="invite-role"
            value={role}
            onChange={e => setRole(e.target.value)}
            className="mt-1 flex h-11 w-full rounded-xl border border-[#DDD8CE] px-3 text-sm text-[#1A1F16] bg-white focus:outline-none focus:ring-2 focus:ring-[#2A9D4E]"
          >
            <option value="member">Membre — lecture seule</option>
            <option value="member_active">Actif — peut saisir résultats</option>
            <option value="admin">Admin — accès complet</option>
          </select>
        </div>

        <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
          {loading ? 'Envoi...' : "Envoyer l'invitation"}
        </Button>
      </form>
    </div>
  )
}
