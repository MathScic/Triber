'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LineupEditor, type FullMember, type LineupEntry } from './LineupEditor'

interface Props {
  eventId: string
  organizationId: string
  eventTitle: string
  onClose: () => void
}

type MemberRow = { id: string; user_id: string; jersey_number: number | null }
type ProfileRow = { id: string; full_name: string | null }

export function LineupModal({ eventId, organizationId, eventTitle, onClose }: Props) {
  const [members, setMembers] = useState<FullMember[]>([])
  const [lineup, setLineup] = useState<LineupEntry[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const s = createClient()
    Promise.all([
      // Fetch membres sans JOIN pour éviter les problèmes RLS sur profiles
      s.from('organization_members').select('id, user_id, jersey_number').eq('organization_id', organizationId),
      s.from('match_lineups').select('organization_member_id, is_starter').eq('event_id', eventId),
    ]).then(async ([{ data: mData }, { data: lData }]) => {
      const rows = (mData ?? []) as MemberRow[]
      const userIds = rows.map(r => r.user_id)
      let profiles: ProfileRow[] = []
      if (userIds.length > 0) {
        const { data: pData } = await s.from('profiles').select('id, full_name').in('id', userIds)
        profiles = (pData ?? []) as ProfileRow[]
      }
      const profileMap = new Map(profiles.map(p => [p.id, p.full_name]))
      setMembers(rows.map(r => ({
        org_member_id: r.id,
        user_id: r.user_id,
        name: profileMap.get(r.user_id) ?? 'Inconnu',
        jersey: r.jersey_number,
      })).sort((a, b) => (a.jersey ?? 99) - (b.jersey ?? 99)))
      setLineup((lData ?? []).map(l => ({
        org_member_id: l.organization_member_id as string,
        is_starter: l.is_starter as boolean,
      })))
      setFetching(false)
    })
  }, [eventId, organizationId])

  const addToLineup = async (orgMemberId: string, isStarter: boolean) => {
    setLineup(prev => [...prev.filter(l => l.org_member_id !== orgMemberId), { org_member_id: orgMemberId, is_starter: isStarter }])
    await fetch(`/api/match/${eventId}/lineup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orgMemberId, isStarter }) })
  }

  const removeFromLineup = async (orgMemberId: string) => {
    setLineup(prev => prev.filter(l => l.org_member_id !== orgMemberId))
    await fetch(`/api/match/${eventId}/lineup`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orgMemberId }) })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[#D1D1D6]">
          <h2 className="text-base font-[800] text-brand-dark font-[family-name:var(--font-barlow)]">
            Composition — {eventTitle}
          </h2>
          <button onClick={onClose} className="text-[#6B7280] hover:text-brand-dark transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {fetching ? (
            <p className="text-sm text-center text-[#6B7280] py-8 font-[family-name:var(--font-nunito)]">Chargement…</p>
          ) : (
            <LineupEditor allMembers={members} lineup={lineup} onAdd={addToLineup} onRemove={removeFromLineup} />
          )}
        </div>
        <div className="p-4 border-t border-[#D1D1D6] space-y-2">
          <p className="text-center text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">
            ✓ Modifications enregistrées automatiquement
          </p>
          <button onClick={onClose}
            className="w-full h-11 rounded-xl bg-success text-white text-sm font-[800] font-[family-name:var(--font-barlow)] uppercase tracking-wide hover:bg-[#238742] transition-colors">
            Confirmer la composition
          </button>
        </div>
      </div>
    </div>
  )
}
