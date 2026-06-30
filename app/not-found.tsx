import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-6 text-center">
      <div className="space-y-6 max-w-sm">
        <div className="flex flex-col items-center gap-1">
          <span className="text-6xl font-[800] text-success font-['Barlow_Condensed',sans-serif] tracking-tight">404</span>
          <span className="text-sm font-bold text-brand-dark tracking-widest uppercase font-['Nunito',sans-serif]">Page introuvable</span>
        </div>
        <div className="w-12 h-1 bg-success rounded-full mx-auto" />
        <p className="text-sm text-[#6B7280] leading-relaxed font-['Nunito',sans-serif]">
          Cette page n&apos;existe pas ou a été déplacée.<br />
          Pas de panique, votre club vous attend juste en dessous.
        </p>
        <Link href="/home"
          className="inline-flex items-center gap-2 px-6 py-3 bg-success text-white text-sm font-semibold rounded-xl hover:bg-[#238742] transition-colors font-['Nunito',sans-serif]">
          Retour à l&apos;accueil
        </Link>
        <p className="text-xs text-[#9CA3AF] font-['Nunito',sans-serif]">Triber — Gestion de club simplifiée</p>
      </div>
    </div>
  )
}
