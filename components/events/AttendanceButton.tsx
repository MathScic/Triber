'use client'

import type { AttendanceStatus } from '@/lib/hooks/useEvents'

const BUTTONS: { status: AttendanceStatus; label: string; icon: string; active: string; inactive: string }[] = [
  { status: 'confirmed', label: 'Présent', icon: '✅', active: 'bg-primary text-white', inactive: 'bg-white text-[#7A8070] border border-[#DDD8CE] hover:border-primary' },
  { status: 'declined', label: 'Absent', icon: '❌', active: 'bg-secondary text-white', inactive: 'bg-white text-[#7A8070] border border-[#DDD8CE] hover:border-secondary' },
  { status: 'pending', label: 'En attente', icon: '⏳', active: 'bg-[#7A8070] text-white', inactive: 'bg-white text-[#7A8070] border border-[#DDD8CE]' },
]

interface Props {
  status: AttendanceStatus | null
  onSelect: (s: AttendanceStatus) => void
  isPending?: boolean
}

export function AttendanceButton({ status, onSelect, isPending }: Props) {
  return (
    <div className={`flex gap-1.5 flex-wrap transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      {BUTTONS.map(b => (
        <button
          key={b.status}
          type="button"
          onClick={() => onSelect(b.status)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${status === b.status ? b.active : b.inactive}`}
        >
          <span>{b.icon}</span>
          <span>{b.label}</span>
        </button>
      ))}
      {isPending && <span className="text-xs text-[#7A8070] self-center animate-pulse">…</span>}
    </div>
  )
}
