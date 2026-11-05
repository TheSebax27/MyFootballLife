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
import { MatchesPage } from '@/pages/careers/matches/MatchesPage'
import { NewMatchPage } from '@/pages/careers/matches/NewMatchPage'
import { MatchDetailPage } from '@/pages/careers/matches/MatchDetailPage'
import { MatchEditPage } from '@/pages/careers/matches/MatchEditPage'
import { TransfersPage } from '@/pages/careers/transfers/TransfersPage'
import { NewTransferPage } from '@/pages/careers/transfers/NewTransferPage'
import { TransferDetailPage } from '@/pages/careers/transfers/TransferDetailPage'
import { TransferEditPage } from '@/pages/careers/transfers/TransferEditPage'
import { StatisticsPage } from '@/pages/careers/statistics/StatisticsPage'
import { TitlesPage } from '@/pages/careers/titles/TitlesPage'
import { NewTitlePage } from '@/pages/careers/titles/NewTitlePage'
import { TitleDetailPage } from '@/pages/careers/titles/TitleDetailPage'
import { TitleEditPage } from '@/pages/careers/titles/TitleEditPage'
import { SquadPage } from '@/pages/careers/squad/SquadPage'
import { NewSquadPlayerPage } from '@/pages/careers/squad/NewSquadPlayerPage'
import { SquadPlayerDetailPage } from '@/pages/careers/squad/SquadPlayerDetailPage'
import { SquadPlayerEditPage } from '@/pages/careers/squad/SquadPlayerEditPage'
import { PlayerAwardsPage } from '@/pages/careers/awards/PlayerAwardsPage'
import { AdminGuard } from '@/pages/admin/AdminGuard'
import { AdminPage } from '@/pages/admin/AdminPage'
import { AdminLeaguesPage } from '@/pages/admin/AdminLeaguesPage'
import { AdminClubsPage } from '@/pages/admin/AdminClubsPage'
import { AdminCompetitionsPage } from '@/pages/admin/AdminCompetitionsPage'

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
            <Route path="matches" element={<MatchesPage />} />
            <Route path="matches/new" element={<NewMatchPage />} />
            <Route path="matches/:matchId" element={<MatchDetailPage />} />
            <Route path="matches/:matchId/edit" element={<MatchEditPage />} />
            <Route path="transfers" element={<TransfersPage />} />
            <Route path="transfers/new" element={<NewTransferPage />} />
            <Route path="transfers/:transferId" element={<TransferDetailPage />} />
            <Route path="transfers/:transferId/edit" element={<TransferEditPage />} />
            <Route path="squad" element={<SquadPage />} />
            <Route path="squad/new" element={<NewSquadPlayerPage />} />
            <Route path="squad/:squadId" element={<SquadPlayerDetailPage />} />
            <Route path="squad/:squadId/edit" element={<SquadPlayerEditPage />} />
            <Route path="titles" element={<TitlesPage />} />
            <Route path="titles/new" element={<NewTitlePage />} />
            <Route path="titles/:titleId" element={<TitleDetailPage />} />
            <Route path="titles/:titleId/edit" element={<TitleEditPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="player-awards" element={<PlayerAwardsPage />} />
          </Route>
        </Route>

        {/* Admin — solo is_admin = true */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminGuard><AdminPage /></AdminGuard>} />
          <Route path="/admin/leagues" element={<AdminGuard><AdminLeaguesPage /></AdminGuard>} />
          <Route path="/admin/clubs" element={<AdminGuard><AdminClubsPage /></AdminGuard>} />
          <Route path="/admin/competitions" element={<AdminGuard><AdminCompetitionsPage /></AdminGuard>} />
        </Route>

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
