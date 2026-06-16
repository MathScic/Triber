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

const SELECT_CLS = 'flex h-11 w-full rounded-xl border border-[#DDD8CE] px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2A9D4E]'
const DATE_CLS = 'accent-[#2A9D4E] [color-scheme:light]'

interface FormFields { title: string; type: EventType; date: string; time: string; location: string; opponent: string; is_home: boolean }
interface Props { onSubmit: (data: CreateEventData) => Promise<boolean>; onCancel: () => void; loading: boolean }

export function EventForm({ onSubmit, onCancel, loading }: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormFields>({
    defaultValues: { type: 'match', is_home: true },
  })
  const type = watch('type')

  const handleFormSubmit = async (fields: FormFields) => {
    await onSubmit({
      title: fields.title, type: fields.type,
      start_at: `${fields.date}T${fields.time}:00`,
      ...(fields.location ? { location: fields.location } : {}),
      ...(fields.type === 'match' && fields.opponent ? { opponent: fields.opponent } : {}),
      ...(fields.type === 'match' ? { is_home: fields.is_home } : {}),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white rounded-2xl border border-[#DDD8CE] p-5 space-y-4">
      <h3 className="font-bold text-[#1A1F16]">Nouvel événement</h3>

      <div className="space-y-1">
        <Label htmlFor="ev-title">Titre</Label>
        <Input id="ev-title" placeholder="FC Normandie vs Caen" {...register('title', { required: 'Titre requis' })} />
        {errors.title && <p className="text-xs text-[#E8622A]">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="ev-type">Type</Label>
          <select id="ev-type" {...register('type')} className={SELECT_CLS}>
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="ev-location">Lieu (optionnel)</Label>
          <Input id="ev-location" placeholder="Stade Municipal" {...register('location')} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ev-date">📅 Date</Label>
          <Input id="ev-date" type="date" className={DATE_CLS} {...register('date', { required: 'Date requise' })} />
          {errors.date && <p className="text-xs text-[#E8622A]">{errors.date.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="ev-time">🕐 Heure</Label>
          <Input id="ev-time" type="time" className={DATE_CLS} {...register('time', { required: 'Heure requise' })} />
        </div>
      </div>

      {type === 'match' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="ev-opponent">Adversaire</Label>
            <Input id="ev-opponent" placeholder="FC Caen" {...register('opponent')} />
          </div>
          <div className="flex items-end pb-2 gap-2">
            <input type="checkbox" id="ev-is-home" {...register('is_home')} className="h-4 w-4 rounded accent-[#2A9D4E]" />
            <Label htmlFor="ev-is-home">Domicile</Label>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Création...' : 'Créer'}</Button>
      </div>
    </form>
  )
}
