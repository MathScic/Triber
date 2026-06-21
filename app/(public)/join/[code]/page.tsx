import { Nunito, Barlow_Condensed } from 'next/font/google'
import JoinOrgCard from '@/components/join/JoinOrgCard'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

export const metadata = { title: 'Rejoindre une organisation — Triber' }

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  return (
    <main
      className={`${nunito.variable} ${barlow.variable} min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-4 py-12`}
    >
      <div className="w-full max-w-sm">
        {/* En-tête marque */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2A9D4E] mb-4 shadow-md">
            <span className="text-white text-2xl font-[800] font-[family-name:var(--font-barlow)]">T</span>
          </div>
          <h1 className="text-4xl font-[800] text-[#1A1F16] font-[family-name:var(--font-barlow)] tracking-tight uppercase">
            Triber
          </h1>
          <p className="text-sm text-[#7A8070] mt-1 font-[family-name:var(--font-nunito)]">
            Vous avez été invité(e) à rejoindre un club
          </p>
        </div>

        <JoinOrgCard code={code} />
      </div>
    </main>
  )
}
