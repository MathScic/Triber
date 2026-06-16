'use client'

type OrgType = 'club' | 'enterprise'

interface Props {
  onSelect: (type: OrgType) => void
}

const TYPES = [
  {
    value: 'club' as OrgType,
    icon: '⚽',
    label: 'Club / Association',
    desc: 'Sports, loisirs, associations',
  },
  {
    value: 'enterprise' as OrgType,
    icon: '🏢',
    label: 'Entreprise',
    desc: 'PME, équipes commerciales',
  },
]

export function StepType({ onSelect }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-[800] text-[#1A1F16] uppercase tracking-tight mb-1">
          Bienvenue sur Triber 👋
        </h2>
        <p className="text-sm text-[#7A8070]">
          Quel type d'organisation gérez-vous ?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TYPES.map(({ value, icon, label, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className="rounded-2xl border-2 border-[#DDD8CE] bg-white p-5 text-left hover:border-[#2A9D4E] hover:bg-[#E8F5EE] active:scale-95 transition-all cursor-pointer"
          >
            <span className="text-3xl block mb-3">{icon}</span>
            <span className="block text-sm font-bold text-[#1A1F16]">{label}</span>
            <span className="text-xs text-[#7A8070] mt-0.5 block">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
