import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import { seasonSchema, type SeasonFormValues } from '@/schemas/season'
import type { SeasonRow } from '@/types/database'

export function SeasonEditPage() {
  const { career } = useCareer()
  const { seasonId } = useParams<{ seasonId: string }>()
  const navigate = useNavigate()
  const [season, setSeason] = useState<SeasonRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SeasonFormValues>({
    resolver: zodResolver(seasonSchema),
  })

  useEffect(() => {
    if (!seasonId) return
    supabase
      .from('seasons')
      .select('*')
      .eq('id', seasonId)
      .eq('career_id', career.id)
      .single()
      .then(({ data }) => {
        if (!data) {
          navigate(`/careers/${career.id}/seasons`, { replace: true })
          return
        }
        setSeason(data)
        reset({
          start_year: String(data.start_year),
          label: data.label,
          club_name: data.club_name ?? '',
          status: data.status,
          formation: data.formation ?? '',
          notes: data.notes ?? '',
        })
        setLoading(false)
      })
  }, [seasonId, career.id])

  async function onSubmit(values: SeasonFormValues) {
    if (!seasonId) return
    setServerError(null)
    const { error } = await supabase
      .from('seasons')
      .update({
        start_year: parseInt(values.start_year, 10),
        label: values.label,
        club_name: values.club_name || null,
        status: values.status,
        formation: values.formation || null,
        notes: values.notes || null,
      })
      .eq('id', seasonId)
      .eq('career_id', career.id)
    if (error) {
      setServerError('No se pudo guardar la temporada. Inténtalo de nuevo.')
      return
    }
    navigate(`/careers/${career.id}/seasons/${seasonId}`, { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!season) return null

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

      <h1 className="mb-1 text-2xl font-bold tracking-tight">Editar temporada</h1>
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
            {...register('start_year')}
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
          {errors.label && (
            <p className="text-sm text-destructive">{errors.label.message}</p>
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
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
