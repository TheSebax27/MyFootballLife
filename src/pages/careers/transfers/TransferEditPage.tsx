import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { TransferForm } from './_TransferForm'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import type { TransferFormValues } from '@/schemas/transfer'
import type { TransferRow, SeasonRow } from '@/types/database'

export function TransferEditPage() {
  const { career } = useCareer()
  const { transferId } = useParams<{ transferId: string }>()
  const navigate = useNavigate()
  const [transfer, setTransfer] = useState<TransferRow | null>(null)
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (!transferId) return
    Promise.all([
      supabase.from('transfers').select('*').eq('id', transferId).eq('career_id', career.id).single(),
      supabase.from('seasons').select('*').eq('career_id', career.id).order('start_year', { ascending: true }),
    ]).then(([{ data: t }, { data: s }]) => {
      if (!t) { navigate(`/careers/${career.id}/transfers`, { replace: true }); return }
      setTransfer(t)
      setSeasons(s ?? [])
      setLoading(false)
    })
  }, [transferId, career.id])

  async function onSubmit(values: TransferFormValues) {
    if (!transferId) return
    setServerError(null)
    const { error } = await supabase
      .from('transfers')
      .update({
        season_id: values.season_id,
        type: values.type,
        player_name: values.player_name,
        from_club_name: values.from_club_name || null,
        to_club_name: values.to_club_name || null,
        fee: values.fee ? parseFloat(values.fee) : null,
        currency: values.currency,
        wage_weekly: values.wage_weekly ? parseFloat(values.wage_weekly) : null,
        contract_until: values.contract_until ? parseInt(values.contract_until, 10) : null,
        transfer_date: values.transfer_date || null,
        notes: values.notes || null,
      })
      .eq('id', transferId)
      .eq('career_id', career.id)

    if (error) {
      setServerError('No se pudo guardar el fichaje. Inténtalo de nuevo.')
      return
    }
    navigate(`/careers/${career.id}/transfers/${transferId}`, { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!transfer) return null

  const defaultValues: Partial<TransferFormValues> = {
    season_id: transfer.season_id,
    type: transfer.type,
    player_name: transfer.player_name,
    from_club_name: transfer.from_club_name ?? '',
    to_club_name: transfer.to_club_name ?? '',
    fee: transfer.fee != null ? String(transfer.fee) : '',
    currency: transfer.currency,
    wage_weekly: transfer.wage_weekly != null ? String(transfer.wage_weekly) : '',
    contract_until: transfer.contract_until != null ? String(transfer.contract_until) : '',
    transfer_date: transfer.transfer_date ?? '',
    notes: transfer.notes ?? '',
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

      <h1 className="mb-1 text-2xl font-bold tracking-tight">Editar fichaje</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Carrera: <span className="font-medium text-foreground">{career.name}</span>
      </p>

      <TransferForm
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
