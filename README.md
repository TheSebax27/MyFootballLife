# MyLifeFootball

Registra y revive tus carreras de **EA Sports FC** y **eFootball**: temporadas, partidos, plantillas, fichajes, títulos y estadísticas.

**Stack:** React + TypeScript · Vite · Tailwind CSS v4 · shadcn/ui · Supabase (Postgres, Auth, RLS, Storage) · Recharts · React Hook Form + Zod · Vercel.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

## Base de datos

Las migraciones están en `supabase/migrations/` (orden cronológico):

| Migración | Contenido |
|---|---|
| `…0100_core_schema` | Enums, tablas, índices, claves foráneas compuestas, triggers `updated_at` |
| `…0200_profiles_trigger…` | Perfil automático al registrarse + datos de `games` |
| `…0300_rls_policies` | Row Level Security en todas las tablas |
| `…0400_storage` | Buckets `avatars`, `career-covers`, `club-logos` y sus políticas |

`supabase/seed.sql` carga un catálogo de ejemplo (solo desarrollo).

### Opción A: Supabase en la nube
1. Crea el proyecto en https://supabase.com.
2. `npx supabase login` y `npx supabase link --project-ref <ref>`.
3. `npm run db:push` para aplicar las migraciones.
4. `npm run db:types` para generar los tipos reales en `src/types/database.ts`.

### Opción B: Supabase local (requiere Docker)
`npm run db:start` y luego `npm run db:reset` (aplica migraciones + seed).

## Seguridad

- La clave `service_role` **nunca** va en React ni en variables `VITE_*` ni en Vercel; solo como secret de Edge Functions.
- Todo está protegido por RLS: cada usuario solo accede a lo suyo; las carreras `public` son de solo lectura para los demás.
- Las tablas históricas guardan *snapshots* (nombres, overall, edad…) para que editar un jugador o club no cambie el pasado.

## Estructura

```
src/
  components/{ui,layout,dashboard,shared}
  pages/{auth,dashboard,careers,seasons,matches,players,transfers,statistics,community}
  hooks/ contexts/ services/supabase/ types/ schemas/ utils/
supabase/{migrations,functions,seed.sql}
```
