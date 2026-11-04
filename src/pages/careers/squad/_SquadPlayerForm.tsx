import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { squadPlayerSchema, type SquadPlayerFormValues } from '@/schemas/squad'
import type { SeasonRow } from '@/types/database'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  defaultValues?: Partial<SquadPlayerFormValues>
  seasons: SeasonRow[]
  onSubmit: (values: SquadPlayerFormValues) => Promise<void>
  serverError: string | null
  submitLabel: string
  onCancel: () => void
}

const POSITIONS = [
  'Portero',
  'Lateral derecho', 'Lateral izquierdo', 'Central', 'Carrilero',
  'Mediocentro defensivo', 'Mediocentro', 'Mediocentro ofensivo',
  'Extremo derecho', 'Extremo izquierdo', 'Mediapunta',
  'Delantero centro', 'Segundo delantero',
]

export function SquadPlayerForm({ defaultValues, seasons, onSubmit, serverError, submitLabel, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SquadPlayerFormValues>({
    resolver: zodResolver(squadPlayerSchema),
    defaultValues: {
      is_loan: false,
      season_id: seasons.length === 1 ? seasons[0].id : '',
      ...defaultValues,
    },
  })

  const seasonId = watch('season_id')
  const isLoan = watch('is_loan')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Temporada */}
      <div className="space-y-1.5">
        <Label htmlFor="season_id">Temporada *</Label>
        <Select value={seasonId} onValueChange={(v) => setValue('season_id', v, { shouldValidate: true })}>
          <SelectTrigger id="season_id">
            <SelectValue placeholder="Selecciona temporada" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.season_id && <p className="text-xs text-destructive">{errors.season_id.message}</p>}
      </div>

      {/* Nombre + Posición */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="player_name">Nombre del jugador *</Label>
          <Input id="player_name" placeholder="Ej. Vinícius Jr." {...register('player_name')} />
          {errors.player_name && <p className="text-xs text-destructive">{errors.player_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="position">Posición</Label>
          <Input
            id="position"
            list="positions-list"
            placeholder="Ej. Extremo izquierdo"
            {...register('position')}
          />
          <datalist id="positions-list">
            {POSITIONS.map((p) => <option key={p} value={p} />)}
          </datalist>
          {errors.position && <p className="text-xs text-destructive">{errors.position.message}</p>}
        </div>
      </div>

      {/* Dorsal + Edad */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="shirt_number">Dorsal</Label>
          <Input id="shirt_number" inputMode="numeric" placeholder="1–99" {...register('shirt_number')} />
          {errors.shirt_number && <p className="text-xs text-destructive">{errors.shirt_number.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="age">Edad</Label>
          <Input id="age" inputMode="numeric" placeholder="Ej. 22" {...register('age')} />
          {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
        </div>
        <div className="flex items-end pb-1">
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_loan"
              checked={isLoan}
              onCheckedChange={(v) => setValue('is_loan', Boolean(v))}
            />
            <Label htmlFor="is_loan" className="cursor-pointer">Cedido</Label>
          </div>
        </div>
      </div>

      {/* Overall + Potencial */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="overall">Overall</Label>
          <Input id="overall" inputMode="numeric" placeholder="1–99" {...register('overall')} />
          {errors.overall && <p className="text-xs text-destructive">{errors.overall.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="potential">Potencial</Label>
          <Input id="potential" inputMode="numeric" placeholder="1–99" {...register('potential')} />
          {errors.potential && <p className="text-xs text-destructive">{errors.potential.message}</p>}
        </div>
      </div>

      {/* Stats */}
      <div>
        <p className="mb-3 text-sm font-medium">Estadísticas de temporada</p>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="appearances">Partidos</Label>
            <Input id="appearances" inputMode="numeric" placeholder="0" {...register('appearances')} />
            {errors.appearances && <p className="text-xs text-destructive">{errors.appearances.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="starts">Titularidades</Label>
            <Input id="starts" inputMode="numeric" placeholder="0" {...register('starts')} />
            {errors.starts && <p className="text-xs text-destructive">{errors.starts.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="minutes">Minutos</Label>
            <Input id="minutes" inputMode="numeric" placeholder="0" {...register('minutes')} />
            {errors.minutes && <p className="text-xs text-destructive">{errors.minutes.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="goals">Goles</Label>
            <Input id="goals" inputMode="numeric" placeholder="0" {...register('goals')} />
            {errors.goals && <p className="text-xs text-destructive">{errors.goals.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assists">Asistencias</Label>
            <Input id="assists" inputMode="numeric" placeholder="0" {...register('assists')} />
            {errors.assists && <p className="text-xs text-destructive">{errors.assists.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yellow_cards">Tarjetas A.</Label>
            <Input id="yellow_cards" inputMode="numeric" placeholder="0" {...register('yellow_cards')} />
            {errors.yellow_cards && <p className="text-xs text-destructive">{errors.yellow_cards.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="red_cards">Tarjetas R.</Label>
            <Input id="red_cards" inputMode="numeric" placeholder="0" {...register('red_cards')} />
            {errors.red_cards && <p className="text-xs text-destructive">{errors.red_cards.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avg_rating">Media</Label>
            <Input id="avg_rating" inputMode="decimal" placeholder="0.0–10.0" {...register('avg_rating')} />
            {errors.avg_rating && <p className="text-xs text-destructive">{errors.avg_rating.message}</p>}
          </div>
        </div>
      </div>

      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Guardando…' : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
