'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function UpgradeSection() {
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleUpgrade() {
    if (!consent) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/subscribe', { method: 'POST' })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) {
        router.push(data.url)
      } else {
        setError(data.error ?? 'Erreur inattendue')
        setLoading(false)
      }
    } catch {
      setError('Erreur réseau')
      setLoading(false)
    }
  }

  return (
    <section className="bg-white rounded-xl border border-success shadow-sm p-4 space-y-4 font-[family-name:var(--font-nunito)]">
      <div>
        <h2 className="font-[800] text-brand-dark text-base uppercase tracking-tight font-[family-name:var(--font-barlow)]">
          Passer au Plan Club
        </h2>
        <p className="text-xs text-[#6B7280] mt-1">
          Membres illimités · Toutes les fonctionnalités · <strong>11,99€/mois</strong>
        </p>
      </div>

      {/* Avantages */}
      <ul className="space-y-1.5 text-sm text-brand-dark">
        {['Membres illimités (gratuit : 20 max)', 'Gestion financière complète', 'Cotisations en ligne via Stripe', 'Statistiques avancées & classements'].map(a => (
          <li key={a} className="flex items-start gap-2">
            <span className="text-success font-bold mt-0.5">✓</span>
            <span>{a}</span>
          </li>
        ))}
      </ul>

      {/* Consentement 1.5% — obligatoire par CLAUDE.md */}
      <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-brand-border bg-brand-bg p-3">
        <input
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-success flex-shrink-0"
        />
        <span className="text-[13px] text-brand-dark leading-snug">
          Je comprends que Triber perçoit une <strong>commission de 1,5%</strong> sur les cotisations encaissées
          via la plateforme, en plus de l&apos;abonnement mensuel de 11,99€.
          Ce montant est prélevé automatiquement à chaque transaction.
        </span>
      </label>

      {error && (
        <p className="text-sm text-secondary bg-secondary-light rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        onClick={handleUpgrade}
        disabled={!consent || loading}
        className="w-full bg-success text-white font-[700] text-sm py-3.5 rounded-xl uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#238f44] transition-colors"
      >
        {loading ? 'Redirection…' : 'Passer au Plan Club — 11,99€/mois →'}
      </button>

      <p className="text-[11px] text-[#9CA3AF] text-center">
        Paiement sécurisé par Stripe · Résiliable à tout moment
      </p>
    </section>
  )
}
