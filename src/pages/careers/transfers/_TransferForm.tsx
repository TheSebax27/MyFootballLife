import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { transferSchema, TRANSFER_TYPES, TRANSFER_TYPE_LABEL, type TransferFormValues } from '@/schemas/transfer'
import type { SeasonRow } from '@/types/database'

type Props = {
  defaultValues?: Partial<TransferFormValues>
  seasons: SeasonRow[]
  onSubmit: (values: TransferFormValues) => Promise<void>
  serverError: string | null
  submitLabel: string
  onCancel: () => void
}

export function TransferForm({ defaultValues, seasons, onSubmit, serverError, submitLabel, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      type: 'purchase',
      currency: 'EUR',
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (!defaultValues?.season_id && seasons.length === 1) {
      setValue('season_id', seasons[0].id)
    }
  }, [seasons])

  const selectedType = watch('type')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Season */}
      <div className="space-y-1.5">
        <Label htmlFor="season_id">Temporada *</Label>
        <select
          id="season_id"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          {...register('season_id')}
        >
          <option value="">Selecciona una temporada</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label} {s.club_name ? `— ${s.club_name}` : ''}
            </option>
          ))}
        </select>
        {errors.season_id && <p className="text-sm text-destructive">{errors.season_id.message}</p>}
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label>Tipo de movimiento *</Label>
        <div className="flex flex-wrap gap-2">
          {TRANSFER_TYPES.map((type) => {
            const checked = selectedType === type
            return (
              <label
                key={type}
                className={`flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm transition-colors ${
                  checked
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input bg-transparent text-foreground hover:bg-accent'
                }`}
              >
                <input type="radio" value={type} className="sr-only" {...register('type')} />
                {TRANSFER_TYPE_LABEL[type]}
              </label>
            )
          })}
        </div>
        {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
      </div>

      {/* Player name */}
      <div className="space-y-1.5">
        <Label htmlFor="player_name">Nombre del jugador *</Label>
        <Input
          id="player_name"
          placeholder="Nombre completo"
          aria-invalid={!!errors.player_name}
          {...register('player_name')}
        />
        {errors.player_name && <p className="text-sm text-destructive">{errors.player_name.message}</p>}
      </div>

      {/* Clubs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="from_club_name">Club de origen (opcional)</Label>
          <Input
            id="from_club_name"
            placeholder="Club vendedor / cedente"
            aria-invalid={!!errors.from_club_name}
            {...register('from_club_name')}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to_club_name">Club de destino (opcional)</Label>
          <Input
            id="to_club_name"
            placeholder="Club comprador / receptor"
            aria-invalid={!!errors.to_club_name}
            {...register('to_club_name')}
          />
        </div>
      </div>

      {/* Fee + Currency */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="fee">Traspaso (opcional)</Label>
          <Input
            id="fee"
            inputMode="decimal"
            placeholder="0"
            aria-invalid={!!errors.fee}
            {...register('fee')}
          />
          {errors.fee && <p className="text-sm text-destructive">{errors.fee.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Moneda</Label>
          <select
            id="currency"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register('currency')}
          >
            {['EUR', 'USD', 'GBP', 'BRL', 'ARS', 'MXN'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Wage + Contract */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="wage_weekly">Salario semanal (opcional)</Label>
          <Input
            id="wage_weekly"
            inputMode="decimal"
            placeholder="0"
            aria-invalid={!!errors.wage_weekly}
            {...register('wage_weekly')}
          />
          {errors.wage_weekly && <p className="text-sm text-destructive">{errors.wage_weekly.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contract_until">Contrato hasta (año)</Label>
          <Input
            id="contract_until"
            inputMode="numeric"
            placeholder="2027"
            aria-invalid={!!errors.contract_until}
            {...register('contract_until')}
          />
          {errors.contract_until && <p className="text-sm text-destructive">{errors.contract_until.message}</p>}
        </div>
      </div>

      {/* Transfer date */}
      <div className="space-y-1.5">
        <Label htmlFor="transfer_date">Fecha (opcional)</Label>
        <Input id="transfer_date" type="date" {...register('transfer_date')} />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Detalles del fichaje..."
          rows={3}
          aria-invalid={!!errors.notes}
          {...register('notes')}
        />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
