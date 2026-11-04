import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SquadPlayerForm } from './_SquadPlayerForm'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import type { SquadPlayerFormValues } from '@/schemas/squad'
import type { SeasonRow } from '@/types/database'
import { Button } from '@/components/ui/button'

export function NewSquadPlayerPage() {
  const { career } = useCareer()
  const navigate = useNavigate()
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('seasons')
      .select('*')
      .eq('career_id', career.id)
      .order('start_year', { ascending: true })
      .then(({ data }) => {
        setSeasons(data ?? [])
        setLoading(false)
      })
  }, [career.id])

  async function onSubmit(values: SquadPlayerFormValues) {
    setServerError(null)
    const { data, error } = await supabase
      .from('career_squads')
      .insert({
        career_id: career.id,
        season_id: values.season_id,
        player_name: values.player_name,
        position: values.position || null,
        shirt_number: values.shirt_number ? parseInt(values.shirt_number, 10) : null,
        age: values.age ? parseInt(values.age, 10) : null,
        overall: values.overall ? parseInt(values.overall, 10) : null,
        potential: values.potential ? parseInt(values.potential, 10) : null,
        is_loan: values.is_loan,
        appearances: values.appearances ? parseInt(values.appearances, 10) : 0,
        starts: values.starts ? parseInt(values.starts, 10) : 0,
        minutes: values.minutes ? parseInt(values.minutes, 10) : 0,
        goals: values.goals ? parseInt(values.goals, 10) : 0,
        assists: values.assists ? parseInt(values.assists, 10) : 0,
        yellow_cards: values.yellow_cards ? parseInt(values.yellow_cards, 10) : 0,
        red_cards: values.red_cards ? parseInt(values.red_cards, 10) : 0,
        avg_rating: values.avg_rating ? parseFloat(values.avg_rating) : null,
      })
      .select('id')
      .single()

    if (error) {
      setServerError('No se pudo añadir el jugador. Inténtalo de nuevo.')
      return
    }
    navigate(`/careers/${career.id}/squad/${data.id}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (seasons.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="mb-4 text-muted-foreground">Necesitas al menos una temporada para añadir jugadores.</p>
        <Button asChild>
          <Link to={`/careers/${career.id}/seasons/new`}>Crear temporada</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Volver
      </button>

      <h1 className="mb-1 text-2xl font-bold tracking-tight">Añadir jugador</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Carrera: <span className="font-medium text-foreground">{career.name}</span>
      </p>

      <SquadPlayerForm
        seasons={seasons}
        onSubmit={onSubmit}
        serverError={serverError}
        submitLabel="Añadir jugador"
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}
