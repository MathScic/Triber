'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import JoinAuthForm from './JoinAuthForm'

type Org = { id: string; name: string; type: string }

interface Props {
  code: string
  orgId?: string
  confirmed?: boolean  // true = retour depuis confirmation email → auto-join
}

export default function JoinOrgCard({ code, orgId, confirmed }: Props) {
  const router = useRouter()
  const [org, setOrg] = useState<Org | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoJoining, setAutoJoining] = useState(false)

  useEffect(() => {
    const qs = orgId ? `?org=${orgId}` : ''
    fetch(`/api/join/${code}${qs}`)
      .then(r => r.json())
      .then((d: { org?: Org; error?: string }) => {
        if (d.error) setLoadErr(d.error)
        else setOrg(d.org ?? null)
      })
      .catch(() => setLoadErr('Erreur réseau'))
      .finally(() => setLoading(false))
  }, [code, orgId])

  // Retour après confirmation email → rejoindre automatiquement avec la session fraîche
  useEffect(() => {
    if (!confirmed || !org) return
    setAutoJoining(true)
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setAutoJoining(false); return }
      const qs = orgId ? `?org=${orgId}` : ''
      const resp = await fetch(`/api/join/${code}${qs}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (resp.ok || resp.status === 409) {
        router.push('/home')
      } else {
        setAutoJoining(false)
      }
    })
  }, [confirmed, org, code, orgId, router])

  // Première visite (pas de confirmed) → déconnecter toute session existante
  useEffect(() => {
    if (!confirmed) {
      void createClient().auth.signOut()
    }
  }, [confirmed])

  if (loading || autoJoining) {
    return (
      <div className="bg-white rounded-xl border border-[#D1D1D6] p-8 text-center text-sm text-[#6B7280]">
        {autoJoining ? 'Finalisation de votre adhésion…' : 'Chargement…'}
      </div>
    )
  }

  if (loadErr) {
    return (
      <div className="bg-white rounded-xl border border-[#D1D1D6] p-8 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-[#E8622A] mx-auto mb-2" />
        <p className="font-semibold text-[#E8622A]">{loadErr}</p>
        <p className="text-sm text-[#6B7280]">Ce lien d'invitation est invalide ou a expiré.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[#D1D1D6] p-6 space-y-6">
      <div className="text-center pb-4 border-b border-[#D1D1D6]">
        <p className="text-xs text-[#6B7280] uppercase tracking-widest mb-2">Invitation à rejoindre</p>
        <h2 className="text-2xl font-[800] text-[#1A1F16] font-[family-name:var(--font-barlow)] uppercase tracking-tight">
          {org?.name}
        </h2>
        <p className="text-sm text-[#6B7280] mt-1">
          {org?.type === 'club' ? 'Club sportif' : 'Entreprise'}
        </p>
      </div>

      <JoinAuthForm code={code} orgId={orgId} />
    </div>
  )
}
