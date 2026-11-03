import { z } from 'zod'

/**
 * Variables públicas (prefijo VITE_). NUNCA pongas aquí la clave service_role:
 * todo lo que empieza por VITE_ termina dentro del bundle del navegador.
 */
const envSchema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(20),
})

const parsed = envSchema.safeParse(import.meta.env)

export const isSupabaseConfigured = parsed.success

export const env = parsed.success
  ? parsed.data
  : {
      // Valores por defecto del Supabase local (`supabase start`), solo para que la app arranque.
      VITE_SUPABASE_URL: 'http://127.0.0.1:54321',
      VITE_SUPABASE_ANON_KEY: 'placeholder-anon-key-not-configured',
    }
