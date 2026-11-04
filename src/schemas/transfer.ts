import { z } from 'zod'

export const TRANSFER_TYPES = [
  'purchase',
  'sale',
  'loan_in',
  'loan_out',
  'free_in',
  'free_out',
  'youth_promotion',
  'retirement',
] as const

export const TRANSFER_TYPE_LABEL: Record<string, string> = {
  purchase: 'Compra',
  sale: 'Venta',
  loan_in: 'Préstamo (entrada)',
  loan_out: 'Préstamo (salida)',
  free_in: 'Libre (entrada)',
  free_out: 'Libre (salida)',
  youth_promotion: 'Ascenso cantera',
  retirement: 'Retirada',
}

const feeField = z
  .string()
  .optional()
  .refine(
    (v) => !v || (/^\d+(\.\d{1,2})?$/.test(v) && parseFloat(v) >= 0),
    'Debe ser un número positivo',
  )

const yearField = z
  .string()
  .optional()
  .refine(
    (v) => !v || (/^\d{4}$/.test(v) && parseInt(v, 10) >= 1990 && parseInt(v, 10) <= 2100),
    'Año entre 1990 y 2100',
  )

export const transferSchema = z.object({
  season_id: z.string().uuid('Selecciona una temporada'),
  type: z.enum(TRANSFER_TYPES),
  player_name: z.string().min(1, 'El nombre del jugador es requerido').max(100),
  from_club_name: z.string().max(80).optional(),
  to_club_name: z.string().max(80).optional(),
  fee: feeField,
  currency: z.string().length(3),
  wage_weekly: feeField,
  contract_until: yearField,
  transfer_date: z.string().optional(),
  notes: z.string().max(1000).optional(),
})

export type TransferFormValues = z.infer<typeof transferSchema>
