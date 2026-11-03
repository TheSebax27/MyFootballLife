import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCareer } from '@/hooks/useCareer'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/services/supabase/client'
import type { SeasonRow } from '@/types/database'

const STATUS_LABEL: Record<string, string> = {
  in_progress: 'En curso',
  completed: 'Completada',
}

const STATUS_VARIANT: Record<string, 'success' | 'secondary'> = {
  in_progress: 'success',
  completed: 'secondary',
}

export function SeasonDetailPage() {
  const { career } = useCareer()
  const { user } = useAuth()
  const { seasonId } = useParams<{ seasonId: string }>()
  const navigate = useNavigate()
  const [season, setSeason] = useState<SeasonRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!seasonId) return
    supabase
      .from('seasons')
      .select('*')
      .eq('id', seasonId)
      .eq('career_id', career.id)
      .single()
      .then(({ data }) => {
        setSeason(data)
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
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{season.label}</h2>
          {season.club_name && (
            <p className="text-muted-foreground">{season.club_name}</p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
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
          { label: 'Partidos', value: '—' },
          { label: 'Victorias', value: '—' },
          { label: 'Goles a favor', value: '—' },
          { label: 'Goles en contra', value: '—' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Notes */}
      {season.notes && (
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Notas
          </p>
          <p className="whitespace-pre-wrap text-sm">{season.notes}</p>
        </div>
      )}

      {/* Upcoming sections placeholder */}
      <div className="mt-8 border-t pt-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Próximamente en esta temporada
        </p>
        <div className="flex flex-wrap gap-2">
          {['Partidos', 'Fichajes', 'Títulos'].map((section) => (
            <span
              key={section}
              className="rounded-md border border-dashed px-4 py-2 text-sm text-muted-foreground"
              title="Próximamente"
            >
              {section}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
