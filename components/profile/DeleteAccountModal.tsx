'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

interface Props {
  onCancel: () => void
}

// Modale de confirmation — suppression de compte (RGPD, droit à l'oubli)
// Action irréversible : le bouton reste désactivé tant que "SUPPRIMER" n'est pas saisi
export function DeleteAccountModal({ onCancel }: Props) {
  const { logout } = useAuth()
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: confirmText }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { setError(data.error ?? 'Erreur inattendue'); setDeleting(false); return }
      await logout()
    } catch {
      setError('Erreur réseau')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
        <h3 className="font-bold text-brand-dark text-base">Supprimer votre compte ?</h3>
        <p className="text-sm text-brand-muted">
          Cette action est irréversible. Tapez <strong>SUPPRIMER</strong> pour confirmer.
        </p>
        <input
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-brand-border text-sm focus:outline-none focus:border-brand-danger"
          placeholder="SUPPRIMER"
        />
        {error && <p className="text-xs text-brand-danger">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl border border-brand-border text-sm font-semibold text-brand-dark hover:bg-brand-sand transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => void handleDelete()}
            disabled={confirmText !== 'SUPPRIMER' || deleting}
            className="flex-1 h-10 rounded-xl bg-brand-danger text-white text-sm font-semibold hover:opacity-90 transition-colors disabled:opacity-40"
          >
            {deleting ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  )
}
