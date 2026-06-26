import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { LiveMatchManager } from '@/components/match/LiveMatchManager'
import type { FullMember, LineupEntry } from '@/components/match/LineupEditor'

export const dynamic = 'force-dynamic'

type MemberRow = { id: string; user_id: string; jersey_number: number | null }
type ProfileRow = { id: string; full_name: string | null }

export default async function LiveMatchPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string }> }) {
  const { id } = await params
  const { from } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: ev } = await supabase
    .from('events')
    .select('id, title, type, opponent, is_home, start_at, status, started_at, paused_at, total_paused_seconds, organization_id, organizations(name, primary_color, logo_url)')
    .eq('id', id)
    .maybeSingle()

  if (!ev || ev.type !== 'match') notFound()

  const { data: mem } = await supabase.from('organization_members')
    .select('role').eq('user_id', user.id).eq('organization_id', ev.organization_id as string).maybeSingle()
  if (!mem || !['admin', 'member_active'].includes(mem.role as string)) redirect('/events')

  // Fetch membres sans JOIN pour éviter les problèmes RLS sur profiles
  const { data: membersData } = await supabase
    .from('organization_members')
    .select('id, user_id, jersey_number')
    .eq('organization_id', ev.organization_id as string)

  const rows = (membersData ?? []) as MemberRow[]
  const userIds = rows.map(r => r.user_id)
  let profiles: ProfileRow[] = []
  if (userIds.length > 0) {
    const { data: pData } = await supabase.from('profiles').select('id, full_name').in('id', userIds)
    profiles = (pData ?? []) as ProfileRow[]
  }
  const profileMap = new Map(profiles.map(p => [p.id, p.full_name]))

  const allMembers: FullMember[] = rows.map(r => ({
    org_member_id: r.id,
    user_id: r.user_id,
    name: profileMap.get(r.user_id) ?? 'Inconnu',
    jersey: r.jersey_number,
  })).sort((a, b) => (a.jersey ?? 99) - (b.jersey ?? 99))

  const { data: lineupData } = await supabase
    .from('match_lineups').select('organization_member_id, is_starter').eq('event_id', id)

  const initialLineup: LineupEntry[] = (lineupData ?? []).map(l => ({
    org_member_id: l.organization_member_id as string,
    is_starter: l.is_starter as boolean,
  }))

  type OrgData = { name: string; primary_color: string; logo_url: string | null }
  const rawOrg = ev.organizations
  const org = (Array.isArray(rawOrg) ? rawOrg[0] : rawOrg) as OrgData | null

  return (
    <main className="min-h-screen bg-[#F4F4F6] px-4 py-8">
      <div className="max-w-lg lg:max-w-4xl mx-auto space-y-4">
        <PageHeader
          title={ev.title as string}
          subtitle={ev.opponent ? `vs ${ev.opponent as string}` : undefined}
          backHref={from === 'home' ? '/home' : '/events'}
        />
        <LiveMatchManager
          eventId={id}
          opponent={ev.opponent as string | null}
          isHome={ev.is_home as boolean | null}
          initialStatus={ev.status as 'upcoming' | 'ongoing' | 'half_time' | 'finished' | null}
          initialStartedAt={ev.started_at as string | null}
          initialPausedAt={ev.paused_at as string | null}
          initialTotalPausedSeconds={(ev.total_paused_seconds as number | null) ?? 0}
          orgName={org?.name ?? 'Nous'}
          orgLogoUrl={org?.logo_url ?? null}
          organizationId={ev.organization_id as string}
          eventTitle={ev.title as string}
          allMembers={allMembers}
          initialLineup={initialLineup}
        />
        <div className="bg-white rounded-xl border border-[#D1D1D6] p-3 text-center">
          <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)] mb-1">Lien public à partager</p>
          <p className="text-sm font-semibold text-[#2A9D4E] font-[family-name:var(--font-nunito)] break-all">
            /match/{id}
          </p>
        </div>
      </div>
    </main>
  )
}
