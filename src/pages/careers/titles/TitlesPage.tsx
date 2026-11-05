import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Trophy } from 'lucide-react'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SeasonRow } from '@/types/database'

interface TitleRow {
  id: string
  season_id: string
  competition_name: string
  club_name: string | null
  notes: string | null
}

export function TitlesPage() {
  const { career } = useCareer()
  const navigate = useNavigate()
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [titles, setTitles] = useState<TitleRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('seasons')
      .select('*')
      .eq('career_id', career.id)
      .order('start_year', { ascending: false })
      .then(({ data }) => {
        setSeasons(data ?? [])
        setLoading(false)
      })
  }, [career.id])

  useEffect(() => {
    let query = supabase
      .from('career_titles')
      .select('id, season_id, competition_name, club_name, notes')
      .eq('career_id', career.id)
      .order('created_at', { ascending: false })

    if (filter !== 'all') query = query.eq('season_id', filter)

    query.then(({ data }) => setTitles((data as TitleRow[]) ?? []))
  }, [filter, career.id])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const seasonMap = Object.fromEntries(seasons.map((s) => [s.id, s.label]))
  const isPlayer = career.mode === 'player'

  return (
    <div className={isPlayer && titles.length > 0 ? 'flex h-[calc(100svh-6.5rem)] overflow-hidden' : ''}>

      {/* Trophy figure — only player mode with titles */}
      {isPlayer && titles.length > 0 && (
        <div className="relative hidden w-[220px] shrink-0 overflow-hidden lg:block">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 z-10"
            style={{ background: 'linear-gradient(to bottom, var(--background) 0%, transparent 100%)' }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 z-10"
            style={{ background: 'linear-gradient(to top, var(--background) 0%, transparent 100%)' }} />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 z-10"
            style={{ background: 'linear-gradient(to right, transparent, var(--background))' }} />
          <img
            src="/images/titles-player.png"
            alt=""
            aria-hidden
            className="absolute bottom-0 left-1/2 h-[88%] w-auto -translate-x-1/2 object-contain object-bottom select-none"
          />
        </div>
      )}

      <div className={isPlayer && titles.length > 0 ? 'flex-1 overflow-y-auto' : ''}>
      <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Títulos</h1>
          <p className="text-sm text-muted-foreground">{career.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Todas las temporadas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las temporadas</SelectItem>
              {seasons.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link to={`/careers/${career.id}/titles/new`}>
              <Plus className="size-4 mr-1" />
              Añadir título
            </Link>
          </Button>
        </div>
      </div>

      {titles.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Trophy className="mx-auto mb-3 size-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            {filter === 'all' ? 'Todavía no has ganado ningún título.' : 'Sin títulos en esta temporada.'}
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to={`/careers/${career.id}/titles/new`}>Añadir primer título</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {titles.map((t) => (
            <div
              key={t.id}
              className="flex cursor-pointer items-start gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/50"
              onClick={() => navigate(`/careers/${career.id}/titles/${t.id}`)}
            >
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-yellow-500/10">
                <Trophy className="size-5 text-yellow-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{t.competition_name}</p>
                {t.club_name && (
                  <p className="text-sm text-muted-foreground">{t.club_name}</p>
                )}
                {t.notes && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{t.notes}</p>
                )}
              </div>
              {seasonMap[t.season_id] && (
                <Badge variant="secondary" className="shrink-0">{seasonMap[t.season_id]}</Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {titles.length > 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {titles.length} título{titles.length !== 1 ? 's' : ''} en total
        </p>
      )}
    </div>
      </div>{/* scrollable */}
    </div>
  )
}
