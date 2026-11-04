import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Briefcase, Trophy, TrendingUp, Gamepad2, ChevronRight, Clock } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { supabase } from '@/services/supabase/client'
import { cn } from '@/utils/cn'
import type { CareerRow } from '@/types/database'

type Stats = { careers: number; titles: number }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `hace ${days}d`
  return new Date(dateStr).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

export function DashboardPage() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [stats, setStats] = useState<Stats>({ careers: 0, titles: 0 })
  const [recentCareers, setRecentCareers] = useState<CareerRow[]>([])
  const [loading, setLoading] = useState(true)

  const greeting = profile?.display_name || profile?.username || 'Entrenador'
  const hour = new Date().getHours()
  const saludo = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  const dateLabel = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })

  useEffect(() => {
    if (!user) return
    async function load() {
      const [{ count: careersCount }, { data: careerRows }] = await Promise.all([
        supabase.from('careers').select('id', { count: 'exact', head: true }).eq('owner_id', user!.id),
        supabase.from('careers').select('*').eq('owner_id', user!.id).order('updated_at', { ascending: false }).limit(4),
      ])

      const ids = (careerRows ?? []).map((c) => c.id)
      let titlesCount = 0
      if (ids.length > 0) {
        const { count } = await supabase.from('titles').select('id', { count: 'exact', head: true }).in('career_id', ids)
        titlesCount = count ?? 0
      }

      setStats({ careers: careersCount ?? 0, titles: titlesCount })
      setRecentCareers(careerRows ?? [])
      setLoading(false)
    }
    load()
  }, [user?.id])

  const statCards = [
    { label: 'Carreras', value: stats.careers, icon: Briefcase, color: 'text-primary' },
    { label: 'Partidos', value: '—', icon: Gamepad2, color: 'text-blue-400', soon: true },
    { label: 'Victorias', value: '—', icon: TrendingUp, color: 'text-emerald-400', soon: true },
    { label: 'Títulos', value: stats.titles, icon: Trophy, color: 'text-yellow-400' },
  ]

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground capitalize">{dateLabel}</p>
            <h1 className="mt-0.5 text-3xl font-bold tracking-tight">
              {saludo},{' '}
              <span className="text-primary">{greeting}</span>
            </h1>
          </div>
          <Button asChild className="gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary/90 sm:self-start">
            <Link to="/careers/new">
              <Plus className="size-4" />
              Nueva carrera
            </Link>
          </Button>
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, color, soon }) => (
            <div
              key={label}
              className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5"
            >
              {/* Subtle glow */}
              <div className="pointer-events-none absolute -right-4 -top-4 size-20 rounded-full bg-primary/5" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className={cn('mt-2 text-4xl font-bold tabular-nums', color)}>
                    {loading && typeof value === 'number' ? '—' : value}
                  </p>
                  {soon && (
                    <p className="mt-1 text-[11px] text-muted-foreground/50">Módulo de partidos próximamente</p>
                  )}
                </div>
                <div className={cn('rounded-lg bg-background p-2', color)}>
                  <Icon className="size-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent careers */}
        {recentCareers.length > 0 ? (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Carreras recientes</h2>
              <Link to="/careers" className="flex items-center gap-1 text-sm text-primary hover:underline">
                Ver todas <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentCareers.map((career) => (
                <Link
                  key={career.id}
                  to={`/careers/${career.id}`}
                  className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-colors hover:border-primary/40 hover:bg-card/80"
                >
                  <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5 transition-transform group-hover:translate-x-6 group-hover:-translate-y-6" />

                  <div className="mb-3 flex items-center justify-between">
                    <span className={cn(
                      'rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                      career.mode === 'manager'
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-emerald-500/15 text-emerald-400',
                    )}>
                      {career.mode === 'manager' ? 'DT' : 'Jugador'}
                    </span>
                    {career.updated_at && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="size-2.5" />
                        {timeAgo(career.updated_at)}
                      </span>
                    )}
                  </div>

                  <p className="font-semibold leading-snug">{career.name}</p>
                  {career.club_name && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{career.club_name}</p>
                  )}
                  {career.league_name && (
                    <p className="mt-0.5 text-xs text-muted-foreground/60">{career.league_name}</p>
                  )}

                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Continuar <ChevronRight className="size-3" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          !loading && (
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border/50 py-20 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                <Trophy className="size-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold">Tu historia comienza aquí</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Crea tu primera carrera y empieza a registrar cada temporada, título y estadística.
                </p>
              </div>
              <Button asChild className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
                <Link to="/careers/new">
                  <Plus className="size-4" />
                  Crear primera carrera
                </Link>
              </Button>
            </div>
          )
        )}
      </div>
    </AppShell>
  )
}
