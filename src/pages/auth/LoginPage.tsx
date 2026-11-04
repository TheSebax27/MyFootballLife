import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginFormValues } from '@/schemas/auth'

export function LoginPage() {
  const { signIn, user } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  if (user) return <Navigate to="/dashboard" replace />

  async function onSubmit(values: LoginFormValues) {
    setServerError(null)
    const { error } = await signIn(values.email, values.password)
    if (error) {
      setServerError(translateAuthError(error.message))
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout title="Iniciar sesión" description="Ingresa a tu cuenta para continuar.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              to="/forgot-password"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {serverError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Iniciar sesión
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-primary underline-offset-4 hover:underline">
          Registrarse
        </Link>
      </p>
    </AuthLayout>
  )
}

function translateAuthError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (msg.includes('Email not confirmed')) return 'Verifica tu correo antes de ingresar.'
  if (msg.includes('Too many requests')) return 'Demasiados intentos. Espera unos minutos.'
  return 'Ocurrió un error. Intenta nuevamente.'
}
