'use client'

import { useLiveMatchPublic } from '@/lib/hooks/useLiveMatchPublic'
import { ScoreHeader } from '@/components/match/ScoreHeader'
import { LiveBand } from '@/components/match/LiveBand'
import { LineupSection } from '@/components/match/LineupSection'
import { Timeline } from '@/components/match/Timeline'

interface Props {
  eventId: string
  orgName: string
  opponent: string | null
  isHome: boolean
  startedAt: string | null
  pausedAt: string | null
  totalPausedSeconds: number
  status: string | null
  orgLogoUrl?: string | null
}

export function LiveMatchClient({ eventId, orgName, opponent, isHome, startedAt, pausedAt, totalPausedSeconds, status, orgLogoUrl }: Props) {
  const { ownGoals, oppGoals, actions, players } = useLiveMatchPublic(eventId)

  const homeTeam = isHome ? orgName : (opponent ?? 'Adversaire')
  const awayTeam = isHome ? (opponent ?? 'Adversaire') : orgName
  const scoreHome = isHome ? ownGoals : oppGoals
  const scoreAway = isHome ? oppGoals : ownGoals

  return (
    <div className="min-h-screen bg-[#F4F4F6]">
      <ScoreHeader
        homeTeam={homeTeam} awayTeam={awayTeam} scoreHome={scoreHome} scoreAway={scoreAway}
        homeLogoUrl={isHome ? orgLogoUrl : null} awayLogoUrl={isHome ? null : orgLogoUrl}
      />
      <LiveBand startedAt={startedAt} pausedAt={pausedAt} totalPausedSeconds={totalPausedSeconds} status={status} />

      <div className="px-5 pt-5 pb-24 max-w-lg mx-auto">
        <LineupSection players={players} />

        <p className="text-[11px] font-bold text-[#6B7280] tracking-widest mb-4 font-[family-name:var(--font-nunito)]">
          ACTIONS DU MATCH
        </p>
        <Timeline actions={actions} players={players} opponent={opponent ?? 'Adversaire'} />
      </div>
    </div>
  )
}
