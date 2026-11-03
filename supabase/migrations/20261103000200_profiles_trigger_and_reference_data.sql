-- =============================================================================
-- Migración 2: creación automática de perfil + datos de referencia
-- =============================================================================

-- Al registrarse un usuario en auth.users se crea su perfil (privado por defecto).
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

  -- sufijo derivado del uuid => único sin bucles ni colisiones
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

-- Datos de referencia (necesarios en producción, no solo en desarrollo)
insert into public.games (slug, name, publisher) values
  ('ea-fc',     'EA Sports FC', 'Electronic Arts'),
  ('efootball', 'eFootball',    'Konami')
on conflict (slug) do nothing;
