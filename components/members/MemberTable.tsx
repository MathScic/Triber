'use client'

import { useState, useMemo } from 'react'
import { Search, MoreVertical, UserPlus } from 'lucide-react'
import type { Member, MemberRole } from '@/lib/hooks/useMembers'
import { avatarColor, initials } from '@/lib/utils/avatar'

const ROLE_LABELS: Record<MemberRole, string> = { admin: 'Admin', member_active: 'Actif', member: 'Membre' }

interface Props {
  members: Member[]
  isAdmin: boolean
  onRoleChange: (userId: string, role: MemberRole) => void
  onRemove: (userId: string) => void
  onInvite: () => void
}

export function MemberTable({ members, isAdmin, onRoleChange, onRemove, onInvite }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return members.filter(m => {
      const name = m.profiles?.full_name ?? ''
      const matchSearch = name.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === 'all' || (filter === 'paid' && m.payment_status === 'paid') || (filter === 'pending' && m.payment_status !== 'paid')
      return matchSearch && matchFilter
    })
  }, [members, search, filter])

  const counts = { all: members.length, paid: members.filter(m => m.payment_status === 'paid').length, pending: members.filter(m => m.payment_status !== 'paid').length }

  const TABS = [
    { key: 'all' as const, label: 'Tous', count: counts.all },
    { key: 'paid' as const, label: 'Payés', count: counts.paid },
    { key: 'pending' as const, label: 'En attente', count: counts.pending },
  ]

  return (
    <div className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm overflow-hidden">
      {/* Barre recherche + bouton */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F4F4F6]">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un membre…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#D1D1D6] text-sm bg-[#F4F4F6] focus:outline-none focus:border-[#2A9D4E] font-[family-name:var(--font-nunito)]" />
        </div>
        {isAdmin && (
          <button onClick={onInvite}
            className="flex items-center gap-2 h-10 px-4 bg-[#E8622A] text-white text-sm font-semibold rounded-xl hover:bg-[#d4571f] transition-colors font-[family-name:var(--font-nunito)] whitespace-nowrap">
            <UserPlus className="w-4 h-4" /> Ajouter un membre
          </button>
        )}
      </div>

      {/* Onglets filtres */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-[#F4F4F6]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors font-[family-name:var(--font-nunito)] ${filter === t.key ? 'text-[#1A1F16]' : 'text-[#9CA3AF]'}`}>
            {t.label}
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${filter === t.key ? 'bg-[#1A1F16] text-white' : 'bg-[#F4F4F6] text-[#9CA3AF]'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-[family-name:var(--font-nunito)]">
          <thead>
            <tr className="border-b border-[#F4F4F6]">
              {['Membre', 'Catégorie', 'Rôle', 'Paiement', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-[#9CA3AF] px-5 py-3 first:pl-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const name = m.profiles?.full_name ?? '—'
              const color = avatarColor(name)
              return (
                <tr key={m.id} className="border-b border-[#F4F4F6] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: color.bg, color: color.text }}>
                        {initials(name)}
                      </div>
                      <span className="font-semibold text-[#1A1F16]">{name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#6B7280]">{m.category ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    {isAdmin
                      ? <select value={m.role} onChange={e => onRoleChange(m.user_id, e.target.value as MemberRole)}
                          className="text-xs border border-[#D1D1D6] rounded-lg px-2 py-1 bg-white text-[#1A1F16] focus:outline-none focus:ring-1 focus:ring-[#2A9D4E]">
                          <option value="member">Membre</option>
                          <option value="member_active">Actif</option>
                          <option value="admin">Admin</option>
                        </select>
                      : <span className="text-[#6B7280]">{ROLE_LABELS[m.role]}</span>
                    }
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${m.payment_status === 'paid' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>
                      {m.payment_status === 'paid' ? 'Payé' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 relative">
                    {isAdmin && (
                      <>
                        <button onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
                          className="w-8 h-8 rounded-lg hover:bg-[#F4F4F6] flex items-center justify-center transition-colors">
                          <MoreVertical className="w-4 h-4 text-[#9CA3AF]" />
                        </button>
                        {openMenu === m.id && (
                          <div className="absolute right-4 top-10 z-10 bg-white border border-[#D1D1D6] rounded-xl shadow-lg py-1 min-w-[140px]">
                            <button onClick={() => { onRemove(m.user_id); setOpenMenu(null) }}
                              className="w-full text-left px-4 py-2.5 text-sm text-[#E8622A] hover:bg-[#FDF0EB] transition-colors font-[family-name:var(--font-nunito)]">
                              Retirer du club
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-sm text-[#9CA3AF] py-10 font-[family-name:var(--font-nunito)]">Aucun membre trouvé</p>
        )}
      </div>
    </div>
  )
}
