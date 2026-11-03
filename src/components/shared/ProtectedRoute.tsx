import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

type ProtectedRouteProps = {
  /** Cuando es true (default), redirige a /setup-profile si el perfil no está completo. */
  requireOnboarding?: boolean
}

export function ProtectedRoute({ requireOnboarding = true }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useProfile()

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (requireOnboarding && profile && !profile.onboarding_completed) {
    return <Navigate to="/setup-profile" replace />
  }

  return <Outlet />
}
