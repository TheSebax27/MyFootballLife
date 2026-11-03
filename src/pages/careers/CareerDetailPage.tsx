import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Archive, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useCareer } from '@/hooks/useCareer'
import { MODE_LABEL, STATUS_VARIANT, STATUS_LABEL } from '@/contexts/CareerContext'
import { supabase } from '@/services/supabase/client'

export function CareerDetailPage() {
  const { career, refreshCareer } = useCareer()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!user) return
    setDeleting(true)
    await supabase.from('careers').delete().eq('id', career.id).eq('owner_id', user.id)
    navigate('/careers', { replace: true })
  }

  async function handleArchive() {
    if (!user) return
    const nextStatus = career.status === 'active' ? 'finished' : 'active'
    await supabase
      .from('careers')
      .update({ status: nextStatus })
      .eq('id', career.id)
      .eq('owner_id', user.id)
    await refreshCareer()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Back link */}
      <Link
        to="/careers"
        className="mb-6 flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Carreras
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {career.game && <Badge variant="secondary">{career.game.name}</Badge>}
            <Badge variant="outline">{MODE_LABEL[career.mode] ?? career.mode}</Badge>
            <Badge variant={STATUS_VARIANT[career.status] ?? 'secondary'}>
              {STATUS_LABEL[career.status] ?? career.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{career.name}</h1>
          {career.manager_name && (
            <p className="text-muted-foreground">{career.manager_name}</p>
          )}
          {career.description && (
            <p className="max-w-xl text-sm text-muted-foreground">{career.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/careers/${career.id}/edit`}>
              <Pencil className="size-4" />
              Editar
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleArchive}
            title={career.status === 'active' ? 'Marcar como finalizada' : 'Marcar como activa'}
          >
            <Archive className="size-4" />
            {career.status === 'active' ? 'Finalizar' : 'Reactivar'}
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
            <p className="font-medium text-destructive">¿Eliminar esta carrera?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Se eliminarán también todas las temporadas, partidos, fichajes y estadísticas
              asociadas. Esta acción no se puede deshacer.
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Temporadas', value: '—' },
          { label: 'Partidos', value: '—' },
          { label: 'Victorias', value: '—' },
          { label: 'Títulos', value: '—' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
