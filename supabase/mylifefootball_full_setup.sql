-- =============================================================================
-- MyLifeFootball · Script completo de configuración
-- Ejecutar una sola vez en un proyecto Supabase limpio (SQL Editor).
-- Orden: enums → tablas → triggers → funciones RLS → políticas → storage → seed
-- =============================================================================


-- =============================================================================
-- SECCIÓN 1: ENUMS
-- =============================================================================

create type public.visibility as enum ('private', 'public');
create type public.career_mode as enum ('player', 'manager');
create type public.career_status as enum ('active', 'finished');
create type public.season_status as enum ('in_progress', 'completed');
create type public.competition_type as enum ('league', 'cup', 'continental', 'international', 'other');
create type public.match_event_type as enum (
  'goal', 'assist', 'own_goal', 'penalty_missed',
  'yellow_card', 'red_card', 'injury', 'substitution'
);
create type public.transfer_type as enum (
  'purchase', 'sale', 'loan_in', 'loan_out', 'free_in', 'free_out', 'youth_promotion', 'retirement'
);
create type public.preferred_foot as enum ('left', 'right', 'both');


-- =============================================================================
-- SECCIÓN 2: FUNCIÓN updated_at
-- =============================================================================

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- =============================================================================
-- SECCIÓN 3: TABLAS
-- =============================================================================

-- ---------- profiles ---------------------------------------------------------
create table public.profiles (
  id                   uuid primary key references auth.users (id) on delete cascade,
  username             text not null,
  display_name         text,
  avatar_url           text,
  bio                  text,
  visibility           public.visibility not null default 'private',
  onboarding_completed boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,30}$'),
  constraint profiles_display_name_len check (char_length(display_name) <= 60),
  constraint profiles_bio_len check (char_length(bio) <= 500)
);
create unique index profiles_username_key on public.profiles (lower(username));

-- ---------- games (catálogo de juegos) --------------------------------------
create table public.games (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  publisher  text,
  created_at timestamptz not null default now()
);

-- ---------- clubs ------------------------------------------------------------
create table public.clubs (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references public.profiles (id) on delete cascade,
  name          text not null,
  short_name    text,
  country       text,
  logo_url      text,
  primary_color text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint clubs_color_format check (primary_color is null or primary_color ~ '^#[0-9a-fA-F]{6}$')
);
create unique index clubs_owner_name_key
  on public.clubs (coalesce(owner_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name));
create index clubs_owner_idx on public.clubs (owner_id);

-- ---------- players ----------------------------------------------------------
create table public.players (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references public.profiles (id) on delete cascade,
  full_name      text not null,
  nationality    text,
  birth_date     date,
  preferred_foot public.preferred_foot,
  positions      text[] not null default '{}',
  photo_url      text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index players_owner_idx on public.players (owner_id);
create index players_name_idx on public.players (lower(full_name));

-- ---------- competitions -----------------------------------------------------
create table public.competitions (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid references public.profiles (id) on delete cascade,
  name       text not null,
  type       public.competition_type not null default 'league',
  country    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index competitions_owner_name_key
  on public.competitions (coalesce(owner_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name));
create index competitions_owner_idx on public.competitions (owner_id);

-- ---------- careers ----------------------------------------------------------
create table public.careers (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  game_id      uuid not null references public.games (id),
  name         text not null,
  mode         public.career_mode not null default 'manager',
  club_id      uuid references public.clubs (id) on delete set null,
  manager_name text,
  start_year   smallint,
  description  text,
  cover_url    text,
  status       public.career_status not null default 'active',
  visibility   public.visibility not null default 'private',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint careers_name_len check (char_length(name) between 1 and 80),
  constraint careers_start_year_range check (start_year is null or start_year between 1990 and 2100),
  unique (id, owner_id)
);
create index careers_owner_idx on public.careers (owner_id, created_at desc);
create index careers_public_idx on public.careers (created_at desc) where visibility = 'public';

-- ---------- seasons ----------------------------------------------------------
create table public.seasons (
  id         uuid primary key default gen_random_uuid(),
  career_id  uuid not null references public.careers (id) on delete cascade,
  owner_id   uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  start_year smallint not null,
  label      text not null,
  club_id    uuid references public.clubs (id) on delete set null,
  club_name  text,
  status     public.season_status not null default 'in_progress',
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seasons_year_range check (start_year between 1990 and 2100),
  unique (career_id, start_year),
  unique (id, career_id)
);
create index seasons_owner_idx on public.seasons (owner_id);

-- ---------- career_squads ----------------------------------------------------
create table public.career_squads (
  id           uuid primary key default gen_random_uuid(),
  career_id    uuid not null,
  season_id    uuid not null,
  owner_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  player_id    uuid references public.players (id) on delete set null,
  player_name  text not null,
  club_id      uuid references public.clubs (id) on delete set null,
  position     text,
  shirt_number smallint,
  age          smallint,
  overall      smallint,
  potential    smallint,
  is_loan      boolean not null default false,
  appearances  integer not null default 0,
  starts       integer not null default 0,
  minutes      integer not null default 0,
  goals        integer not null default 0,
  assists      integer not null default 0,
  yellow_cards integer not null default 0,
  red_cards    integer not null default 0,
  avg_rating   numeric(3,1),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint squads_season_fk foreign key (season_id, career_id)
    references public.seasons (id, career_id) on delete cascade,
  constraint squads_overall_range check (overall is null or overall between 1 and 99),
  constraint squads_potential_range check (potential is null or potential between 1 and 99),
  constraint squads_rating_range check (avg_rating is null or avg_rating between 0 and 10),
  constraint squads_stats_nonneg check (
    appearances >= 0 and starts >= 0 and minutes >= 0 and goals >= 0
    and assists >= 0 and yellow_cards >= 0 and red_cards >= 0
  )
);
create unique index squads_season_player_key
  on public.career_squads (season_id, player_id) where player_id is not null;
create index squads_career_idx on public.career_squads (career_id);
create index squads_season_idx on public.career_squads (season_id);
create index squads_player_idx on public.career_squads (player_id);

-- ---------- matches ----------------------------------------------------------
create table public.matches (
  id                uuid primary key default gen_random_uuid(),
  career_id         uuid not null,
  season_id         uuid not null,
  owner_id          uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  competition_id    uuid references public.competitions (id) on delete set null,
  competition_name  text,
  round             text,
  match_date        date,
  club_id           uuid references public.clubs (id) on delete set null,
  club_name         text,
  opponent_id       uuid references public.clubs (id) on delete set null,
  opponent_name     text not null,
  is_home           boolean not null default true,
  goals_for         smallint not null,
  goals_against     smallint not null,
  penalties_for     smallint,
  penalties_against smallint,
  result            char(1) generated always as (
    case when goals_for > goals_against then 'W'
         when goals_for < goals_against then 'L'
         else 'D' end
  ) stored,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint matches_season_fk foreign key (season_id, career_id)
    references public.seasons (id, career_id) on delete cascade,
  constraint matches_goals_nonneg check (goals_for >= 0 and goals_against >= 0),
  constraint matches_pens_both check ((penalties_for is null) = (penalties_against is null)),
  unique (id, career_id)
);
create index matches_career_idx on public.matches (career_id, match_date desc);
create index matches_season_idx on public.matches (season_id);
create index matches_owner_idx on public.matches (owner_id);

-- ---------- match_events -----------------------------------------------------
create table public.match_events (
  id                  uuid primary key default gen_random_uuid(),
  match_id            uuid not null,
  career_id           uuid not null,
  owner_id            uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  event_type          public.match_event_type not null,
  minute              smallint,
  extra_minute        smallint,
  player_id           uuid references public.players (id) on delete set null,
  player_name         text,
  related_player_id   uuid references public.players (id) on delete set null,
  related_player_name text,
  is_for_us           boolean not null default true,
  notes               text,
  created_at          timestamptz not null default now(),
  constraint events_match_fk foreign key (match_id, career_id)
    references public.matches (id, career_id) on delete cascade,
  constraint events_minute_range check (minute is null or minute between 0 and 150),
  constraint events_extra_range check (extra_minute is null or extra_minute between 0 and 30)
);
create index events_match_idx on public.match_events (match_id);
create index events_career_idx on public.match_events (career_id);
create index events_player_idx on public.match_events (player_id);

-- ---------- transfers --------------------------------------------------------
create table public.transfers (
  id             uuid primary key default gen_random_uuid(),
  career_id      uuid not null,
  season_id      uuid not null,
  owner_id       uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  type           public.transfer_type not null,
  player_id      uuid references public.players (id) on delete set null,
  player_name    text not null,
  from_club_id   uuid references public.clubs (id) on delete set null,
  from_club_name text,
  to_club_id     uuid references public.clubs (id) on delete set null,
  to_club_name   text,
  fee            numeric(14,2),
  currency       char(3) not null default 'EUR',
  wage_weekly    numeric(12,2),
  contract_until smallint,
  transfer_date  date,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint transfers_season_fk foreign key (season_id, career_id)
    references public.seasons (id, career_id) on delete cascade,
  constraint transfers_fee_nonneg check (fee is null or fee >= 0)
);
create index transfers_career_idx on public.transfers (career_id);
create index transfers_season_idx on public.transfers (season_id);
create index transfers_player_idx on public.transfers (player_id);

-- ---------- career_titles ----------------------------------------------------
create table public.career_titles (
  id               uuid primary key default gen_random_uuid(),
  career_id        uuid not null,
  season_id        uuid not null,
  owner_id         uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  competition_id   uuid references public.competitions (id) on delete set null,
  competition_name text not null,
  club_id          uuid references public.clubs (id) on delete set null,
  club_name        text,
  notes            text,
  created_at       timestamptz not null default now(),
  constraint titles_season_fk foreign key (season_id, career_id)
    references public.seasons (id, career_id) on delete cascade
);
create index titles_career_idx on public.career_titles (career_id);
create index titles_season_idx on public.career_titles (season_id);

-- ---------- player_awards ----------------------------------------------------
create table public.player_awards (
  id          uuid primary key default gen_random_uuid(),
  career_id   uuid not null,
  season_id   uuid not null,
  owner_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  player_id   uuid references public.players (id) on delete set null,
  player_name text not null,
  award_name  text not null,
  notes       text,
  created_at  timestamptz not null default now(),
  constraint awards_season_fk foreign key (season_id, career_id)
    references public.seasons (id, career_id) on delete cascade
);
create index awards_career_idx on public.player_awards (career_id);
create index awards_season_idx on public.player_awards (season_id);


-- =============================================================================
-- SECCIÓN 4: TRIGGERS updated_at
-- =============================================================================

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','clubs','players','competitions','careers','seasons',
    'career_squads','matches','transfers'
  ] loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t);
  end loop;
end $$;


-- =============================================================================
-- SECCIÓN 5: TRIGGER auto-creación de perfil al registrarse
-- =============================================================================

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_name text;
  candidate text;
begin
  base_name := left(lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')), 20);
  if char_length(base_name) < 3 then
    base_name := 'user';
  end if;
  candidate := base_name || '_' || substr(replace(new.id::text, '-', ''), 1, 6);

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    candidate,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), base_name)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =============================================================================
-- SECCIÓN 6: ROW LEVEL SECURITY
-- =============================================================================

-- Funciones auxiliares
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

-- Activar RLS
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

-- Políticas: profiles
create policy "profiles: ver propio o público"
  on public.profiles for select to anon, authenticated
  using (id = (select auth.uid()) or visibility = 'public');

create policy "profiles: editar propio"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Políticas: games (solo lectura)
create policy "games: lectura pública"
  on public.games for select to anon, authenticated
  using (true);

-- Políticas: catálogos (clubs / players / competitions)
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

-- Políticas: careers
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

-- Políticas: tablas hijas (seasons, squads, matches, events, transfers, titles, awards)
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


-- =============================================================================
-- SECCIÓN 7: STORAGE
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',       'avatars',       true, 2097152, array['image/png','image/jpeg','image/webp']),
  ('career-covers', 'career-covers', true, 5242880, array['image/png','image/jpeg','image/webp']),
  ('club-logos',    'club-logos',    true, 1048576, array['image/png','image/jpeg','image/webp','image/svg+xml'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "storage: subir a mi carpeta"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('avatars','career-covers','club-logos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "storage: actualizar en mi carpeta"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('avatars','career-covers','club-logos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "storage: borrar de mi carpeta"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('avatars','career-covers','club-logos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );


-- =============================================================================
-- SECCIÓN 8: DATOS DE REFERENCIA
-- =============================================================================

insert into public.games (slug, name, publisher) values
  ('ea-fc',     'EA Sports FC', 'Electronic Arts'),
  ('efootball', 'eFootball',    'Konami')
on conflict (slug) do nothing;
