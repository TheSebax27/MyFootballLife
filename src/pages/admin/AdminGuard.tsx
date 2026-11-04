import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useProfile } from '@/hooks/useProfile'

export function AdminGuard({ children }: { children: ReactNode }) {
  const { profile, loading } = useProfile()
  if (loading) return null
  if (!profile?.is_admin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
