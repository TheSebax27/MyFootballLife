import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ProfileSetupPage } from '@/pages/profile/ProfileSetupPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { CareersPage } from '@/pages/careers/CareersPage'
import { NewCareerPage } from '@/pages/careers/NewCareerPage'
import { EditCareerPage } from '@/pages/careers/EditCareerPage'
import { CareerLayout } from '@/components/layout/CareerLayout'
import { CareerDetailPage } from '@/pages/careers/CareerDetailPage'
import { SeasonsPage } from '@/pages/careers/seasons/SeasonsPage'
import { NewSeasonPage } from '@/pages/careers/seasons/NewSeasonPage'
import { SeasonDetailPage } from '@/pages/careers/seasons/SeasonDetailPage'
import { SeasonEditPage } from '@/pages/careers/seasons/SeasonEditPage'

function App() {
  const { loading: authLoading } = useAuth()
  const { loading: profileLoading } = useProfile()

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Solo autenticado (sin chequeo de onboarding) */}
        <Route element={<ProtectedRoute requireOnboarding={false} />}>
          <Route path="/setup-profile" element={<ProfileSetupPage />} />
        </Route>

        {/* Autenticado + onboarding completo */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/careers/new" element={<NewCareerPage />} />
          <Route path="/careers/:id/edit" element={<EditCareerPage />} />

          {/* Career nested layout */}
          <Route path="/careers/:id" element={<CareerLayout />}>
            <Route index element={<CareerDetailPage />} />
            <Route path="seasons" element={<SeasonsPage />} />
            <Route path="seasons/new" element={<NewSeasonPage />} />
            <Route path="seasons/:seasonId" element={<SeasonDetailPage />} />
            <Route path="seasons/:seasonId/edit" element={<SeasonEditPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
