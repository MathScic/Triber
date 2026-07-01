'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ContributionStep1, type Step1Data } from './ContributionStep1'
import { ContributionStep2, type SelectedMember, type OrgMemberForSelection } from './ContributionStep2'

interface Props {
  orgId: string
  onClose: () => void
  onCreate: (data: Step1Data, selected: SelectedMember[]) => Promise<void>
}

export function CreateContributionInline({ orgId, onClose, onCreate }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [members, setMembers] = useState<OrgMemberForSelection[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      const s = createClient()
      const { data: mems } = await s.from('organization_members').select('user_id, category').eq('organization_id', orgId)
      if (!mems?.length) { setMembersLoading(false); return }
      const uids = mems.map(m => m.user_id as string)
      const { data: profiles } = await s.from('profiles').select('id, full_name').in('id', uids)
      const pMap = new Map((profiles ?? []).map(p => [p.id as string, p.full_name as string | null]))
      setMembers(mems.map(m => ({ user_id: m.user_id as string, category: m.category as string | null, full_name: pMap.get(m.user_id as string) ?? null })))
      setMembersLoading(false)
    })()
  }, [orgId])

  const handleStep1 = async (data: Step1Data) => {
    setStep1Data(data)
    if (data.is_buvette) {
      setSaving(true)
      await onCreate(data, [])
      setSaving(false)
    } else {
      setStep(2)
    }
  }

  const handleConfirm = async (selected: SelectedMember[]) => {
    if (!step1Data) return
    setSaving(true)
    await onCreate(step1Data, selected)
    setSaving(false)
  }

  const STEP_LABELS = ['Définir la cotisation', 'Sélectionner les membres']

  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-[800] text-brand-dark uppercase tracking-tight font-[family-name:var(--font-barlow)]">
            Nouvelle cotisation
          </h2>
          <p className="text-xs text-brand-muted mt-0.5 font-[family-name:var(--font-nunito)]">
            Étape {step} / 2 — {STEP_LABELS[step - 1]}
          </p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-brand-bg flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-brand-muted" />
        </button>
      </div>

      {step === 1
        ? <ContributionStep1 onSubmit={handleStep1} onCancel={onClose} saving={saving} />
        : <ContributionStep2 members={members} loading={membersLoading} onBack={() => setStep(1)} onConfirm={handleConfirm} saving={saving} />
      }
    </div>
  )
}
