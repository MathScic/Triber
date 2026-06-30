import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { RegisterForm } from '@/components/auth/RegisterForm'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-barlow',
})

export const metadata = { title: 'Créer un compte — Triber' }

export default function RegisterPage() {
  return (
    <main
      className={`${nunito.variable} ${barlow.variable} min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4 py-12`}
    >
      <div className="w-full max-w-sm">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-brand-dark transition-colors mb-6 font-[family-name:var(--font-nunito)]">
          <ArrowLeft className="w-4 h-4" /> Retour à la connexion
        </Link>

        {/* En-tête marque */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-success mb-4 shadow-md">
            <span className="text-white text-2xl font-[800] font-[family-name:var(--font-barlow)]">
              T
            </span>
          </div>
          <h1 className="text-4xl font-[800] text-brand-dark font-[family-name:var(--font-barlow)] tracking-tight uppercase">
            Triber
          </h1>
          <p className="text-sm text-[#6B7280] mt-1 font-[family-name:var(--font-nunito)]">
            Rejoignez des milliers de clubs français
          </p>
        </div>

        {/* Carte formulaire */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#D1D1D6] p-6">
          <h2 className="text-xl font-bold text-brand-dark mb-6 font-[family-name:var(--font-barlow)] uppercase tracking-wide">
            Créer mon compte
          </h2>
          <RegisterForm />
        </div>
      </div>
    </main>
  )
}
