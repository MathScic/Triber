import { Nunito, Barlow_Condensed } from 'next/font/google'
import Link from 'next/link'

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
      className={`${nunito.variable} ${barlow.variable} min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-4 py-12`}
    >
      <div className="w-full max-w-sm text-center">
        {/* Icône */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E8F5EE] mb-6">
          <span className="text-3xl">📬</span>
        </div>

        <h1 className="text-3xl font-[800] text-[#1A1F16] font-[family-name:var(--font-barlow)] uppercase tracking-tight mb-3">
          Vérifiez votre email
        </h1>

        <p className="text-[#7A8070] font-[family-name:var(--font-nunito)] leading-relaxed mb-8">
          Un lien de confirmation vous a été envoyé.
          <br />
          Cliquez dessus pour activer votre compte.
        </p>

        <div className="bg-white rounded-2xl border border-[#DDD8CE] p-4 mb-6 text-sm text-[#7A8070] font-[family-name:var(--font-nunito)]">
          Pensez à vérifier vos{' '}
          <span className="font-semibold text-[#1A1F16]">spams</span> si vous
          ne voyez pas l'email.
        </div>

        <Link
          href="/login"
          className="text-[#E8622A] font-semibold text-sm hover:underline font-[family-name:var(--font-nunito)]"
        >
          Retour à la connexion
        </Link>
      </div>
    </main>
  )
}
