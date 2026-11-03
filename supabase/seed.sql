-- Datos de desarrollo: catálogo global (owner_id NULL) de competiciones y clubes.
-- Se ejecuta con `supabase db reset`. Amplíalo a tu gusto.

insert into public.competitions (owner_id, name, type, country) values
  (null, 'LaLiga',            'league',        'España'),
  (null, 'Premier League',    'league',        'Inglaterra'),
  (null, 'Serie A',           'league',        'Italia'),
  (null, 'Bundesliga',        'league',        'Alemania'),
  (null, 'Ligue 1',           'league',        'Francia'),
  (null, 'Liga Colombiana',   'league',        'Colombia'),
  (null, 'Copa del Rey',      'cup',           'España'),
  (null, 'FA Cup',            'cup',           'Inglaterra'),
  (null, 'UEFA Champions League', 'continental', null),
  (null, 'UEFA Europa League',    'continental', null),
  (null, 'Copa Libertadores',     'continental', null)
on conflict do nothing;

insert into public.clubs (owner_id, name, short_name, country, primary_color) values
  (null, 'Real Madrid',       'RMA', 'España',     '#FEBE10'),
  (null, 'FC Barcelona',      'BAR', 'España',     '#A50044'),
  (null, 'Manchester City',   'MCI', 'Inglaterra', '#6CABDD'),
  (null, 'Liverpool',         'LIV', 'Inglaterra', '#C8102E'),
  (null, 'Atlético Nacional', 'ATN', 'Colombia',   '#00A650'),
  (null, 'Millonarios',       'MIL', 'Colombia',   '#003DA5')
on conflict do nothing;
