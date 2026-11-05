import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { CareerProvider } from '@/contexts/CareerContext'

export function CareerLayout() {
  const { id: _id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <CareerProvider onNotFound={() => navigate('/careers', { replace: true })}>
      <AppShell>
        <Outlet />
      </AppShell>
    </CareerProvider>
  )
}
