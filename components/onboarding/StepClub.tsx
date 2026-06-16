'use client'

import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const SPORTS = ['Football', 'Basketball', 'Tennis', 'Rugby', 'Handball', 'Volleyball', 'Pêche', 'Autre']
const SIZES = ['Moins de 20', '20 à 50', '50 à 150', 'Plus de 150']
const sel = 'flex h-11 w-full rounded-xl border border-[#DDD8CE] bg-white px-3 text-sm text-[#1A1F16] focus:outline-none focus:ring-2 focus:ring-[#2A9D4E]'

interface ClubFields {
  name: string
  sport?: string
  city?: string
  sizeEstimate?: string
  slogan?: string
}

interface Props {
  onSubmit: (data: { name: string; slogan?: string }) => Promise<void>
  onBack: () => void
  loading: boolean
}

export function StepClub({ onSubmit, onBack, loading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<ClubFields>()

  const submit = (data: ClubFields) => onSubmit({ name: data.name, slogan: data.slogan })

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nom du club *</Label>
        <Input id="name" placeholder="FC Normandie"
          {...register('name', { required: 'Le nom est requis' })} />
        {errors.name && <p className="text-xs text-[#E8622A]">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sport">Sport principal</Label>
        <select id="sport" {...register('sport')} className={sel}>
          <option value="">Choisir un sport</option>
          {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="city">Ville</Label>
        <Input id="city" placeholder="Cherbourg" {...register('city')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sizeEstimate">Nombre de membres estimé</Label>
        <select id="sizeEstimate" {...register('sizeEstimate')} className={sel}>
          <option value="">Sélectionner</option>
          {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slogan">
          Slogan <span className="text-[#7A8070] font-normal">(optionnel)</span>
        </Label>
        <Input id="slogan" placeholder="Le slogan de votre club"
          {...register('slogan', { maxLength: { value: 60, message: '60 caractères max' } })} />
        {errors.slogan && <p className="text-xs text-[#E8622A]">{errors.slogan.message}</p>}
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
