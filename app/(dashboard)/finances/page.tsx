'use client'

import { useEffect } from 'react'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useFinances } from '@/lib/hooks/useFinances'
import { ContributionList } from '@/components/finances/ContributionList'
import { PaymentForm } from '@/components/finances/PaymentForm'
import { useState } from 'react'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

export default function FinancesPage() {
  const router = useRouter()
  const [canCreate, setCanCreate] = useState(false)
  const { contributions, getContributions, loading } = useFinances()

  useEffect(() => {
    const s = createClient()
    s.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      s.from('organization_members').select('role').eq('user_id', user.id).maybeSingle()
        .then(({ data }) => {
          if (!data) { router.push('/onboarding'); return }
          const role = data.role as string
          setCanCreate(role === 'admin' || role === 'member_active')
          getContributions()
        })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalPaid = contributions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0)
  const totalPending = contributions.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0)

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-[#FAF7F2] px-4 py-8`}>
      <div className="max-w-lg mx-auto space-y-6">

        <div>
          <h1 className="text-3xl font-[800] text-[#1A1F16] uppercase tracking-tight font-[family-name:var(--font-barlow)]">
            Finances
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-[#DDD8CE] shadow-sm p-4">
            <p className="text-xs text-[#7A8070] font-[family-name:var(--font-nunito)]">Encaissé</p>
            <p className="text-2xl font-[800] text-[#2A9D4E] tabular-nums font-[family-name:var(--font-barlow)]">
              {(totalPaid / 100).toFixed(0)} €
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#DDD8CE] shadow-sm p-4">
            <p className="text-xs text-[#7A8070] font-[family-name:var(--font-nunito)]">En attente</p>
            <p className="text-2xl font-[800] text-[#E8622A] tabular-nums font-[family-name:var(--font-barlow)]">
              {(totalPending / 100).toFixed(0)} €
            </p>
          </div>
        </div>

        {canCreate && <PaymentForm onCreated={getContributions} />}

        <ContributionList contributions={contributions} loading={loading} />

      </div>
    </main>
  )
}
