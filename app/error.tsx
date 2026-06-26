'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-[#F4F4F6] flex flex-col items-center justify-center px-6 text-center">
      <div className="space-y-6 max-w-sm">
        <div className="flex flex-col items-center gap-1">
          <span className="text-6xl font-[800] text-[#E8622A] font-['Barlow_Condensed',sans-serif] tracking-tight">500</span>
          <span className="text-sm font-bold text-[#1A1F16] tracking-widest uppercase font-['Nunito',sans-serif]">Erreur inattendue</span>
        </div>
        <div className="w-12 h-1 bg-[#E8622A] rounded-full mx-auto" />
        <p className="text-sm text-[#6B7280] leading-relaxed font-['Nunito',sans-serif]">
          Quelque chose s&apos;est mal passé de notre côté.<br />
          Notre équipe a été notifiée. Vous pouvez réessayer ou revenir à l&apos;accueil.
        </p>
        {error.digest && (
          <p className="text-[10px] text-[#9CA3AF] font-mono bg-white border border-[#D1D1D6] rounded-lg px-3 py-1.5">
            Réf : {error.digest}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <button onClick={reset}
            className="px-6 py-3 bg-[#E8622A] text-white text-sm font-semibold rounded-xl hover:bg-[#d4571f] transition-colors font-['Nunito',sans-serif]">
            Réessayer
          </button>
          <Link href="/home"
            className="px-6 py-3 bg-white border border-[#D1D1D6] text-[#1A1F16] text-sm font-semibold rounded-xl hover:bg-[#F4F4F6] transition-colors font-['Nunito',sans-serif]">
            Retour à l&apos;accueil
          </Link>
        </div>
        <p className="text-xs text-[#9CA3AF] font-['Nunito',sans-serif]">Triber — Gestion de club simplifiée</p>
      </div>
    </div>
  )
}
