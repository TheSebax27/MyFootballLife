import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { SeasonRow } from '@/types/database'

interface SquadRow {
  id: string
  player_name: string
  position: string | null
  shirt_number: number | null
  age: number | null
  overall: number | null
  potential: number | null
  is_loan: boolean
  goals: number
  assists: number
  appearances: number
  avg_rating: number | null
}

export function SquadPage() {
  const { career } = useCareer()
  const navigate = useNavigate()
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string>('')
  const [players, setPlayers] = useState<SquadRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('seasons')
      .select('*')
      .eq('career_id', career.id)
      .order('start_year', { ascending: false })
      .then(({ data }) => {
        const list = data ?? []
        setSeasons(list)
        if (list.length > 0) setSelectedSeason(list[0].id)
        setLoading(false)
      })
  }, [career.id])

  useEffect(() => {
    if (!selectedSeason) { setPlayers([]); return }
    supabase
      .from('career_squads')
      .select('id, player_name, position, shirt_number, age, overall, potential, is_loan, goals, assists, appearances, avg_rating')
      .eq('career_id', career.id)
      .eq('season_id', selectedSeason)
      .order('shirt_number', { ascending: true })
      .then(({ data }) => setPlayers((data as SquadRow[]) ?? []))
  }, [selectedSeason, career.id])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (seasons.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <Users className="mx-auto mb-4 size-12 text-muted-foreground/50" />
        <h2 className="mb-2 text-xl font-semibold">Sin temporadas</h2>
        <p className="mb-6 text-muted-foreground">Crea una temporada primero para gestionar la plantilla.</p>
        <Button asChild>
          <Link to={`/careers/${career.id}/seasons/new`}>Crear temporada</Link>
        </Button>
      </div>
    )
  }

  const currentSeason = seasons.find((s) => s.id === selectedSeason)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plantilla</h1>
          <p className="text-sm text-muted-foreground">{career.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Temporada" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link to={`/careers/${career.id}/squad/new`}>
              <Plus className="size-4 mr-1" />
              Añadir jugador
            </Link>
          </Button>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Users className="mx-auto mb-3 size-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            Sin jugadores en {currentSeason?.name ?? 'esta temporada'}.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to={`/careers/${career.id}/squad/new`}>Añadir primer jugador</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-3 text-center">#</th>
                <th className="px-3 py-3 text-left">Jugador</th>
                <th className="px-3 py-3 text-left">Posición</th>
                <th className="px-3 py-3 text-center">Edad</th>
                <th className="px-3 py-3 text-center">OVR</th>
                <th className="px-3 py-3 text-center">POT</th>
                <th className="px-3 py-3 text-center">PJ</th>
                <th className="px-3 py-3 text-center">G</th>
                <th className="px-3 py-3 text-center">A</th>
                <th className="px-3 py-3 text-center">Media</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {players.map((p) => (
                <tr
                  key={p.id}
                  className="cursor-pointer transition-colors hover:bg-accent/50"
                  onClick={() => navigate(`/careers/${career.id}/squad/${p.id}`)}
                >
                  <td className="px-3 py-3 text-center text-muted-foreground">
                    {p.shirt_number ?? '—'}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.player_name}</span>
                      {p.is_loan && (
                        <Badge variant="outline" className="text-xs">Cedido</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{p.position ?? '—'}</td>
                  <td className="px-3 py-3 text-center">{p.age ?? '—'}</td>
                  <td className="px-3 py-3 text-center font-semibold">
                    {p.overall ? (
                      <span className={
                        p.overall >= 85 ? 'text-yellow-500' :
                        p.overall >= 75 ? 'text-green-500' :
                        p.overall >= 65 ? 'text-blue-500' : 'text-muted-foreground'
                      }>
                        {p.overall}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-3 py-3 text-center text-muted-foreground">{p.potential ?? '—'}</td>
                  <td className="px-3 py-3 text-center">{p.appearances}</td>
                  <td className="px-3 py-3 text-center">{p.goals}</td>
                  <td className="px-3 py-3 text-center">{p.assists}</td>
                  <td className="px-3 py-3 text-center">
                    {p.avg_rating != null ? Number(p.avg_rating).toFixed(1) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
