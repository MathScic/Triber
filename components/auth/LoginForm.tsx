'use client'

import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'

interface LoginData {
  email: string
  password: string
}

export function LoginForm() {
  const { login, loading, error } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>()

  const onSubmit = (data: LoginData) => login(data.email, data.password)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {error && (
        <p className="text-sm text-secondary bg-secondary-light rounded-xl px-3 py-2.5">
          {error}
        </p>
      )}

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
          <p className="text-xs text-secondary">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register('password', { required: 'Mot de passe requis' })}
        />
        {errors.password && (
          <p className="text-xs text-secondary">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Connexion…' : 'Se connecter'}
      </Button>

      <p className="text-center text-sm text-[#6B7280]">
        Pas encore de compte ?{' '}
        <Link
          href="/register"
          className="text-secondary font-semibold hover:underline"
        >
          Créer mon compte
        </Link>
      </p>
    </form>
  )
}
