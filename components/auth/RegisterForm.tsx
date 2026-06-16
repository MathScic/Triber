'use client'

import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'

interface RegisterData {
  lastName: string
  firstName: string
  email: string
  password: string
  confirmPassword: string
}

export function RegisterForm() {
  const { register: registerUser, loading, error } = useAuth()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterData>()

  const onSubmit = (data: RegisterData) =>
    registerUser(data.email, data.password, `${data.firstName} ${data.lastName}`)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && (
        <p className="text-sm text-[#E8622A] bg-[#FDF0EB] rounded-xl px-3 py-2.5">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="lastName">Nom</Label>
        <Input
          id="lastName"
          autoComplete="family-name"
          placeholder="Dupont"
          {...register('lastName', { required: 'Nom requis' })}
        />
        {errors.lastName && (
          <p className="text-xs text-[#E8622A]">{errors.lastName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="firstName">Prénom</Label>
        <Input
          id="firstName"
          autoComplete="given-name"
          placeholder="Marie"
          {...register('firstName', { required: 'Prénom requis' })}
        />
        {errors.firstName && (
          <p className="text-xs text-[#E8622A]">{errors.firstName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="president@monclub.fr"
          {...register('email', {
            required: 'Email requis',
            pattern: { value: /\S+@\S+\.\S+/, message: 'Email invalide' },
          })}
        />
        {errors.email && (
          <p className="text-xs text-[#E8622A]">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          {...register('password', {
            required: 'Mot de passe requis',
            minLength: { value: 8, message: '8 caractères minimum' },
          })}
        />
        {errors.password && (
          <p className="text-xs text-[#E8622A]">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          {...register('confirmPassword', {
            required: 'Confirmation requise',
            validate: (v) =>
              v === watch('password') ||
              'Les mots de passe ne correspondent pas',
          })}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-[#E8622A]">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Création…' : 'Créer mon compte'}
      </Button>

      <p className="text-center text-sm text-[#7A8070]">
        Déjà un compte ?{' '}
        <Link
          href="/login"
          className="text-[#E8622A] font-semibold hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </form>
  )
}
