import { z } from 'zod'

export const titleSchema = z.object({
  season_id: z.string().uuid('Selecciona una temporada'),
  competition_name: z.string().min(1, 'El nombre de la competición es requerido').max(100),
  club_name: z.string().max(80).optional(),
  notes: z.string().max(1000).optional(),
})

export type TitleFormValues = z.infer<typeof titleSchema>
