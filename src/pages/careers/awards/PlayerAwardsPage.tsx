import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import type { PlayerAwardRow, SeasonRow } from '@/types/database'

export function PlayerAwardsPage() {
  const { career } = useCareer()
  const [awards, setAwards] = useState<PlayerAwardRow[]>([])
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [filterSeason, setFilterSeason] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase
        .from('player_awards')
        .select('*')
        .eq('career_id', career.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('seasons')
        .select('*')
        .eq('career_id', career.id)
        .order('start_year', { ascending: true }),
    ]).then(([{ data: a }, { data: s }]) => {
      setAwards(a ?? [])
      setSeasons(s ?? [])
      setLoading(false)
    })
  }, [career.id])

  const filtered =
    filterSeason === 'all' ? awards : awards.filter((a) => a.season_id === filterSeason)

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
          <h2 className="text-xl font-semibold">Premios individuales</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {filtered.length === 0
              ? 'Sin premios'
              : `${filtered.length} premio${filtered.length !== 1 ? 's' : ''}`}
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
            <Link to={`/careers/${career.id}/player-awards/new`}>
              <Plus className="size-4" />
              Nuevo premio
            </Link>
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <Trophy className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 font-medium">No hay premios individuales</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Registra tus premios, Balón de Oro, MVP y reconocimientos.
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link to={`/careers/${career.id}/player-awards/new`}>
              <Plus className="size-4" />
              Nuevo premio
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((award) => {
            const season = seasons.find((s) => s.id === award.season_id)
            return (
              <div
                key={award.id}
                className="flex items-center gap-4 rounded-xl border bg-card p-4"
              >
                <Trophy className="size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{award.award_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[season?.label, award.notes].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
