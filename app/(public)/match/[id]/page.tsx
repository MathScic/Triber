import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { MatchLiveCard } from '@/components/match/MatchLiveCard'

// Page publique — aucune connexion requise, données serveur
// Accessible via: triber.app/match/[id]

function getAnon() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data } = await getAnon().from('events').select('title, opponent').eq('id', id).maybeSingle()
  const row = data as { title: string; opponent: string | null } | null
  const title = row?.title ?? 'Match'
  const opponent = row?.opponent ? ` · vs ${row.opponent}` : ''
  return { title: `${title}${opponent} — Triber Live` }
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const anon = getAnon()

  const [{ data: event }, { data: result }] = await Promise.all([
    anon
      .from('events')
      .select('id, title, type, opponent, is_home, start_at, location, status, started_at, organization_id, organizations(name, logo_url, primary_color, secondary_color)')
      .eq('id', id)
      .maybeSingle(),
    anon
      .from('match_results')
      .select('score_home, score_away')
      .eq('event_id', id)
      .maybeSingle(),
  ])

  if (!event || event.type !== 'match') notFound()

  type OrgData = { name: string; logo_url: string | null; primary_color: string; secondary_color: string }
  type EventInfo = Parameters<typeof MatchLiveCard>[0]['initialEvent']

  const rawOrg = event.organizations
  const org = (Array.isArray(rawOrg) ? rawOrg[0] : rawOrg) as OrgData | null
  const primaryColor = org?.primary_color ?? '#2A9D4E'

  const eventInfo: EventInfo = {
    id: event.id as string,
    title: event.title as string,
    opponent: event.opponent as string | null,
    is_home: event.is_home as boolean | null,
    start_at: event.start_at as string,
    location: event.location as string | null,
    status: event.status as string | null,
    started_at: event.started_at as string | null,
    organizations: org,
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">
        {/* En-tête marque */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
              <span className="text-white text-xs font-[800] font-[family-name:var(--font-barlow)]">T</span>
            </div>
            <span className="text-base font-[800] text-[#1A1F16] uppercase font-[family-name:var(--font-barlow)] tracking-tight">Triber</span>
          </div>
          <span className="text-xs text-[#7A8070] font-[family-name:var(--font-nunito)]">Direct live</span>
        </div>

        <MatchLiveCard
          eventId={id}
          initialEvent={eventInfo}
          initialScore={result ? { home: result.score_home as number, away: result.score_away as number } : null}
        />

        <p className="text-center text-xs text-[#7A8070] font-[family-name:var(--font-nunito)]">
          Suivi en direct · Triber
        </p>
      </div>
    </main>
  )
}
