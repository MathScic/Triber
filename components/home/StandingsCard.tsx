'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStandings } from '@/lib/hooks/useStandings'
import { StandingsTable } from '@/components/stats/StandingsTable'

interface Props {
  organizationId: string
  primaryColor?: string
}

export function StandingsCard({ organizationId, primaryColor = '#2A9D4E' }: Props) {
  const [scoreencoUrl, setScoreEncoUrl] = useState<string | null | undefined>(undefined)
  const { rows, loading } = useStandings(organizationId)

  useEffect(() => {
    createClient()
      .from('organizations')
      .select('scoreenco_url')
      .eq('id', organizationId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) { setScoreEncoUrl(null); return }
        setScoreEncoUrl((data as { scoreenco_url: string | null } | null)?.scoreenco_url ?? null)
      })
  }, [organizationId])

  if (scoreencoUrl === undefined && loading) return null
  if (!loading && rows.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#F4F4F6]">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#E8622A]" />
          <p className="text-sm font-[800] text-[#1A1F16] font-[family-name:var(--font-barlow)] uppercase tracking-wide">
            Classement
          </p>
        </div>

        <div className="flex items-center gap-3">
          {scoreencoUrl && (
            <a
              href={scoreencoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-[#6B7280] hover:text-[#2A9D4E] transition-colors font-[family-name:var(--font-nunito)]"
            >
              <ExternalLink className="w-3 h-3" />
              Score'n'co
            </a>
          )}
          <Link
            href="/stats"
            className="text-[11px] text-[#6B7280] hover:text-[#2A9D4E] font-semibold transition-colors font-[family-name:var(--font-nunito)]"
          >
            Voir tout →
          </Link>
        </div>
      </div>

      <div className="px-4 py-3">
        {loading ? (
          <div className="space-y-2 py-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-[#F4F4F6] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <StandingsTable rows={rows.slice(0, 5)} primaryColor={primaryColor} compact />
        )}
      </div>
    </div>
  )
}
