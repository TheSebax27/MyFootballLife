import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { titleSchema, type TitleFormValues } from '@/schemas/title'
import type { SeasonRow } from '@/types/database'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  defaultValues?: Partial<TitleFormValues>
  seasons: SeasonRow[]
  onSubmit: (values: TitleFormValues) => Promise<void>
  serverError: string | null
  submitLabel: string
  onCancel: () => void
}

export function TitleForm({ defaultValues, seasons, onSubmit, serverError, submitLabel, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TitleFormValues>({
    resolver: zodResolver(titleSchema),
    defaultValues: {
      season_id: seasons.length === 1 ? seasons[0].id : '',
      ...defaultValues,
    },
  })

  const seasonId = watch('season_id')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Temporada */}
      <div className="space-y-1.5">
        <Label htmlFor="season_id">Temporada *</Label>
        <Select value={seasonId} onValueChange={(v: string) => setValue('season_id', v, { shouldValidate: true })}>
          <SelectTrigger id="season_id">
            <SelectValue placeholder="Selecciona temporada" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.season_id && <p className="text-xs text-destructive">{errors.season_id.message}</p>}
      </div>

      {/* Competición */}
      <div className="space-y-1.5">
        <Label htmlFor="competition_name">Competición *</Label>
        <Input id="competition_name" placeholder="Ej. Liga, Champions League, Copa del Rey…" {...register('competition_name')} />
        {errors.competition_name && <p className="text-xs text-destructive">{errors.competition_name.message}</p>}
      </div>

      {/* Club */}
      <div className="space-y-1.5">
        <Label htmlFor="club_name">Club</Label>
        <Input id="club_name" placeholder="Ej. Real Madrid" {...register('club_name')} />
        {errors.club_name && <p className="text-xs text-destructive">{errors.club_name.message}</p>}
      </div>

      {/* Notas */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" placeholder="Detalles del título…" rows={3} {...register('notes')} />
        {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
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
