import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { EventDetailView } from '@/components/events/EventDetailView'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: ev }, { data: membership }] = await Promise.all([
    supabase.from('events')
      .select('id, title, type, start_at, location, opponent, is_home, organization_id, status, created_by, category, team_label')
      .eq('id', id).maybeSingle(),
    supabase.from('organization_members')
      .select('role, organization_id').eq('user_id', user.id).maybeSingle(),
  ])

  if (!ev) notFound()
  if (!membership || (membership.organization_id as string) !== (ev.organization_id as string)) {
    redirect('/events')
  }

  const [{ data: result }, { data: myAttendance }] = await Promise.all([
    supabase.from('match_results').select('score_home, score_away').eq('event_id', id).maybeSingle(),
    supabase.from('event_attendees').select('status').eq('event_id', id).eq('user_id', user.id).maybeSingle(),
  ])

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-brand-bg px-4 py-6`}>
      <div className="max-w-lg lg:max-w-4xl mx-auto space-y-4">
        <Link href="/events" className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-dark transition-colors font-[family-name:var(--font-nunito)]">
          <ChevronLeft className="w-4 h-4" /> Événements
        </Link>

        <EventDetailView
          event={ev as Record<string, unknown>}
          role={membership.role as string}
          currentUserId={user.id}
          currentUserName={(user.user_metadata?.full_name as string | undefined) ?? null}
          initialScore={result ? { home: result.score_home as number, away: result.score_away as number } : null}
          initialAttendance={(myAttendance?.status as 'confirmed' | 'declined' | 'pending') ?? null}
        />
      </div>
    </main>
  )
}
