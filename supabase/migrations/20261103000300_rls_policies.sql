-- =============================================================================
-- Migración 3: Row Level Security
-- =============================================================================
-- Modelo:
--   * Cada usuario ve y edita SOLO lo suyo.
--   * Las carreras con visibility = 'public' (y todo su contenido) son legibles
--     por cualquiera, incluso sin sesión (comunidad). Nunca editables.
--   * Los catálogos globales (owner_id IS NULL) son de solo lectura.
-- =============================================================================

-- ---------- Funciones auxiliares (SECURITY DEFINER para evitar recursión RLS) -
create function public.owns_career(p_career_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.careers c
    where c.id = p_career_id and c.owner_id = (select auth.uid())
  );
$$;

create function public.is_career_public(p_career_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.careers c
    where c.id = p_career_id and c.visibility = 'public'
  );
$$;

-- Permite ver clubes/jugadores personalizados de quien tiene alguna carrera pública,
-- para que una carrera pública se vea completa (nombres, escudos...).
create function public.owner_has_public_career(p_owner_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select p_owner_id is not null and exists (
    select 1 from public.careers c
    where c.owner_id = p_owner_id and c.visibility = 'public'
  );
$$;

revoke all on function public.owns_career(uuid) from public;
revoke all on function public.is_career_public(uuid) from public;
revoke all on function public.owner_has_public_career(uuid) from public;
grant execute on function public.owns_career(uuid) to anon, authenticated;
grant execute on function public.is_career_public(uuid) to anon, authenticated;
grant execute on function public.owner_has_public_career(uuid) to anon, authenticated;

-- ---------- Activar RLS en TODAS las tablas ---------------------------------
alter table public.profiles       enable row level security;
alter table public.games          enable row level security;
alter table public.clubs          enable row level security;
alter table public.players        enable row level security;
alter table public.competitions   enable row level security;
alter table public.careers        enable row level security;
alter table public.seasons        enable row level security;
alter table public.career_squads  enable row level security;
alter table public.matches        enable row level security;
alter table public.match_events   enable row level security;
alter table public.transfers      enable row level security;
alter table public.career_titles  enable row level security;
alter table public.player_awards  enable row level security;

-- ---------- profiles ---------------------------------------------------------
create policy "profiles: ver propio o público"
  on public.profiles for select to anon, authenticated
  using (id = (select auth.uid()) or visibility = 'public');

create policy "profiles: editar propio"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
-- INSERT lo hace el trigger handle_new_user; DELETE llega por cascade desde auth.users.

-- ---------- games (solo lectura) --------------------------------------------
create policy "games: lectura pública"
  on public.games for select to anon, authenticated
  using (true);

-- ---------- Catálogos: clubs / players / competitions -----------------------
-- (se repite el patrón; el catálogo global es de solo lectura)
create policy "clubs: leer"
  on public.clubs for select to anon, authenticated
  using (owner_id is null or owner_id = (select auth.uid()) or public.owner_has_public_career(owner_id));
create policy "clubs: crear propios"
  on public.clubs for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "clubs: editar propios"
  on public.clubs for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "clubs: borrar propios"
  on public.clubs for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "players: leer"
  on public.players for select to anon, authenticated
  using (owner_id is null or owner_id = (select auth.uid()) or public.owner_has_public_career(owner_id));
create policy "players: crear propios"
  on public.players for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "players: editar propios"
  on public.players for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "players: borrar propios"
  on public.players for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "competitions: leer"
  on public.competitions for select to anon, authenticated
  using (owner_id is null or owner_id = (select auth.uid()) or public.owner_has_public_career(owner_id));
create policy "competitions: crear propias"
  on public.competitions for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "competitions: editar propias"
  on public.competitions for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "competitions: borrar propias"
  on public.competitions for delete to authenticated
  using (owner_id = (select auth.uid()));

-- ---------- careers ----------------------------------------------------------
create policy "careers: ver propias o públicas"
  on public.careers for select to anon, authenticated
  using (owner_id = (select auth.uid()) or visibility = 'public');
create policy "careers: crear propias"
  on public.careers for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "careers: editar propias"
  on public.careers for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "careers: borrar propias"
  on public.careers for delete to authenticated
  using (owner_id = (select auth.uid()));

-- ---------- Tablas hijas de una carrera -------------------------------------
-- Mismo patrón para seasons, career_squads, matches, match_events,
-- transfers, career_titles y player_awards.
do $$
declare t text;
begin
  foreach t in array array[
    'seasons','career_squads','matches','match_events',
    'transfers','career_titles','player_awards'
  ] loop
    execute format($f$
      create policy "%1$s: ver propios o de carrera pública"
        on public.%1$I for select to anon, authenticated
        using (owner_id = (select auth.uid()) or public.is_career_public(career_id));

      create policy "%1$s: crear en carrera propia"
        on public.%1$I for insert to authenticated
        with check (owner_id = (select auth.uid()) and public.owns_career(career_id));

      create policy "%1$s: editar propios"
        on public.%1$I for update to authenticated
        using (owner_id = (select auth.uid()))
        with check (owner_id = (select auth.uid()) and public.owns_career(career_id));

      create policy "%1$s: borrar propios"
        on public.%1$I for delete to authenticated
        using (owner_id = (select auth.uid()));
    $f$, t);
  end loop;
end $$;
