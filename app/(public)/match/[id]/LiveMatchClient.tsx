'use client'

import { useState } from 'react'
import { useLiveMatchPublic } from '@/lib/hooks/useLiveMatchPublic'
import { ScoreHeader } from '@/components/match/ScoreHeader'
import { LineupSection } from '@/components/match/LineupSection'
import { Timeline } from '@/components/match/Timeline'

type Tab = 'actions' | 'compo'

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

const TABS: { key: Tab; label: string }[] = [
  { key: 'actions', label: 'Actions du match' },
  { key: 'compo',   label: 'Composition' },
]

export function LiveMatchClient({ eventId, orgName, opponent, isHome, startedAt, pausedAt, totalPausedSeconds, status, orgLogoUrl }: Props) {
  const { ownGoals, oppGoals, actions, players } = useLiveMatchPublic(eventId)
  const [tab, setTab] = useState<Tab>('actions')

  const homeTeam   = isHome ? orgName : (opponent ?? 'Adversaire')
  const awayTeam   = isHome ? (opponent ?? 'Adversaire') : orgName
  const scoreHome  = isHome ? ownGoals : oppGoals
  const scoreAway  = isHome ? oppGoals : ownGoals
  const homeLogoUrl = isHome ? orgLogoUrl : null
  const awayLogoUrl = isHome ? null : orgLogoUrl

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Hero score + chip chrono */}
      <ScoreHeader
        homeTeam={homeTeam} awayTeam={awayTeam}
        scoreHome={scoreHome} scoreAway={scoreAway}
        homeLogoUrl={homeLogoUrl} awayLogoUrl={awayLogoUrl}
        startedAt={startedAt} pausedAt={pausedAt}
        totalPausedSeconds={totalPausedSeconds} status={status}
      />

      {/* Onglets */}
      <div className="max-w-lg mx-auto px-5 pt-4">
        <div className="flex bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden mb-4">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-[10px] font-[800] uppercase tracking-wide transition-colors font-[family-name:var(--font-barlow)] ${
                tab === t.key ? 'bg-brand-dark text-white' : 'text-brand-muted hover:bg-brand-bg'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'actions' && (
          <Timeline
            actions={actions}
            players={players}
            opponent={opponent ?? 'Adversaire'}
            homeLabel={orgName}
          />
        )}

        {tab === 'compo' && (
          <LineupSection players={players} initialOpen />
        )}
      </div>
    </div>
  )
}
