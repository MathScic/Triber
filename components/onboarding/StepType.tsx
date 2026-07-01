'use client'

import { Shield, Building2 } from 'lucide-react'

type OrgType = 'club' | 'enterprise'

interface Props {
  onSelect: (type: OrgType) => void
}

const TYPES = [
  {
    value: 'club' as OrgType,
    Icon: Shield,
    label: 'Club / Association',
    desc: 'Sports, loisirs, associations',
  },
  {
    value: 'enterprise' as OrgType,
    Icon: Building2,
    label: 'Entreprise',
    desc: 'PME, équipes commerciales',
  },
]

export function StepType({ onSelect }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-[800] text-brand-dark uppercase tracking-tight mb-1">
          Bienvenue sur Triber
        </h2>
        <p className="text-sm text-[#6B7280]">
          Quel type d&apos;organisation gérez-vous ?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TYPES.map(({ value, Icon, label, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className="rounded-2xl border-2 border-[#D1D1D6] bg-white p-5 text-left hover:border-success hover:bg-primary-light active:scale-95 transition-all cursor-pointer"
          >
            <Icon className="w-8 h-8 text-success mb-3" />
            <span className="block text-sm font-bold text-brand-dark">{label}</span>
            <span className="text-xs text-[#6B7280] mt-0.5 block">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
