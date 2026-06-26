'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type MemberRole = 'admin' | 'member_active' | 'member'

export type Member = {
  id: string
  user_id: string
  role: MemberRole
  joined_at: string
  category: string | null
  jersey_number: number | null
  payment_status: 'paid' | 'pending' | null
  profiles: { id: string | null; full_name: string | null; avatar_url: string | null; phone: string | null } | null
}

export function useMembers(organizationId: string) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const getMembers = async () => {
    if (!organizationId) return
    setLoading(true)
    const s = createClient()

    const { data: rows, error: fetchError } = await s
      .from('organization_members')
      .select('id, role, joined_at, user_id, category, jersey_number')
      .eq('organization_id', organizationId)

    if (fetchError) { setError('Impossible de charger les membres.'); setLoading(false); return }

    const { data: payments } = await s
      .from('contribution_payments')
      .select('user_id, status')
      .eq('organization_id', organizationId)
      .eq('status', 'paid')

    const paidUserIds = new Set((payments ?? []).map(p => p.user_id as string))

    const profileResults = await Promise.all(
      (rows ?? []).map(m => s.from('profiles').select('id, full_name, avatar_url, phone').eq('id', m.user_id).single())
    )

    setMembers((rows ?? []).map((m, i) => ({
      id: m.id as string,
      user_id: m.user_id as string,
      role: m.role as MemberRole,
      joined_at: m.joined_at as string,
      category: (m.category as string | null) ?? null,
      jersey_number: (m.jersey_number as number | null) ?? null,
      payment_status: payments ? (paidUserIds.has(m.user_id as string) ? 'paid' : 'pending') : null,
      profiles: profileResults[i]?.data ?? null,
    })))
    setLoading(false)
  }

  const inviteMember = async (email: string, role: string): Promise<boolean> => {
    setLoading(true); setError(null); setSuccess(null)
    try {
      const res = await fetch('/api/members/invite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })
      const data = await res.json() as { error?: string }
      setLoading(false)
      if (!res.ok) { setError(data.error ?? "Erreur lors de l'invitation."); return false }
      setSuccess(`Invitation envoyée à ${email} ✓`)
      return true
    } catch { setError('Impossible de contacter le serveur.'); setLoading(false); return false }
  }

  const updateMemberRole = async (userId: string, role: MemberRole): Promise<boolean> => {
    const { error: err } = await createClient().from('organization_members')
      .update({ role }).eq('user_id', userId).eq('organization_id', organizationId)
    if (err) { setError('Impossible de modifier le rôle.'); return false }
    await getMembers(); return true
  }

  const removeMember = async (userId: string): Promise<boolean> => {
    const { error: err } = await createClient().from('organization_members')
      .delete().eq('user_id', userId).eq('organization_id', organizationId)
    if (err) { setError('Impossible de supprimer le membre.'); return false }
    await getMembers(); return true
  }

  const clearMessages = () => { setError(null); setSuccess(null) }

  return { members, getMembers, inviteMember, updateMemberRole, removeMember, loading, error, success, clearMessages }
}
