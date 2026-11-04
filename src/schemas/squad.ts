import { z } from 'zod'

const optionalInt = (min: number, max: number, msg: string) =>
  z
    .string()
    .optional()
    .refine(
      (v) => !v || (/^\d+$/.test(v) && parseInt(v, 10) >= min && parseInt(v, 10) <= max),
      msg,
    )

const statField = z
  .string()
  .optional()
  .refine((v) => !v || (/^\d+$/.test(v) && parseInt(v, 10) >= 0), 'Debe ser 0 o más')

export const squadPlayerSchema = z.object({
  season_id: z.string().uuid('Selecciona una temporada'),
  player_name: z.string().min(1, 'El nombre es requerido').max(100),
  position: z.string().max(30).optional(),
  shirt_number: optionalInt(1, 99, 'Número entre 1 y 99'),
  age: optionalInt(14, 60, 'Edad entre 14 y 60'),
  overall: optionalInt(1, 99, 'Overall entre 1 y 99'),
  potential: optionalInt(1, 99, 'Potencial entre 1 y 99'),
  is_loan: z.boolean(),
  appearances: statField,
  starts: statField,
  minutes: statField,
  goals: statField,
  assists: statField,
  yellow_cards: statField,
  red_cards: statField,
  avg_rating: z
    .string()
    .optional()
    .refine(
      (v) => !v || (/^\d+(\.\d)?$/.test(v) && parseFloat(v) >= 0 && parseFloat(v) <= 10),
      'Media entre 0 y 10',
    ),
})

export type SquadPlayerFormValues = z.infer<typeof squadPlayerSchema>
