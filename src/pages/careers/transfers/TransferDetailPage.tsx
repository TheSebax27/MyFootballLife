import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import { TRANSFER_TYPE_LABEL } from '@/schemas/transfer'
import type { TransferRow, SeasonRow } from '@/types/database'

const TYPE_VARIANT: Record<string, 'success' | 'destructive' | 'secondary' | 'warning'> = {
  purchase: 'success',
  free_in: 'success',
  loan_in: 'success',
  youth_promotion: 'success',
  sale: 'destructive',
  free_out: 'destructive',
  loan_out: 'warning',
  retirement: 'secondary',
}

export function TransferDetailPage() {
  const { career } = useCareer()
  const { transferId } = useParams<{ transferId: string }>()
  const navigate = useNavigate()
  const [transfer, setTransfer] = useState<TransferRow | null>(null)
  const [season, setSeason] = useState<SeasonRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!transferId) return
    supabase
      .from('transfers')
      .select('*')
      .eq('id', transferId)
      .eq('career_id', career.id)
      .single()
      .then(async ({ data }) => {
        if (!data) { setLoading(false); return }
        setTransfer(data)
        const { data: s } = await supabase.from('seasons').select('*').eq('id', data.season_id).single()
        setSeason(s)
        setLoading(false)
      })
  }, [transferId, career.id])

  async function handleDelete() {
    if (!transferId) return
    setDeleting(true)
    await supabase.from('transfers').delete().eq('id', transferId).eq('career_id', career.id)
    navigate(`/careers/${career.id}/transfers`, { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!transfer) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="font-medium">Fichaje no encontrado.</p>
        <Link to={`/careers/${career.id}/transfers`} className="mt-4 inline-block text-sm text-primary hover:underline">
          Volver a fichajes
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        to={`/careers/${career.id}/transfers`}
        className="mb-6 flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Fichajes
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={TYPE_VARIANT[transfer.type] ?? 'secondary'}>
              {TRANSFER_TYPE_LABEL[transfer.type] ?? transfer.type}
            </Badge>
            {season && <Badge variant="outline">{season.label}</Badge>}
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{transfer.player_name}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {transfer.from_club_name && <span>De: <span className="text-foreground font-medium">{transfer.from_club_name}</span></span>}
            {transfer.to_club_name && <span>A: <span className="text-foreground font-medium">{transfer.to_club_name}</span></span>}
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/careers/${career.id}/transfers/${transfer.id}/edit`}>
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
            <p className="font-medium text-destructive">¿Eliminar este fichaje?</p>
            <p className="mt-1 text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Details grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: 'Traspaso',
            value: transfer.fee != null
              ? `${Number(transfer.fee).toLocaleString('es-ES')} ${transfer.currency}`
              : '—',
          },
          {
            label: 'Salario semanal',
            value: transfer.wage_weekly != null
              ? `${Number(transfer.wage_weekly).toLocaleString('es-ES')} ${transfer.currency}`
              : '—',
          },
          { label: 'Contrato hasta', value: transfer.contract_until ? String(transfer.contract_until) : '—' },
          {
            label: 'Fecha',
            value: transfer.transfer_date
              ? new Date(transfer.transfer_date + 'T00:00:00').toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })
              : '—',
          },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {/* Notes */}
      {transfer.notes && (
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Notas</p>
          <p className="whitespace-pre-wrap text-sm">{transfer.notes}</p>
        </div>
      )}
    </div>
  )
}
