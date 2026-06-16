'use client'

interface Props {
  label: string
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ label, value, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[#1A1F16] font-semibold font-[family-name:var(--font-nunito)] w-32 flex-shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-2.5">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded-xl border border-[#DDD8CE] cursor-pointer p-0.5 bg-white"
        />
        <div className="w-6 h-6 rounded-lg border border-[#DDD8CE] flex-shrink-0" style={{ backgroundColor: value }} />
        <span
          title="Cliquer pour copier"
          onClick={() => navigator.clipboard?.writeText(value)}
          className="text-xs font-mono text-[#7A8070] bg-[#F0EBE1] px-2 py-1 rounded-lg cursor-pointer select-all hover:bg-[#DDD8CE] transition-colors"
        >
          {value.toUpperCase()}
        </span>
      </div>
    </div>
  )
}
