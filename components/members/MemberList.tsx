'use client'

import { useEffect } from 'react'
import { useMembers, type MemberRole } from '@/lib/hooks/useMembers'
import { MemberCard } from './MemberCard'

interface Props {
  organizationId: string
  currentUserId: string
}

export function MemberList({ organizationId, currentUserId }: Props) {
  const { members, getMembers, updateMemberRole, removeMember, loading, error } =
    useMembers(organizationId)

  useEffect(() => {
    getMembers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId])

  const isAdmin = members.find(m => m.user_id === currentUserId)?.role === 'admin'

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#DDD8CE] h-[66px] animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-sm text-[#E8622A] bg-[#FDF0EB] rounded-xl px-3 py-2">{error}</p>
    )
  }

  if (members.length === 0) {
    return (
      <p className="text-sm text-center text-[#7A8070] py-6">
        Aucun membre pour l'instant.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {members.map(member => (
        <MemberCard
          key={member.id}
          member={member}
          isAdmin={isAdmin}
          onRoleChange={(userId, role) => updateMemberRole(userId, role as MemberRole)}
          onRemove={removeMember}
        />
      ))}
    </div>
  )
}
