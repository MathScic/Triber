type MatchStatus = 'upcoming' | 'ongoing' | 'half_time' | 'finished' | null

interface Props {
  status: MatchStatus
  loading: boolean
  onControl: (action: 'start' | 'half_time' | 'resume' | 'end') => void
}

export function MatchControls({ status, loading, onControl }: Props) {
  if (status === 'finished') return null

  return (
    <div className="flex gap-2">
      {(!status || status === 'upcoming') && (
        <button
          onClick={() => onControl('start')}
          disabled={loading}
          className="flex-1 h-12 rounded-xl bg-[#2A9D4E] text-white font-[800] text-sm uppercase tracking-wide font-[family-name:var(--font-barlow)] hover:bg-[#238742] transition-colors disabled:opacity-50 shadow-sm"
        >
          ▶ Démarrer le match
        </button>
      )}

      {status === 'ongoing' && (
        <>
          <button
            onClick={() => onControl('half_time')}
            disabled={loading}
            className="flex-1 h-12 rounded-xl bg-[#E8622A] text-white font-[800] text-sm uppercase tracking-wide font-[family-name:var(--font-barlow)] hover:bg-[#d4541e] transition-colors disabled:opacity-50 shadow-sm"
          >
            ⏸ Mi-temps (45')
          </button>
          <button
            onClick={() => onControl('end')}
            disabled={loading}
            className="h-12 px-4 rounded-xl bg-[#1A1F16] text-white font-[800] text-sm uppercase tracking-wide font-[family-name:var(--font-barlow)] hover:bg-black transition-colors disabled:opacity-50 shadow-sm"
          >
            ■ Fin
          </button>
        </>
      )}

      {status === 'half_time' && (
        <button
          onClick={() => onControl('resume')}
          disabled={loading}
          className="flex-1 h-12 rounded-xl bg-[#2A9D4E] text-white font-[800] text-sm uppercase tracking-wide font-[family-name:var(--font-barlow)] hover:bg-[#238742] transition-colors disabled:opacity-50 shadow-sm"
        >
          ▶ Reprendre (2e mi-temps)
        </button>
      )}
    </div>
  )
}
