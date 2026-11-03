import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import type { SeasonRow } from '@/types/database'

const STATUS_LABEL: Record<string, string> = {
  in_progress: 'En curso',
  completed: 'Completada',
}

const STATUS_VARIANT: Record<string, 'success' | 'secondary'> = {
  in_progress: 'success',
  completed: 'secondary',
}

export function SeasonsPage() {
  const { career } = useCareer()
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('seasons')
      .select('*')
      .eq('career_id', career.id)
      .order('start_year', { ascending: true })
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setSeasons(data ?? [])
        setLoading(false)
      })
  }, [career.id])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Temporadas</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {seasons.length === 0
              ? 'Sin temporadas aún'
              : `${seasons.length} temporada${seasons.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button asChild size="sm">
          <Link to={`/careers/${career.id}/seasons/new`}>
            <Plus className="size-4" />
            Nueva temporada
          </Link>
        </Button>
      </div>

      {seasons.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <CalendarDays className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 font-medium">No hay temporadas</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Registra tu primera temporada para empezar a llevar el seguimiento.
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link to={`/careers/${career.id}/seasons/new`}>
              <Plus className="size-4" />
              Nueva temporada
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {seasons.map((season) => (
            <Link
              key={season.id}
              to={`/careers/${career.id}/seasons/${season.id}`}
              className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {season.start_year}
                </div>
                <div>
                  <p className="font-medium">{season.label}</p>
                  {season.club_name && (
                    <p className="text-sm text-muted-foreground">{season.club_name}</p>
                  )}
                </div>
              </div>
              <Badge variant={STATUS_VARIANT[season.status] ?? 'secondary'}>
                {STATUS_LABEL[season.status] ?? season.status}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
