-- Estadísticas manuales por temporada y competición (modo jugador)
CREATE TABLE IF NOT EXISTS public.player_season_stats (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id     uuid        NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
  season_id     uuid        NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  owner_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  competition_name text     NOT NULL DEFAULT 'General',
  matches_played  int       NOT NULL DEFAULT 0,
  goals           int       NOT NULL DEFAULT 0,
  assists         int       NOT NULL DEFAULT 0,
  yellow_cards    int       NOT NULL DEFAULT 0,
  red_cards       int       NOT NULL DEFAULT 0,
  clean_sheets    int       NULL,  -- solo portero/defensa
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (career_id, season_id, competition_name)
);

ALTER TABLE public.player_season_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON public.player_season_stats
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
