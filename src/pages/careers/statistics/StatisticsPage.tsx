import { useEffect, useState } from 'react'
import { Trophy, Target, Shield, TrendingUp, Users } from 'lucide-react'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { SeasonRow } from '@/types/database'

interface MatchRow {
  goals_for: number
  goals_against: number
}

interface SquadStatRow {
  player_name: string
  goals: number
  assists: number
  appearances: number
  avg_rating: number | null
}

interface Stats {
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  cleanSheets: number
  titles: number
  topScorers: SquadStatRow[]
  topAssisters: SquadStatRow[]
  topRated: SquadStatRow[]
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

export function StatisticsPage() {
  const { career } = useCareer()
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('seasons')
      .select('*')
      .eq('career_id', career.id)
      .order('start_year', { ascending: false })
      .then(({ data }) => setSeasons(data ?? []))
  }, [career.id])

  useEffect(() => {
    async function load() {
      setLoading(true)

      const isAll = filter === 'all'

      const matchQuery = supabase
        .from('matches')
        .select('goals_for, goals_against')
        .eq('career_id', career.id)
      if (!isAll) matchQuery.eq('season_id', filter)

      const squadQuery = supabase
        .from('career_squads')
        .select('player_name, goals, assists, appearances, avg_rating')
        .eq('career_id', career.id)
        .gt('appearances', 0)
      if (!isAll) squadQuery.eq('season_id', filter)

      const titlesQuery = supabase
        .from('career_titles')
        .select('id', { count: 'exact', head: true })
        .eq('career_id', career.id)
      if (!isAll) titlesQuery.eq('season_id', filter)

      const [
        { data: matches },
        { data: squadRaw },
        { count: titlesCount },
      ] = await Promise.all([matchQuery, squadQuery, titlesQuery])

      const matchList = (matches as MatchRow[]) ?? []
      const squad = (squadRaw as SquadStatRow[]) ?? []

      const wins = matchList.filter((m) => m.goals_for > m.goals_against).length
      const draws = matchList.filter((m) => m.goals_for === m.goals_against).length
      const losses = matchList.filter((m) => m.goals_for < m.goals_against).length
      const goalsFor = matchList.reduce((s, m) => s + m.goals_for, 0)
      const goalsAgainst = matchList.reduce((s, m) => s + m.goals_against, 0)
      const cleanSheets = matchList.filter((m) => m.goals_against === 0).length

      const topScorers = [...squad].sort((a, b) => b.goals - a.goals).slice(0, 5)
      const topAssisters = [...squad].sort((a, b) => b.assists - a.assists).slice(0, 5)
      const topRated = [...squad]
        .filter((p) => p.avg_rating != null && p.appearances >= 3)
        .sort((a, b) => Number(b.avg_rating) - Number(a.avg_rating))
        .slice(0, 5)

      setStats({
        played: matchList.length,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        cleanSheets,
        titles: titlesCount ?? 0,
        topScorers,
        topAssisters,
        topRated,
      })
      setLoading(false)
    }
    load()
  }, [filter, career.id])

  const winPct = stats && stats.played > 0
    ? Math.round((stats.wins / stats.played) * 100)
    : 0

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estadísticas</h1>
          <p className="text-sm text-muted-foreground">{career.name}</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas las temporadas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las temporadas</SelectItem>
            {seasons.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : stats && stats.played === 0 && stats.titles === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <TrendingUp className="mx-auto mb-3 size-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">Sin datos para mostrar todavía.</p>
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Resultados */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resultados</h2>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              <StatCard icon={<Target className="size-4" />} label="Partidos" value={stats.played} />
              <StatCard
                icon={<TrendingUp className="size-4" />}
                label="% Victorias"
                value={`${winPct}%`}
                sub={`${stats.wins}V  ${stats.draws}E  ${stats.losses}D`}
              />
              <StatCard
                icon={<Target className="size-4" />}
                label="Goles"
                value={stats.goalsFor}
                sub={`${stats.goalsAgainst} en contra`}
              />
              <StatCard
                icon={<Shield className="size-4" />}
                label="Porterías a 0"
                value={stats.cleanSheets}
              />
            </div>
          </section>

          {/* Títulos */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Palmarés</h2>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              <StatCard
                icon={<Trophy className="size-4 text-yellow-500" />}
                label="Títulos"
                value={stats.titles}
              />
              {stats.played > 0 && (
                <StatCard
                  icon={<Target className="size-4" />}
                  label="Diferencia goles"
                  value={stats.goalsFor - stats.goalsAgainst >= 0 ? `+${stats.goalsFor - stats.goalsAgainst}` : stats.goalsFor - stats.goalsAgainst}
                />
              )}
            </div>
          </section>

          {/* Rankings jugadores */}
          {(stats.topScorers.length > 0 || stats.topAssisters.length > 0 || stats.topRated.length > 0) && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Jugadores destacados
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Goleadores */}
                {stats.topScorers.length > 0 && (
                  <div className="rounded-xl border bg-card p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Target className="size-4 text-primary" />
                      <span className="text-sm font-semibold">Goleadores</span>
                    </div>
                    <ol className="space-y-2">
                      {stats.topScorers.map((p, i) => (
                        <li key={p.player_name + i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                            <span className="truncate">{p.player_name}</span>
                          </div>
                          <Badge variant="secondary" className="shrink-0 ml-2">{p.goals} G</Badge>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Asistentes */}
                {stats.topAssisters.length > 0 && (
                  <div className="rounded-xl border bg-card p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Users className="size-4 text-primary" />
                      <span className="text-sm font-semibold">Asistentes</span>
                    </div>
                    <ol className="space-y-2">
                      {stats.topAssisters.map((p, i) => (
                        <li key={p.player_name + i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                            <span className="truncate">{p.player_name}</span>
                          </div>
                          <Badge variant="secondary" className="shrink-0 ml-2">{p.assists} A</Badge>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Mejor media */}
                {stats.topRated.length > 0 && (
                  <div className="rounded-xl border bg-card p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <TrendingUp className="size-4 text-primary" />
                      <span className="text-sm font-semibold">Mejor media</span>
                    </div>
                    <ol className="space-y-2">
                      {stats.topRated.map((p, i) => (
                        <li key={p.player_name + i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                            <span className="truncate">{p.player_name}</span>
                          </div>
                          <Badge variant="secondary" className="shrink-0 ml-2">
                            {Number(p.avg_rating).toFixed(1)}
                          </Badge>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      ) : null}
    </div>
  )
}
