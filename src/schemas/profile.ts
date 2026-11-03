import { z } from 'zod'

const usernameField = z
  .string()
  .min(3, 'Mínimo 3 caracteres')
  .max(30, 'Máximo 30 caracteres')
  .regex(/^[a-z0-9_]+$/, 'Solo letras minúsculas, números y guion bajo (_)')
  .transform((v) => v.toLowerCase())

export const profileSetupSchema = z.object({
  username: usernameField,
  display_name: z.string().max(60, 'Máximo 60 caracteres').optional(),
})

export const profileEditSchema = z.object({
  username: usernameField,
  display_name: z.string().max(60, 'Máximo 60 caracteres').optional(),
  bio: z.string().max(500, 'Máximo 500 caracteres').optional(),
  visibility: z.enum(['private', 'public']),
})

export type ProfileSetupValues = z.infer<typeof profileSetupSchema>
export type ProfileEditValues = z.infer<typeof profileEditSchema>
