// Pastille d'état du match — mise à jour dynamiquement via LivePageWrapper
interface Props { status: string | null }

export function MatchStatusBadge({ status }: Props) {
  if (status === 'ongoing') {
    return (
      <span className="inline-flex items-center gap-1.5 border border-red-500 text-red-500 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest font-[family-name:var(--font-nunito)]">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" /> En direct
      </span>
    )
  }
  if (status === 'half_time') {
    return (
      <span className="inline-flex items-center border border-amber-500 text-amber-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest font-[family-name:var(--font-nunito)]">Mi-temps</span>
    )
  }
  if (status === 'finished') {
    return (
      <span className="text-[10px] font-bold text-success uppercase tracking-widest font-[family-name:var(--font-nunito)]">Terminé</span>
    )
  }
  return null
}
