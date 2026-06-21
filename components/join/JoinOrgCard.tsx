'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import JoinAuthForm from './JoinAuthForm'

type Org = { id: string; name: string; type: string }

export default function JoinOrgCard({ code }: { code: string }) {
  const router = useRouter()
  const [org, setOrg] = useState<Org | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const [joining, setJoining] = useState(false)
  const [joinErr, setJoinErr] = useState<string | null>(null)

  useEffect(() => {
    // Charge les infos de l'organisation via le code
    fetch(`/api/join/${code}`)
      .then(r => r.json())
      .then((d: { org?: Org; error?: string }) => {
        if (d.error) setLoadErr(d.error)
        else setOrg(d.org ?? null)
      })
      .catch(() => setLoadErr('Erreur réseau'))
      .finally(() => setLoading(false))

    // Détecte la session (y compris après retour depuis la confirmation email)
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => setHasSession(!!session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setHasSession(!!session)
    })
    return () => subscription.unsubscribe()
  }, [code])

  const join = async () => {
    setJoining(true); setJoinErr(null)
    const { data: { session } } = await createClient().auth.getSession()
    const resp = await fetch(`/api/join/${code}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
    })
    const d = await resp.json() as { success?: boolean; error?: string }
    if (d.success) router.push('/home')
    else { setJoinErr(d.error ?? 'Erreur serveur'); setJoining(false) }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#DDD8CE] p-8 text-center text-sm text-[#7A8070]">
        Chargement…
      </div>
    )
  }

  if (loadErr) {
    return (
      <div className="bg-white rounded-2xl border border-[#DDD8CE] p-8 text-center space-y-2">
        <p className="text-3xl">❌</p>
        <p className="font-semibold text-[#E8622A]">{loadErr}</p>
        <p className="text-sm text-[#7A8070]">Ce lien d'invitation est invalide ou a expiré.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#DDD8CE] p-6 space-y-6">
      {/* Nom de l'organisation */}
      <div className="text-center pb-4 border-b border-[#DDD8CE]">
        <p className="text-xs text-[#7A8070] uppercase tracking-widest mb-2">Invitation à rejoindre</p>
        <h2 className="text-2xl font-[800] text-[#1A1F16] font-[family-name:var(--font-barlow)] uppercase tracking-tight">
          {org?.name}
        </h2>
        <p className="text-sm text-[#7A8070] mt-1">
          {org?.type === 'club' ? '⚽ Club sportif' : '🏢 Entreprise'}
        </p>
      </div>

      {/* Non connecté → formulaire auth inline */}
      {hasSession === false && <JoinAuthForm code={code} />}

      {/* Connecté → bouton rejoindre */}
      {hasSession === true && (
        <div className="space-y-3">
          {joinErr && (
            <p className="text-sm text-[#E8622A] bg-[#FDF0EB] rounded-xl px-3 py-2">{joinErr}</p>
          )}
          <button
            onClick={join}
            disabled={joining}
            className="w-full h-12 bg-[#2A9D4E] text-white font-[800] rounded-xl font-[family-name:var(--font-barlow)] uppercase tracking-wide text-sm hover:bg-[#238742] transition-colors disabled:opacity-60"
          >
            {joining ? 'Adhésion en cours…' : `Rejoindre ${org?.name ?? 'cette organisation'}`}
          </button>
        </div>
      )}
    </div>
  )
}
