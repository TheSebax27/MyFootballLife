import { z } from 'zod'

export const seasonSchema = z.object({
  start_year: z
    .string()
    .min(1, 'El año es requerido')
    .refine((v) => /^\d{4}$/.test(v), 'Debe ser un año de 4 dígitos')
    .refine(
      (v) => parseInt(v, 10) >= 1990 && parseInt(v, 10) <= 2100,
      'Año entre 1990 y 2100',
    ),
  label: z.string().min(1, 'El nombre es requerido').max(30, 'Máximo 30 caracteres'),
  club_name: z.string().max(80, 'Máximo 80 caracteres').optional(),
  status: z.enum(['in_progress', 'completed']),
  notes: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
})

export type SeasonFormValues = z.infer<typeof seasonSchema>
