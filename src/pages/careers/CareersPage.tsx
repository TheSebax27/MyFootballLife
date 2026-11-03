import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trophy } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useGames } from '@/hooks/useGames'
import { supabase } from '@/services/supabase/client'
import type { CareerRow, GameRow } from '@/types/database'

type CareerWithGame = CareerRow & { game: GameRow | undefined }

const MODE_LABEL: Record<string, string> = {
  manager: 'Director Técnico',
  player: 'Jugador',
}

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning'> = {
  active: 'success',
  finished: 'secondary',
  archived: 'warning',
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Activa',
  finished: 'Finalizada',
  archived: 'Archivada',
}

export function CareersPage() {
  const { user } = useAuth()
  const games = useGames()
  const [careers, setCareers] = useState<CareerWithGame[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('careers')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = data ?? []
        setCareers(rows.map((c) => ({ ...c, game: games.find((g) => g.id === c.game_id) })))
        setLoading(false)
      })
  }, [user?.id, games])

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Carreras</h1>
            <p className="mt-1 text-muted-foreground">Todas tus trayectorias en un solo lugar.</p>
          </div>
          <Button asChild>
            <Link to="/careers/new">
              <Plus className="size-4" />
              Nueva carrera
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : careers.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Trophy className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No tienes carreras todavía</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Crea tu primera carrera para empezar a registrar tu historia.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/careers/new">Crear carrera</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {careers.map((career) => (
              <Link
                key={career.id}
                to={`/careers/${career.id}`}
                className="group flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {career.game && (
                      <Badge variant="secondary">{career.game.name}</Badge>
                    )}
                    <Badge variant="outline">{MODE_LABEL[career.mode] ?? career.mode}</Badge>
                  </div>
                  <Badge variant={STATUS_VARIANT[career.status] ?? 'secondary'}>
                    {STATUS_LABEL[career.status] ?? career.status}
                  </Badge>
                </div>

                <div className="flex-1">
                  <h2 className="font-semibold leading-snug group-hover:text-primary transition-colors">
                    {career.name}
                  </h2>
                  {career.manager_name && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{career.manager_name}</p>
                  )}
                  {career.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {career.description}
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {new Date(career.created_at).toLocaleDateString('es', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
