'use client'

interface Props {
  label: string
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ label, value, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-brand-dark font-semibold font-[family-name:var(--font-nunito)] w-32 flex-shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-2.5">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded-xl border border-[#D1D1D6] cursor-pointer p-0.5 bg-white"
        />
        <div className="w-6 h-6 rounded-lg border border-[#D1D1D6] flex-shrink-0" style={{ backgroundColor: value }} />
        <span
          title="Cliquer pour copier"
          onClick={() => navigator.clipboard?.writeText(value)}
          className="text-xs font-mono text-[#6B7280] bg-[#E8E8EA] px-2 py-1 rounded-lg cursor-pointer select-all hover:bg-[#D1D1D6] transition-colors"
        >
          {value.toUpperCase()}
        </span>
      </div>
    </div>
  )
}
