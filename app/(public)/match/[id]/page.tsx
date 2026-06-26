import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { LiveMatchClient } from './LiveMatchClient'

function anon() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data } = await anon().from('events').select('title, opponent').eq('id', id).maybeSingle()
  const row = data as { title: string; opponent: string | null } | null
  return { title: `${row?.title ?? 'Match'}${row?.opponent ? ` · vs ${row.opponent}` : ''} — Triber Live` }
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = anon()

  const [{ data: ev }] = await Promise.all([
    s.from('events')
      .select('id, title, type, opponent, is_home, start_at, status, started_at, paused_at, total_paused_seconds, organization_id, organizations(name, primary_color, logo_url)')
      .eq('id', id).maybeSingle(),
  ])

  if (!ev || ev.type !== 'match') notFound()

  type OrgData = { name: string; primary_color: string; logo_url: string | null }
  const rawOrg = ev.organizations
  const org = (Array.isArray(rawOrg) ? rawOrg[0] : rawOrg) as OrgData | null

  return (
    <main>
      {/* Barre marque Triber */}
      <div className="bg-[#F4F4F6] px-5 py-3 flex items-center justify-between border-b border-[#D1D1D6]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: org?.primary_color ?? '#2A9D4E' }}>
            <span className="text-white text-[10px] font-[800] font-[family-name:var(--font-barlow)]">T</span>
          </div>
          <span className="text-sm font-[800] text-[#1A1F16] uppercase font-[family-name:var(--font-barlow)] tracking-tight">Triber</span>
        </div>
        <span className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">Direct live</span>
      </div>

      <LiveMatchClient
        eventId={id}
        orgName={org?.name ?? 'Nous'}
        orgLogoUrl={org?.logo_url ?? null}
        opponent={ev.opponent as string | null}
        isHome={(ev.is_home as boolean | null) !== false}
        startedAt={ev.started_at as string | null}
        pausedAt={ev.paused_at as string | null}
        totalPausedSeconds={(ev.total_paused_seconds as number | null) ?? 0}
        status={ev.status as string | null}
      />
    </main>
  )
}
