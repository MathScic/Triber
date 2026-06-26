'use client'

import { Check, X, Clock } from 'lucide-react'
import type { AttendanceStatus } from '@/lib/hooks/useEvents'

type ButtonConfig = {
  status: AttendanceStatus
  label: string
  Icon: React.ComponentType<{ className?: string }>
  active: string
  inactive: string
}

const BUTTONS: ButtonConfig[] = [
  {
    status: 'confirmed',
    label: 'Présent',
    Icon: Check,
    active: 'bg-[#2A9D4E] text-white',
    inactive: 'bg-white text-[#6B7280] border border-[#D1D1D6] hover:border-[#2A9D4E] hover:text-[#2A9D4E]',
  },
  {
    status: 'declined',
    label: 'Absent',
    Icon: X,
    active: 'bg-[#E8622A] text-white',
    inactive: 'bg-white text-[#6B7280] border border-[#D1D1D6] hover:border-[#E8622A] hover:text-[#E8622A]',
  },
  {
    status: 'pending',
    label: 'En attente',
    Icon: Clock,
    active: 'bg-[#6B7280] text-white',
    inactive: 'bg-white text-[#6B7280] border border-[#D1D1D6]',
  },
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
          <b.Icon className="w-3 h-3" />
          <span>{b.label}</span>
        </button>
      ))}
      {isPending && <span className="text-xs text-[#6B7280] self-center animate-pulse">…</span>}
    </div>
  )
}
