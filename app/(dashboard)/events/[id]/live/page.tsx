import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LivePageWrapper } from '@/components/match/LivePageWrapper'
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
    .select('id, title, type, opponent, location, is_home, start_at, status, started_at, paused_at, total_paused_seconds, organization_id, organizations(name, logo_url)')
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

  const org = (Array.isArray(ev.organizations) ? ev.organizations[0] : ev.organizations) as { name: string; logo_url: string | null } | null
  const d = new Date(ev.start_at as string)
  const loc = ev.location as string | null
  const subtitle = ev.opponent ? `vs ${ev.opponent as string} · ${d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}${loc ? ` · ${loc}` : ''}` : undefined

  return (
    <main className="min-h-screen bg-brand-bg px-4 py-8">
      <div className="max-w-lg lg:max-w-[90%] mx-auto space-y-4">
        <LivePageWrapper
          eventId={id}
          title={ev.title as string}
          subtitle={subtitle}
          backHref={from === 'home' ? '/home' : '/events'}
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
        <div className="bg-white rounded-xl border border-brand-border p-3 text-center">
          <p className="text-xs text-brand-muted font-[family-name:var(--font-nunito)] mb-1">Lien public à partager</p>
          <p className="text-sm font-semibold text-success font-[family-name:var(--font-nunito)] break-all">
            /match/{id}
          </p>
        </div>
      </div>
    </main>
  )
}
