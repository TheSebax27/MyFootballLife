-- Nuevos campos opcionales para carrera: nacionalidad, liga y club
alter table public.careers
  add column if not exists nationality  text,
  add column if not exists league_name  text,
  add column if not exists club_name    text;
