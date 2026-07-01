import { Nunito, Barlow_Condensed } from 'next/font/google'
import Link from 'next/link'
import { Mail } from 'lucide-react'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-barlow',
})

export const metadata = { title: 'Vérifiez votre email — Triber' }

export default function ConfirmePage() {
  return (
    <main
      className={`${nunito.variable} ${barlow.variable} min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4 py-12`}
    >
      <div className="w-full max-w-sm text-center">
        {/* Icône */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-light mb-6">
          <Mail className="w-8 h-8 text-success" />
        </div>

        <h1 className="text-3xl font-[800] text-brand-dark font-[family-name:var(--font-barlow)] uppercase tracking-tight mb-3">
          Vérifiez votre email
        </h1>

        <p className="text-[#6B7280] font-[family-name:var(--font-nunito)] leading-relaxed mb-8">
          Un lien de confirmation vous a été envoyé.
          <br />
          Cliquez dessus pour activer votre compte.
        </p>

        <div className="bg-white rounded-2xl border border-[#D1D1D6] p-4 mb-6 text-sm text-[#6B7280] font-[family-name:var(--font-nunito)]">
          Pensez à vérifier vos{' '}
          <span className="font-semibold text-brand-dark">spams</span> si vous
          ne voyez pas l&apos;email.
        </div>

        <Link
          href="/login"
          className="text-secondary font-semibold text-sm hover:underline font-[family-name:var(--font-nunito)]"
        >
          Retour à la connexion
        </Link>
      </div>
    </main>
  )
}
