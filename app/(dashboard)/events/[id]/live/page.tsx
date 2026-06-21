import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { LiveMatchManager } from '@/components/match/LiveMatchManager'

export const dynamic = 'force-dynamic'

export default async function LiveMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: ev } = await supabase
    .from('events')
    .select('id, title, type, opponent, is_home, start_at, status, started_at, organization_id, organizations(name, primary_color)')
    .eq('id', id)
    .maybeSingle()

  if (!ev || ev.type !== 'match') notFound()

  const { data: mem } = await supabase.from('organization_members')
    .select('role').eq('user_id', user.id).eq('organization_id', ev.organization_id as string).maybeSingle()
  if (!mem || !['admin', 'member_active'].includes(mem.role as string)) redirect('/events')

  type OrgData = { name: string; primary_color: string }
  const rawOrg = ev.organizations
  const org = (Array.isArray(rawOrg) ? rawOrg[0] : rawOrg) as OrgData | null

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-4 py-8">
      <div className="max-w-lg mx-auto space-y-4">
        <PageHeader
          title={ev.title as string}
          subtitle={ev.opponent ? `vs ${ev.opponent}` : undefined}
          backHref="/events"
        />
        <LiveMatchManager
          eventId={id}
          orgId={ev.organization_id as string}
          opponent={ev.opponent as string | null}
          isHome={ev.is_home as boolean | null}
          initialStatus={ev.status as 'upcoming' | 'ongoing' | 'finished' | null}
          initialStartedAt={ev.started_at as string | null}
          orgName={org?.name ?? 'Nous'}
        />

        {/* Lien public partageable */}
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
