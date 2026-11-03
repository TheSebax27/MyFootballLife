import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { supabase } from '@/services/supabase/client'
import { profileSetupSchema, type ProfileSetupValues } from '@/schemas/profile'

export function ProfileSetupPage() {
  const { user } = useAuth()
  const { profile, refreshProfile } = useProfile()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSetupValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      username: profile?.username ?? '',
      display_name: profile?.display_name ?? '',
    },
  })

  if (profile?.onboarding_completed) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(values: ProfileSetupValues) {
    if (!user) return
    setServerError(null)

    const { error } = await supabase
      .from('profiles')
      .update({
        username: values.username,
        display_name: values.display_name || null,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    if (error) {
      if (error.code === '23505') {
        setServerError('Ese nombre de usuario ya está en uso.')
      } else {
        setServerError('Ocurrió un error. Intenta nuevamente.')
      }
      return
    }

    await refreshProfile()
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout
      title="Personaliza tu perfil"
      description="Elige cómo te verán los demás en MyLifeFootball."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="username">
            Nombre de usuario <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center rounded-md border border-input bg-transparent px-3 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
            <span className="select-none text-sm text-muted-foreground">@</span>
            <Input
              id="username"
              autoComplete="username"
              placeholder="tu_usuario"
              aria-invalid={!!errors.username}
              className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 pl-1"
              {...register('username')}
            />
          </div>
          <p className="text-xs text-muted-foreground">3–30 caracteres. Solo minúsculas, números y _</p>
          {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="display_name">
            Nombre para mostrar <span className="text-muted-foreground text-xs">(opcional)</span>
          </Label>
          <Input
            id="display_name"
            autoComplete="name"
            placeholder="Ej. Sebastián"
            aria-invalid={!!errors.display_name}
            {...register('display_name')}
          />
          {errors.display_name && (
            <p className="text-xs text-destructive">{errors.display_name.message}</p>
          )}
        </div>

        {serverError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Continuar
        </Button>
      </form>
    </AuthLayout>
  )
}
