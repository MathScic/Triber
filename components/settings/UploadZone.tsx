interface Props {
  src: string | null
  label: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function UploadZone({ src, label, inputRef, onChange }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#7A8070] mb-1.5 font-[family-name:var(--font-nunito)]">{label}</p>
      <div
        onClick={() => inputRef.current?.click()}
        className="w-full h-24 rounded-xl border-2 border-dashed border-[#DDD8CE] flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-colors bg-[#FAF7F2]"
      >
        {src ? <img src={src} className="w-full h-full object-contain" alt={label} /> : <span className="text-2xl text-[#DDD8CE]">+</span>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
    </div>
  )
}
