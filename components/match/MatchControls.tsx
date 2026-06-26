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
      <button
        onClick={() => onControl('start')}
        disabled={loading}
        className="w-full h-12 rounded-xl bg-[#2A9D4E] text-white font-[800] text-sm uppercase tracking-wide font-[family-name:var(--font-barlow)] hover:bg-[#238742] transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
      >
        <Play size={16} weight="fill" /> Démarrer le match
      </button>
    )
  }

  return (
    <button
      onClick={() => onControl('end')}
      disabled={loading}
      className="w-full h-12 rounded-xl bg-red-600 text-white font-[800] text-sm uppercase tracking-wide font-[family-name:var(--font-barlow)] hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
    >
      <Square size={16} weight="fill" /> Terminer le match
    </button>
  )
}
