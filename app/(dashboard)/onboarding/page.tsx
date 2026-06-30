import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { CreateOrgForm } from '@/components/onboarding/CreateOrgForm'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

export const metadata = { title: 'Créer mon organisation — Triber' }

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Vérifie si l'utilisateur courant est déjà admin d'une organisation
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  // Org déjà créée → pas besoin de rester sur l'onboarding
  if (membership) redirect('/home')

  return (
    <main
      className={`${nunito.variable} ${barlow.variable} min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4 py-12`}
    >
      <div className="w-full max-w-sm">
        {/* Logo Triber */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center shadow-md">
            <span className="text-white text-xl font-[800] font-[family-name:var(--font-barlow)]">T</span>
          </div>
        </div>

        {/* Carte formulaire */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D1D1D6] p-6">
          <CreateOrgForm />
        </div>
      </div>
    </main>
  )
}
