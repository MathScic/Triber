'use client'

import { useState, useEffect, useRef } from 'react'
import { useBranding } from '@/lib/hooks/useBranding'
import { injectTheme } from '@/lib/utils/theme'
import { useBrandingContext } from '@/lib/contexts/BrandingContext'
import { ColorPicker } from './ColorPicker'
import { UploadZone } from './UploadZone'
import { Button } from '@/components/ui/button'

export function BrandingForm() {
  const { setPrimaryColor } = useBrandingContext()
  const [orgName, setOrgName] = useState('')
  const [primary, setPrimary] = useState('#1E5C38')
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
      setOrgName(b.name)
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
      const ok = await saveBranding({
        name: orgName.trim() || undefined,
        primary_color: primary, secondary_color: secondary,
        slogan: slogan || null, logo_url: logo ?? null, cover_url: cover ?? null,
      })
      if (ok) { setSuccess(true); injectTheme(primary, secondary); setPrimaryColor(primary) }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-5 space-y-5">
      <h2 className="font-[700] text-brand-dark text-base uppercase tracking-tight font-[family-name:var(--font-barlow)]">
        Personnalisation
      </h2>

      {/* Nom de l'organisation */}
      <div>
        <p className="text-xs font-semibold text-[#6B7280] mb-1.5 font-[family-name:var(--font-nunito)]">Nom de l'organisation</p>
        <input
          type="text" maxLength={80} value={orgName}
          onChange={e => setOrgName(e.target.value)}
          placeholder="ex : FC Normandie"
          className="w-full h-10 px-3 rounded-xl border border-[#D1D1D6] text-sm text-brand-dark bg-brand-bg focus:outline-none focus:border-primary font-[family-name:var(--font-nunito)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <UploadZone src={logoSrc} label="Logo" inputRef={logoRef} onChange={pickFile(setLogoFile, setLogoSrc)} />
        <UploadZone src={coverSrc} label="Couverture" inputRef={coverRef} onChange={pickFile(setCoverFile, setCoverSrc)} />
      </div>

      <div className="space-y-3">
        <ColorPicker label="Couleur primaire" value={primary} onChange={v => { setPrimary(v); setPrimaryColor(v); injectTheme(v, secondary) }} />
        <ColorPicker label="Couleur secondaire" value={secondary} onChange={v => { setSecondary(v); injectTheme(primary, v) }} />
      </div>

      <div>
        <input type="text" maxLength={60} value={slogan} onChange={e => setSlogan(e.target.value)}
          placeholder="ex : Ensemble, on est plus forts"
          className="w-full h-10 px-3 rounded-xl border border-[#D1D1D6] text-sm text-brand-dark bg-brand-bg focus:outline-none focus:border-primary font-[family-name:var(--font-nunito)]" />
        <p className="text-right text-xs text-[#6B7280] mt-1">{slogan.length}/60</p>
      </div>

      {error && <p className="text-xs text-secondary bg-secondary-light rounded-lg px-3 py-2">{error}</p>}
      {success && <p className="text-xs text-primary bg-primary-light rounded-lg px-3 py-2">Paramètres sauvegardés ✓</p>}

      <Button className="w-full" type="button" disabled={saving} onClick={() => { void handleSave() }}>
        {saving ? 'Sauvegarde…' : 'Sauvegarder'}
      </Button>
    </div>
  )
}
