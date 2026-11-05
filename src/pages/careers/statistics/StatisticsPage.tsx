import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy, Target, Shield, TrendingUp, Users, Plus, Pencil,
  Gamepad2, Square, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/utils/cn'
import type { SeasonRow, PlayerSeasonStatsRow } from '@/types/database'

// ── Manager types ──────────────────────────────────────────────────────────
interface MatchRowMgr { goals_for: number; goals_against: number }
interface SquadStatRow { player_name: string; goals: number; assists: number; appearances: number; avg_rating: number | null }
interface ManagerStats {
  played: number; wins: number; draws: number; losses: number
  goalsFor: number; goalsAgainst: number; cleanSheets: number; titles: number
  topScorers: SquadStatRow[]; topAssisters: SquadStatRow[]; topRated: SquadStatRow[]
}

// ── Shared ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={cn('text-3xl font-bold', color)}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

// ── Player view ────────────────────────────────────────────────────────────
interface MatchCompRow { id: string; competition_name: string | null; goals_against: number }
interface CompAgg {
  competition_name: string
  matches_played: number; goals: number; assists: number
  yellow_cards: number; red_cards: number; clean_sheets: number
}

function StatsTable({ rows, showCleanSheets, careerId, editLink }: {
  rows: CompAgg[]
  showCleanSheets: boolean
  careerId: string
  editLink?: (r: CompAgg) => string
}) {
  const { career } = useCareer()
  const total = rows.reduce(
    (acc, r) => ({
      matches_played: acc.matches_played + r.matches_played,
      goals: acc.goals + r.goals,
      assists: acc.assists + r.assists,
      yellow_cards: acc.yellow_cards + r.yellow_cards,
      red_cards: acc.red_cards + r.red_cards,
      clean_sheets: acc.clean_sheets + r.clean_sheets,
    }),
    { matches_played: 0, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, clean_sheets: 0 },
  )
  return (
    <div className="space-y-6">
      <div className={cn('grid gap-3', showCleanSheets ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-5')}>
        <StatCard icon={<Gamepad2 className="size-4" />} label="Partidos" value={total.matches_played} />
        <StatCard icon={<Target className="size-4" />} label="Goles" value={total.goals} color="text-primary" />
        <StatCard icon={<Zap className="size-4" />} label="Asistencias" value={total.assists} color="text-blue-400" />
        <StatCard icon={<Square className="size-3 fill-yellow-400 text-yellow-400" />} label="T. Amarillas" value={total.yellow_cards} color="text-yellow-400" />
        <StatCard icon={<Square className="size-3 fill-red-500 text-red-500" />} label="T. Rojas" value={total.red_cards} color="text-red-400" />
        {showCleanSheets && <StatCard icon={<Shield className="size-4" />} label="Vallas invictas" value={total.clean_sheets} color="text-emerald-400" />}
      </div>
      {rows.length > 0 && (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Competición</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">PJ</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">G</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">A</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">TA</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">TR</th>
                {showCleanSheets && <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">VI</th>}
                {editLink && <th className="px-3 py-2.5" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{r.competition_name}</td>
                  <td className="px-3 py-3 text-center tabular-nums">{r.matches_played}</td>
                  <td className="px-3 py-3 text-center font-semibold tabular-nums text-primary">{r.goals}</td>
                  <td className="px-3 py-3 text-center font-semibold tabular-nums text-blue-400">{r.assists}</td>
                  <td className="px-3 py-3 text-center tabular-nums text-yellow-400">{r.yellow_cards}</td>
                  <td className="px-3 py-3 text-center tabular-nums text-red-400">{r.red_cards}</td>
                  {showCleanSheets && <td className="px-3 py-3 text-center tabular-nums text-emerald-400">{r.clean_sheets}</td>}
                  {editLink && (
                    <td className="px-3 py-3">
                      <Link to={editLink(r)} className="text-muted-foreground hover:text-foreground" title="Editar">
                        <Pencil className="size-3.5" />
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        PJ = Partidos · G = Goles · A = Asistencias · TA = T. Amarillas · TR = T. Rojas{showCleanSheets ? ' · VI = Vallas invictas' : ''}
      </p>
    </div>
  )
}

function PlayerStatsView({ careerId, filter, showCleanSheets }: {
  careerId: string
  filter: string
  showCleanSheets: boolean
}) {
  const { career } = useCareer()
  const [manualRows, setManualRows] = useState<PlayerSeasonStatsRow[]>([])
  const [matchRows, setMatchRows] = useState<CompAgg[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    async function load() {
      // Manual entries
      const q = supabase
        .from('player_season_stats')
        .select('*')
        .eq('career_id', careerId)
        .order('competition_name', { ascending: true })
      if (filter !== 'all') q.eq('season_id', filter)
      const { data: manual } = await q
      setManualRows((manual as PlayerSeasonStatsRow[]) ?? [])

      // Match-derived: fetch matches then events
      const mq = supabase.from('matches').select('id, competition_name, goals_against').eq('career_id', careerId)
      if (filter !== 'all') mq.eq('season_id', filter)
      const { data: matches } = await mq
      const matchList = (matches as MatchCompRow[]) ?? []

      if (matchList.length > 0) {
        const matchIds = matchList.map((m) => m.id)
        const { data: events } = await supabase
          .from('match_events')
          .select('match_id, event_type')
          .in('match_id', matchIds)
          .in('event_type', ['goal', 'assist', 'yellow_card', 'red_card'])

        const compMap: Record<string, CompAgg> = {}
        for (const m of matchList) {
          const comp = m.competition_name ?? 'Sin competición'
          if (!compMap[comp]) compMap[comp] = { competition_name: comp, matches_played: 0, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, clean_sheets: 0 }
          compMap[comp].matches_played++
          if (showCleanSheets && m.goals_against === 0) compMap[comp].clean_sheets++
        }
        for (const ev of events ?? []) {
          const m = matchList.find((x) => x.id === ev.match_id)
          if (!m) continue
          const comp = m.competition_name ?? 'Sin competición'
          if (ev.event_type === 'goal') compMap[comp].goals++
          else if (ev.event_type === 'assist') compMap[comp].assists++
          else if (ev.event_type === 'yellow_card') compMap[comp].yellow_cards++
          else if (ev.event_type === 'red_card') compMap[comp].red_cards++
        }
        setMatchRows(Object.values(compMap).sort((a, b) => a.competition_name.localeCompare(b.competition_name)))
      } else {
        setMatchRows([])
      }
      setLoading(false)
    }
    load()
  }, [careerId, filter, showCleanSheets])

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <div className="size-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const hasManual = manualRows.length > 0
  const hasMatches = matchRows.length > 0

  if (!hasManual && !hasMatches) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center">
        <TrendingUp className="mx-auto mb-3 size-10 text-muted-foreground/40" />
        <p className="font-medium">Sin estadísticas registradas</p>
        <p className="mt-1 text-sm text-muted-foreground">Registra partidos o sube estadísticas manuales.</p>
        <Button asChild size="sm" className="mt-4">
          <Link to={`/careers/${career.id}/statistics/entry`}><Plus className="size-4" />Registrar stats</Link>
        </Button>
      </div>
    )
  }

  const manualAgg: CompAgg[] = manualRows.map((r) => ({
    competition_name: r.competition_name,
    matches_played: r.matches_played,
    goals: r.goals,
    assists: r.assists,
    yellow_cards: r.yellow_cards,
    red_cards: r.red_cards,
    clean_sheets: r.clean_sheets ?? 0,
  }))

  return (
    <div className="space-y-10">
      {hasMatches && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="font-black text-primary">//</span>
            <h2 className="text-base font-bold">Desde partidos registrados</h2>
          </div>
          <StatsTable rows={matchRows} showCleanSheets={showCleanSheets} careerId={careerId} />
        </section>
      )}
      {hasManual && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="font-black text-primary">//</span>
            <h2 className="text-base font-bold">Registros manuales</h2>
          </div>
          <StatsTable
            rows={manualAgg}
            showCleanSheets={showCleanSheets}
            careerId={careerId}
            editLink={(r) => {
              const found = manualRows.find((mr) => mr.competition_name === r.competition_name)
              return `/careers/${careerId}/statistics/entry?season=${found?.season_id ?? ''}`
            }}
          />
        </section>
      )}
    </div>
  )
}

// ── Manager view ───────────────────────────────────────────────────────────
function ManagerStatsView({ careerId, filter }: { careerId: string; filter: string }) {
  const [stats, setStats] = useState<ManagerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const isAll = filter === 'all'

      const matchQuery = supabase.from('matches').select('goals_for, goals_against').eq('career_id', careerId)
      if (!isAll) matchQuery.eq('season_id', filter)

      const squadQuery = supabase.from('career_squads').select('player_name, goals, assists, appearances, avg_rating').eq('career_id', careerId).gt('appearances', 0)
      if (!isAll) squadQuery.eq('season_id', filter)

      const titlesQuery = supabase.from('career_titles').select('id', { count: 'exact', head: true }).eq('career_id', careerId)
      if (!isAll) titlesQuery.eq('season_id', filter)

      const [{ data: matches }, { data: squadRaw }, { count: titlesCount }] = await Promise.all([matchQuery, squadQuery, titlesQuery])

      const matchList = (matches as MatchRowMgr[]) ?? []
      const squad = (squadRaw as SquadStatRow[]) ?? []

      const wins = matchList.filter((m) => m.goals_for > m.goals_against).length
      const draws = matchList.filter((m) => m.goals_for === m.goals_against).length
      const losses = matchList.filter((m) => m.goals_for < m.goals_against).length
      const goalsFor = matchList.reduce((s, m) => s + m.goals_for, 0)
      const goalsAgainst = matchList.reduce((s, m) => s + m.goals_against, 0)
      const cleanSheets = matchList.filter((m) => m.goals_against === 0).length

      setStats({
        played: matchList.length, wins, draws, losses, goalsFor, goalsAgainst, cleanSheets,
        titles: titlesCount ?? 0,
        topScorers: [...squad].sort((a, b) => b.goals - a.goals).slice(0, 5),
        topAssisters: [...squad].sort((a, b) => b.assists - a.assists).slice(0, 5),
        topRated: [...squad].filter((p) => p.avg_rating != null && p.appearances >= 3).sort((a, b) => Number(b.avg_rating) - Number(a.avg_rating)).slice(0, 5),
      })
      setLoading(false)
    }
    load()
  }, [careerId, filter])

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <div className="size-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!stats || (stats.played === 0 && stats.titles === 0)) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center">
        <TrendingUp className="mx-auto mb-3 size-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">Sin datos para mostrar todavía.</p>
      </div>
    )
  }

  const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resultados</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <StatCard icon={<Target className="size-4" />} label="Partidos" value={stats.played} />
          <StatCard icon={<TrendingUp className="size-4" />} label="% Victorias" value={`${winPct}%`} sub={`${stats.wins}V  ${stats.draws}E  ${stats.losses}D`} />
          <StatCard icon={<Target className="size-4" />} label="Goles" value={stats.goalsFor} sub={`${stats.goalsAgainst} en contra`} />
          <StatCard icon={<Shield className="size-4" />} label="Porterías a 0" value={stats.cleanSheets} />
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Palmarés</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <StatCard icon={<Trophy className="size-4 text-yellow-500" />} label="Títulos" value={stats.titles} />
          {stats.played > 0 && (
            <StatCard
              icon={<Target className="size-4" />}
              label="Dif. goles"
              value={stats.goalsFor - stats.goalsAgainst >= 0 ? `+${stats.goalsFor - stats.goalsAgainst}` : stats.goalsFor - stats.goalsAgainst}
            />
          )}
        </div>
      </section>
      {(stats.topScorers.length > 0 || stats.topAssisters.length > 0 || stats.topRated.length > 0) && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Jugadores destacados</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.topScorers.length > 0 && (
              <div className="rounded-xl border bg-card p-4">
                <div className="mb-3 flex items-center gap-2"><Target className="size-4 text-primary" /><span className="text-sm font-semibold">Goleadores</span></div>
                <ol className="space-y-2">
                  {stats.topScorers.map((p, i) => (
                    <li key={p.player_name + i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0"><span className="w-4 text-xs text-muted-foreground">{i + 1}.</span><span className="truncate">{p.player_name}</span></div>
                      <Badge variant="secondary" className="ml-2 shrink-0">{p.goals} G</Badge>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {stats.topAssisters.length > 0 && (
              <div className="rounded-xl border bg-card p-4">
                <div className="mb-3 flex items-center gap-2"><Users className="size-4 text-primary" /><span className="text-sm font-semibold">Asistentes</span></div>
                <ol className="space-y-2">
                  {stats.topAssisters.map((p, i) => (
                    <li key={p.player_name + i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0"><span className="w-4 text-xs text-muted-foreground">{i + 1}.</span><span className="truncate">{p.player_name}</span></div>
                      <Badge variant="secondary" className="ml-2 shrink-0">{p.assists} A</Badge>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {stats.topRated.length > 0 && (
              <div className="rounded-xl border bg-card p-4">
                <div className="mb-3 flex items-center gap-2"><TrendingUp className="size-4 text-primary" /><span className="text-sm font-semibold">Mejor media</span></div>
                <ol className="space-y-2">
                  {stats.topRated.map((p, i) => (
                    <li key={p.player_name + i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0"><span className="w-4 text-xs text-muted-foreground">{i + 1}.</span><span className="truncate">{p.player_name}</span></div>
                      <Badge variant="secondary" className="ml-2 shrink-0">{Number(p.avg_rating).toFixed(1)}</Badge>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────
export function StatisticsPage() {
  const { career } = useCareer()
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [filter, setFilter] = useState<string>('all')

  const isPlayer = career.mode === 'player'
  const showCleanSheets = career.position === 'portero' || career.position === 'defensa'

  useEffect(() => {
    supabase
      .from('seasons')
      .select('*')
      .eq('career_id', career.id)
      .order('start_year', { ascending: false })
      .then(({ data }) => setSeasons(data ?? []))
  }, [career.id])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estadísticas</h1>
          <p className="text-sm text-muted-foreground">{career.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {isPlayer && (
            <Button asChild size="sm">
              <Link to={`/careers/${career.id}/statistics/entry`}>
                <Plus className="size-4" />
                Registrar stats
              </Link>
            </Button>
          )}
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
      </div>

      {isPlayer ? (
        <PlayerStatsView careerId={career.id} filter={filter} showCleanSheets={showCleanSheets} />
      ) : (
        <ManagerStatsView careerId={career.id} filter={filter} />
      )}
    </div>
  )
}
