import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Trophy } from 'lucide-react'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TitleRow {
  id: string
  season_id: string
  competition_name: string
  club_name: string | null
  notes: string | null
}

export function TitleDetailPage() {
  const { career } = useCareer()
  const { titleId } = useParams<{ titleId: string }>()
  const navigate = useNavigate()
  const [title, setTitle] = useState<TitleRow | null>(null)
  const [seasonName, setSeasonName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!titleId) return
    supabase
      .from('career_titles')
      .select('*')
      .eq('id', titleId)
      .eq('career_id', career.id)
      .single()
      .then(async ({ data }) => {
        if (!data) { navigate(`/careers/${career.id}/titles`, { replace: true }); return }
        setTitle(data as TitleRow)
        const { data: season } = await supabase
          .from('seasons')
          .select('name')
          .eq('id', data.season_id)
          .single()
        setSeasonName(season?.name ?? null)
        setLoading(false)
      })
  }, [titleId, career.id])

  async function handleDelete() {
    if (!titleId) return
    setDeleting(true)
    await supabase.from('career_titles').delete().eq('id', titleId).eq('career_id', career.id)
    navigate(`/careers/${career.id}/titles`, { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!title) return null

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
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-yellow-500/15">
            <Trophy className="size-7 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title.competition_name}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {title.club_name && <Badge variant="secondary">{title.club_name}</Badge>}
              {seasonName && <Badge variant="outline">{seasonName}</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/careers/${career.id}/titles/${title.id}/edit`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Notas */}
      {title.notes && (
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Notas</p>
          <p className="text-sm whitespace-pre-wrap">{title.notes}</p>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="mt-6 rounded-xl border border-destructive/50 bg-destructive/10 p-4">
          <p className="mb-3 text-sm">¿Eliminar el título <strong>{title.competition_name}</strong>?</p>
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
