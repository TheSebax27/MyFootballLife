-- Season objectives (player & manager)
CREATE TABLE IF NOT EXISTS public.season_objectives (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id  uuid        NOT NULL REFERENCES public.careers(id)  ON DELETE CASCADE,
  season_id  uuid        NOT NULL REFERENCES public.seasons(id)  ON DELETE CASCADE,
  owner_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description text       NOT NULL,
  target_value int       NULL,
  is_completed boolean   NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.season_objectives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON public.season_objectives
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Formation per season
ALTER TABLE public.seasons
  ADD COLUMN IF NOT EXISTS formation text;

-- OVR & potential in manual player stats
ALTER TABLE public.player_season_stats
  ADD COLUMN IF NOT EXISTS overall   int CHECK (overall   BETWEEN 1 AND 99),
  ADD COLUMN IF NOT EXISTS potential int CHECK (potential BETWEEN 1 AND 99);
