'use client'

import type { Member, MemberRole } from '@/lib/hooks/useMembers'

const ROLE_LABELS: Record<MemberRole, string> = {
  admin: 'Admin',
  member_active: 'Actif',
  member: 'Membre',
}

const ROLE_COLORS: Record<MemberRole, string> = {
  admin: 'bg-[#E8F5EE] text-[#2A9D4E]',
  member_active: 'bg-[#FDF0EB] text-[#E8622A]',
  member: 'bg-[#F0EBE1] text-[#7A8070]',
}

interface Props {
  member: Member
  isAdmin: boolean
  onRoleChange: (userId: string, role: MemberRole) => void
  onRemove: (userId: string) => void
}

export function MemberCard({ member, isAdmin, onRoleChange, onRemove }: Props) {
  const name = member.profiles?.full_name ?? '—'
  const initials = name
    .split(' ')
    .map((w: string) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <div className="bg-white rounded-2xl border border-[#DDD8CE] p-4 flex items-center gap-3">
      {/* Avatar initiales */}
      <div className="w-10 h-10 rounded-full bg-[#2A9D4E] flex-shrink-0 flex items-center justify-center">
        <span className="text-white text-sm font-bold">{initials}</span>
      </div>

      {/* Nom + date */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1A1F16] truncate">{name}</p>
        <p className="text-xs text-[#7A8070]">
          {new Date(member.joined_at).toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Rôle : select si admin, badge sinon */}
      {isAdmin ? (
        <select
          value={member.role}
          onChange={e => onRoleChange(member.user_id, e.target.value as MemberRole)}
          className="text-xs border border-[#DDD8CE] rounded-lg px-2 py-1 bg-white text-[#1A1F16] focus:outline-none focus:ring-1 focus:ring-[#2A9D4E]"
        >
          <option value="member">Membre</option>
          <option value="member_active">Actif</option>
          <option value="admin">Admin</option>
        </select>
      ) : (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ROLE_COLORS[member.role]}`}>
          {ROLE_LABELS[member.role]}
        </span>
      )}

      {/* Bouton supprimer (admin uniquement) */}
      {isAdmin && (
        <button
          onClick={() => onRemove(member.user_id)}
          aria-label="Supprimer"
          className="text-[#7A8070] hover:text-[#E8622A] transition-colors text-sm ml-1"
        >
          ✕
        </button>
      )}
    </div>
  )
}
