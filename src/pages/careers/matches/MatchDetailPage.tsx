import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, AlertTriangle } from 'lucide-react'
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
const RESULT_LABEL: Record<string, string> = {
  W: 'Victoria',
  L: 'Derrota',
  D: 'Empate',
}

export function MatchDetailPage() {
  const { career } = useCareer()
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()
  const [match, setMatch] = useState<MatchRow | null>(null)
  const [season, setSeason] = useState<SeasonRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!matchId) return
    supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .eq('career_id', career.id)
      .single()
      .then(async ({ data }) => {
        if (!data) { setLoading(false); return }
        setMatch(data)
        const { data: s } = await supabase
          .from('seasons')
          .select('*')
          .eq('id', data.season_id)
          .single()
        setSeason(s)
        setLoading(false)
      })
  }, [matchId, career.id])

  async function handleDelete() {
    if (!matchId) return
    setDeleting(true)
    await supabase.from('matches').delete().eq('id', matchId).eq('career_id', career.id)
    navigate(`/careers/${career.id}/matches`, { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="font-medium">Partido no encontrado.</p>
        <Link to={`/careers/${career.id}/matches`} className="mt-4 inline-block text-sm text-primary hover:underline">
          Volver a partidos
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        to={`/careers/${career.id}/matches`}
        className="mb-6 flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Partidos
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={RESULT_VARIANT[match.result] ?? 'secondary'}>
              {RESULT_LABEL[match.result] ?? match.result}
            </Badge>
            {season && <Badge variant="outline">{season.label}</Badge>}
            {match.competition_name && (
              <Badge variant="outline">{match.competition_name}</Badge>
            )}
          </div>

          {/* Score */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {match.is_home ? 'Local' : 'Visitante'} · {match.round ?? ''}
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold tabular-nums">{match.goals_for}</span>
              <span className="text-2xl text-muted-foreground">–</span>
              <span className="text-5xl font-bold tabular-nums">{match.goals_against}</span>
            </div>
            {match.penalties_for != null && (
              <p className="mt-1 text-sm text-muted-foreground">
                Penales: {match.penalties_for} – {match.penalties_against}
              </p>
            )}
            <p className="mt-2 text-xl font-semibold">
              {match.is_home ? 'vs' : '@'} {match.opponent_name}
            </p>
            {match.club_name && (
              <p className="text-sm text-muted-foreground">{match.club_name}</p>
            )}
            {match.match_date && (
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(match.match_date + 'T00:00:00').toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/careers/${career.id}/matches/${match.id}/edit`}>
              <Pencil className="size-4" />
              Editar
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="font-medium text-destructive">¿Eliminar este partido?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta acción no se puede deshacer.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {match.notes && (
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Notas
          </p>
          <p className="whitespace-pre-wrap text-sm">{match.notes}</p>
        </div>
      )}
    </div>
  )
}
