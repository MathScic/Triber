'use client'

import { useState } from 'react'
import { useOrganization } from '@/lib/hooks/useOrganization'
import { StepType } from './StepType'
import { StepClub } from './StepClub'
import { StepEnterprise } from './StepEnterprise'

type OrgType = 'club' | 'enterprise'
type SubmitData = { name: string; slogan?: string }

export function CreateOrgForm() {
  const [step, setStep] = useState<1 | 2>(1)
  const [type, setType] = useState<OrgType | null>(null)
  const { createOrganization, loading, error } = useOrganization()

  const handleTypeSelect = (selected: OrgType) => {
    setType(selected)
    setStep(2)
  }

  const handleSubmit = async (data: SubmitData) => {
    if (!type) return
    await createOrganization(data.name, type, data.slogan)
  }

  return (
    <div className="space-y-5">
      {/* Barre de progression */}
      <div className="space-y-1">
        <div className="flex gap-2">
          {([1, 2] as const).map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                s <= step ? 'bg-[#2A9D4E]' : 'bg-[#DDD8CE]'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-[#7A8070] text-right">Étape {step} / 2</p>
      </div>

      {/* Erreur globale */}
      {error && (
        <p className="text-sm text-[#E8622A] bg-[#FDF0EB] rounded-xl px-3 py-2.5 font-medium">
          {error}
        </p>
      )}

      {/* Étapes */}
      {step === 1 && <StepType onSelect={handleTypeSelect} />}
      {step === 2 && type === 'club' && (
        <StepClub onSubmit={handleSubmit} onBack={() => setStep(1)} loading={loading} />
      )}
      {step === 2 && type === 'enterprise' && (
        <StepEnterprise onSubmit={handleSubmit} onBack={() => setStep(1)} loading={loading} />
      )}
    </div>
  )
}
