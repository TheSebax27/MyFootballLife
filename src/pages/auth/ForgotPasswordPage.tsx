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
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/schemas/auth'

export function ForgotPasswordPage() {
  const { resetPassword, user } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) })

  if (user) return <Navigate to="/dashboard" replace />

  async function onSubmit(values: ForgotPasswordFormValues) {
    setServerError(null)
    const { error } = await resetPassword(values.email)
    if (error) {
      setServerError('Ocurrió un error. Intenta nuevamente.')
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <AuthLayout
        title="Revisa tu correo"
        description="Si ese correo está registrado, recibirás un enlace para restablecer tu contraseña."
      >
        <Link to="/login" className="text-sm text-primary underline-offset-4 hover:underline">
          Volver al inicio de sesión
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      description="Ingresa tu correo y te enviaremos un enlace para restablecerla."
    >
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

        {serverError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Enviar enlace
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link to="/login" className="text-primary underline-offset-4 hover:underline">
          Volver al inicio de sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
