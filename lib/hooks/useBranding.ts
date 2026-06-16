'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type OrgBranding = {
  id: string
  name: string
  type: string
  plan: string
  logo_url: string | null
  cover_url: string | null
  primary_color: string
  secondary_color: string
  slogan: string | null
}

type SaveInput = Partial<Pick<OrgBranding, 'logo_url' | 'cover_url' | 'primary_color' | 'secondary_color' | 'slogan'>>

export function useBranding() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getOrgId = async (): Promise<string | null> => {
    const s = createClient()
    const { data: { user } } = await s.auth.getUser()
    if (!user) return null
    const { data } = await s.from('organization_members')
      .select('organization_id').eq('user_id', user.id).maybeSingle()
    return (data?.organization_id as string) ?? null
  }

  const getBranding = async (): Promise<OrgBranding | null> => {
    const orgId = await getOrgId()
    if (!orgId) return null
    const { data } = await createClient()
      .from('organizations')
      .select('id, name, type, plan, logo_url, cover_url, primary_color, secondary_color, slogan')
      .eq('id', orgId)
      .maybeSingle()
    return data as OrgBranding | null
  }

  const saveBranding = async (input: SaveInput): Promise<boolean> => {
    setLoading(true); setError(null)
    const orgId = await getOrgId()
    if (!orgId) { setError('Organisation introuvable.'); setLoading(false); return false }
    const { error: err } = await createClient().from('organizations').update(input).eq('id', orgId)
    setLoading(false)
    if (err) { setError('Erreur lors de la sauvegarde du branding.'); return false }
    return true
  }

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    setLoading(true)
    const orgId = await getOrgId()
    if (!orgId) { setLoading(false); return null }
    const s = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const filePath = `${orgId}/${path}.${ext}`
    const { error: err } = await s.storage.from('organizations').upload(filePath, file, { upsert: true })
    if (err) { setError("Erreur lors de l'envoi du fichier."); setLoading(false); return null }
    const { data: { publicUrl } } = s.storage.from('organizations').getPublicUrl(filePath)
    setLoading(false)
    return publicUrl
  }

  const uploadLogo = (file: File) => uploadFile(file, 'logo')
  const uploadCover = (file: File) => uploadFile(file, 'cover')

  return { getBranding, saveBranding, uploadLogo, uploadCover, loading, error }
}
