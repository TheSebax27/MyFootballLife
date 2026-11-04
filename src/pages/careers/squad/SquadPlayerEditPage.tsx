import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SquadPlayerForm } from './_SquadPlayerForm'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import type { SquadPlayerFormValues } from '@/schemas/squad'
import type { SeasonRow } from '@/types/database'

export function SquadPlayerEditPage() {
  const { career } = useCareer()
  const { squadId } = useParams<{ squadId: string }>()
  const navigate = useNavigate()
  const [player, setPlayer] = useState<Record<string, unknown> | null>(null)
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (!squadId) return
    Promise.all([
      supabase.from('career_squads').select('*').eq('id', squadId).eq('career_id', career.id).single(),
      supabase.from('seasons').select('*').eq('career_id', career.id).order('start_year', { ascending: true }),
    ]).then(([{ data: p }, { data: s }]) => {
      if (!p) { navigate(`/careers/${career.id}/squad`, { replace: true }); return }
      setPlayer(p)
      setSeasons(s ?? [])
      setLoading(false)
    })
  }, [squadId, career.id])

  async function onSubmit(values: SquadPlayerFormValues) {
    if (!squadId) return
    setServerError(null)
    const { error } = await supabase
      .from('career_squads')
      .update({
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
      .eq('id', squadId)
      .eq('career_id', career.id)

    if (error) {
      setServerError('No se pudo guardar los cambios. Inténtalo de nuevo.')
      return
    }
    navigate(`/careers/${career.id}/squad/${squadId}`, { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!player) return null

  const p = player as Record<string, unknown>
  const defaultValues: Partial<SquadPlayerFormValues> = {
    season_id: p.season_id as string,
    player_name: p.player_name as string,
    position: (p.position as string) ?? '',
    shirt_number: p.shirt_number != null ? String(p.shirt_number) : '',
    age: p.age != null ? String(p.age) : '',
    overall: p.overall != null ? String(p.overall) : '',
    potential: p.potential != null ? String(p.potential) : '',
    is_loan: Boolean(p.is_loan),
    appearances: String(p.appearances ?? 0),
    starts: String(p.starts ?? 0),
    minutes: String(p.minutes ?? 0),
    goals: String(p.goals ?? 0),
    assists: String(p.assists ?? 0),
    yellow_cards: String(p.yellow_cards ?? 0),
    red_cards: String(p.red_cards ?? 0),
    avg_rating: p.avg_rating != null ? String(p.avg_rating) : '',
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

      <h1 className="mb-1 text-2xl font-bold tracking-tight">Editar jugador</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Carrera: <span className="font-medium text-foreground">{career.name}</span>
      </p>

      <SquadPlayerForm
        defaultValues={defaultValues}
        seasons={seasons}
        onSubmit={onSubmit}
        serverError={serverError}
        submitLabel="Guardar cambios"
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}
