'use client'

import { Nunito, Barlow_Condensed } from 'next/font/google'
import { useStats } from '@/lib/hooks/useStats'
import { SeasonBilan } from '@/components/stats/SeasonBilan'
import { PlayerStatsTable } from '@/components/stats/PlayerStatsTable'
import { MatchResultsTable } from '@/components/stats/MatchResultsTable'
import { StandingsTable } from '@/components/stats/StandingsTable'
import { StandingsForm } from '@/components/stats/StandingsForm'
import { useStandings } from '@/lib/hooks/useStandings'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, ChevronUp, ExternalLink, Trophy } from 'lucide-react'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

export default function StatsPage() {
  const { matchResults, playerStats, loading, error, organizationId, primaryColor, userRole } = useStats()
  const standings = useStandings(organizationId ?? '')
  const [editStandings, setEditStandings] = useState(false)
  const [scoreencoUrl, setScoreEncoUrl] = useState<string | null>(null)
  const canEdit = userRole === 'admin' || userRole === 'member_active'

  useEffect(() => {
    if (!organizationId) return
    createClient().from('organizations').select('scoreenco_url').eq('id', organizationId).maybeSingle()
      .then(({ data }) => setScoreEncoUrl((data as { scoreenco_url: string | null } | null)?.scoreenco_url ?? null), () => null)
  }, [organizationId])

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-brand-bg px-6 py-8`}>
      <div className="max-w-5xl lg:max-w-[90%] mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-[800] text-brand-dark uppercase tracking-tight font-[family-name:var(--font-barlow)]">
            Statistiques
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5 font-[family-name:var(--font-nunito)]">
            {matchResults.length} match{matchResults.length !== 1 ? 's' : ''} enregistrés
          </p>
        </div>

        {error && <p className="text-sm text-secondary bg-secondary-light rounded-xl px-3 py-2">{error}</p>}

        {loading
          ? <div className="h-28 bg-white rounded-2xl border border-[#D1D1D6] animate-pulse" />
          : <SeasonBilan matchResults={matchResults} />
        }

        {/* Tableau stats joueurs */}
        {loading
          ? <div className="h-48 bg-white rounded-2xl border border-[#D1D1D6] animate-pulse" />
          : <PlayerStatsTable rows={playerStats} />
        }

        {/* Classement championnat */}
        {organizationId && (
          <div className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F4F4F6]">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-secondary" />
                <h2 className="text-base font-[800] text-brand-dark uppercase tracking-tight font-[family-name:var(--font-barlow)]">
                  Classement
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {scoreencoUrl && (
                  <a href={scoreencoUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-success transition-colors font-[family-name:var(--font-nunito)]">
                    <ExternalLink className="w-3 h-3" /> Score&apos;n&apos;co
                  </a>
                )}
                {!scoreencoUrl && canEdit && (
                  <button onClick={() => setEditStandings(v => !v)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#6B7280] hover:text-success transition-colors font-[family-name:var(--font-nunito)]">
                    {editStandings ? <><ChevronUp className="w-3.5 h-3.5" /> Terminer</> : <><ChevronDown className="w-3.5 h-3.5" /> Modifier</>}
                  </button>
                )}
              </div>
            </div>
            <div className="px-5 py-4">
              {editStandings && canEdit
                ? <StandingsForm rows={standings.rows} season="2025-2026" onUpsert={standings.upsert} onRemove={standings.remove} />
                : standings.rows.length > 0
                  ? <StandingsTable rows={standings.rows} primaryColor={primaryColor} />
                  : <p className="text-sm text-center text-[#9CA3AF] py-4 font-[family-name:var(--font-nunito)]">
                      {canEdit ? 'Cliquez sur "Modifier" pour saisir le classement.' : 'Classement non encore renseigné.'}
                    </p>
              }
            </div>
          </div>
        )}

        {/* Tableau résultats */}
        {loading
          ? <div className="h-36 bg-white rounded-2xl border border-[#D1D1D6] animate-pulse" />
          : <MatchResultsTable results={matchResults} />
        }
      </div>
    </main>
  )
}
