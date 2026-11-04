import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MatchForm } from './_MatchForm'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import type { MatchFormValues } from '@/schemas/match'
import type { SeasonRow } from '@/types/database'

export function NewMatchPage() {
  const { career } = useCareer()
  const navigate = useNavigate()
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('seasons')
      .select('*')
      .eq('career_id', career.id)
      .order('start_year', { ascending: true })
      .then(({ data }) => setSeasons(data ?? []))
  }, [career.id])

  async function onSubmit(values: MatchFormValues) {
    setServerError(null)
    const { data, error } = await supabase
      .from('matches')
      .insert({
        career_id: career.id,
        season_id: values.season_id,
        opponent_name: values.opponent_name,
        is_home: values.is_home,
        goals_for: parseInt(values.goals_for, 10),
        goals_against: parseInt(values.goals_against, 10),
        match_date: values.match_date || null,
        competition_name: values.competition_name || null,
        round: values.round || null,
        club_name: values.club_name || null,
        penalties_for: values.penalties_for ? parseInt(values.penalties_for, 10) : null,
        penalties_against: values.penalties_against ? parseInt(values.penalties_against, 10) : null,
        notes: values.notes || null,
      })
      .select('id')
      .single()

    if (error || !data) {
      setServerError('No se pudo guardar el partido. Inténtalo de nuevo.')
      return
    }
    navigate(`/careers/${career.id}/matches/${data.id}`, { replace: true })
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

      <h1 className="mb-1 text-2xl font-bold tracking-tight">Nuevo partido</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Carrera: <span className="font-medium text-foreground">{career.name}</span>
      </p>

      {seasons.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">No hay temporadas</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea una temporada primero antes de registrar partidos.
          </p>
        </div>
      ) : (
        <MatchForm
          seasons={seasons}
          onSubmit={onSubmit}
          serverError={serverError}
          submitLabel="Crear partido"
          onCancel={() => navigate(-1)}
        />
      )}
    </div>
  )
}
