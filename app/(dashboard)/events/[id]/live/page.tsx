import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { LiveMatchManager } from '@/components/match/LiveMatchManager'
import type { FullMember, LineupEntry } from '@/components/match/LineupEditor'

export const dynamic = 'force-dynamic'

type MemberRow = { id: string; user_id: string; jersey_number: number | null; profiles: { full_name: string | null } | { full_name: string | null }[] | null }

export default async function LiveMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: ev } = await supabase
    .from('events')
    .select('id, title, type, opponent, is_home, start_at, status, started_at, elapsed_minutes, organization_id, organizations(name, primary_color)')
    .eq('id', id)
    .maybeSingle()

  if (!ev || ev.type !== 'match') notFound()

  const { data: mem } = await supabase.from('organization_members')
    .select('role').eq('user_id', user.id).eq('organization_id', ev.organization_id as string).maybeSingle()
  if (!mem || !['admin', 'member_active'].includes(mem.role as string)) redirect('/events')

  const { data: membersData } = await supabase
    .from('organization_members')
    .select('id, user_id, jersey_number, profiles(full_name)')
    .eq('organization_id', ev.organization_id as string)

  const allMembers: FullMember[] = (membersData ?? []).map((row: MemberRow) => {
    const rawP = row.profiles
    const p = (Array.isArray(rawP) ? rawP[0] : rawP) as { full_name: string | null } | null
    return {
      org_member_id: row.id as string,
      user_id: row.user_id as string,
      name: p?.full_name ?? 'Inconnu',
      jersey: row.jersey_number,
    }
  }).sort((a, b) => (a.jersey ?? 99) - (b.jersey ?? 99))

  const { data: lineupData } = await supabase
    .from('match_lineups')
    .select('organization_member_id, is_starter')
    .eq('event_id', id)

  const initialLineup: LineupEntry[] = (lineupData ?? []).map(l => ({
    org_member_id: l.organization_member_id as string,
    is_starter: l.is_starter as boolean,
  }))

  type OrgData = { name: string; primary_color: string }
  const rawOrg = ev.organizations
  const org = (Array.isArray(rawOrg) ? rawOrg[0] : rawOrg) as OrgData | null

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-4 py-8">
      <div className="max-w-lg mx-auto space-y-4">
        <PageHeader
          title={ev.title as string}
          subtitle={ev.opponent ? `vs ${ev.opponent as string}` : undefined}
          backHref="/events"
        />
        <LiveMatchManager
          eventId={id}
          opponent={ev.opponent as string | null}
          isHome={ev.is_home as boolean | null}
          initialStatus={ev.status as 'upcoming' | 'ongoing' | 'half_time' | 'finished' | null}
          initialStartedAt={ev.started_at as string | null}
          initialElapsedMinutes={(ev.elapsed_minutes as number | null) ?? 0}
          orgName={org?.name ?? 'Nous'}
          allMembers={allMembers}
          initialLineup={initialLineup}
        />
        <div className="bg-white rounded-2xl border border-[#DDD8CE] p-3 text-center">
          <p className="text-xs text-[#7A8070] font-[family-name:var(--font-nunito)] mb-1">Lien public à partager</p>
          <p className="text-sm font-semibold text-[#2A9D4E] font-[family-name:var(--font-nunito)] break-all">
            /match/{id}
          </p>
        </div>
      </div>
    </main>
  )
}
