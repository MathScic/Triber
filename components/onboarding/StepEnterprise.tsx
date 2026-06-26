'use client'

import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const SECTORS = ['Commerce', 'Restauration', 'Artisanat', 'Services', 'Santé', 'Autre']
const SIZES = ['1 à 5', '6 à 20', '21 à 50', 'Plus de 50']
const sel = 'flex h-11 w-full rounded-xl border border-[#D1D1D6] bg-white px-3 text-sm text-[#1A1F16] focus:outline-none focus:ring-2 focus:ring-[#2A9D4E]'

interface EnterpriseFields {
  name: string
  sector?: string
  city?: string
  sizeEstimate?: string
  website?: string
}

interface Props {
  onSubmit: (data: { name: string; slogan?: string }) => Promise<void>
  onBack: () => void
  loading: boolean
}

export function StepEnterprise({ onSubmit, onBack, loading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<EnterpriseFields>()

  const submit = (data: EnterpriseFields) => onSubmit({ name: data.name })

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nom de l'entreprise *</Label>
        <Input id="name" placeholder="Acme SAS"
          {...register('name', { required: 'Le nom est requis' })} />
        {errors.name && <p className="text-xs text-[#E8622A]">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sector">Secteur d'activité</Label>
        <select id="sector" {...register('sector')} className={sel}>
          <option value="">Choisir un secteur</option>
          {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="city">Ville</Label>
        <Input id="city" placeholder="Cherbourg" {...register('city')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sizeEstimate">Nombre d'employés</Label>
        <select id="sizeEstimate" {...register('sizeEstimate')} className={sel}>
          <option value="">Sélectionner</option>
          {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="website">
          Site web <span className="text-[#6B7280] font-normal">(optionnel)</span>
        </Label>
        <Input id="website" type="url" placeholder="https://monentreprise.fr"
          {...register('website')} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">← Retour</Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Création…' : 'Créer mon espace →'}
        </Button>
      </div>
    </form>
  )
}
