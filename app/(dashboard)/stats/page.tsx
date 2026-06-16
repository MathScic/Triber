'use client'

import { useState, useEffect } from 'react'
import { useStats, type MatchResult } from '@/lib/hooks/useStats'
import { PlayerRanking } from '@/components/stats/PlayerRanking'
import { MatchResultForm } from '@/components/stats/MatchResultForm'

type EventMeta = { title: string; start_at: string; opponent: string | null }

export default function StatsPage() {
  const { matchResults, playerStats, getSeasonStats, loading, error } = useStats()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { getSeasonStats() }, [])

  const toggle = (eventId: string) => setSelectedId(prev => prev === eventId ? null : eventId)

  const getResult = (r: MatchResult): { scoreWon: boolean; label: string } => {
    const won = r.score_home > r.score_away
    const draw = r.score_home === r.score_away
    return { scoreWon: won, label: draw ? 'Nul' : won ? 'Victoire' : 'Défaite' }
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1F16] uppercase tracking-tight">Stats</h1>
          <p className="text-sm text-[#7A8070]">{matchResults.length} match{matchResults.length !== 1 ? 's' : ''} enregistrés</p>
        </div>

        {error && <p className="text-sm text-[#E8622A] bg-[#FDF0EB] rounded-xl px-3 py-2">{error}</p>}

        {/* Classement buteurs / passeurs */}
        <PlayerRanking playerStats={playerStats} />

        {/* Liste des résultats */}
        <div className="space-y-2">
          <p className="text-sm font-bold text-[#1A1F16]">Résultats</p>

          {loading && [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#DDD8CE] h-16 animate-pulse" />
          ))}

          {matchResults.map(r => {
            const event = r.events as EventMeta | null
            const date = event?.start_at
              ? new Date(event.start_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
              : ''
            const { scoreWon, label } = getResult(r)
            const isOpen = selectedId === r.event_id
            return (
              <div key={r.id}>
                <button onClick={() => toggle(r.event_id)}
                  className="w-full bg-white rounded-2xl border border-[#DDD8CE] p-4 flex items-center justify-between hover:border-[#2A9D4E] transition-colors text-left">
                  <div>
                    <p className="text-sm font-bold text-[#1A1F16]">{event?.title ?? 'Match'}</p>
                    <p className="text-xs text-[#7A8070]">{date}{event?.opponent ? ` · vs ${event.opponent}` : ''}</p>
                    <span className={`text-xs font-semibold ${scoreWon ? 'text-[#2A9D4E]' : 'text-[#E8622A]'}`}>{label}</span>
                  </div>
                  <span className="text-2xl font-extrabold text-[#1A1F16] tabular-nums">
                    {r.score_home} — {r.score_away}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-2">
                    <MatchResultForm
                      eventId={r.event_id}
                      initialHome={r.score_home}
                      initialAway={r.score_away}
                      onSaved={() => { getSeasonStats(); setSelectedId(null) }}
                    />
                  </div>
                )}
              </div>
            )
          })}

          {!loading && !matchResults.length && (
            <p className="text-sm text-center text-[#7A8070] py-6">
              Aucun résultat. Saisissez les scores depuis la page Événements.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
