import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Swords } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import type { MatchRow, SeasonRow } from '@/types/database'

const RESULT_VARIANT: Record<string, 'success' | 'destructive' | 'secondary'> = {
  W: 'success',
  L: 'destructive',
  D: 'secondary',
}
const RESULT_LABEL: Record<string, string> = { W: 'V', L: 'D', D: 'E' }

export function MatchesPage() {
  const { career } = useCareer()
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [filterSeason, setFilterSeason] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase
        .from('matches')
        .select('*')
        .eq('career_id', career.id)
        .order('match_date', { ascending: false }),
      supabase
        .from('seasons')
        .select('*')
        .eq('career_id', career.id)
        .order('start_year', { ascending: true }),
    ]).then(([{ data: m }, { data: s }]) => {
      setMatches(m ?? [])
      setSeasons(s ?? [])
      setLoading(false)
    })
  }, [career.id])

  const filtered =
    filterSeason === 'all' ? matches : matches.filter((m) => m.season_id === filterSeason)

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Partidos</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {filtered.length === 0
              ? 'Sin partidos'
              : `${filtered.length} partido${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {seasons.length > 0 && (
            <select
              value={filterSeason}
              onChange={(e) => setFilterSeason(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="all">Todas las temporadas</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
          <Button asChild size="sm">
            <Link to={`/careers/${career.id}/matches/new`}>
              <Plus className="size-4" />
              Nuevo partido
            </Link>
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <Swords className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 font-medium">No hay partidos</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Registra tu primer partido para empezar el historial.
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link to={`/careers/${career.id}/matches/new`}>
              <Plus className="size-4" />
              Nuevo partido
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((match) => {
            const season = seasons.find((s) => s.id === match.season_id)
            return (
              <Link
                key={match.id}
                to={`/careers/${career.id}/matches/${match.id}`}
                className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/50"
              >
                {/* Result badge */}
                <Badge
                  variant={RESULT_VARIANT[match.result] ?? 'secondary'}
                  className="w-8 justify-center text-base font-bold"
                >
                  {RESULT_LABEL[match.result] ?? match.result}
                </Badge>

                {/* Score */}
                <div className="w-16 text-center text-lg font-bold tabular-nums">
                  {match.goals_for}–{match.goals_against}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {match.is_home ? 'vs' : '@'} {match.opponent_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[
                      match.competition_name,
                      match.round,
                      season?.label,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>

                {/* Date */}
                {match.match_date && (
                  <p className="shrink-0 text-sm text-muted-foreground">
                    {new Date(match.match_date + 'T00:00:00').toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
