import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  playerTransferSchema,
  PLAYER_TRANSFER_TYPES,
  PLAYER_TRANSFER_TYPE_LABEL,
  WAGE_FREQUENCY_LABEL,
  type PlayerTransferFormValues,
} from '@/schemas/transfer'
import { cn } from '@/utils/cn'
import type { SeasonRow } from '@/types/database'

type Props = {
  defaultValues?: Partial<PlayerTransferFormValues>
  seasons: SeasonRow[]
  onSubmit: (values: PlayerTransferFormValues) => Promise<void>
  serverError: string | null
  submitLabel: string
  onCancel: () => void
}

export function PlayerTransferForm({ defaultValues, seasons, onSubmit, serverError, submitLabel, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PlayerTransferFormValues>({
    resolver: zodResolver(playerTransferSchema),
    defaultValues: {
      type: 'player_transfer',
      currency: 'EUR',
      wage_frequency: 'monthly',
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (!defaultValues?.season_id && seasons.length === 1) {
      setValue('season_id', seasons[0].id)
    }
  }, [seasons])

  const type = watch('type')
  const wageFrequency = watch('wage_frequency')
  const showFeeFields = type === 'player_transfer'
  const showClub = type !== 'player_retirement'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Temporada */}
      <div className="space-y-1.5">
        <Label htmlFor="season_id">Temporada <span className="text-destructive">*</span></Label>
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

      {/* Tipo de movimiento */}
      <div className="space-y-2">
        <Label>Tipo de movimiento <span className="text-destructive">*</span></Label>
        <div className="flex flex-wrap gap-2">
          {PLAYER_TRANSFER_TYPES.map((t) => (
            <label
              key={t}
              className={cn(
                'flex cursor-pointer items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                type === t
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input text-muted-foreground hover:bg-accent',
              )}
            >
              <input type="radio" value={t} className="sr-only" {...register('type')} />
              {PLAYER_TRANSFER_TYPE_LABEL[t]}
            </label>
          ))}
        </div>
        {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
      </div>

      {/* Equipo destino */}
      {showClub && (
        <div className="space-y-1.5">
          <Label htmlFor="to_club_name">
            {type === 'player_loan' ? 'Club cedente / destino' : 'Equipo al que vas'}{' '}
            <span className="text-xs text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="to_club_name"
            placeholder="Ej. Real Madrid, Manchester City..."
            {...register('to_club_name')}
          />
        </div>
      )}

      {/* Traspaso: monto + sueldo */}
      {showFeeFields && (
        <>
          {/* Monto del traspaso */}
          <div className="space-y-1.5">
            <Label>Monto del traspaso</Label>
            <div className="flex gap-2">
              <Input
                inputMode="decimal"
                placeholder="0"
                className="flex-1"
                aria-invalid={!!errors.fee}
                {...register('fee')}
              />
              <select
                className="w-24 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('currency')}
              >
                {['EUR', 'USD', 'GBP', 'BRL', 'ARS', 'MXN'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {errors.fee && <p className="text-sm text-destructive">{errors.fee.message}</p>}
          </div>

          {/* Sueldo + frecuencia */}
          <div className="space-y-2">
            <Label>Sueldo</Label>
            <div className="flex gap-2">
              <Input
                inputMode="decimal"
                placeholder="0"
                className="flex-1"
                aria-invalid={!!errors.wage}
                {...register('wage')}
              />
              <div className="flex gap-1">
                {(['weekly', 'monthly', 'annual'] as const).map((freq) => (
                  <label
                    key={freq}
                    className={cn(
                      'flex cursor-pointer items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap',
                      wageFrequency === freq
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-input text-muted-foreground hover:bg-accent',
                    )}
                  >
                    <input type="radio" value={freq} className="sr-only" {...register('wage_frequency')} />
                    {WAGE_FREQUENCY_LABEL[freq]}
                  </label>
                ))}
              </div>
            </div>
            {errors.wage && <p className="text-sm text-destructive">{errors.wage.message}</p>}
          </div>
        </>
      )}

      {/* Fecha */}
      <div className="space-y-1.5">
        <Label htmlFor="transfer_date">Fecha <span className="text-xs text-muted-foreground">(opcional)</span></Label>
        <Input id="transfer_date" type="date" {...register('transfer_date')} />
      </div>

      {/* Notas */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas <span className="text-xs text-muted-foreground">(opcional)</span></Label>
        <Textarea
          id="notes"
          placeholder="Detalles del movimiento..."
          rows={3}
          {...register('notes')}
        />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
