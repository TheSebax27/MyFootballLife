import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { CareerProvider } from '@/contexts/CareerContext'
import { cn } from '@/utils/cn'

const SECTIONS = [
  { label: 'Resumen', path: '', end: true },
  { label: 'Temporadas', path: 'seasons', end: false },
  { label: 'Partidos', path: 'matches', end: false, disabled: true },
  { label: 'Fichajes', path: 'transfers', end: false, disabled: true },
  { label: 'Plantilla', path: 'squad', end: false, disabled: true },
  { label: 'Títulos', path: 'titles', end: false, disabled: true },
  { label: 'Estadísticas', path: 'statistics', end: false, disabled: true },
]

export function CareerLayout() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <CareerProvider onNotFound={() => navigate('/careers', { replace: true })}>
      <AppShell>
        {/* Career section tabs */}
        <div className="border-b bg-card/50">
          <div className="mx-auto max-w-6xl overflow-x-auto px-4">
            <nav className="flex gap-1 py-2" aria-label="Secciones de la carrera">
              {SECTIONS.map(({ label, path, end, disabled }) => {
                const to = `/careers/${id}${path ? `/${path}` : ''}`
                if (disabled) {
                  return (
                    <span
                      key={path}
                      className="rounded-md px-3 py-1.5 text-sm text-muted-foreground/50 cursor-not-allowed select-none whitespace-nowrap"
                      title="Próximamente"
                    >
                      {label}
                    </span>
                  )
                }
                return (
                  <NavLink
                    key={path || 'index'}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        'rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      )
                    }
                  >
                    {label}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>

        <Outlet />
      </AppShell>
    </CareerProvider>
  )
}
