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
    <AuthLayout title="Bienvenido de vuelta" description="Ingresa a tu cuenta para continuar." image="/images/login1.jpg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
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
              className="text-xs underline-offset-4 hover:underline"
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
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{serverError}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="animate-spin" />}
          Iniciar sesión
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-white/30">o</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <p className="mt-5 text-center text-sm">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-medium underline-offset-4 hover:underline">
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
