'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'

interface Props {
  onUpload: (file: File) => Promise<void>
}

export function MediaUploadButton({ onUpload }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    await onUpload(file)
    setLoading(false)
    if (ref.current) ref.current.value = ''
  }

  return (
    <>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <button
        onClick={() => ref.current?.click()}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#E8622A] text-white text-sm font-semibold rounded-xl hover:bg-[#d4571f] transition-colors disabled:opacity-60 font-[family-name:var(--font-nunito)]"
      >
        <Upload className="w-4 h-4" />
        {loading ? 'Envoi…' : 'Ajouter'}
      </button>
    </>
  )
}
