import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import type { SeasonRow } from '@/types/database'

const intField = z
  .string()
  .optional()
  .transform((v) => (v ? parseInt(v, 10) : 0))
  .pipe(z.number().int().min(0).max(9999))

const schema = z.object({
  season_id: z.string().uuid('Selecciona una temporada'),
  competition_name: z.string().min(1, 'Nombre de competición requerido').max(100),
  matches_played: intField,
  goals: intField,
  assists: intField,
  yellow_cards: intField,
  red_cards: intField,
  clean_sheets: z.string().optional().transform((v) => (v ? parseInt(v, 10) : null)).pipe(z.number().int().min(0).max(9999).nullable()),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export function PlayerSeasonStatsEntryPage() {
  const { career } = useCareer()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [serverError, setServerError] = useState<string | null>(null)

  const isGoalkeeper = career.position === 'portero'
  const isDefender = career.position === 'defensa'
  const showCleanSheets = isGoalkeeper || isDefender

  const preSeasonId = searchParams.get('season') ?? ''

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      season_id: preSeasonId,
      competition_name: '',
      matches_played: '0',
      goals: '0',
      assists: '0',
      yellow_cards: '0',
      red_cards: '0',
      clean_sheets: '',
    },
  })

  useEffect(() => {
    supabase
      .from('seasons')
      .select('*')
      .eq('career_id', career.id)
      .order('start_year', { ascending: false })
      .then(({ data }) => {
        const list = data ?? []
        setSeasons(list)
        if (!preSeasonId && list.length === 1) setValue('season_id', list[0].id)
      })
  }, [career.id])

  async function onSubmit(values: FormOutput) {
    setServerError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('player_season_stats').upsert(
      {
        career_id: career.id,
        season_id: values.season_id,
        owner_id: user.id,
        competition_name: values.competition_name,
        matches_played: values.matches_played,
        goals: values.goals,
        assists: values.assists,
        yellow_cards: values.yellow_cards,
        red_cards: values.red_cards,
        clean_sheets: showCleanSheets ? (values.clean_sheets ?? null) : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'career_id,season_id,competition_name' },
    )

    if (error) {
      setServerError('No se pudo guardar. Inténtalo de nuevo.')
      return
    }
    navigate(`/careers/${career.id}/statistics`, { replace: true })
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

      <h1 className="mb-1 text-2xl font-bold tracking-tight">Estadísticas por competición</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Registra manualmente tus estadísticas de una temporada y competición.
        Si ya existe esa combinación, se actualizará.
      </p>

      {seasons.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">No hay temporadas</p>
          <p className="mt-1 text-sm text-muted-foreground">Crea una temporada primero.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Temporada */}
          <div className="space-y-1.5">
            <Label htmlFor="season_id">Temporada <span className="text-destructive">*</span></Label>
            <select
              id="season_id"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              style={{ colorScheme: 'dark' }}
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

          {/* Competición */}
          <div className="space-y-1.5">
            <Label htmlFor="competition_name">
              Competición <span className="text-destructive">*</span>
            </Label>
            <Input
              id="competition_name"
              placeholder="Ej. Liga 2, Copa del Rey, Champions..."
              {...register('competition_name')}
            />
            {errors.competition_name && <p className="text-sm text-destructive">{errors.competition_name.message}</p>}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="matches_played">Partidos</Label>
              <Input id="matches_played" inputMode="numeric" placeholder="0" {...register('matches_played')} />
              {errors.matches_played && <p className="text-sm text-destructive">{errors.matches_played.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goals">Goles</Label>
              <Input id="goals" inputMode="numeric" placeholder="0" {...register('goals')} />
              {errors.goals && <p className="text-sm text-destructive">{errors.goals.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assists">Asistencias</Label>
              <Input id="assists" inputMode="numeric" placeholder="0" {...register('assists')} />
              {errors.assists && <p className="text-sm text-destructive">{errors.assists.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="yellow_cards">T. Amarillas</Label>
              <Input id="yellow_cards" inputMode="numeric" placeholder="0" {...register('yellow_cards')} />
              {errors.yellow_cards && <p className="text-sm text-destructive">{errors.yellow_cards.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="red_cards">T. Rojas</Label>
              <Input id="red_cards" inputMode="numeric" placeholder="0" {...register('red_cards')} />
              {errors.red_cards && <p className="text-sm text-destructive">{errors.red_cards.message}</p>}
            </div>
            {showCleanSheets && (
              <div className="space-y-1.5">
                <Label htmlFor="clean_sheets">Vallas invictas</Label>
                <Input id="clean_sheets" inputMode="numeric" placeholder="0" {...register('clean_sheets')} />
                {errors.clean_sheets && <p className="text-sm text-destructive">{errors.clean_sheets.message}</p>}
              </div>
            )}
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Guardar estadísticas
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
