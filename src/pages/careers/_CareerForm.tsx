import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useGames } from '@/hooks/useGames'
import { careerSchema, type CareerFormValues } from '@/schemas/career'
import { cn } from '@/utils/cn'
import { COUNTRIES } from '@/constants/countries'
import { LEAGUES } from '@/constants/leagues'
import { CLUBS } from '@/constants/clubs'

type CareerFormProps = {
  defaultValues?: Partial<CareerFormValues>
  lockedMode?: boolean
  onSubmit: (values: CareerFormValues) => Promise<void>
  serverError: string | null
  submitLabel: string
  onCancel?: () => void
}

export function CareerForm({ defaultValues, lockedMode, onSubmit, serverError, submitLabel, onCancel }: CareerFormProps) {
  const games = useGames()
  const [selectedLeagueName, setSelectedLeagueName] = useState<string>('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CareerFormValues>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      mode: 'manager',
      visibility: 'private',
      ...defaultValues,
    },
  })

  const mode = watch('mode')
  const visibility = watch('visibility')
  const gameId = watch('game_id')

  // set first game as default once loaded
  useEffect(() => {
    if (games.length > 0 && !defaultValues?.game_id) {
      setValue('game_id', games[0].id)
    }
  }, [games, defaultValues?.game_id, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Nombre */}
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Nombre de la carrera <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Ej. Mi carrera con el Real Madrid"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      {/* Videojuego */}
      <div className="space-y-1.5">
        <Label>
          Videojuego <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-2">
          {games.map((g) => (
            <label
              key={g.id}
              className={cn(
                'flex flex-1 cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                gameId === g.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input text-muted-foreground hover:bg-accent',
              )}
            >
              <input type="radio" value={g.id} className="sr-only" {...register('game_id')} />
              {g.name}
            </label>
          ))}
        </div>
        {errors.game_id && <p className="text-xs text-destructive">{errors.game_id.message}</p>}
      </div>

      {/* Modalidad — oculta cuando viene del selector de cards */}
      {!lockedMode && <div className="space-y-1.5">
        <Label>
          Modalidad <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-2">
          {([
            { value: 'manager', label: 'Director Técnico' },
            { value: 'player', label: 'Jugador' },
          ] as const).map(({ value, label }) => (
            <label
              key={value}
              className={cn(
                'flex flex-1 cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                mode === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input text-muted-foreground hover:bg-accent',
              )}
            >
              <input type="radio" value={value} className="sr-only" {...register('mode')} />
              {label}
            </label>
          ))}
        </div>
      </div>}

      {/* Nombre del DT — solo en modo manager */}
      {mode === 'manager' && (
        <div className="space-y-1.5">
          <Label htmlFor="manager_name">
            Nombre del entrenador <span className="text-xs text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="manager_name"
            placeholder="Ej. José Mourinho"
            aria-invalid={!!errors.manager_name}
            {...register('manager_name')}
          />
          {errors.manager_name && (
            <p className="text-xs text-destructive">{errors.manager_name.message}</p>
          )}
        </div>
      )}

      {/* Nacionalidad */}
      <div className="space-y-1.5">
        <Label htmlFor="nationality">
          Nacionalidad {mode === 'manager' ? 'del entrenador' : 'del jugador'}{' '}
          <span className="text-xs text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id="nationality"
          list="nationality-list"
          placeholder="Ej. Argentina"
          autoComplete="off"
          {...register('nationality')}
        />
        <datalist id="nationality-list">
          {COUNTRIES.map((c) => (
            <option key={c.code} value={`${c.flag} ${c.name}`} />
          ))}
        </datalist>
        {errors.nationality && <p className="text-xs text-destructive">{errors.nationality.message}</p>}
      </div>

      {/* Liga */}
      <div className="space-y-1.5">
        <Label htmlFor="league_name">
          Liga <span className="text-xs text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id="league_name"
          list="league-list"
          placeholder="Ej. La Liga EA Sports"
          autoComplete="off"
          {...register('league_name', {
            onChange: (e) => {
              setSelectedLeagueName(e.target.value)
            },
          })}
        />
        <datalist id="league-list">
          {LEAGUES.map((l) => (
            <option key={`${l.countryCode}-${l.name}`} value={l.name}>
              {l.country}
            </option>
          ))}
        </datalist>
        {errors.league_name && <p className="text-xs text-destructive">{errors.league_name.message}</p>}
      </div>

      {/* Club */}
      <div className="space-y-1.5">
        <Label htmlFor="club_name">
          {mode === 'manager' ? 'Club que diriges' : 'Club donde juegas'}{' '}
          <span className="text-xs text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id="club_name"
          list="club-list"
          placeholder="Ej. Real Madrid"
          autoComplete="off"
          {...register('club_name')}
        />
        <datalist id="club-list">
          {CLUBS
            .filter((c) => !selectedLeagueName || c.leagueName === selectedLeagueName)
            .map((c) => (
              <option key={`${c.leagueName}-${c.name}`} value={c.name} />
            ))}
        </datalist>
        {errors.club_name && <p className="text-xs text-destructive">{errors.club_name.message}</p>}
      </div>

      {/* Año de inicio */}
      <div className="space-y-1.5">
        <Label htmlFor="start_year">
          Año de inicio <span className="text-destructive">*</span>
        </Label>
        <Input
          id="start_year"
          type="number"
          placeholder="Ej. 2024"
          min={1990}
          max={2100}
          aria-invalid={!!errors.start_year}
          {...register('start_year')}
        />
        {errors.start_year && (
          <p className="text-xs text-destructive">{errors.start_year.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <Label htmlFor="description">
          Descripción <span className="text-xs text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Cuéntanos sobre esta carrera..."
          aria-invalid={!!errors.description}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Visibilidad */}
      <div className="space-y-1.5">
        <Label>Visibilidad</Label>
        <div className="flex gap-2">
          {([
            { value: 'private', label: 'Privada' },
            { value: 'public', label: 'Pública' },
          ] as const).map(({ value, label }) => (
            <label
              key={value}
              className={cn(
                'flex flex-1 cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                visibility === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input text-muted-foreground hover:bg-accent',
              )}
            >
              <input type="radio" value={value} className="sr-only" {...register('visibility')} />
              {label}
            </label>
          ))}
        </div>
      </div>

      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
