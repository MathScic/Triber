'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function ProfileForm({ userId }: { userId: string }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const s = createClient()
    Promise.all([
      s.from('profiles').select('full_name').eq('id', userId).maybeSingle(),
      s.auth.getUser(),
    ]).then(([{ data: p }, { data: { user } }]) => {
      setFullName((p?.full_name as string) ?? '')
      setEmail(user?.email ?? '')
      setLoading(false)
    })
  }, [userId])

  const save = async () => {
    if (!fullName.trim()) return
    setSaving(true)
    await createClient().from('profiles').upsert(
      { id: userId, full_name: fullName.trim(), updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return <div className="bg-white rounded-2xl border border-[#D1D1D6] h-32 animate-pulse" />

  return (
    <div className="bg-white rounded-2xl border border-[#D1D1D6] p-6 space-y-4">
      <h2 className="text-base font-[700] text-brand-dark font-[family-name:var(--font-barlow)] uppercase tracking-wide">
        Informations personnelles
      </h2>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Prénom et nom</Label>
          <Input
            id="profile-name" value={fullName}
            onChange={e => { setFullName(e.target.value); setSaved(false) }}
            placeholder="Jean Dupont"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={email} disabled className="opacity-60 cursor-not-allowed" />
          <p className="text-xs text-[#9CA3AF] font-[family-name:var(--font-nunito)]">
            L&apos;email ne peut pas être modifié ici.
          </p>
        </div>
      </div>

      <Button onClick={save} disabled={saving || !fullName.trim()} className="gap-2">
        {saved ? <><Check className="w-4 h-4" /> Enregistré</> : saving ? 'Enregistrement…' : 'Enregistrer'}
      </Button>
    </div>
  )
}
