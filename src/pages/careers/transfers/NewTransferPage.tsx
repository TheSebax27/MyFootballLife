import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { TransferForm } from './_TransferForm'
import { PlayerTransferForm } from './_PlayerTransferForm'
import { useCareer } from '@/hooks/useCareer'
import { useCurrentClub } from '@/hooks/useCurrentClub'
import { supabase } from '@/services/supabase/client'
import type { TransferFormValues, PlayerTransferFormValues } from '@/schemas/transfer'
import type { SeasonRow } from '@/types/database'

export function NewTransferPage() {
  const { career } = useCareer()
  const navigate = useNavigate()
  const currentClub = useCurrentClub(career.id, career.club_name)
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

  async function onManagerSubmit(values: TransferFormValues) {
    setServerError(null)
    const { data, error } = await supabase
      .from('transfers')
      .insert({
        career_id: career.id,
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
      .select('id')
      .single()

    if (error || !data) {
      setServerError('No se pudo guardar el fichaje. Inténtalo de nuevo.')
      return
    }
    navigate(`/careers/${career.id}/transfers/${data.id}`, { replace: true })
  }

  async function onPlayerSubmit(values: PlayerTransferFormValues) {
    setServerError(null)
    const { data, error } = await supabase
      .from('transfers')
      .insert({
        career_id: career.id,
        season_id: values.season_id,
        type: values.type,
        player_name: career.name,
        to_club_name: values.to_club_name || null,
        fee: values.fee ? parseFloat(values.fee) : null,
        currency: values.currency,
        wage_weekly: values.wage ? parseFloat(values.wage) : null,
        wage_frequency: values.wage_frequency || null,
        transfer_date: values.transfer_date || null,
        notes: values.notes || null,
      })
      .select('id')
      .single()

    if (error || !data) {
      setServerError('No se pudo guardar el movimiento. Inténtalo de nuevo.')
      return
    }
    navigate(`/careers/${career.id}/transfers/${data.id}`, { replace: true })
  }

  const isPlayer = career.mode === 'player'
  const title = isPlayer ? 'Nuevo movimiento' : 'Nuevo fichaje'
  const noSeasonsMsg = isPlayer
    ? 'Crea una temporada primero antes de registrar movimientos.'
    : 'Crea una temporada primero antes de registrar fichajes.'

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

      <h1 className="mb-1 text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Carrera: <span className="font-medium text-foreground">{career.name}</span>
      </p>

      {seasons.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">No hay temporadas</p>
          <p className="mt-1 text-sm text-muted-foreground">{noSeasonsMsg}</p>
        </div>
      ) : isPlayer ? (
        <PlayerTransferForm
          seasons={seasons}
          onSubmit={onPlayerSubmit}
          serverError={serverError}
          submitLabel="Registrar movimiento"
          onCancel={() => navigate(-1)}
        />
      ) : (
        <TransferForm
          seasons={seasons}
          defaultValues={{ to_club_name: currentClub }}
          onSubmit={onManagerSubmit}
          serverError={serverError}
          submitLabel="Crear fichaje"
          onCancel={() => navigate(-1)}
        />
      )}
    </div>
  )
}
