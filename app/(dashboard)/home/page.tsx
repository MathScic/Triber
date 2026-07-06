'use client'

import { useHomeOrg } from '@/lib/hooks/useHomeOrg'
import { OrgBanner } from '@/components/home/OrgBanner'
import { LiveMatchBanner } from '@/components/home/LiveMatchBanner'
import { LastMatchCard } from '@/components/home/LastMatchCard'
import { NextEventCard } from '@/components/home/NextEventCard'
import { TopScorerCard } from '@/components/home/TopScorerCard'
import { AnnouncementSection } from '@/components/home/AnnouncementSection'
import { StandingsCard } from '@/components/home/StandingsCard'

export default function HomePage() {
  const { org, fullName, userId, role, isLoading, loadError } = useHomeOrg()

  if (isLoading) {
    return (
      <main className="min-h-screen bg-brand-bg flex items-center justify-center">
        <p className="text-sm text-brand-muted font-[family-name:var(--font-nunito)]">Chargement…</p>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
        <p className="text-sm text-brand-muted text-center font-[family-name:var(--font-nunito)]">
          Impossible de charger votre organisation. Réessayez ou reconnectez-vous.
        </p>
      </main>
    )
  }

  if (!org) return null

  return (
    <main className="min-h-screen bg-brand-bg px-4 py-8">
      <div className="max-w-lg lg:max-w-[90%] mx-auto space-y-4">
        <OrgBanner
          name={org.name}
          fullName={fullName}
          logoUrl={org.logo_url}
          coverUrl={org.cover_url}
          primaryColor={org.primary_color ?? '#1E5C38'}
          organizationId={org.id}
        />
        <LiveMatchBanner organizationId={org.id} />
        {/* Grille 2 colonnes desktop / 1 colonne mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LastMatchCard organizationId={org.id} orgLogoUrl={org.logo_url ?? null} />
          <NextEventCard organizationId={org.id} userId={userId ?? ''} />
          <TopScorerCard organizationId={org.id} />
          {userId && (
            <AnnouncementSection
              organizationId={org.id}
              canCreate={role === 'admin' || role === 'member_active'}
              currentUserId={userId}
            />
          )}
        </div>
        <StandingsCard organizationId={org.id} primaryColor={org.primary_color ?? '#1E5C38'} />
      </div>
    </main>
  )
}
