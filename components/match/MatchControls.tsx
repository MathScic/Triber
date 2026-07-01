import { Play, Square } from '@phosphor-icons/react'

type MatchStatus = 'upcoming' | 'ongoing' | 'half_time' | 'finished' | null

interface Props {
  status: MatchStatus
  loading: boolean
  onControl: (action: 'start' | 'half_time' | 'resume' | 'end') => void
}

export function MatchControls({ status, loading, onControl }: Props) {
  if (status === 'finished') return null

  if (!status || status === 'upcoming') {
    return (
      <div className="flex justify-center">
        <button onClick={() => onControl('start')} disabled={loading}
          className="flex items-center gap-2 h-10 px-8 rounded-xl bg-success text-white text-sm font-[800] uppercase tracking-wide font-[family-name:var(--font-barlow)] hover:bg-success/90 transition-colors disabled:opacity-50">
          <Play size={14} weight="fill" /> Démarrer le match
        </button>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <button onClick={() => onControl('end')} disabled={loading}
        className="flex items-center gap-2 h-10 px-8 rounded-xl border border-red-500 text-red-500 text-sm font-[800] uppercase tracking-wide font-[family-name:var(--font-barlow)] hover:bg-red-500/10 transition-colors disabled:opacity-50">
        <Square size={14} weight="fill" /> Terminer le match
      </button>
    </div>
  )
}
