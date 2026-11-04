import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MatchForm } from './_MatchForm'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import type { MatchFormValues } from '@/schemas/match'
import type { MatchRow, SeasonRow } from '@/types/database'

export function MatchEditPage() {
  const { career } = useCareer()
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()
  const [match, setMatch] = useState<MatchRow | null>(null)
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (!matchId) return
    Promise.all([
      supabase.from('matches').select('*').eq('id', matchId).eq('career_id', career.id).single(),
      supabase.from('seasons').select('*').eq('career_id', career.id).order('start_year', { ascending: true }),
    ]).then(([{ data: m }, { data: s }]) => {
      if (!m) { navigate(`/careers/${career.id}/matches`, { replace: true }); return }
      setMatch(m)
      setSeasons(s ?? [])
      setLoading(false)
    })
  }, [matchId, career.id])

  async function onSubmit(values: MatchFormValues) {
    if (!matchId) return
    setServerError(null)
    const { error } = await supabase
      .from('matches')
      .update({
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
      .eq('id', matchId)
      .eq('career_id', career.id)

    if (error) {
      setServerError('No se pudo guardar el partido. Inténtalo de nuevo.')
      return
    }
    navigate(`/careers/${career.id}/matches/${matchId}`, { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!match) return null

  const defaultValues: Partial<MatchFormValues> = {
    season_id: match.season_id,
    opponent_name: match.opponent_name,
    is_home: match.is_home,
    goals_for: String(match.goals_for),
    goals_against: String(match.goals_against),
    match_date: match.match_date ?? '',
    competition_name: match.competition_name ?? '',
    round: match.round ?? '',
    club_name: match.club_name ?? '',
    penalties_for: match.penalties_for != null ? String(match.penalties_for) : '',
    penalties_against: match.penalties_against != null ? String(match.penalties_against) : '',
    notes: match.notes ?? '',
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

      <h1 className="mb-1 text-2xl font-bold tracking-tight">Editar partido</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Carrera: <span className="font-medium text-foreground">{career.name}</span>
      </p>

      <MatchForm
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
