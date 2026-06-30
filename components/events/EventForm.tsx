'use client'

import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { CreateEventData, EventType } from '@/lib/hooks/useEvents'

const EVENT_TYPES = [
  { value: 'match' as EventType, label: 'Match' },
  { value: 'training' as EventType, label: 'Entraînement' },
  { value: 'meeting' as EventType, label: 'Réunion' },
  { value: 'other' as EventType, label: 'Autre' },
]

const CATEGORIES = ['Senior', 'U18', 'U16', 'U15', 'U14', 'U13', 'U12', 'Vétérans', 'Féminine', 'Futsal']
const TEAMS = ['A', 'B', 'C']

const SEL = 'flex h-11 w-full rounded-xl border border-[#D1D1D6] px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-success'
const DATE = 'accent-success [color-scheme:light]'

interface FormFields {
  title: string; type: EventType; date: string; time: string
  location: string; opponent: string; is_home: boolean
  category: string; team_label: string
}
interface Props { onSubmit: (data: CreateEventData) => Promise<boolean>; onCancel: () => void; loading: boolean }

export function EventForm({ onSubmit, onCancel, loading }: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormFields>({
    defaultValues: { type: 'match', is_home: true, category: 'Senior', team_label: 'A' },
  })
  const type = watch('type')

  const handleFormSubmit = async (fields: FormFields) => {
    await onSubmit({
      title: fields.title,
      type: fields.type,
      start_at: `${fields.date}T${fields.time}:00`,
      ...(fields.location ? { location: fields.location } : {}),
      ...(fields.type === 'match' ? {
        opponent: fields.opponent || undefined,
        is_home: fields.is_home,
        category: fields.category || undefined,
        team_label: fields.team_label || undefined,
      } : {}),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white rounded-xl border border-[#D1D1D6] p-5 space-y-4">
      <h3 className="font-[800] text-brand-dark font-[family-name:var(--font-barlow)] uppercase tracking-wide">
        Nouvel événement
      </h3>

      <div className="space-y-1">
        <Label htmlFor="ev-title">Titre</Label>
        <Input id="ev-title" placeholder="FC Normandie vs Caen" {...register('title', { required: 'Titre requis' })} />
        {errors.title && <p className="text-xs text-secondary">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="ev-type">Type</Label>
          <select id="ev-type" {...register('type')} className={SEL}>
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="ev-location">Lieu (optionnel)</Label>
          <Input id="ev-location" placeholder="Stade Municipal" {...register('location')} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ev-date">Date</Label>
          <Input id="ev-date" type="date" className={DATE} {...register('date', { required: 'Date requise' })} />
          {errors.date && <p className="text-xs text-secondary">{errors.date.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="ev-time">Heure</Label>
          <Input id="ev-time" type="time" className={DATE} {...register('time', { required: 'Heure requise' })} />
        </div>
      </div>

      {type === 'match' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ev-category">Catégorie</Label>
              <select id="ev-category" {...register('category')} className={SEL}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ev-team">Équipe</Label>
              <select id="ev-team" {...register('team_label')} className={SEL}>
                {TEAMS.map(t => <option key={t} value={t}>Équipe {t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ev-opponent">Adversaire</Label>
              <Input id="ev-opponent" placeholder="FC Caen" {...register('opponent')} />
            </div>
            <div className="flex items-end pb-2 gap-2">
              <input type="checkbox" id="ev-is-home" {...register('is_home')} className="h-4 w-4 rounded accent-success" />
              <Label htmlFor="ev-is-home">Domicile</Label>
            </div>
          </div>
        </>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Création...' : 'Créer'}</Button>
      </div>
    </form>
  )
}
