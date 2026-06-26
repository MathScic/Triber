'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, X, Save, Check, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  orgId: string
}

function extractSrc(input: string): string {
  const match = input.match(/src=["']([^"']+)["']/)
  return match ? match[1] : input.trim()
}

export function ScoreEncoSettings({ orgId }: Props) {
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    createClient()
      .from('organizations')
      .select('scoreenco_url')
      .eq('id', orgId)
      .maybeSingle()
      .then(({ data }) => {
        setUrl((data as { scoreenco_url: string | null } | null)?.scoreenco_url ?? '')
      })
  }, [orgId])

  const save = async () => {
    setSaving(true)
    setError(null)
    const clean = url ? extractSrc(url) : null
    const { error: supaErr } = await createClient()
      .from('organizations')
      .update({ scoreenco_url: clean })
      .eq('id', orgId)
    setSaving(false)
    if (supaErr) {
      setError('Erreur lors de la sauvegarde. Réessaie.')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const remove = async () => {
    setUrl('')
    setError(null)
    await createClient().from('organizations').update({ scoreenco_url: null }).eq('id', orgId)
  }

  const cleanUrl = url ? extractSrc(url) : ''

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">
          URL Score'n'co de ton championnat
        </label>
        <textarea
          value={url}
          onChange={e => { setUrl(e.target.value); setError(null) }}
          placeholder={'https://app.scorenco.com/competitions/...\n\nou colle le code <iframe ...> si tu es admin Score\'n\'co'}
          rows={3}
          className="mt-1.5 w-full text-sm border border-[#D1D1D6] rounded-xl px-3 py-2.5 bg-[#F4F4F6] focus:outline-none focus:border-[#2A9D4E] resize-none font-[family-name:var(--font-nunito)]"
        />
        <p className="text-[10px] text-[#6B7280] mt-1 font-[family-name:var(--font-nunito)]">
          Colle l'URL publique de la page championnat. Sur l'accueil, c'est le classement saisi manuellement qui s'affiche — l'URL apparaît comme lien externe vers Score'n'co.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-[#E8622A] bg-[#FDF0EB] rounded-xl px-3 py-2 font-[family-name:var(--font-nunito)]">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {cleanUrl && cleanUrl.startsWith('http') ? (
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#2A9D4E] font-semibold hover:underline font-[family-name:var(--font-nunito)]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Tester le lien
          </a>
        ) : (
          <a
            href="https://app.scorenco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#2A9D4E] font-semibold hover:underline font-[family-name:var(--font-nunito)]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Aller sur Score'n'co
          </a>
        )}

        <div className="flex-1" />

        {url && (
          <button
            onClick={() => void remove()}
            className="flex items-center gap-1 text-xs text-[#E8622A] font-semibold hover:opacity-80 transition-opacity font-[family-name:var(--font-nunito)]"
          >
            <X className="w-3.5 h-3.5" />
            Retirer
          </button>
        )}

        <button
          onClick={() => void save()}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#E8622A] text-white text-xs font-semibold rounded-xl hover:bg-[#d4571f] transition-colors disabled:opacity-60 font-[family-name:var(--font-nunito)]"
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? 'Enregistré ✓' : saving ? 'Sauvegarde…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
