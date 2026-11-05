import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  CalendarDays, Gamepad2, ArrowLeftRight, Users, Trophy,
  BarChart2, Star, Home,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { CareerProvider } from '@/contexts/CareerContext'
import { useCareer } from '@/hooks/useCareer'
import { cn } from '@/utils/cn'

type Section = {
  label: string
  path: string
  icon: React.ElementType
  color: string
}

const MANAGER_SECTIONS: Section[] = [
  { label: 'Temporadas', path: 'seasons', icon: CalendarDays, color: 'text-blue-400' },
  { label: 'Partidos', path: 'matches', icon: Gamepad2, color: 'text-primary' },
  { label: 'Fichajes', path: 'transfers', icon: ArrowLeftRight, color: 'text-orange-400' },
  { label: 'Plantilla', path: 'squad', icon: Users, color: 'text-cyan-400' },
  { label: 'Títulos', path: 'titles', icon: Trophy, color: 'text-yellow-400' },
  { label: 'Estadísticas', path: 'statistics', icon: BarChart2, color: 'text-emerald-400' },
]

const PLAYER_SECTIONS: Section[] = [
  { label: 'Temporadas', path: 'seasons', icon: CalendarDays, color: 'text-blue-400' },
  { label: 'Partidos', path: 'matches', icon: Gamepad2, color: 'text-primary' },
  { label: 'Traspasos', path: 'transfers', icon: ArrowLeftRight, color: 'text-orange-400' },
  { label: 'Títulos', path: 'titles', icon: Trophy, color: 'text-yellow-400' },
  { label: 'Premios', path: 'player-awards', icon: Star, color: 'text-pink-400' },
  { label: 'Estadísticas', path: 'statistics', icon: BarChart2, color: 'text-emerald-400' },
]

function CareerIconNav({ id }: { id: string }) {
  const { career } = useCareer()
  const sections = career.mode === 'player' ? PLAYER_SECTIONS : MANAGER_SECTIONS

  return (
    <div className="border-b bg-card/30">
      <div className="mx-auto max-w-6xl overflow-x-auto px-4 py-2">
        <div className="flex gap-2">
          {/* Home tile */}
          <NavLink
            to={`/careers/${id}`}
            end
            className={({ isActive }) =>
              cn(
                'flex shrink-0 flex-col items-center gap-1 rounded-xl border border-border/50 bg-card px-3 py-2 transition-all hover:border-primary/40 hover:bg-primary/5',
                isActive && 'border-primary/40 bg-primary/5',
              )
            }
          >
            <Home className="size-4 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground">Inicio</span>
          </NavLink>

          {sections.map(({ label, path, icon: Icon, color }) => (
            <NavLink
              key={path}
              to={`/careers/${id}/${path}`}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 flex-col items-center gap-1 rounded-xl border border-border/50 bg-card px-3 py-2 transition-all hover:border-primary/40 hover:bg-primary/5',
                  isActive && 'border-primary/40 bg-primary/5',
                )
              }
            >
              <Icon className={cn('size-4', color)} />
              <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}

function CareerLayoutInner({ id }: { id: string }) {
  const { pathname } = useLocation()
  const isResumen = pathname === `/careers/${id}`

  return (
    <>
      {!isResumen && <CareerIconNav id={id} />}
      <Outlet />
    </>
  )
}

export function CareerLayout() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <CareerProvider onNotFound={() => navigate('/careers', { replace: true })}>
      <AppShell>
        <CareerLayoutInner id={id!} />
      </AppShell>
    </CareerProvider>
  )
}
