import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Briefcase, Trophy, TrendingUp, Gamepad2,
  ChevronRight, Clock, Shield, User, Play,
  MoreHorizontal, Zap, Calendar, CheckCircle, XCircle, Target, Square,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useGames } from '@/hooks/useGames'
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

function seasonLabel(startYear: number | null) {
  if (!startYear) return null
  return `${startYear}/${(startYear + 1).toString().slice(2)}`
}

export function DashboardPage() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const games = useGames()
  const [stats, setStats] = useState<Stats>({ careers: 0, titles: 0 })
  const [recentCareers, setRecentCareers] = useState<CareerRow[]>([])
  const [loading, setLoading] = useState(true)

  const greeting = profile?.display_name || profile?.username || 'Entrenador'
  const hour = new Date().getHours()
  const saludo = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  const dateLabel = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })

  const gameMap = Object.fromEntries(games.map((g) => [g.id, g.name]))

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
    { label: 'Partidos', value: 0, icon: Gamepad2, color: 'text-blue-400' },
    { label: 'Victorias', value: 0, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Títulos', value: stats.titles, icon: Trophy, color: 'text-yellow-400' },
  ]

  return (
    <AppShell>
      <div className="flex h-[calc(100svh-3.5rem)]">

        {/* ── Left: scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">

          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary/70 capitalize">
                {dateLabel}
              </p>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                {saludo},{' '}
                <span className="text-primary">{greeting}</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Tu historia futbolística en un solo lugar.
              </p>
            </div>
            <Button
              asChild
              className="shrink-0 gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/careers/new">
                <Plus className="size-4" />
                Nueva carrera
              </Link>
            </Button>
          </div>

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-4"
              >
                <div className={cn('rounded-lg bg-background p-2.5', color)}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <p className={cn('text-2xl font-bold tabular-nums', color)}>
                    {loading && label !== 'Partidos' && label !== 'Victorias' ? '—' : value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent careers */}
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <span className="font-black text-primary">//</span>
              Carreras recientes
            </h2>
            {recentCareers.length > 0 && (
              <Link
                to="/careers"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Ver todas <ChevronRight className="size-3.5" />
              </Link>
            )}
          </div>

          {recentCareers.length > 0 ? (
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              {recentCareers.map((career) => (
                <div
                  key={career.id}
                  className="overflow-hidden rounded-xl border border-border/50 bg-card"
                >
                  <div className="px-4 pt-4 pb-3">
                    <div className="flex items-start gap-3">
                      {/* Badge placeholder */}
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background">
                        {career.mode === 'manager' ? (
                          <Shield className="size-5 text-muted-foreground" />
                        ) : (
                          <User className="size-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                              career.mode === 'manager'
                                ? 'bg-blue-500/15 text-blue-400'
                                : 'bg-emerald-500/15 text-emerald-400',
                            )}
                          >
                            {career.mode === 'manager' ? 'DT' : 'Jugador'}
                          </span>
                          {career.updated_at && (
                            <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="size-3" />
                              {timeAgo(career.updated_at)}
                            </span>
                          )}
                        </div>

                        <p className="truncate font-bold leading-tight">{career.name}</p>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Gamepad2 className="size-3" />
                            {gameMap[career.game_id] ?? 'EA FC 25'}
                          </span>
                          {career.start_year && (
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3" />
                              Temporada: {seasonLabel(career.start_year)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="mt-3 flex items-stretch border-t border-border/40 pt-3">
                      <div className="flex flex-1 flex-col items-center gap-0.5">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Gamepad2 className="size-3" /> Partidos
                        </span>
                        <span className="text-sm font-bold">0</span>
                      </div>
                      <div className="mx-1 w-px self-stretch bg-border/40" />
                      {career.mode === 'manager' ? (
                        <>
                          <div className="flex flex-1 flex-col items-center gap-0.5">
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <CheckCircle className="size-3" /> Victorias
                            </span>
                            <span className="text-sm font-bold text-emerald-400">0</span>
                          </div>
                          <div className="mx-1 w-px self-stretch bg-border/40" />
                          <div className="flex flex-1 flex-col items-center gap-0.5">
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <XCircle className="size-3" /> Derrotas
                            </span>
                            <span className="text-sm font-bold text-red-400">0</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-1 flex-col items-center gap-0.5">
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Target className="size-3" /> Goles
                            </span>
                            <span className="text-sm font-bold text-primary">0</span>
                          </div>
                          <div className="mx-1 w-px self-stretch bg-border/40" />
                          <div className="flex flex-1 flex-col items-center gap-0.5">
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Square className="size-3 fill-yellow-400 text-yellow-400" /> Tarjetas
                            </span>
                            <span className="text-sm font-bold text-yellow-400">0</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="flex items-center gap-2 border-t border-border/40 px-3 py-2.5">
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 gap-1.5 border-0 bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20"
                    >
                      <Link to={`/careers/${career.id}`}>
                        <Play className="size-3 fill-current" />
                        Continuar carrera
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/50 py-14 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Trophy className="size-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Tu historia comienza aquí</p>
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

          {/* Activity feed */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <span className="font-black text-primary">//</span>
                Última actividad
              </h2>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card px-4 py-8 text-center">
              <Zap className="size-8 text-muted-foreground/25" />
              <p className="text-sm text-muted-foreground">
                El registro de actividad estará disponible próximamente.
              </p>
            </div>
          </div>
        </div>

        {/* ── Right panel: player (integrated, no bg) ── */}
        <div className="relative hidden w-[380px] shrink-0 lg:block xl:w-[440px]">

          {/* Green diagonal swoosh — right edge accent */}
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-full w-28 overflow-hidden"
          >
            <div
              className="absolute inset-y-0 right-0 w-full origin-top-right"
              style={{
                background: 'linear-gradient(to left, oklch(0.68 0.17 150 / 0.55) 0%, oklch(0.68 0.17 150 / 0.15) 50%, transparent 100%)',
                clipPath: 'polygon(55% 8%, 100% 0%, 100% 100%, 45% 92%)',
              }}
            />
          </div>

          {/* Player image */}
          <img
            src="/images/hero-player.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 h-[75%] max-h-[560px] w-auto -translate-x-1/2 select-none object-contain object-bottom"
            style={{ filter: 'drop-shadow(-8px 0 32px rgba(0,0,0,0.6))' }}
          />

          {/* Leg fade */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-[32%]"
            style={{ background: 'linear-gradient(to top, var(--background) 0%, var(--background) 15%, transparent 100%)' }}
          />

          {/* Tagline */}
          <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2">
            <img src="/images/logo.webp" alt="" aria-hidden className="h-5 w-auto object-contain opacity-70" />
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60">
              Juega • Gestiona • Conquista
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
