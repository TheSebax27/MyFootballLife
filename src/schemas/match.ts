import { z } from 'zod'

const goalsField = z
  .string()
  .min(1, 'Requerido')
  .refine((v) => /^\d+$/.test(v), 'Solo números')
  .refine((v) => parseInt(v, 10) >= 0, 'Debe ser 0 o más')

const penaltiesField = z
  .string()
  .optional()
  .refine((v) => !v || (/^\d+$/.test(v) && parseInt(v, 10) >= 0), 'Solo números positivos')

export const matchSchema = z.object({
  season_id: z.string().uuid('Selecciona una temporada'),
  opponent_name: z.string().min(1, 'El rival es requerido').max(80, 'Máximo 80 caracteres'),
  is_home: z.boolean(),
  goals_for: goalsField,
  goals_against: goalsField,
  match_date: z.string().optional(),
  competition_name: z.string().max(80, 'Máximo 80 caracteres').optional(),
  round: z.string().max(50, 'Máximo 50 caracteres').optional(),
  club_name: z.string().max(80, 'Máximo 80 caracteres').optional(),
  penalties_for: penaltiesField,
  penalties_against: penaltiesField,
  notes: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
})

export type MatchFormValues = z.infer<typeof matchSchema>
