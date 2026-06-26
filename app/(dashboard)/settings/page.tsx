import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { BrandingForm } from '@/components/settings/BrandingForm'
import { LogoutButton } from '@/components/settings/LogoutButton'
import { ScoreEncoSettings } from '@/components/settings/ScoreEncoSettings'
import { PageHeader } from '@/components/shared/PageHeader'
import { UpgradeSection } from '@/components/settings/UpgradeSection'

type OrgRow = { id: string; name: string; type: string; plan: string }
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

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
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-[#F4F4F6] px-4 py-8`}>
      <div className="max-w-lg lg:max-w-4xl mx-auto space-y-6">

        <PageHeader title="Paramètres" subtitle={org.name} />

        {/* Informations organisation — visible par tous */}
        <section className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-4 space-y-3">
          <h2 className="font-[700] text-[#1A1F16] text-base uppercase tracking-tight font-[family-name:var(--font-barlow)]">
            Organisation
          </h2>
          <div className="grid grid-cols-2 gap-3 font-[family-name:var(--font-nunito)]">
            <div><p className="text-xs text-[#6B7280]">Nom</p><p className="text-sm font-semibold text-[#1A1F16]">{org.name}</p></div>
            <div><p className="text-xs text-[#6B7280]">Type</p><p className="text-sm font-semibold text-[#1A1F16]">{TYPE_LABELS[org.type] ?? org.type}</p></div>
            <div><p className="text-xs text-[#6B7280]">Plan</p><p className="text-sm font-semibold text-[#1A1F16]">{PLAN_LABELS[org.plan] ?? org.plan}</p></div>
          </div>
          <div className="pt-2 border-t border-[#D1D1D6] font-[family-name:var(--font-nunito)]">
            <p className="text-xs text-[#6B7280] mb-1">Page publique du club</p>
            <a href={`${APP_URL}/${org.id}`} target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold text-[#2A9D4E] break-all hover:underline">
              {APP_URL}/{org.id}
            </a>
            <p className="text-[11px] text-[#6B7280] mt-0.5">Partageable sans compte — supporters, sponsors, presse</p>
          </div>
        </section>

        {/* Upgrade — plan gratuit uniquement, admin uniquement */}
        {isAdmin && org.plan === 'free' && <UpgradeSection />}

        {/* Branding — admin uniquement */}
        {isAdmin && <BrandingForm />}

        {/* Classement Score'n'co — admin uniquement */}
        {isAdmin && (
          <section className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-4 space-y-3">
            <div>
              <h2 className="font-[700] text-[#1A1F16] text-base uppercase tracking-tight font-[family-name:var(--font-barlow)]">
                Classement Score'n'co
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5 font-[family-name:var(--font-nunito)]">
                Connecte le classement officiel de ton championnat via Score'n'co. Il s'affichera automatiquement sur la page Stats et l'Accueil.
              </p>
            </div>
            <ScoreEncoSettings orgId={org.id} />
          </section>
        )}

        {/* Déconnexion */}
        <LogoutButton />

        {/* Zone de danger */}
        {isAdmin && (
          <section className="bg-white rounded-xl border border-red-200 shadow-sm p-4 space-y-2">
            <h2 className="font-[700] text-[#E8622A] text-base uppercase tracking-tight font-[family-name:var(--font-barlow)]">
              Zone de danger
            </h2>
            <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">
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
