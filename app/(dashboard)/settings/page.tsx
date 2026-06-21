import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { BrandingForm } from '@/components/settings/BrandingForm'
import { LogoutButton } from '@/components/settings/LogoutButton'
import { PageHeader } from '@/components/shared/PageHeader'

type OrgRow = { id: string; name: string; type: string; plan: string }

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

export const metadata = { title: 'Paramètres — Triber' }

const TYPE_LABELS: Record<string, string> = { club: 'Club / Association', enterprise: 'Entreprise' }
const PLAN_LABELS: Record<string, string> = { free: 'Gratuit', club: 'Club 11,99€/mois', pro: 'Pro' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: mem } = await supabase
    .from('organization_members')
    .select('role, organizations(id, name, type, plan)')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!mem) redirect('/onboarding')
  const raw = mem.organizations
  const org = (Array.isArray(raw) ? raw[0] : raw) as OrgRow | null
  if (!org) redirect('/home')

  const isAdmin = mem.role === 'admin'

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-[#FAF7F2] px-4 py-8`}>
      <div className="max-w-lg mx-auto space-y-6">

        <PageHeader title="Paramètres" subtitle={org.name} />

        {/* Branding — admin uniquement */}
        {isAdmin && <BrandingForm />}

        {/* Informations organisation */}
        <section className="bg-white rounded-2xl border border-[#DDD8CE] shadow-sm p-4 space-y-3">
          <h2 className="font-[700] text-[#1A1F16] text-base uppercase tracking-tight font-[family-name:var(--font-barlow)]">
            Organisation
          </h2>
          <div className="grid grid-cols-2 gap-3 font-[family-name:var(--font-nunito)]">
            <div><p className="text-xs text-[#7A8070]">Nom</p><p className="text-sm font-semibold text-[#1A1F16]">{org.name}</p></div>
            <div><p className="text-xs text-[#7A8070]">Type</p><p className="text-sm font-semibold text-[#1A1F16]">{TYPE_LABELS[org.type] ?? org.type}</p></div>
            <div><p className="text-xs text-[#7A8070]">Plan</p><p className="text-sm font-semibold text-[#1A1F16]">{PLAN_LABELS[org.plan] ?? org.plan}</p></div>
          </div>
        </section>

        {/* Déconnexion */}
        <LogoutButton />

        {/* Zone de danger */}
        {isAdmin && (
          <section className="bg-white rounded-2xl border border-red-200 shadow-sm p-4 space-y-2">
            <h2 className="font-[700] text-[#E8622A] text-base uppercase tracking-tight font-[family-name:var(--font-barlow)]">
              Zone de danger
            </h2>
            <p className="text-xs text-[#7A8070] font-[family-name:var(--font-nunito)]">
              Pour supprimer votre organisation et toutes ses données, contactez-nous à{' '}
              <a href="mailto:support@triber.app" className="underline hover:text-[#E8622A]">support@triber.app</a>.
              Cette action est irréversible.
            </p>
          </section>
        )}

      </div>
    </main>
  )
}
