import { z } from 'zod'

export const careerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(80, 'Máximo 80 caracteres'),
  game_id: z.string().uuid('Selecciona un juego'),
  mode: z.enum(['manager', 'player']),
  manager_name: z.string().max(80, 'Máximo 80 caracteres').optional(),
  start_year: z
    .string()
    .min(1, 'El año de inicio es requerido')
    .refine((v) => /^\d{4}$/.test(v), 'Debe ser un año de 4 dígitos')
    .refine(
      (v) => parseInt(v, 10) >= 1990 && parseInt(v, 10) <= 2100,
      'Año entre 1990 y 2100',
    ),
  position: z.enum(['portero', 'defensa', 'mediocampista', 'delantero']).optional(),
  national_team: z.string().max(80).optional(),
  nationality: z.string().max(80).optional(),
  league_name: z.string().max(100).optional(),
  club_name: z.string().max(80).optional(),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  visibility: z.enum(['private', 'public']),
})

export type CareerFormValues = z.infer<typeof careerSchema>
