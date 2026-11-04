import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SquadRow {
  id: string
  season_id: string
  player_name: string
  position: string | null
  shirt_number: number | null
  age: number | null
  overall: number | null
  potential: number | null
  is_loan: boolean
  appearances: number
  starts: number
  minutes: number
  goals: number
  assists: number
  yellow_cards: number
  red_cards: number
  avg_rating: number | null
}

export function SquadPlayerDetailPage() {
  const { career } = useCareer()
  const { squadId } = useParams<{ squadId: string }>()
  const navigate = useNavigate()
  const [player, setPlayer] = useState<SquadRow | null>(null)
  const [seasonName, setSeasonName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!squadId) return
    supabase
      .from('career_squads')
      .select('*')
      .eq('id', squadId)
      .eq('career_id', career.id)
      .single()
      .then(async ({ data }) => {
        if (!data) { navigate(`/careers/${career.id}/squad`, { replace: true }); return }
        setPlayer(data as SquadRow)
        const { data: season } = await supabase
          .from('seasons')
          .select('name')
          .eq('id', data.season_id)
          .single()
        setSeasonName(season?.name ?? null)
        setLoading(false)
      })
  }, [squadId, career.id])

  async function handleDelete() {
    if (!squadId) return
    setDeleting(true)
    await supabase.from('career_squads').delete().eq('id', squadId).eq('career_id', career.id)
    navigate(`/careers/${career.id}/squad`, { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!player) return null

  const overallColor =
    (player.overall ?? 0) >= 85 ? 'text-yellow-500' :
    (player.overall ?? 0) >= 75 ? 'text-green-500' :
    (player.overall ?? 0) >= 65 ? 'text-blue-500' : ''

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

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            {player.shirt_number != null && (
              <span className="text-3xl font-bold text-muted-foreground">#{player.shirt_number}</span>
            )}
            <h1 className="text-3xl font-bold tracking-tight">{player.player_name}</h1>
            {player.is_loan && <Badge variant="outline">Cedido</Badge>}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {player.position && <Badge variant="secondary">{player.position}</Badge>}
            {seasonName && <Badge variant="outline">{seasonName}</Badge>}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/careers/${career.id}/squad/${player.id}/edit`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Overall / Potencial */}
      {(player.overall != null || player.potential != null || player.age != null) && (
        <div className="mb-6 grid grid-cols-3 gap-4 rounded-xl border bg-card p-4">
          {player.age != null && (
            <div className="text-center">
              <p className="text-2xl font-bold">{player.age}</p>
              <p className="text-xs text-muted-foreground">Edad</p>
            </div>
          )}
          {player.overall != null && (
            <div className="text-center">
              <p className={`text-2xl font-bold ${overallColor}`}>{player.overall}</p>
              <p className="text-xs text-muted-foreground">Overall</p>
            </div>
          )}
          {player.potential != null && (
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{player.potential}</p>
              <p className="text-xs text-muted-foreground">Potencial</p>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Estadísticas</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4">
          {[
            { label: 'Partidos', value: player.appearances },
            { label: 'Titularidades', value: player.starts },
            { label: 'Minutos', value: player.minutes },
            { label: 'Goles', value: player.goals },
            { label: 'Asistencias', value: player.assists },
            { label: 'T. Amarillas', value: player.yellow_cards },
            { label: 'T. Rojas', value: player.red_cards },
            { label: 'Media', value: player.avg_rating != null ? Number(player.avg_rating).toFixed(1) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 text-center">
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="mt-6 rounded-xl border border-destructive/50 bg-destructive/10 p-4">
          <p className="mb-3 text-sm">¿Eliminar a <strong>{player.player_name}</strong> de la plantilla?</p>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando…' : 'Sí, eliminar'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
