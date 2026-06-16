'use client'

import { useState, useEffect, useRef } from 'react'
import { useBranding } from '@/lib/hooks/useBranding'
import { injectTheme } from '@/lib/utils/theme'
import { ColorPicker } from './ColorPicker'
import { Button } from '@/components/ui/button'

interface UploadZoneProps {
  src: string | null
  label: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function UploadZone({ src, label, inputRef, onChange }: UploadZoneProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#7A8070] mb-1.5 font-[family-name:var(--font-nunito)]">{label}</p>
      <div onClick={() => inputRef.current?.click()}
        className="w-full h-24 rounded-xl border-2 border-dashed border-[#DDD8CE] flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-colors bg-[#FAF7F2]">
        {src ? <img src={src} className="w-full h-full object-contain" alt={label} /> : <span className="text-2xl text-[#DDD8CE]">+</span>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
    </div>
  )
}

export function BrandingForm() {
  const [primary, setPrimary] = useState('#2A9D4E')
  const [secondary, setSecondary] = useState('#E8622A')
  const [slogan, setSlogan] = useState('')
  const [logoSrc, setLogoSrc] = useState<string | null>(null)
  const [coverSrc, setCoverSrc] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const { getBranding, saveBranding, uploadLogo, uploadCover, error } = useBranding()

  useEffect(() => {
    getBranding().then(b => {
      if (!b) return
      setPrimary(b.primary_color); setSecondary(b.secondary_color)
      setSlogan(b.slogan ?? ''); setLogoSrc(b.logo_url); setCoverSrc(b.cover_url)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pickFile = (setter: (f: File) => void, preview: (s: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]; if (!f) return
      setter(f); preview(URL.createObjectURL(f))
    }

  const handleSave = async () => {
    setSaving(true); setSuccess(false)
    try {
      let logo = logoSrc, cover = coverSrc
      if (logoFile) logo = await uploadLogo(logoFile)
      if (coverFile) cover = await uploadCover(coverFile)
      const ok = await saveBranding({ primary_color: primary, secondary_color: secondary, slogan: slogan || null, logo_url: logo ?? null, cover_url: cover ?? null })
      if (ok) setSuccess(true)
    } finally {
      setSaving(false)
    }
  }

  console.log('saving state:', saving)

  return (
    <div className="bg-white rounded-2xl border border-[#DDD8CE] shadow-sm p-5 space-y-5">
      <h2 className="font-[700] text-[#1A1F16] text-base uppercase tracking-tight font-[family-name:var(--font-barlow)]">
        Personnalisation
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <UploadZone src={logoSrc} label="Logo" inputRef={logoRef} onChange={pickFile(setLogoFile, setLogoSrc)} />
        <UploadZone src={coverSrc} label="Couverture" inputRef={coverRef} onChange={pickFile(setCoverFile, setCoverSrc)} />
      </div>
      <div className="space-y-3">
        <ColorPicker label="Couleur primaire" value={primary} onChange={setPrimary} />
        <ColorPicker label="Couleur secondaire" value={secondary} onChange={setSecondary} />
      </div>
      <div>
        <input type="text" maxLength={60} value={slogan} onChange={e => setSlogan(e.target.value)}
          placeholder="ex : Ensemble, on est plus forts"
          className="w-full h-10 px-3 rounded-xl border border-[#DDD8CE] text-sm text-[#1A1F16] bg-[#FAF7F2] focus:outline-none focus:border-primary font-[family-name:var(--font-nunito)]" />
        <p className="text-right text-xs text-[#7A8070] mt-1">{slogan.length}/60</p>
      </div>
      {error && <p className="text-xs text-[#E8622A] bg-[#FDF0EB] rounded-lg px-3 py-2">{error}</p>}
      {success && <p className="text-xs text-primary bg-primary-light rounded-lg px-3 py-2">Branding sauvegardé ✓</p>}
      {/* saving state: {String(saving)} — affiché en console ci-dessous */}
      <div className="flex gap-3">
        <Button variant="outline" type="button"
          onClick={() => injectTheme(primary, secondary)}>
          Aperçu en direct
        </Button>
        <Button type="button" disabled={saving === true} onClick={() => { void handleSave() }}>
          {saving ? 'Sauvegarde…' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  )
}
