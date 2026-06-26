interface Props {
  src: string | null
  label: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function UploadZone({ src, label, inputRef, onChange }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#6B7280] mb-1.5 font-[family-name:var(--font-nunito)]">{label}</p>
      <div
        onClick={() => inputRef.current?.click()}
        className="w-full h-24 rounded-xl border-2 border-dashed border-[#D1D1D6] flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-colors bg-[#F4F4F6]"
      >
        {src ? <img src={src} className="w-full h-full object-contain" alt={label} /> : <span className="text-2xl text-[#D1D1D6]">+</span>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
    </div>
  )
}
