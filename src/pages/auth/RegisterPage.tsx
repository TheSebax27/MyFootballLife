import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { registerSchema, type RegisterFormValues } from '@/schemas/auth'

export function RegisterPage() {
  const { signUp, user } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  if (user) return <Navigate to="/dashboard" replace />

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null)
    const { error } = await signUp(values.email, values.password)
    if (error) {
      setServerError(translateAuthError(error.message))
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <AuthLayout title="Revisa tu correo" description="Te enviamos un enlace de verificación. Haz clic en él para activar tu cuenta.">
        <p className="text-sm text-muted-foreground">
          ¿No lo ves?{' '}
          <button className="text-primary underline-offset-4 hover:underline" onClick={() => setSuccess(false)}>
            Volver al registro
          </button>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Crear cuenta" description="Ingresa tus datos para registrarte.">
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
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repite la contraseña"
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {serverError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Crear cuenta
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-primary underline-offset-4 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  )
}

function translateAuthError(msg: string): string {
  if (msg.includes('already registered') || msg.includes('User already registered'))
    return 'Este correo ya está registrado.'
  if (msg.includes('Password should be at least'))
    return 'La contraseña debe tener al menos 6 caracteres.'
  if (msg.includes('Invalid email')) return 'El correo no es válido.'
  return 'Ocurrió un error. Intenta nuevamente.'
}
