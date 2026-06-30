'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { Plus, Receipt, Beer } from 'lucide-react'
import { useContributions } from '@/lib/hooks/useContributions'
import type { ContributionTemplate } from '@/lib/hooks/useContributions'
import { ContributionCard } from '@/components/finances/ContributionCard'
import { CreateContributionModal } from '@/components/finances/CreateContributionModal'
import { EditContributionModal } from '@/components/finances/EditContributionModal'
import { PageHeader } from '@/components/shared/PageHeader'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

function SectionLabel({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-1">
      {icon}
      <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest font-[family-name:var(--font-nunito)]">
        {label} · {count}
      </p>
    </div>
  )
}

export default function FinancesPage() {
  const router = useRouter()
  const { templates, loading, orgId, role, init, fetchTemplates, createTemplate, updateTemplate, deleteTemplate, toggleActive } = useContributions()
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<ContributionTemplate | null>(null)

  useEffect(() => {
    init().then(mem => {
      if (!mem) { router.push('/login'); return }
      if (mem.role === 'member') { router.push('/home'); return }
      fetchTemplates(mem.organization_id)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canManage = role === 'admin' || role === 'member_active'
  const cotisations = templates.filter(t => !t.is_buvette)
  const buvettes = templates.filter(t => t.is_buvette)
  const activeCotisations = cotisations.filter(t => t.is_active)
  const archivedCotisations = cotisations.filter(t => !t.is_active)

  const totalPaid = cotisations.reduce((s, t) => s + t.total_paid_cents, 0)
  const totalExpected = cotisations.reduce((s, t) => s + t.total_expected_cents, 0)
  const totalPending = totalExpected - totalPaid
  const recoveryRate = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0
  const buvettesTotal = buvettes.reduce((s, t) => s + t.total_paid_cents, 0)

  const cardProps = (t: ContributionTemplate) => ({
    template: t,
    onClick: () => router.push(`/finances/${t.id}`),
    onEdit: () => setEditing(t),
    onDelete: () => { if (orgId) void deleteTemplate(t.id, orgId) },
    onToggleActive: () => { if (orgId) void toggleActive(t.id, !t.is_active, orgId) },
  })

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-brand-bg px-4 py-8`}>
      <div className="max-w-lg lg:max-w-4xl mx-auto space-y-6">
        <PageHeader title="Finances" subtitle="Réservé aux administrateurs"
          action={canManage ? (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-[#d4571f] transition-colors font-[family-name:var(--font-nunito)]">
              <Plus className="w-4 h-4" /> Nouvelle
            </button>
          ) : undefined}
        />

        {/* KPIs — cotisations uniquement */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-4">
            <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">Encaissé</p>
            <p className="text-xl font-[800] text-success tabular-nums font-[family-name:var(--font-barlow)]">{(totalPaid / 100).toFixed(0)} €</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-4">
            <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">En attente</p>
            <p className="text-xl font-[800] text-secondary tabular-nums font-[family-name:var(--font-barlow)]">{(totalPending / 100).toFixed(0)} €</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-4">
            <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">Recouvrement</p>
            <p className={`text-xl font-[800] tabular-nums font-[family-name:var(--font-barlow)] ${recoveryRate >= 80 ? 'text-success' : recoveryRate >= 50 ? 'text-amber-500' : 'text-secondary'}`}>
              {recoveryRate} %
            </p>
          </div>
        </div>

        {loading && (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => <div key={i} className="h-32 bg-white rounded-xl border border-[#D1D1D6] animate-pulse" />)}
          </div>
        )}

        {!loading && templates.length === 0 && (
          <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-10 text-center space-y-2">
            <Receipt className="w-8 h-8 text-[#D1D1D6] mx-auto" />
            <p className="text-sm font-semibold text-brand-dark font-[family-name:var(--font-nunito)]">Aucune cotisation</p>
            <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">
              {canManage ? 'Cliquez sur "Nouvelle" pour créer votre première cotisation.' : 'Aucune cotisation créée.'}
            </p>
          </div>
        )}

        {/* Cotisations actives */}
        {!loading && activeCotisations.length > 0 && (
          <div className="space-y-3">
            <SectionLabel icon={<Receipt className="w-3.5 h-3.5 text-[#9CA3AF]" />} label="Actives" count={activeCotisations.length} />
            {activeCotisations.map(t => <ContributionCard key={t.id} {...cardProps(t)} />)}
          </div>
        )}

        {/* Buvettes */}
        {!loading && buvettes.length > 0 && (
          <div className="space-y-3">
            <SectionLabel icon={<Beer className="w-3.5 h-3.5 text-[#9CA3AF]" />} label={`Buvette · ${(buvettesTotal / 100).toFixed(0)} € encaissés`} count={buvettes.length} />
            {buvettes.map(t => <ContributionCard key={t.id} {...cardProps(t)} />)}
          </div>
        )}

        {/* Archivées */}
        {!loading && archivedCotisations.length > 0 && (
          <div className="space-y-3">
            <SectionLabel icon={<Receipt className="w-3.5 h-3.5 text-[#9CA3AF]" />} label="Terminées" count={archivedCotisations.length} />
            {archivedCotisations.map(t => <ContributionCard key={t.id} {...cardProps(t)} />)}
          </div>
        )}

        {showCreate && orgId && (
          <CreateContributionModal onClose={() => setShowCreate(false)}
            onCreate={async (payload) => { await createTemplate(orgId, payload); setShowCreate(false) }} />
        )}

        {editing && orgId && (
          <EditContributionModal template={editing} onClose={() => setEditing(null)}
            onSave={async (payload) => { await updateTemplate(editing.id, orgId, payload); setEditing(null) }} />
        )}
      </div>
    </main>
  )
}
