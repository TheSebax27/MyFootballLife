import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, AlertTriangle, Plus, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useCareer } from '@/hooks/useCareer'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/services/supabase/client'
import type { MatchRow, SeasonObjectiveRow, SeasonRow } from '@/types/database'

const STATUS_LABEL: Record<string, string> = {
  in_progress: 'En curso',
  completed: 'Completada',
}

const STATUS_VARIANT: Record<string, 'success' | 'secondary'> = {
  in_progress: 'success',
  completed: 'secondary',
}

interface MatchStats {
  total: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
}

function computeStats(matches: MatchRow[]): MatchStats {
  return matches.reduce(
    (acc, m) => ({
      total: acc.total + 1,
      wins: acc.wins + (m.result === 'W' ? 1 : 0),
      draws: acc.draws + (m.result === 'D' ? 1 : 0),
      losses: acc.losses + (m.result === 'L' ? 1 : 0),
      goalsFor: acc.goalsFor + m.goals_for,
      goalsAgainst: acc.goalsAgainst + m.goals_against,
    }),
    { total: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 },
  )
}

function ObjectivesSection({
  careerId,
  seasonId,
}: {
  careerId: string
  seasonId: string
}) {
  const { user } = useAuth()
  const [objectives, setObjectives] = useState<SeasonObjectiveRow[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newDesc, setNewDesc] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('season_objectives')
      .select('*')
      .eq('season_id', seasonId)
      .eq('career_id', careerId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setObjectives(data ?? [])
        setLoading(false)
      })
  }, [seasonId, careerId])

  async function handleAdd() {
    if (!newDesc.trim() || !user) return
    setSaving(true)
    const { data, error } = await supabase
      .from('season_objectives')
      .insert({
        career_id: careerId,
        season_id: seasonId,
        owner_id: user.id,
        description: newDesc.trim(),
        target_value: newTarget ? parseInt(newTarget, 10) : null,
      })
      .select('*')
      .single()
    setSaving(false)
    if (!error && data) {
      setObjectives((prev) => [...prev, data])
      setNewDesc('')
      setNewTarget('')
      setAdding(false)
    }
  }

  async function handleToggle(obj: SeasonObjectiveRow) {
    const { data } = await supabase
      .from('season_objectives')
      .update({ is_completed: !obj.is_completed })
      .eq('id', obj.id)
      .select('*')
      .single()
    if (data) {
      setObjectives((prev) => prev.map((o) => (o.id === obj.id ? data : o)))
    }
  }

  async function handleDelete(id: string) {
    await supabase.from('season_objectives').delete().eq('id', id)
    setObjectives((prev) => prev.filter((o) => o.id !== id))
  }

  if (loading) return null

  const done = objectives.filter((o) => o.is_completed).length

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Objetivos
          </p>
          {objectives.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {done}/{objectives.length}
            </span>
          )}
        </div>
        {!adding && (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="size-3.5" />
            Añadir
          </Button>
        )}
      </div>

      {adding && (
        <div className="mb-3 flex gap-2 rounded-xl border bg-card p-3">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Descripción del objetivo..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
              className="flex-1"
            />
            <Input
              placeholder="Meta (opcional)"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              inputMode="numeric"
              className="w-full sm:w-28"
            />
          </div>
          <div className="flex shrink-0 gap-1">
            <Button size="icon" variant="outline" onClick={handleAdd} disabled={saving || !newDesc.trim()}>
              <Check className="size-4 text-primary" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setAdding(false)
                setNewDesc('')
                setNewTarget('')
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {objectives.length === 0 && !adding ? (
        <div className="rounded-xl border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">Sin objetivos. Añade uno para esta temporada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {objectives.map((obj) => (
            <div
              key={obj.id}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                obj.is_completed ? 'border-primary/20 bg-primary/5' : 'bg-card'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggle(obj)}
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  obj.is_completed
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary/60'
                }`}
              >
                {obj.is_completed && <Check className="size-3" />}
              </button>
              <span
                className={`flex-1 text-sm ${
                  obj.is_completed ? 'text-muted-foreground line-through' : ''
                }`}
              >
                {obj.description}
              </span>
              {obj.target_value != null && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  Meta: {obj.target_value}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(obj.id)}
                className="shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function SeasonDetailPage() {
  const { career } = useCareer()
  const { user } = useAuth()
  const { seasonId } = useParams<{ seasonId: string }>()
  const navigate = useNavigate()
  const [season, setSeason] = useState<SeasonRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!seasonId) return
    Promise.all([
      supabase
        .from('seasons')
        .select('*')
        .eq('id', seasonId)
        .eq('career_id', career.id)
        .single(),
      supabase
        .from('matches')
        .select('id, goals_for, goals_against, result')
        .eq('season_id', seasonId)
        .eq('career_id', career.id),
    ]).then(([seasonRes, matchesRes]) => {
      setSeason(seasonRes.data)
      if (matchesRes.data) setMatchStats(computeStats(matchesRes.data as MatchRow[]))
      setLoading(false)
    })
  }, [seasonId, career.id])

  async function handleDelete() {
    if (!seasonId || !user) return
    setDeleting(true)
    await supabase.from('seasons').delete().eq('id', seasonId).eq('career_id', career.id)
    navigate(`/careers/${career.id}/seasons`, { replace: true })
  }

  async function toggleStatus() {
    if (!season || !user) return
    const nextStatus = season.status === 'in_progress' ? 'completed' : 'in_progress'
    const { data } = await supabase
      .from('seasons')
      .update({ status: nextStatus })
      .eq('id', season.id)
      .select('*')
      .single()
    if (data) setSeason(data)
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!season) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="font-medium">Temporada no encontrada.</p>
        <Link
          to={`/careers/${career.id}/seasons`}
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          Volver a temporadas
        </Link>
      </div>
    )
  }

  const stats = matchStats ?? { total: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Back link */}
      <Link
        to={`/careers/${career.id}/seasons`}
        className="mb-6 flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Temporadas
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_VARIANT[season.status] ?? 'secondary'}>
              {STATUS_LABEL[season.status] ?? season.status}
            </Badge>
            <span className="text-sm text-muted-foreground">Año {season.start_year}</span>
            {season.formation && (
              <span className="rounded-md border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
                {season.formation}
              </span>
            )}
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{season.label}</h2>
          {season.club_name && (
            <p className="text-muted-foreground">{season.club_name}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={toggleStatus}>
            {season.status === 'in_progress' ? 'Marcar completada' : 'Marcar en curso'}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/careers/${career.id}/seasons/${season.id}/edit`}>
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
            <p className="font-medium text-destructive">¿Eliminar esta temporada?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Se eliminarán también todos los partidos y datos asociados a esta temporada. Esta
              acción no se puede deshacer.
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

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Partidos', value: stats.total },
          { label: 'V / E / D', value: `${stats.wins} / ${stats.draws} / ${stats.losses}` },
          { label: 'Goles a favor', value: stats.goalsFor },
          { label: 'Goles en contra', value: stats.goalsAgainst },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Notes */}
      {season.notes && (
        <div className="mb-8 rounded-xl border bg-card p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Notas
          </p>
          <p className="whitespace-pre-wrap text-sm">{season.notes}</p>
        </div>
      )}

      {/* Objectives */}
      <ObjectivesSection careerId={career.id} seasonId={season.id} />
    </div>
  )
}
