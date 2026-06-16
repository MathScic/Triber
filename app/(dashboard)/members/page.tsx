import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { MemberList } from '@/components/members/MemberList'
import { InviteForm } from '@/components/members/InviteForm'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

export const metadata = { title: 'Membres — Triber' }

type Org = { id: string; name: string; plan: string }

export default async function MembersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) redirect('/onboarding')

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, plan')
    .eq('id', membership.organization_id)
    .maybeSingle() as { data: Org | null }

  if (!org) redirect('/home')
  console.log('MEMBERS PAGE - org:', JSON.stringify(org))

  // Compte réel des membres depuis la base (plus fiable que member_count)
  const { count: membersCount } = await supabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', org.id)

  const isAdmin = membership.role === 'admin'

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-[#FAF7F2] px-4 py-8`}>
      <div className="max-w-lg mx-auto space-y-6">

        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-[800] text-[#1A1F16] font-[family-name:var(--font-barlow)] uppercase tracking-tight">
            Membres
          </h1>
          <p className="text-sm text-[#7A8070] font-[family-name:var(--font-nunito)] mt-0.5">
            <span className="font-semibold text-[#1A1F16]">{membersCount ?? 0}</span>
            {' / '}
            <span className="font-semibold text-[#1A1F16]">{org.plan === 'free' ? '20' : '∞'}</span>
            {' membres · '}
            {org.name}
          </p>
        </div>

        {/* Formulaire d'invitation — admin uniquement */}
        {isAdmin && <InviteForm organizationId={org.id} />}

        {/* Liste des membres */}
        <MemberList organizationId={org.id} currentUserId={user.id} />

      </div>
    </main>
  )
}
