import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import type { SeasonRow } from '@/types/database'

const schema = z.object({
  season_id: z.string().uuid('Selecciona una temporada'),
  award_name: z.string().min(1, 'El nombre del premio es requerido').max(150),
  notes: z.string().max(1000).optional(),
})

type FormValues = z.infer<typeof schema>

export function NewPlayerAwardPage() {
  const { career } = useCareer()
  const navigate = useNavigate()
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    supabase
      .from('seasons')
      .select('*')
      .eq('career_id', career.id)
      .order('start_year', { ascending: true })
      .then(({ data }) => {
        const list = data ?? []
        setSeasons(list)
        if (list.length === 1) setValue('season_id', list[0].id)
      })
  }, [career.id])

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const { error } = await supabase.from('player_awards').insert({
      career_id: career.id,
      season_id: values.season_id,
      player_name: career.name,
      award_name: values.award_name,
      notes: values.notes || null,
    })
    if (error) {
      setServerError('No se pudo guardar el premio. Inténtalo de nuevo.')
      return
    }
    navigate(`/careers/${career.id}/player-awards`, { replace: true })
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

      <h1 className="mb-1 text-2xl font-bold tracking-tight">Nuevo premio individual</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Carrera: <span className="font-medium text-foreground">{career.name}</span>
      </p>

      {seasons.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">No hay temporadas</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea una temporada primero antes de registrar premios.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="season_id">
              Temporada <span className="text-destructive">*</span>
            </Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="award_name">
              Nombre del premio <span className="text-destructive">*</span>
            </Label>
            <Input
              id="award_name"
              placeholder="Ej. Balón de Oro, MVP de la temporada..."
              {...register('award_name')}
            />
            {errors.award_name && (
              <p className="text-sm text-destructive">{errors.award_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">
              Notas <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Detalles del premio..."
              rows={3}
              {...register('notes')}
            />
            {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Registrar premio
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
