'use client'

import { useState } from 'react'
import { Download, ShieldAlert } from 'lucide-react'
import { DeleteAccountModal } from '@/components/profile/DeleteAccountModal'

// Section "Confidentialité" — droits RGPD accessibles depuis Mon profil :
// export des données personnelles (portabilité) et suppression de compte (oubli)
export function PrivacySection() {
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleExport() {
    setExporting(true)
    setExportError(null)
    try {
      const res = await fetch('/api/account/export')
      if (!res.ok) { setExportError('Export impossible pour le moment.'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mes-donnees-triber.json'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-brand-border shadow-sm p-4 space-y-4 font-[family-name:var(--font-nunito)]">
      <h2 className="font-[800] text-brand-dark text-base uppercase tracking-tight font-[family-name:var(--font-barlow)]">
        Confidentialité
      </h2>

      <button
        onClick={() => void handleExport()}
        disabled={exporting}
        className="flex items-center gap-2 w-full h-11 px-4 rounded-xl border border-brand-border bg-brand-bg text-sm font-semibold text-brand-dark hover:bg-brand-sand transition-colors disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {exporting ? 'Export en cours…' : 'Exporter mes données'}
      </button>
      {exportError && <p className="text-xs text-brand-danger">{exportError}</p>}

      <div className="border border-brand-danger rounded-xl p-3 space-y-2">
        <p className="text-xs font-semibold text-brand-danger flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" /> Zone de danger
        </p>
        <p className="text-xs text-brand-muted">
          Supprime définitivement votre compte et vos données personnelles.
        </p>
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full h-10 rounded-xl border border-brand-danger text-sm font-semibold text-brand-danger hover:bg-brand-danger hover:text-white transition-colors"
        >
          Supprimer mon compte
        </button>
      </div>

      {showConfirm && <DeleteAccountModal onCancel={() => setShowConfirm(false)} />}
    </section>
  )
}
