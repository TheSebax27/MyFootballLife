import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { matchSchema, type MatchFormValues } from '@/schemas/match'
import type { SeasonRow } from '@/types/database'

type Props = {
  defaultValues?: Partial<MatchFormValues>
  seasons: SeasonRow[]
  onSubmit: (values: MatchFormValues) => Promise<void>
  serverError: string | null
  submitLabel: string
  onCancel: () => void
}

export function MatchForm({ defaultValues, seasons, onSubmit, serverError, submitLabel, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MatchFormValues>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      is_home: true,
      goals_for: '0',
      goals_against: '0',
      ...defaultValues,
    },
  })

  // Auto-select first season if only one and no default
  useEffect(() => {
    if (!defaultValues?.season_id && seasons.length === 1) {
      setValue('season_id', seasons[0].id)
    }
  }, [seasons])

  const isHome = watch('is_home')

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
        {errors.season_id && (
          <p className="text-sm text-destructive">{errors.season_id.message}</p>
        )}
      </div>

      {/* Opponent */}
      <div className="space-y-1.5">
        <Label htmlFor="opponent_name">Rival *</Label>
        <Input
          id="opponent_name"
          placeholder="Nombre del equipo rival"
          aria-invalid={!!errors.opponent_name}
          {...register('opponent_name')}
        />
        {errors.opponent_name && (
          <p className="text-sm text-destructive">{errors.opponent_name.message}</p>
        )}
      </div>

      {/* Home/Away */}
      <div className="space-y-2">
        <Label>Localía</Label>
        <div className="flex gap-2">
          {([{ value: true, label: 'Local' }, { value: false, label: 'Visitante' }] as const).map(
            ({ value, label }) => (
              <label
                key={String(value)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                  isHome === value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input bg-transparent text-foreground hover:bg-accent'
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  checked={isHome === value}
                  onChange={() => setValue('is_home', value)}
                />
                {label}
              </label>
            ),
          )}
        </div>
      </div>

      {/* Score */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="goals_for">Goles a favor *</Label>
          <Input
            id="goals_for"
            inputMode="numeric"
            placeholder="0"
            aria-invalid={!!errors.goals_for}
            {...register('goals_for')}
          />
          {errors.goals_for && (
            <p className="text-sm text-destructive">{errors.goals_for.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="goals_against">Goles en contra *</Label>
          <Input
            id="goals_against"
            inputMode="numeric"
            placeholder="0"
            aria-invalid={!!errors.goals_against}
            {...register('goals_against')}
          />
          {errors.goals_against && (
            <p className="text-sm text-destructive">{errors.goals_against.message}</p>
          )}
        </div>
      </div>

      {/* Penalties */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="penalties_for">Penales a favor (opcional)</Label>
          <Input
            id="penalties_for"
            inputMode="numeric"
            placeholder="—"
            aria-invalid={!!errors.penalties_for}
            {...register('penalties_for')}
          />
          {errors.penalties_for && (
            <p className="text-sm text-destructive">{errors.penalties_for.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="penalties_against">Penales en contra (opcional)</Label>
          <Input
            id="penalties_against"
            inputMode="numeric"
            placeholder="—"
            aria-invalid={!!errors.penalties_against}
            {...register('penalties_against')}
          />
          {errors.penalties_against && (
            <p className="text-sm text-destructive">{errors.penalties_against.message}</p>
          )}
        </div>
      </div>

      {/* Match date */}
      <div className="space-y-1.5">
        <Label htmlFor="match_date">Fecha (opcional)</Label>
        <Input
          id="match_date"
          type="date"
          aria-invalid={!!errors.match_date}
          {...register('match_date')}
        />
      </div>

      {/* Competition + Round */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="competition_name">Competición (opcional)</Label>
          <Input
            id="competition_name"
            placeholder="Liga, Copa, Champions..."
            aria-invalid={!!errors.competition_name}
            {...register('competition_name')}
          />
          {errors.competition_name && (
            <p className="text-sm text-destructive">{errors.competition_name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="round">Jornada / Ronda (opcional)</Label>
          <Input
            id="round"
            placeholder="Jornada 1, Cuartos..."
            aria-invalid={!!errors.round}
            {...register('round')}
          />
          {errors.round && (
            <p className="text-sm text-destructive">{errors.round.message}</p>
          )}
        </div>
      </div>

      {/* Club name */}
      <div className="space-y-1.5">
        <Label htmlFor="club_name">Tu club ese día (opcional)</Label>
        <Input
          id="club_name"
          placeholder="Nombre del club"
          aria-invalid={!!errors.club_name}
          {...register('club_name')}
        />
        {errors.club_name && (
          <p className="text-sm text-destructive">{errors.club_name.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Resumen del partido, jugadas destacadas..."
          rows={3}
          aria-invalid={!!errors.notes}
          {...register('notes')}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
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
