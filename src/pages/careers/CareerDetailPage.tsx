import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Pencil, Archive, Trash2, AlertTriangle,
  CalendarDays, Gamepad2, Trophy, TrendingUp,
  ArrowLeftRight, Users, BarChart2, Star, Target, Square,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useCareer } from '@/hooks/useCareer'
import { MODE_LABEL, STATUS_VARIANT, STATUS_LABEL } from '@/contexts/CareerContext'
import { supabase } from '@/services/supabase/client'
import { cn } from '@/utils/cn'
import type { SeasonRow } from '@/types/database'

type CareerStats = {
  seasons: number
  matches: number
  wins: number
  titles: number
  goals: number
  yellow_cards: number
}

export function CareerDetailPage() {
  const { career, refreshCareer } = useCareer()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState<CareerStats | null>(null)
  const [currentSeason, setCurrentSeason] = useState<SeasonRow | null>(null)

  useEffect(() => {
    async function load() {
      const [
        { count: seasonsCount },
        { data: matchRows },
        { count: titlesCount },
        { data: seasonRows },
        { data: matchEvents },
      ] = await Promise.all([
        supabase.from('seasons').select('id', { count: 'exact', head: true }).eq('career_id', career.id),
        supabase.from('matches').select('result, goals_for').eq('career_id', career.id),
        supabase.from('career_titles').select('id', { count: 'exact', head: true }).eq('career_id', career.id),
        supabase.from('seasons').select('*').eq('career_id', career.id).order('start_year', { ascending: false }).limit(5),
        supabase.from('match_events').select('event_type').eq('career_id', career.id).in('event_type', ['goal', 'yellow_card']),
      ])

      const matches = matchRows ?? []
      const wins = matches.filter((m) => m.result === 'W').length
      const goals = (matchEvents ?? []).filter((e) => e.event_type === 'goal').length
      const yellowCards = (matchEvents ?? []).filter((e) => e.event_type === 'yellow_card').length

      setStats({
        seasons: seasonsCount ?? 0,
        matches: matches.length,
        wins,
        titles: titlesCount ?? 0,
        goals,
        yellow_cards: yellowCards,
      })

      const seasons = seasonRows ?? []
      const active = seasons.find((s) => s.status === 'in_progress') ?? seasons[0] ?? null
      setCurrentSeason(active)
    }
    load()
  }, [career.id])

  async function handleDelete() {
    if (!user) return
    setDeleting(true)
    await supabase.from('careers').delete().eq('id', career.id).eq('owner_id', user.id)
    navigate('/careers', { replace: true })
  }

  async function handleArchive() {
    if (!user) return
    const nextStatus = career.status === 'active' ? 'finished' : 'active'
    await supabase.from('careers').update({ status: nextStatus }).eq('id', career.id).eq('owner_id', user.id)
    await refreshCareer()
  }

  const isPlayer = career.mode === 'player'

  const quickNav = isPlayer
    ? [
        { label: 'Temporadas', path: 'seasons', icon: CalendarDays, color: 'text-blue-400' },
        { label: 'Partidos', path: 'matches', icon: Gamepad2, color: 'text-primary' },
        { label: 'Traspasos', path: 'transfers', icon: ArrowLeftRight, color: 'text-orange-400' },
        { label: 'Títulos', path: 'titles', icon: Trophy, color: 'text-yellow-400' },
        { label: 'Premios', path: 'player-awards', icon: Star, color: 'text-pink-400' },
        { label: 'Estadísticas', path: 'statistics', icon: BarChart2, color: 'text-emerald-400' },
      ]
    : [
        { label: 'Temporadas', path: 'seasons', icon: CalendarDays, color: 'text-blue-400' },
        { label: 'Partidos', path: 'matches', icon: Gamepad2, color: 'text-primary' },
        { label: 'Fichajes', path: 'transfers', icon: ArrowLeftRight, color: 'text-orange-400' },
        { label: 'Plantilla', path: 'squad', icon: Users, color: 'text-cyan-400' },
        { label: 'Títulos', path: 'titles', icon: Trophy, color: 'text-yellow-400' },
        { label: 'Estadísticas', path: 'statistics', icon: BarChart2, color: 'text-emerald-400' },
      ]

  const statCards = isPlayer
    ? [
        { label: 'Temporadas', value: stats?.seasons ?? '—', icon: CalendarDays, color: 'text-blue-400' },
        { label: 'Partidos', value: stats?.matches ?? '—', icon: Gamepad2, color: 'text-primary' },
        { label: 'Goles', value: stats?.goals ?? '—', icon: Target, color: 'text-primary' },
        { label: 'Títulos', value: stats?.titles ?? '—', icon: Trophy, color: 'text-yellow-400' },
      ]
    : [
        { label: 'Temporadas', value: stats?.seasons ?? '—', icon: CalendarDays, color: 'text-blue-400' },
        { label: 'Partidos', value: stats?.matches ?? '—', icon: Gamepad2, color: 'text-primary' },
        { label: 'Victorias', value: stats?.wins ?? '—', icon: TrendingUp, color: 'text-emerald-400' },
        { label: 'Títulos', value: stats?.titles ?? '—', icon: Trophy, color: 'text-yellow-400' },
      ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {career.game && <Badge variant="secondary">{career.game.name}</Badge>}
            <Badge variant="outline">{MODE_LABEL[career.mode] ?? career.mode}</Badge>
            <Badge variant={STATUS_VARIANT[career.status] ?? 'secondary'}>
              {STATUS_LABEL[career.status] ?? career.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{career.name}</h1>
          {career.manager_name && <p className="text-muted-foreground">{career.manager_name}</p>}
          {career.description && (
            <p className="max-w-xl text-sm text-muted-foreground">{career.description}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/careers/${career.id}/edit`}>
              <Pencil className="size-4" />
              Editar
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleArchive} title={career.status === 'active' ? 'Finalizar' : 'Reactivar'}>
            <Archive className="size-4" />
            {career.status === 'active' ? 'Finalizar' : 'Reactivar'}
          </Button>
          <Button
            variant="outline" size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="font-medium text-destructive">¿Eliminar esta carrera?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Se eliminarán todas las temporadas, partidos, fichajes y estadísticas. Esta acción no se puede deshacer.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Current season banner */}
      {currentSeason && (
        <div className="mb-6 flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 px-5 py-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <CalendarDays className="size-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
              {currentSeason.status === 'in_progress' ? 'Temporada en curso' : 'Última temporada'}
            </p>
            <p className="font-semibold leading-tight">
              {currentSeason.label}
              {currentSeason.club_name && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  · {currentSeason.club_name}
                </span>
              )}
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0 border-primary/30 text-primary hover:bg-primary/10">
            <Link to={`/careers/${career.id}/seasons`}>Ver temporadas</Link>
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-4">
            <div className={cn('rounded-lg bg-background p-2', color)}>
              <Icon className="size-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className={cn('text-2xl font-bold tabular-nums', color)}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick nav */}
      <div className="mb-2 flex items-center gap-2">
        <span className="font-black text-primary">//</span>
        <h2 className="text-base font-bold">Secciones</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {quickNav.map(({ label, path, icon: Icon, color }) => (
          <Link
            key={path}
            to={`/careers/${career.id}/${path}`}
            className="group flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card px-4 py-5 transition-all hover:border-primary/40 hover:bg-primary/5"
          >
            <div className={cn('rounded-xl bg-background p-3 transition-colors group-hover:bg-primary/10', color)}>
              <Icon className="size-5" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">
              {label}
            </span>
          </Link>
        ))}
      </div>

      {/* Player extra stats */}
      {isPlayer && stats && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-border/40 bg-card px-5 py-3.5">
          <div className="flex flex-1 flex-col items-center gap-0.5 border-r border-border/40">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="size-3" /> Goles
            </span>
            <span className="text-lg font-bold text-primary">{stats.goals}</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-0.5 border-r border-border/40">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Square className="size-3 fill-yellow-400 text-yellow-400" /> Tarjetas
            </span>
            <span className="text-lg font-bold text-yellow-400">{stats.yellow_cards}</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-0.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="size-3" /> Victorias
            </span>
            <span className="text-lg font-bold text-emerald-400">{stats.wins}</span>
          </div>
        </div>
      )}
    </div>
  )
}
