import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCareer } from '@/hooks/useCareer'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/services/supabase/client'
import { seasonSchema, type SeasonFormValues } from '@/schemas/season'

function buildLabel(startYear: string): string {
  const year = parseInt(startYear, 10)
  if (isNaN(year)) return ''
  return `${year}/${String(year + 1).slice(-2)}`
}

export function NewSeasonPage() {
  const { career } = useCareer()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SeasonFormValues>({
    resolver: zodResolver(seasonSchema),
    defaultValues: { status: 'in_progress', label: '', start_year: '' },
  })

  const startYear = watch('start_year')
  const label = watch('label')

  // Auto-fill label when start_year changes and label is still the auto-generated value or empty
  function handleStartYearBlur() {
    const autoLabel = buildLabel(startYear)
    if (!label || label === buildLabel(watch('start_year'))) {
      setValue('label', autoLabel, { shouldValidate: false })
    }
  }

  async function onSubmit(values: SeasonFormValues) {
    if (!user) return
    setServerError(null)
    const { error } = await supabase.from('seasons').insert({
      career_id: career.id,
      start_year: parseInt(values.start_year, 10),
      label: values.label,
      club_name: values.club_name || null,
      status: values.status,
      notes: values.notes || null,
      formation: values.formation || null,
    })
    if (error) {
      setServerError('No se pudo crear la temporada. Inténtalo de nuevo.')
      return
    }
    navigate(`/careers/${career.id}/seasons`, { replace: true })
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

      <h1 className="mb-6 text-2xl font-bold tracking-tight">Nueva temporada</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Carrera: <span className="font-medium text-foreground">{career.name}</span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Start year */}
        <div className="space-y-1.5">
          <Label htmlFor="start_year">Año de inicio *</Label>
          <Input
            id="start_year"
            placeholder="2024"
            aria-invalid={!!errors.start_year}
            {...register('start_year', {
              onBlur: handleStartYearBlur,
            })}
          />
          {errors.start_year && (
            <p className="text-sm text-destructive">{errors.start_year.message}</p>
          )}
        </div>

        {/* Label */}
        <div className="space-y-1.5">
          <Label htmlFor="label">Nombre de la temporada *</Label>
          <Input
            id="label"
            placeholder="2024/25"
            aria-invalid={!!errors.label}
            {...register('label')}
          />
          {errors.label ? (
            <p className="text-sm text-destructive">{errors.label.message}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Se auto-completa al introducir el año. Puedes modificarlo.
            </p>
          )}
        </div>

        {/* Club name */}
        <div className="space-y-1.5">
          <Label htmlFor="club_name">Club (opcional)</Label>
          <Input
            id="club_name"
            placeholder="Nombre del club esta temporada"
            aria-invalid={!!errors.club_name}
            {...register('club_name')}
          />
          {errors.club_name && (
            <p className="text-sm text-destructive">{errors.club_name.message}</p>
          )}
        </div>

        {/* Formation */}
        <div className="space-y-1.5">
          <Label htmlFor="formation">Formación (opcional)</Label>
          <Input
            id="formation"
            placeholder="Ej. 4-3-3, 4-2-3-1..."
            {...register('formation')}
          />
          {errors.formation && (
            <p className="text-sm text-destructive">{errors.formation.message}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Estado</Label>
          <div className="flex gap-2">
            {(
              [
                { value: 'in_progress', label: 'En curso' },
                { value: 'completed', label: 'Completada' },
              ] as const
            ).map(({ value, label: optLabel }) => {
              const checked = watch('status') === value
              return (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                    checked
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input bg-transparent text-foreground hover:bg-accent'
                  }`}
                >
                  <input
                    type="radio"
                    value={value}
                    className="sr-only"
                    {...register('status')}
                  />
                  {optLabel}
                </label>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Textarea
            id="notes"
            placeholder="Objetivos, contexto u observaciones de esta temporada..."
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
            {isSubmitting ? 'Guardando...' : 'Crear temporada'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
